import type { DataQueryPlan } from '@repo/db-core';

// 1. Define the pure Comment entity
export type CommentEntity = {
  id: string;
  articleId: string;
  authorId: string;
  commentText: string;
  createdAt: Date | null; // Drizzle/Postgres timestamps usually map to Date | null
};

// 2. Define the pure Article entity (Hydrated with its relations)
export type ArticleEntity = {
  id: string;
  title: string;
  contentBody: string;
  createdAt: Date | null;

  // The nested relationship that our deep typescript utility will pick up!
  comments: CommentEntity[];
};

export interface IArticleRepository {
  getArticlesLazy(): Promise<ArticleEntity[]>;

  // Notice how we strictly pass the Entity into the QueryPlan here too!
  getArticlesOptimized(plan: DataQueryPlan<ArticleEntity>): Promise<ArticleEntity[]>;
}
