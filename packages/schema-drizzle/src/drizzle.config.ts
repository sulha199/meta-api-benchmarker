import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/index.ts',
  out: './drizzle', // Where the raw SQL migration files will be saved
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL || 'postgres://localhost:5432/meta_benchmark',
  },
});
