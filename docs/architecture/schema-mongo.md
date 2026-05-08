# Architecture: @repo/schema-mongo

## 1. Package Purpose
The `schema-mongo` package acts as the **MongoDB Infrastructure Adapter**. It implements the generic database interfaces defined in `@repo/db-core` using Mongoose. 

**CRITICAL RULE:** Like the Drizzle adapter, this package sits at the outermost layer of the Hexagonal Architecture. It must **NEVER** import from `graphql`, `express`, or any other infrastructure adapter. It strictly obeys the interfaces dictated by the pure domain packages.

## 2. Core Concepts & Files

### 2.1 The Mongo Adapter (`MongoAdapter.ts`)
This is the NoSQL compilation engine. It translates the agnostic `DataQueryPlan` into Mongoose query builder syntax.
* **Path:** `packages/schema-mongo/src/adapters/MongoAdapter.ts`
* **Behavior:** Implements `IDatabaseAdapter` using a generic Mongoose `Model<TSelect>`.
* **The Compiler (`applyQueryPlan`):** This private helper translates the AST into Mongoose-compatible commands:
  * Generic `fields: ['title']` becomes `mQuery.select('title')`.
  * Generic `relations: { comments: { fields: ['commentText'] } }` becomes `mQuery.populate({ path: 'comments', select: 'commentText' })`.
* **Data Sanitization:** Mongoose returns heavy `Document` class instances. The adapter **must** call `.toObject({ virtuals: true })` on every result before returning it, stripping away Mongoose magic methods and leaving pure JavaScript objects.

### 2.2 Mongoose Schemas & Virtuals (`schema/models.ts`)
Defines the structure of the MongoDB collections.
* **Path:** `packages/schema-mongo/src/schema/models.ts`
* **Virtual Populates:** Because MongoDB lacks traditional SQL Foreign Keys, 1-to-Many relationships (like Articles to Comments) are defined using Mongoose Virtuals (e.g., `ArticleSchema.virtual('comments', { ... })`). This allows `.populate()` to function exactly like a SQL JOIN without hitting MongoDB document size limits.

### 2.3 The Concrete Repositories (`MongoArticleRepository.ts`)
Connects the pure Domain ports to the Mongo adapter.
* **Path:** `packages/schema-mongo/src/repositories/MongoArticleRepository.ts`
* **The Data Mapper:** Maps the raw Mongoose object to the pure Domain Entity. 
  * *Crucial Translation:* It handles the normalization of MongoDB's `_id` (ObjectId) to the domain's standard `id` (string).

## 3. AI Agent Instructions
When modifying or interacting with `@repo/schema-mongo`, the AI must follow these rules:
1. **Handle `_id` Properly:** Always map Mongoose's internal `_id` to the string `id` expected by pure Domain Entities inside the `toDomain` mapper.
2. **Always Strip Virtuals:** Never return a raw Mongoose `Document` out of the repository. Always ensure `.toObject({ virtuals: true })` has been called so the Domain layer receives POJOs (Plain Old JavaScript Objects).
3. **Strict Type Inference:** Use Mongoose's `InferSchemaType<typeof Schema>` to generate database types. Do not manually type Mongoose insertion/selection shapes if they can be inferred from the schema definition.
