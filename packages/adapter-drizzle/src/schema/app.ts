// Import all tables from their respective files
import { visitors, visitLogs } from "./shared";
import { astArticles, astComments, astResults } from "./ast";
import { benchmarks } from "./topology";

// Import all relations (paired with tables for relational queries / client typing)
import {
  visitorsRelations,
  visitLogsRelations,
  benchmarksRelations,
  astArticlesRelations,
  astCommentsRelations,
} from "./relations";

/**
 * The combined Drizzle schema object: all tables plus their `relations(...)` exports.
 * Pass this to `drizzle(driver, { schema })` so relational `db.query.*` APIs are available.
 */
export const allSchema = {
  // tables
  // property-name should represent the table name as used in the database
  visitors: visitors,
  visit_logs: visitLogs,
  ast_articles: astArticles,
  ast_comments: astComments,
  ast_results: astResults,
  benchmarks: benchmarks,

  // relations
  visitorsRelations,
  visitLogsRelations,
  benchmarksRelations,
  astArticlesRelations,
  astCommentsRelations,
};
