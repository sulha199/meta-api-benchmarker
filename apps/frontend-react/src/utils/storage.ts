import { type IStorageAdapter, StorageManager } from '@meta/storage'

// ==========================================
// 1. TYPE DEFINITION (SCHEMA)
// ==========================================
// Define the exact keys and their corresponding data types
export interface AppStorageSchema {
  meta_visitor_id: string;
  meta_is_registered: boolean;
}

// ==========================================
// 3. CONCRETE ADAPTERS
// ==========================================
// Implementation for LocalStorage.
// Even though LocalStorage is synchronous, we wrap it in Promises
// to satisfy the async interface. JSON parsing is handled here.
export class LocalStorageAdapter<Schema> implements IStorageAdapter<Schema> {
  async getItem<K extends keyof Schema>(key: K): Promise<Schema[K] | null> {
    const rawData = localStorage.getItem(String(key));

    if (rawData === null) return null;

    try {
      return JSON.parse(rawData) as Schema[K];
    } catch {
      // Fallback if the stored data is a plain string and not valid JSON
      return rawData as unknown as Schema[K];
    }
  }

  async setItem<K extends keyof Schema>(key: K, value: Schema[K]): Promise<void> {
    const serializedData = JSON.stringify(value);
    localStorage.setItem(String(key), serializedData);
  }

  async removeItem<K extends keyof Schema>(key: K): Promise<void> {
    localStorage.removeItem(String(key));
  }
}

// ==========================================
// SINGLETON INSTANCE
// ==========================================
// Export a ready-to-use instance for the entire application
export const appStorage = new StorageManager<AppStorageSchema>(
  new LocalStorageAdapter<AppStorageSchema>()
);
