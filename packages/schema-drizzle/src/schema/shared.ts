import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';

export const visitors = pgTable('visitors', {
  id: uuid('id').primaryKey().defaultRandom(),
  rawEmail: text('raw_email').unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const visitLogs = pgTable('visit_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  visitorId: uuid('visitor_id').notNull(), // Foreign key defined in relations.ts
  locale: text('locale').notNull(),
  userAgent: text('user_agent'),
  visitedAt: timestamp('visited_at').defaultNow().notNull(),
});
