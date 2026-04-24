import { pgTable, uuid, text, integer, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

/**
 * Enum for Benchmark Environment.
 * Matches the options in our Domain Model.
 */
export const environmentEnum = pgEnum('environment', ['Node.js', 'Supabase']);

/**
 * Visitors Table.
 * Stores unique identity and optional email for lead tracking.
 */
export const visitors = pgTable('visitors', {
  id: uuid('id').primaryKey().defaultRandom(),
  rawEmail: text('raw_email').unique(), // Stores the original email for internal use
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

/**
 * Visit Logs Table.
 * Tracks visitor engagement and localization data.
 */
export const visitLogs = pgTable('visit_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  visitorId: uuid('visitor_id').references(() => visitors.id, { onDelete: 'cascade' }).notNull(),
  locale: text('locale').notNull(), // e.g., 'en-US', 'id-ID', 'ar-SA'
  userAgent: text('user_agent'),
  visitedAt: timestamp('visited_at').defaultNow().notNull(),
});

/**
 * Benchmarks Table.
 * The core data for our performance comparison.
 */
export const benchmarks = pgTable('benchmarks', {
  id: uuid('id').primaryKey().defaultRandom(),
  visitorId: uuid('visitor_id').references(() => visitors.id, { onDelete: 'cascade' }).notNull(),
  environment: environmentEnum('environment').notNull(),
  payloadSizeKb: integer('payload_size_kb').notNull(),
  totalRoundtripMs: integer('total_roundtrip_ms'),
  backendParseMs: integer('backend_parse_ms'),
  backendDbInsertMs: integer('backend_db_insert_ms'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

/**
 * Relationships Definition.
 * Enhances Drizzle's query capabilities for nested data fetching.
 */
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
