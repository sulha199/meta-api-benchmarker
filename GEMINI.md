# Meta API Benchmarker - Architecture & Context

## 1. AI Persona & Directives
@./docs/architecture/ai-role.md

## 2. System Overview & Benchmarks
@./docs/architecture/system-srs.md
@./docs/architecture/graphql-ast.md
@./docs/architecture/api-topology.md

## 3. Frontend UI & State
@./docs/architecture/frontend-react.md

## 4. Backend Composition Root (Express)
@./docs/architecture/backend-node.md

## 5. Database & Infrastructure Adapters
@./docs/architecture/db-core.md
@./docs/architecture/schema-drizzle.md
@./docs/architecture/schema-mongo.md
@./docs/architecture/adapter-supabase.md

## 6. Pure Domains (Business Logic)
@./docs/architecture/domain-graphql-ast.md
@./docs/architecture/domain-visitors.md

## 7. Validation Engine
@./docs/architecture/validation-core.md
@./docs/architecture/validation-zod.md
@./docs/architecture/validation-ajv.md

**Global Rule:** We use strict Hexagonal Architecture. Dependencies only point inward. DataQueryPlan is used to solve N+1 and Cartesian explosions natively in the database layer. For validation, the backend strictly uses stateless engines to prevent memory leaks, while the frontend uses stateful engines for reactivity.
