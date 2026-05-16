import { Resolvers } from "./__generated__/resolvers-types";
import type { GraphQLContext } from "../repositories/index";

export const resolvers: Resolvers<GraphQLContext> = {
  Query: {
    getBenchmarks: async (_, args, context) => {
      const { repositories } = context;
      const { apiTopology } = repositories;
      const { postgres } = apiTopology;

      const benchmarks = await postgres.getBenchmarks(args.visitorId);
      return benchmarks as any;
    },
  },
  Mutation: {
    submitBenchmark: async (_, args, context) => {
      const { repositories } = context;
      const { apiTopology } = repositories;
      const { postgres } = apiTopology;

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

      return result as any;
    },
  },
};
