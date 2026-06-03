# Architecture: @repo/adapter-drizzle

## 1. Package Purpose

The `adapter-drizzle` package acts as the **PostgreSQL Infrastructure Adapter**. It implements the generic database interfaces defined in `@repo/db-core` using the Drizzle ORM.

**CRITICAL RULE:** This package must never import anything from `graphql` or `express`. It sits purely at the edge of the architecture, strictly obeying the interface contracts defined by the pure domain packages (`@repo/domain-graphql-ast` and `@repo/domain-visitors`).

## 2. Core Concepts & Files

### 2.1 The Drizzle Adapter (`DrizzleAdapter.ts`)

This is the heart of the SQL compilation engine. It translates the agnostic JSON query tree into Drizzle's specific query builder syntax.

- **Path:** `packages/adapter-drizzle/src/adapters/DrizzleAdapter.ts`
- **Behavior:** Implements the `IDatabaseAdapter` interface.
- **The Compiler (`buildDrizzleConfig`):** This private method is the most critical piece of the N+1 solution. It parses the `DataQueryPlan` and recursively builds Drizzle's Relational Queries object:
  - Generic `fields: ['title']` becomes `columns: { title: true }` (ensuring the `id` is always fetched for relationship mapping).
  - Generic `relations: { comments: { ... } }` becomes `with: { comments: { ... } }`.
  - **Result:** This single configuration object forces Drizzle to execute a highly optimized `json_agg` (JSON Aggregation) SQL query, eliminating Cartesian explosions.

### 2.2 The Drizzle Schemas (`schema/`)

These files contain the actual PostgreSQL table definitions using Drizzle's syntax.

- **Path:** `packages/adapter-drizzle/src/schema/ast.ts` (for Articles/Comments) and `schema/shared.ts` (for Visitors/Logs).
- **Behavior:** Defines columns, foreign keys, and relations. These schemas do not dictate the shape of the GraphQL API; they only dictate the shape of the database.

### 2.3 The Concrete Repositories (`DrizzleArticleRepository.ts`)

These classes connect the pure Domain ports to the Drizzle adapter.

- **Path:** `packages/adapter-drizzle/src/repositories/DrizzleArticleRepository.ts`
- **Behavior:** Extends `AbstractDrizzleRepository` and implements the pure `IArticleRepository` contract.
- **The Data Mapper:** Enforces perfect isolation by mapping the raw Drizzle `$inferSelect` database row into the pure `ArticleEntity` defined by the domain.

## 3. AI Agent Instructions

When modifying or interacting with `@repo/adapter-drizzle`, the AI must follow these rules:

1. **Maintain Interface Obedience:** Never add methods to a repository that are not explicitly defined in the Domain's `I*Repository` interface. The domain is the boss; the adapter simply obeys.
2. **Never Infer GraphQL:** Never attempt to generate or infer GraphQL types directly from Drizzle `$inferSelect` types. The Data Mapper (`toDomain`) exists specifically to decouple these two worlds.
3. **Relation Handling:** Rely on Drizzle's Relational API (`db.query.*`) for fetching relations rather than manual `LEFT JOIN` syntax, as the Relational API uses optimized JSON Aggregation natively.
