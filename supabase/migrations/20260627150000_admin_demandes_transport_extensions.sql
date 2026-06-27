-- PR #29 — Module admin : extensions demandes_transport + vue overview
-- Colonnes d'annulation admin, notes admin, tracking email admin, index de tri
-- et vue d'ensemble admin (timeline pros agregee + coords du pro accepteur).
--
-- Migration idempotente. A jouer cote Supabase (projet ypgolzcibtjljfydxcun).

-- 1. Colonnes admin sur demandes_transport ------------------------------------

ALTER TABLE public.demandes_transport
  ADD COLUMN IF NOT EXISTS annulee_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS annulee_par UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS annulee_motif TEXT,
  ADD COLUMN IF NOT EXISTS admin_notes TEXT,
  ADD COLUMN IF NOT EXISTS admin_email_sent_at TIMESTAMPTZ;

-- 2. Index de tri / filtrage admin --------------------------------------------

CREATE INDEX IF NOT EXISTS idx_demandes_transport_statut_created
  ON public.demandes_transport(statut, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_demandes_transport_dept
  ON public.demandes_transport(departement_cible);

-- 3. Vue d'ensemble admin -----------------------------------------------------

CREATE OR REPLACE VIEW public.admin_demandes_transport_overview AS
SELECT
  dt.*,
  COALESCE(stats.total_pros, 0) AS total_pros_notifies,
  COALESCE(stats.acceptees, 0) AS pros_acceptees,
  COALESCE(stats.declinees, 0) AS pros_declinees,
  COALESCE(stats.proposees_pending, 0) AS pros_pending,
  accepted_pro.raison_sociale AS pro_accepteur_raison_sociale,
  accepted_pro.nom_commercial AS pro_accepteur_nom_commercial,
  accepted_pro.telephone_public AS pro_accepteur_telephone,
  accepted_pro.email_public AS pro_accepteur_email,
  accepted_pro.ville AS pro_accepteur_ville
FROM public.demandes_transport dt
LEFT JOIN LATERAL (
  SELECT
    COUNT(*) AS total_pros,
    COUNT(*) FILTER (WHERE statut = 'acceptee') AS acceptees,
    COUNT(*) FILTER (WHERE statut = 'declinee') AS declinees,
    COUNT(*) FILTER (WHERE statut = 'proposee') AS proposees_pending
  FROM public.demandes_transport_pros
  WHERE demande_id = dt.id
) stats ON TRUE
LEFT JOIN public.pros_sanitaire accepted_pro
  ON accepted_pro.id = dt.accepte_par_pro_id;

GRANT SELECT ON public.admin_demandes_transport_overview TO authenticated;
