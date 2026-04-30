import type { IDatabaseAdapter } from '@repo/db-core/adapters';
import { eq } from 'drizzle-orm';
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
  TSelect,
  TInsert,
  TUpdate,
  TDb extends PgDatabase<any, any, any>,
  TTable extends PgTable<any> & { id: PgColumn<any> }
> implements IDatabaseAdapter<TSelect, TInsert, TUpdate, DrizzleRawClient<TDb, TTable>> {

  constructor(
    private readonly db: TDb,
    private readonly table: TTable
  ) {}

  async findById(id: string): Promise<TSelect | null> {
    // TypeScript now fully understands db.select(), table, and table.id!
    const result = await this.db
      .select()
      .from(this.table as any)
      .where(eq(this.table.id, id));

    return (result[0] as unknown as TSelect) || null;
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

  getRawClient(): DrizzleRawClient<TDb, TTable> {
    return { db: this.db, table: this.table };
  }
}
