// Auth partagé pour toutes les pages du dashboard
// Usage : <script type="module" src="/dashboard/_auth.js"></script>

const SUPABASE_CDN = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

let _client = null;

export async function getSupabase() {
  if (_client) return _client;
  const { createClient } = await import(SUPABASE_CDN);
  const resp = await fetch('/api/config');
  const { supabase_url, supabase_anon_key } = await resp.json();
  _client = createClient(supabase_url, supabase_anon_key, {
    auth: { persistSession: true, storageKey: 'jx_session' },
  });
  return _client;
}

export async function requireAuth() {
  const sb = await getSupabase();
  const { data: { session } } = await sb.auth.getSession();
  if (!session) {
    window.location.href = '/dashboard/login.html';
    throw new Error('Non authentifié');
  }
  return session;
}

export async function logout() {
  const sb = await getSupabase();
  await sb.auth.signOut();
  window.location.href = '/dashboard/login.html';
}

export function authHeaders(session) {
  return { 'Authorization': `Bearer ${session.access_token}` };
}
