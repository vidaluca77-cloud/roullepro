-- Suivi de demande cote patient via lien magique.
--
-- Le patient qui depose une demande de transport peut suivre son statut et
-- l'annuler sans compte, grace a un token non devinable (suivi_token).
--
-- Contenu :
--   1. demandes_transport.suivi_token (uuid, non devinable) + index unique
--   2. demandes_transport_pros.vue_at (deja present depuis 20260627140001,
--      re-declare ici en IF NOT EXISTS pour l'idempotence)
--   3. Rappel : le statut 'annulee' existe deja dans le CHECK statut
--      (cf. 20260627140001) — aucune modification du CHECK n'est requise
--   4. demandes_pro_dashboard() : expose demande_statut pour afficher
--      « Annulee par le patient » cote pro (coordonnees toujours masquees)
--
-- Migration idempotente. NON appliquee ici : elle sera jouee cote Supabase.

-- 1. Token de suivi non devinable ---------------------------------------------

ALTER TABLE public.demandes_transport
  ADD COLUMN IF NOT EXISTS suivi_token uuid NOT NULL DEFAULT gen_random_uuid();

CREATE UNIQUE INDEX IF NOT EXISTS idx_demandes_suivi_token
  ON public.demandes_transport (suivi_token);

-- 2. Trace de consultation par un pro -----------------------------------------
-- Deja cree par 20260627140001 ; re-declare en IF NOT EXISTS par securite.

ALTER TABLE public.demandes_transport_pros
  ADD COLUMN IF NOT EXISTS vue_at timestamptz;

-- 3. RPC dashboard pro : ajout de demande_statut ------------------------------
-- Reprend demandes_pro_dashboard() (cf. 20260717140002) en ajoutant le statut
-- de la demande mere, pour que le pro voie « Annulee par le patient » quand la
-- demande est annulee. Les coordonnees du demandeur restent masquees tant que
-- la proposition n'est pas acceptee.

-- La signature RETURNS TABLE change (ajout de demande_statut) : Postgres refuse
-- CREATE OR REPLACE dans ce cas (42P13 « cannot change return type »). On DROP
-- d'abord l'ancienne version (creee par 20260717140002) avant de la recreer.
DROP FUNCTION IF EXISTS public.demandes_pro_dashboard();

CREATE OR REPLACE FUNCTION public.demandes_pro_dashboard()
RETURNS TABLE (
  dtp_id uuid,
  demande_id uuid,
  pro_id uuid,
  dtp_statut text,
  demande_statut text,
  proposee_at timestamptz,
  acceptee_at timestamptz,
  type_transport text,
  lieu_depart text,
  lieu_arrivee text,
  date_souhaitee timestamptz,
  aller_retour boolean,
  mobilite text,
  precisions text,
  taux_prise_en_charge text,
  taux_prise_en_charge_autre text,
  bon_transport_medical boolean,
  source_form text,
  distance_km numeric,
  prix_estime numeric,
  -- Champs sensibles : masques tant que la proposition n'est pas acceptee.
  demandeur_nom text,
  demandeur_telephone text,
  demandeur_email text
)
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public AS $$
  SELECT
    dtp.id,
    dtp.demande_id,
    dtp.pro_id,
    dtp.statut,
    d.statut,
    dtp.proposee_at,
    dtp.acceptee_at,
    d.type_transport,
    d.lieu_depart,
    d.lieu_arrivee,
    d.date_souhaitee,
    d.aller_retour,
    d.mobilite,
    d.precisions,
    d.taux_prise_en_charge,
    d.taux_prise_en_charge_autre,
    d.bon_transport_medical,
    d.source_form,
    d.distance_km,
    d.prix_estime,
    CASE WHEN dtp.statut = 'acceptee' THEN d.nom ELSE 'Demandeur' END,
    CASE WHEN dtp.statut = 'acceptee'
      THEN d.telephone
      ELSE '•• •• •• ' || RIGHT(regexp_replace(COALESCE(d.telephone, ''), '\D', '', 'g'), 4)
    END,
    CASE WHEN dtp.statut = 'acceptee' THEN d.email ELSE NULL END
  FROM public.demandes_transport_pros dtp
  JOIN public.demandes_transport d ON d.id = dtp.demande_id
  WHERE dtp.pro_id IN (
    SELECT id FROM public.pros_sanitaire WHERE claimed_by = auth.uid()
  )
  ORDER BY dtp.proposee_at DESC;
$$;

REVOKE ALL ON FUNCTION public.demandes_pro_dashboard() FROM public;
GRANT EXECUTE ON FUNCTION public.demandes_pro_dashboard() TO authenticated;
