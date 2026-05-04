import type {
  IArticleRepository,
  ArticleEntity
} from '@repo/domain-graphql-ast';

// We import our specific database schemas
import { astArticles } from '../schema/ast';
import { AbstractDrizzlePgRepository } from './AbstractDrizzleRepository';
import { PgDatabase, PgTable, PgColumn } from 'drizzle-orm/pg-core';
import { DataQueryPlan } from '@repo/db-core';

// Drizzle type inference
type DbArticleSelect = typeof astArticles.$inferSelect;
type DbArticleInsert = typeof astArticles.$inferInsert;
type DbArticleUpdate = Partial<typeof astArticles.$inferInsert>;

export class DrizzleArticleRepository
  extends AbstractDrizzlePgRepository<
    ArticleEntity,
    DbArticleSelect,
    DbArticleInsert,
    DbArticleUpdate,
    PgDatabase<any, any, any>,
    PgTable<any> & { id: PgColumn<any> },
    'id'
  >
  implements IArticleRepository
{
  protected columnIdName: 'id' = 'id';

  constructor(
    private db: PgDatabase<any, any, any>, // The raw Drizzle postgres client
  ) {
    super(db, astArticles);
  }

  // ==========================================
  // 1. DOMAIN MAPPERS (The Data Mapper Pattern)
  // ==========================================

  protected toDomain(dbRecord: DbArticleSelect & { comments?: any[] }): ArticleEntity {
    return {
      id: dbRecord.id,
      title: dbRecord.title,
      contentBody: dbRecord.contentBody,
      createdAt: dbRecord.createdAt,
      // Map nested relations safely
      comments: dbRecord.comments ? dbRecord.comments.map(c => ({
        id: c.id,
        articleId: c.articleId,
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
      // Exclude relations like 'comments' because Drizzle inserts those into a different table
    };
  }

  async getArticlesLazy(): Promise<ArticleEntity[]> {
    // implement lazy fetch with N+1 problem by fetching all fields and its relations
    const articles = await this.findMany({}, {
      fields: ['contentBody', 'title', 'createdAt', 'id'],
      relations: {
        comments: {
          fields: ['articleId', 'articleId', 'commentText', 'createdAt', 'id', ]
        },
      }
    });
    return articles.map(this.toDomain);
  }

  async getArticlesOptimized(plan: DataQueryPlan<ArticleEntity>): Promise<ArticleEntity[]> {
    const articles = await this.findMany({}, plan);
    return articles.map(this.toDomain);
  }

  // // ==========================================
  // // 2. THE LAZY FETCH (N+1 Problem)
  // // ==========================================

  // async getArticlesLazy(): Promise<ArticleEntity[]> {
  //   // 1. Fetch all articles
  //   const articles = await this.db.query.astArticles.findMany();

  //   // 2. The N+1 Problem: loop through and fetch comments
  //   const results = [];
  //   for (const article of articles) {
  //     const comments = await this.db.query.astComments.findMany({
  //       where: (astComments: any, { eq }: any) => eq(astComments.articleId, article.id)
  //     });
  //     results.push({ ...article, comments });
  //   }

  //   // Map to pure Domain Entities
  //   return results.map(record => this.toDomain(record));
  // }

  // // ==========================================
  // // 3. THE OPTIMIZED FETCH (Generic AST Compiler)
  // // ==========================================

  // async getArticlesOptimized(plan: DataQueryPlan<ArticleEntity>): Promise<ArticleEntity[]> {
  //   // 1. Compile the generic plan into Drizzle SQL Syntax
  //   const drizzleConfig = this.buildDrizzleConfig(plan);

  //   // 2. Execute the single, perfectly-optimized query
  //   const dbRecords = await this.db.query.astArticles.findMany(drizzleConfig);

  //   // 3. Map the raw DB records back to pure Domain Entities
  //   return dbRecords.map((record: any) => this.toDomain(record));
  // }

  // // ==========================================
  // // 4. PRIVATE UTILITIES
  // // ==========================================

  // /**
  //  * Recursively compiles a generic DataQueryPlan into Drizzle's db.query config.
  //  */
  // private buildDrizzleConfig(plan: DataQueryPlan<any>): Record<string, any> {
  //   const config: Record<string, any> = {};

  //   // Map strictly requested columns
  //   if (plan.fields && plan.fields.length > 0) {
  //     config.columns = {};

  //     // ALWAYS include the primary key so Drizzle can map relations in memory
  //     const columnsToSelect = new Set([...plan.fields, 'id']);

  //     for (const col of columnsToSelect) {
  //       config.columns[col] = true;
  //     }
  //   }

  //   // Recursively map nested relations using Drizzle's 'with' syntax
  //   if (plan.relations && Object.keys(plan.relations).length > 0) {
  //     config.with = {};
  //     for (const [relationName, childPlan] of Object.entries(plan.relations)) {
  //       if (childPlan) {
  //         config.with[relationName] = this.buildDrizzleConfig(childPlan);
  //       }
  //     }
  //   }

  //   return config;
  // }
}
