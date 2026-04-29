import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { env } from './env';

// Browser / RLS-scoped client. Safe to expose.
export function supabaseClient(): SupabaseClient {
  return createClient(env.supabaseUrl, env.supabaseAnon, {
    auth: { persistSession: false },
  });
}

// Server-side, bypasses RLS. Never import from a client component.
export function supabaseAdmin(): SupabaseClient {
  return createClient(env.supabaseUrl, env.supabaseService, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
