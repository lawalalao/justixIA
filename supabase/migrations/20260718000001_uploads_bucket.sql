-- 20260718000001_uploads_bucket.sql
--
-- Bucket "uploads" pour les documents volumineux (> 4 Mo) : le navigateur
-- les envoie directement vers Supabase Storage (la limite Vercel de 4,5 Mo
-- par requête ne s'applique pas), le backend les télécharge, les analyse
-- puis les supprime immédiatement (les documents ne sont jamais conservés).
--
-- À exécuter dans le SQL Editor du projet Supabase du site statique
-- (le même que 20260718000000_rebuild_legacy_schema.sql).

insert into storage.buckets (id, name, public, file_size_limit)
values ('uploads', 'uploads', false, 10485760)  -- 10 Mo, aligné sur MAX_FILE_SIZE du backend
on conflict (id) do nothing;

-- Chaque utilisateur connecté ne peut écrire que dans son propre dossier
-- (uploads/<user_id>/...). Aucune policy de lecture : seul le backend
-- (service_role) lit et supprime les fichiers.
drop policy if exists "uploads_insert_own" on storage.objects;
create policy "uploads_insert_own" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'uploads'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
