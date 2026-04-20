-- ============================================================================
-- Migration 017 : Stripe — 3 abonnements (Free / Pro / Premium)
-- ============================================================================
-- Structure :
--   - profiles.plan (text)           : 'free' | 'pro' | 'premium'
--   - profiles.stripe_customer_id    : Stripe customer
--   - subscriptions                  : historique + état des abonnements
--
-- Par défaut tous les users existants passent en 'free'.
-- Le webhook Stripe met à jour plan + subscriptions.
-- ============================================================================

-- 1. Colonnes sur profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS plan text NOT NULL DEFAULT 'free'
    CHECK (plan IN ('free', 'pro', 'premium')),
  ADD COLUMN IF NOT EXISTS stripe_customer_id text UNIQUE;

CREATE INDEX IF NOT EXISTS idx_profiles_plan ON public.profiles(plan);
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer_id ON public.profiles(stripe_customer_id);

-- 2. Table subscriptions (source de vérité côté serveur)
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  stripe_subscription_id  text UNIQUE NOT NULL,
  stripe_customer_id      text NOT NULL,
  stripe_price_id         text NOT NULL,
  plan                    text NOT NULL CHECK (plan IN ('pro', 'premium')),
  status                  text NOT NULL, -- active, trialing, past_due, canceled, incomplete, incomplete_expired, unpaid
  current_period_start    timestamptz,
  current_period_end      timestamptz,
  cancel_at_period_end    boolean NOT NULL DEFAULT false,
  canceled_at             timestamptz,
  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);

-- Trigger updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_subscriptions_updated_at ON public.subscriptions;
CREATE TRIGGER trg_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 3. RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Un user voit ses propres subscriptions
CREATE POLICY "subscriptions_select_own"
  ON public.subscriptions
  FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- Les admins voient tout
CREATE POLICY "subscriptions_admin_all"
  ON public.subscriptions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = (SELECT auth.uid())
        AND profiles.role = 'admin'
    )
  );

-- INSERT/UPDATE réservé au service_role (webhook Stripe uniquement)
-- Pas de policy INSERT/UPDATE pour anon/authenticated → bloqué par défaut.

-- 4. Vue annonces par user actif : utile pour le quota
CREATE OR REPLACE VIEW public.v_user_active_annonces AS
SELECT user_id, COUNT(*) AS active_count
FROM public.annonces
WHERE status IN ('active', 'pending')
GROUP BY user_id;

COMMENT ON COLUMN public.profiles.plan IS
  'Plan d''abonnement : free (0€), pro (19€/mois), premium (49€/mois)';
COMMENT ON TABLE public.subscriptions IS
  'Historique des abonnements Stripe. Mis à jour par le webhook /api/stripe/webhook.';
