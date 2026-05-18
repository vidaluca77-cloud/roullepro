-- Phase 3 : assurer que pro_compliance_profiles a une contrainte UNIQUE (pro_id)
-- (1 profil de conformite par fiche pros_sanitaire revendiquee) + RLS user_id.
-- Idempotent : safe a executer plusieurs fois.

-- Table : creee en Phase 0a, on s'assure juste de son existence (best-effort).
create table if not exists public.pro_compliance_profiles (
  id uuid primary key default gen_random_uuid(),
  pro_id uuid not null,
  user_id uuid not null,
  metiers text[] not null default '{}',
  activites text[] not null default '{}',
  region_code text,
  fleet_size integer,
  sefi_certified boolean default false,
  custom_tags text[] default '{}',
  compliance_score integer,
  last_scored_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Colonnes manquantes (au cas ou la table existe deja sans certaines).
alter table public.pro_compliance_profiles
  add column if not exists metiers text[] default '{}',
  add column if not exists activites text[] default '{}',
  add column if not exists region_code text,
  add column if not exists fleet_size integer,
  add column if not exists sefi_certified boolean default false,
  add column if not exists custom_tags text[] default '{}',
  add column if not exists compliance_score integer,
  add column if not exists last_scored_at timestamptz,
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

-- Contrainte UNIQUE (pro_id) : 1 profil par fiche.
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'pro_compliance_profiles_pro_id_key'
  ) then
    alter table public.pro_compliance_profiles
      add constraint pro_compliance_profiles_pro_id_key unique (pro_id);
  end if;
end$$;

create index if not exists idx_pro_compliance_profiles_user_id
  on public.pro_compliance_profiles (user_id);

-- RLS : auth.uid() = user_id pour SELECT/INSERT/UPDATE/DELETE.
alter table public.pro_compliance_profiles enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'pro_compliance_profiles'
      and policyname = 'pro_compliance_profiles_select_own'
  ) then
    create policy "pro_compliance_profiles_select_own"
      on public.pro_compliance_profiles
      for select
      using (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'pro_compliance_profiles'
      and policyname = 'pro_compliance_profiles_insert_own'
  ) then
    create policy "pro_compliance_profiles_insert_own"
      on public.pro_compliance_profiles
      for insert
      with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'pro_compliance_profiles'
      and policyname = 'pro_compliance_profiles_update_own'
  ) then
    create policy "pro_compliance_profiles_update_own"
      on public.pro_compliance_profiles
      for update
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'pro_compliance_profiles'
      and policyname = 'pro_compliance_profiles_delete_own'
  ) then
    create policy "pro_compliance_profiles_delete_own"
      on public.pro_compliance_profiles
      for delete
      using (auth.uid() = user_id);
  end if;
end$$;

-- Trigger updated_at.
create or replace function public.touch_pro_compliance_profiles_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_pro_compliance_profiles_updated_at on public.pro_compliance_profiles;
create trigger trg_pro_compliance_profiles_updated_at
  before update on public.pro_compliance_profiles
  for each row execute function public.touch_pro_compliance_profiles_updated_at();
