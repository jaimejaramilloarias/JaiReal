import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { SupabaseClientLike } from './outbox';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabase: SupabaseClient & SupabaseClientLike;

if (url && anonKey) {
  supabase = createClient(url, anonKey) as unknown as SupabaseClient & SupabaseClientLike;
} else {
  console.warn('Supabase disabled: missing env vars');
  const resolved = async () => ({ data: null, error: null });
  const from = () => ({
    insert: resolved,
    delete: () => ({ eq: resolved }),
    select: () => ({ eq: resolved }),
    upsert: resolved,
  });
  supabase = {
    from,
    auth: {
      signInWithOtp: resolved,
      signInWithOAuth: resolved,
      signOut: resolved,
      onAuthStateChange: () => ({
        data: { subscription: { unsubscribe() {} } },
      }),
    },
  } as unknown as SupabaseClient & SupabaseClientLike;
}

export { supabase };
