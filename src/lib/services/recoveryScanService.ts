/**
 * recoveryScanService.ts
 *
 * Financial Intelligence engine responsible for:
 *   1. Ingesting raw transaction data
 *   2. Running detection rules per category
 *   3. Calculating confidence scores
 *   4. Applying HITL routing rules
 *   5. Generating structured Finding objects
 *
 * Architecture note: This is a frontend mock service.
 * In production, replace with POST /api/recovery/scan → Spring Boot / FastAPI.
 */

import type { AutomationDecision, Finding } from "../mock-data";

// ─── HITL Routing Rules ────────────────────────────────────────────────────────
// These rules are the core of the "human-out-of-the-loop" decision engine.

export function applyHitlRules(
  confidence: number,
  recoverableAmount: number
): AutomationDecision {
  if (confidence < 60) return "NOT_WORTH_PURSUING";
  if (confidence >= 80 && recoverableAmount <= 100) return "AUTO_READY";
  // confidence >= 80 but amount > £100, OR confidence 60–79
  return "NEEDS_HUMAN_REVIEW";
}

// ─── Detection Categories ─────────────────────────────────────────────────────

export const DETECTION_RULES = [
  {
    category: "DUPLICATE_CHARGE",
    description: "Identical amount + merchant + terminal ID within 60 seconds",
    confidenceBoost: 0.15,
  },
  {
    category: "UNUSED_SUBSCRIPTION",
    description: "Recurring charge with zero engagement signals in past 90 days",
    confidenceBoost: 0.05,
  },
  {
    category: "HIDDEN_BANK_FEE",
    description: "Overdraft fee with balance recovery within 24h + clean history",
    confidenceBoost: 0.1,
  },
  {
    category: "CANCELLED_SERVICE_NO_REFUND",
    description: "Refundable fare/booking cancelled — no refund issued within SLA",
    confidenceBoost: 0.2,
  },
  {
    category: "LATE_DELIVERY_REFUND",
    description: "SLA breach on guaranteed delivery — compensation not claimed",
    confidenceBoost: 0.08,
  },
  {
    category: "SUSPICIOUS_RECURRING_CHARGE",
    description: "Recurring merchant descriptor unrecognised — no signup trail found",
    confidenceBoost: 0.0,
  },
] as const;

// ─── Recovery Stats ────────────────────────────────────────────────────────────

export function computeScanSummary(results: Finding[]) {
  const actionable = results.filter((f) => f.automationDecision !== "NOT_WORTH_PURSUING");
  const autoReady = actionable.filter((f) => f.automationDecision === "AUTO_READY");
  const needsReview = actionable.filter((f) => f.automationDecision === "NEEDS_HUMAN_REVIEW");

  return {
    totalScanned: 1284,
    totalFound: results.reduce((s, f) => s + f.amount, 0),
    recoverableNow: actionable.reduce((s, f) => s + f.recoverable, 0),
    issuesDetected: actionable.length,
    autoReadyCount: autoReady.length,
    humanReviewCount: needsReview.length,
    notWorthPursuingCount: results.filter((f) => f.automationDecision === "NOT_WORTH_PURSUING").length,
    autoReadyValue: autoReady.reduce((s, f) => s + f.recoverable, 0),
    humanReviewValue: needsReview.reduce((s, f) => s + f.recoverable, 0),
    avgConfidence: Math.round(
      actionable.reduce((s, f) => s + f.probability, 0) / (actionable.length || 1)
    ),
  };
}
