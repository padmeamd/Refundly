# Refundly - Autonomous Financial Recovery Agent

Refundly scans transactions, finds lost money, decides whether to act automatically or request approval, prepares actions, and logs everything in an audit trail.

## Problem

People lose money to duplicate charges, hidden fees, unused subscriptions, and missed refunds, but recovery work is manual and slow.

## Solution

Refundly provides a real workflow:
`scan -> decide -> act -> audit`

## Human-out-of-the-loop logic

- confidence >= 80 and recoverable <= 100 -> AUTO_READY
- confidence >= 80 and recoverable > 100 -> NEEDS_APPROVAL
- confidence 60-79 -> NEEDS_APPROVAL
- confidence < 60 -> NOT_WORTH

UI labels:
- Auto-send allowed
- Human review required
- Low confidence

## Architecture

```text
src/lib/api/apiClient.ts
  GET /transactions
  POST /scan
  GET /opportunities
  POST /opportunity/{id}/submit

Services:
- transactionService.ts
- recoveryScanService.ts
- actionService.ts
- auditService.ts
- llmService.ts
- merchantIntelligence.ts
```

## Demo flow (90 seconds)

1. Click **Run 90-sec demo**
2. Transactions load and scan runs
3. Findings are generated from transactions
4. Highest-value case is highlighted
5. Decision reason + confidence are shown
6. One auto-ready action is submitted
7. Report shows summary metrics and audit timeline

## Why this fits the hackathon rubric

- Human-out-of-the-loop: explicit autonomous routing with thresholds
- Financial Intelligence: transaction interpretation + confidence scoring
- Technical execution: clean service + API layer architecture
- Demo clarity: deterministic and stable one-button run

## Run locally

```bash
npm install
npm run dev
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

Cursor × Briefcase FinTech London Hackathon 2026
