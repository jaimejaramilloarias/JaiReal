import { describe, it, expect, vi, type Mock } from 'vitest';
import type { User } from '@supabase/supabase-js';

vi.mock('./supabase', () => {
  const signInWithOtp = vi.fn().mockResolvedValue({ error: null });
  const signInWithOAuth = vi.fn().mockResolvedValue({ error: null });
  const signOut = vi.fn().mockResolvedValue({ error: null });
  const onAuthStateChange = vi.fn();
  return {
    supabase: {
      auth: { signInWithOtp, signInWithOAuth, signOut, onAuthStateChange },
    },
  };
});

import { supabase } from './supabase';
import {
  signInWithEmail,
  signInWithGoogle,
  signOut,
  onAuthChange,
} from './auth';

describe('auth', () => {
  it('signInWithEmail calls supabase', async () => {
    await signInWithEmail('test@example.com');
    expect(supabase.auth.signInWithOtp).toHaveBeenCalledWith({
      email: 'test@example.com',
    });
  });

  it('signInWithGoogle uses OAuth provider', async () => {
    await signInWithGoogle();
    expect(supabase.auth.signInWithOAuth).toHaveBeenCalledWith({
      provider: 'google',
    });
  });

  it('signOut delegates to supabase', async () => {
    await signOut();
    expect(supabase.auth.signOut).toHaveBeenCalled();
  });

  it('onAuthChange passes user from session', () => {
    const callback = vi.fn();
    let storedCallback:
      | ((event: string, session: { user: User } | null) => void)
      | undefined;
    const onAuthStateChangeMock = supabase.auth
      .onAuthStateChange as unknown as Mock;
    onAuthStateChangeMock.mockImplementation((cb: typeof storedCallback) => {
      storedCallback = cb;
      return { data: { subscription: { unsubscribe: vi.fn() } } };
    });
    onAuthChange(callback);
    const fakeUser = { id: '1' } as unknown as User;
    storedCallback?.('SIGNED_IN', { user: fakeUser });
    expect(callback).toHaveBeenCalledWith(fakeUser);
    storedCallback?.('SIGNED_OUT', null);
    expect(callback).toHaveBeenCalledWith(null);
  });
});
