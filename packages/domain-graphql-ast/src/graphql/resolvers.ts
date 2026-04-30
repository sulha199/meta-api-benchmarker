import { getRequestedFields } from '../utils/astParser';
import type { IArticleRepository } from '../repositories/IArticleRepository';

export interface GraphQLContext {
  repositories: {
    postgres: IArticleRepository;
    mongo?: IArticleRepository; // Optional for now!
  };
}

export const resolvers = {
  Query: {
    getArticlesOptimized: async (_: any, args: { dbType: string }, context: GraphQLContext, info: any) => {
      const requestedFields = getRequestedFields(info);
      const wantsComments = !!requestedFields.data?.children?.comments;

      // The domain doesn't care HOW this was instantiated, it just uses it!
      const repository = args.dbType === 'MONGO'
        ? context.repositories.mongo
        : context.repositories.postgres;

      if (!repository) throw new Error(`${args.dbType} repository not initialized`);

      const data = await repository.getArticlesOptimized(wantsComments);

      return { latencyMs: 0, payloadSizeKb: 0, data };
    }
  }
}
