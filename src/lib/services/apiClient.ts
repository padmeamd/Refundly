import { approveAction, createAction, ignoreAction, listActions, markRecovered, submitAction, type RecoveryAction } from "./actionService";
import { clearAuditTrail, getAuditTimeline, getAuditTrail, logEvent, type AuditEntry } from "./auditService";
import { explainOpportunity, generateRecoveryMessage } from "./llmService";
import { getMerchantIntelligence } from "./merchantIntelligence";
import { computeSummary, runRecoveryScan, type RecoveryOpportunity, type ScanSummary } from "./recoveryScanService";
import { getTransactions, seedMockTransactions, type RawTransaction, type TransactionPage } from "./transactionService";

// ─── Response envelope ─────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  ok: boolean;
  data: T;
  error?: string;
  timestamp: string;
}

function ok<T>(data: T): ApiResponse<T> {
  return { ok: true, data, timestamp: new Date().toISOString() };
}

function err<T>(message: string): ApiResponse<T> {
  return { ok: false, data: null as T, error: message, timestamp: new Date().toISOString() };
}

const scanSteps = [
  "Load transactions",
  "Run deterministic recovery scan",
  "Calculate confidence scores",
  "Decide automation (auto / approval / ignore)",
  "Generate recovery messages",
  "Create actions",
  "Build audit timeline",
];

let latestTransactions: RawTransaction[] = [];
let latestOpportunities: RecoveryOpportunity[] = [];
let latestSummary: ScanSummary = {
  totalMoneyFound: 0,
  recoverableNow: 0,
  autoReadyAmount: 0,
  needsApprovalAmount: 0,
  ignoredAmount: 0,
  numberOfOpportunities: 0,
};

export async function apiGetTransactions(): Promise<ApiResponse<TransactionPage>> {
  try {
    seedMockTransactions();
    const data = await getTransactions();
    latestTransactions = data.transactions;
    return ok(data);
  } catch (e) {
    return err(`Failed to fetch transactions: ${(e as Error).message}`);
  }
}

export interface ScanResult {
  scanId: string;
  steps: string[];
  opportunitiesCount: number;
  autoReadyCount: number;
  needsApprovalCount: number;
  notWorthCount: number;
  totalMoneyFound: number;
  recoverableNow: number;
  summary: ScanSummary;
  completedAt: string;
}

export async function apiRunScan(): Promise<ApiResponse<ScanResult>> {
  clearAuditTrail();
  if (!latestTransactions.length) {
    const tx = await getTransactions();
    latestTransactions = tx.transactions;
  }
  for (const tx of latestTransactions) {
    logEvent({ eventType: "transaction_scanned", merchant: tx.merchant, detail: `Scanned transaction ${tx.id} (${tx.merchant})` });
  }
  latestOpportunities = runRecoveryScan(latestTransactions);
  for (const opp of latestOpportunities) {
    logEvent({ eventType: "opportunity_detected", opportunityId: opp.id, merchant: opp.merchant, detail: `${opp.category} detected for ${opp.merchant}` });
    logEvent({ eventType: "confidence_calculated", opportunityId: opp.id, merchant: opp.merchant, detail: `Confidence ${opp.confidenceScore}%` });
    logEvent({ eventType: "automation_decided", opportunityId: opp.id, merchant: opp.merchant, detail: `${opp.decision}: ${opp.decisionReason}` });
    const msg = await generateRecoveryMessage(opp);
    await explainOpportunity(opp);
    logEvent({ eventType: "message_generated", opportunityId: opp.id, merchant: opp.merchant, detail: `Recovery message drafted (${msg.length} chars)` });
    if (opp.decision !== "NOT_WORTH") {
      const action = await createAction(opp, msg);
      opp.status = "ACTION_CREATED";
      logEvent({ eventType: "action_created", opportunityId: opp.id, merchant: opp.merchant, detail: `Action ${action.actionType} created with status ${action.status}` });
    }
  }
  latestSummary = computeSummary(latestOpportunities);
  const result: ScanResult = {
    scanId: `scan-${Date.now()}`,
    steps: scanSteps,
    opportunitiesCount: latestOpportunities.length,
    autoReadyCount: latestOpportunities.filter((o) => o.decision === "AUTO_READY").length,
    needsApprovalCount: latestOpportunities.filter((o) => o.decision === "NEEDS_APPROVAL").length,
    notWorthCount: latestOpportunities.filter((o) => o.decision === "NOT_WORTH").length,
    totalMoneyFound: latestSummary.totalMoneyFound,
    recoverableNow: latestSummary.recoverableNow,
    summary: latestSummary,
    completedAt: new Date().toISOString(),
  };
  return ok(result);
}

export async function apiGetOpportunities(): Promise<ApiResponse<RecoveryOpportunity[]>> {
  return ok(latestOpportunities);
}

export async function apiGetOpportunity(id: string): Promise<ApiResponse<RecoveryOpportunity & { merchantIntelligence: ReturnType<typeof getMerchantIntelligence>; timeline: AuditEntry[] }>> {
  const opp = latestOpportunities.find((o) => o.id === id);
  if (!opp) return err(`Opportunity "${id}" not found`);
  const action = listActions().find((a) => a.opportunityId === id);
  return ok({
    ...opp,
    merchantIntelligence: getMerchantIntelligence(opp.merchant),
    timeline: getAuditTimeline(opp.id),
    recoveryMessage: action?.payload.body ?? "",
    actionStatus: action?.status ?? "DRAFTED",
  });
}

