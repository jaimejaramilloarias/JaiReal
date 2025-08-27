import type { User } from '@supabase/supabase-js';
import { supabase } from './supabase';

/**
 * Sign in using a magic link sent to the provided email.
 */
export async function signInWithEmail(email: string): Promise<void> {
  const { error } = await supabase.auth.signInWithOtp({ email });
  if (error) throw error;
}

/**
 * Sign in with Google using Supabase's OAuth flow.
 */
export async function signInWithGoogle(): Promise<void> {
  const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
  if (error) throw error;
}

/**
 * Sign out the current user.
 */
export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/**
 * Subscribe to authentication state changes. The callback will be invoked
 * whenever the active session changes.
 */
export function onAuthChange(callback: (user: User | null) => void): void {
  supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null);
  });
}
