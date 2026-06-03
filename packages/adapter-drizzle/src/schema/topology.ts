import { pgTable, uuid, integer, timestamp, pgEnum } from 'drizzle-orm/pg-core';

export const environmentEnum = pgEnum('environment', ['Node.js', 'Supabase']);

export const benchmarks = pgTable('benchmarks', {
  id: uuid('id').primaryKey().defaultRandom(),
  visitorId: uuid('visitor_id').notNull(),
  environment: environmentEnum('environment').notNull(),
  payloadSizeKb: integer('payload_size_kb').notNull(),
  totalRoundtripMs: integer('total_roundtrip_ms'),
  backendParseMs: integer('backend_parse_ms'),
  backendDbInsertMs: integer('backend_db_insert_ms'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
