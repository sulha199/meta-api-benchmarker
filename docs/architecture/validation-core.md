# Architecture: @repo/validation-core

## 1. Package Purpose
The `validation-core` package is the **Agnostic Validation Engine** for the entire monorepo. It implements the Interface Segregation Principle by providing two distinct base classes: a lightning-fast stateless engine for backend APIs, and a rich, reactive stateful engine for frontend UIs.

**CRITICAL RULE:** This package must **NEVER** import specific validation libraries like `zod` or `ajv`. It strictly defines the abstract engines, deep path typings, and generic error interfaces.

## 2. Core Concepts & Files

### 2.1 The Stateless Engine (`AbstractStatelessDataModel.ts`)
Designed for backend/API environments (Express/GraphQL resolvers).
* **Behavior:** Takes raw HTTP payload in, applies global transformers, runs sync schema validation, runs async custom validators concurrently (`Promise.all`), and returns the cleaned data and errors.
* **Memory footprint:** Zero state. It does not instantiate pub/sub maps or store `_value` internally.

### 2.2 The Stateful Engine (`AbstractStatefulDataModel.ts`)
Designed for frontend/UI environments (React/Vue forms).
* **Behavior:** Extends the stateless engine. It acts as an immutable state manager. Components use `.setValueAt(path, value)` to update specific nodes.
* **Reactivity:** Maintains `_dataChangeListeners` and `_validationChangeListeners` to trigger granular UI re-renders without mutating untouched object references (using `setImmutable`).

### 2.3 Deep Path Typing (`types.ts`)
* **`Path<T>` and `PathValue<T, P>`:** Uses recursive template literal types to enforce strict TypeScript safety for dot-notation paths (e.g., `"users.0.email"`). All adapters must use this format for error paths.

## 3. AI Agent Instructions
When modifying or interacting with `@repo/validation-core`, the AI must follow these rules:
1. **Preserve Immutability:** Any modifications to the stateful engine's tree must route through the `setImmutable` utility.
2. **Stateless First:** If adding a feature that doesn't strictly require UI reactivity (like a new transformer type), put it in `AbstractStatelessDataModel` so the backend benefits from it too.
3. **Strict Generic Constraints:** Always enforce `P extends Path<T>` for any method interacting with nested data to ensure compile-time safety.
