export type FindingType =
  | "Duplicate charge"
  | "Hidden fee"
  | "Subscription waste"
  | "Refund eligible"
  | "Suspicious charge";

export type FindingStatus =
  | "Ready to claim"
  | "Auto-dispute prepared"
  | "Refund email generated"
  | "Low confidence";

export type ActionStatus =
  | "Drafted"
  | "Submitted"
  | "Waiting for merchant"
  | "Recovered"
  | "Rejected";

export interface Finding {
  id: string;
  type: FindingType;
  merchant: string;
  amount: number;
  recoverable: number;
  probability: number;
  action: string;
  status: FindingStatus;
  category: string;
  evidence: string;
  reasoning: string;
  message: string;
  date: string;
  audit: { time: string; event: string }[];
  actionStatus: ActionStatus;
}

export const findings: Finding[] = [
  {
    id: "f-001",
    type: "Duplicate charge",
    merchant: "Pret A Manger",
    amount: 14.8,
    recoverable: 7.4,
    probability: 94,
    action: "Auto-dispute duplicate payment",
    status: "Auto-dispute prepared",
    category: "Food & Drink",
    date: "2026-04-22",
    evidence:
      "Two identical card-present transactions for £7.40 at the same terminal within 38 seconds.",
    reasoning:
      "Identical merchant, amount, MCC and terminal ID with sub-minute spacing — pattern matches Visa duplicate transaction code 4834.",
    message:
      "Hello, I noticed a duplicate charge on my account for the same merchant, amount, and date. Please review and reverse the duplicate payment.",
    audit: [
      { time: "09:14:02", event: "Transaction ingested" },
      { time: "09:14:03", event: "Duplicate detector matched (conf 0.94)" },
      { time: "09:14:04", event: "Visa dispute reason 4834 selected" },
      { time: "09:14:05", event: "Dispute packet drafted" },
    ],
    actionStatus: "Drafted",
  },
  {
    id: "f-002",
    type: "Subscription waste",
    merchant: "FitFlex Gym",
    amount: 49.99,
    recoverable: 49.99,
    probability: 78,
    action: "Cancel and request unused month refund",
    status: "Refund email generated",
    category: "Subscriptions",
    date: "2026-04-01",
    evidence: "No check-ins detected via linked calendar in the last 92 days.",
    reasoning:
      "Recurring £49.99/month with zero merchant engagement signals. UK consumer regs allow unused-period refund requests.",
    message:
      "Hello, I would like to cancel my FitFlex Gym membership effective immediately and request a refund for the unused month, as I have not used the facility in the last 90 days.",
    audit: [
      { time: "10:02:10", event: "Subscription pattern identified" },
      { time: "10:02:11", event: "Engagement check: 0 visits / 92d" },
      { time: "10:02:12", event: "Cancellation + refund email drafted" },
    ],
    actionStatus: "Drafted",
  },
  {
    id: "f-003",
    type: "Refund eligible",
    merchant: "Amazon",
    amount: 89.0,
    recoverable: 12.0,
    probability: 72,
    action: "Request delivery compensation",
    status: "Refund email generated",
    category: "Shopping",
    date: "2026-04-18",
    evidence: "Promised delivery 2026-04-15, actual delivery 2026-04-18 (3 days late).",
    reasoning:
      "Amazon Prime guarantees on-time delivery. Late delivery typically yields £5–£15 goodwill credit.",
    message:
      "Hello, my recent order arrived 3 days after the guaranteed delivery date. Please apply the standard late-delivery compensation to my account.",
    audit: [
      { time: "11:40:00", event: "Order tracked vs SLA" },
      { time: "11:40:01", event: "SLA breach 72h confirmed" },
      { time: "11:40:02", event: "Compensation request drafted" },
    ],
    actionStatus: "Submitted",
  },
  {
    id: "f-004",
    type: "Hidden fee",
    merchant: "MetroBank",
    amount: 35.0,
    recoverable: 35.0,
    probability: 81,
    action: "Request fee reversal",
    status: "Auto-dispute prepared",
    category: "Bank Fees",
    date: "2026-04-10",
    evidence: "Overdraft fee charged despite balance returning positive within 24 hours.",
    reasoning:
      "First overdraft fee in 12 months. Banks routinely reverse goodwill fees on first request.",
    message:
      "Hello, I noticed an overdraft fee on my account. As a long-standing customer with no recent fees, I'd appreciate a goodwill reversal of this charge.",
    audit: [
      { time: "12:11:30", event: "Fee transaction detected" },
      { time: "12:11:31", event: "Goodwill eligibility confirmed" },
      { time: "12:11:32", event: "Reversal request drafted" },
    ],
    actionStatus: "Waiting for merchant",
  },
  {
    id: "f-005",
    type: "Refund eligible",
    merchant: "Trainline",
    amount: 56.2,
    recoverable: 56.2,
    probability: 88,
    action: "Claim refund",
    status: "Ready to claim",
    category: "Travel",
    date: "2026-04-05",
    evidence: "Booking cancelled 48h before travel — fully refundable per fare rules.",
    reasoning: "Anytime fare with full refund eligibility. No claim filed within 28-day window.",
    message:
      "Hello, I cancelled booking ref XYZ123 ahead of the 24h window. Per the Anytime fare rules this is fully refundable. Please process the refund.",
    audit: [
      { time: "13:22:00", event: "Cancellation + fare class matched" },
      { time: "13:22:01", event: "Refund claim drafted" },
    ],
    actionStatus: "Drafted",
  },
  {
    id: "f-006",
    type: "Suspicious charge",
    merchant: "StreamingPlus",
    amount: 19.99,
    recoverable: 19.99,
    probability: 67,
    action: "Cancel recurring charge and dispute",
    status: "Low confidence",
    category: "Subscriptions",
    date: "2026-04-20",
    evidence: "Merchant descriptor unrecognised; no signup confirmation in inbox.",
    reasoning: "Recurring charge with no sign-up trail. Possible free-trial roll-over or fraud.",
    message:
      "Hello, I do not recognise this recurring charge. Please cancel any active subscription on my account and reverse the most recent payment.",
    audit: [
      { time: "14:55:00", event: "Unknown merchant flagged" },
      { time: "14:55:01", event: "No signup evidence found" },
      { time: "14:55:02", event: "Cancel + dispute draft prepared" },
    ],
    actionStatus: "Drafted",
  },
];

export const stats = {
  totalFound: 420,
  recoverableNow: 180,
  issuesDetected: 7,
  successProbability: 82,
};

export const scanSteps = [
  "Importing transactions",
  "Detecting duplicate charges",
  "Checking merchant refund policies",
  "Identifying unused subscriptions",
  "Estimating recovery probability",
  "Preparing dispute / refund actions",
  "Creating audit trail",
];