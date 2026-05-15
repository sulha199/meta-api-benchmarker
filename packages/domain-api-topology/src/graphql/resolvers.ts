import { Environment, Resolvers } from "./__generated__/resolvers-types";
import type { GraphQLContext } from "../repositories/index";

export const resolvers: Resolvers<GraphQLContext> = {
  Query: {
    getBenchmarks: async (_, args, context) => {
      const { repositories } = context;
      const { apiTopology } = repositories;
      const { postgres } = apiTopology;
      const { getBenchmarks } = postgres;
      const benchmarks = await getBenchmarks(args.visitorId);
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
      const { submitBenchmark } = postgres;
      const result = await submitBenchmark({
        visitorId: args.visitorId,
        payloadSizeKb: args.payloadSizeKb,
        environment:
          args.environment === Environment.NodeJs ? "Node.js" : "Supabase",
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
