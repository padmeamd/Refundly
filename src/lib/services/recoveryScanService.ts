import type { RawTransaction } from "./transactionService";
import { getDemoModeEnabled } from "@/lib/demo-mode";

export type RecoveryCategory =
  | "DUPLICATE_CHARGE"
  | "UNUSED_SUBSCRIPTION"
  | "HIDDEN_BANK_FEE"
  | "CANCELLED_SERVICE_NO_REFUND"
  | "LATE_DELIVERY_REFUND"
  | "SUSPICIOUS_RECURRING";

export type AutomationDecision = "AUTO_READY" | "NEEDS_APPROVAL" | "NOT_WORTH";

export interface RecoveryOpportunity {
  id: string;
  category: RecoveryCategory;
  merchant: string;
  originalAmount: number;
  recoverableAmount: number;
  confidenceScore: number;
  explanation: string;
  evidence: string[];
  transactionIds: string[];
  decision: AutomationDecision;
  decisionReason: string;
  priorityScore: number;
  status: "DETECTED" | "ACTION_CREATED" | "SUBMITTED" | "RECOVERED" | "IGNORED";
}

export interface ScanSummary {
  totalMoneyFound: number;
  recoverableNow: number;
  autoReadyAmount: number;
  needsApprovalAmount: number;
  ignoredAmount: number;
  numberOfOpportunities: number;
}

export function decideAutomation(opportunity: Pick<RecoveryOpportunity, "confidenceScore" | "recoverableAmount">): {
  decision: AutomationDecision;
  reason: string;
} {
  if (opportunity.confidenceScore >= 80 && opportunity.recoverableAmount <= 100) {
    return { decision: "AUTO_READY", reason: "confidence >= 80 and recoverable amount <= 100" };
  }
  if (opportunity.confidenceScore >= 80 && opportunity.recoverableAmount > 100) {
    return { decision: "NEEDS_APPROVAL", reason: "high confidence but high-value claim (>100) requires human sign-off" };
  }
  if (opportunity.confidenceScore >= 60) {
    return { decision: "NEEDS_APPROVAL", reason: "medium confidence band (60-79) requires human review" };
  }
  return { decision: "NOT_WORTH", reason: "confidence below 60, expected recovery value too low" };
}

export function runRecoveryScan(transactions: RawTransaction[]): RecoveryOpportunity[] {
  if (!getDemoModeEnabled()) return [];
  const opportunities: RecoveryOpportunity[] = [];
  const sorted = [...transactions].sort((a, b) => a.date.localeCompare(b.date));
  opportunities.push(...detectDuplicateCharges(sorted));
  opportunities.push(...detectUnusedSubscriptions(sorted));
  opportunities.push(...detectHiddenFees(sorted));
  opportunities.push(...detectCancelledServiceNoRefund(sorted));
  opportunities.push(...detectLateDeliveryRefunds(sorted));
  opportunities.push(...detectSuspiciousRecurring(sorted));

  return opportunities.sort((a, b) => b.priorityScore - a.priorityScore);
}

export function detectDuplicateCharges(transactions: RawTransaction[]): RecoveryOpportunity[] {
  const duplicateKeyed = new Map<string, RawTransaction[]>();
  for (const tx of transactions) {
    const key = `${tx.date}|${tx.merchant.toLowerCase()}|${tx.amount.toFixed(2)}|${tx.terminalId ?? "na"}`;
    duplicateKeyed.set(key, [...(duplicateKeyed.get(key) ?? []), tx]);
  }
  const results: RecoveryOpportunity[] = [];
  for (const group of duplicateKeyed.values()) {
    if (group.length < 2) continue;
    const recoverable = group[0].amount * (group.length - 1);
    results.push(
      createOpportunity("DUPLICATE_CHARGE", group[0].merchant, group.reduce((s, t) => s + t.amount, 0), recoverable, 94, [
        `${group.length} matching transactions on ${group[0].date}`,
        `Same amount ${group[0].currency} ${group[0].amount.toFixed(2)}`,
        `Terminal ID match: ${group[0].terminalId ?? "n/a"}`,
      ], group.map((g) => g.id), "Duplicate payment pattern with deterministic amount + merchant + terminal match."),
    );
  }
  return results;
}

export function detectUnusedSubscriptions(transactions: RawTransaction[]): RecoveryOpportunity[] {
  const recurring = transactions.filter((t) => t.recurring && t.amount > 0 && t.merchant.toLowerCase().includes("fitflex"));
  if (recurring.length < 2) return [];
  const first = recurring[0];
  return [
    createOpportunity("UNUSED_SUBSCRIPTION", first.merchant, first.amount, first.amount, 78, [
      `${recurring.length} monthly recurring charges`,
      "No recent engagement signal (deterministic demo rule)",
      "User can cancel and request unused period refund",
    ], recurring.map((r) => r.id), "Subscription has recurring spend with low usage signal, eligible for cancellation + refund request."),
  ];
}

