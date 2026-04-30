export interface MerchantIntelligence {
  label: "Specter-style intelligence (mock)";
  refundPolicy: string;
  disputeLikelihood: "HIGH" | "MEDIUM" | "LOW";
  recoveryRate: number;
}

const db: Record<string, MerchantIntelligence> = {
  "pret a manger": {
    label: "Specter-style intelligence (mock)",
    refundPolicy: "Duplicate card-present transactions are typically reversed in 3-5 business days.",
    disputeLikelihood: "HIGH",
    recoveryRate: 96,
  },
  fitflex: {
    label: "Specter-style intelligence (mock)",
    refundPolicy: "Unused subscription refunds handled by membership support with proof of inactivity.",
    disputeLikelihood: "MEDIUM",
    recoveryRate: 71,
  },
  amazon: {
    label: "Specter-style intelligence (mock)",
    refundPolicy: "Prime late-delivery claims are usually compensated with account credit.",
    disputeLikelihood: "HIGH",
    recoveryRate: 83,
  },
  metrobank: {
    label: "Specter-style intelligence (mock)",
    refundPolicy: "First overdraft incidents may be waived as goodwill.",
    disputeLikelihood: "HIGH",
    recoveryRate: 88,
  },
  trainline: {
    label: "Specter-style intelligence (mock)",
    refundPolicy: "Refundable fare cancellations can be claimed in-app with booking reference.",
    disputeLikelihood: "HIGH",
    recoveryRate: 94,
  },
  streamingplus: {
    label: "Specter-style intelligence (mock)",
    refundPolicy: "Recurring subscription disputes may require bank chargeback.",
    disputeLikelihood: "LOW",
    recoveryRate: 58,
  },
};

export function getMerchantIntelligence(merchantName: string): MerchantIntelligence {
  const key = merchantName.toLowerCase();
  const hit = Object.keys(db).find((k) => key.includes(k));
  return hit
    ? db[hit]
    : {
        label: "Specter-style intelligence (mock)",
        refundPolicy: "Standard refund request path with manual review.",
        disputeLikelihood: "MEDIUM",
        recoveryRate: 62,
      };
}
