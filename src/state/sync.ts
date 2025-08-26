import { supabase } from './supabase';
import { processOutbox } from './outbox';

type Status = 'idle' | 'syncing' | 'synced' | 'error';

let status: Status = 'idle';
const listeners = new Set<(s: Status) => void>();

function emit() {
  for (const cb of listeners) cb(status);
}

export function onSyncStatus(cb: (s: Status) => void): () => void {
  listeners.add(cb);
  cb(status);
  return () => listeners.delete(cb);
}

export async function syncNow(): Promise<void> {
  if (status === 'syncing') return;
  status = 'syncing';
  emit();
  try {
    await processOutbox(supabase);
    status = 'synced';
  } catch {
    status = 'error';
  }
  emit();
}

window.addEventListener('online', () => {
  syncNow().catch(() => {});
});
