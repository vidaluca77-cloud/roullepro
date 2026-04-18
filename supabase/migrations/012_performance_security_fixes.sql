-- ============================================================
-- MIGRATION 012 — Corrections sécurité & performance
-- Date: 2026-04-18
-- Description:
--   1. Index FK manquants (CONCURRENTLY non supporté dans migration, on crée directement)
--   2. Optimisation policies RLS (auth.uid() → (select auth.uid()))
--   3. Correction vue vendeur_stats (SECURITY DEFINER → security_invoker)
--   4. Restriction policy signalements INSERT
-- ============================================================

-- ============================================================
-- PARTIE 1 : Index sur foreign keys manquants
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_alertes_user_id
  ON public.alertes(user_id);

CREATE INDEX IF NOT EXISTS idx_favoris_annonce_id
  ON public.favoris(annonce_id);

CREATE INDEX IF NOT EXISTS idx_messages_seller_id_reply
  ON public.messages(seller_id_reply)
  WHERE seller_id_reply IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_notations_acheteur_id
  ON public.notations(acheteur_id);

CREATE INDEX IF NOT EXISTS idx_notations_annonce_id
  ON public.notations(annonce_id);

-- ============================================================
-- PARTIE 2 : Correction vue vendeur_stats (SECURITY DEFINER → security_invoker)
-- ============================================================

DROP VIEW IF EXISTS public.vendeur_stats CASCADE;

CREATE VIEW public.vendeur_stats
WITH (security_invoker = true) AS
SELECT
  p.id AS vendeur_id,
  p.full_name,
  p.company_name,
  p.is_verified,
  COUNT(DISTINCT a.id) FILTER (WHERE a.status = 'active') AS nb_annonces_actives,
  COUNT(DISTINCT n.id) AS nb_notations,
  COALESCE(ROUND(AVG(n.note)::numeric, 1), 0) AS note_moyenne
FROM public.profiles p
LEFT JOIN public.annonces a ON a.user_id = p.id
LEFT JOIN public.notations n ON n.vendeur_id = p.id
GROUP BY p.id, p.full_name, p.company_name, p.is_verified;

-- ============================================================
-- PARTIE 3 : Correction policy signalements INSERT
-- ============================================================

DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.signalements;
DROP POLICY IF EXISTS "signalements_insert_policy" ON public.signalements;

CREATE POLICY "signalements_insert_authenticated"
  ON public.signalements
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) IS NOT NULL);

-- ============================================================
-- PARTIE 4 : Optimisation RLS — remplacer auth.uid() par (select auth.uid())
-- Toutes les policies concernées, table par table
-- ============================================================

-- ---------- profiles ----------
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT
  WITH CHECK (id = (select auth.uid()));

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE
  USING (id = (select auth.uid()));

-- ---------- annonces ----------
DROP POLICY IF EXISTS "Utilisateurs peuvent créer annonces" ON public.annonces;
DROP POLICY IF EXISTS "Utilisateurs peuvent modifier leurs annonces" ON public.annonces;
DROP POLICY IF EXISTS "Utilisateurs peuvent supprimer leurs annonces" ON public.annonces;
DROP POLICY IF EXISTS "annonces_select_public" ON public.annonces;
DROP POLICY IF EXISTS "annonces_select_owner" ON public.annonces;
DROP POLICY IF EXISTS "annonces_select_admin" ON public.annonces;
DROP POLICY IF EXISTS "annonces_update_admin" ON public.annonces;
DROP POLICY IF EXISTS "annonces_delete_admin" ON public.annonces;

-- SELECT : public (actives), propriétaire, admin
CREATE POLICY "annonces_select_public" ON public.annonces
  FOR SELECT
  USING (
    status = 'active'
    OR user_id = (select auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (select auth.uid()) AND role = 'admin'
    )
  );

-- INSERT : utilisateur authentifié, uniquement ses annonces
CREATE POLICY "annonces_insert_own" ON public.annonces
  FOR INSERT
  WITH CHECK (user_id = (select auth.uid()));

