-- Forum entre pros — schéma + RLS + anti-abus
-- Tables dédiées, n'impacte aucune table existante de RoullePro.
-- « Pro vérifié » = utilisateur authentifié ayant au moins un claim
--   sanitaire_claims.status = 'verified'. Admin = profiles.role = 'admin'.

-- ────────────────────────────────────────────────────────────────
-- Helper : is_verified_pro(uid) — SECURITY DEFINER
-- Contourne la RLS de sanitaire_claims pour évaluer les policies du forum.
-- ────────────────────────────────────────────────────────────────
create or replace function public.is_verified_pro(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.sanitaire_claims c
    where c.user_id = uid and c.status = 'verified'
  );
$$;

-- Helper : is_forum_admin(uid)
create or replace function public.is_forum_admin(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = uid and p.role = 'admin'
  );
$$;

-- ────────────────────────────────────────────────────────────────
-- Tables
-- ────────────────────────────────────────────────────────────────
create table if not exists public.forum_categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  nom text not null,
  description text,
  ordre integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.forum_threads (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.forum_categories(id) on delete cascade,
  author_user_id uuid references auth.users(id) on delete set null,
  titre text not null check (char_length(titre) between 3 and 200),
  slug text not null,
  is_locked boolean not null default false,
  is_pinned boolean not null default false,
  view_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (category_id, slug)
);

create index if not exists idx_forum_threads_category on public.forum_threads(category_id, is_pinned desc, updated_at desc);
create index if not exists idx_forum_threads_author on public.forum_threads(author_user_id);

