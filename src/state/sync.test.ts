import 'fake-indexeddb/auto';
import { describe, it, expect, vi } from 'vitest';

vi.mock('./supabase', () => ({
  supabase: {
    from() {
      return {
        upsert: async () => ({ error: null }),
      };
    },
  },
}));

import { queueMutation, listOutbox, clearOutbox } from './outbox';
import './sync';
import { emptyChart } from '../core/model';

describe('sync', () => {
  it('processes outbox when coming online', async () => {
    await clearOutbox();
    await queueMutation('a', emptyChart(), Date.now());
    expect((await listOutbox()).length).toBe(1);

    window.dispatchEvent(new Event('online'));

    await vi.waitFor(async () => {
      const items = await listOutbox();
      expect(items.length).toBe(0);
    });
  });
});
