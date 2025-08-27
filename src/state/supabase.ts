// Modo tolerante: si faltan envs, no crashea en dev, exporta stub.
import type { SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

type NoOpResult = { data: null; error: null };
type AnyFn = (...args: unknown[]) => Promise<NoOpResult>;
const noOp: AnyFn = async () => ({ data: null, error: null });

export const supabase: SupabaseClient =
  url && anon
    ? (await import('@supabase/supabase-js')).createClient(url, anon)
    : (() => {
        console.warn('Supabase disabled: missing env vars');
        // stub mínimo compatible con llamadas básicas que hace la app
        return {
          from: () => ({
            select: noOp,
            insert: noOp,
            update: noOp,
            delete: noOp,
          }),
          auth: { getUser: noOp, signInWithPassword: noOp, signOut: noOp },
        } as unknown as SupabaseClient;
      })();
