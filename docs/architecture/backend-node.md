# Architecture: apps/backend-node

## 1. Package Purpose

The `backend-node` package is the **Composition Root** of the backend. It is the Node.js/Express application that hosts the Apollo GraphQL endpoint. Its sole architectural responsibility is to instantiate the Infrastructure Adapters (Drizzle, Mongo, Supabase) and inject them into the Pure Domains via Dependency Injection.

## 2. Core Concepts & Files

### 2.1 Dependency Injection (GraphQL Context)

- **Path:** `apps/backend-node/src/types.ts`
- **Behavior:** Defines the `MasterGraphQLContext`. This type physically maps out the "junk drawer" protection. It groups dependencies strictly under the `repositories` namespace (e.g., `repositories.articles.postgres`).

### 2.2 Schema Merging & Server Setup

- **Path:** `apps/backend-node/src/server.ts` / `apps/backend-node/api/graphql.ts`
- **Behavior:** 1. Instantiates the database connection pools (`pgClient`, `mongoose.connect`). 2. Instantiates the Concrete Repositories (`DrizzleArticleRepository`, `MongoArticleRepository`). 3. Uses native ES6 spread syntax (`...`) to merge the Query and Mutation objects from `@repo/domain-graphql-ast` and `@repo/domain-visitors`. 4. Injects the instantiated repositories into the Express middleware context.

### 2.3 Environment Loading

- **Behavior:** The composition root acts as the bootloader for the backend and is responsible for injecting environment variables early. It strictly loads the `.env` from the **monorepo root** using `dotenv.config({ path: resolve(process.cwd(), "../../.env") })`. Do not attempt to use local `.env` files within this package.

## 3. AI Agent Instructions

When modifying or interacting with `apps/backend-node`, the AI must follow these rules:

1. **Never Write Business Logic Here:** The Composition Root contains zero business rules. It only maps routes and wires up dependencies. If you are writing an `if/else` statement about user data here, you are in the wrong package.
2. **Strict Context Typing:** If you add a new database adapter (e.g., Redis or Supabase), you MUST update `MasterGraphQLContext` in `types.ts` before injecting it into `server.ts`.
3. **Keep Domains Ignorant:** Ensure that the domains merged in the Apollo Server setup remain completely unaware of each other. Do not cross-import domain packages into one another.
