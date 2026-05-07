# Architecture: @repo/graphql-utils

## 1. Package Purpose
The `graphql-utils` package is the **GraphQL AST Translation Engine**. Its sole responsibility is to intercept the raw GraphQL request (`GraphQLResolveInfo`), traverse its Abstract Syntax Tree (AST), and compile it into the database-agnostic `DataQueryPlan` defined in `@repo/db-core`.

**CRITICAL RULE:** This package sits between the GraphQL library and our core interfaces. It must **NEVER** know about specific databases (Drizzle/Mongo) or specific domain entities (like `Article` or `Visitor`). It operates entirely on generic tree traversal.

## 2. Core Concepts & Files

### 2.1 The AST Parser (`astParser.ts`)
This utility digs into the highly complex `GraphQLResolveInfo` object provided by the Apollo/GraphQL engine and simplifies it into a readable dictionary.
* **Path:** `packages/graphql-utils/src/astParser.ts`
* **Behavior:** Recursively parses `FieldNode` and `SelectionSetNode` structures. It ignores GraphQL-specific metadata and outputs a clean `ParseSelectionSetResult` tree indicating exactly which fields and nested children were requested.
* **Key Function:** `getRequestedFields(info: GraphQLResolveInfo): ParseSelectionSetResult`

### 2.2 The Query Plan Builder (`queryPlanBuilder.ts`)
This acts as the bridge between the parsed GraphQL dictionary and our strictly-typed `db-core`.
* **Path:** `packages/graphql-utils/src/queryPlanBuilder.ts`
* **Behavior:** Iterates over the `ParseSelectionSetResult`. If a node has no children, it is pushed to the `fields` array. If a node has children, it recursively calls itself and attaches the result to the `relations` dictionary.
* **Key Function:** 
  ```typescript
  export function buildDataQueryPlan<TSelect extends Record<string, any>>(
    astResult: ParseSelectionSetResult
  ): DataQueryPlan<TSelect>
  ```
