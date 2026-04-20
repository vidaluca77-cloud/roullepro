-- ============================================================================
-- Migration 016 : Hardening des policies storage
-- ============================================================================
-- Problèmes identifiés par l'audit :
--   1. Buckets annonces-images, annonces-photos, avatars : listing public
--      autorisé (policies SELECT trop larges sur storage.objects)
--   2. Policies SELECT dupliquées sur annonces-photos
--
-- Solution :
--   - Les buckets restent `public=true` → l'accès direct à un fichier connu
--     via `/storage/v1/object/public/<bucket>/<path>` continue de fonctionner
--     (ne passe PAS par RLS).
--   - On supprime les policies SELECT larges qui permettaient l'énumération
--     via l'API SDK .list() → plus personne ne peut lister les fichiers.
--
-- Impact sur l'app :
--   - Aucun : les images s'affichent via <Image src={publicUrl}>, pas via list()
--   - Les vendeurs uploadent toujours via INSERT policies (intactes)
--   - L'admin peut lister via service_role (bypass RLS)
-- ============================================================================

-- 1. ANNONCES-IMAGES — retirer le SELECT public, propriétaire uniquement pour listing
DROP POLICY IF EXISTS "Public read annonces-images" ON storage.objects;

CREATE POLICY "Owner list annonces-images"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'annonces-images'
    AND (auth.uid())::text = (storage.foldername(name))[1]
  );

-- 2. ANNONCES-PHOTOS — supprimer les 3 policies SELECT dupliquées/larges
DROP POLICY IF EXISTS "Lecture photos" ON storage.objects;
DROP POLICY IF EXISTS "Lecture publique photos 16hbl6l_0" ON storage.objects;
DROP POLICY IF EXISTS "Suppression par propriétaire 16hbl6l_1" ON storage.objects;

CREATE POLICY "Owner list annonces-photos"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'annonces-photos'
    AND (auth.uid())::text = (storage.foldername(name))[1]
  );

-- 3. AVATARS — retirer le SELECT public
DROP POLICY IF EXISTS "Public read avatars" ON storage.objects;

CREATE POLICY "Owner list avatars"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (auth.uid())::text = (storage.foldername(name))[1]
  );

-- ============================================================================
-- Vérification :
--   SELECT policyname, cmd, qual FROM pg_policies
--   WHERE schemaname='storage' AND tablename='objects'
--     AND qual LIKE '%annonces-images%' OR qual LIKE '%annonces-photos%' OR qual LIKE '%avatars%';
-- ============================================================================
