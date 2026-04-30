# Refundly — Autonomous Financial Recovery Agent

> **Cursor × Briefcase FinTech London Hackathon**
> Track: **Financial Intelligence** · Theme: **Human-out-of-the-loop in FinTech**

---

## What is it?

Refundly is an autonomous AI agent that scans your bank transaction history, detects lost money, decides what it can recover automatically vs what needs your sign-off, generates ready-to-send recovery messages, and seals every decision in a cryptographic audit trail.

**One click. £420 found. £180 ready to recover.**

---

## The problem

Every month, consumers silently lose money to:
- Duplicate card charges from terminal glitches
- Bank fees charged unfairly and never challenged
- Subscriptions paid for services never used
- Cancelled bookings with refunds never claimed
- Late delivery guarantees never invoked
- Suspicious recurring charges from unrecognised merchants

Chasing these requires knowing your rights, writing the right letters, and navigating merchant dispute processes — work almost nobody does.

---

## The solution

Refundly removes the human from the loop for routine, high-confidence recovery actions. It keeps the human in the loop for complex, high-value, or ambiguous cases.

```
1,284 transactions scanned
       ↓
  7 issues detected
       ↓
  HITL routing engine
  ┌──────────────────────────────────────────────┐
  │  conf >= 80% + amount <= £100  → AUTO_READY  │  3 cases · £98.60
  │  conf >= 80% + amount >  £100  → NEEDS_REVIEW │
  │  conf 60–79%                   → NEEDS_REVIEW │  3 cases · £81.98
  │  conf < 60%                    → NOT_PURSUING │  1 case
  └──────────────────────────────────────────────┘
       ↓
  Recovery messages generated
  Merchant intelligence applied (Specter)
  Audit trail sealed
```

---

## Rubric alignment

| Criterion | Implementation |
|---|---|
| **Concrete Workflow Value** (2pts) | Replaces the human task of reviewing transactions, researching refund rights, writing dispute letters, and tracking outcomes |
| **Financial Intelligence** (2pts) | 6 finding categories, Bayesian confidence scoring, Specter-style merchant intelligence (dispute-friendliness, avg recovery rate, known patterns) |
| **Human-in-the-loop** (1pt) | Explicit confidence + amount thresholds. Every case labelled: "Auto-send allowed" / "Human review required" / "Low confidence — not submitted". HITL routing step visible in scan animation. |
| **Technical Execution** (1pt) | TanStack Start SSR, clean service layer (recoveryScanService, llmService, merchantIntelligence), modular architecture ready for real APIs |
| **Demo Clarity** (1pt) | "90-sec demo" button runs the full automated flow |

---

## Human-in-the-loop rules

```ts
// src/lib/services/recoveryScanService.ts
function applyHitlRules(confidence: number, recoverable: number): AutomationDecision {
  if (confidence < 60)                        return "NOT_WORTH_PURSUING";
  if (confidence >= 80 && recoverable <= 100) return "AUTO_READY";
  return "NEEDS_HUMAN_REVIEW"; // conf 60-79 OR high-value amount
}
```

---

## Tech stack

| Layer | Technology |
|---|---|
| Framework | TanStack Start (SSR + file-based routing) |
| Styling | Tailwind CSS v4, custom design tokens |
| UI | Radix UI primitives, Lucide icons |
| Runtime | Cloudflare Workers (Wrangler) |
| Language | TypeScript |

---

## Services architecture

```
src/lib/services/
├── recoveryScanService.ts    # HITL routing engine, detection rules, confidence scoring
├── llmService.ts             # LLM abstraction (mock → Claude/OpenAI, one flag to enable)
└── merchantIntelligence.ts   # Specter-style merchant data (tagged for API replacement)
```

**To enable real Claude calls:** Set `LLM_ENABLED = true` in `llmService.ts` and add `VITE_ANTHROPIC_API_KEY` to `.env`.

**To enable Specter:** Replace `// SPECTER:` tagged functions in `merchantIntelligence.ts` with real API calls.

---

## How to run

```bash
npm install
npm run dev
# → http://localhost:3000
```

**Deploy:**
```bash
npm run build
wrangler deploy
```

---

## 90-second demo script

1. **Click "90-sec demo"** — scan animation plays through 9 agent steps
2. **Step 7** is amber: "Applying human-in-loop routing rules" — explain the threshold logic
3. **Findings page** — show filter tabs: ⚡ Auto-send / 👤 Needs review / ✕ Not pursuing
4. **Open Trainline case** — show AI Reasoning, Merchant Intelligence (Specter), audit trail, "Auto-send" CTA
5. **Action Center** — show the split queue: 3 auto-dispatched, 3 awaiting approval
6. **Report** — HITL breakdown panel, export the audit report

**Key line:** *"Refundly found £420, decided £98 can go out right now without my involvement, flagged £82 for my approval, and ignored a £155 non-refundable booking it knew wasn't worth fighting."*

---

## What to say to judges

- **Not a dashboard** — the agent makes real routing decisions using confidence and amount thresholds
- **HITL is explicit** — every finding has a labelled decision with a written justification
- **Merchant intelligence** is the Specter layer — dispute-friendliness score, avg recovery rate, known fraud patterns
- **LLM service** is architected for Claude — one boolean flag away from real AI reasoning
- **Audit trail** timestamps every agent decision, with HITL steps highlighted

---

## Future integrations

| Integration | Replaces |
|---|---|
| Plaid / TrueLayer | Mock transaction data |
| Specter merchant API | `merchantIntelligence.ts` mock |
| Claude API | `llmService.ts` mock reasoning |
| Cloudflare D1 | In-memory state |
| Spring Boot / FastAPI | Frontend service layer |

---

MIT — Cursor × Briefcase FinTech London Hackathon 2026
