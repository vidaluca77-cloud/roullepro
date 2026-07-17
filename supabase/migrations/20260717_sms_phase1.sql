-- Phase 1 SMS : notifications transactionnelles Brevo aux pros inscrits opt-in.
-- A APPLIQUER MANUELLEMENT sur Supabase apres merge (non executee par le code).
-- Le code applicatif tolere l'absence de ces colonnes/tables (try/catch).

-- Opt-in SMS + numero de mobile dedie sur les fiches pros.
alter table pros_sanitaire add column if not exists sms_notifications boolean not null default false;
alter table pros_sanitaire add column if not exists telephone_sms text;

-- Journal des SMS envoyes (succes ou echec) pour tracabilite et conformite.
create table if not exists sms_log (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  destinataire text not null,
  pro_id uuid,
  demande_id uuid,
  type text not null check (type in ('transactionnel','prospection')),
  contenu text not null,
  statut text not null default 'envoye',
  brevo_message_id text,
  erreur text
);

-- Liste d'exclusion (opt-out) : numeros a ne jamais contacter. Prete pour la
-- phase 2 (prospection) ; deja respectee des la phase 1 (transactionnel).
create table if not exists sms_optout (
  numero text primary key,
  created_at timestamptz not null default now(),
  source text
);

-- RLS activee sans policy publique : acces service_role uniquement.
alter table sms_log enable row level security;
alter table sms_optout enable row level security;
