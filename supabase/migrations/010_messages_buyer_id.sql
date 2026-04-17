-- Migration 010 : Ajout buyer_id sur messages
-- Permet à un acheteur connecté de retrouver ses conversations dans son dashboard

ALTER TABLE messages
  ADD COLUMN IF NOT EXISTS buyer_id UUID REFERENCES profiles(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_messages_buyer_id ON messages(buyer_id);
