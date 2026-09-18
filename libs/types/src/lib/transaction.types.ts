export type TransactionType = 'DEBIT' | 'CREDIT';

export interface Transaction {
  id: string;
  paymentId: string;
  type: TransactionType;
  amount: number;
  currency: string;
  settledAt?: string;
}
