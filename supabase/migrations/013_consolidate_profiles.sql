-- ============================================================
-- MIGRATION 013 — Consolidation colonnes legacy dans profiles
-- Date: 2026-04-18
-- Description:
--   Backfill colonnes canoniques depuis colonnes legacy,
--   puis suppression des colonnes legacy.
--   Colonnes canoniques conservées : city, company_name, full_name
--   Colonnes legacy supprimées : ville, entreprise, prenom, nom
-- ============================================================

BEGIN;

-- Backfill city depuis ville
UPDATE public.profiles
   SET city = ville
 WHERE (city IS NULL OR city = '')
   AND ville IS NOT NULL AND ville != '';

-- Backfill company_name depuis entreprise
UPDATE public.profiles
   SET company_name = entreprise
 WHERE (company_name IS NULL OR company_name = '')
   AND entreprise IS NOT NULL AND entreprise != '';

-- Backfill full_name depuis prenom + nom (si les colonnes existent encore)
UPDATE public.profiles
   SET full_name = TRIM(CONCAT_WS(' ', prenom, nom))
 WHERE (full_name IS NULL OR full_name = '')
   AND (prenom IS NOT NULL OR nom IS NOT NULL);

-- Suppression des colonnes legacy
ALTER TABLE public.profiles DROP COLUMN IF EXISTS ville;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS entreprise;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS prenom;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS nom;

COMMIT;
