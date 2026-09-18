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

export type FraudCase = {
  __typename?: 'FraudCase';
  amount: Scalars['Float']['output'];
  beneficiaryName: Scalars['String']['output'];
  currency: Scalars['String']['output'];
  factors: Array<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  openedAt: Scalars['String']['output'];
  paymentId: Scalars['ID']['output'];
  riskLevel: RiskLevel;
  score: Scalars['Int']['output'];
  status: FraudCaseStatus;
};

export enum FraudCaseStatus {
  Cleared = 'CLEARED',
  Confirmed = 'CONFIRMED',
  Investigating = 'INVESTIGATING',
  Open = 'OPEN'
}

export type Mutation = {
  __typename?: 'Mutation';
  approveFraudCase: FraudCase;
  blockFraudCase: FraudCase;
  investigateFraudCase: FraudCase;
};


export type MutationApproveFraudCaseArgs = {
  id: Scalars['ID']['input'];
};


export type MutationBlockFraudCaseArgs = {
  id: Scalars['ID']['input'];
};


export type MutationInvestigateFraudCaseArgs = {
  id: Scalars['ID']['input'];
};

export type Query = {
  __typename?: 'Query';
  fraudCase?: Maybe<FraudCase>;
  fraudCases: Array<FraudCase>;
  highRiskFraudCases: Array<FraudCase>;
};


export type QueryFraudCaseArgs = {
  id: Scalars['ID']['input'];
};

export enum RiskLevel {
  High = 'HIGH',
  Low = 'LOW',
  Medium = 'MEDIUM'
}
