# Supabase migrations

SQL migrations for the JustiXia Supabase project. One file per change, prefixed with a timestamp.

## How to apply a migration

### Option 1 — Supabase Dashboard (easiest)

1. Open the project dashboard → **SQL Editor** → **New query**.
2. Paste the full contents of the migration file (e.g. `migrations/20260420000000_enable_rls.sql`).
3. Run. Verify there are no errors.
4. Re-check the **Advisors** / **Security** tab — the "RLS Disabled in Public" warnings for the listed tables should be gone.

### Option 2 — Supabase CLI

If you have `supabase` CLI installed and linked to the project:

```bash
supabase db push
```

The CLI picks up every file in `supabase/migrations/` that hasn't been applied yet and runs them in order.

## Current migrations

| File | Purpose |
| --- | --- |
| `20260420000000_enable_rls.sql` | Enables RLS on `cases`, `avis`, `promo_codes`, `referral_codes`, `referral_uses` and adds defensive per-owner policies. |

## Why RLS matters for this project

The anon Supabase key is shipped in the browser (returned by `/api/config`). Without RLS, anyone can open DevTools and run `supabase.from('promo_codes').select('*')` — goodbye promo codes, referral codes, cases, etc.

The backend uses the **service role** key, which bypasses RLS, so every existing endpoint keeps working after these migrations. The frontend only uses the anon key for `auth.*` calls (login / signup / signout) — it never touches these tables directly.

If you later want to read a table directly from the client, write a narrow policy that only exposes rows the current `auth.uid()` owns (see the examples in `20260420000000_enable_rls.sql`).
