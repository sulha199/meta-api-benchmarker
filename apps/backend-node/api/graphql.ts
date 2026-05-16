import { config } from "dotenv";
import { resolve } from "path";

// Look for .env in the monorepo root
config({ path: resolve(process.cwd(), "../../.env") });
import { ApolloServer } from "@apollo/server";
import { startServerAndCreateNextHandler } from "@as-integrations/next";
import mongoose from "mongoose";
import { neon } from "@neondatabase/serverless";
import postgres from "postgres";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import { drizzle as drizzlePostgres } from "drizzle-orm/postgres-js";

// 1. Import Infrastructure Adapters
import {
  DrizzleArticleRepository,
  DrizzleBenchmarkRepository,
  DrizzleVisitorRepository,
  allSchema as drizzleSchema, // Your combined Drizzle schemas
} from "@repo/schema-drizzle";
import { MongoArticleRepository } from "@repo/schema-mongo";

// 2. Import Pure Domains
import { graphql as articleGraphql } from "@repo/domain-graphql-ast";
import { graphql as visitorGraphql } from "@repo/domain-visitors";
import { graphql as topologyGraphql } from "@repo/domain-api-topology";
import { ApiTopologiRepositoryImpl } from "@repo/domain-api-topology";

import articleSchema from "@repo/domain-graphql-ast/schema";
import visitorSchema from "@repo/domain-visitors/schema";
import topologySchema from "@repo/domain-api-topology/schema";

import type { MasterGraphQLContext } from "../src/types";

const postgresUrl = process.env.POSTGRES_URL ?? "";
if (!postgresUrl) {
  throw new Error("Missing POSTGRES_URL environment variable.");
}

// @neondatabase/serverless only speaks to Neon; use TCP postgres elsewhere (local, Supabase, etc.).
const useNeonHttp = /neon\.tech/i.test(postgresUrl);

const db = useNeonHttp
  ? drizzleNeon(neon(postgresUrl), { schema: drizzleSchema })
  : drizzlePostgres(postgres(postgresUrl), { schema: drizzleSchema });

const postgresArticleRepo = new DrizzleArticleRepository(db as any);
const postgresVisitorRepo = new DrizzleVisitorRepository(db as any);
const postgresApiTopologyRepo = new ApiTopologiRepositoryImpl(
  new DrizzleBenchmarkRepository(db as any),
);

type MongooseGlobal = typeof globalThis & {
  __mongooseConn?: { promise: Promise<typeof mongoose> | null };
};

const mongooseGlobal = globalThis as MongooseGlobal;

async function ensureMongoose(): Promise<void> {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error("Missing MONGO_URI environment variable.");
  }
  if (mongoose.connection.readyState === 1) {
    return;
  }
  if (!mongooseGlobal.__mongooseConn) {
    mongooseGlobal.__mongooseConn = { promise: null };
  }
  if (!mongooseGlobal.__mongooseConn.promise) {
    mongooseGlobal.__mongooseConn.promise = mongoose
      .connect(uri)
      .catch((err) => {
        mongooseGlobal.__mongooseConn!.promise = null;
        throw err;
      });
  }
  await mongooseGlobal.__mongooseConn.promise;
}

const mongoArticleRepo = new MongoArticleRepository();

/**
 * GraphQL Type Definitions.
 * These act as the contract between our React Frontend and Node.js Backend.
 */
const typeDefs = [
  /** type Query` and `type Mutation` with dummy fields in `apps/backend-node/api/graphql.ts`.
   * These ensure a foundational schema for extensions
   **/
  `
  type Query {
    _empty: String
  }

  type Mutation {
    _empty: String
  }
  `,
  articleSchema,
  visitorSchema,
  topologySchema,
];

/**
 * GraphQL Resolvers.
 * The actual implementation logic that executes database operations via Drizzle ORM.
 */
const resolvers = {
  Query: {
    ...articleGraphql.resolvers.Query,
    ...visitorGraphql.resolvers.Query,
    ...topologyGraphql.resolvers.Query,
  },
  Mutation: {
    ...visitorGraphql.resolvers.Mutation,
    ...topologyGraphql.resolvers.Mutation,
    // // Record the race result
    // submitBenchmark: async (_: any, args: any) => {
    //   const result = await existingDb
    //     .insert(benchmarks)
    //     .values({
    //       visitorId: args.visitorId,
    //       environment: args.environment,
    //       payloadSizeKb: args.payloadSizeKb,
    //       totalRoundtripMs: args.totalRoundtripMs,
    //       backendParseMs: args.backendParseMs,
    //       backendDbInsertMs: args.backendDbInsertMs,
    //     })
    //     .returning();
    //   return result[0];
    // },
  },
};

// Initialize the Apollo Server
const server = new ApolloServer<MasterGraphQLContext>({
  typeDefs,
  resolvers,
  introspection: true,
});

// Create the default Apollo handler with context
const apolloHandler = startServerAndCreateNextHandler(server as any, {
  context: async (): Promise<MasterGraphQLContext> => ({
    repositories: {
      articles: {
        postgres: postgresArticleRepo,
        mongo: mongoArticleRepo,
      },
      visitors: {
        postgres: postgresVisitorRepo,
      },
      apiTopology: {
        postgres: postgresApiTopologyRepo,
      },
    },
  }),
});

// 2. Create a custom wrapper to handle CORS Preflight requests
export default async function handler(req: any, res: any) {
  // Intercept the Preflight Request from the browser (OPTIONS)
  if (req.method === "OPTIONS") {
    // Return a 200 OK response so the browser allows the subsequent POST request
    res.status(200).end();
    return;
  }

  try {
    await ensureMongoose();
  } catch (err) {
    console.error("[graphql] MongoDB connection failed:", err);
    res.status(500).json({
      error: "Database connection failed",
      message: err instanceof Error ? err.message : String(err),
    });
    return;
  }

  // If it's not an OPTIONS request (e.g., POST/GET), forward it to the Apollo Server
  return apolloHandler(req, res);
}
