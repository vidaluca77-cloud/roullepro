-- PR #29 — Chantier 7 : dashboard pro avec masquage demandeur cote DB
-- Le nom et le telephone du demandeur ne sont reveles qu'au pro qui a accepte.
-- Fonction SECURITY DEFINER scopee sur auth.uid() : un pro ne voit que ses
-- propres propositions, masquees tant que statut <> 'acceptee'.
--
-- Migration idempotente. NON appliquee ici : jouee cote Supabase par Lucas.

CREATE OR REPLACE FUNCTION public.demandes_pro_dashboard()
RETURNS TABLE (
  dtp_id uuid,
  demande_id uuid,
  pro_id uuid,
  dtp_statut text,
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
