import { relations } from 'drizzle-orm';
import { visitors, visitLogs } from './shared';
import { benchmarks } from './topology';
import { astArticles, astComments } from './ast';

export const visitorsRelations = relations(visitors, ({ many }) => ({
  logs: many(visitLogs),
  benchmarks: many(benchmarks),
}));

export const visitLogsRelations = relations(visitLogs, ({ one }) => ({
  visitor: one(visitors, {
    fields: [visitLogs.visitorId],
    references: [visitors.id],
  }),
}));

export const benchmarksRelations = relations(benchmarks, ({ one }) => ({
  visitor: one(visitors, {
    fields: [benchmarks.visitorId],
    references: [visitors.id],
  }),
}));

export const astArticlesRelations = relations(astArticles, ({ many }) => ({
  comments: many(astComments),
}));

export const astCommentsRelations = relations(astComments, ({ one }) => ({
  article: one(astArticles, {
    fields: [astComments.articleId],
    references: [astArticles.id],
  }),
}));
