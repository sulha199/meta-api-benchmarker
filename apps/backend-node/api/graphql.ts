"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// api/graphql.ts
var graphql_exports4 = {};
__export(graphql_exports4, {
  default: () => handler
});
module.exports = __toCommonJS(graphql_exports4);
var import_dotenv = require("dotenv");
var import_path = require("path");
var import_server = require("@apollo/server");
var import_next = require("@as-integrations/next");
var import_mongoose2 = __toESM(require("mongoose"));
var import_serverless = require("@neondatabase/serverless");
var import_postgres = __toESM(require("postgres"));
var import_neon_http = require("drizzle-orm/neon-http");
var import_postgres_js = require("drizzle-orm/postgres-js");

// ../../packages/schema-drizzle/src/schema/shared.ts
var import_pg_core = require("drizzle-orm/pg-core");
var visitors = (0, import_pg_core.pgTable)("visitors", {
  id: (0, import_pg_core.uuid)("id").primaryKey().defaultRandom(),
  rawEmail: (0, import_pg_core.text)("raw_email").unique(),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow().notNull()
});
var visitLogs = (0, import_pg_core.pgTable)("visit_logs", {
  id: (0, import_pg_core.uuid)("id").primaryKey().defaultRandom(),
  visitorId: (0, import_pg_core.uuid)("visitor_id").notNull(),
  // Foreign key defined in relations.ts
  locale: (0, import_pg_core.text)("locale").notNull(),
  userAgent: (0, import_pg_core.text)("user_agent"),
  visitedAt: (0, import_pg_core.timestamp)("visited_at").defaultNow().notNull()
});

// ../../packages/schema-drizzle/src/schema/ast.ts
var import_pg_core2 = require("drizzle-orm/pg-core");
var astArticles = (0, import_pg_core2.pgTable)("ast_articles", {
  id: (0, import_pg_core2.uuid)("id").defaultRandom().primaryKey(),
  title: (0, import_pg_core2.text)("title").notNull(),
  contentBody: (0, import_pg_core2.text)("content_body").notNull(),
  createdAt: (0, import_pg_core2.timestamp)("created_at").defaultNow()
});
var astComments = (0, import_pg_core2.pgTable)("ast_comments", {
  id: (0, import_pg_core2.uuid)("id").defaultRandom().primaryKey(),
  articleId: (0, import_pg_core2.uuid)("article_id").references(() => astArticles.id),
  authorId: (0, import_pg_core2.text)("author_id").notNull(),
  commentText: (0, import_pg_core2.text)("comment_text").notNull(),
  createdAt: (0, import_pg_core2.timestamp)("created_at").defaultNow()
});
var astResults = (0, import_pg_core2.pgTable)("ast_results", {
  id: (0, import_pg_core2.uuid)("id").defaultRandom().primaryKey(),
  visitorId: (0, import_pg_core2.uuid)("visitor_id").references(() => visitors.id),
  scenario: (0, import_pg_core2.text)("scenario").notNull(),
  requestCount: (0, import_pg_core2.integer)("request_count").notNull(),
  avgLatencyMs: (0, import_pg_core2.integer)("avg_latency_ms").notNull(),
  payloadSizeKb: (0, import_pg_core2.integer)("payload_size_kb").notNull(),
  createdAt: (0, import_pg_core2.timestamp)("created_at").defaultNow()
});

// ../../packages/schema-drizzle/src/schema/topology.ts
var import_pg_core3 = require("drizzle-orm/pg-core");
var environmentEnum = (0, import_pg_core3.pgEnum)("environment", ["Node.js", "Supabase"]);
var benchmarks = (0, import_pg_core3.pgTable)("benchmarks", {
  id: (0, import_pg_core3.uuid)("id").primaryKey().defaultRandom(),
  visitorId: (0, import_pg_core3.uuid)("visitor_id").notNull(),
  environment: environmentEnum("environment").notNull(),
  payloadSizeKb: (0, import_pg_core3.integer)("payload_size_kb").notNull(),
  totalRoundtripMs: (0, import_pg_core3.integer)("total_roundtrip_ms"),
  backendParseMs: (0, import_pg_core3.integer)("backend_parse_ms"),
  backendDbInsertMs: (0, import_pg_core3.integer)("backend_db_insert_ms"),
  createdAt: (0, import_pg_core3.timestamp)("created_at").defaultNow().notNull()
});

