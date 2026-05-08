# Architecture: GraphQL AST Benchmark

## 1. Benchmark Purpose
The GraphQL AST benchmark is designed to physically prove the devastating network and database effects of the "N+1 Problem" and over-fetching, and to contrast it with a highly optimized, compiler-driven approach. 

This feature compares two specific data-fetching strategies using the `@repo/domain-graphql-ast` pure domain.

## 2. The Two Strategies

### 2.1 The Lazy Trap (Standard ORM Execution)
* **Mechanism:** The GraphQL server receives a deeply nested query (e.g., Articles with their Comments). It resolves the parent `Article` first, then transparently triggers secondary database queries for the `Comments` (either via Mongoose `.populate()` or manual Drizzle loops).
* **The Flaw:** This triggers the N+1 database problem. Furthermore, it runs `SELECT *` under the hood, pulling massive amounts of unused column data from the database into the Node.js server's RAM, only for the GraphQL engine to strip the unused fields away before sending the final HTTP response to the client.

### 2.2 Indexed Search (AST Compiled Execution)
* **Mechanism:** Intercepts the `GraphQLResolveInfo` object *before* any database calls are made. 
* **The `DataQueryPlan`:** The `@repo/graphql-utils` package translates the AST into a strict JSON tree of requested fields and relations.
* **The Execution:** The database adapters (`@repo/schema-drizzle` / `@repo/schema-mongo`) natively compile this plan into a single, exact query (e.g., using Postgres JSON Aggregation). It fetches *only* the bytes requested, in a single network round-trip.

## 3. Core Metrics & Terminology

* **Query Complexity Score:** A numeric value representing the weight of a query, calculated by adding the number of explicitly requested scalar fields plus the number of nested relations.
* **Useful Data:** The bytes explicitly requested by the client's GraphQL query.
* **Wasted Data:** The bytes fetched from the database to the backend server that were ultimately discarded. (In the Lazy Trap, this number is huge. In the Indexed Search, this number is zero).
* **Latency Gap:** The difference between Backend Database execution time and Total Client round-trip time.

## 4. AI Agent Instructions
When modifying or interacting with the GraphQL AST benchmark, the AI must follow these rules:
1. **Maintain the Trap:** Never accidentally optimize the "Lazy" resolver. It must accurately reflect standard, unoptimized ORM behavior.
2. **Context Passing:** Always ensure the `DataQueryPlan` is passed down fully intact from the resolver through the repository interfaces to the adapter layer.
3. **Data Integrity:** When calculating "Wasted Data" for the premium charts, ensure you accurately measure the byte size of the raw database return object *before* GraphQL filters it.
