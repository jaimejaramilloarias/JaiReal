import type { Chart } from '../core/model';

const DB_NAME = 'jaireal-library';
const STORE_NAME = 'charts';

interface LibraryItem {
  id: string;
  title: string;
  tags: string[];
  chart: Chart;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      store.createIndex('title', 'title', { unique: false });
      store.createIndex('tags', 'tags', { unique: false, multiEntry: true });
    };
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

export async function saveChart(
  chart: Chart,
  title: string,
  tags: string[],
  id?: string,
): Promise<string> {
  const db = await openDB();
  const chartId = id ?? crypto.randomUUID();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  store.put({ id: chartId, title, tags, chart });
  await new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve(undefined);
    tx.onerror = () => reject(tx.error);
  });
  db.close();
  return chartId;
}

export async function getChart(id: string): Promise<Chart | undefined> {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, 'readonly');
  const store = tx.objectStore(STORE_NAME);
  const req = store.get(id);
  const item = await new Promise<LibraryItem | undefined>((resolve, reject) => {
    req.onsuccess = () => resolve(req.result as LibraryItem | undefined);
    req.onerror = () => reject(req.error);
  });
  db.close();
  return item?.chart;
}

export async function listCharts(
  query?: string,
): Promise<Array<{ id: string; title: string; tags: string[] }>> {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, 'readonly');
  const store = tx.objectStore(STORE_NAME);
  const req = store.getAll();
  const items = await new Promise<LibraryItem[]>((resolve, reject) => {
    req.onsuccess = () => resolve(req.result as LibraryItem[]);
    req.onerror = () => reject(req.error);
  });
  db.close();
  if (!query) {
    return items.map(({ id, title, tags }) => ({ id, title, tags }));
  }
  const q = query.toLowerCase();
  return items
    .filter(
      (it) =>
        it.title.toLowerCase().includes(q) ||
        it.tags.some((t) => t.toLowerCase().includes(q)),
    )
    .map(({ id, title, tags }) => ({ id, title, tags }));
}

export async function deleteChart(id: string): Promise<void> {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  tx.objectStore(STORE_NAME).delete(id);
  await new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve(undefined);
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}
