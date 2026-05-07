# Architecture: @repo/domain-graphql-ast

## 1. Package Purpose
The `domain-graphql-ast` package represents the **Pure Domain Layer** for the Article benchmarking feature. It defines the business rules, the pure data entities, the repository contracts (Ports), and the GraphQL API surface. 

**CRITICAL RULE:** This package is the center of the Hexagonal Architecture. It must **NEVER** import from `@repo/schema-drizzle`, `@repo/schema-mongo`, `express`, or any database/network libraries. Dependencies must only point inward. 

## 2. Core Concepts & Files

### 2.1 Pure Entities & Repository Contracts (The Ports)
These define what the data looks like and how the application interacts with it, completely devoid of ORM decorators or database-specific IDs (like MongoDB's `_id`).
* **Path:** `packages/domain-graphql-ast/src/repositories/IArticleRepository.ts`
* **Entities:** `ArticleEntity` and `CommentEntity`. They use pure primitive types and standard JavaScript `Date` objects.
* **Interface:** `IArticleRepository`. It enforces that any injected database adapter must implement the specific benchmarking methods:
  * `getArticlesLazy(): Promise<ArticleEntity[]>`
  * `getArticlesOptimized(plan: DataQueryPlan<ArticleEntity>): Promise<ArticleEntity[]>`

### 2.2 The GraphQL Schema & Codegen
The public API contract defined using a Code-First schema approach with automatic TypeScript inference.
* **Path:** `packages/domain-graphql-ast/src/graphql/schema.graphql` & `codegen.ts`
* **Behavior:** We strictly use `.graphql` files to prevent the schema from being tightly coupled to database definitions. 
* **Tooling:** `graphql-codegen` reads the schema and the `GraphQLContext` to generate perfectly-typed resolver signatures in `__generated__/resolvers-types.ts`.

### 2.3 The Resolvers (Benchmarking Logic)
This is where the actual benchmarking (Lazy vs. Optimized) is executed.
* **Path:** `packages/domain-graphql-ast/src/graphql/resolvers.ts`
* **Behavior:** 1. Captures `performance.now()` start time.
  2. Parses the AST using `@repo/graphql-utils`.
  3. Builds the strict `DataQueryPlan<ArticleEntity>`.
  4. Selects the injected repository from the `context` based on the `dbType` argument.
  5. Executes the query and calculates `latencyMs` and `payloadSizeKb`.

### 2.4 The GraphQL Context
Defines the strictly-typed object that the Composition Root (Express server) must fulfill to wire up the dependencies.
* **Path:** `packages/domain-graphql-ast/src/repositories/index.ts`
* **Behavior:** Groups the injected database adapters strictly under the `repositories` property (e.g., `context.repositories.postgres`) to prevent global namespace pollution.

## 3. AI Agent Instructions
When modifying or interacting with `@repo/domain-graphql-ast`, the AI must follow these rules:
1. **Maintain Purity:** Never leak SQL, Mongoose queries, or HTTP logic into this package.
2. **Use Generated Types:** Always type the `resolvers` object using the `Resolvers` type exported from `__generated__/resolvers-types.ts`. Do not use `any` for parent, args, context, or info.
3. **Context Lookup:** Always access databases via the injected context (`context.repositories.<dbName>`), never by directly importing an infrastructure class.
4. **Data Validation:** Ensure that any logic added to resolvers strictly returns data matching the `BenchmarkResult` GraphQL type.
