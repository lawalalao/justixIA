-- 20260420000000_enable_rls.sql
--
-- Enables Row Level Security on every public table that the Supabase linter
-- flagged as "RLS Disabled in Public". Fixes a real vulnerability: the anon
-- key is shipped in the browser, so any unauthenticated visitor could read
-- or write these tables as long as RLS stayed off.
--
-- Architecture context:
--   * The backend (api/index.py) always uses the SERVICE_ROLE key, which
--     bypasses RLS in both Postgres and Supabase. All existing endpoints
--     keep working after this migration.
--   * The frontend only uses the anon key for `auth.*` calls (signIn,
--     signUp, signOut). It never reads or writes these tables directly.
--   * Policies below are therefore defensive: default-deny for anon and
--     authenticated, with a handful of "own row" allowances so that a
--     future client-side read of my-own-data would work safely without
--     another migration.

-- ── cases ────────────────────────────────────────────────────────────────
-- Per-user dossiers. Owner column: user_id (uuid, references auth.users).
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "cases_select_own"  ON public.cases;
DROP POLICY IF EXISTS "cases_insert_own"  ON public.cases;
DROP POLICY IF EXISTS "cases_update_own"  ON public.cases;
DROP POLICY IF EXISTS "cases_delete_own"  ON public.cases;

CREATE POLICY "cases_select_own"
  ON public.cases FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "cases_insert_own"
  ON public.cases FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "cases_update_own"
  ON public.cases FOR UPDATE TO authenticated
  USING      (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "cases_delete_own"
  ON public.cases FOR DELETE TO authenticated
  USING (auth.uid() = user_id);


-- ── avis ─────────────────────────────────────────────────────────────────
-- Anonymous NPS feedback. Read-only for admins (via backend). Inserts go
-- through POST /api/avis (service role). No direct client access needed,
-- so RLS is enabled with zero permissive policies.
ALTER TABLE public.avis ENABLE ROW LEVEL SECURITY;


-- ── promo_codes ──────────────────────────────────────────────────────────
-- Admin-issued codes. Nobody but the backend should ever read these —
-- publishing them would defeat the purpose. No permissive policy.
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;


-- ── referral_codes ───────────────────────────────────────────────────────
-- One row per user. Owner column: owner_id.
-- Owner can read their own code. All writes stay server-side.
ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "referral_codes_select_own" ON public.referral_codes;

CREATE POLICY "referral_codes_select_own"
  ON public.referral_codes FOR SELECT TO authenticated
  USING (auth.uid() = owner_id);


-- ── referral_uses ────────────────────────────────────────────────────────
-- Ledger of redemptions. Owner can see who they referred; beneficiary can
-- see the row recording their own use. Writes stay server-side.
ALTER TABLE public.referral_uses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "referral_uses_select_own_or_beneficiary" ON public.referral_uses;

CREATE POLICY "referral_uses_select_own_or_beneficiary"
  ON public.referral_uses FOR SELECT TO authenticated
  USING (auth.uid() = owner_id OR auth.uid() = beneficiary_id);


-- ── sanity check (optional, run manually) ────────────────────────────────
-- SELECT tablename, rowsecurity
--   FROM pg_tables
--  WHERE schemaname = 'public'
--    AND tablename IN ('cases','avis','promo_codes','referral_codes','referral_uses');
