# Software Requirement Specification (SRS) & High-Level Architecture

**Project:** Meta API Benchmarker

## 1. Project Overview

The Meta API Benchmarker is an enterprise-grade full-stack monorepo designed to physically test, measure, and visualize the performance differences between various backend architectures, database engines, and querying strategies.

The system provides a React-based UI that runs heavy HTTP benchmarking via Web Workers, hitting a highly optimized, dynamically injected Node.js/Express/GraphQL backend.

## 2. Core Architectural Philosophy: Hexagonal Architecture

This entire codebase strictly adheres to **Hexagonal Architecture (Ports and Adapters)**.

- **The Golden Rule:** Dependencies must ONLY point inward toward the Pure Domain packages.
- **The Domain:** Defines business rules, pure entities (POJOs), and Repository Interfaces (Ports). It knows absolutely nothing about databases, HTTP, or validation libraries.
- **The Infrastructure:** ORMs (Drizzle, Mongoose) and Validation engines (Zod, Ajv) are pushed to the absolute edge of the system as Adapters. They map raw infrastructure data into the pure Domain entities.
- **The Composition Root:** The `apps/backend-node` Express server is the only place where Infrastructure is wired to the Domain via Dependency Injection (GraphQL Context).

## 3. Core Benchmarks (Use Cases)

The system isolates its benchmarking features into dedicated domains. See their specific documentation for implementation details:

- **GraphQL AST Optimization:** Tests query compilation vs. lazy loading. (See `graphql-ast.md`)
- **API Topology:** Tests Vercel Serverless vs. Supabase Edge network latency and connection overhead under heavy concurrent load. (See `api-topology.md`)

## 4. Monorepo Map (Turborepo / pnpm)

### Applications

- `apps/frontend-react`: The React/Vite dashboard. Uses Web Workers for benchmarking so the main UI thread never freezes.
- `apps/backend-node`: The Composition Root. Express + Apollo Server. Injects Drizzle/Mongo adapters into the GraphQL context.

### Pure Domain Packages (No Infrastructure Allowed)

- `@repo/domain-graphql-ast`: Article benchmark business logic and Code-First GraphQL schema.
- `@repo/domain-visitors`: Visitor benchmark business logic and Code-First GraphQL schema.
- `@repo/validation-core`: Abstract, reactive validation engine (Stateful for UI, Stateless for APIs).
- `@repo/db-core`: Agnostic DB interfaces (`IDatabaseAdapter`) and the `DataQueryPlan` type.
- `@repo/graphql-utils`: The AST parser that builds the `DataQueryPlan`.

### Infrastructure Adapters (The Edge)

- `@repo/adapter-drizzle`: Postgres implementation. Translates `DataQueryPlan` into Drizzle's `db.query.*` Relational API.
- `@repo/adapter-mongo`: MongoDB implementation. Translates `DataQueryPlan` into Mongoose's `.select().populate()`.
- `@repo/validation-zod`: Implements the stateful validation engine using Zod (Frontend focus).
- `@repo/validation-ajv`: Implements the stateless validation engine using Ajv (Backend focus).

## 5. Global Directives for AI Agents

1. **Never break the Hexagon:** If asked to add a feature, define the Interface in the Domain first, then implement the Adapter in the specific infrastructure package.
2. **Stateless Backend:** When writing backend validation or request logic, strictly use the stateless architecture to avoid memory leaks under high concurrency.
3. **DataQueryPlan is King:** Do not bypass the generic `DataQueryPlan` to write raw SQL or Mongoose queries in the Domain.
