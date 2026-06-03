# Architecture: Cross-Boundary Validation Strategy

## 1. Architectural Challenge

The monorepo strictly enforces a stateless, high-performance backend (Node.js) and a stateful, reactive frontend (React).

- The frontend relies on **Zod** (`@repo/validation-zod`) for complex, stateful UI form validation.
- The backend relies on **Ajv** (`@repo/validation-ajv`) for ultra-fast, stateless JSON payload validation, strictly avoiding the memory overhead of Zod instances.

**The Challenge:** We must maintain a Single Source of Truth (SSOT) for validation schemas and data transformation logic (e.g., trimming strings, title-casing) without leaking Zod dependencies into the Node.js backend or duplicating transformer logic.

## 2. The Solution: Generation & Shared Configuration

We achieve SSOT and zero-duplication through a three-tier package structure and unified transformer configurations.

### 2.1 Package Pipeline

1. **`@repo/domain-models` (The Pure Core)**
   - Houses pure DTO interfaces and `ValueTransformer<T>` implementations.
   - Exports unified `DataModelTransformerConfig<T>` objects (defining `beforeValidate` and `afterValidate` pipelines).
   - **Consumers:** Imported by both Frontend and Backend.

2. **`@repo/schema-zod` (The SSOT)**
   - Defines the definitive Zod schemas, enforcing that they strictly match the pure DTOs from `@repo/domain-models`.
   - Contains a build script (`zod-to-json-schema`) that compiles these schemas into raw JSON and writes them to `@repo/schema-json`.
   - **Consumers:** Imported **only** by the Frontend.

3. **`@repo/schema-json` (The Backend Artifact)**
   - An auto-generated package containing only `.json` files representing the compiled Zod schemas.
   - Has zero runtime dependencies.
   - **Consumers:** Imported **only** by the Backend (Ajv).

### 2.2 Unified Transformer Configuration

Because both `validation-ajv` and `validation-zod` extend from the base classes in `@repo/validation-core`, they share the exact same execution lifecycle. We define the transformer pipeline once in `@repo/domain-models`.

```typescript
// @repo/domain-models/src/types/transformers.ts
import type { DataModelTransformerConfig } from "@repo/validation-core";

// Defined centrally for the entire DTO
export const CreateArticleTransformers: DataModelTransformerConfig<CreateArticleDTO> =
  {
    beforeValidate: {
      title: [async (val) => val?.trim() || ""],
      content: [async (val) => val?.trim() || ""],
    },
    afterValidate: {
      title: [async (val) => val?.toUpperCase() || ""], // Example logic
    },
  };
```

## 3. Implementation Example

### 3.1 The Shared Logic (@repo/domain-models)

(Already defined above in tiered package structure)

### 3.2 The Backend Integration (AjvAdapter)

The backend marries the generated JSON schema with the pure transformers using the `composeStatelessValidator` helper.

```typescript
// apps/backend-node/src/validators/ArticleValidator.ts
import { AjvAdapter } from "@repo/validation-ajv";
import { composeStatelessValidator } from "@repo/validation-core";
import {
  CreateArticleDTO,
  CreateArticleTransformers,
} from "@repo/domain-models";
import CreateArticleJson from "@repo/schema-json/src/generated/createArticle.json";

export const getCreateArticleValidator = (ajv: Ajv) =>
  composeStatelessValidator(
    new AjvAdapter<CreateArticleDTO>(ajv, CreateArticleJson),
    CreateArticleTransformers,
  );
```

### 3.3 The Frontend Integration (ZodStatefulModelAdapter)

The frontend marries the SSOT Zod schema with the exact same pure transformers using the `composeStatefulModel` helper.

```typescript
// apps/frontend-react/src/validators/FrontendArticleValidator.ts
import { ZodStatefulModelAdapter } from "@repo/validation-zod";
import { composeStatefulModel } from "@repo/validation-core";
import { CreateArticleZodSchema } from "@repo/schema-zod";
import {
  CreateArticleDTO,
  CreateArticleTransformers,
} from "@repo/domain-models";

export const createCreateArticleModel = (
  initialData: Partial<CreateArticleDTO> = {},
) =>
  composeStatefulModel(
    new ZodStatefulModelAdapter<CreateArticleDTO>(
      CreateArticleZodSchema,
      initialData,
    ),
    CreateArticleTransformers,
  );
```

## 4. Architectural Rules for AI Agents

1. **Zero Zod in Backend:** Never import `zod` or `@repo/schema-zod` inside `apps/backend-node`, `@repo/validation-ajv`, or any backend-specific package.
2. **Transform in the Domain:** All data manipulation logic (Transformers) must be written in pure TypeScript within `@repo/domain-models` and exported via `DataModelTransformerConfig`.
3. **Respect the Lifecycle:** Always map the shared configuration strictly to `_beforeValidateTransformers` (for pre-validation sanitization) and `_afterValidateTransformers` (for post-validation formatting).
