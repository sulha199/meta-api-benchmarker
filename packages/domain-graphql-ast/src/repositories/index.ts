import type { IArticleRepository } from "./IArticleRepository";
import type { GenericGraphQLContext } from "@repo/shared-backend";

export * from "./IArticleRepository";

export interface GraphQLContext extends GenericGraphQLContext<{
  articles: {
    postgres: IArticleRepository;
    mongo: IArticleRepository;
  };
}> {}
