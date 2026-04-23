-- Annuaire transport sanitaire — schéma MVP
-- Tables dédiées, n'impacte aucune table existante de RoullePro

create table if not exists pros_sanitaire (
  id uuid primary key default gen_random_uuid(),
  siret text unique not null,
  siren text not null,
  raison_sociale text not null,
  nom_commercial text,
  slug text unique not null,
  categorie text not null check (categorie in ('ambulance','vsl','taxi_conventionne')),
  naf text,
  adresse text,
  code_postal text not null,
  ville text not null,
  ville_slug text not null,
  departement text not null,
  region text not null,
  latitude double precision,
  longitude double precision,
  telephone_public text,
  email_public text,
  site_web text,
  horaires jsonb,
  description text,
  services text[],
  photos text[],
  logo_url text,
  video_url text,
  claimed boolean default false,
  claimed_by uuid references auth.users(id) on delete set null,
  claimed_at timestamptz,
  plan text default 'gratuit' check (plan in ('gratuit','essential','premium','pro_plus')),
  plan_active_until timestamptz,
  stripe_customer_id text,
  stripe_subscription_id text,
  vues_totales integer default 0,
  appels_cliques integer default 0,
  verified boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_pros_sanitaire_ville_slug on pros_sanitaire(ville_slug);
create index if not exists idx_pros_sanitaire_categorie on pros_sanitaire(categorie);
create index if not exists idx_pros_sanitaire_region on pros_sanitaire(region);
create index if not exists idx_pros_sanitaire_plan on pros_sanitaire(plan);
create index if not exists idx_pros_sanitaire_claimed on pros_sanitaire(claimed);
create index if not exists idx_pros_sanitaire_ville_cat on pros_sanitaire(ville_slug, categorie);

create table if not exists sanitaire_claims (
  id uuid primary key default gen_random_uuid(),
  pro_id uuid not null references pros_sanitaire(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  method text not null check (method in ('email_domaine','sms')),
  contact text not null,
  code text not null,
  status text default 'pending' check (status in ('pending','verified','rejected','expired')),
  attempts integer default 0,
  expires_at timestamptz not null,
  created_at timestamptz default now(),
  verified_at timestamptz
);

create index if not exists idx_sanitaire_claims_pro_id on sanitaire_claims(pro_id);
create index if not exists idx_sanitaire_claims_status on sanitaire_claims(status);

create table if not exists sanitaire_messages (
  id uuid primary key default gen_random_uuid(),
  pro_id uuid not null references pros_sanitaire(id) on delete cascade,
  sender_name text not null,
  sender_email text not null,
  sender_phone text,
  content text not null,
  read_by_pro boolean default false,
  replied boolean default false,
  ip_hash text,
  created_at timestamptz default now()
);

create index if not exists idx_sanitaire_messages_pro_id on sanitaire_messages(pro_id, created_at desc);
create index if not exists idx_sanitaire_messages_unread on sanitaire_messages(pro_id) where read_by_pro = false;

create table if not exists sanitaire_replies (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references sanitaire_messages(id) on delete cascade,
  content text not null,
  created_at timestamptz default now()
);

create table if not exists sanitaire_vues (
  id uuid primary key default gen_random_uuid(),
  pro_id uuid not null references pros_sanitaire(id) on delete cascade,
  ip_hash text,
  user_agent text,
  referrer text,
  created_at timestamptz default now()
);

create index if not exists idx_sanitaire_vues_pro_date on sanitaire_vues(pro_id, created_at desc);

-- RLS
alter table pros_sanitaire enable row level security;
alter table sanitaire_claims enable row level security;
alter table sanitaire_messages enable row level security;
alter table sanitaire_replies enable row level security;
alter table sanitaire_vues enable row level security;

-- Lecture publique des fiches (c'est un annuaire)
drop policy if exists "pros_sanitaire_public_read" on pros_sanitaire;
create policy "pros_sanitaire_public_read" on pros_sanitaire
  for select using (true);

-- Le pro propriétaire peut mettre à jour sa fiche
drop policy if exists "pros_sanitaire_owner_update" on pros_sanitaire;
create policy "pros_sanitaire_owner_update" on pros_sanitaire
  for update using (claimed_by = auth.uid());

-- Messages : seul le pro propriétaire peut les lire
drop policy if exists "sanitaire_messages_owner_read" on sanitaire_messages;
create policy "sanitaire_messages_owner_read" on sanitaire_messages
  for select using (
    exists (select 1 from pros_sanitaire p where p.id = pro_id and p.claimed_by = auth.uid())
  );

-- Envoi de message public via API route (service role) — pas d'insert direct
drop policy if exists "sanitaire_messages_no_public_insert" on sanitaire_messages;
create policy "sanitaire_messages_no_public_insert" on sanitaire_messages
  for insert with check (false);

-- Réponses : seul le pro propriétaire
drop policy if exists "sanitaire_replies_owner" on sanitaire_replies;
create policy "sanitaire_replies_owner" on sanitaire_replies
  for all using (
    exists (
      select 1 from sanitaire_messages m
      join pros_sanitaire p on p.id = m.pro_id
      where m.id = message_id and p.claimed_by = auth.uid()
    )
  );

-- Claims : accessible à l'utilisateur qui réclame
drop policy if exists "sanitaire_claims_user" on sanitaire_claims;
create policy "sanitaire_claims_user" on sanitaire_claims
  for all using (user_id = auth.uid() or user_id is null);

-- Vues : insertion via API route service role
drop policy if exists "sanitaire_vues_no_public" on sanitaire_vues;
create policy "sanitaire_vues_no_public" on sanitaire_vues
  for select using (
    exists (select 1 from pros_sanitaire p where p.id = pro_id and p.claimed_by = auth.uid())
  );

-- Trigger updated_at
create or replace function set_updated_at_sanitaire()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_pros_sanitaire_updated on pros_sanitaire;
create trigger trg_pros_sanitaire_updated
  before update on pros_sanitaire
  for each row execute function set_updated_at_sanitaire();
