import type { IDatabaseAdapter } from '@repo/db-core';
import { eq } from 'drizzle-orm';

export interface DrizzleRawClient<TDb, TTable> {
  db: TDb;
  table: TTable;
}

export class DrizzleAdapter<TSelect, TInsert, TUpdate, TDb, TTable>
  implements IDatabaseAdapter<TSelect, TInsert, TUpdate, DrizzleRawClient<TDb, TTable>>
{
  constructor(
    private readonly db: TDb,
    private readonly table: TTable
  ) {}

  async findById(id: string): Promise<TSelect | null> {
    const result = await (this.db as any).select().from(this.table).where(eq((this.table as any).id, id));
    return result[0] || null;
  }

  async create(data: TInsert): Promise<TSelect> {
    const result = await (this.db as any).insert(this.table).values(data).returning();
    return result[0];
  }

  async update(id: string, data: TUpdate): Promise<TSelect> {
    const result = await (this.db as any).update(this.table).set(data).where(eq((this.table as any).id, id)).returning();
    return result[0];
  }

  async delete(id: string): Promise<boolean> {
    await (this.db as any).delete(this.table).where(eq((this.table as any).id, id));
    return true;
  }

  getRawClient(): DrizzleRawClient<TDb, TTable> {
    return { db: this.db, table: this.table };
  }
}
