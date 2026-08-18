// src/utils/storage.ts
import { openDB, IDBPDatabase } from 'idb';

let db: IDBPDatabase | null = null;

export interface SavedItem {
  id?: number;
  type: 'scan' | 'command' | 'response';
  content: string;
  timestamp: number;
}

export async function initDB() {
  if (db) return db;
  
  db = await openDB('SahayakDB', 2, {
    upgrade(upgradeDb, _oldVersion, _newVersion) {
      if (!upgradeDb.objectStoreNames.contains('items')) {
        const store = upgradeDb.createObjectStore('items', { 
          keyPath: 'id', 
          autoIncrement: true 
        });
        store.createIndex('type', 'type');
        store.createIndex('timestamp', 'timestamp');
      }
      if (!upgradeDb.objectStoreNames.contains('settings')) {
        upgradeDb.createObjectStore('settings', { keyPath: 'key' });
      }
    }
  });
  
  return db;
}

export async function saveItem(item: Omit<SavedItem, 'id'>) {
  const database = await initDB();
  const tx = database.transaction('items', 'readwrite');
  const store = tx.objectStore('items');
  const id = await store.add(item);
  await tx.done;
  return id;
}

export async function getAllItems(): Promise<SavedItem[]> {
  const database = await initDB();
  const tx = database.transaction('items', 'readonly');
  const store = tx.objectStore('items');
  const items = await store.getAll();
  await tx.done;
  return items.sort((a, b) => b.timestamp - a.timestamp);
}

export async function deleteItem(id: number) {
  const database = await initDB();
  const tx = database.transaction('items', 'readwrite');
  const store = tx.objectStore('items');
  await store.delete(id);
  await tx.done;
}

export async function clearAllItems() {
  const database = await initDB();
  const tx = database.transaction('items', 'readwrite');
  const store = tx.objectStore('items');
  await store.clear();
  await tx.done;
}

export async function getSetting(key: string): Promise<any> {
  const database = await initDB();
  const tx = database.transaction('settings', 'readonly');
  const store = tx.objectStore('settings');
  const result = await store.get(key);
  await tx.done;
  return result?.value;
}

export async function setSetting(key: string, value: any) {
  const database = await initDB();
  const tx = database.transaction('settings', 'readwrite');
  const store = tx.objectStore('settings');
  await store.put({ key, value });
  await tx.done;
}
