-- 20260420000000_enable_rls.sql
--
-- Enables Row Level Security on every public table flagged by the Supabase
-- linter. Defensive design:
--
--   * RLS is enabled UNCONDITIONALLY on every table — that alone removes the
--     vulnerability (anon/authenticated no longer have default access) and
--     makes the linter warnings disappear.
--
--   * Per-owner SELECT policies are created only if the expected column
--     exists. If a table was created with a different column name (e.g.
--     `owner_uuid` instead of `user_id`), the policy block is skipped with
--     a NOTICE — the RLS toggle itself still applies.
--
-- The backend uses the SERVICE_ROLE key, which bypasses RLS, so all existing
-- endpoints keep working. The frontend only uses the anon key for auth.*,
-- so it's not affected either.

-- ── 1. Enable RLS on every flagged table (no-op if already enabled) ──────
ALTER TABLE public.cases           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.avis            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promo_codes     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_codes  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_uses   ENABLE ROW LEVEL SECURITY;


-- ── 2. Per-owner policies (created only if the column exists) ───────────
-- Helper: runs a CREATE POLICY statement if the given column is present.
DO $$
DECLARE
  has_col boolean;
BEGIN
  -- cases.user_id ---------------------------------------------------------
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = 'cases' AND column_name = 'user_id'
  ) INTO has_col;

  IF has_col THEN
    EXECUTE $p$ DROP POLICY IF EXISTS "cases_select_own"  ON public.cases $p$;
    EXECUTE $p$ DROP POLICY IF EXISTS "cases_insert_own"  ON public.cases $p$;
    EXECUTE $p$ DROP POLICY IF EXISTS "cases_update_own"  ON public.cases $p$;
    EXECUTE $p$ DROP POLICY IF EXISTS "cases_delete_own"  ON public.cases $p$;

    EXECUTE $p$ CREATE POLICY "cases_select_own"
                  ON public.cases FOR SELECT TO authenticated
                  USING (auth.uid() = user_id) $p$;
    EXECUTE $p$ CREATE POLICY "cases_insert_own"
                  ON public.cases FOR INSERT TO authenticated
                  WITH CHECK (auth.uid() = user_id) $p$;
    EXECUTE $p$ CREATE POLICY "cases_update_own"
                  ON public.cases FOR UPDATE TO authenticated
                  USING (auth.uid() = user_id)
                  WITH CHECK (auth.uid() = user_id) $p$;
    EXECUTE $p$ CREATE POLICY "cases_delete_own"
                  ON public.cases FOR DELETE TO authenticated
                  USING (auth.uid() = user_id) $p$;
  ELSE
    RAISE NOTICE 'skipped cases per-owner policies: column "user_id" not found';
  END IF;

  -- referral_codes.owner_id ----------------------------------------------
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = 'referral_codes' AND column_name = 'owner_id'
  ) INTO has_col;

  IF has_col THEN
    EXECUTE $p$ DROP POLICY IF EXISTS "referral_codes_select_own" ON public.referral_codes $p$;
    EXECUTE $p$ CREATE POLICY "referral_codes_select_own"
                  ON public.referral_codes FOR SELECT TO authenticated
                  USING (auth.uid() = owner_id) $p$;
  ELSE
    RAISE NOTICE 'skipped referral_codes per-owner policy: column "owner_id" not found';
  END IF;

  -- referral_uses.owner_id + beneficiary_id -------------------------------
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = 'referral_uses' AND column_name = 'owner_id'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = 'referral_uses' AND column_name = 'beneficiary_id'
  ) INTO has_col;

  IF has_col THEN
    EXECUTE $p$ DROP POLICY IF EXISTS "referral_uses_select_own_or_beneficiary"
                  ON public.referral_uses $p$;
    EXECUTE $p$ CREATE POLICY "referral_uses_select_own_or_beneficiary"
                  ON public.referral_uses FOR SELECT TO authenticated
                  USING (auth.uid() = owner_id OR auth.uid() = beneficiary_id) $p$;
  ELSE
    RAISE NOTICE 'skipped referral_uses per-owner policy: owner_id/beneficiary_id not found';
  END IF;
END $$;

-- avis and promo_codes: intentionally no permissive policy.
-- Service role writes via POST /api/avis and admin endpoints; everyone else
-- is denied.


-- ── 3. Sanity check queries you can run afterwards ──────────────────────
-- Which tables have RLS enabled?
--   SELECT tablename, rowsecurity
--     FROM pg_tables
--    WHERE schemaname = 'public'
--      AND tablename IN ('cases','avis','promo_codes','referral_codes','referral_uses');
--
-- Which policies exist?
--   SELECT tablename, policyname, cmd
--     FROM pg_policies
--    WHERE schemaname = 'public'
--    ORDER BY tablename, policyname;