export async function apiSubmitOpportunity(id: string): Promise<ApiResponse<RecoveryAction>> {
  try {
    const opportunity = latestOpportunities.find((o) => o.id === id);
    if (!opportunity) return err(`Opportunity "${id}" not found`);
    const submitted = await submitAction(id);
    opportunity.status = "SUBMITTED";
    logEvent({
      eventType: "action_submitted",
      opportunityId: id,
      merchant: opportunity.merchant,
      detail: `Action submitted for £${opportunity.recoverableAmount.toFixed(2)}`,
    });
    return ok(submitted);
  } catch (e) {
    return err((e as Error).message);
  }
}

export async function apiIgnoreOpportunity(id: string): Promise<ApiResponse<{ ignored: true }>> {
  const opportunity = latestOpportunities.find((o) => o.id === id);
  if (!opportunity) return err(`Opportunity "${id}" not found`);
  await ignoreAction(id);
  opportunity.status = "IGNORED";
  logEvent({
    eventType: "human_approved",
    opportunityId: id,
    merchant: opportunity.merchant,
    detail: "Opportunity ignored by user",
  });
  return ok({ ignored: true });
}

export async function apiMarkRecovered(id: string): Promise<ApiResponse<RecoveryAction>> {
  try {
    const opportunity = latestOpportunities.find((o) => o.id === id);
    if (!opportunity) return err(`Opportunity "${id}" not found`);
    const recovered = await markRecovered(id);
    opportunity.status = "RECOVERED";
    logEvent({
      eventType: "recovered",
      opportunityId: id,
      merchant: opportunity.merchant,
      detail: `Recovery marked for £${opportunity.recoverableAmount.toFixed(2)}`,
    });
    return ok(recovered);
  } catch (e) {
    return err((e as Error).message);
  }
}

export async function apiGetAuditLog(): Promise<ApiResponse<AuditEntry[]>> {
  return ok(getAuditTrail());
}

export interface ReportSummary {
  totalMoneyFound: number;
  recoverableNow: number;
  numberOfOpportunities: number;
  autoReadyCount: number;
  needsApprovalCount: number;
  notWorthCount: number;
  autoReadyAmount: number;
  needsApprovalAmount: number;
  ignoredAmount: number;
  generatedAt: string;
}

export async function apiGetReport(): Promise<ApiResponse<ReportSummary>> {
  const report: ReportSummary = {
    totalMoneyFound: latestSummary.totalMoneyFound,
    recoverableNow: latestSummary.recoverableNow,
    numberOfOpportunities: latestSummary.numberOfOpportunities,
    autoReadyCount: latestOpportunities.filter((o) => o.decision === "AUTO_READY").length,
    needsApprovalCount: latestOpportunities.filter((o) => o.decision === "NEEDS_APPROVAL").length,
    notWorthCount: latestOpportunities.filter((o) => o.decision === "NOT_WORTH").length,
    autoReadyAmount: latestSummary.autoReadyAmount,
    needsApprovalAmount: latestSummary.needsApprovalAmount,
    ignoredAmount: latestSummary.ignoredAmount,
    generatedAt: new Date().toISOString(),
  };
  return ok(report);
}

export async function apiGetActions(): Promise<ApiResponse<RecoveryAction[]>> {
  return ok(listActions());
}

export async function apiApproveOpportunity(id: string): Promise<ApiResponse<RecoveryAction>> {
  const opportunity = latestOpportunities.find((o) => o.id === id);
  if (!opportunity) return err(`Opportunity "${id}" not found`);
  const action = await approveAction(id);
  logEvent({
    eventType: "human_approved",
    opportunityId: id,
    merchant: opportunity.merchant,
    detail: "Human approved action for submission",
  });
  return ok(action);
}

export interface DemoState {
  steps: string[];
  highlightedOpportunityId?: string;
  submittedOpportunityId?: string;
  summary: ScanSummary;
  runId: string;
  auditHash: string;
  actionsCreated: number;
  actionsSubmitted: number;
}

export async function runDemo(): Promise<ApiResponse<DemoState>> {
  await apiGetTransactions();
  await apiRunScan();
  const highest = [...latestOpportunities].sort((a, b) => b.recoverableAmount - a.recoverableAmount)[0];
  let submittedOpportunityId: string | undefined;
  const autoReady = latestOpportunities.find((o) => o.decision === "AUTO_READY");
  if (autoReady) {
    await apiSubmitOpportunity(autoReady.id);
    submittedOpportunityId = autoReady.id;
  }
  return ok({
    steps: [
      "Loaded transactions",
      "Ran recovery scan",
      "Computed opportunities and decisions",
      "Opened highest value case",
      "Generated action",
      submittedOpportunityId ? "Submitted one auto-ready action" : "No auto-ready action submitted",
      "Finished demo summary",
    ],
    highlightedOpportunityId: highest?.id,
    submittedOpportunityId,
    summary: latestSummary,
    runId: "RFND-042",
    auditHash: "RFND-2026-04-30-A9F2",
    actionsCreated: listActions().length,
    actionsSubmitted: listActions().filter((a) => a.status === "SUBMITTED").length,
  });
}

function simpleHash(input: string): string {
  let h = 0;
  for (let i = 0; i < input.length; i += 1) h = (Math.imul(31, h) + input.charCodeAt(i)) | 0;
  return `AUD-${Math.abs(h).toString(16).padStart(8, "0")}`;
}
