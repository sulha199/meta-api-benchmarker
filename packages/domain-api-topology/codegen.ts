import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  schema: "./src/graphql/schema.graphql",
  generates: {
    "./src/graphql/__generated__/resolvers-types.ts": {
      plugins: ["typescript", "typescript-resolvers"],
      config: {
        // Automatically injects our GraphQLContext into every resolver's 3rd argument!
        contextType: "../../repositories#GraphQLContext",
        useIndexSignature: true,
        // Add mappers to link GraphQL types to your internal TS types/DB Entities
        mappers: {},
        enumValues: {
          Environment: {
            NODE_JS: "Node.js", // Maps the GraphQL NODE_JS to the string 'Node.js'
            SUPABASE: "Supabase", // Maps the GraphQL SUPABASE to the string 'Supabase'
          },
        },
      },
    },
  },
};

export default config;
