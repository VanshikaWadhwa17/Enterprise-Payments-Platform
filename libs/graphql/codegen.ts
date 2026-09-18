import type { CodegenConfig } from '@graphql-codegen/cli';

const PAYMENT_SCHEMA = '../../backend/payment-service/src/main/resources/graphql/schema.graphqls';
const FRAUD_SCHEMA = '../../backend/fraud-service/src/main/resources/graphql/schema.graphqls';
const RECONCILIATION_SCHEMA =
  '../../backend/reconciliation-service/src/main/resources/graphql/schema.graphqls';

const config: CodegenConfig = {
  generates: {
    'src/lib/generated/payment/base-types.ts': {
      schema: PAYMENT_SCHEMA,
      plugins: ['typescript'],
    },
    'src/lib/generated/payment/graphql.ts': {
      schema: PAYMENT_SCHEMA,
      documents: ['src/lib/payment/**/*.graphql'],
      plugins: ['typescript-operations', 'typescript-apollo-angular'],
      config: {
        importSchemaTypesFrom: 'src/lib/generated/payment/base-types',
        namedClient: 'payments',
        addExplicitOverride: true,
      },
    },
    'src/lib/generated/fraud/base-types.ts': {
      schema: FRAUD_SCHEMA,
      plugins: ['typescript'],
    },
    'src/lib/generated/fraud/graphql.ts': {
      schema: FRAUD_SCHEMA,
      documents: ['src/lib/fraud/**/*.graphql'],
      plugins: ['typescript-operations', 'typescript-apollo-angular'],
      config: {
        importSchemaTypesFrom: 'src/lib/generated/fraud/base-types',
        namedClient: 'fraud',
        addExplicitOverride: true,
      },
    },
    'src/lib/generated/reconciliation/base-types.ts': {
      schema: RECONCILIATION_SCHEMA,
      plugins: ['typescript'],
    },
    'src/lib/generated/reconciliation/graphql.ts': {
      schema: RECONCILIATION_SCHEMA,
      documents: ['src/lib/reconciliation/**/*.graphql'],
      plugins: ['typescript-operations', 'typescript-apollo-angular'],
      config: {
        importSchemaTypesFrom: 'src/lib/generated/reconciliation/base-types',
        namedClient: 'reconciliation',
        addExplicitOverride: true,
      },
    },
  },
};

export default config;
