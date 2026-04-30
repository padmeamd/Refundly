import type { RecoveryOpportunity } from "./recoveryScanService";

const hasApiKey = Boolean(import.meta.env.VITE_OPENAI_API_KEY || import.meta.env.VITE_ANTHROPIC_API_KEY);

export async function generateRecoveryMessage(opportunity: RecoveryOpportunity): Promise<string> {
  if (hasApiKey) {
    return generateFromProvider(`Write a concise refund request for ${opportunity.merchant} for £${opportunity.recoverableAmount}.`);
  }
  return [
    `Hello ${opportunity.merchant} Support Team,`,
    "",
    `I am requesting a refund of £${opportunity.recoverableAmount.toFixed(2)} related to ${opportunity.category}.`,
    `Evidence: ${opportunity.evidence.join(" | ")}.`,
    "",
    "Please confirm the reversal to my original payment method.",
    "Thank you.",
  ].join("\n");
}

export async function explainOpportunity(opportunity: RecoveryOpportunity): Promise<string> {
  if (hasApiKey) {
    return generateFromProvider(`Explain why ${opportunity.category} for ${opportunity.merchant} is recoverable.`);
  }
  return `AI reasoning (Claude-ready mock): ${opportunity.category} was flagged using deterministic evidence (${opportunity.evidence[0]}). Confidence is ${opportunity.confidenceScore}% and the routing decision is ${opportunity.decision}.`;
}

async function generateFromProvider(prompt: string): Promise<string> {
  // Intentionally mocked; wiring is isolated for easy replacement.
  return `LLM provider response placeholder: ${prompt}`;
}
