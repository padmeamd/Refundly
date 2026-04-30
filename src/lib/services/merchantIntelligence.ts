/**
 * merchantIntelligence.ts
 *
 * Merchant refund policy & dispute intelligence layer.
 * Modelled after Specter's merchant data capabilities.
 *
 * SPECTER: Each function tagged with // SPECTER: is a candidate for
 *          replacement with a real Specter API call.
 *          Endpoint pattern: GET /specter/merchant/{name}/intelligence
 */

import type { MerchantIntel } from "../mock-data";
import { findings } from "../mock-data";

// ─── Merchant Database ─────────────────────────────────────────────────────────
// SPECTER: Replace this static map with Specter merchant intelligence API

const merchantDb: Record<string, MerchantIntel> = Object.fromEntries(
  findings.map((f) => [f.merchant.toLowerCase(), f.merchantIntel])
);

// ─── Public API ────────────────────────────────────────────────────────────────

// SPECTER: Replace with real API call
export function getMerchantIntel(merchantName: string): MerchantIntel | null {
  return merchantDb[merchantName.toLowerCase()] ?? null;
}

// SPECTER: Replace with real API call
export function getDisputeFriendlinessLabel(
  level: "High" | "Medium" | "Low"
): { label: string; colour: string } {
  return {
    High: { label: "Dispute-friendly", colour: "text-primary" },
    Medium: { label: "Moderate — may require escalation", colour: "text-warning" },
    Low: { label: "Dispute-resistant", colour: "text-destructive" },
  }[level];
}

// SPECTER: Replace with real API call
export function getAllMerchantInsights() {
  return findings
    .filter((f) => f.automationDecision !== "NOT_WORTH_PURSUING")
    .map((f) => ({
      merchant: f.merchant,
      avgRecoveryRate: f.merchantIntel.avgRecoveryRate,
      disputeFriendliness: f.merchantIntel.disputeFriendliness,
      refundPolicy: f.merchantIntel.refundPolicy,
    }))
    .sort((a, b) => b.avgRecoveryRate - a.avgRecoveryRate);
}
