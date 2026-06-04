import * as graphql from "./graphql";
export { graphql };
// Explicit re-exports so Node/Vercel ESM resolves named imports from the package root
// (star-export chains through ./repositories can omit runtime exports in some setups).
export type {
  CommentEntity,
  ArticleCreatePayload,
  ArticleUpdatePayload,
  ArticleEntity,
  IArticleRepository,
} from "./repositories/IArticleRepository";

export type {
  AstResultCreatePayload,
  AstResultEntity,
  IAstResultRepository,
} from "./repositories/IAstResultRepository";

export type { GraphQLContext } from "./repositories";
