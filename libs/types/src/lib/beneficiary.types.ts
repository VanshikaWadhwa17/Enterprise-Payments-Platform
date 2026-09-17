export interface Beneficiary {
  id: string;
  name: string;
  accountNumber: string;
  bankName?: string;
  country: string;
}

export type CreateBeneficiary = Omit<Beneficiary, 'id'>;
