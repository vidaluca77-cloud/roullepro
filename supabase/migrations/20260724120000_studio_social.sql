-- Studio réseaux sociaux IA — fondations, connexions OAuth et publication auto.
--
-- Trois objets : les connexions aux réseaux (tokens CHIFFRÉS, côté serveur), les
-- posts générés/planifiés, et les compteurs mensuels de quota (monotones).
--
-- Modèle de sécurité :
--   * social_connections : aucun privilège client sur les colonnes de tokens.
--     Le client ne peut lire que les colonnes non sensibles (grant colonne par
--     colonne) et passe par la vue social_connections_public pour l'affichage.
--     Toutes les écritures passent par les routes API en service_role.
--   * social_posts : le client a UNIQUEMENT le SELECT de ses lignes. Insert /
--     update / delete sont révoqués : les routes API (service_role) sont seules à
--     écrire, ce qui garantit le gating plan, les quotas, la validation du contenu
--     et les transitions de statut.
--   * studio_social_usage : compteurs mensuels incrémentés atomiquement par une
--     fonction security definer. Ils ne redescendent jamais du fait d'une
--     suppression de post (le quota n'est donc pas contournable).
--
-- Migration idempotente et re-jouable. NON appliquée ici : à jouer côté Supabase
-- par Lucas (Netlify n'applique pas les migrations).

-- ─────────────────────────────────────────────────────────────
-- 1. social_connections : une connexion par (pro, provider)
-- ─────────────────────────────────────────────────────────────
create table if not exists public.social_connections (
  id                     uuid primary key default gen_random_uuid(),
  pro_id                 uuid not null references public.pros_sanitaire(id) on delete cascade,
  provider               text not null check (provider in ('facebook', 'instagram', 'google_business')),
  account_id             text,
  account_name           text,
  -- Tokens chiffrés applicativement (AES-256-GCM, clé STUDIO_SOCIAL_TOKEN_KEY).
  -- Format : 'v1.<iv b64>.<tag b64>.<ciphertext b64>' (cf. src/lib/studio-social-crypto.ts).
  access_token_chiffre   text,
  refresh_token_chiffre  text,
  token_expires_at       timestamptz,
  scopes                 text,
  -- Locations / pages disponibles, pour un choix ultérieur côté UI (jamais de token).
  account_metadata       jsonb not null default '{}'::jsonb,
  statut                 text not null default 'active' check (statut in ('active', 'revoked', 'error')),
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now(),
  constraint social_connections_pro_provider_unique unique (pro_id, provider)
);

-- Rattrapage si une version antérieure de cette migration (tokens en clair) a été jouée.
alter table public.social_connections add column if not exists access_token_chiffre  text;
alter table public.social_connections add column if not exists refresh_token_chiffre text;
alter table public.social_connections add column if not exists account_metadata      jsonb not null default '{}'::jsonb;
alter table public.social_connections drop column if exists access_token;
alter table public.social_connections drop column if exists refresh_token;

create index if not exists idx_social_connections_pro_id
  on public.social_connections (pro_id);

alter table public.social_connections enable row level security;

-- Aucun privilège direct pour les rôles clients, puis SELECT accordé colonne par
-- colonne : `select access_token_chiffre` échoue même pour le propriétaire de la ligne.
revoke all on public.social_connections from anon, authenticated;
grant select (
  id, pro_id, provider, account_id, account_name,
  token_expires_at, scopes, statut, created_at, updated_at
) on public.social_connections to authenticated;

-- RLS : le pro ne voit que les connexions de SES fiches.
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
end$$;

-- Les écritures passent exclusivement par les routes API (service_role) :
-- pas de policy insert / update / delete.
drop policy if exists "social_connections_delete_own" on public.social_connections;

-- Vue d'affichage sans aucune colonne de token (RLS du pro appliquée : security_invoker).
drop view if exists public.social_connections_public;
create view public.social_connections_public
with (security_invoker = true) as
  select id, pro_id, provider, account_id, account_name,
         token_expires_at, statut, created_at, updated_at
  from public.social_connections;

grant select on public.social_connections_public to authenticated;

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
  statut           text not null default 'brouillon',
  scheduled_at     timestamptz,
  published_at     timestamptz,
  resultats        jsonb not null default '{}'::jsonb,
  genere_par_ia    boolean not null default false,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- 'publication_en_cours' = post réclamé par un run du cron (claim atomique).
-- Contrainte recréée pour rattraper une version antérieure de la migration.
alter table public.social_posts drop constraint if exists social_posts_statut_check;
alter table public.social_posts add constraint social_posts_statut_check
  check (statut in ('brouillon', 'planifie', 'publication_en_cours', 'publie', 'echec', 'annule'));

create index if not exists idx_social_posts_pro_id
  on public.social_posts (pro_id, created_at desc);

-- Index dédié au cron de publication : posts planifiés dont l'heure est échue.
create index if not exists idx_social_posts_planifie
  on public.social_posts (scheduled_at)
  where statut = 'planifie';

-- Index pour le balayage des claims orphelins (run interrompu).
create index if not exists idx_social_posts_en_cours
  on public.social_posts (updated_at)
  where statut = 'publication_en_cours';

alter table public.social_posts enable row level security;

-- Lecture seule côté client : toute écriture passe par les routes API (service_role).
revoke all on public.social_posts from anon, authenticated;
grant select on public.social_posts to authenticated;

drop policy if exists "social_posts_insert_own" on public.social_posts;
drop policy if exists "social_posts_update_own" on public.social_posts;
drop policy if exists "social_posts_delete_own" on public.social_posts;

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
end$$;

-- ─────────────────────────────────────────────────────────────
-- 3. studio_social_usage : compteurs mensuels de quota (monotones)
-- ─────────────────────────────────────────────────────────────
-- `mois` est le mois calendaire Europe/Paris au format 'YYYY-MM', calculé côté
-- application (cf. moisParis dans src/lib/studio-social.ts).
create table if not exists public.studio_social_usage (
  pro_id        uuid not null references public.pros_sanitaire(id) on delete cascade,
  mois          text not null,
  posts_generes integer not null default 0,
  publications  integer not null default 0,
  updated_at    timestamptz not null default now(),
  primary key (pro_id, mois)
);

alter table public.studio_social_usage enable row level security;

revoke all on public.studio_social_usage from anon, authenticated;
grant select on public.studio_social_usage to authenticated;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='studio_social_usage' and policyname='studio_social_usage_select_own') then
    create policy "studio_social_usage_select_own" on public.studio_social_usage
      for select using (
        exists (
          select 1 from public.pros_sanitaire p
          where p.id = studio_social_usage.pro_id
            and p.claimed_by = (select auth.uid())
        )
      );
  end if;
end$$;

-- Incrément atomique des compteurs du mois. Appelé par le backend (service_role)
-- AVANT l'action coûteuse : le total renvoyé sert de réservation, ce qui supprime
-- la course lecture-puis-écriture. Un delta négatif rembourse une réservation non
-- consommée (échec de génération / aucune publication réussie) ; les compteurs sont
-- bornés à 0 et ne descendent jamais du fait d'une suppression de post.
create or replace function public.studio_social_incrementer(
  p_pro_id uuid,
  p_mois text,
  p_generes integer default 0,
  p_publications integer default 0
)
returns table (posts_generes integer, publications integer)
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.studio_social_usage as u (pro_id, mois, posts_generes, publications)
    values (p_pro_id, p_mois, greatest(0, p_generes), greatest(0, p_publications))
  on conflict (pro_id, mois) do update
    set posts_generes = greatest(0, u.posts_generes + p_generes),
        publications  = greatest(0, u.publications + p_publications),
        updated_at    = now()
  returning u.posts_generes, u.publications
  into posts_generes, publications;
  return next;
end;
$$;

revoke all on function public.studio_social_incrementer(uuid, text, integer, integer) from anon, authenticated;

-- ─────────────────────────────────────────────────────────────
-- Triggers updated_at
-- ─────────────────────────────────────────────────────────────
create or replace function public.touch_studio_social_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_social_connections_updated_at on public.social_connections;
create trigger trg_social_connections_updated_at
  before update on public.social_connections
  for each row execute function public.touch_studio_social_updated_at();

drop trigger if exists trg_social_posts_updated_at on public.social_posts;
create trigger trg_social_posts_updated_at
  before update on public.social_posts
  for each row execute function public.touch_studio_social_updated_at();
