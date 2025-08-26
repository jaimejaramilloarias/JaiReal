import type { Chart } from '../core/model';

const DB_NAME = 'jaireal-library';
const STORE_NAME = 'charts';
const BACKUP_STORE = 'backups';
const VERSION = 2;
const MIN_SAVE_INTERVAL_MS = 500;
const MAX_CHART_BYTES = 100 * 1024;

interface LibraryItem {
  id: string;
  title: string;
  tags: string[];
  chart: Chart;
  favorite: boolean;
  status: 'active' | 'archived' | 'trashed';
}

let lastSaveTime = 0;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      let store: IDBObjectStore;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      } else {
        store = request.transaction!.objectStore(STORE_NAME);
      }
      if (!store.indexNames.contains('title')) {
        store.createIndex('title', 'title', { unique: false });
      }
      if (!store.indexNames.contains('tags')) {
        store.createIndex('tags', 'tags', { unique: false, multiEntry: true });
      }
      if (!store.indexNames.contains('favorite')) {
        store.createIndex('favorite', 'favorite', { unique: false });
      }
      if (!store.indexNames.contains('status')) {
        store.createIndex('status', 'status', { unique: false });
      }
      if (!db.objectStoreNames.contains(BACKUP_STORE)) {
        db.createObjectStore(BACKUP_STORE, { keyPath: 'timestamp' });
      }
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
  opts?: { favorite?: boolean; status?: 'active' | 'archived' | 'trashed' },
): Promise<string> {
  if (process.env.NODE_ENV !== 'test') {
    const now = Date.now();
    if (now - lastSaveTime < MIN_SAVE_INTERVAL_MS) {
      throw new Error('Rate limit exceeded');
    }
    lastSaveTime = now;
  }
  const bytes = new TextEncoder().encode(JSON.stringify(chart)).length;
  if (bytes > MAX_CHART_BYTES) {
    throw new Error('Chart too large');
  }
  const db = await openDB();
  const chartId = id ?? crypto.randomUUID();
  const { favorite = false, status = 'active' } = opts ?? {};
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  store.put({ id: chartId, title, tags, chart, favorite, status });
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

interface ListFilters {
  title?: string;
  tag?: string;
  favorite?: boolean;
  status?: 'active' | 'archived' | 'trashed';
}

export async function listCharts(filters?: ListFilters): Promise<
  Array<{
    id: string;
    title: string;
    tags: string[];
    favorite: boolean;
    status: 'active' | 'archived' | 'trashed';
  }>
> {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, 'readonly');
  const store = tx.objectStore(STORE_NAME);
  const req = store.getAll();
  const items = await new Promise<LibraryItem[]>((resolve, reject) => {
    req.onsuccess = () => resolve(req.result as LibraryItem[]);
    req.onerror = () => reject(req.error);
  });
  db.close();
  let filtered: LibraryItem[] = items;
  if (filters) {
    const title = filters.title?.toLowerCase();
    const tag = filters.tag?.toLowerCase();
    if (filters.favorite !== undefined) {
      filtered = filtered.filter((it) => it.favorite === filters.favorite);
    }
    if (filters.status) {
      filtered = filtered.filter((it) => it.status === filters.status);
    } else {
      filtered = filtered.filter((it) => it.status !== 'trashed');
    }
    filtered = filtered.filter((it) => {
      const matchTitle = title ? it.title.toLowerCase().includes(title) : true;
      const matchTag = tag
        ? it.tags.some((t) => t.toLowerCase().includes(tag))
        : true;
      return matchTitle && matchTag;
    });
  } else {
    filtered = filtered.filter((it) => it.status !== 'trashed');
  }
  filtered.sort((a, b) =>
    a.title.localeCompare(b.title, undefined, { sensitivity: 'base' }),
  );
  return filtered.map(({ id, title, tags, favorite, status }) => ({
    id,
    title,
    tags,
    favorite,
    status,
  }));
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

export async function markFavorite(
  id: string,
  favorite: boolean,
): Promise<void> {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  const req = store.get(id);
  const item = await new Promise<LibraryItem | undefined>((resolve, reject) => {
    req.onsuccess = () => resolve(req.result as LibraryItem | undefined);
    req.onerror = () => reject(req.error);
  });
  if (item) {
    item.favorite = favorite;
    store.put(item);
  }
  await new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve(undefined);
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

export async function setStatus(
  id: string,
  status: 'active' | 'archived' | 'trashed',
): Promise<void> {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  const req = store.get(id);
  const item = await new Promise<LibraryItem | undefined>((resolve, reject) => {
    req.onsuccess = () => resolve(req.result as LibraryItem | undefined);
    req.onerror = () => reject(req.error);
  });
  if (item) {
    item.status = status;
    store.put(item);
  }
  await new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve(undefined);
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

export async function backupCharts(): Promise<number> {
  const db = await openDB();
  const tx = db.transaction([STORE_NAME, BACKUP_STORE], 'readwrite');
  const req = tx.objectStore(STORE_NAME).getAll();
  const items = await new Promise<LibraryItem[]>((resolve, reject) => {
    req.onsuccess = () => resolve(req.result as LibraryItem[]);
    req.onerror = () => reject(req.error);
  });
  const timestamp = Date.now();
  tx.objectStore(BACKUP_STORE).put({ timestamp, charts: items });
  await new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve(undefined);
    tx.onerror = () => reject(tx.error);
  });
  db.close();
  return timestamp;
}

export async function restoreChartFromBackup(
  timestamp: number,
  id: string,
): Promise<void> {
  const db = await openDB();
  const tx = db.transaction([STORE_NAME, BACKUP_STORE], 'readwrite');
  const backupReq = tx.objectStore(BACKUP_STORE).get(timestamp);
  const backup = await new Promise<{ charts: LibraryItem[] } | undefined>(
    (resolve, reject) => {
      backupReq.onsuccess = () =>
        resolve(backupReq.result as { charts: LibraryItem[] } | undefined);
      backupReq.onerror = () => reject(backupReq.error);
    },
  );
  if (backup) {
    const item = backup.charts.find((c) => c.id === id);
    if (item) {
      tx.objectStore(STORE_NAME).put(item);
    }
  }
  await new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve(undefined);
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

export async function ensureDailyBackup(): Promise<void> {
  const last = Number(localStorage.getItem('jaireal-last-backup') || '0');
  const now = Date.now();
  if (now - last > 24 * 60 * 60 * 1000) {
    await backupCharts();
    localStorage.setItem('jaireal-last-backup', String(now));
  }
}
