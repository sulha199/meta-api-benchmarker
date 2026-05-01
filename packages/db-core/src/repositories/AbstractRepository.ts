import { IDatabaseAdapter } from '../adapters/IDatabaseAdapter';
import type { DataQueryPlan, QueryCriteria } from '../types';

export abstract class AbstractRepository<TEntity extends Record<string, any>, TDbSelect extends Record<string, any>, TDbInsert, TDbUpdate, TRawClient> {
  constructor(
    protected adapter: IDatabaseAdapter<TEntity, TDbSelect, TDbInsert, TDbUpdate, TRawClient>
  ) {}

  // Child classes must define these mappings
  protected abstract toDomain(dbRecord: TDbSelect & Record<string, any>): TEntity;
  protected abstract toPersistence(entityData: Partial<TEntity>): TDbInsert;

  /**
   * The single, unified read method.
   * If 'plan' has relations, the adapter will handle the native database JOINs.
   */
  async findMany(query: QueryCriteria = {}, plan?: DataQueryPlan<TEntity>): Promise<TEntity[]> {
    // 1. Ask the adapter to fetch the data based on criteria and plan
    const rawData = await this.adapter.findMany(query, plan);

    // 2. Map the raw DB data into pure Domain Entities
    return rawData.map(record => this.toDomain(record));
  }
}
