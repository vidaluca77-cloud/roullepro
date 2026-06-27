-- Table referentiel des etablissements de sante (import FINESS, Licence Ouverte 2.0).
-- Chantier A1/A2/A3 du cahier des charges FINESS.
-- Aucun write public : les modifications passent uniquement par le service_role
-- (script scripts/import-finess.ts et edge function etab-refresh-finess).

CREATE TABLE IF NOT EXISTS public.etablissements_sante (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  finess_geo text UNIQUE NOT NULL,
  finess_juri text,
  raison_sociale text NOT NULL,
  nom_court text,
  slug text UNIQUE NOT NULL,
  categorie_finess_code text,
  categorie_finess_libelle text,
  categorie_simple text NOT NULL CHECK (categorie_simple IN ('hopital','clinique','ehpad','centre-sante','centre-dialyse','centre-oncologie','psychiatrie','rehabilitation','autre')),
  adresse text,
  code_postal text,
  ville text,
  ville_slug text,
  departement text,
  region text,
  latitude double precision,
  longitude double precision,
  telephone text,
  site_web text,
  capacite_lits int,
  source text NOT NULL DEFAULT 'finess',
  source_updated_at date,
  actif boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_etab_ville_slug ON public.etablissements_sante (ville_slug) WHERE actif = true;
CREATE INDEX IF NOT EXISTS idx_etab_departement ON public.etablissements_sante (departement) WHERE actif = true;
CREATE INDEX IF NOT EXISTS idx_etab_categorie ON public.etablissements_sante (categorie_simple) WHERE actif = true;
CREATE INDEX IF NOT EXISTS idx_etab_slug ON public.etablissements_sante (slug) WHERE actif = true;
CREATE INDEX IF NOT EXISTS idx_etab_latlng ON public.etablissements_sante (latitude, longitude) WHERE actif = true;

-- RLS : lecture publique des fiches actives, ecriture reservee au service_role.
ALTER TABLE public.etablissements_sante ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "etab_public_read" ON public.etablissements_sante;
CREATE POLICY "etab_public_read" ON public.etablissements_sante
  FOR SELECT USING (actif = true);

-- Vue publique consommee par les pages /etablissements/*.
CREATE OR REPLACE VIEW public.etablissements_sante_public AS
SELECT
  id, finess_geo, raison_sociale, nom_court, slug,
  categorie_simple, categorie_finess_libelle,
  adresse, code_postal, ville, ville_slug, departement, region,
  latitude, longitude,
  telephone, site_web, capacite_lits,
  source_updated_at
FROM public.etablissements_sante
WHERE actif = true;

-- Index complementaire pour la fonction de matching geo pros_proches_etablissement
-- (analyse pre-lancement section 3.6). Garantit un temps de reponse sub-100ms sur
-- la requete Haversine a 26k pros.
CREATE INDEX IF NOT EXISTS idx_pros_geo_active
  ON public.pros_sanitaire (categorie, latitude, longitude)
  WHERE actif = true AND COALESCE(suspendu, false) = false
    AND latitude IS NOT NULL AND longitude IS NOT NULL;
