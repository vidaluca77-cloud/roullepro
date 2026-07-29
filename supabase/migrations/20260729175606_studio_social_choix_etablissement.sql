-- Studio réseaux sociaux — écran de sélection d'établissement Google Business Profile.
--
-- Contexte : un compte Google peut gérer PLUSIEURS comptes/établissements GBP
-- (ex. un pro qui gère aussi la fiche d'un confrère). L'API `accounts.list` ne
-- garantit aucun ordre stable et ne signale pas lequel choisir. Avant ce
-- correctif, le callback OAuth prenait systématiquement le premier compte et
-- le premier établissement retournés, sans laisser le choix à l'utilisateur —
-- ce qui pouvait connecter silencieusement le mauvais établissement.
--
-- Ce correctif introduit un statut intermédiaire 'en_attente_choix' : quand
-- plusieurs comptes/établissements sont détectés, la connexion est stockée
-- avec ce statut et la liste complète (tous comptes confondus) en
-- `comptes_disponibles`. Le token d'accès est déjà stocké (chiffré) pour
-- permettre la validation finale sans nouvelle autorisation Google. Une fois
-- l'utilisateur passé par l'écran de sélection, la connexion passe à 'active'.
--
-- Migration idempotente et re-jouable. NON appliquée ici : à jouer côté
-- Supabase par Lucas (Netlify n'applique pas les migrations).

-- Nouvelle colonne : liste brute des comptes/établissements disponibles,
-- proposée à l'utilisateur tant que le choix n'est pas fait. Jamais de token
-- dedans (cohérent avec account_metadata).
alter table public.social_connections
  add column if not exists comptes_disponibles jsonb not null default '[]'::jsonb;

-- Élargissement de la contrainte de statut pour inclure l'état intermédiaire.
alter table public.social_connections drop constraint if exists social_connections_statut_check;
alter table public.social_connections add constraint social_connections_statut_check
  check (statut in ('active', 'revoked', 'error', 'en_attente_choix'));

-- La vue publique et les grants colonne-par-colonne existants couvrent déjà
-- statut/account_metadata ; on expose aussi comptes_disponibles en lecture
-- (toujours aucune colonne de token) pour que l'écran de choix fonctionne
-- sans passer par le service_role côté lecture.
grant select (comptes_disponibles) on public.social_connections to authenticated;

drop view if exists public.social_connections_public;
create view public.social_connections_public
with (security_invoker = true) as
  select id, pro_id, provider, account_id, account_name,
         token_expires_at, statut, comptes_disponibles, created_at, updated_at
  from public.social_connections;

grant select on public.social_connections_public to authenticated;
