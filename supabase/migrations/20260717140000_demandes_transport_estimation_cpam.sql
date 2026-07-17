-- Refonte formulaires + estimateur CPAM — Chantier P2/P3 : colonnes geo + estimation.
--
-- Ajoute a demandes_transport :
--   * coordonnees des deux extremites (depart + arrivee) pour le calcul de distance ;
--   * ville d'arrivee (l'ancienne table ne stockait que ville_cible cote depart) ;
--   * distance_km / prix_estime / prix_estime_details pour l'estimation CPAM indicative.
-- Ajoute une contrainte de coherence sur date_souhaitee (pas trop dans le passe).
--
-- Migration idempotente (ADD COLUMN IF NOT EXISTS). NON appliquee ici :
-- elle sera jouee cote Supabase.

ALTER TABLE public.demandes_transport
  ADD COLUMN IF NOT EXISTS lieu_depart_lat double precision,
  ADD COLUMN IF NOT EXISTS lieu_depart_lng double precision,
  ADD COLUMN IF NOT EXISTS lieu_arrivee_lat double precision,
  ADD COLUMN IF NOT EXISTS lieu_arrivee_lng double precision,
  ADD COLUMN IF NOT EXISTS lieu_arrivee_ville text,
  ADD COLUMN IF NOT EXISTS distance_km numeric,
  ADD COLUMN IF NOT EXISTS prix_estime numeric,
  ADD COLUMN IF NOT EXISTS prix_estime_details jsonb;

-- Coherence de la date souhaitee : soit NULL (demandes creees par bridge),
-- soit pas plus d'un jour avant la creation de la ligne. Ajoutee NOT VALID pour
-- ne pas rejeter d'eventuelles lignes historiques ; s'applique aux insertions futures.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'demandes_transport_date_souhaitee_coherente'
      AND conrelid = 'public.demandes_transport'::regclass
  ) THEN
    ALTER TABLE public.demandes_transport
      ADD CONSTRAINT demandes_transport_date_souhaitee_coherente
      CHECK (date_souhaitee IS NULL OR date_souhaitee > created_at - interval '1 day')
      NOT VALID;
  END IF;
END $$;
