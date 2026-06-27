-- PR #29 — Chantier 1 : architecture dispatch unifie
-- Table de liaison demandes_transport_pros (1 demande -> N pros), source de
-- verite du dashboard pro RoullePro pour les demandes ouvertes.
-- Extensions de demandes_transport (taux, bon de transport, acceptation, source_form)
-- et lien depuis tcp.reservations vers demandes_transport.
--
-- Migration idempotente. NON appliquee ici : jouee cote Supabase par Lucas.

-- 1. Table de liaison demande <-> pro -----------------------------------------

CREATE TABLE IF NOT EXISTS public.demandes_transport_pros (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  demande_id uuid NOT NULL REFERENCES public.demandes_transport(id) ON DELETE CASCADE,
  pro_id uuid NOT NULL REFERENCES public.pros_sanitaire(id) ON DELETE CASCADE,
  statut text NOT NULL DEFAULT 'proposee'
    CHECK (statut IN ('proposee','acceptee','declinee','autre_acceptee','expiree')),
  proposee_at timestamptz NOT NULL DEFAULT now(),
  vue_at timestamptz,
  acceptee_at timestamptz,
  declinee_at timestamptz,
  -- Chantier 4 bis : tracking des envois Resend.
  email_status text DEFAULT 'pending'
    CHECK (email_status IN ('pending','sent','failed','skipped_no_email')),
  email_sent_at timestamptz,
  email_resend_id text,
  UNIQUE (demande_id, pro_id)
);

CREATE INDEX IF NOT EXISTS idx_dtp_pro_statut
  ON public.demandes_transport_pros (pro_id, statut, proposee_at DESC);
CREATE INDEX IF NOT EXISTS idx_dtp_demande
  ON public.demandes_transport_pros (demande_id);

ALTER TABLE public.demandes_transport_pros ENABLE ROW LEVEL SECURITY;

-- Un pro claimed lit uniquement ses propres lignes de proposition.
DROP POLICY IF EXISTS dtp_pro_select_own ON public.demandes_transport_pros;
CREATE POLICY dtp_pro_select_own ON public.demandes_transport_pros
  FOR SELECT TO authenticated
  USING (
    pro_id IN (
      SELECT id FROM public.pros_sanitaire
      WHERE claimed_by = (SELECT auth.uid())
    )
  );

-- 2. Extensions de demandes_transport -----------------------------------------

ALTER TABLE public.demandes_transport
  ADD COLUMN IF NOT EXISTS taux_prise_en_charge text,
  ADD COLUMN IF NOT EXISTS taux_prise_en_charge_autre text,
  ADD COLUMN IF NOT EXISTS bon_transport_medical boolean DEFAULT false NOT NULL,
  ADD COLUMN IF NOT EXISTS sans_bon boolean GENERATED ALWAYS AS (NOT bon_transport_medical) STORED,
  ADD COLUMN IF NOT EXISTS accepte_par_pro_id uuid REFERENCES public.pros_sanitaire(id),
  ADD COLUMN IF NOT EXISTS accepte_par_chauffeur_tcp_id uuid,
  ADD COLUMN IF NOT EXISTS accepte_at timestamptz,
  ADD COLUMN IF NOT EXISTS source_form text;

-- CHECK sur taux_prise_en_charge (ajoute separement pour idempotence).
ALTER TABLE public.demandes_transport
  DROP CONSTRAINT IF EXISTS demandes_transport_taux_check;
ALTER TABLE public.demandes_transport
  ADD CONSTRAINT demandes_transport_taux_check
  CHECK (taux_prise_en_charge IN ('100','65','autre') OR taux_prise_en_charge IS NULL);

-- CHECK sur source_form.
ALTER TABLE public.demandes_transport
  DROP CONSTRAINT IF EXISTS demandes_transport_source_form_check;
ALTER TABLE public.demandes_transport
  ADD CONSTRAINT demandes_transport_source_form_check
  CHECK (source_form IN ('home','etablissement','transport_vers','widget','fiche_pro') OR source_form IS NULL);

-- Extension du CHECK statut : ajoute 'acceptee' et 'annulee'.
ALTER TABLE public.demandes_transport
  DROP CONSTRAINT IF EXISTS demandes_transport_statut_check;
ALTER TABLE public.demandes_transport
  ADD CONSTRAINT demandes_transport_statut_check
  CHECK (statut IN ('envoyee','traitee','acceptee','annulee','sans_suite'));

-- 3. Lien tcp.reservations -> demandes_transport ------------------------------

ALTER TABLE tcp.reservations
  ADD COLUMN IF NOT EXISTS demande_transport_id uuid;
CREATE INDEX IF NOT EXISTS idx_tcp_resa_demande
  ON tcp.reservations (demande_transport_id) WHERE demande_transport_id IS NOT NULL;
