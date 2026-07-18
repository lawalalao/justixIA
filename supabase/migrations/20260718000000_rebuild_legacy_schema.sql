-- 20260718000000_rebuild_legacy_schema.sql
--
-- Reconstruction complète du schéma du site statique (justixia.xyz),
-- après suppression accidentelle du projet Supabase d'origine.
-- Schéma déduit de api/index.py (toutes les tables/colonnes utilisées)
-- et de 20260420000000_enable_rls.sql (policies).
--
-- À exécuter dans le SQL Editor d'un projet Supabase NEUF, dédié au site
-- statique (ne PAS l'exécuter sur le projet de l'app Next.js justixia-app).

create extension if not exists pgcrypto;

-- ── ORGANIZATIONS (comptes associations) ─────────────────────────────────
create table if not exists public.organizations (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  plan       text not null default 'starter' check (plan in ('starter', 'pro')),
  owner_id   uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- ── PROFILES (1 ligne par utilisateur auth) ──────────────────────────────
create table if not exists public.profiles (
  id               uuid primary key references auth.users(id) on delete cascade,
  email            text,
  account_type     text not null default 'particulier'
                   check (account_type in ('particulier', 'association')),
  plan             text not null default 'free'
                   check (plan in ('free', 'oneshot', 'starter', 'pro')),
  org_id           uuid references public.organizations(id) on delete set null,
  referral_credits int not null default 0,
  created_at       timestamptz not null default now()
);

-- ── ORGANIZATION MEMBERS (membres + invitations en attente) ──────────────
create table if not exists public.organization_members (
  id            uuid primary key default gen_random_uuid(),
  org_id        uuid not null references public.organizations(id) on delete cascade,
  user_id       uuid references auth.users(id) on delete cascade,
  invited_email text,
  role          text not null default 'member' check (role in ('owner', 'member')),
  status        text not null default 'pending' check (status in ('pending', 'active')),
  created_at    timestamptz not null default now()
);
create index if not exists idx_org_members_org on public.organization_members(org_id);

-- ── CASES (dossiers = analyses sauvegardées) ─────────────────────────────
create table if not exists public.cases (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references auth.users(id) on delete cascade,
  org_id        uuid references public.organizations(id) on delete set null,
  reference     text,
  type_document text,
  resume        text,
  irregularites jsonb,
  droits        jsonb,
  delais        text,
  lettre        text,
  langue        text,
  notes         text,
  status        text not null default 'open' check (status in ('open', 'progress', 'resolved')),
  created_at    timestamptz not null default now()
);
create index if not exists idx_cases_user on public.cases(user_id);
create index if not exists idx_cases_org  on public.cases(org_id);

-- ── AVIS (NPS 0-10) ──────────────────────────────────────────────────────
create table if not exists public.avis (
  id         uuid primary key default gen_random_uuid(),
  score      int not null check (score between 0 and 10),
  comment    text,
  name       text,
  role       text,
  created_at timestamptz not null default now()
);
create index if not exists idx_avis_created on public.avis(created_at desc);

-- ── PROMO CODES (créés à la main par l'admin) ────────────────────────────
create table if not exists public.promo_codes (
  id           uuid primary key default gen_random_uuid(),
  code         text unique not null,
  plan_granted text not null default 'starter',
  max_uses     int,
  uses_count   int not null default 0,
  expires_at   timestamptz,
  active       boolean not null default true,
  created_at   timestamptz not null default now()
);

-- ── REFERRAL CODES (parrainage, format JX...) ────────────────────────────
create table if not exists public.referral_codes (
  id         uuid primary key default gen_random_uuid(),
  code       text unique not null,
  owner_id   uuid not null references auth.users(id) on delete cascade,
  active     boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.referral_uses (
  id               uuid primary key default gen_random_uuid(),
  referral_code_id uuid references public.referral_codes(id) on delete set null,
  owner_id         uuid not null,
  beneficiary_id   uuid not null,
  created_at       timestamptz not null default now()
);
create index if not exists idx_referral_uses_beneficiary on public.referral_uses(beneficiary_id);

-- ── TELEGRAM SESSIONS (bot) ──────────────────────────────────────────────
create table if not exists public.telegram_sessions (
  chat_id    text primary key,
  langue     text,
  tg_user_id text,            -- supabase user id lié au chat (voir _tg_link_user)
  promo_plan text,
  updated_at timestamptz not null default now()
);

-- ── TRIGGER : création auto du profil à l'inscription ────────────────────
-- Le backend suppose qu'un profil existe pour chaque utilisateur
-- (commentaire "trigger race" dans /api/analyze). Le type de compte et le
-- nom d'organisation viennent des metadata passées par register.html
-- (options.data = { account_type, organization }).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  v_account_type text := coalesce(new.raw_user_meta_data ->> 'account_type', 'particulier');
  v_org_name     text := new.raw_user_meta_data ->> 'organization';
  v_org_id       uuid;
begin
  if v_account_type not in ('particulier', 'association') then
    v_account_type := 'particulier';
  end if;

  -- Association : créer l'organisation + le siège du directeur
  if v_account_type = 'association' and v_org_name is not null and length(trim(v_org_name)) > 0 then
    insert into public.organizations (name, owner_id)
    values (trim(v_org_name), new.id)
    returning id into v_org_id;

    insert into public.organization_members (org_id, user_id, invited_email, role, status)
    values (v_org_id, new.id, new.email, 'owner', 'active');
  end if;

  insert into public.profiles (id, email, account_type, org_id)
  values (new.id, new.email, v_account_type, v_org_id)
  on conflict (id) do nothing;

  -- Invitation en attente : rattacher le nouveau compte à l'organisation
  if v_org_id is null then
    update public.organization_members
       set user_id = new.id, status = 'active'
     where invited_email = new.email and status = 'pending';

    select org_id into v_org_id
      from public.organization_members
     where user_id = new.id and status = 'active'
     limit 1;

    if v_org_id is not null then
      update public.profiles set org_id = v_org_id where id = new.id;
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── RLS ──────────────────────────────────────────────────────────────────
-- Le backend utilise la clé service_role (bypass RLS). Le frontend n'utilise
-- la clé anon que pour auth.*. On verrouille donc tout, avec quelques
-- policies de lecture par propriétaire (reprises de la migration RLS).
alter table public.profiles             enable row level security;
alter table public.organizations        enable row level security;
alter table public.organization_members enable row level security;
alter table public.cases                enable row level security;
alter table public.avis                 enable row level security;
alter table public.promo_codes          enable row level security;
alter table public.referral_codes       enable row level security;
alter table public.referral_uses        enable row level security;
alter table public.telegram_sessions    enable row level security;

create policy "profiles_select_own" on public.profiles
  for select to authenticated using (auth.uid() = id);

create policy "cases_select_own" on public.cases
  for select to authenticated using (auth.uid() = user_id);
create policy "cases_insert_own" on public.cases
  for insert to authenticated with check (auth.uid() = user_id);
create policy "cases_update_own" on public.cases
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "cases_delete_own" on public.cases
  for delete to authenticated using (auth.uid() = user_id);

create policy "referral_codes_select_own" on public.referral_codes
  for select to authenticated using (auth.uid() = owner_id);

create policy "referral_uses_select_own_or_beneficiary" on public.referral_uses
  for select to authenticated using (auth.uid() = owner_id or auth.uid() = beneficiary_id);

-- avis, promo_codes, telegram_sessions, organizations, organization_members :
-- aucune policy permissive, accès uniquement via le backend (service_role).
