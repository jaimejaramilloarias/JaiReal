import 'fake-indexeddb/auto';
import { describe, it, expect } from 'vitest';
import { emptyChart } from '../core/model';
import {
  queueMutation,
  processOutbox,
  listOutbox,
  clearOutbox,
  type SupabaseClientLike,
} from './outbox';

describe('outbox', () => {
  it('retries failed mutations until success', async () => {
    await clearOutbox();
    let attempts = 0;
    const supabase: SupabaseClientLike = {
      from() {
        return {
          upsert: async () => {
            attempts++;
            if (attempts === 1) {
              return { error: { message: 'fail' } };
            }
            return { error: null };
          },
        };
      },
    };
    await queueMutation('a', emptyChart(), Date.now());
    await processOutbox(supabase);
    let items = await listOutbox();
    expect(items.length).toBe(1);
    await processOutbox(supabase);
    items = await listOutbox();
    expect(items.length).toBe(0);
    expect(attempts).toBe(2);
  });
});
