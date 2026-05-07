import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: './src/graphql/schema.graphql',
  generates: {
    './src/graphql/__generated__/resolvers-types.ts': {
      plugins: ['typescript', 'typescript-resolvers'],
      config: {
        // Automatically injects our GraphQLContext into every resolver's 3rd argument!
        contextType: '../../repositories#GraphQLContext',
        useIndexSignature: true,
      },
    },
  },
};

export default config;
