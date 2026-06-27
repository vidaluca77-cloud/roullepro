-- Ajout du nom d'affichage propre et des alias de recherche sur les
-- etablissements de sante FINESS (remap strict + recherche semantique).
--
-- nom_affichage   : libelle lisible genere a l'import
--                   ("CENTRE HOSPITALIER UNIVERSITAIRE COTE DE NACRE" -> "CHU Cote de Nacre (Caen)").
-- search_aliases  : chaine concatenee d'alias (raison sociale, nom d'affichage,
--                   variantes sans accents, alias semantiques "chu caen", "pitie"...)
--                   exploitee par /api/etablissements/search en ILIKE.
--
-- Aucun write public : alimentation via service_role (script d'import FINESS).

ALTER TABLE public.etablissements_sante
  ADD COLUMN IF NOT EXISTS nom_affichage text,
  ADD COLUMN IF NOT EXISTS search_aliases text;

-- Ajout de la famille "maison-sante" (maisons de sante pluriprofessionnelles)
-- a la contrainte de categorie_simple.
ALTER TABLE public.etablissements_sante
  DROP CONSTRAINT IF EXISTS etablissements_sante_categorie_simple_check;
ALTER TABLE public.etablissements_sante
  ADD CONSTRAINT etablissements_sante_categorie_simple_check
  CHECK (categorie_simple IN (
    'hopital','clinique','ehpad','centre-sante','centre-dialyse',
    'centre-oncologie','psychiatrie','rehabilitation','maison-sante','autre'
  ));

-- Recherche ILIKE rapide sur les alias et le nom d'affichage (trigrammes).
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS idx_etab_search_aliases_trgm
  ON public.etablissements_sante USING gin (search_aliases gin_trgm_ops)
  WHERE actif = true;

CREATE INDEX IF NOT EXISTS idx_etab_nom_affichage_trgm
  ON public.etablissements_sante USING gin (nom_affichage gin_trgm_ops)
  WHERE actif = true;

-- Vue publique mise a jour : on expose nom_affichage et search_aliases.
CREATE OR REPLACE VIEW public.etablissements_sante_public AS
SELECT
  id, finess_geo, raison_sociale, nom_court, nom_affichage,
  slug, categorie_simple, categorie_finess_libelle,
  adresse, code_postal, ville, ville_slug, departement, region,
  latitude, longitude,
  telephone, site_web, capacite_lits,
  search_aliases,
  source_updated_at
FROM public.etablissements_sante
WHERE actif = true;
