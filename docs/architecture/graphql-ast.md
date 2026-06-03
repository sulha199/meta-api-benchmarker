# Architecture: GraphQL AST Benchmark

## 1. Benchmark Purpose

The GraphQL AST benchmark is designed to physically prove the devastating network and database effects of over-fetching and unoptimized ORM data-retrieval strategies. It contrasts standard "fetch-all" behaviors with a highly optimized, compiler-driven approach.

This feature compares two specific data-fetching strategies using the `@repo/domain-graphql-ast` pure domain.

## 2. The Two Strategies

### 2.1 The Lazy Trap (Standard ORM Execution)

- **Mechanism:** The GraphQL server executes a repository method that fetches ALL columns and ALL nested relations for the requested entities, regardless of what the client actually asked for in the GraphQL query.
- **The Flaw:** This simulates common unoptimized ORM usage (e.g., `SELECT *` and deep eager-loading). It pulls massive amounts of unused data from the database into the Node.js server's RAM. The GraphQL engine then strips these unused fields before sending the response, but the database latency and network transit time between DB and Backend have already been wasted.

### 2.2 Indexed Search (AST Compiled Execution)

- **Mechanism:** Intercepts the `GraphQLResolveInfo` object _before_ any database calls are made.
- **The `DataQueryPlan`:** The `@repo/graphql-utils` package translates the AST into a strict JSON tree of requested fields and relations.
- **The Execution:** The database adapters (`@repo/adapter-drizzle` / `@repo/adapter-mongo`) natively compile this plan into a single, exact query. It fetches _only_ the bytes requested.

## 3. Core Metrics & Terminology

- **Query Complexity Score:** A numeric value representing the weight of a query, calculated by adding the number of explicitly requested scalar fields plus the number of nested relations.
- **Useful Data:** The bytes explicitly requested by the client's GraphQL query.
- **Wasted Data:** The bytes fetched from the database to the backend server that were ultimately discarded. In the "Lazy Trap," this number represents the over-fetched columns. In the "Indexed Search," this number is zero.
- **Latency Gap:** The difference between Backend Database execution time and Total Client round-trip time, primarily driven by payload size.

## 4. AI Agent Instructions

When modifying or interacting with the GraphQL AST benchmark, the AI must follow these rules:

1. **Maintain the Trap:** The "Lazy" resolver must always fetch the full set of columns and relations defined in its hardcoded `DataQueryPlan`. Never optimize it to match the client request.
2. **Focus on Payload Size:** The primary metric being tested here is the impact of excessive data retrieval on latency. Do not use manual N+1 loops (multiple queries) unless explicitly requested; rely on single-query over-fetching to demonstrate payload weight.
3. **Data Integrity:** When calculating "Wasted Data" for the premium charts, ensure you accurately measure the byte size of the raw database return object _before_ GraphQL filters it.
