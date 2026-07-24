-- Studio réseaux sociaux IA — Fondations (Lot 1) + connexions OAuth (Lot 2).
-- Deux tables : connexions aux réseaux (tokens côté serveur) et posts générés/planifiés.
-- Le quota (8 posts générés + 8 publications par mois calendaire Europe/Paris) est
-- calculé à la volée côté application (cf. src/lib/studio-social.ts), sans table dédiée.
--
-- RLS : chaque pro ne voit/écrit que les lignes de SES fiches pros_sanitaire
-- (pros_sanitaire.claimed_by = auth.uid()). Le backend utilise le service_role
-- (bypass RLS) pour la génération IA, le stockage des tokens et la publication.
--
-- Migration idempotente. NON appliquée ici : à jouer côté Supabase par Lucas
-- (Netlify n'applique pas les migrations).

-- ─────────────────────────────────────────────────────────────
-- 1. social_connections : un token par (pro, provider)
-- ─────────────────────────────────────────────────────────────
create table if not exists public.social_connections (
  id               uuid primary key default gen_random_uuid(),
  pro_id           uuid not null references public.pros_sanitaire(id) on delete cascade,
  provider         text not null check (provider in ('facebook', 'instagram', 'google_business')),
  account_id       text,
  account_name     text,
  access_token     text,
  refresh_token    text,
  token_expires_at timestamptz,
  scopes           text,
  statut           text not null default 'active' check (statut in ('active', 'revoked', 'error')),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  constraint social_connections_pro_provider_unique unique (pro_id, provider)
);

create index if not exists idx_social_connections_pro_id
  on public.social_connections (pro_id);

alter table public.social_connections enable row level security;

-- RLS : le pro voit/gère les connexions de ses fiches. Les tokens ne sont JAMAIS
-- renvoyés au client (les routes API sélectionnent des colonnes restreintes),
-- mais la policy autorise la lecture pour l'affichage du statut connecté/déconnecté.
do $$
begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='social_connections' and policyname='social_connections_select_own') then
    create policy "social_connections_select_own" on public.social_connections
      for select using (
        exists (
          select 1 from public.pros_sanitaire p
          where p.id = social_connections.pro_id
            and p.claimed_by = (select auth.uid())
        )
      );
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='social_connections' and policyname='social_connections_delete_own') then
    create policy "social_connections_delete_own" on public.social_connections
      for delete using (
        exists (
          select 1 from public.pros_sanitaire p
          where p.id = social_connections.pro_id
            and p.claimed_by = (select auth.uid())
        )
      );
  end if;
end$$;

-- ─────────────────────────────────────────────────────────────
-- 2. social_posts : posts générés / planifiés / publiés
-- ─────────────────────────────────────────────────────────────
create table if not exists public.social_posts (
  id               uuid primary key default gen_random_uuid(),
  pro_id           uuid not null references public.pros_sanitaire(id) on delete cascade,
  sujet            text,
  contenu          text not null default '',
  hashtags         text[] not null default '{}',
  image_url        text,
  providers_cibles text[] not null default '{}',
  statut           text not null default 'brouillon'
                     check (statut in ('brouillon', 'planifie', 'publie', 'echec', 'annule')),
  scheduled_at     timestamptz,
  published_at     timestamptz,
  resultats        jsonb not null default '{}'::jsonb,
  genere_par_ia    boolean not null default false,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists idx_social_posts_pro_id
  on public.social_posts (pro_id, created_at desc);

-- Index dédié au cron de publication : posts planifiés dont l'heure est échue.
create index if not exists idx_social_posts_planifie
  on public.social_posts (scheduled_at)
  where statut = 'planifie';

alter table public.social_posts enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='social_posts' and policyname='social_posts_select_own') then
    create policy "social_posts_select_own" on public.social_posts
      for select using (
        exists (
          select 1 from public.pros_sanitaire p
          where p.id = social_posts.pro_id
            and p.claimed_by = (select auth.uid())
        )
      );
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='social_posts' and policyname='social_posts_insert_own') then
    create policy "social_posts_insert_own" on public.social_posts
      for insert with check (
        exists (
          select 1 from public.pros_sanitaire p
          where p.id = social_posts.pro_id
            and p.claimed_by = (select auth.uid())
        )
      );
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='social_posts' and policyname='social_posts_update_own') then
    create policy "social_posts_update_own" on public.social_posts
      for update using (
        exists (
          select 1 from public.pros_sanitaire p
          where p.id = social_posts.pro_id
            and p.claimed_by = (select auth.uid())
        )
      ) with check (
        exists (
          select 1 from public.pros_sanitaire p
          where p.id = social_posts.pro_id
            and p.claimed_by = (select auth.uid())
        )
      );
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='social_posts' and policyname='social_posts_delete_own') then
    create policy "social_posts_delete_own" on public.social_posts
      for delete using (
        exists (
          select 1 from public.pros_sanitaire p
          where p.id = social_posts.pro_id
            and p.claimed_by = (select auth.uid())
        )
      );
  end if;
end$$;

-- ─────────────────────────────────────────────────────────────
-- Triggers updated_at
-- ─────────────────────────────────────────────────────────────
create or replace function public.touch_studio_social_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_social_connections_updated_at on public.social_connections;
create trigger trg_social_connections_updated_at
  before update on public.social_connections
  for each row execute function public.touch_studio_social_updated_at();

drop trigger if exists trg_social_posts_updated_at on public.social_posts;
create trigger trg_social_posts_updated_at
  before update on public.social_posts
  for each row execute function public.touch_studio_social_updated_at();
