import type { IDatabaseAdapter } from '@repo/db-core/adapters';
import type { QueryCriteria, DataQueryPlan } from '@repo/db-core';
import mongoose,{ Model, PopulateOptions, Document } from 'mongoose';

export class MongoAdapter<
  TEntity extends Record<string, any>,
  TSelect extends Record<string, any>,
  TInsert,
  TUpdate
> implements IDatabaseAdapter<TEntity, TSelect, TInsert, TUpdate, Model<TSelect>> {

  constructor(private readonly model: Model<TSelect>) {}

  // ==========================================
  // AST TO MONGOOSE COMPILER HELPER
  // ==========================================
  private applyQueryPlan<Q extends mongoose.Query<any, any>>(
    mQuery: Q,
    plan?: DataQueryPlan<TEntity>
  ): Q {
    if (!plan) return mQuery;

    // 1. Map Fields
    if (plan.fields && plan.fields.length > 0) {
      mQuery = mQuery.select(plan.fields.join(' ')) as unknown as Q;
    }

    // 2. Map Relations (Strictly Typed)
    if (plan.relations && Object.keys(plan.relations).length > 0) {
      for (const [relationName, childPlan] of Object.entries(plan.relations)) {
        if (!childPlan) continue;

        // Cast is necessary because Object.entries loses the deep generic link
        const typedChildPlan = childPlan as DataQueryPlan<any>;
        const populateOptions: PopulateOptions = { path: relationName };

        if (typedChildPlan.fields && typedChildPlan.fields.length > 0) {
          populateOptions.select = typedChildPlan.fields.join(' ');
        }

        mQuery = mQuery.populate(populateOptions) as unknown as Q;
      }
    }

    return mQuery;
  }

  // ==========================================
  // ADAPTER METHODS
  // ==========================================

  async findById(id: string, plan?: DataQueryPlan<TEntity>): Promise<TSelect | null> {
    let mQuery = this.model.findById(id);
    mQuery = this.applyQueryPlan(mQuery, plan);

    const doc = await mQuery.exec();
    return doc ? (doc as Document).toObject({ virtuals: true }) as TSelect : null;
  }

  async findMany(query: QueryCriteria<TSelect> = {}, plan?: DataQueryPlan<TEntity>): Promise<TSelect[]> {
    let mQuery = this.model.find(query.where || {});

    if (query.limit) mQuery = mQuery.limit(query.limit);
    if (query.offset) mQuery = mQuery.skip(query.offset);

    mQuery = this.applyQueryPlan(mQuery, plan);

    const results = await mQuery.exec();
    return results.map(doc => (doc as Document).toObject({ virtuals: true }) as TSelect);
  }

  async create(data: TInsert): Promise<TSelect> {
    const doc = await this.model.create(data);
    return (doc as Document).toObject({ virtuals: true }) as TSelect;
  }

  async update(id: string, data: TUpdate): Promise<TSelect> {
    // Mongoose 8 returns the raw document or null. Cast to Document to access .toObject()
    const doc = await this.model.findByIdAndUpdate(id, data as any, { new: true }).exec();
    if (!doc) throw new Error('Document not found');
    return (doc as any as Document).toObject({ virtuals: true }) as TSelect;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.model.findByIdAndDelete(id).exec();
    return result !== null;
  }

  getRawClient(): Model<any> { return this.model; }
}
