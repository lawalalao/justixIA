-- Justixia — Schéma initial (V0)
-- Conventions:
--   * Toutes les tables ont id uuid + created_at + updated_at
--   * RLS activée partout, policies basées sur user_id = auth.uid()
--   * Le webhook Clerk synchronise les profils; sinon Supabase JWT custom

create extension if not exists "uuid-ossp";

-- ── PROFILES ─────────────────────────────────────────────────────────────
-- Synchronisé depuis Clerk (clerk_user_id = primary lookup).
create table if not exists profiles (
  id            uuid primary key default uuid_generate_v4(),
  clerk_user_id text unique not null,
  email         text,
  full_name     text,
  plan          text not null default 'free' check (plan in ('free', 'pro', 'studio', 'team')),
  stripe_customer_id text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists idx_profiles_clerk on profiles(clerk_user_id);

-- ── CASES (catalogue de cas) ────────────────────────────────────────────
-- Géré côté serveur, lecture publique (tous les utilisateurs y accèdent
-- selon leur plan). Pas de RLS d'écriture côté client.
create table if not exists cases (
  id           text primary key,         -- slug (ex: 'cons-licenciement-01')
  mode         text not null check (mode in ('consultation', 'tribunal')),
  domaine      text not null,
  difficulty   text not null check (difficulty in ('debutant', 'intermediaire', 'avance')),
  title        text not null,
  summary      text not null,
  estimated_minutes int not null default 15,
  is_demo      boolean not null default false,
  is_premium   boolean not null default false,
  applicable_law jsonb not null default '[]'::jsonb,
  hidden_facts jsonb not null default '[]'::jsonb,
  client_persona_prompt text,
  judge_persona_prompt  text,
  opposing_counsel_prompt text,
  created_at   timestamptz not null default now()
);
create index if not exists idx_cases_mode on cases(mode);
create index if not exists idx_cases_domaine on cases(domaine);

-- ── SESSIONS (instances de simulation) ──────────────────────────────────
create table if not exists sessions (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid references profiles(id) on delete cascade,
  case_id      text not null references cases(id),
  status       text not null default 'active' check (status in ('active', 'completed', 'abandoned')),
  started_at   timestamptz not null default now(),
  ended_at     timestamptz,
  created_at   timestamptz not null default now()
);
create index if not exists idx_sessions_user on sessions(user_id);
create index if not exists idx_sessions_case on sessions(case_id);

-- ── MESSAGES (chat history) ─────────────────────────────────────────────
create table if not exists session_messages (
  id           uuid primary key default uuid_generate_v4(),
  session_id   uuid not null references sessions(id) on delete cascade,
  role         text not null check (role in ('user', 'assistant', 'system')),
  speaker      text,                     -- 'client' | 'judge' | 'opposing' | 'lawyer'
  content      text not null,
  audio_url    text,
  created_at   timestamptz not null default now()
);
create index if not exists idx_messages_session on session_messages(session_id, created_at);

-- ── FEEDBACK (rapport Associé Senior) ───────────────────────────────────
create table if not exists session_feedback (
  id                uuid primary key default uuid_generate_v4(),
  session_id        uuid unique not null references sessions(id) on delete cascade,
  qualification_score   int  not null check (qualification_score between 0 and 10),
  qualification_notes   text not null,
  strategy_score        int  not null check (strategy_score between 0 and 10),
  strategy_notes        text not null,
  communication_score   int       check (communication_score between 0 and 10),
  communication_notes   text,
  global_score          numeric(4,2) not null,
  strengths             jsonb not null default '[]'::jsonb,
  improvements          jsonb not null default '[]'::jsonb,
  references_           jsonb not null default '[]'::jsonb,  -- "references" est réservé en SQL
  next_cases            jsonb not null default '[]'::jsonb,
  raw_payload           jsonb,                                -- pour debug
  created_at            timestamptz not null default now()
);
create index if not exists idx_feedback_session on session_feedback(session_id);

-- ── BADGES / GAMIFICATION ───────────────────────────────────────────────
create table if not exists user_badges (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid not null references profiles(id) on delete cascade,
  badge_key    text not null,            -- 'first_consultation', '10_sessions', 'tribunal_winner'
  earned_at    timestamptz not null default now(),
  unique(user_id, badge_key)
);

-- ── RLS ────────────────────────────────────────────────────────────────
alter table profiles enable row level security;
alter table sessions enable row level security;
alter table session_messages enable row level security;
alter table session_feedback enable row level security;
alter table user_badges enable row level security;

-- profiles: chacun lit/édite le sien (lookup par clerk_user_id depuis le JWT custom claim)
create policy "profiles_self_read"  on profiles for select using (clerk_user_id = (auth.jwt() ->> 'sub'));
create policy "profiles_self_write" on profiles for update using (clerk_user_id = (auth.jwt() ->> 'sub'));

-- sessions: chacun ne voit que les siennes
create policy "sessions_self_read" on sessions for select using (
  user_id in (select id from profiles where clerk_user_id = (auth.jwt() ->> 'sub'))
);
create policy "sessions_self_write" on sessions for all using (
  user_id in (select id from profiles where clerk_user_id = (auth.jwt() ->> 'sub'))
);

-- messages + feedback: idem, via session
create policy "messages_self_read" on session_messages for select using (
  session_id in (
    select s.id from sessions s
    join profiles p on p.id = s.user_id
    where p.clerk_user_id = (auth.jwt() ->> 'sub')
  )
);
create policy "feedback_self_read" on session_feedback for select using (
  session_id in (
    select s.id from sessions s
    join profiles p on p.id = s.user_id
    where p.clerk_user_id = (auth.jwt() ->> 'sub')
  )
);
create policy "badges_self_read" on user_badges for select using (
  user_id in (select id from profiles where clerk_user_id = (auth.jwt() ->> 'sub'))
);

-- cases: lecture publique, pas d'écriture côté client
alter table cases enable row level security;
create policy "cases_public_read" on cases for select using (true);
