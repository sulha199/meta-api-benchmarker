import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import mongoose from 'mongoose';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';

// 1. Import Infrastructure Adapters
import {
  DrizzleArticleRepository,
  DrizzleVisitorRepository, // Assumes you built this
  schema // Your combined Drizzle schemas
} from '@repo/schema-drizzle';
import { MongoArticleRepository } from '@repo/schema-mongo';

// 2. Import Pure Domains
import { graphql as articleGraphql } from '@repo/domain-graphql-ast';
import { graphql as visitorGraphql } from '@repo/domain-visitors'; // Assumes you exported typeDefs/resolvers here

import type { MasterGraphQLContext } from './types';

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 4000;

  // ==========================================
  // A. INITIALIZE DATABASES & REPOSITORIES
  // ==========================================
  const pgClient = postgres(process.env.POSTGRES_URL!);
  const db = drizzle(pgClient, { schema });

  const postgresArticleRepo = new DrizzleArticleRepository(db);
  const postgresVisitorRepo = new DrizzleVisitorRepository(db);

  await mongoose.connect(process.env.MONGO_URI!);
  const mongoArticleRepo = new MongoArticleRepository();

  // ==========================================
  // B. MERGE GRAPHQL SCHEMAS & RESOLVERS
  // ==========================================
  // Apollo accepts an array of typeDefs natively
  const typeDefs = [
    articleGraphql.typeDefs,
    visitorGraphql.typeDefs,
  ];

  // We natively merge the Query objects using ES6 spread syntax
  const resolvers = {
    Query: {
      ...articleGraphql.resolvers.Query,
      ...visitorGraphql.resolvers.Query,
    },
    // If you have mutations or nested field resolvers, merge them here too
  };

  // ==========================================
  // C. START APOLLO SERVER
  // ==========================================
  const server = new ApolloServer<MasterGraphQLContext>({
    typeDefs,
    resolvers,
  });

  await server.start();

  // ==========================================
  // D. MOUNT API & INJECT DEPENDENCIES
  // ==========================================
  app.use(
    '/graphql',
    cors(),
    express.json(),
    expressMiddleware(server, {
      context: async (): Promise<MasterGraphQLContext> => ({
        repositories: {
          articles: {
            postgres: postgresArticleRepo,
            mongo: mongoArticleRepo,
          },
          visitors: {
            postgres: postgresVisitorRepo,
            // supabase: supabaseVisitorRepo
          },
        },
      }),
    })
  );

  app.listen(PORT, () => {
    console.log(`🚀 Benchmark Server ready at http://localhost:${PORT}/graphql`);
  });
}

startServer().catch(console.error);
