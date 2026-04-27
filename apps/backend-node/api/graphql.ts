// apps/backend-node/api/graphql.ts
import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { db } from '../src/db';
import { visitors, benchmarks } from '../src/db/schema';
import { eq } from 'drizzle-orm';

/**
 * GraphQL Type Definitions.
 * These act as the contract between our React Frontend and Node.js Backend.
 */
const typeDefs = `
  type Visitor {
    id: ID!
    rawEmail: String
    createdAt: String!
  }

  type Benchmark {
    id: ID!
    visitorId: ID!
    environment: String!
    payloadSizeKb: Int!
    totalRoundtripMs: Int
    backendParseMs: Int
    backendDbInsertMs: Int
    createdAt: String!
  }

  type Query {
    ping: String!
    getBenchmarks(visitorId: ID!): [Benchmark!]!
  }

  type Mutation {
    registerVisitor(id: ID!, rawEmail: String): Visitor!
    submitBenchmark(
      visitorId: ID!
      environment: String!
      payloadSizeKb: Int!
      dummyPayload: String
      totalRoundtripMs: Int
      backendParseMs: Int
      backendDbInsertMs: Int
    ): Benchmark!
  }
`;

/**
 * GraphQL Resolvers.
 * The actual implementation logic that executes database operations via Drizzle ORM.
 */
const resolvers = {
  Query: {
    // Used for the warm-up script we discussed earlier
    ping: () => 'Pong! Competitor A is ready.',

    // Fetch benchmark history for a specific visitor
    getBenchmarks: async (_: any, args: { visitorId: string }) => {
      return await db.query.benchmarks.findMany({
        where: eq(benchmarks.visitorId, args.visitorId),
        orderBy: (benchmarks, { desc }) => [desc(benchmarks.createdAt)],
      });
    },
  },

  Mutation: {
    // Register a new visitor session
    registerVisitor: async (_: any, args: { id: string, rawEmail?: string }) => {
      const result = await db.insert(visitors)
        .values({
          id: args.id, // Explicitly use the ID from React
          rawEmail: args.rawEmail
        })
        .returning();

      return result[0];
    },

    // Record the race result
    submitBenchmark: async (_: any, args: any) => {
      const result = await db.insert(benchmarks)
        .values({
          visitorId: args.visitorId,
          environment: args.environment,
          payloadSizeKb: args.payloadSizeKb,
          totalRoundtripMs: args.totalRoundtripMs,
          backendParseMs: args.backendParseMs,
          backendDbInsertMs: args.backendDbInsertMs,
        })
        .returning();

      return result[0];
    },
  },
};

// Initialize the Apollo Server
const server = new ApolloServer({
  typeDefs,
  resolvers,
  // Enable introspection to allow GraphQL Playground/Sandbox to explore the API
  introspection: true
});

// 1. Create the default Apollo handler
const apolloHandler = startServerAndCreateNextHandler(server);

// 2. Create a custom wrapper to handle CORS Preflight requests
export default async function handler(req: any, res: any) {
  // Intercept the Preflight Request from the browser (OPTIONS)
  if (req.method === 'OPTIONS') {
    // Return a 200 OK response so the browser allows the subsequent POST request
    res.status(200).end();
    return;
  }

  // If it's not an OPTIONS request (e.g., POST/GET), forward it to the Apollo Server
  return apolloHandler(req, res);
}
