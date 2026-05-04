import { AbstractRepository } from "@repo/db-core";
import type { PgDatabase, PgTable, PgColumn } from 'drizzle-orm/pg-core';
import { DrizzleAdapter, DrizzleRawClient } from "../adapters";

/**
 * The Base Repository that your specific Drizzle repositories will extend.
 */
export abstract class AbstractDrizzlePgRepository<
  TEntity extends Record<string, any>,
  TDbSelect extends Record<string, any>,
  TDbInsert,
  TUpdate,
  TDb extends PgDatabase<any, any, any>,
  TTable extends PgTable<any> & { id: PgColumn<any> },
   TColumnIdName extends keyof TDbSelect
> extends AbstractRepository<TEntity, TDbSelect, TDbInsert, TUpdate, DrizzleRawClient<TDb, TTable>, TColumnIdName> {

  constructor(db: TDb, table: TTable) {
    // We instantiate the Drizzle adapter and pass it up to AbstractRepository
    super(new DrizzleAdapter(db, table));
  }
}
