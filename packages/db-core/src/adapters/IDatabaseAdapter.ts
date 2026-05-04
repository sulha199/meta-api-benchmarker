import { DataQueryPlan, QueryCriteria } from "../types";

export interface IDatabaseAdapter<
  TEntity extends Record<string, any>,
  TSelect extends Record<string, any>,
  TInsert,
  TUpdate,
  TRawClient = unknown
> {
  findById(id: string, plan?: DataQueryPlan<TEntity>): Promise<TSelect | null>;
  create(data: TInsert): Promise<TSelect>;
  update(id: string, data: TUpdate): Promise<TSelect>;
  delete(id: string): Promise<boolean>;
  getRawClient(): TRawClient;
  findMany(query?: QueryCriteria<TSelect>, plan?: DataQueryPlan<TEntity>): Promise<TSelect[]>;
}
