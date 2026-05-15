import { config } from "dotenv";
import { resolve } from "path";
import { defineConfig } from "drizzle-kit";

// Look for .env in the monorepo root
config({ path: resolve(__dirname, "../../.env") });

export default defineConfig({
  schema: "./src/index.ts",
  out: "./drizzle", // Where the raw SQL migration files will be saved
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.POSTGRES_URL || "postgres://localhost:5432/meta_benchmark",
  },
});
