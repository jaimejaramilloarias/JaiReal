import type { Chart } from '../core/model';

interface OutboxItem {
  id: string;
  chart: Chart;
  updatedAt: number;
}

const DB_NAME = 'jaireal-outbox';
const STORE_NAME = 'mutations';
const VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    req.onerror = () => reject(req.error);
    req.onsuccess = () => resolve(req.result);
  });
}

export async function queueMutation(
  id: string,
  chart: Chart,
  updatedAt: number,
): Promise<void> {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  tx.objectStore(STORE_NAME).put({ id, chart, updatedAt });
  await new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve(undefined);
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

export interface SupabaseClientLike {
  from: (table: string) => {
    upsert: (data: unknown) => Promise<{ error: unknown }>;
  };
}

export async function processOutbox(client: SupabaseClientLike): Promise<void> {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  const req = store.getAll();
  const items = await new Promise<OutboxItem[]>((resolve, reject) => {
    req.onsuccess = () => resolve(req.result as OutboxItem[]);
    req.onerror = () => reject(req.error);
  });
  for (const item of items) {
    const { error } = await client
      .from('charts')
      .upsert({ id: item.id, chart: item.chart, updated_at: item.updatedAt });
    if (!error) {
      store.delete(item.id);
    }
  }
  await new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve(undefined);
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

export async function listOutbox(): Promise<OutboxItem[]> {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, 'readonly');
  const store = tx.objectStore(STORE_NAME);
  const req = store.getAll();
  const items = await new Promise<OutboxItem[]>((resolve, reject) => {
    req.onsuccess = () => resolve(req.result as OutboxItem[]);
    req.onerror = () => reject(req.error);
  });
  db.close();
  return items;
}

export async function clearOutbox(): Promise<void> {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  tx.objectStore(STORE_NAME).clear();
  await new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve(undefined);
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}