create table if not exists public.forum_posts (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.forum_threads(id) on delete cascade,
  author_user_id uuid references auth.users(id) on delete set null,
  contenu text not null check (char_length(contenu) between 1 and 10000),
  is_deleted boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_forum_posts_thread on public.forum_posts(thread_id, created_at asc);
create index if not exists idx_forum_posts_author on public.forum_posts(author_user_id);

create table if not exists public.forum_reports (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.forum_posts(id) on delete cascade,
  reporter_user_id uuid references auth.users(id) on delete set null,
  raison text not null check (char_length(raison) between 3 and 1000),
  status text not null default 'pending' check (status in ('pending','reviewed','dismissed')),
  created_at timestamptz not null default now()
);

create index if not exists idx_forum_reports_status on public.forum_reports(status, created_at desc);
create index if not exists idx_forum_reports_post on public.forum_reports(post_id);

-- ────────────────────────────────────────────────────────────────
-- Trigger updated_at
-- ────────────────────────────────────────────────────────────────
create or replace function public.set_updated_at_forum()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_forum_threads_updated on public.forum_threads;
create trigger trg_forum_threads_updated
  before update on public.forum_threads
  for each row execute function public.set_updated_at_forum();

drop trigger if exists trg_forum_posts_updated on public.forum_posts;
create trigger trg_forum_posts_updated
  before update on public.forum_posts
  for each row execute function public.set_updated_at_forum();

-- Remonte le fil (updated_at) quand une réponse y est ajoutée.
create or replace function public.bump_forum_thread()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.forum_threads set updated_at = now() where id = new.thread_id;
  return new;
end;
$$;

drop trigger if exists trg_forum_posts_bump_thread on public.forum_posts;
create trigger trg_forum_posts_bump_thread
  after insert on public.forum_posts
  for each row execute function public.bump_forum_thread();

-- ────────────────────────────────────────────────────────────────
-- Anti-abus : rate limit vérifié en SQL (triggers BEFORE INSERT)
--   - 1 nouveau fil / 2 min / utilisateur
--   - 1 réponse / 30 s / utilisateur
-- ────────────────────────────────────────────────────────────────
create or replace function public.forum_threads_rate_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.author_user_id is not null and exists (
    select 1 from public.forum_threads t
    where t.author_user_id = new.author_user_id
      and t.created_at > now() - interval '2 minutes'
  ) then
    raise exception 'Merci de patienter avant de créer un nouveau sujet (1 sujet / 2 min).'
      using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_forum_threads_rate_limit on public.forum_threads;
create trigger trg_forum_threads_rate_limit
  before insert on public.forum_threads
  for each row execute function public.forum_threads_rate_limit();

create or replace function public.forum_posts_rate_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.author_user_id is not null and exists (
    select 1 from public.forum_posts p
    where p.author_user_id = new.author_user_id
      and p.created_at > now() - interval '30 seconds'
  ) then
    raise exception 'Merci de patienter avant de publier un nouveau message (1 message / 30 s).'
      using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_forum_posts_rate_limit on public.forum_posts;
create trigger trg_forum_posts_rate_limit
  before insert on public.forum_posts
  for each row execute function public.forum_posts_rate_limit();

-- ────────────────────────────────────────────────────────────────
-- Incrément des vues (SECURITY DEFINER, appelable en anon via RPC)
-- ────────────────────────────────────────────────────────────────
create or replace function public.increment_forum_thread_views(p_thread_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.forum_threads
    set view_count = view_count + 1
  where id = p_thread_id;
$$;

-- ────────────────────────────────────────────────────────────────
-- RLS
-- ────────────────────────────────────────────────────────────────
alter table public.forum_categories enable row level security;
alter table public.forum_threads    enable row level security;
alter table public.forum_posts       enable row level security;
alter table public.forum_reports     enable row level security;

-- Catégories : lecture publique, écriture admin seulement.
drop policy if exists "forum_categories_public_read" on public.forum_categories;
create policy "forum_categories_public_read" on public.forum_categories
  for select using (true);

drop policy if exists "forum_categories_admin_write" on public.forum_categories;
create policy "forum_categories_admin_write" on public.forum_categories
  for all using (public.is_forum_admin(auth.uid()))
  with check (public.is_forum_admin(auth.uid()));

-- Fils : lecture publique.
drop policy if exists "forum_threads_public_read" on public.forum_threads;
create policy "forum_threads_public_read" on public.forum_threads
  for select using (true);

-- Création de fil : pro vérifié, auteur = soi-même.
drop policy if exists "forum_threads_verified_insert" on public.forum_threads;
create policy "forum_threads_verified_insert" on public.forum_threads
  for insert with check (
    author_user_id = auth.uid() and public.is_verified_pro(auth.uid())
  );

-- Édition : son propre fil (hors verrouillage) ou admin.
drop policy if exists "forum_threads_owner_update" on public.forum_threads;
create policy "forum_threads_owner_update" on public.forum_threads
  for update using (
    (author_user_id = auth.uid() and is_locked = false) or public.is_forum_admin(auth.uid())
  )
  with check (
    author_user_id = auth.uid() or public.is_forum_admin(auth.uid())
  );

-- Suppression : son propre fil ou admin.
drop policy if exists "forum_threads_owner_delete" on public.forum_threads;
create policy "forum_threads_owner_delete" on public.forum_threads
  for delete using (
    author_user_id = auth.uid() or public.is_forum_admin(auth.uid())
  );

-- Messages : lecture publique des messages non supprimés (admin voit tout).
drop policy if exists "forum_posts_public_read" on public.forum_posts;
create policy "forum_posts_public_read" on public.forum_posts
  for select using (
    is_deleted = false or public.is_forum_admin(auth.uid())
  );

-- Réponse : pro vérifié, auteur = soi-même, fil non verrouillé.
drop policy if exists "forum_posts_verified_insert" on public.forum_posts;
create policy "forum_posts_verified_insert" on public.forum_posts
  for insert with check (
    author_user_id = auth.uid()
    and public.is_verified_pro(auth.uid())
    and exists (
      select 1 from public.forum_threads t
      where t.id = thread_id and t.is_locked = false
    )
  );

-- Édition : son propre message ou admin.
drop policy if exists "forum_posts_owner_update" on public.forum_posts;
create policy "forum_posts_owner_update" on public.forum_posts
  for update using (
    author_user_id = auth.uid() or public.is_forum_admin(auth.uid())
  )
  with check (
    author_user_id = auth.uid() or public.is_forum_admin(auth.uid())
  );

-- Suppression physique : admin seulement (les pros font une suppression douce via update is_deleted).
drop policy if exists "forum_posts_admin_delete" on public.forum_posts;
create policy "forum_posts_admin_delete" on public.forum_posts
  for delete using (public.is_forum_admin(auth.uid()));

-- Signalements : création par pro vérifié (reporter = soi-même).
drop policy if exists "forum_reports_verified_insert" on public.forum_reports;
create policy "forum_reports_verified_insert" on public.forum_reports
  for insert with check (
    reporter_user_id = auth.uid() and public.is_verified_pro(auth.uid())
  );

-- Lecture / traitement des signalements : admin seulement.
drop policy if exists "forum_reports_admin_read" on public.forum_reports;
create policy "forum_reports_admin_read" on public.forum_reports
  for select using (public.is_forum_admin(auth.uid()));

drop policy if exists "forum_reports_admin_update" on public.forum_reports;
create policy "forum_reports_admin_update" on public.forum_reports
  for update using (public.is_forum_admin(auth.uid()))
  with check (public.is_forum_admin(auth.uid()));

-- ────────────────────────────────────────────────────────────────
-- Seed initial des catégories
-- ────────────────────────────────────────────────────────────────
insert into public.forum_categories (slug, nom, description, ordre) values
  ('conventionnement-cpam',   'Conventionnement CPAM',                    'Agréments, conventionnement, relations avec l''Assurance Maladie.', 1),
  ('facturation-rejets',       'Facturation & rejets',                     'Télétransmission, factures, rejets et indus.',                       2),
  ('reglementation',           'Réglementation (taxi/VSL/ambulance)',      'Cadre légal, obligations, contrôles et évolutions réglementaires.',  3),
  ('materiel-vehicules',       'Matériel & véhicules',                     'Achat, entretien, équipement et homologation des véhicules.',       4),
  ('emploi-rh',                'Emploi & RH',                              'Recrutement, contrats, formation et gestion du personnel.',         5),
  ('entraide-confreres',       'Entraide entre confrères',                 'Conseils, retours d''expérience et coups de main entre pros.',       6),
  ('annonces-divers',          'Annonces & divers',                       'Petites annonces, sujets divers et hors catégorie.',                7)
on conflict (slug) do nothing;
