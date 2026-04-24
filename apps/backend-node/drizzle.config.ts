import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

/**
 * Drizzle Configuration File.
 * This file is used by Drizzle Kit for migration generation and database pushing.
 */
export default defineConfig({
  // Path to your schema definition
  schema: './src/db/schema.ts',

  // Directory where migration SQL files will be generated
  out: './drizzle',

  // Database dialect
  dialect: 'postgresql',

  // Database credentials using environment variables
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },

  // Additional configuration for safety
  verbose: true,
  strict: true,
});
