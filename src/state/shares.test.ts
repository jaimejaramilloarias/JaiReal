import { describe, it, expect, vi, type Mock } from 'vitest';

vi.mock('./supabase', () => {
  const from = vi.fn();
  return { supabase: { from } };
});

import { supabase } from './supabase';
import { shareChart, revokeShare, listShares } from './shares';

describe('shares', () => {
  it('shareChart inserts into supabase', async () => {
    const insert = vi.fn().mockResolvedValue({ error: null });
    (supabase.from as Mock).mockReturnValue({ insert });
    await shareChart('c1', 'test@example.com', 'reader');
    expect(supabase.from).toHaveBeenCalledWith('shares');
    expect(insert).toHaveBeenCalledWith({
      chart_id: 'c1',
      email: 'test@example.com',
      role: 'reader',
    });
  });

  it('revokeShare deletes from supabase', async () => {
    const eq = vi.fn().mockResolvedValue({ error: null });
    const del = vi.fn().mockReturnValue({ eq });
    (supabase.from as Mock).mockReturnValue({ delete: del });
    await revokeShare('s1');
    expect(supabase.from).toHaveBeenCalledWith('shares');
    expect(del).toHaveBeenCalled();
    expect(eq).toHaveBeenCalledWith('id', 's1');
  });

  it('listShares selects from supabase', async () => {
    const eq = vi.fn().mockResolvedValue({ data: [], error: null });
    const select = vi.fn().mockReturnValue({ eq });
    (supabase.from as Mock).mockReturnValue({ select });
    await listShares('c1');
    expect(supabase.from).toHaveBeenCalledWith('shares');
    expect(select).toHaveBeenCalledWith('id,chart_id,email,role');
    expect(eq).toHaveBeenCalledWith('chart_id', 'c1');
  });
});
