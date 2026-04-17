-- ============================================================
-- MIGRATION 003 - Consolidation colonnes legacy
-- Date: 2026-04-17
-- Description: Unifie les colonnes dupliquées issues de la v1
--   statut → status, ville → city, photos → images
--   Supprime les colonnes legacy de la table annonces
--   Nettoie les policies RLS en doublon
-- ============================================================

-- ÉTAPE 1 : Supprimer les policies RLS v1 obsolètes
DROP POLICY IF EXISTS "Lecture annonces actives" ON public.annonces;
DROP POLICY IF EXISTS "Vendeur cree annonce" ON public.annonces;
DROP POLICY IF EXISTS "Vendeur modifie sa annonce" ON public.annonces;
DROP POLICY IF EXISTS "Vendeur supprime sa annonce" ON public.annonces;
DROP POLICY IF EXISTS "Admin tout" ON public.annonces;
DROP POLICY IF EXISTS "Envoi message" ON public.messages;
DROP POLICY IF EXISTS "Vendeur voit ses messages" ON public.messages;
DROP POLICY IF EXISTS "Lecture publique profils" ON public.profiles;
DROP POLICY IF EXISTS "Utilisateur modifie son profil" ON public.profiles;
DROP POLICY IF EXISTS "Insert profil" ON public.profiles;
DROP POLICY IF EXISTS "User gere ses favoris" ON public.favoris;

-- ÉTAPE 2 : Migrer statut → status (annonces existantes)
UPDATE public.annonces
SET status = 'active'
WHERE (status IS NULL OR status = 'pending');

-- ÉTAPE 3 : Migrer ville → city
UPDATE public.annonces
SET city = ville
WHERE ville IS NOT NULL AND ville != '' AND (city IS NULL OR city = '');

-- ÉTAPE 4 : Migrer photos → images
UPDATE public.annonces
SET images = photos
WHERE photos IS NOT NULL AND array_length(photos, 1) > 0
  AND (images IS NULL OR array_length(images, 1) IS NULL);

-- ÉTAPE 5 : Supprimer les colonnes legacy
ALTER TABLE public.annonces DROP COLUMN IF EXISTS statut;
ALTER TABLE public.annonces DROP COLUMN IF EXISTS ville;
ALTER TABLE public.annonces DROP COLUMN IF EXISTS photos;

-- ÉTAPE 6 : Recréer la policy RLS SELECT propre sur annonces
CREATE POLICY "annonces_select_public" ON public.annonces
  FOR SELECT USING (
    status = 'active'
    OR auth.uid() = user_id
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
