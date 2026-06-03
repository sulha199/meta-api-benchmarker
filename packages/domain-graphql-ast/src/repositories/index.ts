import type { IArticleRepository } from "./IArticleRepository";
import type { IAstResultRepository } from "./IAstResultRepository";
import type { GenericGraphQLContext } from "@repo/shared-backend";

export * from "./IArticleRepository";
export * from "./IAstResultRepository";

export interface GraphQLContext extends GenericGraphQLContext<{
  articles: {
    postgres: IArticleRepository;
    mongo: IArticleRepository;
  };
  results: {
    postgres: IAstResultRepository;
  };
}> {}
