import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema:
    '../../backend/payment-service/src/main/resources/graphql/schema.graphqls',
  documents: ['src/lib/**/*.graphql'],
  generates: {
    'src/lib/generated/base-types.ts': {
      plugins: ['typescript'],
    },
    'src/lib/generated/graphql.ts': {
      plugins: ['typescript-operations', 'typescript-apollo-angular'],
      config: {
        importSchemaTypesFrom: 'src/lib/generated/base-types',
        addExplicitOverride: true,
      },
    },
  },
};

export default config;
