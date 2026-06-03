import { AbstractRepository } from "@repo/db-core";
import { MongoAdapter } from "../adapters/MongoAdapter";
import { Model } from "mongoose";

export abstract class AbstractMongoRepository<
  TEntity extends Record<string, any>,
  TDbSelect extends Record<string, any>,
  TDbInsert,
  TUpdate,
  TEntityCreate extends Partial<TEntity> = TEntity,
  TEntityUpdate extends Partial<TEntity> = Partial<TEntity>,
> extends AbstractRepository<
  TEntity,
  TDbSelect,
  TDbInsert,
  TUpdate,
  Model<TDbSelect>,
  "_id",
  TEntityCreate,
  TEntityUpdate
> {
  constructor(model: Model<any>) {
    // Pass the model into our generic Mongo adapter, then up to the base class
    super(new MongoAdapter(model));
  }
}
