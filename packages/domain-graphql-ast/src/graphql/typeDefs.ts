export const typeDefs = `#graphql
  type Comment {
    id: ID!
    authorId: String!
    commentText: String!
    createdAt: String
  }

  type Article {
    id: ID!
    title: String!
    contentBody: String!
    createdAt: String

    # This is the trap!
    # If the frontend doesn't ask for comments, do we still fetch them?
    comments: [Comment!]!
  }

  type BenchmarkResult {
    latencyMs: Int!
    payloadSizeKb: Int!
    data: [Article!]!
  }

  type Query {
    # 1. The Lazy Trap (Standard ORM behavior)
    getArticlesLazy(dbType: String!): BenchmarkResult!

    # 2. AST Parsed (Highly optimized relational fetch)
    getArticlesOptimized(dbType: String!): BenchmarkResult!
  }
`;
