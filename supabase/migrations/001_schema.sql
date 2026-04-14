-- RoullePro - Schema Supabase
-- Activer l'extension UUID
create extension if not exists "uuid-ossp";

-- ============================================
-- TABLE: profiles (liée à auth.users)
-- ============================================
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  prenom text,
  nom text,
  email text,
  telephone text,
  role text default 'vendeur' check (role in ('vendeur', 'admin')),
  created_at timestamp with time zone default now()
);

-- RLS profiles
alter table public.profiles enable row level security;
create policy "Lecture publique profils" on public.profiles for select using (true);
create policy "Utilisateur modifie son profil" on public.profiles for update using (auth.uid() = id);
create policy "Insert profil" on public.profiles for insert with check (auth.uid() = id);

-- Trigger: créer profil auto à l'inscription
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email, prenom, nom)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'prenom',
    new.raw_user_meta_data->>'nom'
  );
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================
-- TABLE: annonces
-- ============================================
create table if not exists public.annonces (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  titre text not null,
  description text,
  categorie text not null check (categorie in ('vtc','taxi','ambulance','transport-scolaire','navette','utilitaire','autre')),
  marque text not null,
  modele text not null,
  annee integer not null,
  kilometrage integer not null,
  carburant text not null check (carburant in ('Essence','Diesel','Hybride','Electrique','GPL')),
  boite text not null check (boite in ('Manuelle','Automatique')),
  couleur text,
  places integer default 5,
  prix numeric(10,2) not null,
  statut text default 'pending' check (statut in ('active','pending','suspended','sold')),
  photos text[] default array[]::text[],
  ville text,
  code_postal text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- RLS annonces
alter table public.annonces enable row level security;
create policy "Lecture annonces actives" on public.annonces for select using (statut = 'active' or auth.uid() = user_id);
create policy "Vendeur cree annonce" on public.annonces for insert with check (auth.uid() = user_id);
create policy "Vendeur modifie sa annonce" on public.annonces for update using (auth.uid() = user_id);
create policy "Vendeur supprime sa annonce" on public.annonces for delete using (auth.uid() = user_id);
create policy "Admin tout" on public.annonces for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- Trigger: updated_at auto
create or replace function public.update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger annonces_updated_at
  before update on public.annonces
  for each row execute procedure public.update_updated_at();

-- ============================================
-- TABLE: messages (contact vendeur)
-- ============================================
create table if not exists public.messages (
  id uuid default uuid_generate_v4() primary key,
  annonce_id uuid references public.annonces(id) on delete cascade not null,
  sender_id uuid references public.profiles(id) on delete set null,
  sender_email text not null,
  sender_nom text not null,
  sender_telephone text,
  contenu text not null,
  lu boolean default false,
  created_at timestamp with time zone default now()
);

-- RLS messages
alter table public.messages enable row level security;
create policy "Envoi message" on public.messages for insert with check (true);
create policy "Vendeur voit ses messages" on public.messages for select using (
  exists (select 1 from public.annonces where id = annonce_id and user_id = auth.uid())
  or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- ============================================
-- TABLE: favoris
-- ============================================
create table if not exists public.favoris (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  annonce_id uuid references public.annonces(id) on delete cascade not null,
  created_at timestamp with time zone default now(),
  unique(user_id, annonce_id)
);

-- RLS favoris
alter table public.favoris enable row level security;
create policy "User gere ses favoris" on public.favoris for all using (auth.uid() = user_id);

-- ============================================
-- STORAGE: bucket pour les photos
-- ============================================
insert into storage.buckets (id, name, public)
values ('annonces-photos', 'annonces-photos', true)
on conflict do nothing;

create policy "Upload photos" on storage.objects
  for insert with check (bucket_id = 'annonces-photos' and auth.role() = 'authenticated');

create policy "Lecture photos" on storage.objects
  for select using (bucket_id = 'annonces-photos');

create policy "Suppression photos" on storage.objects
  for delete using (bucket_id = 'annonces-photos' and auth.uid()::text = (storage.foldername(name))[1]);
