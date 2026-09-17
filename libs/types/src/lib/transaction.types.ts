export type TransactionType = 'DEBIT' | 'CREDIT';

export type ReconciliationResult = 'MATCH' | 'MISSING' | 'MISMATCH';

export interface Transaction {
  id: string;
  paymentId: string;
  type: TransactionType;
  amount: number;
  currency: string;
  settledAt?: string;
  reconciliation?: ReconciliationResult;
}
