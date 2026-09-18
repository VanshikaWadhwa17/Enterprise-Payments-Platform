export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
};

export type Beneficiary = {
  __typename?: 'Beneficiary';
  accountNumber: Scalars['String']['output'];
  country: Scalars['String']['output'];
  name: Scalars['String']['output'];
};

export type CreatePaymentInput = {
  amount: Scalars['Float']['input'];
  beneficiaryAccountNumber: Scalars['String']['input'];
  beneficiaryCountry: Scalars['String']['input'];
  beneficiaryName: Scalars['String']['input'];
  currency: Currency;
  idempotencyKey?: InputMaybe<Scalars['String']['input']>;
};

export enum Currency {
  Eur = 'EUR',
  Gbp = 'GBP',
  Usd = 'USD'
}

export type Money = {
  __typename?: 'Money';
  amount: Scalars['Float']['output'];
  currency: Currency;
};

export type Mutation = {
  __typename?: 'Mutation';
  createPayment: Payment;
  updatePaymentStatus: Payment;
};


export type MutationCreatePaymentArgs = {
  input: CreatePaymentInput;
};


export type MutationUpdatePaymentStatusArgs = {
  id: Scalars['ID']['input'];
  status: PaymentStatus;
};

export type Payment = {
  __typename?: 'Payment';
  amount: Money;
  beneficiary: Beneficiary;
  createdAt: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  reference?: Maybe<Scalars['String']['output']>;
  status: PaymentStatus;
  updatedAt: Scalars['String']['output'];
};

export enum PaymentStatus {
  Approved = 'APPROVED',
  Cancelled = 'CANCELLED',
  Completed = 'COMPLETED',
  Created = 'CREATED',
  Failed = 'FAILED',
  PendingApproval = 'PENDING_APPROVAL',
  Processing = 'PROCESSING',
  Rejected = 'REJECTED',
  Validated = 'VALIDATED'
}

export type Query = {
  __typename?: 'Query';
  payment?: Maybe<Payment>;
  payments: Array<Payment>;
};


export type QueryPaymentArgs = {
  id: Scalars['ID']['input'];
};
