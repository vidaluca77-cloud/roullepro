-- ============================================================================
-- Migration 014 : Fix RLS policies (audit 20/04/2026)
-- ============================================================================
-- Corrige les points soulevés par l'audit Supabase :
--   1. messages_insert_policy — WITH CHECK = true (trop permissif)
--   2. Policies RLS dupliquées sur annonces, alertes_categories
--   3. auth_rls_initplan — auth.uid() non wrappé sur notations_delete_own
--      et alertes_categories (déjà OK, doublons retirés)
--
-- Note : l'API Next.js utilise SUPABASE_SERVICE_ROLE_KEY pour bypass RLS
-- sur /api/messages. Ces policies s'appliquent aux accès directs anon/auth.
-- ============================================================================

-- 1. ANNONCES — supprimer la policy SELECT legacy redondante
--    On garde `annonces_select_public` qui couvre : public (status=active),
--    owner, et admin.
DROP POLICY IF EXISTS "Annonces actives visibles par tous" ON public.annonces;

-- 2. ALERTES_CATEGORIES — supprimer les policies INSERT/SELECT redondantes.
--    `alertes_categories_own` (ALL) couvre déjà tout avec auth.uid() wrappé.
DROP POLICY IF EXISTS "alertes_insert_own" ON public.alertes_categories;
DROP POLICY IF EXISTS "alertes_select_own" ON public.alertes_categories;

-- 3. NOTATIONS_DELETE_OWN — wrapper auth.uid() dans (SELECT auth.uid())
--    pour éviter une ré-évaluation par ligne (auth_rls_initplan).
DROP POLICY IF EXISTS "notations_delete_own" ON public.notations;

CREATE POLICY "notations_delete_own"
  ON public.notations
  FOR DELETE
  TO authenticated
  USING (
    ((SELECT auth.uid()) = acheteur_id)
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = (SELECT auth.uid())
        AND profiles.role = 'admin'
    )
  );

-- 4. MESSAGES_INSERT_POLICY — restreindre le WITH CHECK.
--    Contexte : l'app accepte les messages de visiteurs non connectés
--    (sender_name/sender_email requis), routés via l'API serveur avec
--    le service role. Les accès directs anon/authenticated doivent être
--    cohérents :
--      - Si buyer_id est présent, il doit correspondre à auth.uid()
--        (un user connecté ne peut pas se faire passer pour un autre)
--      - Les champs de base doivent être remplis
--      - Un user ne peut pas s'envoyer un message à lui-même (annonce)
DROP POLICY IF EXISTS "messages_insert_policy" ON public.messages;

CREATE POLICY "messages_insert_policy"
  ON public.messages
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    -- Champs obligatoires non vides
    length(trim(sender_name))  > 0
    AND length(trim(sender_email)) > 0
    AND length(trim(content)) > 0
    AND annonce_id IS NOT NULL
    -- Si buyer_id est fourni, il doit correspondre à l'utilisateur connecté
    AND (buyer_id IS NULL OR buyer_id = (SELECT auth.uid()))
    -- Un vendeur ne peut pas s'envoyer un message sur sa propre annonce
    -- via la policy (les réponses seller_reply passent par une autre route)
    AND NOT EXISTS (
      SELECT 1 FROM public.annonces
      WHERE annonces.id = messages.annonce_id
        AND annonces.user_id = (SELECT auth.uid())
    )
  );

-- ============================================================================
-- Vérification finale (commentée, à lancer manuellement si besoin) :
-- SELECT tablename, policyname, cmd
-- FROM pg_policies
-- WHERE schemaname = 'public'
--   AND tablename IN ('annonces','alertes_categories','notations','messages')
-- ORDER BY tablename, cmd, policyname;
-- ============================================================================
