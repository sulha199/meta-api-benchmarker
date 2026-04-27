/**
* ADAPTER CONTRACT (INTERFACE)
** The contract is now generic and entirely Promise-based to support async storages like IndexedDB or Cache API.
*/
export interface IStorageAdapter<Schema> {
  getItem<K extends keyof Schema>(key: K): Promise<Schema[K] | null>;
  setItem<K extends keyof Schema>(key: K, value: Schema[K]): Promise<void>;
  removeItem<K extends keyof Schema>(key: K): Promise<void>;
}

/**
* GENERIC STORAGE MANAGER
** The orchestrator class. It no longer cares about JSON stringification.
*/
export class StorageManager<Schema> {
  protected adapter: IStorageAdapter<Schema>;

  constructor(adapter: IStorageAdapter<Schema>) {
    this.adapter = adapter;
  }

  async get<K extends keyof Schema>(key: K, defaultValue?: Schema[K]): Promise<Schema[K] | null> {
    const data = await this.adapter.getItem(key);

    if (data === null && defaultValue !== undefined) {
      return defaultValue;
    }

    return data;
  }

  async set<K extends keyof Schema>(key: K, value: Schema[K]): Promise<void> {
    await this.adapter.setItem(key, value);
  }

  async remove<K extends keyof Schema>(key: K): Promise<void> {
    await this.adapter.removeItem(key);
  }
}
