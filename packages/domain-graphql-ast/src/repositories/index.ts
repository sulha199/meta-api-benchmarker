import type { IArticleRepository } from './IArticleRepository';

export * from './IArticleRepository';

export interface GraphQLContext {
  repositories: {
    postgres: IArticleRepository;
    mongo: IArticleRepository;
  };
}
