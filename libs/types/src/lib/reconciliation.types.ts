export type ReconciliationStatus = 'MATCHED' | 'MISSING' | 'MISMATCH' | 'DUPLICATE';

export interface ReconciliationRecord {
  id: string;
  paymentId: string;
  bankAmount: number;
  processorAmount: number;
  settlementAmount: number;
  currency: string;
  status: ReconciliationStatus;
  reconciledAt: string;
}
