import type { Session, User } from '@supabase/supabase-js';
import { supabase } from './supabase';

export type AuthState =
  | { status: 'loading' }
  | { status: 'unconfigured' }
  | { status: 'signed-out' }
  | { status: 'signed-in'; session: Session; user: User };

export const getAuthState = (session: Session | null): AuthState =>
  session
    ? { status: 'signed-in', session, user: session.user }
    : { status: 'signed-out' };

export async function signInWithPassword(email: string, password: string) {
  if (!supabase) return { error: new Error('Supabase is not configured for this build.'), session: null };
  const { error, data } = await supabase.auth.signInWithPassword({ email, password });
  return { error, session: data.session };
}

export async function signUpWithPassword(email: string, password: string) {
  if (!supabase) return { error: new Error('Supabase is not configured for this build.'), session: null };
  const { error, data } = await supabase.auth.signUp({ email, password });
  return { error, session: data.session };
}

export async function signOut() {
  if (!supabase) return { error: null };
  return supabase.auth.signOut();
}