export interface QueryCriteria<TEntity = any> {
  where?: Partial<TEntity>; // A simple generic filter mechanism for now
  limit?: number;
  offset?: number;
  orderBy?: { field: string; direction: 'asc' | 'desc' };
}

/**
 * Utility to unpack arrays and objects, while explicitly ignoring
 * database scalar objects like Date or Uint8Array.
 */
type ExtractNestedType<T> = NonNullable<T> extends Date | Uint8Array | Buffer
  ? never // It's a scalar database column
  : NonNullable<T> extends Array<infer U>
  ? U // It's a one-to-many relation (returns the child type)
  : NonNullable<T> extends Record<string, any>
  ? NonNullable<T> // It's a one-to-one relation (returns the child type)
  : never; // It's a primitive string/number/boolean

/**
 * Grabs ONLY the keys that are flat database fields.
 */
export type NonNestedKeys<T> = {
  [K in keyof T]: ExtractNestedType<T[K]> extends never ? K : never;
}[keyof T] & string;

/**
 * Grabs ONLY the keys that are nested relations.
 */
export type NestedKeys<T> = {
  [K in keyof T]: ExtractNestedType<T[K]> extends never ? never : K;
}[keyof T] & string;


type PickByType<T, ValueType> = {
  [K in keyof T as T[K] extends ValueType ? K : never]: T[K]
};
/**
 * A generic representation of requested data containing fields and optional relations.
 * No GraphQL, no SQL, no MongoDB involved here.
 */
export interface DataQueryPlan<
  TSelect extends Record<string, any>,
  TNested extends PickByType<TSelect, Record<string, any>> = PickByType<TSelect, Record<string, any>>
> {
   // 1. Fields strictly limited to non-nested columns
   fields: Array<NonNestedKeys<TSelect>>;

   // 2. Relations strictly limited to nested properties, mapped to their specific child type!
   relations?: {
     [K in keyof TNested]?: TNested[K] extends Array<any> ? DataQueryPlan<TNested[K][number]> : DataQueryPlan<TNested[K]>;
   };
 }
