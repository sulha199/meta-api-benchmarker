import { buildDataQueryPlan, getRequestedFields } from '@repo/graphql-utils';
import type { IArticleRepository } from '../repositories/IArticleRepository';

// The Context Contract that apps/backend-node must fulfill
export interface GraphQLContext {
  repositories: {
    postgres: IArticleRepository;
    mongo?: IArticleRepository;
  };
}

// Helper utility to calculate payload size in Kilobytes
const calculatePayloadSizeKb = (data: any) => {
  const jsonString = JSON.stringify(data);
  return Math.round(Buffer.byteLength(jsonString, 'utf8') / 1024);
};

export const resolvers = {
  Query: {
    /**
     * Scenario 1: The Lazy Fetch (N+1 Problem)
     */
    getArticlesLazy: async (_: any, { dbType }: { dbType: string }, context: GraphQLContext) => {
      const startMs = performance.now();

      const repository = dbType === 'MONGO' ? context.repositories.mongo : context.repositories.postgres;
      if (!repository) throw new Error(`${dbType} repository is not initialized.`);

      // Execute the unoptimized fetch
      const data = await repository.getArticlesLazy();

      const latencyMs = Math.round(performance.now() - startMs);
      const payloadSizeKb = calculatePayloadSizeKb(data);

      return { latencyMs, payloadSizeKb, data };
    },

    /**
     * Scenario 2: The AST Optimized Fetch
     */
    getArticlesOptimized: async (_: any, { dbType }: { dbType: string }, context: GraphQLContext, info: any) => {
      const startMs = performance.now();

      // 1. Parse the AST and build the universal plan!
      const astResult = getRequestedFields(info);
      const articleAst = astResult.data?.children || {};

      // We explicitly pass the expected type to enforce strict query boundaries
      const queryPlan = buildDataQueryPlan<any>(articleAst);

      // 2. Resolve the repository
      const repository = dbType === 'MONGO' ? context.repositories.mongo : context.repositories.postgres;
      if (!repository) throw new Error(`${dbType} repository is not initialized.`);

      // 3. Execute!
      const data = await repository.getArticlesOptimized(queryPlan)

      const latencyMs = Math.round(performance.now() - startMs);
      const payloadSizeKb = calculatePayloadSizeKb(data);

      return { latencyMs, payloadSizeKb, data };
    }
  }
};
