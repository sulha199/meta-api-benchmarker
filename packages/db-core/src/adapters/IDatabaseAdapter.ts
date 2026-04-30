export interface IDatabaseAdapter<
  TSelect,
  TInsert,
  TUpdate,
  TRawClient = unknown
> {
  findById(id: string): Promise<TSelect | null>;
  create(data: TInsert): Promise<TSelect>;
  update(id: string, data: TUpdate): Promise<TSelect>;
  delete(id: string): Promise<boolean>;
  getRawClient(): TRawClient;
}
