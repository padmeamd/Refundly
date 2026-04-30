// ─── Types ────────────────────────────────────────────────────────────────────

export type FindingType =
  | "Duplicate charge"
  | "Hidden fee"
  | "Subscription waste"
  | "Refund eligible"
  | "Suspicious charge"
  | "Cancelled service";

export type FindingCategory =
  | "DUPLICATE_CHARGE"
  | "UNUSED_SUBSCRIPTION"
  | "HIDDEN_BANK_FEE"
  | "CANCELLED_SERVICE_NO_REFUND"
  | "LATE_DELIVERY_REFUND"
  | "SUSPICIOUS_RECURRING_CHARGE";

/**
 * Human-in-the-loop routing decision.
 *
 * Rules applied by the engine (see recoveryScanService.ts):
 *   confidence >= 80 AND recoverable <= £100  →  AUTO_READY
 *   confidence >= 80 AND recoverable >  £100  →  NEEDS_HUMAN_REVIEW
 *   confidence 60–79                          →  NEEDS_HUMAN_REVIEW
 *   confidence < 60                           →  NOT_WORTH_PURSUING
 */
export type AutomationDecision =
  | "AUTO_READY"
  | "NEEDS_HUMAN_REVIEW"
  | "NOT_WORTH_PURSUING";

export type RiskLevel = "Low" | "Medium" | "High";

export type FindingStatus =
  | "Ready to claim"
  | "Auto-dispute prepared"
  | "Refund email generated"
  | "Low confidence"
  | "Flagged for review";

export type ActionStatus =
  | "Drafted"
  | "Submitted"
  | "Waiting for merchant"
  | "Recovered"
  | "Rejected";

// ─── Merchant Intelligence (Specter-style) ────────────────────────────────────
// SPECTER: Replace mock data below with real Specter API calls
export interface MerchantIntel {
  refundPolicy: string;
  disputeFriendliness: "High" | "Medium" | "Low";
  avgRecoveryRate: number; // percentage
  knownPattern?: string;
  source: "Specter (mock)";
}

// ─── LLM Reasoning ────────────────────────────────────────────────────────────
// LLM: Replace with real llmService.generateReasoning() call when API key set
export interface LlmReasoning {
  summary: string;
  riskJustification: string;
  escalationReason: string;
}

// ─── Core Finding ─────────────────────────────────────────────────────────────
export interface Finding {
  id: string;
  type: FindingType;
  findingCategory: FindingCategory;
  merchant: string;
  amount: number;
  recoverable: number;
  probability: number;
  action: string;
  status: FindingStatus;
  category: string; // display category e.g. "Food & Drink"
  evidence: string;
  reasoning: string;
  message: string;
  date: string;
  audit: { time: string; event: string }[];
  actionStatus: ActionStatus;
  // ── HITL fields ──────────────────────────────────────────────────────────
  automationDecision: AutomationDecision;
  riskLevel: RiskLevel;
  escalationReason: string;
  // ── Intelligence layers ───────────────────────────────────────────────────
  merchantIntel: MerchantIntel;
  llmReasoning: LlmReasoning;
}

// ─── Findings ─────────────────────────────────────────────────────────────────
// 7 findings: £419.98 total found → £420, £180.58 recoverable → £180
// HITL breakdown: 3 AUTO_READY · 3 NEEDS_HUMAN_REVIEW · 1 NOT_WORTH_PURSUING

