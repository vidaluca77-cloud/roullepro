-- ============================================================================
-- Migration 019 : HistoVec + Expiration 90j + Push + Escrow Stripe
-- ============================================================================

-- 1. HistoVec : ajouter un lien optionnel sur les annonces
ALTER TABLE public.annonces
  ADD COLUMN IF NOT EXISTS histovec_url text,
  ADD COLUMN IF NOT EXISTS expires_at timestamp with time zone;

-- Backfill expires_at pour annonces actives existantes (90j à partir de created_at)
UPDATE public.annonces
SET expires_at = created_at + INTERVAL '90 days'
WHERE expires_at IS NULL;

-- 2. Passer l'expiration à 90j + envoyer email via webhook Netlify
CREATE OR REPLACE FUNCTION public.expire_old_annonces()
RETURNS TABLE(expired_count bigint)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count bigint;
BEGIN
  WITH updated AS (
    UPDATE public.annonces
    SET status = 'expired',
        updated_at = now()
    WHERE status = 'active'
      AND (
        (expires_at IS NOT NULL AND expires_at < now())
        OR (expires_at IS NULL AND created_at < now() - INTERVAL '90 days')
      )
    RETURNING id
  )
  SELECT COUNT(*) INTO v_count FROM updated;

  RAISE NOTICE '[expire_old_annonces] % annonces expirées', v_count;
  RETURN QUERY SELECT v_count;
END;
$$;

-- 3. Push subscriptions (Web Push API / VAPID)
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint text NOT NULL UNIQUE,
  p256dh text NOT NULL,
  auth text NOT NULL,
  user_agent text,
  created_at timestamp with time zone DEFAULT now()
);

CREATE INDEX IF NOT EXISTS push_sub_user_idx ON public.push_subscriptions(user_id);

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user reads own subs" ON public.push_subscriptions;
CREATE POLICY "user reads own subs" ON public.push_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "user manages own subs" ON public.push_subscriptions;
CREATE POLICY "user manages own subs" ON public.push_subscriptions
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 4. Escrow transactions Stripe Connect
CREATE TABLE IF NOT EXISTS public.escrow_transactions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  annonce_id uuid REFERENCES public.annonces(id) ON DELETE SET NULL,
  buyer_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  seller_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  garage_id uuid REFERENCES public.garages_partenaires(id) ON DELETE SET NULL,
  -- Montants en centimes
  amount_total integer NOT NULL,
  amount_seller integer NOT NULL,
  amount_garage integer DEFAULT 0,
  amount_platform integer NOT NULL,
  currency text DEFAULT 'eur',
  -- Stripe refs
  payment_intent_id text UNIQUE,
  checkout_session_id text,
  transfer_group text,
  transfer_to_seller_id text,
  transfer_to_garage_id text,
  -- Flux
  status text NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending',        -- session créée, paiement attendu
    'held',           -- paiement capturé, fonds séquestrés
    'released',       -- transferts émis vers vendeur/garage
    'refunded',       -- remboursé acheteur
    'disputed',       -- litige
    'cancelled'
  )),
  released_at timestamp with time zone,
  dispute_reason text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE INDEX IF NOT EXISTS escrow_buyer_idx ON public.escrow_transactions(buyer_id);
CREATE INDEX IF NOT EXISTS escrow_seller_idx ON public.escrow_transactions(seller_id);
CREATE INDEX IF NOT EXISTS escrow_annonce_idx ON public.escrow_transactions(annonce_id);
CREATE INDEX IF NOT EXISTS escrow_status_idx ON public.escrow_transactions(status);

ALTER TABLE public.escrow_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "parties voient transaction" ON public.escrow_transactions;
CREATE POLICY "parties voient transaction" ON public.escrow_transactions
  FOR SELECT USING (
    auth.uid() = buyer_id
    OR auth.uid() = seller_id
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Pas d'insert/update direct : tout passe par l'API avec service_role
DROP POLICY IF EXISTS "admin gere tout" ON public.escrow_transactions;
CREATE POLICY "admin gere tout" ON public.escrow_transactions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Trigger updated_at
DROP TRIGGER IF EXISTS escrow_updated_at ON public.escrow_transactions;
CREATE TRIGGER escrow_updated_at
  BEFORE UPDATE ON public.escrow_transactions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- 5. Realtime chat : activer publication sur messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
