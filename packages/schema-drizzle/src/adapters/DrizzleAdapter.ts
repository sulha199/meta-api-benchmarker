import { QueryCriteria, DataQueryPlan } from '@repo/db-core';
import type { IDatabaseAdapter } from '@repo/db-core/adapters';
import { eq, getTableName } from 'drizzle-orm';
import type { PgDatabase, PgTable, PgColumn } from 'drizzle-orm/pg-core';

export interface DrizzleRawClient<TDb, TTable> {
  db: TDb;
  table: TTable;
}

/**
 * We constrain TDb to be a generic Drizzle Postgres DB client.
 * We constrain TTable to be a Drizzle Postgres table that explicitly has an 'id' column.
 */
export class DrizzleAdapter<
  TEntity extends Record<string, any>,
  TSelect extends Record<string, any>,
  TInsert,
  TUpdate,
  TDb extends PgDatabase<any, any, any>,
  TTable extends PgTable<any> & { id: PgColumn<any> }
> implements IDatabaseAdapter<TEntity, TSelect, TInsert, TUpdate, DrizzleRawClient<TDb, TTable>> {

  constructor(
    private readonly db: TDb,
    private readonly table: TTable
  ) {}

  async findById(id: string, plan?: DataQueryPlan<TEntity>): Promise<TSelect | null> {
    const result = await this.findMany({ where: eq(this.table.id, id) }, plan);
    return result[0] || null;
  }

  async create(data: TInsert): Promise<TSelect> {
    const result = await this.db
      .insert(this.table)
      // Drizzle's internal generic type mapping for Inserts is exceptionally complex.
      // We cast data to 'any' here internally, but our external TInsert generic
      // guarantees the caller is still strictly passing the correct types!
      .values(data as any)
      .returning();

    return result[0] as unknown as TSelect;
  }

  async update(id: string, data: TUpdate): Promise<TSelect> {
    const result = await this.db
      .update(this.table)
      .set(data as any)
      .where(eq(this.table.id, id))
      .returning();

    return result[0] as unknown as TSelect;
  }

  async delete(id: string): Promise<boolean> {
    await this.db
      .delete(this.table)
      .where(eq(this.table.id, id));

    return true;
  }

  async findMany(query: QueryCriteria = {}, plan?: DataQueryPlan<TEntity>): Promise<TSelect[]> {
    // 1. Compile the generic DataQueryPlan into Drizzle Relational API syntax
    const drizzleConfig = this.buildDrizzleConfig(plan || {
      fields: [],
    });

    // Note: You would also translate `query.where`, `query.limit`, etc., into Drizzle format here
    // drizzleConfig.limit = query.limit;

    // 2. Execute! Drizzle will automatically generate the JSON Aggregation SQL
    return (this.db.query)[
      getTableName(this.table)
    ].findMany(drizzleConfig);
  }

  /**
    * THE COMPILER: Converts agnostic plan to Drizzle's format.
    */
  private buildDrizzleConfig(plan: DataQueryPlan<any>): Record<string, any> {
    const config: Record<string, any> = {};

    // Map base columns
    if (plan.fields && plan.fields.length > 0) {
      config.columns = {};
      const columnsToSelect = new Set([...plan.fields, 'id']); // Always need ID for relations
      for (const col of columnsToSelect) config.columns[col] = true;
    }

    // Map relations natively using Drizzle's `with` syntax!
    if (plan.relations && Object.keys(plan.relations).length > 0) {
      config.with = {};
      for (const [relationName, childPlan] of Object.entries(plan.relations)) {
        if (childPlan) {
          // Recursive compilation for deeply nested relations
          config.with[relationName] = this.buildDrizzleConfig(childPlan);
        }
      }
    }

    return config;
  }

  getRawClient(): DrizzleRawClient<TDb, TTable> {
    return { db: this.db, table: this.table };
  }
}
