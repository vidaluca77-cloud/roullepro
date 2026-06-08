-- ============================================================================
-- Index BDD manquants — qualité données (advisors Supabase)
-- ============================================================================
-- Ajoute des index couvrants pour les FK et colonnes de filtrage fréquentes.
-- Tous les index sont créés avec IF NOT EXISTS (idempotent).
--
-- Note : CONCURRENTLY n'est PAS utilisable dans une migration transactionnelle
-- Supabase, on utilise donc des CREATE INDEX classiques.
--
-- Les index suivants existent DÉJÀ (créés dans 20260423_annuaire_sanitaire.sql)
-- et ne sont donc PAS recréés ici :
--   - idx_pros_sanitaire_ville_slug (pros_sanitaire.ville_slug)
--   - idx_pros_sanitaire_categorie  (pros_sanitaire.categorie)
--   - idx_pros_sanitaire_region, _plan, _claimed, _ville_cat
--   - idx_sanitaire_messages_pro_id, _unread
--   - idx_sanitaire_claims_pro_id, _status
--   - idx_sanitaire_vues_pro_date
-- ============================================================================

-- pros_sanitaire : filtrage par département (pages annuaire département)
CREATE INDEX IF NOT EXISTS idx_pros_sanitaire_departement
  ON pros_sanitaire (departement);

-- pros_sanitaire : FK claimed_by (jointures dashboard pro / vérif ownership)
-- Index partiel : seules les fiches réclamées ont un claimed_by non null.
CREATE INDEX IF NOT EXISTS idx_pros_sanitaire_claimed_by
  ON pros_sanitaire (claimed_by)
  WHERE claimed_by IS NOT NULL;

-- sanitaire_replies : FK message_id (jointure avec sanitaire_messages)
CREATE INDEX IF NOT EXISTS idx_sanitaire_replies_message_id
  ON sanitaire_replies (message_id);

-- sanitaire_claims : FK user_id (RLS sanitaire_claims_user filtre sur user_id)
CREATE INDEX IF NOT EXISTS idx_sanitaire_claims_user_id
  ON sanitaire_claims (user_id)
  WHERE user_id IS NOT NULL;

-- sanitaire_vues : FK pro_id seule (idx existant porte sur (pro_id, created_at))
-- L'index composite existant couvre déjà pro_id en préfixe ; rien à ajouter.
