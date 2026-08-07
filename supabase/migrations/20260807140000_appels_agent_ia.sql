-- Chantier Agent vocal IA (Twilio + Retell AI)
-- Table de journalisation des appels traités par l'agent vocal, + extension
-- du CHECK source_form pour accepter les demandes créées par téléphone.
--
-- Migration idempotente. Appliquée d'abord sur une branche Supabase de test
-- (agent-vocal-ia-test) — PAS sur la production tant que les tests ne sont
-- pas validés par Lucas.

-- 1. Table appels_agent_ia -------------------------------------------------

CREATE TABLE IF NOT EXISTS public.appels_agent_ia (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  retell_call_id text UNIQUE,
  type_appel text NOT NULL DEFAULT 'patient_entrant'
    CHECK (type_appel IN ('patient_entrant', 'pro_dispatch', 'pro_upsell')),
  demande_id uuid REFERENCES public.demandes_transport(id) ON DELETE SET NULL,
  pro_id uuid REFERENCES public.pros_sanitaire(id) ON DELETE SET NULL,
  numero_appele text,
  statut text NOT NULL DEFAULT 'en_cours'
    CHECK (statut IN ('en_cours', 'termine', 'echec')),
  resultat text,
  duree_secondes integer,
  transcript_url text,
  enregistrement_url text,
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_appels_agent_ia_demande
  ON public.appels_agent_ia (demande_id) WHERE demande_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_appels_agent_ia_pro
  ON public.appels_agent_ia (pro_id) WHERE pro_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_appels_agent_ia_statut
  ON public.appels_agent_ia (statut, started_at DESC);

ALTER TABLE public.appels_agent_ia ENABLE ROW LEVEL SECURITY;

-- Aucune policy authenticated : cette table n'est écrite/lue que par les
-- routes /api/voice/* via le service_role (secret partagé VOICE_AGENT_SECRET),
-- jamais directement par un client pro ou patient. RLS activé par défaut-deny.

-- Un pro claimed peut consulter l'historique de SES appels (dispatch/upsell),
-- utile pour un futur écran "historique d'appels" dans le dashboard pro.
DROP POLICY IF EXISTS appels_agent_ia_pro_select_own ON public.appels_agent_ia;
CREATE POLICY appels_agent_ia_pro_select_own ON public.appels_agent_ia
  FOR SELECT TO authenticated
  USING (
    pro_id IN (
      SELECT id FROM public.pros_sanitaire
      WHERE claimed_by = (SELECT auth.uid())
    )
  );

-- 2. Extension du CHECK source_form pour accepter voice_ia -----------------

ALTER TABLE public.demandes_transport
  DROP CONSTRAINT IF EXISTS demandes_transport_source_form_check;
ALTER TABLE public.demandes_transport
  ADD CONSTRAINT demandes_transport_source_form_check
  CHECK (source_form IN ('home', 'etablissement', 'transport_vers', 'widget', 'fiche_pro', 'voice_ia') OR source_form IS NULL);