export function detectHiddenFees(transactions: RawTransaction[]): RecoveryOpportunity[] {
  return transactions
    .filter((tx) => tx.description.toLowerCase().includes("overdraft fee"))
    .map((tx) =>
      createOpportunity("HIDDEN_BANK_FEE", tx.merchant, tx.amount, tx.amount, 81, [
        "Overdraft fee detected",
        "First incident in period (mock deterministic rule)",
        "Goodwill reversal likely for this amount",
      ], [tx.id], "Fee reversal request is usually accepted for first-time overdraft fee patterns."),
    );
}

export function detectCancelledServiceNoRefund(transactions: RawTransaction[]): RecoveryOpportunity[] {
  return transactions
    .filter((tx) => tx.merchant.toLowerCase().includes("trainline") || tx.description.toLowerCase().includes("non-refundable"))
    .map((tx) =>
      tx.merchant.toLowerCase().includes("trainline")
        ? createOpportunity("CANCELLED_SERVICE_NO_REFUND", tx.merchant, tx.amount, tx.amount, 88, [
            "Cancelled service marker in merchant metadata",
            "No refund transaction found after cancellation window",
            "Fare class assumed refundable in demo dataset",
          ], [tx.id], "Service cancellation appears refundable but was not returned automatically.")
        : createOpportunity("CANCELLED_SERVICE_NO_REFUND", tx.merchant, tx.amount, 0, 42, [
            "Non-refundable booking marker",
            "Cancelled close to service date",
            "Low recovery likelihood",
          ], [tx.id], "Cancellation terms indicate no practical refund path."),
    );
}

export function detectLateDeliveryRefunds(transactions: RawTransaction[]): RecoveryOpportunity[] {
  return transactions
    .filter((tx) => tx.merchant.toLowerCase().includes("amazon"))
    .map((tx) =>
      createOpportunity("LATE_DELIVERY_REFUND", tx.merchant, tx.amount, 12, 72, [
        "Guaranteed delivery date missed (mock fulfillment signal)",
        "Compensation band modeled at 5-15 GBP",
        "No claim previously filed",
      ], [tx.id], "Late delivery compensation likely available but amount should be human-approved."),
    );
}

export function detectSuspiciousRecurring(transactions: RawTransaction[]): RecoveryOpportunity[] {
  const recurring = transactions.filter((t) => t.recurring && t.merchant.toLowerCase().includes("streamingplus"));
  if (recurring.length < 2) return [];
  return [
    createOpportunity("SUSPICIOUS_RECURRING", recurring[0].merchant, recurring[0].amount, recurring[0].amount, 67, [
      `${recurring.length} recurring charges detected`,
      "Descriptor appears unrecognized",
      "No signup proof in linked data sources (mocked)",
    ], recurring.map((r) => r.id), "Recurring pattern appears unauthorized; cancellation and dispute should be reviewed."),
  ];
}

export function computeSummary(opportunities: RecoveryOpportunity[]): ScanSummary {
  return {
    totalMoneyFound: round2(opportunities.reduce((sum, o) => sum + o.originalAmount, 0)),
    recoverableNow: round2(opportunities.reduce((sum, o) => sum + o.recoverableAmount, 0)),
    autoReadyAmount: round2(opportunities.filter((o) => o.decision === "AUTO_READY").reduce((sum, o) => sum + o.recoverableAmount, 0)),
    needsApprovalAmount: round2(opportunities.filter((o) => o.decision === "NEEDS_APPROVAL").reduce((sum, o) => sum + o.recoverableAmount, 0)),
    ignoredAmount: round2(opportunities.filter((o) => o.decision === "NOT_WORTH").reduce((sum, o) => sum + o.originalAmount, 0)),
    numberOfOpportunities: opportunities.length,
  };
}

function createOpportunity(
  category: RecoveryCategory,
  merchant: string,
  originalAmount: number,
  recoverableAmount: number,
  confidenceScore: number,
  evidence: string[],
  transactionIds: string[],
  explanation: string,
): RecoveryOpportunity {
  const decisionResult = decideAutomation({ confidenceScore, recoverableAmount });
  const id = `opp-${category.toLowerCase()}-${transactionIds[0]}`;
  return {
    id,
    category,
    merchant,
    originalAmount: round2(originalAmount),
    recoverableAmount: round2(recoverableAmount),
    confidenceScore,
    explanation,
    evidence,
    transactionIds,
    decision: decisionResult.decision,
    decisionReason: decisionResult.reason,
    priorityScore: Math.round(recoverableAmount * (confidenceScore / 100)),
    status: "DETECTED",
  };
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
