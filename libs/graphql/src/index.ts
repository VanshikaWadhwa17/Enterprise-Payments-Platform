// Public API surface of @epp/graphql.
// Apollo Client queries, mutations, fragments, and codegen-generated operations/types.
// Namespaced per backend service to avoid collisions between each schema's
// own Query/Mutation root types.

export * as PaymentGraphQL from './lib/generated/payment';
export * as FraudGraphQL from './lib/generated/fraud';
export * as ReconciliationGraphQL from './lib/generated/reconciliation';
export * from './lib/provide-graphql';
