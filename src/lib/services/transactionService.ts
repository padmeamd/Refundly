import { getDemoModeEnabled } from "@/lib/demo-mode";

export interface RawTransaction {
  id: string;
  date: string;
  merchant: string;
  amount: number;
  currency: string;
  mcc?: string;       // Merchant Category Code
  terminalId?: string;
  description: string;
  recurring: boolean;
}

export interface TransactionPage {
  transactions: RawTransaction[];
  total: number;
  scannedAt: string;
}

let TRANSACTIONS: RawTransaction[] = [];

export function seedMockTransactions(): RawTransaction[] {
  TRANSACTIONS = [
    { id: "tx-pret-1", date: "2026-04-22", merchant: "Pret A Manger", amount: 7.4, currency: "GBP", mcc: "5812", terminalId: "TRM-44821", description: "POS purchase", recurring: false },
    { id: "tx-pret-2", date: "2026-04-22", merchant: "Pret A Manger", amount: 7.4, currency: "GBP", mcc: "5812", terminalId: "TRM-44821", description: "POS purchase", recurring: false },
    { id: "tx-amazon-1", date: "2026-04-18", merchant: "Amazon", amount: 89, currency: "GBP", description: "Late Prime delivery order", recurring: false },
    { id: "tx-gym-1", date: "2026-04-01", merchant: "FitFlex Gym", amount: 49.99, currency: "GBP", description: "Monthly gym subscription", recurring: true },
    { id: "tx-gym-2", date: "2026-03-01", merchant: "FitFlex Gym", amount: 49.99, currency: "GBP", description: "Monthly gym subscription", recurring: true },
    { id: "tx-metro-1", date: "2026-04-10", merchant: "MetroBank", amount: 35, currency: "GBP", description: "Overdraft fee", recurring: false },
    { id: "tx-trainline-1", date: "2026-04-05", merchant: "Trainline", amount: 56.2, currency: "GBP", description: "Cancelled booking no refund", recurring: false },
    { id: "tx-stream-1", date: "2026-04-20", merchant: "StreamingPlus", amount: 19.99, currency: "GBP", description: "STREAMINGPLUS*UK", recurring: true },
    { id: "tx-stream-2", date: "2026-03-20", merchant: "StreamingPlus", amount: 19.99, currency: "GBP", description: "STREAMINGPLUS*UK", recurring: true },
    { id: "tx-hotel-1", date: "2026-03-28", merchant: "HotelBreaks.co.uk", amount: 155, currency: "GBP", description: "Hotel booking - non-refundable", recurring: false },
    { id: "tx-tesco-1", date: "2026-04-24", merchant: "Tesco", amount: 42.5, currency: "GBP", description: "Groceries", recurring: false },
    { id: "tx-salary-1", date: "2026-04-25", merchant: "Acme Payroll", amount: -3200, currency: "GBP", description: "Salary incoming", recurring: true },
  ];
  return TRANSACTIONS;
}

export async function getTransactions(): Promise<TransactionPage> {
  if (!getDemoModeEnabled()) {
    return {
      transactions: [],
      total: 0,
      scannedAt: new Date().toISOString(),
    };
  }
  if (!TRANSACTIONS.length) seedMockTransactions();
  await new Promise((r) => setTimeout(r, 120));
  return {
    transactions: TRANSACTIONS,
    total: TRANSACTIONS.length,
    scannedAt: new Date().toISOString(),
  };
}

// Backwards-compatible alias used in existing code.
export const fetchTransactions = getTransactions;
