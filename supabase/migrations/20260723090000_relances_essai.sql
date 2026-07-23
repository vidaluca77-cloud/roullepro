-- Relances automatiques de fin d'essai / d'offre gratuite (cron relance-essai).
-- Journal d'idempotence : une ligne par relance effectivement envoyee a un pro pour
-- une echeance donnee et une fenetre donnee (J-7 / J-3 / J-1). La contrainte UNIQUE
-- (pro_id, echeance_date, type_relance) garantit qu'une meme relance n'est jamais
-- envoyee deux fois, meme si le cron tourne plusieurs fois dans la journee.
--
-- Migration idempotente. NON appliquee ici : a jouer cote Supabase par Lucas
-- (Netlify n'applique pas les migrations).

CREATE TABLE IF NOT EXISTS public.relances_essai (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pro_id        uuid NOT NULL REFERENCES public.pros_sanitaire(id) ON DELETE CASCADE,
  echeance_date date NOT NULL,
  type_relance  text NOT NULL CHECK (type_relance IN ('J7', 'J3', 'J1')),
  sent_at       timestamptz NOT NULL DEFAULT now(),
  resend_id     text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT relances_essai_unique UNIQUE (pro_id, echeance_date, type_relance)
);

CREATE INDEX IF NOT EXISTS idx_relances_essai_pro_id
  ON public.relances_essai (pro_id);

-- Acces reserve au backend (service-role). RLS activee sans policy publique :
-- le cron utilise la cle service-role qui contourne la RLS.
ALTER TABLE public.relances_essai ENABLE ROW LEVEL SECURITY;
