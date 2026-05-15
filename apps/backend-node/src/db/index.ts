import { neon } from "@neondatabase/serverless";
import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";
import { allSchema } from "@repo/schema-drizzle";

/**
 * Initialize the Neon serverless HTTP driver.
 * We use the HTTP driver instead of TCP/WebSockets because Vercel Serverless
 * functions open and close rapidly. HTTP avoids connection exhaustion.
 */
const sql = neon(process.env.POSTGRES_URL!);

/**
 * Export the Drizzle database instance.
 * We attach our schema to enable relational queries and strong typing.
 */
export const db: NeonHttpDatabase<typeof allSchema> = drizzle(sql, {
  schema: allSchema,
});
