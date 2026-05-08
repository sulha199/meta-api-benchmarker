# Architecture: @repo/domain-visitors

## 1. Package Purpose
The `domain-visitors` package represents the **Pure Domain Layer** for the Visitor benchmarking feature. This feature specifically tests and compares the performance of direct database connections (Node.js + Drizzle/Postgres) versus backend-as-a-service HTTP connections (Supabase Data API).

**CRITICAL RULE:** Just like `domain-graphql-ast`, this package is a pure Hexagonal Architecture domain. It must **NEVER** import `supabase-js`, `drizzle-orm`, `express`, or any infrastructure libraries. It defines the rules; it does not implement them.

## 2. Core Concepts & Files

### 2.1 Pure Entities & Repository Contracts (The Ports)
These define the business data shape and how the application requests it, completely isolated from SQL rows or Supabase JSON responses.
* **Path:** `packages/domain-visitors/src/repositories/IVisitorRepository.ts`
* **Entities:** `VisitorEntity` and `VisitLogEntity`.
* **Interface:** `IVisitorRepository`. It enforces the CRUD and benchmarking contracts that the injected adapters (Drizzle or Supabase) must fulfill.

### 2.2 The GraphQL Schema & Codegen
The public API surface for the Visitor benchmark.
* **Path:** `packages/domain-visitors/src/graphql/schema.graphql` & `codegen.ts`
* **Behavior:** Uses a Code-First schema approach. `graphql-codegen` reads the `.graphql` file and the local `GraphQLContext` to generate perfectly-typed resolver signatures in `__generated__/resolvers-types.ts`.
* **Modularity:** This schema is merged dynamically with the Article schema inside the Composition Root (`apps/backend-node`).

### 2.3 The GraphQL Context
Defines the strict requirement for dependency injection specific to this feature.
* **Path:** `packages/domain-visitors/src/repositories/index.ts`
* **Behavior:** Enforces that the Composition Root must inject an implementation of `IVisitorRepository`. *(e.g., `context.repositories.visitors.postgres` or `context.repositories.visitors.supabase`)*.

## 3. AI Agent Instructions
When modifying or interacting with `@repo/domain-visitors`, the AI must follow these rules:
1. **Maintain Purity:** Never leak Supabase SDK methods, SQL, or HTTP fetch logic into this package.
2. **Use Generated Types:** Always type resolvers using the `Resolvers` type exported from `__generated__/resolvers-types.ts`. Do not use `any`.
3. **Strict Boundaries:** Do not cross-pollinate with `@repo/domain-graphql-ast`. Articles and Visitors are entirely separate domains and should only be combined at the Express server level (Composition Root).
4. **Benchmark Integrity:** When writing resolvers, accurately measure `performance.now()` before and after the repository call to maintain the integrity of the Supabase vs. Node.js benchmark.
