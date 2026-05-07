import { AbstractMongoRepository } from './AbstractMongoRepository';
import type { IArticleRepository, ArticleEntity } from '@repo/domain-graphql-ast';
import { ArticleModel, ArticleSchema, CommentModel } from '../schema/models';
import type { DataQueryPlan } from '@repo/db-core';
import type { InferSchemaType, Types } from 'mongoose';

// 1. Automatically infer types from Mongoose Schema
export type DbArticleInsert = InferSchemaType<typeof ArticleSchema>;
export type DbArticleUpdate = Partial<DbArticleInsert>;

// 2. Hydrate the Select type with Mongoose internals (_id) and Virtuals (comments)
export type DbArticleSelect = DbArticleInsert & {
  _id: Types.ObjectId;
  id?: string;
  comments?: any[]; // We type this loosely here as it's just raw DB output before mapping
};

export class MongoArticleRepository
  extends AbstractMongoRepository<ArticleEntity, DbArticleSelect, DbArticleInsert, DbArticleUpdate>
  implements IArticleRepository
{
  protected columnIdName = '_id' as const;

  constructor() {
    super(ArticleModel);
  }

  protected toDomain(dbRecord: any): ArticleEntity {
    return {
      id: dbRecord._id ? dbRecord._id.toString() : dbRecord.id, // Handle mapping _id to string
      title: dbRecord.title,
      contentBody: dbRecord.contentBody,
      createdAt: dbRecord.createdAt,
      comments: dbRecord.comments ? dbRecord.comments.map((c: any) => ({
        id: c._id ? c._id.toString() : c.id,
        articleId: c.articleId.toString(),
        authorId: c.authorId,
        commentText: c.commentText,
        createdAt: c.createdAt
      })) : []
    };
  }

  protected toPersistence(entityData: Partial<ArticleEntity>): DbArticleInsert {
    return {
      title: entityData.title!,
      contentBody: entityData.contentBody!,
      createdAt: entityData.createdAt!,
    };
  }

  // ==========================================
  // BENCHMARK 1: THE N+1 PROBLEM (LAZY)
  // ==========================================
  async getArticlesLazy(): Promise<ArticleEntity[]> {
    // 1. Fetch ALL article columns (No optimization, huge packet size)
    const rawArticles = await this.adapter.findMany({}, {
      fields: ['contentBody', 'title', 'createdAt', 'id'],
      relations: {
        comments: {
          fields: ['articleId', 'articleId', 'commentText', 'createdAt', 'id', ]
        },
      }
    });

    // // 2. The N+1 Loop (Massive latency and unnecessary queries)
    // for (const article of rawArticles) {
    //   // Manually query the Comment collection per article!
    //   const comments = await CommentModel.find({ articleId: article._id }).exec();
    //   article.comments = comments.map(c => c.toObject({ virtuals: true }));
    // }

    // Map to pure Domain Entities
    return rawArticles.map(record => this.toDomain(record));
  }

  // ==========================================
  // BENCHMARK 2: THE AST SOLUTION (OPTIMIZED)
  // ==========================================
  async getArticlesOptimized(plan: DataQueryPlan<ArticleEntity>): Promise<ArticleEntity[]> {
    // 1. Pass the strict plan down.
    // Mongoose compiles this to select('title') and populate({ path: 'comments', select: 'commentText' })
    // Results in ONE query, fetching ONLY requested bytes!
    const articles = await this.findMany({}, plan);

    // Already mapped to Domain Entities by the parent `findMany`
    return articles;
  }
}
