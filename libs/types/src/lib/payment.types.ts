import type { Beneficiary, CreateBeneficiary } from './beneficiary.types';

export type Currency = 'EUR' | 'USD' | 'GBP';

export interface Money {
  amount: number;
  currency: Currency;
}

export type PaymentStatus =
  | 'CREATED'
  | 'VALIDATED'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'FAILED'
  | 'REJECTED'
  | 'CANCELLED';

export interface Payment {
  id: string;
  amount: Money;
  status: PaymentStatus;
  beneficiary: Beneficiary;
  reference?: string;
  createdAt: string;
  updatedAt: string;
}

export type CreatePayment = Omit<
  Payment,
  'id' | 'status' | 'createdAt' | 'updatedAt' | 'beneficiary'
> & {
  beneficiary: CreateBeneficiary;
};

export type PaymentSummary = Pick<Payment, 'id' | 'amount' | 'status'>;
