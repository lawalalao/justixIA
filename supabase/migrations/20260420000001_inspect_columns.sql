-- 20260420000001_inspect_columns.sql
--
-- READ-ONLY inspection query. Run this first if anything surprises you.
-- It lists the columns of every table touched by the RLS migration so we
-- can see the actual schema (e.g. if `cases.user_id` is really named
-- `cases.owner_id` in your database).

SELECT table_name,
       column_name,
       data_type,
       is_nullable
  FROM information_schema.columns
 WHERE table_schema = 'public'
   AND table_name IN (
     'cases',
     'avis',
     'promo_codes',
     'referral_codes',
     'referral_uses'
   )
 ORDER BY table_name, ordinal_position;
