# Architecture: @repo/validation-core

## 1. Package Purpose

The `validation-core` package is the **Agnostic Validation Engine** for the entire monorepo. It implements the Interface Segregation Principle by providing two distinct base classes: a lightning-fast stateless engine for backend APIs, and a rich, reactive stateful engine for frontend UIs.

**CRITICAL RULE:** This package must **NEVER** import specific validation libraries like `zod` or `ajv`. It strictly defines the abstract engines, deep path typings, and generic error interfaces.

## 2. Core Concepts & Files

### 2.1 The Stateless Engine (`AbstractStatelessDataModel.ts`)

Designed for backend/API environments (Express/GraphQL resolvers).

- **Behavior:** Takes raw HTTP payload in, applies global transformers, runs sync schema validation, runs async custom validators concurrently (`Promise.all`), and returns the cleaned data, validation errors, and `modifiedPaths`.
- **Net Change Philosophy:** The `modifiedPaths` returned by `validate()` are guaranteed to be "truthful." If a transformer modifies a value but it is later restored to its original value (e.g., during a validation failure), that path is filtered out. Only paths with a strict net difference (`!==`) from the input are reported.

### 2.2 The Stateful Engine (`AbstractStatefulDataModel.ts`)

Designed for frontend/UI environments (React/Vue forms).

- **Behavior:** Extends the stateless engine. It acts as an immutable state manager. Components use `.setValueAt(path, value)` to update specific nodes.
- **Optimized Reactivity:** Maintains `_dataChangeListeners` and `_validationChangeListeners`. When firing listeners, the engine uses a "path hint" optimization: it only executes callbacks for paths that are parents, children, or direct matches of the modified paths, drastically reducing overhead in complex forms.
- **Unified Mutation Feedback:** Methods like `setValueAt`, `pushValueAt`, and `removeValueAt` return both the `ValidationResult` and the final `modifiedPaths` array (accounting for both the manual change and all subsequent transformer effects).

### 2.3 Deep Path Typing (`types.ts`)

- **`Path<T>` and `PathValue<T, P>`:** Uses recursive template literal types to enforce strict TypeScript safety for dot-notation paths (e.g., `"users.0.email"`). All adapters must use this format for error paths.

## 3. AI Agent Instructions

When modifying or interacting with `@repo/validation-core`, the AI must follow these rules:

1. **Preserve Immutability:** Any modifications to the stateful engine's tree must route through the `setImmutable` utility.
2. **Stateless First:** If adding a feature that doesn't strictly require UI reactivity (like a new transformer type), put it in `AbstractStatelessDataModel` so the backend benefits from it too.
3. **Strict Generic Constraints:** Always enforce `P extends Path<T>` for any method interacting with nested data to ensure compile-time safety.
4. **Honest Mutation Reporting:** When extending mutation methods, always ensure `modifiedPaths` are filtered for net changes by comparing the final state against the state at the start of the operation.
5. **Reactivity Performance:** When triggering data change listeners, always provide the `modifiedPaths` hint to the internal firing method to prevent $O(N)$ listener checks.
