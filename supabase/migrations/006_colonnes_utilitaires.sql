-- MIGRATION 006 — Colonnes spécifiques véhicules utilitaires + transport
-- Date: 2026-04-17

ALTER TABLE public.annonces
  ADD COLUMN IF NOT EXISTS ptac          integer,          -- Poids Total Autorisé en Charge (kg)
  ADD COLUMN IF NOT EXISTS charge_utile  integer,          -- Charge utile (kg)
  ADD COLUMN IF NOT EXISTS volume_utile  numeric(6,2),     -- Volume utile (m³)
  ADD COLUMN IF NOT EXISTS longueur_plateau numeric(5,2),  -- Longueur plateau/caisse (m)
  ADD COLUMN IF NOT EXISTS type_carrosserie text,          -- Fourgon, Benne, Plateau...
  ADD COLUMN IF NOT EXISTS nb_essieux    smallint,         -- Nombre d'essieux
  ADD COLUMN IF NOT EXISTS nb_places     smallint,         -- Nombre de places (transport)
  ADD COLUMN IF NOT EXISTS puissance_cv  smallint,         -- Puissance (CV)
  ADD COLUMN IF NOT EXISTS norme_euro    text;             -- Euro 5, Euro 6d...
