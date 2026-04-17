-- MIGRATION 007 — Système de notation vendeur
-- Date: 2026-04-17

CREATE TABLE IF NOT EXISTS public.notations (
  id           uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  vendeur_id   uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  acheteur_id  uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  annonce_id   uuid REFERENCES public.annonces(id) ON DELETE SET NULL,
  note         smallint NOT NULL CHECK (note BETWEEN 1 AND 5),
  commentaire  text,
  created_at   timestamptz DEFAULT now(),
  -- Un acheteur ne peut noter qu'une fois par vendeur
  UNIQUE (vendeur_id, acheteur_id)
);

ALTER TABLE public.notations ENABLE ROW LEVEL SECURITY;

-- Lecture publique des notations
CREATE POLICY "notations_select_public" ON public.notations
  FOR SELECT USING (true);

-- Un utilisateur authentifié peut créer une notation (pas pour lui-même)
CREATE POLICY "notations_insert_auth" ON public.notations
  FOR INSERT WITH CHECK (
    auth.uid() = acheteur_id
    AND auth.uid() != vendeur_id
  );

-- L'acheteur peut modifier/supprimer sa propre notation
CREATE POLICY "notations_update_own" ON public.notations
  FOR UPDATE USING (auth.uid() = acheteur_id);

CREATE POLICY "notations_delete_own" ON public.notations
  FOR DELETE USING (
    auth.uid() = acheteur_id
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Vue agrégée par vendeur (note moyenne + comptage)
CREATE OR REPLACE VIEW public.vendeur_stats AS
  SELECT
    vendeur_id,
    COUNT(*)::integer          AS nb_notations,
    ROUND(AVG(note), 1)        AS note_moyenne,
    COUNT(CASE WHEN note = 5 THEN 1 END)::integer AS nb_5_etoiles,
    COUNT(CASE WHEN note = 4 THEN 1 END)::integer AS nb_4_etoiles,
    COUNT(CASE WHEN note = 3 THEN 1 END)::integer AS nb_3_etoiles,
    COUNT(CASE WHEN note = 2 THEN 1 END)::integer AS nb_2_etoiles,
    COUNT(CASE WHEN note = 1 THEN 1 END)::integer AS nb_1_etoile
  FROM public.notations
  GROUP BY vendeur_id;
