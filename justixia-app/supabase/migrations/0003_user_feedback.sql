-- Avis des utilisateurs après une session (NPS-like + commentaire libre).
-- Pas de FK forte vers profiles : on accepte aussi les avis anonymes (démo).

create table if not exists public.user_feedback (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text,
  case_id text,
  rating smallint not null check (rating between 1 and 5),
  comment text,
  user_agent text,
  created_at timestamptz not null default now()
);

create index if not exists user_feedback_created_at_idx on public.user_feedback (created_at desc);
create index if not exists user_feedback_rating_idx on public.user_feedback (rating);

alter table public.user_feedback enable row level security;

-- Insert ouvert (anonyme inclus) : on filtre côté API.
drop policy if exists user_feedback_insert on public.user_feedback;
create policy user_feedback_insert on public.user_feedback
  for insert
  to anon, authenticated
  with check (true);

-- Lecture réservée au service role (admin).
