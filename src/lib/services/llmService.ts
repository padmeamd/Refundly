/**
 * llmService.ts
 *
 * LLM provider abstraction for Refundly.
 * Currently returns pre-generated reasoning from mock data.
 *
 * To enable real LLM calls:
 *   1. Set LLM_ENABLED = true
 *   2. Add VITE_ANTHROPIC_API_KEY or VITE_OPENAI_API_KEY to .env
 *   3. Implement the real API call in generateFromApi()
 *
 * The interface is stable — switching providers does NOT change callers.
 */

import type { Finding } from "../mock-data";

// LLM: Set to true when API key is available
const LLM_ENABLED = false;
const LLM_PROVIDER: "anthropic" | "openai" = "anthropic";

export interface LlmOutput {
  summary: string;
  recoveryMessage: string;
  riskJustification: string;
  escalationReason: string;
}

// ─── Public API ────────────────────────────────────────────────────────────────

export async function explainOpportunity(finding: Finding): Promise<string> {
  if (LLM_ENABLED) {
    const result = await generateFromApi(buildExplainPrompt(finding));
    return result;
  }
  // Mock: return pre-generated reasoning from finding data
  return finding.llmReasoning.summary;
}

export async function generateRecoveryMessage(finding: Finding): Promise<string> {
  if (LLM_ENABLED) {
    const result = await generateFromApi(buildMessagePrompt(finding));
    return result;
  }
  return finding.message;
}

export async function assessRisk(finding: Finding): Promise<string> {
  if (LLM_ENABLED) {
    const result = await generateFromApi(buildRiskPrompt(finding));
    return result;
  }
  return finding.llmReasoning.riskJustification;
}

export async function summariseAuditTrail(
  audit: { time: string; event: string }[]
): Promise<string> {
  if (LLM_ENABLED) {
    const events = audit.map((a) => `${a.time}: ${a.event}`).join("\n");
    return generateFromApi(
      `Summarise this audit trail in one sentence for a non-technical user:\n${events}`
    );
  }
  return `${audit.length} agent decisions recorded — audit trail sealed.`;
}

// ─── Prompt Builders ───────────────────────────────────────────────────────────

function buildExplainPrompt(f: Finding): string {
  return `You are a financial recovery AI. Explain in plain English why this charge is recoverable.
Merchant: ${f.merchant}
Category: ${f.findingCategory}
Amount: £${f.amount}
Recoverable: £${f.recoverable}
Evidence: ${f.evidence}
Keep it under 3 sentences, conversational, focused on the user's benefit.`;
}

function buildMessagePrompt(f: Finding): string {
  return `Generate a professional, concise recovery request email for:
Merchant: ${f.merchant}
Issue: ${f.type}
Amount: £${f.recoverable}
Evidence: ${f.evidence}
Tone: polite but firm. Include specific amounts and dates.`;
}

function buildRiskPrompt(f: Finding): string {
  return `Assess the risk of pursuing this refund claim:
Merchant: ${f.merchant}
Confidence: ${f.probability}%
Automation decision: ${f.automationDecision}
Evidence: ${f.evidence}
Return a 1-2 sentence risk assessment.`;
}

// ─── API Caller (stub) ─────────────────────────────────────────────────────────

async function generateFromApi(prompt: string): Promise<string> {
  if (LLM_PROVIDER === "anthropic") {
    // LLM: Replace with real Anthropic SDK call
    // const anthropic = new Anthropic({ apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY });
    // const msg = await anthropic.messages.create({
    //   model: "claude-sonnet-4-6",
    //   max_tokens: 512,
    //   messages: [{ role: "user", content: prompt }],
    // });
    // return msg.content[0].text;
    console.warn("[llmService] LLM_ENABLED=true but Anthropic SDK not wired. Falling back to mock.");
    return prompt; // fallback
  }
  // openai provider stub
  return prompt;
}