export const findings: Finding[] = [
  {
    id: "f-001",
    type: "Duplicate charge",
    findingCategory: "DUPLICATE_CHARGE",
    merchant: "Pret A Manger",
    amount: 14.8,
    recoverable: 7.4,
    probability: 94,
    automationDecision: "AUTO_READY",   // conf ≥ 80 + amount ≤ £100
    riskLevel: "Low",
    escalationReason: "High-confidence duplicate match with identical terminal ID and sub-60s window. Under £100 threshold — agent can auto-dispute without human approval.",
    action: "Auto-dispute duplicate payment",
    status: "Auto-dispute prepared",
    category: "Food & Drink",
    date: "2026-04-22",
    evidence:
      "Two identical card-present transactions for £7.40 at terminal TRM-44821 within 38 seconds on 2026-04-22.",
    reasoning:
      "Identical merchant, amount, MCC code 5812, and terminal ID with sub-minute spacing — pattern matches Visa chargeback reason code 4834 (duplicate processing).",
    message:
      "Dear Pret A Manger Customer Services,\n\nI am writing to report a duplicate charge on my account. On 22 April 2026, I was charged £7.40 twice at the same terminal within 38 seconds. As this is clearly a processing error, I request an immediate reversal of the duplicate transaction.\n\nTransaction reference: TRM-44821 / 09:14:02 and 09:14:40\n\nThank you for your prompt assistance.",
    audit: [
      { time: "09:14:02", event: "Transaction ingested from Open Banking feed" },
      { time: "09:14:03", event: "Duplicate detector matched — conf 0.94" },
      { time: "09:14:03", event: "Visa chargeback code 4834 selected" },
      { time: "09:14:04", event: "HITL rule applied: AUTO_READY (conf ≥ 80, amount ≤ £100)" },
      { time: "09:14:04", event: "Dispute packet drafted and queued" },
    ],
    actionStatus: "Drafted",
    merchantIntel: {
      refundPolicy: "Duplicate transactions reversed within 3–5 business days via card issuer dispute.",
      disputeFriendliness: "High",
      avgRecoveryRate: 96,
      knownPattern: "Terminal TRM-44821 has 3 prior duplicate-charge incidents in merchant database.",
      source: "Specter (mock)",
    },
    llmReasoning: {
      summary:
        "Pret A Manger charged you twice for the same £7.40 coffee within 38 seconds — a classic till terminal glitch. This is one of the easiest refund cases: the evidence is unambiguous and the chargeback pathway is standardised.",
      riskJustification:
        "Risk is low. Visa's reason code 4834 is specifically designed for this scenario. Merchant dispute-friendliness is rated High by Specter. No risk of account flags.",
      escalationReason:
        "Confidence 94% + amount £7.40 (under £100 threshold) → automated dispute submitted without human approval required.",
    },
  },
  {
    id: "f-002",
    type: "Subscription waste",
    findingCategory: "UNUSED_SUBSCRIPTION",
    merchant: "FitFlex Gym",
    amount: 49.99,
    recoverable: 49.99,
    probability: 78,
    automationDecision: "NEEDS_HUMAN_REVIEW", // conf 60–79
    riskLevel: "Medium",
    escalationReason: "Confidence 78% falls in the 60–79 range. Unused subscription evidence is strong but refund eligibility depends on contract terms — human should review before sending.",
    action: "Cancel and request unused month refund",
    status: "Refund email generated",
    category: "Subscriptions",
    date: "2026-04-01",
    evidence: "Zero check-ins via linked calendar in the last 92 days. Monthly charge of £49.99 continued through non-use period.",
    reasoning:
      "Recurring £49.99/month with zero merchant engagement signals. UK Consumer Rights Act 2015 and sector guidance allow unused-period refund requests for gym contracts.",
    message:
      "Dear FitFlex Gym Customer Support,\n\nI am writing to formally cancel my membership with immediate effect and to request a refund for the unused current billing period.\n\nI have not visited any FitFlex facility in the past 92 days, as evidenced by my access records. Under the Consumer Rights Act 2015 and your standard membership terms, I am entitled to request a goodwill refund for the unused month.\n\nPlease confirm cancellation and process the refund of £49.99 to my original payment method.",
    audit: [
      { time: "10:02:10", event: "Subscription billing pattern identified" },
      { time: "10:02:11", event: "Engagement check: 0 check-ins in 92 days" },
      { time: "10:02:12", event: "Consumer Rights Act eligibility assessed" },
      { time: "10:02:13", event: "HITL rule applied: NEEDS_HUMAN_REVIEW (conf 60–79)" },
      { time: "10:02:13", event: "Cancellation + refund email drafted — awaiting approval" },
    ],
    actionStatus: "Drafted",
    merchantIntel: {
      refundPolicy: "Gym accepts unused-month refund requests within 30 days of last charge if no visits recorded. Contract clause 8.3.",
      disputeFriendliness: "Medium",
      avgRecoveryRate: 71,
      knownPattern: "FitFlex typically requires escalation to membership team; first-contact resolution rate ~60%.",
      source: "Specter (mock)",
    },
    llmReasoning: {
      summary:
        "You've been paying £49.99/month for a gym you haven't visited in three months. UK consumer regulations give you strong grounds to request a refund for the unused period, but the contract terms need human verification before sending.",
      riskJustification:
        "Medium risk. Refund eligibility depends on specific contract language — agent has identified strong grounds but cannot verify all terms automatically.",
      escalationReason:
        "Confidence 78% is in the NEEDS_HUMAN_REVIEW band (60–79%). A human should confirm the contract clause before the cancellation email is sent.",
    },
  },
  {
    id: "f-003",
    type: "Refund eligible",
    findingCategory: "LATE_DELIVERY_REFUND",
    merchant: "Amazon",
    amount: 89.0,
    recoverable: 12.0,
    probability: 72,
    automationDecision: "NEEDS_HUMAN_REVIEW", // conf 60–79
    riskLevel: "Low",
    escalationReason: "Confidence 72% is in the NEEDS_HUMAN_REVIEW band. Late delivery compensation amount varies (£5–£15); human should confirm desired claim amount before submission.",
    action: "Request late delivery compensation",
    status: "Refund email generated",
    category: "Shopping",
    date: "2026-04-18",
    evidence: "Guaranteed delivery date: 2026-04-15. Actual delivery: 2026-04-18 — 3 calendar days late.",
    reasoning:
      "Amazon Prime guarantees on-time delivery. Three-day breach triggers goodwill compensation of £5–£15 per Prime terms. No prior claim filed.",
    message:
      "Dear Amazon Customer Service,\n\nOrder #204-8834921-6677891 was guaranteed to arrive by 15 April 2026 under my Prime membership. It was not delivered until 18 April — three days late.\n\nPer Amazon Prime's on-time delivery guarantee, I am requesting the standard late delivery compensation credit to my account.\n\nOrder total: £89.00. Requested compensation: £12.00.",
    audit: [
      { time: "11:40:00", event: "Delivery SLA breach detected — 3 days late" },
      { time: "11:40:01", event: "Prime guarantee eligibility confirmed" },
      { time: "11:40:02", event: "Compensation range estimated: £5–£15" },
      { time: "11:40:02", event: "HITL rule applied: NEEDS_HUMAN_REVIEW (conf 60–79)" },
      { time: "11:40:03", event: "Compensation request drafted — awaiting human approval" },
    ],
    actionStatus: "Submitted",
    merchantIntel: {
      refundPolicy: "Amazon Prime late delivery credits issued automatically via customer service chat or phone. Average £10 per incident.",
      disputeFriendliness: "High",
      avgRecoveryRate: 83,
      knownPattern: "Amazon CS typically issues £10–£15 credit on first contact for Prime members. No chargeback required.",
      source: "Specter (mock)",
    },
    llmReasoning: {
      summary:
        "Your Amazon Prime order arrived 3 days late. Amazon's Prime guarantee makes this a straightforward goodwill credit request — their support team almost always issues it on first contact.",
      riskJustification:
        "Low risk. Amazon dispute-friendliness is rated High. No account flags expected. The only uncertainty is the exact credit amount.",
      escalationReason:
        "Confidence 72% (band: 60–79) triggers human review. Recommended action is clear but human should confirm the £12 claim amount before submission.",
    },
  },
  {
    id: "f-004",
    type: "Hidden fee",
    findingCategory: "HIDDEN_BANK_FEE",
    merchant: "MetroBank",
    amount: 35.0,
    recoverable: 35.0,
    probability: 81,
    automationDecision: "AUTO_READY", // conf ≥ 80 + amount ≤ £100
    riskLevel: "Low",
    escalationReason: "Confidence 81% + recoverable amount £35 (under £100 threshold). First overdraft in 12 months — high goodwill reversal probability. Agent can send automatically.",
    action: "Request overdraft fee reversal",
    status: "Auto-dispute prepared",
    category: "Bank Fees",
    date: "2026-04-10",
    evidence: "Overdraft fee £35 charged on 2026-04-10. Account balance returned to positive within 19 hours. No overdraft fee in the prior 12 months.",
    reasoning:
      "First overdraft fee in 12 months. FCA guidance and MetroBank's own goodwill policy support reversal on first request for loyal customers. 81% confidence based on account history match.",
    message:
      "Dear MetroBank Customer Support,\n\nI have noticed an overdraft fee of £35.00 applied to my account on 10 April 2026. My balance returned to positive within 19 hours of the overdraft occurring.\n\nAs a customer with no overdraft fees in the past 12 months, I would appreciate a goodwill reversal of this charge under MetroBank's fee waiver policy.\n\nAccount: ****4821. Fee date: 10 April 2026. Fee amount: £35.00.",
    audit: [
      { time: "12:11:30", event: "Overdraft fee transaction detected" },
      { time: "12:11:31", event: "Account history check: 0 overdraft fees in 12 months" },
      { time: "12:11:31", event: "Balance recovery confirmed: +ve within 19h" },
      { time: "12:11:32", event: "HITL rule applied: AUTO_READY (conf ≥ 80, amount ≤ £100)" },
      { time: "12:11:32", event: "Fee reversal request drafted and auto-queued" },
    ],
    actionStatus: "Waiting for merchant",
    merchantIntel: {
      refundPolicy: "MetroBank reverses first-time overdraft fees for customers with 12-month clean history. FCA goodwill guidance reference FG22/5.",
      disputeFriendliness: "High",
      avgRecoveryRate: 88,
      knownPattern: "MetroBank CS resolves fee reversal requests within 48 hours via in-app chat. First-contact success rate 88%.",
      source: "Specter (mock)",
    },
    llmReasoning: {
      summary:
        "MetroBank charged you £35 for going briefly overdrawn — but your balance recovered in under 20 hours and you haven't had a fee in a year. Banks almost always reverse this on goodwill when asked.",
      riskJustification:
        "Low risk. FCA guidance (FG22/5) encourages banks to apply fee waivers for isolated incidents. Specter rates MetroBank dispute-friendliness as High.",
      escalationReason:
        "Confidence 81% + amount £35 (under £100 threshold) → AUTO_READY. Agent authorised to send reversal request without human sign-off.",
    },
  },
  {
    id: "f-005",
    type: "Refund eligible",
    findingCategory: "CANCELLED_SERVICE_NO_REFUND",
    merchant: "Trainline",
    amount: 56.2,
    recoverable: 56.2,
    probability: 88,
    automationDecision: "AUTO_READY", // conf ≥ 80 + amount ≤ £100
    riskLevel: "Low",
    escalationReason: "Confidence 88% + recoverable £56.20 (under £100 threshold). Anytime fare rules are unambiguous — agent can claim the full refund automatically.",
    action: "Claim full fare refund",
    status: "Ready to claim",
    category: "Travel",
    date: "2026-04-05",
    evidence: "Booking XYZ123 cancelled 48 hours before travel on Anytime fare. No refund issued within the 28-day window.",
    reasoning: "Anytime fare class grants 100% refund on cancellation before travel. 28-day claim window still open. £56.20 fully recoverable.",
    message:
      "Dear Trainline Customer Service,\n\nI am writing to claim a refund for booking reference XYZ123, which I cancelled on 3 April 2026 — 48 hours before the scheduled travel date of 5 April.\n\nAs this booking was made on an Anytime fare, it is fully refundable under National Rail Conditions of Travel (clause 30). No refund has been processed to date.\n\nPlease issue the full refund of £56.20 to my original payment method.",
    audit: [
      { time: "13:22:00", event: "Booking cancellation + fare class detected" },
      { time: "13:22:01", event: "Anytime fare confirmed: 100% refund eligible" },
      { time: "13:22:01", event: "28-day claim window: 23 days remaining" },
      { time: "13:22:02", event: "HITL rule applied: AUTO_READY (conf ≥ 80, amount ≤ £100)" },
      { time: "13:22:02", event: "Refund claim drafted and auto-queued" },
    ],
    actionStatus: "Drafted",
    merchantIntel: {
      refundPolicy: "Anytime fares refundable in full before travel date. National Rail CoT clause 30. Trainline processes within 5 business days.",
      disputeFriendliness: "High",
      avgRecoveryRate: 94,
      knownPattern: "Trainline refunds Anytime fare cancellations automatically when claim is submitted via their portal or API.",
      source: "Specter (mock)",
    },
    llmReasoning: {
      summary:
        "You cancelled a Trainline Anytime fare 48 hours before travel — that's a full refund under National Rail conditions. The 28-day claim window is still open, and you haven't claimed yet. This is free money waiting to be collected.",
      riskJustification:
        "Low risk. The refund eligibility is legally guaranteed by National Rail Conditions of Travel. Trainline's recovery rate for this scenario is 94%.",
      escalationReason:
        "Confidence 88% + amount £56.20 (under £100 threshold) → AUTO_READY. No human approval needed — claim is straightforward and fully documented.",
    },
  },
  {
    id: "f-006",
    type: "Suspicious charge",
    findingCategory: "SUSPICIOUS_RECURRING_CHARGE",
    merchant: "StreamingPlus",
    amount: 19.99,
    recoverable: 19.99,
    probability: 67,
    automationDecision: "NEEDS_HUMAN_REVIEW", // conf 60–79
    riskLevel: "High",
    escalationReason: "Confidence 67% is in the 60–79 band AND risk level is High (possible fraud). Human must verify whether this is an authorised subscription before any dispute is raised.",
    action: "Cancel recurring charge and dispute",
    status: "Flagged for review",
    category: "Subscriptions",
    date: "2026-04-20",
    evidence: "Merchant descriptor 'STREAMINGPLUS*UK' unrecognised. No signup confirmation email found. Recurring since January 2026 — £59.97 total charged.",
    reasoning: "Recurring charge with no signup evidence. Possible free-trial roll-over or fraudulent subscription. High risk level requires human verification before dispute.",
    message:
      "Dear StreamingPlus Customer Services,\n\nI do not recognise recurring charges from 'STREAMINGPLUS*UK' appearing on my account since January 2026. I have no record of signing up for this service.\n\nI request: (1) immediate cancellation of any active subscription under my name or payment details, and (2) a refund of the most recent charge of £19.99 as I did not authorise this recurring payment.\n\nIf this is a fraudulent charge, please escalate to your fraud team.",
    audit: [
      { time: "14:55:00", event: "Unknown merchant descriptor flagged" },
      { time: "14:55:01", event: "Inbox scan: no signup confirmation found" },
      { time: "14:55:02", event: "Recurring since 2026-01: £59.97 total exposure" },
      { time: "14:55:02", event: "HITL rule applied: NEEDS_HUMAN_REVIEW (conf 67%, risk: High)" },
      { time: "14:55:03", event: "Cancel + dispute draft prepared — blocked pending human approval" },
    ],
    actionStatus: "Drafted",
    merchantIntel: {
      refundPolicy: "Disputed recurring charges from unrecognised merchants processed via Section 75 or chargeback. Issuing bank required to investigate within 8 weeks.",
      disputeFriendliness: "Low",
      avgRecoveryRate: 58,
      knownPattern: "StreamingPlus has 12 reported cases of unauthorised trial roll-overs in the past 6 months. FCA investigation pending.",
      source: "Specter (mock)",
    },
    llmReasoning: {
      summary:
        "A streaming service you don't recognise has been charging you £19.99/month since January — that's £60 taken without clear authorisation. This could be a forgotten free trial or outright fraud. Either way, you have strong grounds to dispute and cancel.",
      riskJustification:
        "High risk. Merchant has a pattern of unauthorised subscriptions. Raising a dispute without human verification could trigger fraud reporting processes that need careful handling.",
      escalationReason:
        "Confidence 67% (band: 60–79) + High risk → NEEDS_HUMAN_REVIEW. Human must confirm: (1) is any subscription recognised? (2) should this be treated as fraud? before agent proceeds.",
    },
  },
  {
    id: "f-007",
    type: "Cancelled service",
    findingCategory: "CANCELLED_SERVICE_NO_REFUND",
    merchant: "HotelBreaks.co.uk",
    amount: 155.0,
    recoverable: 0,
    probability: 42,
    automationDecision: "NOT_WORTH_PURSUING", // conf < 60
    riskLevel: "Medium",
    escalationReason: "Confidence 42% is below the 60% threshold. Non-refundable rate confirmed in booking terms. Recovery unlikely to succeed and could incur dispute fees. Not worth pursuing.",
    action: "No action recommended",
    status: "Low confidence",
    category: "Travel",
    date: "2026-03-28",
    evidence: "Hotel booking cancelled 2 days before check-in. Booking made on non-refundable rate. £155.00 charged.",
    reasoning: "Non-refundable rate clearly stated at booking. Cancellation 48h before check-in provides no grounds under consumer law. Recovery probability too low to justify action.",
    message: "",
    audit: [
      { time: "08:30:00", event: "Hotel cancellation charge detected" },
      { time: "08:30:01", event: "Fare class check: NON-REFUNDABLE rate confirmed" },
      { time: "08:30:02", event: "Consumer law eligibility: no grounds found" },
      { time: "08:30:02", event: "HITL rule applied: NOT_WORTH_PURSUING (conf < 60)" },
      { time: "08:30:03", event: "Case logged — no action queued" },
    ],
    actionStatus: "Rejected",
    merchantIntel: {
      refundPolicy: "Non-refundable rates are legally enforceable. Chargeback disputes for change-of-mind cancellations have <10% success rate and can result in blacklisting.",
      disputeFriendliness: "Low",
      avgRecoveryRate: 8,
      knownPattern: "HotelBreaks.co.uk non-refundable disputes typically fail. Dispute fee £15–£25 would exceed likely recovery.",
      source: "Specter (mock)",
    },
    llmReasoning: {
      summary:
        "You cancelled a non-refundable hotel booking 48 hours before check-in. Unfortunately the non-refundable rate you booked means there are no legal grounds to reclaim this £155. Pursuing a dispute would likely fail and could incur additional fees.",
      riskJustification:
        "Medium risk. Initiating a chargeback on a clearly non-refundable booking could result in merchant blacklisting and a failed dispute fee. Not recommended.",
      escalationReason:
        "Confidence 42% (below 60% threshold) → NOT_WORTH_PURSUING. Agent has determined the cost and probability of recovery do not justify any action.",
    },
  },
];

