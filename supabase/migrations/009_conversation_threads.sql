-- Migration 009 : Système de conversations (threads)
-- Chaque conversation est identifiée par un thread_id = UUID du premier message
-- Les réponses du vendeur sont stockées dans la même table

-- 1. Ajouter les colonnes de threading
ALTER TABLE messages
  ADD COLUMN IF NOT EXISTS thread_id       UUID REFERENCES messages(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS is_seller_reply BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS seller_id_reply UUID REFERENCES profiles(id);

-- 2. Index pour récupérer rapidement tous les messages d'un thread
CREATE INDEX IF NOT EXISTS idx_messages_thread_id ON messages(thread_id);

-- 3. Vue pratique : dernière activité par thread (pour trier les conversations)
CREATE OR REPLACE VIEW conversation_threads AS
SELECT
  COALESCE(m.thread_id, m.id)  AS thread_id,
  MIN(root.id)                  AS root_message_id,
  root.annonce_id,
  root.seller_id,
  root.sender_name              AS buyer_name,
  root.sender_email             AS buyer_email,
  a.title                       AS annonce_title,
  COUNT(*)                      AS total_messages,
  MAX(m.created_at)             AS last_message_at,
  BOOL_OR(NOT m.is_read AND NOT m.is_seller_reply) AS has_unread
FROM messages m
JOIN messages root  ON root.id = COALESCE(m.thread_id, m.id)
JOIN annonces a     ON a.id = root.annonce_id
WHERE m.thread_id IS NULL OR m.id = m.thread_id
   OR EXISTS (SELECT 1 FROM messages r2 WHERE r2.thread_id = COALESCE(m.thread_id, m.id))
GROUP BY
  COALESCE(m.thread_id, m.id),
  root.id,
  root.annonce_id,
  root.seller_id,
  root.sender_name,
  root.sender_email,
  a.title;

-- 4. RLS : le vendeur peut insérer ses réponses (is_seller_reply = true)
-- La policy existante couvre déjà l'insertion via service_role dans l'API
-- On ajoute une policy pour que le vendeur lise ses propres threads
-- (les policies existantes sur messages restent en place)
