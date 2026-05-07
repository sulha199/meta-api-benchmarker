# Architecture: @repo/db-core

## 1. Package Purpose
The `db-core` package is the **Database Agnostic Bridge**. It defines the universal interfaces, abstract classes, and generic types that connect our Pure Domain layer to our Infrastructure layer (Drizzle/Mongoose). 

**CRITICAL RULE:** This package must **NEVER** import `drizzle-orm`, `mongoose`, `postgres`, or any other specific database library. It is strictly pure TypeScript.

## 2. Core Concepts & Types

### 2.1 The DataQueryPlan
This is the crown jewel of the system. It bridges the GraphQL AST to the Database ORMs to solve the N+1 problem and Cartesian explosions. It dictates exactly which columns to select and which relations to JOIN natively.

* **Path:** `packages/db-core/src/types.ts`
* **Behavior:** Uses Deep Recursive TypeScript to guarantee type safety. You can only request `fields` and `relations` that actually exist on the generic entity `TSelect`.
* **Structure:**
    ```typescript
    export interface DataQueryPlan<TSelect extends Record<string, any>> {
      fields: Array<NonNestedKeys<TSelect>>;
      relations?: {
        [K in NestedKeys<TSelect>]?: DataQueryPlan<ChildType>;
      };
    }
    ```

### 2.2 The Database Adapter (`IDatabaseAdapter`)
The contract that all underlying database engines must fulfill.
* **Path:** `packages/db-core/src/adapters/IDatabaseAdapter.ts`
* **Behavior:** Forces ORMs to implement unified CRUD methods.
* **Key Signature:** `findMany(query?: QueryCriteria, plan?: DataQueryPlan<TEntity>): Promise<TSelect[]>`

### 2.3 The Abstract Repository (`AbstractRepository`)
The orchestrator that enforces the **Data Mapper Pattern**. Every concrete repository in the system MUST extend this class.
* **Path:** `packages/db-core/src/repositories/AbstractRepository.ts`
* **Behavior:** It holds an instance of `IDatabaseAdapter`. It takes the raw database rows returned by the adapter and forces them through the `toDomain` mapper.
* **Mandatory Abstract Methods:**
    * `protected abstract toDomain(dbRecord: TDbSelect): TEntity;`
    * `protected abstract toPersistence(entityData: Partial<TEntity>): TDbInsert;`

## 3. AI Agent Instructions
When modifying or interacting with `@repo/db-core`, the AI must follow these rules:
1.  **Maintain Purity:** Do not introduce GraphQL, SQL, or HTTP logic here.
2.  **Respect the Generic Constraints:** When altering `DataQueryPlan` or `QueryCriteria`, ensure the `ExtractNestedType` and `PickByType` utilities remain intact to prevent scalar database columns (like `Date` or `Buffer`) from being treated as relations.
3.  **Single `findMany` Method:** Remember that we do not use separate `findManyLazy` vs `findManyOptimized`. We rely on the presence of the `plan` argument in `findMany` to trigger database-native JSON aggregation (JOINs).
