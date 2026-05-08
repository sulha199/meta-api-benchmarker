# Architecture: @repo/validation-zod

## 1. Package Purpose
The `validation-zod` package is the **Frontend Infrastructure Adapter** for Zod. It implements the stateful validation contract defined in `@repo/validation-core` to provide rich, reactive form validation for the client side.

**CRITICAL RULE:** This package acts as a translation layer. It takes Zod schemas and Zod errors and wraps them in the pure interfaces dictated by `validation-core`. 

## 2. Core Concepts & Files

### 2.1 The Zod Adapter (`ZodStatefulAdapter.ts`)
The concrete implementation of our frontend data model.
* **Inheritance:** Extends `AbstractStatefulDataModel<T>`.
* **Execution:** Hooks into `performLibraryValidation` by calling `this.schema.safeParse()`.
* **Error Mapping:** Maps highly specific Zod errors into the generic `{ path: string, message: string }` array format. Zod's array path (e.g., `['users', 0, 'name']`) must be joined with dots (`users.0.name`).

## 3. AI Agent Instructions
When modifying or interacting with `@repo/validation-zod`, the AI must follow these rules:
1. **Target Environment:** Assume this package is running in a browser/UI context. Leverage the stateful `setValueAt` and subscription methods.
2. **No Backend Leakage:** Do not use `ZodStatefulAdapter` inside GraphQL resolvers or Express middleware, as it introduces unnecessary memory overhead (event listeners/Maps).
