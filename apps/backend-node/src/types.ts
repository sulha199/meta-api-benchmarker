import type { IArticleRepository } from '@repo/domain-graphql-ast';
import type { IVisitorRepository } from '@repo/domain-visitors';

export interface MasterGraphQLContext {
  repositories: {
    articles: {
      postgres: IArticleRepository;
      mongo: IArticleRepository;
    };
    visitors: IVisitorRepository;
  };
}
