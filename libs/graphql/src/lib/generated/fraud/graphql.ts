/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
import type * as Types from './base-types';

import { gql } from 'apollo-angular';
import { Injectable } from '@angular/core';
import * as Apollo from 'apollo-angular';
export type FraudCaseFieldsFragment = { id: string, paymentId: string, amount: number, currency: string, beneficiaryName: string, score: number, riskLevel: Types.RiskLevel, factors: Array<string>, status: Types.FraudCaseStatus, openedAt: string };

export type ApproveFraudCaseMutationVariables = Exact<{
  id: string | number;
}>;


export type ApproveFraudCaseMutation = { approveFraudCase: { id: string, paymentId: string, amount: number, currency: string, beneficiaryName: string, score: number, riskLevel: Types.RiskLevel, factors: Array<string>, status: Types.FraudCaseStatus, openedAt: string } };

export type BlockFraudCaseMutationVariables = Exact<{
  id: string | number;
}>;


export type BlockFraudCaseMutation = { blockFraudCase: { id: string, paymentId: string, amount: number, currency: string, beneficiaryName: string, score: number, riskLevel: Types.RiskLevel, factors: Array<string>, status: Types.FraudCaseStatus, openedAt: string } };

export type InvestigateFraudCaseMutationVariables = Exact<{
  id: string | number;
}>;


export type InvestigateFraudCaseMutation = { investigateFraudCase: { id: string, paymentId: string, amount: number, currency: string, beneficiaryName: string, score: number, riskLevel: Types.RiskLevel, factors: Array<string>, status: Types.FraudCaseStatus, openedAt: string } };

export type GetFraudCaseQueryVariables = Exact<{
  id: string | number;
}>;


export type GetFraudCaseQuery = { fraudCase: { id: string, paymentId: string, amount: number, currency: string, beneficiaryName: string, score: number, riskLevel: Types.RiskLevel, factors: Array<string>, status: Types.FraudCaseStatus, openedAt: string } | null };

export type GetFraudCasesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetFraudCasesQuery = { fraudCases: Array<{ id: string, paymentId: string, amount: number, currency: string, beneficiaryName: string, score: number, riskLevel: Types.RiskLevel, factors: Array<string>, status: Types.FraudCaseStatus, openedAt: string }> };

export type GetHighRiskFraudCasesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetHighRiskFraudCasesQuery = { highRiskFraudCases: Array<{ id: string, paymentId: string, amount: number, currency: string, beneficiaryName: string, score: number, riskLevel: Types.RiskLevel, factors: Array<string>, status: Types.FraudCaseStatus, openedAt: string }> };

export const FraudCaseFieldsFragmentDoc = gql`
    fragment FraudCaseFields on FraudCase {
  id
  paymentId
  amount
  currency
  beneficiaryName
  score
  riskLevel
  factors
  status
  openedAt
}
    `;
export const ApproveFraudCaseDocument = gql`
    mutation ApproveFraudCase($id: ID!) {
  approveFraudCase(id: $id) {
    ...FraudCaseFields
  }
}
    ${FraudCaseFieldsFragmentDoc}`;

  @Injectable({
    providedIn: 'root'
  })
  export class ApproveFraudCaseGQL extends Apollo.Mutation<ApproveFraudCaseMutation, ApproveFraudCaseMutationVariables> {
    override document = ApproveFraudCaseDocument;
    override client = 'fraud';
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const BlockFraudCaseDocument = gql`
    mutation BlockFraudCase($id: ID!) {
  blockFraudCase(id: $id) {
    ...FraudCaseFields
  }
}
    ${FraudCaseFieldsFragmentDoc}`;

  @Injectable({
    providedIn: 'root'
  })
  export class BlockFraudCaseGQL extends Apollo.Mutation<BlockFraudCaseMutation, BlockFraudCaseMutationVariables> {
    override document = BlockFraudCaseDocument;
    override client = 'fraud';
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const InvestigateFraudCaseDocument = gql`
    mutation InvestigateFraudCase($id: ID!) {
  investigateFraudCase(id: $id) {
    ...FraudCaseFields
  }
}
    ${FraudCaseFieldsFragmentDoc}`;

  @Injectable({
    providedIn: 'root'
  })
  export class InvestigateFraudCaseGQL extends Apollo.Mutation<InvestigateFraudCaseMutation, InvestigateFraudCaseMutationVariables> {
    override document = InvestigateFraudCaseDocument;
    override client = 'fraud';
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const GetFraudCaseDocument = gql`
    query GetFraudCase($id: ID!) {
  fraudCase(id: $id) {
    ...FraudCaseFields
  }
}
    ${FraudCaseFieldsFragmentDoc}`;

  @Injectable({
    providedIn: 'root'
  })
  export class GetFraudCaseGQL extends Apollo.Query<GetFraudCaseQuery, GetFraudCaseQueryVariables> {
    override document = GetFraudCaseDocument;
    override client = 'fraud';
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const GetFraudCasesDocument = gql`
    query GetFraudCases {
  fraudCases {
    ...FraudCaseFields
  }
}
    ${FraudCaseFieldsFragmentDoc}`;

  @Injectable({
    providedIn: 'root'
  })
  export class GetFraudCasesGQL extends Apollo.Query<GetFraudCasesQuery, GetFraudCasesQueryVariables> {
    override document = GetFraudCasesDocument;
    override client = 'fraud';
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const GetHighRiskFraudCasesDocument = gql`
    query GetHighRiskFraudCases {
  highRiskFraudCases {
    ...FraudCaseFields
  }
}
    ${FraudCaseFieldsFragmentDoc}`;

  @Injectable({
    providedIn: 'root'
  })
  export class GetHighRiskFraudCasesGQL extends Apollo.Query<GetHighRiskFraudCasesQuery, GetHighRiskFraudCasesQueryVariables> {
    override document = GetHighRiskFraudCasesDocument;
    override client = 'fraud';
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }