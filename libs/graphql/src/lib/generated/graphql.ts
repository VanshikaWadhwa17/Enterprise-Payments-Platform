/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> =
  | T
  | {
      [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never;
    };
import type * as Types from './base-types';

import { gql } from 'apollo-angular';
import { Injectable } from '@angular/core';
import * as Apollo from 'apollo-angular';
export type PaymentFieldsFragment = {
  id: string;
  status: Types.PaymentStatus;
  reference: string | null;
  createdAt: string;
  updatedAt: string;
  amount: { amount: number; currency: Types.Currency };
  beneficiary: { name: string; accountNumber: string; country: string };
};

export type CreatePaymentMutationVariables = Exact<{
  input: Types.CreatePaymentInput;
}>;

export type CreatePaymentMutation = {
  createPayment: {
    id: string;
    status: Types.PaymentStatus;
    reference: string | null;
    createdAt: string;
    updatedAt: string;
    amount: { amount: number; currency: Types.Currency };
    beneficiary: { name: string; accountNumber: string; country: string };
  };
};

export type UpdatePaymentStatusMutationVariables = Exact<{
  id: string | number;
  status: Types.PaymentStatus;
}>;

export type UpdatePaymentStatusMutation = {
  updatePaymentStatus: {
    id: string;
    status: Types.PaymentStatus;
    reference: string | null;
    createdAt: string;
    updatedAt: string;
    amount: { amount: number; currency: Types.Currency };
    beneficiary: { name: string; accountNumber: string; country: string };
  };
};

export type GetPaymentQueryVariables = Exact<{
  id: string | number;
}>;

export type GetPaymentQuery = {
  payment: {
    id: string;
    status: Types.PaymentStatus;
    reference: string | null;
    createdAt: string;
    updatedAt: string;
    amount: { amount: number; currency: Types.Currency };
    beneficiary: { name: string; accountNumber: string; country: string };
  } | null;
};

export type GetPaymentsQueryVariables = Exact<{ [key: string]: never }>;

export type GetPaymentsQuery = {
  payments: Array<{
    id: string;
    status: Types.PaymentStatus;
    reference: string | null;
    createdAt: string;
    updatedAt: string;
    amount: { amount: number; currency: Types.Currency };
    beneficiary: { name: string; accountNumber: string; country: string };
  }>;
};

export const PaymentFieldsFragmentDoc = gql`
  fragment PaymentFields on Payment {
    id
    amount {
      amount
      currency
    }
    status
    beneficiary {
      name
      accountNumber
      country
    }
    reference
    createdAt
    updatedAt
  }
`;
export const CreatePaymentDocument = gql`
  mutation CreatePayment($input: CreatePaymentInput!) {
    createPayment(input: $input) {
      ...PaymentFields
    }
  }
  ${PaymentFieldsFragmentDoc}
`;

@Injectable({
  providedIn: 'root',
})
export class CreatePaymentGQL extends Apollo.Mutation<
  CreatePaymentMutation,
  CreatePaymentMutationVariables
> {
  override document = CreatePaymentDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const UpdatePaymentStatusDocument = gql`
  mutation UpdatePaymentStatus($id: ID!, $status: PaymentStatus!) {
    updatePaymentStatus(id: $id, status: $status) {
      ...PaymentFields
    }
  }
  ${PaymentFieldsFragmentDoc}
`;

@Injectable({
  providedIn: 'root',
})
export class UpdatePaymentStatusGQL extends Apollo.Mutation<
  UpdatePaymentStatusMutation,
  UpdatePaymentStatusMutationVariables
> {
  override document = UpdatePaymentStatusDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const GetPaymentDocument = gql`
  query GetPayment($id: ID!) {
    payment(id: $id) {
      ...PaymentFields
    }
  }
  ${PaymentFieldsFragmentDoc}
`;

@Injectable({
  providedIn: 'root',
})
export class GetPaymentGQL extends Apollo.Query<
  GetPaymentQuery,
  GetPaymentQueryVariables
> {
  override document = GetPaymentDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const GetPaymentsDocument = gql`
  query GetPayments {
    payments {
      ...PaymentFields
    }
  }
  ${PaymentFieldsFragmentDoc}
`;

@Injectable({
  providedIn: 'root',
})
export class GetPaymentsGQL extends Apollo.Query<
  GetPaymentsQuery,
  GetPaymentsQueryVariables
> {
  override document = GetPaymentsDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
