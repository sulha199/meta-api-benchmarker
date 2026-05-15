import type { DataQueryPlan } from "@repo/db-core";
import { DateIso } from "@repo/shared-common";

// 1. Define the pure Comment entity
export type CommentEntity = {
  id: string;
  articleId: string;
  authorId: string;
  commentText: string;
  createdAt: DateIso | null; // Drizzle/Postgres timestamps usually map to Date | null
};

export type ArticleCreatePayload = {
  title: string;
  contentBody: string;
};

export type ArticleUpdatePayload = Partial<ArticleCreatePayload>;

// 2. Define the pure Article entity (Hydrated with its relations)
export type ArticleEntity = ArticleCreatePayload & {
  id: string;

  createdAt: DateIso | null;

  // The nested relationship that our deep typescript utility will pick up!
  comments: CommentEntity[];
};

export interface IArticleRepository {
  getArticlesLazy(): Promise<ArticleEntity[]>;

  // Notice how we strictly pass the Entity into the QueryPlan here too!
  getArticlesOptimized(
    plan: DataQueryPlan<ArticleEntity>,
  ): Promise<ArticleEntity[]>;
}
