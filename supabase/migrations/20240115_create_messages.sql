-- Migration: Table messages (déjà définie dans 001_schema.sql)
-- Colonnes réelles: id, annonce_id, sender_id, sender_email, sender_nom, sender_telephone, contenu, lu, created_at
-- Ce fichier sert de référence uniquement - la table est créée par 001_schema.sql

-- Index supplémentaire pour performances
create index if not exists messages_annonce_id_idx on public.messages(annonce_id);
create index if not exists messages_created_at_idx on public.messages(created_at desc);

-- Marquer les messages comme lus (update policy)
create policy if not exists "Vendeur marque messages lus" on public.messages
  for update using (
    exists (select 1 from public.annonces where id = annonce_id and user_id = auth.uid())
  );
