import { Environment, Resolvers } from "./__generated__/resolvers-types";
import type { GraphQLContext } from "../repositories/index";

export const resolvers: Resolvers<GraphQLContext> = {
  // Enum mapping for Apollo Server
  Environment: {
    NODE_JS: "Node.js",
    SUPABASE: "Supabase",
  },
  Query: {
    getBenchmarks: async (_, args, context) => {
      const { repositories } = context;
      const { apiTopology } = repositories;
      const { postgres } = apiTopology;

      const benchmarks = await postgres.getBenchmarks(args.visitorId);
      return benchmarks.map((b) => ({
        ...b,
        environment:
          b.environment === "Node.js"
            ? Environment.NodeJs
            : Environment.Supabase,
      }));
    },
  },
  Mutation: {
    submitBenchmark: async (_, args, context) => {
      const { repositories } = context;
      const { apiTopology } = repositories;
      const { postgres } = apiTopology;

      // args.environment will now be "Node.js" or "Supabase" thanks to the Enum mapping above
      const result = await postgres.submitBenchmark({
        visitorId: args.visitorId,
        payloadSizeKb: args.payloadSizeKb,
        environment: args.environment as any,
        totalRoundtripMs: args.totalRoundtripMs ?? null,
        backendParseMs: args.backendParseMs ?? null,
        backendDbInsertMs: args.backendDbInsertMs ?? null,
      });

      if (!result) {
        throw new Error("Failed to submit benchmark");
      }

      return {
        ...result,
        environment:
          result.environment === "Node.js"
            ? Environment.NodeJs
            : Environment.Supabase,
      };
    },
  },
};
