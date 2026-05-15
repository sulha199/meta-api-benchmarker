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
        mappers: {
          // Adjust the import path to wherever VisitorEntity is exported
          // Visitor: "../../repositories#VisitorEntity",
          // You might also need this if your VisitLog query returns an entity
          // VisitLog: '../../repositories#VisitLogEntity'
        },
      },
    },
  },
};

export default config;
