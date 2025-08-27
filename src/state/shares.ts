import { supabase } from './supabase';

export type ShareRole = 'editor' | 'commenter' | 'reader';

export interface Share {
  id: string;
  chart_id: string;
  email: string;
  role: ShareRole;
}

/**
 * Create or update a share entry for a chart.
 */
export async function shareChart(
  chartId: string,
  email: string,
  role: ShareRole,
): Promise<void> {
  const { error } = await supabase.from('shares').insert({
    chart_id: chartId,
    email,
    role,
  });
  if (error) throw error;
}

/**
 * Remove an existing share entry by its id.
 */
export async function revokeShare(id: string): Promise<void> {
  const { error } = await supabase.from('shares').delete().eq('id', id);
  if (error) throw error;
}

/**
 * List all share entries for a chart.
 */
export async function listShares(chartId: string): Promise<Share[]> {
  const { data, error } = await supabase
    .from('shares')
    .select('id,chart_id,email,role')
    .eq('chart_id', chartId);
  if (error) throw error;
  return (data ?? []) as Share[];
}
