# Architecture: @repo/validation-ajv

## 1. Package Purpose
The `validation-ajv` package is the **Backend Infrastructure Adapter** for Ajv. It implements the stateless validation contract defined in `@repo/validation-core` to provide ultra-high-performance validation for incoming API requests.

**CRITICAL RULE:** This package is purely functional. It must never store user data in class properties, as it will be used in highly concurrent server environments.

## 2. Core Concepts & Files

### 2.1 The Ajv Adapter (`AjvAdapter.ts`)
The concrete implementation of our backend data model.
* **Inheritance:** Extends `AbstractStatelessDataModel<T>`.
* **Performance:** Ajv compiles JSON Schemas into raw, optimized JavaScript functions. The adapter should compile the schema once upon instantiation.
* **Error Mapping:** Ajv returns errors using JSON Pointer syntax (e.g., `/users/0/name`). The adapter **must** translate this into dot-notation (`users.0.name`) to match the `validation-core` standard.

## 3. AI Agent Instructions
When modifying or interacting with `@repo/validation-ajv`, the AI must follow these rules:
1. **Target Environment:** Assume this package is running in a Node.js server. Use the `validate(rawData)` method directly.
2. **JSON Pointer Translation:** Always ensure Ajv's `instancePath` is correctly stripped of its leading slash and converted to dot notation before returning the generic `ValidationResult`.
3. **Schema Isolation:** Remember that Ajv uses JSON Schema standard, not Zod syntax. Do not attempt to pass Zod schemas into the Ajv adapter.