// ../../packages/schema-drizzle/src/schema/relations.ts
var import_drizzle_orm = require("drizzle-orm");
var visitorsRelations = (0, import_drizzle_orm.relations)(visitors, ({ many }) => ({
  logs: many(visitLogs),
  benchmarks: many(benchmarks)
}));
var visitLogsRelations = (0, import_drizzle_orm.relations)(visitLogs, ({ one }) => ({
  visitor: one(visitors, {
    fields: [visitLogs.visitorId],
    references: [visitors.id]
  })
}));
var benchmarksRelations = (0, import_drizzle_orm.relations)(benchmarks, ({ one }) => ({
  visitor: one(visitors, {
    fields: [benchmarks.visitorId],
    references: [visitors.id]
  })
}));
var astArticlesRelations = (0, import_drizzle_orm.relations)(astArticles, ({ many }) => ({
  comments: many(astComments)
}));
var astCommentsRelations = (0, import_drizzle_orm.relations)(astComments, ({ one }) => ({
  article: one(astArticles, {
    fields: [astComments.articleId],
    references: [astArticles.id]
  })
}));

// ../../packages/schema-drizzle/src/schema/app.ts
var allSchema = {
  // tables
  // property-name should represent the table name as used in the database
  visitors,
  visit_logs: visitLogs,
  ast_articles: astArticles,
  ast_comments: astComments,
  ast_results: astResults,
  benchmarks,
  // relations
  visitorsRelations,
  visitLogsRelations,
  benchmarksRelations,
  astArticlesRelations,
  astCommentsRelations
};

// ../../packages/schema-drizzle/src/adapters/DrizzleAdapter.ts
var import_drizzle_orm2 = require("drizzle-orm");
var DrizzleAdapter = class {
  constructor(db2, table) {
    this.db = db2;
    this.table = table;
  }
  async findById(id, plan) {
    const result = await this.findMany({ where: (0, import_drizzle_orm2.eq)(this.table.id, id) }, plan);
    return result[0] || null;
  }
  async create(data) {
    const result = await this.db.insert(this.table).values(data).returning();
    return result[0];
  }
  async update(id, data) {
    const result = await this.db.update(this.table).set(data).where((0, import_drizzle_orm2.eq)(this.table.id, id)).returning();
    return result[0];
  }
  async delete(id) {
    await this.db.delete(this.table).where((0, import_drizzle_orm2.eq)(this.table.id, id));
    return true;
  }
  async findMany(query = {}, plan) {
    const drizzleConfig = this.buildDrizzleConfig(
      plan || {
        fields: []
      }
    );
    return this.db.query[(0, import_drizzle_orm2.getTableName)(this.table)].findMany(drizzleConfig);
  }
  /**
   * THE COMPILER: Converts agnostic plan to Drizzle's format.
   */
  buildDrizzleConfig(plan) {
    const config2 = {};
    if (plan.fields && plan.fields.length > 0) {
      config2.columns = {};
      const columnsToSelect = /* @__PURE__ */ new Set([...plan.fields, "id"]);
      for (const col of columnsToSelect) config2.columns[col] = true;
    }
    if (plan.relations && Object.keys(plan.relations).length > 0) {
      config2.with = {};
      for (const [relationName, childPlan] of Object.entries(plan.relations)) {
        if (childPlan) {
          config2.with[relationName] = this.buildDrizzleConfig(childPlan);
        }
      }
    }
    return config2;
  }
  getRawClient() {
    return { db: this.db, table: this.table };
  }
};

// ../../packages/db-core/src/repositories/AbstractRepository.ts
var AbstractRepository = class {
  constructor(adapter) {
    this.adapter = adapter;
  }
  /**
   * The single, unified read method.
   * If 'plan' has relations, the adapter will handle the native database JOINs.
   */
  async findMany(query = {}, plan) {
    const rawData = await this.adapter.findMany(
      this.toAdapterQuery(query),
      plan
    );
    return rawData.map((record) => this.toDomain(record));
  }
  async findById(id, plan) {
    const result = await this.adapter.findById(id, plan);
    return result ? this.toDomain(result) : null;
  }
  async create(data, plan) {
    const result = await this.adapter.create(this.toPersistence(data));
    if (!result) return null;
    if (plan?.relations) {
      const resultWithPlan = await this.findById(
        result[this.columnIdName],
        plan
      );
      return resultWithPlan;
    }
    return this.toDomain(result);
  }
  async update(id, data, plan) {
    const result = await this.adapter.update(
      id,
      this.toPersistence(data)
    );
    if (!result) return null;
    if (plan?.relations) {
      const resultWithPlan = await this.findById(
        result[this.columnIdName],
        plan
      );
      return resultWithPlan;
    }
    return this.toDomain(result);
  }
  async delete(id) {
    return this.adapter.delete(id);
  }
};

