import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface SahayakDB extends DBSchema {
  savedItems: {
    key: number;
    value: {
      id?: number;
      text: string;
      timestamp: number;
      type: 'ocr' | 'response' | 'listing';
    };
    indexes: { 'by-timestamp': number };
  };
}

let dbPromise: Promise<IDBPDatabase<SahayakDB>>;

if (typeof window !== 'undefined') {
  dbPromise = openDB<SahayakDB>('sahayak-db', 1, {
    upgrade(db) {
      const store = db.createObjectStore('savedItems', {
        keyPath: 'id',
        autoIncrement: true,
      });
      store.createIndex('by-timestamp', 'timestamp');
    },
  });
}

export async function saveItem(text: string, type: 'ocr' | 'response' | 'listing' = 'response') {
  const db = await dbPromise;
  const id = await db.add('savedItems', {
    text,
    timestamp: Date.now(),
    type,
  });
  return id;
}

export async function getSavedItems() {
  const db = await dbPromise;
  return await db.getAllFromIndex('savedItems', 'by-timestamp');
}

export async function deleteItem(id: number) {
  const db = await dbPromise;
  await db.delete('savedItems', id);
}

export async function clearAllItems() {
  const db = await dbPromise;
  await db.clear('savedItems');
}
