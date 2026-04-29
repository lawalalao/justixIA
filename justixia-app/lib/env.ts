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
  get openaiKey() { return required('OPENAI_API_KEY'); },
  get elevenlabsKey() { return required('ELEVENLABS_API_KEY'); },
  get stripeSecret() { return required('STRIPE_SECRET_KEY'); },
  get stripeWebhookSecret() { return required('STRIPE_WEBHOOK_SECRET'); },
  // Stripe price IDs
  pricePro: process.env.STRIPE_PRICE_PRO ?? '',
  priceStudio: process.env.STRIPE_PRICE_STUDIO ?? '',
  priceTeam: process.env.STRIPE_PRICE_TEAM ?? '',
};