// ../../packages/schema-drizzle/src/repositories/AbstractDrizzleRepository.ts
var AbstractDrizzlePgRepository = class extends AbstractRepository {
  constructor(db2, table) {
    super(new DrizzleAdapter(db2, table));
  }
};

// ../../packages/schema-drizzle/src/repositories/DrizzleArticleRepository.ts
var DrizzleArticleRepository = class extends AbstractDrizzlePgRepository {
  constructor(db2) {
    super(db2, astArticles);
    this.db = db2;
  }
  columnIdName = "id";
  // ==========================================
  // 1. DOMAIN MAPPERS (The Data Mapper Pattern)
  // ==========================================
  toDomain(dbRecord) {
    return {
      id: dbRecord.id,
      title: dbRecord.title,
      contentBody: dbRecord.contentBody,
      createdAt: dbRecord.createdAt ? dbRecord.createdAt.toISOString() : null,
      // Map nested relations safely
      comments: dbRecord.comments ? dbRecord.comments.map((c) => ({
        id: c.id,
        articleId: c.articleId,
        authorId: c.authorId,
        commentText: c.commentText,
        createdAt: c.createdAt ? c.createdAt.toISOString() : null
      })) : []
    };
  }
  toPersistence(entityData) {
    return {
      title: entityData.title,
      contentBody: entityData.contentBody
      // Exclude relations like 'comments' because Drizzle inserts those into a different table
    };
  }
  toAdapterQuery(query) {
    const { where, orderBy, ...rest } = query;
    const adapterWhere = { ...where };
    if (where?.createdAt) {
      adapterWhere.createdAt = new Date(where.createdAt);
    }
    return {
      ...rest,
      where: Object.keys(adapterWhere).length > 0 ? adapterWhere : void 0,
      orderBy
    };
  }
  async getArticlesLazy() {
    return this.findMany(
      {},
      {
        fields: ["contentBody", "title", "createdAt", "id"],
        relations: {
          comments: {
            fields: ["articleId", "authorId", "commentText", "createdAt", "id"]
          }
        }
      }
    );
  }
  async getArticlesOptimized(plan) {
    return this.findMany({}, plan);
  }
  // // ==========================================
  // // 2. THE LAZY FETCH (N+1 Problem)
  // // ==========================================
  // async getArticlesLazy(): Promise<ArticleEntity[]> {
  //   // 1. Fetch all articles
  //   const articles = await this.db.query.astArticles.findMany();
  //   // 2. The N+1 Problem: loop through and fetch comments
  //   const results = [];
  //   for (const article of articles) {
  //     const comments = await this.db.query.astComments.findMany({
  //       where: (astComments: any, { eq }: any) => eq(astComments.articleId, article.id)
  //     });
  //     results.push({ ...article, comments });
  //   }
  //   // Map to pure Domain Entities
  //   return results.map(record => this.toDomain(record));
  // }
  // // ==========================================
  // // 3. THE OPTIMIZED FETCH (Generic AST Compiler)
  // // ==========================================
  // async getArticlesOptimized(plan: DataQueryPlan<ArticleEntity>): Promise<ArticleEntity[]> {
  //   // 1. Compile the generic plan into Drizzle SQL Syntax
  //   const drizzleConfig = this.buildDrizzleConfig(plan);
  //   // 2. Execute the single, perfectly-optimized query
  //   const dbRecords = await this.db.query.astArticles.findMany(drizzleConfig);
  //   // 3. Map the raw DB records back to pure Domain Entities
  //   return dbRecords.map((record: any) => this.toDomain(record));
  // }
  // // ==========================================
  // // 4. PRIVATE UTILITIES
  // // ==========================================
  // /**
  //  * Recursively compiles a generic DataQueryPlan into Drizzle's db.query config.
  //  */
  // private buildDrizzleConfig(plan: DataQueryPlan<any>): Record<string, any> {
  //   const config: Record<string, any> = {};
  //   // Map strictly requested columns
  //   if (plan.fields && plan.fields.length > 0) {
  //     config.columns = {};
  //     // ALWAYS include the primary key so Drizzle can map relations in memory
  //     const columnsToSelect = new Set([...plan.fields, 'id']);
  //     for (const col of columnsToSelect) {
  //       config.columns[col] = true;
  //     }
  //   }
  //   // Recursively map nested relations using Drizzle's 'with' syntax
  //   if (plan.relations && Object.keys(plan.relations).length > 0) {
  //     config.with = {};
  //     for (const [relationName, childPlan] of Object.entries(plan.relations)) {
  //       if (childPlan) {
  //         config.with[relationName] = this.buildDrizzleConfig(childPlan);
  //       }
  //     }
  //   }
  //   return config;
  // }
};

