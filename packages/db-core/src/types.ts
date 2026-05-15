export interface QueryCriteria<TEntity = any> {
  where?: Partial<Omit<TEntity, NestedKeys<TEntity>>>; // A simple generic filter mechanism for now
  limit?: number;
  offset?: number;
  orderBy?: { field: NonNestedKeys<TEntity>; direction: "asc" | "desc" };
}

/**
 * Grabs ONLY the keys that are flat database fields.
 */
export type NonNestedKeys<T> = Exclude<keyof T, NestedKeys<T>>;

/**
 * Grabs ONLY the keys that are nested relations.
 */
export type NestedKeys<T> = Extract<keyof T, keyof PickObjectRecords<T>>;

export type PickByType<T, ValueType> = {
  [K in keyof T as T[K] extends ValueType ? K : never]: T[K];
};

// 1. Define the logical check
export type IsObjectNotString<T> = [T] extends [string] | [Date]
  ? false
  : [T] extends [Record<string, any>]
    ? true
    : false;

// 2. Apply it to the Pick mapping
export type PickObjectRecords<T> = {
  [K in keyof T as IsObjectNotString<T[K]> extends true ? K : never]: T[K];
};

/**
 * A generic representation of requested data containing fields and optional relations.
 * No GraphQL, no SQL, no MongoDB involved here.
 */
export interface DataQueryPlan<
  TSelect extends Record<string, any>,
  TNested extends PickObjectRecords<TSelect> = PickObjectRecords<TSelect>,
> {
  // 1. Fields strictly limited to non-nested columns
  fields: Array<NonNestedKeys<TSelect>>;

  // 2. Relations strictly limited to nested properties, mapped to their specific child type!
  relations?: {
    [K in keyof TNested]?: TNested[K] extends Array<any>
      ? DataQueryPlan<TNested[K][number]>
      : DataQueryPlan<TNested[K]>;
  };
}