// ─── Computed Stats ────────────────────────────────────────────────────────────
// Totals: £419.98 found → £420 | £180.58 recoverable → £180 | 6 actionable cases

export const stats = {
  totalFound: 420,
  recoverableNow: 180,
  issuesDetected: 6,          // excludes NOT_WORTH_PURSUING
  successProbability: 80,     // avg of actionable cases
  autoReadyCount: 3,          // AUTO_READY findings
  humanReviewCount: 3,        // NEEDS_HUMAN_REVIEW findings
  notWorthPursuingCount: 1,
  autoReadyValue: 98.6,       // £ recoverable across AUTO_READY
  humanReviewValue: 81.98,    // £ recoverable across NEEDS_HUMAN_REVIEW
};

// ─── Scan Steps ───────────────────────────────────────────────────────────────
// Step 7 is the critical HITL routing step — make it prominent in the UI
export const scanSteps = [
  "Importing 1,284 bank transactions",
  "Categorising payment types & merchants",
  "Detecting duplicate charges",
  "Checking merchant refund eligibility",
  "Identifying unused subscriptions",
  "Calculating Bayesian confidence scores",
  "Applying human-in-loop routing rules",   // ← HITL step
  "Generating recovery messages & disputes",
  "Sealing cryptographic audit trail",
];
