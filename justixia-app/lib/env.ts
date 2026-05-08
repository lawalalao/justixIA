// Centralised env access. Throws at startup if a required server var is missing.
function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

export const env = {
  // Public (safe in browser)
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
  supabaseAnon: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
  // Server-only (lazy, throws on access if missing)
  get supabaseService() { return required('SUPABASE_SERVICE_ROLE_KEY'); },
  get anthropicKey() { return required('ANTHROPIC_API_KEY'); },
};