-- UPDATE : propriétaire ou admin
CREATE POLICY "annonces_update_own" ON public.annonces
  FOR UPDATE
  USING (
    user_id = (select auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (select auth.uid()) AND role = 'admin'
    )
  );

-- DELETE : propriétaire ou admin
CREATE POLICY "annonces_delete_own" ON public.annonces
  FOR DELETE
  USING (
    user_id = (select auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (select auth.uid()) AND role = 'admin'
    )
  );

-- ---------- favoris ----------
DROP POLICY IF EXISTS "Users gèrent leurs favoris" ON public.favoris;

CREATE POLICY "favoris_own" ON public.favoris
  FOR ALL
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

-- ---------- alertes ----------
DROP POLICY IF EXISTS "Users gèrent leurs alertes" ON public.alertes;

CREATE POLICY "alertes_own" ON public.alertes
  FOR ALL
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

-- ---------- messages ----------
DROP POLICY IF EXISTS "Vendeurs peuvent voir leurs messages" ON public.messages;
DROP POLICY IF EXISTS "Vendeurs peuvent marquer messages comme lus" ON public.messages;
DROP POLICY IF EXISTS "Annonce owner can read messages" ON public.messages;

CREATE POLICY "messages_select_own" ON public.messages
  FOR SELECT
  USING (
    seller_id = (select auth.uid())
    OR buyer_id = (select auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.annonces
      WHERE id = annonce_id AND user_id = (select auth.uid())
    )
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (select auth.uid()) AND role = 'admin'
    )
  );

CREATE POLICY "messages_update_read" ON public.messages
  FOR UPDATE
  USING (seller_id = (select auth.uid()))
  WITH CHECK (seller_id = (select auth.uid()));

-- ---------- alertes_categories ----------
DROP POLICY IF EXISTS "alertes_delete_own" ON public.alertes_categories;
DROP POLICY IF EXISTS "alertes_categories_own" ON public.alertes_categories;

CREATE POLICY "alertes_categories_own" ON public.alertes_categories
  FOR ALL
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

-- ---------- annonce_photos ----------
DROP POLICY IF EXISTS "Les propriétaires peuvent insérer des photos" ON public.annonce_photos;
DROP POLICY IF EXISTS "Les propriétaires peuvent supprimer leurs photos" ON public.annonce_photos;

CREATE POLICY "annonce_photos_insert_own" ON public.annonce_photos
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.annonces
      WHERE id = annonce_id AND user_id = (select auth.uid())
    )
  );

CREATE POLICY "annonce_photos_delete_own" ON public.annonce_photos
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.annonces
      WHERE id = annonce_id AND user_id = (select auth.uid())
    )
  );

-- ---------- annonce_documents ----------
DROP POLICY IF EXISTS "Les propriétaires peuvent insérer des documents" ON public.annonce_documents;
DROP POLICY IF EXISTS "Les propriétaires peuvent supprimer leurs documents" ON public.annonce_documents;

CREATE POLICY "annonce_documents_insert_own" ON public.annonce_documents
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.annonces
      WHERE id = annonce_id AND user_id = (select auth.uid())
    )
  );

CREATE POLICY "annonce_documents_delete_own" ON public.annonce_documents
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.annonces
      WHERE id = annonce_id AND user_id = (select auth.uid())
    )
  );

-- ---------- notations ----------
DROP POLICY IF EXISTS "notations_insert_auth" ON public.notations;
DROP POLICY IF EXISTS "notations_update_own" ON public.notations;

CREATE POLICY "notations_insert_auth" ON public.notations
  FOR INSERT
  TO authenticated
  WITH CHECK (acheteur_id = (select auth.uid()));

CREATE POLICY "notations_update_own" ON public.notations
  FOR UPDATE
  USING (acheteur_id = (select auth.uid()));

-- ---------- categories ----------
DROP POLICY IF EXISTS "Only admins can manage categories" ON public.categories;

CREATE POLICY "categories_admin_manage" ON public.categories
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (select auth.uid()) AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (select auth.uid()) AND role = 'admin'
    )
  );
