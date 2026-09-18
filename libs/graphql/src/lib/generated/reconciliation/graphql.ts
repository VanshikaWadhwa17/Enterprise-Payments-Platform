/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
import type * as Types from './base-types';

import { gql } from 'apollo-angular';
import { Injectable } from '@angular/core';
import * as Apollo from 'apollo-angular';
export type ReconciliationRecordFieldsFragment = { id: string, paymentId: string, bankAmount: number, processorAmount: number, settlementAmount: number, currency: string, status: Types.ReconciliationStatus, reconciledAt: string };

export type GetReconciliationRecordQueryVariables = Exact<{
  id: string | number;
}>;


export type GetReconciliationRecordQuery = { reconciliationRecord: { id: string, paymentId: string, bankAmount: number, processorAmount: number, settlementAmount: number, currency: string, status: Types.ReconciliationStatus, reconciledAt: string } | null };

export type GetReconciliationRecordsQueryVariables = Exact<{
  status?: Types.ReconciliationStatus | null | undefined;
}>;


export type GetReconciliationRecordsQuery = { reconciliationRecords: Array<{ id: string, paymentId: string, bankAmount: number, processorAmount: number, settlementAmount: number, currency: string, status: Types.ReconciliationStatus, reconciledAt: string }> };

export const ReconciliationRecordFieldsFragmentDoc = gql`
    fragment ReconciliationRecordFields on ReconciliationRecord {
  id
  paymentId
  bankAmount
  processorAmount
  settlementAmount
  currency
  status
  reconciledAt
}
    `;
export const GetReconciliationRecordDocument = gql`
    query GetReconciliationRecord($id: ID!) {
  reconciliationRecord(id: $id) {
    ...ReconciliationRecordFields
  }
}
    ${ReconciliationRecordFieldsFragmentDoc}`;

  @Injectable({
    providedIn: 'root'
  })
  export class GetReconciliationRecordGQL extends Apollo.Query<GetReconciliationRecordQuery, GetReconciliationRecordQueryVariables> {
    override document = GetReconciliationRecordDocument;
    override client = 'reconciliation';
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const GetReconciliationRecordsDocument = gql`
    query GetReconciliationRecords($status: ReconciliationStatus) {
  reconciliationRecords(status: $status) {
    ...ReconciliationRecordFields
  }
}
    ${ReconciliationRecordFieldsFragmentDoc}`;

  @Injectable({
    providedIn: 'root'
  })
  export class GetReconciliationRecordsGQL extends Apollo.Query<GetReconciliationRecordsQuery, GetReconciliationRecordsQueryVariables> {
    override document = GetReconciliationRecordsDocument;
    override client = 'reconciliation';
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }