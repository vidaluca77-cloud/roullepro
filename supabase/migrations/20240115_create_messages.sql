-- Migration: Création de la table messages
create table if not exists public.messages (
  id uuid default gen_random_uuid() primary key,
  annonce_id uuid not null references public.annonces(id) on delete cascade,
  sender_email text not null,
  sender_name text not null,
  message text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Index pour requêtes rapides sur annonce_id
create index if not exists messages_annonce_id_idx on public.messages(annonce_id);

-- RLS policies
alter table public.messages enable row level security;

-- Tout le monde peut insérer un message (y compris non connecté)
create policy "Anyone can send messages" on public.messages
  for insert with check (true);

-- Seul le propriétaire de l'annonce peut lire les messages qui lui sont destinés
create policy "Annonce owner can read messages" on public.messages
  for select using (
    exists (
      select 1 from public.annonces
      where annonces.id = messages.annonce_id
      and annonces.user_id = auth.uid()
    )
  );
