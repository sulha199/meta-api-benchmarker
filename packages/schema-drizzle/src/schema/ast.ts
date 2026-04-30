import { pgTable, uuid, text, integer, timestamp } from 'drizzle-orm/pg-core';
import { visitors } from './shared';

export const astArticles = pgTable('ast_articles', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull(),
  contentBody: text('content_body').notNull(),
  createdAt: timestamp('created_at').defaultNow()
});

export const astComments = pgTable('ast_comments', {
  id: uuid('id').defaultRandom().primaryKey(),
  articleId: uuid('article_id').references(() => astArticles.id),
  authorId: text('author_id').notNull(),
  commentText: text('comment_text').notNull(),
  createdAt: timestamp('created_at').defaultNow()
});

export const astResults = pgTable('ast_results', {
  id: uuid('id').defaultRandom().primaryKey(),
  visitorId: uuid('visitor_id').references(() => visitors.id),
  scenario: text('scenario').notNull(),
  requestCount: integer('request_count').notNull(),
  avgLatencyMs: integer('avg_latency_ms').notNull(),
  payloadSizeKb: integer('payload_size_kb').notNull(),
  createdAt: timestamp('created_at').defaultNow()
});