// ../../packages/schema-drizzle/src/repositories/DrizzleVisitorRepository.ts
var DrizzleVisitorRepository = class extends AbstractDrizzlePgRepository {
  constructor(db2) {
    super(db2, visitors);
    this.db = db2;
  }
  columnIdName = "id";
  // ==========================================
  // 1. DOMAIN MAPPERS (The Data Mapper Pattern)
  // ==========================================
  toDomain(dbRecord) {
    return {
      id: dbRecord.id,
      rawEmail: dbRecord.rawEmail,
      createdAt: dbRecord.createdAt.toISOString(),
      // Map nested relations safely
      logs: dbRecord.logs ? dbRecord.logs.map((c) => ({
        id: c.id,
        locale: c.locale,
        visitorId: c.visitorId,
        userAgent: c.userAgent,
        visitedAt: c.visitedAt
      })) : []
    };
  }
  toPersistence(entityData) {
    return {
      rawEmail: entityData.rawEmail
    };
  }
  toAdapterQuery(query) {
    const { where, orderBy, ...rest } = query;
    return {
      ...rest,
      where: where ? this.toPersistence(where) : void 0,
      orderBy
    };
  }
  registerVisitor(entity) {
    return this.create(entity);
  }
};

// ../../packages/schema-drizzle/src/repositories/DrizzleBenchmarkRepository.ts
var DrizzleBenchmarkRepository = class extends AbstractDrizzlePgRepository {
  constructor(db2) {
    super(db2, benchmarks);
    this.db = db2;
  }
  columnIdName = "id";
  toDomain(dbRecord) {
    return {
      id: dbRecord.id,
      visitorId: dbRecord.visitorId,
      payloadSizeKb: dbRecord.payloadSizeKb,
      environment: dbRecord.environment,
      totalRoundtripMs: dbRecord.totalRoundtripMs,
      backendParseMs: dbRecord.backendParseMs,
      backendDbInsertMs: dbRecord.backendDbInsertMs,
      createdAt: dbRecord.createdAt.toISOString()
    };
  }
  toPersistence(entityData) {
    return {
      ...entityData,
      payloadSizeKb: entityData.payloadSizeKb,
      environment: entityData.environment,
      visitorId: entityData.visitorId,
      createdAt: entityData.createdAt ? new Date(entityData.createdAt) : void 0
    };
  }
  toAdapterQuery(query) {
    const { where, orderBy, ...rest } = query;
    const adapterWhere = { ...where };
    if (where?.createdAt) {
      adapterWhere.createdAt = new Date(where.createdAt);
    }
    const drizzleQuery = {
      ...rest,
      where: Object.keys(adapterWhere).length > 0 ? adapterWhere : void 0,
      orderBy
    };
    return drizzleQuery;
  }
};

// ../../packages/schema-mongo/src/schema/models.ts
var import_mongoose = __toESM(require("mongoose"), 1);
var CommentSchema = new import_mongoose.Schema({
  articleId: {
    type: import_mongoose.Schema.Types.ObjectId,
    ref: "Article",
    required: true,
    index: true
  },
  authorId: { type: String, required: true },
  commentText: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});
