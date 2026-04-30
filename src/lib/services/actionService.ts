import type { AutomationDecision, RecoveryOpportunity } from "./recoveryScanService";
import { getDemoModeEnabled } from "@/lib/demo-mode";

export type ActionType = "REFUND_EMAIL" | "BANK_DISPUTE" | "SUBSCRIPTION_CANCEL" | "FEE_REVERSAL";
export type ActionStatus = "DRAFTED" | "READY" | "NEEDS_APPROVAL" | "SUBMITTED" | "RECOVERED" | "IGNORED";

export interface RecoveryAction {
  id: string;
  opportunityId: string;
  merchant: string;
  actionType: ActionType;
  status: ActionStatus;
  amount: number;
  decision: AutomationDecision;
  payload: { subject: string; body: string };
  createdAt: string;
  submittedAt?: string;
  recoveredAt?: string;
}

const actionStore = new Map<string, RecoveryAction>();
const STORAGE_KEY = "refundly-actions";

loadFromStorage();

export async function createAction(opportunity: RecoveryOpportunity, message: string): Promise<RecoveryAction> {
  if (!getDemoModeEnabled()) {
    return createPlaceholderAction(opportunity.id, opportunity.merchant);
  }
  const existing = actionStore.get(opportunity.id);
  if (existing) return existing;

  await wait(150);
  const status: ActionStatus =
    opportunity.decision === "AUTO_READY" ? "READY" : opportunity.decision === "NEEDS_APPROVAL" ? "NEEDS_APPROVAL" : "DRAFTED";

  const action: RecoveryAction = {
    id: `act-${opportunity.id}`,
    opportunityId: opportunity.id,
    merchant: opportunity.merchant,
    actionType: actionTypeFor(opportunity.category),
    status,
    amount: opportunity.recoverableAmount,
    decision: opportunity.decision,
    payload: {
      subject: `Refund request: ${opportunity.merchant} (${opportunity.category})`,
      body: message,
    },
    createdAt: new Date().toISOString(),
  };

  actionStore.set(opportunity.id, action);
  persist();
  return action;
}

export async function submitAction(opportunityId: string): Promise<RecoveryAction> {
  if (!getDemoModeEnabled()) return createPlaceholderAction(opportunityId, "No data connected");
  const action = mustGet(opportunityId);
  if (action.status !== "READY" && action.status !== "NEEDS_APPROVAL" && action.status !== "DRAFTED") {
    throw new Error(`Action ${opportunityId} is not submittable from status ${action.status}`);
  }
  await wait(250);
  action.status = "SUBMITTED";
  action.submittedAt = new Date().toISOString();
  actionStore.set(opportunityId, action);
  persist();
  return action;
}

export async function markRecovered(opportunityId: string): Promise<RecoveryAction> {
  if (!getDemoModeEnabled()) return createPlaceholderAction(opportunityId, "No data connected");
  const action = mustGet(opportunityId);
  await wait(180);
  action.status = "RECOVERED";
  action.recoveredAt = new Date().toISOString();
  actionStore.set(opportunityId, action);
  persist();
  return action;
}

export async function approveAction(opportunityId: string): Promise<RecoveryAction> {
  if (!getDemoModeEnabled()) return createPlaceholderAction(opportunityId, "No data connected");
  const action = mustGet(opportunityId);
  await wait(120);
  action.status = "READY";
  actionStore.set(opportunityId, action);
  persist();
  return action;
}

export async function ignoreAction(opportunityId: string): Promise<RecoveryAction> {
  if (!getDemoModeEnabled()) return createPlaceholderAction(opportunityId, "No data connected");
  const action = mustGet(opportunityId);
  await wait(80);
  action.status = "IGNORED";
  actionStore.set(opportunityId, action);
  persist();
  return action;
}

export function getAction(opportunityId: string): RecoveryAction | undefined {
  return actionStore.get(opportunityId);
}

export function listActions(): RecoveryAction[] {
  if (!getDemoModeEnabled()) return [];
  return Array.from(actionStore.values());
}

function actionTypeFor(category: RecoveryOpportunity["category"]): ActionType {
  switch (category) {
    case "DUPLICATE_CHARGE":
    case "SUSPICIOUS_RECURRING":
      return "BANK_DISPUTE";
    case "UNUSED_SUBSCRIPTION":
      return "SUBSCRIPTION_CANCEL";
    case "HIDDEN_BANK_FEE":
      return "FEE_REVERSAL";
    default:
      return "REFUND_EMAIL";
  }
}

function mustGet(id: string): RecoveryAction {
  const action = actionStore.get(id);
  if (!action) throw new Error(`No action for opportunity ${id}`);
  return action;
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function createPlaceholderAction(opportunityId: string, merchant: string): RecoveryAction {
  return {
    id: `act-${opportunityId}`,
    opportunityId,
    merchant,
    actionType: "REFUND_EMAIL",
    status: "DRAFTED",
    amount: 0,
    decision: "NOT_WORTH",
    payload: {
      subject: "No demo action available",
      body: "Connect your account to start scanning.",
    },
    createdAt: new Date().toISOString(),
  };
}

function persist() {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(actionStore.values())));
}

function loadFromStorage() {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as RecoveryAction[];
    for (const a of parsed) actionStore.set(a.opportunityId, a);
  } catch {
    // ignore corrupted local data
  }
}
