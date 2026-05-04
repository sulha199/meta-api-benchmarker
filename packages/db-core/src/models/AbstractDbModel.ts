import { AbstractDataModel } from '@meta/validation-core';
import type { IDatabaseAdapter } from '../adapters/IDatabaseAdapter';
import { DataQueryPlan, QueryCriteria } from '../types';

export abstract class AbstractDbModel<
  TEntity extends Record<string, any>,
  TSelect extends Record<string, any>,
  TInsert extends Record<string, any> = TSelect,
  TUpdate extends Record<string, any> = Partial<TInsert>,
  TRawClient = unknown
> extends AbstractDataModel<TSelect> {

  constructor(
    protected readonly adapter: IDatabaseAdapter<TEntity, TSelect, TInsert, TUpdate, TRawClient>
  ) {
    super();
  }

  async findById(id: string): Promise<TSelect | null> {
    return this.adapter.findById(id);
  }

  async create(data: TInsert): Promise<TSelect> {
    return this.adapter.create(data);
  }

  async update(id: string, data: TUpdate): Promise<TSelect> {
    return this.adapter.update(id, data);
  }

  async delete(id: string): Promise<boolean> {
    return this.adapter.delete(id);
  }

  protected get rawClient(): TRawClient {
    return this.adapter.getRawClient();
  }

  async findMany(query?: QueryCriteria<TSelect>): Promise<TSelect[]> {
    return this.adapter.findMany(query);
  }
}