var ArticleSchema = new import_mongoose.Schema(
  {
    title: { type: String, required: true },
    contentBody: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);
ArticleSchema.virtual("comments", {
  ref: "Comment",
  localField: "_id",
  foreignField: "articleId"
});
var ArticleModel = import_mongoose.default.model(
  "Article",
  ArticleSchema,
  "articles"
);
var CommentModel = import_mongoose.default.model(
  "Comment",
  CommentSchema,
  "comments"
);

// ../../packages/schema-mongo/src/adapters/MongoAdapter.ts
var MongoAdapter = class {
  constructor(model) {
    this.model = model;
  }
  // ==========================================
  // AST TO MONGOOSE COMPILER HELPER
  // ==========================================
  applyQueryPlan(mQuery, plan) {
    if (!plan) return mQuery;
    if (plan.fields && plan.fields.length > 0) {
      mQuery = mQuery.select(plan.fields.join(" "));
    }
    if (plan.relations && Object.keys(plan.relations).length > 0) {
      for (const [relationName, childPlan] of Object.entries(plan.relations)) {
        if (!childPlan) continue;
        const typedChildPlan = childPlan;
        const populateOptions = { path: relationName };
        if (typedChildPlan.fields && typedChildPlan.fields.length > 0) {
          populateOptions.select = typedChildPlan.fields.join(" ");
        }
        mQuery = mQuery.populate(populateOptions);
      }
    }
    return mQuery;
  }
  // ==========================================
  // ADAPTER METHODS
  // ==========================================
  async findById(id, plan) {
    let mQuery = this.model.findById(id);
    mQuery = this.applyQueryPlan(mQuery, plan);
    const doc = await mQuery.exec();
    return doc ? doc.toObject({ virtuals: true }) : null;
  }
  async findMany(query = {}, plan) {
    let mQuery = this.model.find(query.where || {});
    if (query.limit) mQuery = mQuery.limit(query.limit);
    if (query.offset) mQuery = mQuery.skip(query.offset);
    mQuery = this.applyQueryPlan(mQuery, plan);
    const results = await mQuery.exec();
    return results.map((doc) => doc.toObject({ virtuals: true }));
  }
  async create(data) {
    const doc = await this.model.create(data);
    return doc.toObject({ virtuals: true });
  }
  async update(id, data) {
    const doc = await this.model.findByIdAndUpdate(id, data, { new: true }).exec();
    if (!doc) throw new Error("Document not found");
    return doc.toObject({ virtuals: true });
  }
  async delete(id) {
    const result = await this.model.findByIdAndDelete(id).exec();
    return result !== null;
  }
  getRawClient() {
    return this.model;
  }
};

// ../../packages/schema-mongo/src/repositories/AbstractMongoRepository.ts
var AbstractMongoRepository = class extends AbstractRepository {
  constructor(model) {
    super(new MongoAdapter(model));
  }
};

// ../../packages/schema-mongo/src/repositories/MongoArticleRepository.ts
var MongoArticleRepository = class extends AbstractMongoRepository {
  columnIdName = "_id";
  constructor() {
    super(ArticleModel);
  }
  toDomain(dbRecord) {
    return {
      id: dbRecord._id ? dbRecord._id.toString() : dbRecord.id,
      // Handle mapping _id to string
      title: dbRecord.title,
      contentBody: dbRecord.contentBody,
      createdAt: dbRecord.createdAt,
      comments: dbRecord.comments ? dbRecord.comments.map((c) => ({
        id: c._id ? c._id.toString() : c.id,
        articleId: c.articleId.toString(),
        authorId: c.authorId,
        commentText: c.commentText,
        createdAt: c.createdAt
      })) : []
    };
  }
  toPersistence(entityData) {
    return {
      title: entityData.title,
      contentBody: entityData.contentBody,
      createdAt: entityData.createdAt ? new Date(entityData.createdAt) : /* @__PURE__ */ new Date()
    };
  }
  // ==========================================
  // BENCHMARK 1: THE LAZY TRAP (UNOPTIMIZED PAYLOAD)
  // ==========================================
  async getArticlesLazy() {
    return this.findMany(
      {},
      {
        fields: ["contentBody", "title", "createdAt", "id"],
        relations: {
          comments: {
            fields: ["articleId", "authorId", "commentText", "createdAt", "id"]
          }
        }
      }
    );
  }
  toAdapterQuery(query) {
    const { where, limit, offset, orderBy } = query;
    const adapterWhere = { ...where };
    if (where?.createdAt) {
      adapterWhere.createdAt = new Date(where.createdAt);
    }
    return {
      where: Object.keys(adapterWhere).length > 0 ? adapterWhere : void 0,
      limit,
      offset,
      orderBy
    };
  }
  // ==========================================
  // BENCHMARK 2: THE AST SOLUTION (OPTIMIZED)
  // ==========================================
  async getArticlesOptimized(plan) {
    const articles = await this.findMany({}, plan);
    return articles;
  }
};

// ../../packages/domain-graphql-ast/src/graphql/index.ts
var graphql_exports = {};
__export(graphql_exports, {
  resolvers: () => resolvers
});

// ../../packages/graphql-utils/src/astParser.ts
function parseSelectionSet(selectionSet) {
  const fields = {};
  if (!selectionSet) return fields;
  for (const selection of selectionSet.selections) {
    if (selection.kind === "Field") {
      const fieldNode = selection;
      const fieldName = fieldNode.name.value;
      if (fieldNode.selectionSet) {
        fields[fieldName] = {
          children: parseSelectionSet(fieldNode.selectionSet)
        };
      } else {
        fields[fieldName] = {};
      }
    }
  }
  return fields;
}
function getRequestedFields(info) {
  const fieldNode = info.fieldNodes[0];
  return parseSelectionSet(fieldNode.selectionSet);
}

// ../../packages/graphql-utils/src/queryPlanBuilder.ts
function buildDataQueryPlan(astResult) {
  const fields = [];
  const relations2 = {};
  for (const [key, node] of Object.entries(astResult)) {
    if (node.children) {
      relations2[key] = buildDataQueryPlan(node.children);
    } else {
      fields.push(key);
    }
  }
  return { fields, relations: relations2 };
}

// ../../packages/domain-graphql-ast/src/graphql/resolvers.ts
var calculatePayloadSizeKb = (data) => {
  const jsonString = JSON.stringify(data);
  return Math.round(Buffer.byteLength(jsonString, "utf8") / 1024);
};
var resolvers = {
  Query: {
    /**
     * Scenario 1: The Lazy Fetch (N+1 Problem)
     */
    getArticlesLazy: async (_, { dbType }, context, info) => {
      const startMs = performance.now();
      const repository = dbType === "MONGO" /* Mongo */ ? context.repositories.articles.mongo : context.repositories.articles.postgres;
      if (!repository)
        throw new Error(`${dbType} repository is not initialized.`);
      const data = await repository.getArticlesLazy();
      const latencyMs = Math.round(performance.now() - startMs);
      const payloadSizeKb = calculatePayloadSizeKb(data);
      return { latencyMs, payloadSizeKb, data };
    },
    /**
     * Scenario 2: The AST Optimized Fetch
     */
    getArticlesOptimized: async (_, { dbType }, context, info) => {
      const startMs = performance.now();
      const astResult = getRequestedFields(info);
      const articleAst = astResult.data?.children || {};
      const queryPlan = buildDataQueryPlan(articleAst);
      const repository = dbType === "MONGO" /* Mongo */ ? context.repositories.articles.mongo : context.repositories.articles.postgres;
      if (!repository)
        throw new Error(`${dbType} repository is not initialized.`);
      const data = await repository.getArticlesOptimized(queryPlan);
      const latencyMs = Math.round(performance.now() - startMs);
      const payloadSizeKb = calculatePayloadSizeKb(data);
      return { latencyMs, payloadSizeKb, data };
    }
  }
};

// ../../packages/domain-visitors/src/graphql/index.ts
var graphql_exports2 = {};
__export(graphql_exports2, {
  resolvers: () => resolvers2
});

// ../../packages/domain-visitors/src/graphql/resolvers.ts
var resolvers2 = {
  Query: {
    getVisitor: async (_, { id }, context) => {
      const repository = context.repositories.visitors.postgres;
      return repository.findById(id);
    },
    ping: () => "Pong! Competitor A is ready."
  },
  Mutation: {
    registerVisitor: async (_, { id, rawEmail }, context) => {
      const repository = context.repositories.visitors.postgres;
      const newVisitor = {
        id,
        rawEmail: rawEmail || null,
        // rawEmail can be null
        logs: [],
        // Initialize with empty logs
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      const created = await repository.registerVisitor(newVisitor);
      if (!created) {
        throw new Error("Failed to register visitor");
      }
      return created;
    },
    updateVisitor: async (_, { id, rawEmail }, context) => {
      const repository = context.repositories.visitors.postgres;
      const updatedVisitor = await repository.update(id, { rawEmail });
      return updatedVisitor;
    },
    deleteVisitor: async (_, { id }, context) => {
      const repository = context.repositories.visitors.postgres;
      return repository.delete(id);
    }
  }
};

// ../../packages/domain-api-topology/src/graphql/index.ts
var graphql_exports3 = {};
__export(graphql_exports3, {
  resolvers: () => resolvers3
});

// ../../packages/domain-api-topology/src/graphql/resolvers.ts
var resolvers3 = {
  Query: {
    getBenchmarks: async (_, args, context) => {
      const { repositories } = context;
      const { apiTopology } = repositories;
      const { postgres: postgres2 } = apiTopology;
      const { getBenchmarks } = postgres2;
      const benchmarks2 = await getBenchmarks(args.visitorId);
      return benchmarks2.map((b) => ({
        ...b,
        environment: b.environment === "Node.js" ? "Node.js" /* NodeJs */ : "Supabase" /* Supabase */
      }));
    }
  },
  Mutation: {
    submitBenchmark: async (_, args, context) => {
      const { repositories } = context;
      const { apiTopology } = repositories;
      const { postgres: postgres2 } = apiTopology;
      const { submitBenchmark } = postgres2;
      const result = await submitBenchmark({
        visitorId: args.visitorId,
        payloadSizeKb: args.payloadSizeKb,
        environment: args.environment === "Node.js" /* NodeJs */ ? "Node.js" : "Supabase",
        totalRoundtripMs: args.totalRoundtripMs ?? null,
        backendParseMs: args.backendParseMs ?? null,
        backendDbInsertMs: args.backendDbInsertMs ?? null
      });
      if (!result) {
        throw new Error("Failed to submit benchmark");
      }
      return {
        ...result,
        environment: result.environment === "Node.js" ? "Node.js" /* NodeJs */ : "Supabase" /* Supabase */
      };
    }
  }
};

// ../../packages/domain-api-topology/src/repositories/IApiTolologyRepository.ts
var ApiTopologiRepositoryImpl = class {
  constructor(benchmarkRepo) {
    this.benchmarkRepo = benchmarkRepo;
  }
  /** should order by `createdAt` descending */
  async getBenchmarks(visitorId) {
    return this.benchmarkRepo.findMany({
      where: { visitorId },
      orderBy: { field: "createdAt", direction: "desc" }
    });
  }
  submitBenchmark(createPayload) {
    return this.benchmarkRepo.create({
      ...createPayload
    });
  }
};

// ../../packages/domain-graphql-ast/src/graphql/schema.graphql
var schema_default = "type Comment {\n  id: ID!\n  authorId: String!\n  commentText: String!\n  createdAt: String\n}\n\ntype Article {\n  id: ID!\n  title: String!\n  contentBody: String!\n  createdAt: String\n  comments: [Comment!]!\n}\n\ntype BenchmarkResult {\n  latencyMs: Int!\n  payloadSizeKb: Float!\n  data: [Article!]!\n}\n\nenum DatabaseType {\n  POSTGRES\n  MONGO\n}\n\ntype Query {\n  getArticlesLazy(dbType: DatabaseType!): BenchmarkResult!\n  getArticlesOptimized(dbType: DatabaseType!): BenchmarkResult!\n}\n";

// ../../packages/domain-visitors/src/graphql/schema.graphql
var schema_default2 = "# packages/domain-visitors/src/graphql/schema.graphql\ntype VisitLog {\n  id: ID!\n  visitorId: ID!\n  locale: String!\n  userAgent: String\n  visitedAt: String!\n}\n\ntype Visitor {\n  id: ID!\n  rawEmail: String\n  logs: [VisitLog!]!\n  createdAt: String!\n}\n\nextend type Query {\n  getVisitor(id: ID!): Visitor\n  ping: String!\n}\n\nextend type Mutation {\n  registerVisitor(id: ID!, rawEmail: String): Visitor!\n  updateVisitor(id: ID!, rawEmail: String): Visitor\n  deleteVisitor(id: ID!): Boolean!\n}\n";

// ../../packages/domain-api-topology/src/graphql/schema.graphql
var schema_default3 = "enum Environment {\n  NODE_JS\n  SUPABASE\n}\n\ntype Benchmark {\n  id: ID!\n  visitorId: ID!\n  environment: Environment!\n  payloadSizeKb: Int!\n  totalRoundtripMs: Int\n  backendParseMs: Int\n  backendDbInsertMs: Int\n  createdAt: String!\n}\n\nextend type Query {\n  getBenchmarks(visitorId: ID!): [Benchmark!]!\n}\n\nextend type Mutation {\n  submitBenchmark(\n    visitorId: ID!\n    environment: Environment!\n    payloadSizeKb: Int!\n    dummyPayload: String\n    totalRoundtripMs: Int\n    backendParseMs: Int\n    backendDbInsertMs: Int\n  ): Benchmark!\n}\n";

// api/graphql.ts
(0, import_dotenv.config)({ path: (0, import_path.resolve)(process.cwd(), "../../.env") });
var postgresUrl = process.env.POSTGRES_URL ?? "";
if (!postgresUrl) {
  throw new Error("Missing POSTGRES_URL environment variable.");
}
var useNeonHttp = /neon\.tech/i.test(postgresUrl);
var db = useNeonHttp ? (0, import_neon_http.drizzle)((0, import_serverless.neon)(postgresUrl), { schema: allSchema }) : (0, import_postgres_js.drizzle)((0, import_postgres.default)(postgresUrl), { schema: allSchema });
var postgresArticleRepo = new DrizzleArticleRepository(db);
var postgresVisitorRepo = new DrizzleVisitorRepository(db);
var postgresApiTopologyRepo = new ApiTopologiRepositoryImpl(
  new DrizzleBenchmarkRepository(db)
);
var mongooseGlobal = globalThis;
async function ensureMongoose() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error("Missing MONGO_URI environment variable.");
  }
  if (import_mongoose2.default.connection.readyState === 1) {
    return;
  }
  if (!mongooseGlobal.__mongooseConn) {
    mongooseGlobal.__mongooseConn = { promise: null };
  }
  if (!mongooseGlobal.__mongooseConn.promise) {
    mongooseGlobal.__mongooseConn.promise = import_mongoose2.default.connect(uri).catch((err) => {
      mongooseGlobal.__mongooseConn.promise = null;
      throw err;
    });
  }
  await mongooseGlobal.__mongooseConn.promise;
}
var mongoArticleRepo = new MongoArticleRepository();
var typeDefs = [
  /** type Query` and `type Mutation` with dummy fields in `apps/backend-node/api/graphql.ts`.
   * These ensure a foundational schema for extensions
   **/
  `
  type Query {
    _empty: String
  }

  type Mutation {
    _empty: String
  }
  `,
  schema_default,
  schema_default2,
  schema_default3
];
var resolvers4 = {
  Query: {
    ...graphql_exports.resolvers.Query,
    ...graphql_exports2.resolvers.Query,
    ...graphql_exports3.resolvers.Query
  },
  Mutation: {
    ...graphql_exports2.resolvers.Mutation,
    ...graphql_exports3.resolvers.Mutation
    // // Record the race result
    // submitBenchmark: async (_: any, args: any) => {
    //   const result = await existingDb
    //     .insert(benchmarks)
    //     .values({
    //       visitorId: args.visitorId,
    //       environment: args.environment,
    //       payloadSizeKb: args.payloadSizeKb,
    //       totalRoundtripMs: args.totalRoundtripMs,
    //       backendParseMs: args.backendParseMs,
    //       backendDbInsertMs: args.backendDbInsertMs,
    //     })
    //     .returning();
    //   return result[0];
    // },
  }
};
var server = new import_server.ApolloServer({
  typeDefs,
  resolvers: resolvers4,
  introspection: true
});
var apolloHandler = (0, import_next.startServerAndCreateNextHandler)(server, {
  context: async () => ({
    repositories: {
      articles: {
        postgres: postgresArticleRepo,
        mongo: mongoArticleRepo
      },
      visitors: {
        postgres: postgresVisitorRepo
      },
      apiTopology: {
        postgres: postgresApiTopologyRepo
      }
    }
  })
});
async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }
  try {
    await ensureMongoose();
  } catch (err) {
    console.error("[graphql] MongoDB connection failed:", err);
    res.status(500).json({
      error: "Database connection failed",
      message: err instanceof Error ? err.message : String(err)
    });
    return;
  }
  return apolloHandler(req, res);
}
