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

export type Query = {
  __typename?: 'Query';
  reconciliationRecord?: Maybe<ReconciliationRecord>;
  reconciliationRecords: Array<ReconciliationRecord>;
};


export type QueryReconciliationRecordArgs = {
  id: Scalars['ID']['input'];
};


export type QueryReconciliationRecordsArgs = {
  status?: InputMaybe<ReconciliationStatus>;
};

export type ReconciliationRecord = {
  __typename?: 'ReconciliationRecord';
  bankAmount: Scalars['Float']['output'];
  currency: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  paymentId: Scalars['String']['output'];
  processorAmount: Scalars['Float']['output'];
  reconciledAt: Scalars['String']['output'];
  settlementAmount: Scalars['Float']['output'];
  status: ReconciliationStatus;
};

export enum ReconciliationStatus {
  Duplicate = 'DUPLICATE',
  Matched = 'MATCHED',
  Mismatch = 'MISMATCH',
  Missing = 'MISSING'
}
