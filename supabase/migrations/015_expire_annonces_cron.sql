-- ============================================================================
-- Migration 015 : Expiration automatique des annonces après 60 jours
-- ============================================================================
-- Solution native pg_cron (Supabase) — pas de dépendance à une Edge Function
-- externe. Les annonces `active` dont `created_at` > 60 jours passent en
-- `expired`. Le vendeur peut les renouveler depuis son dashboard.
-- ============================================================================

-- 1. Activer pg_cron (si pas déjà activé)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 2. Fonction d'expiration — idempotente
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
      AND created_at < (now() - INTERVAL '60 days')
    RETURNING id
  )
  SELECT COUNT(*) INTO v_count FROM updated;

  -- Log dans les logs Supabase
  RAISE NOTICE '[expire_old_annonces] % annonces expirées', v_count;

  RETURN QUERY SELECT v_count;
END;
$$;

-- 3. Planifier le job quotidien à 03:00 UTC (05:00 Europe/Paris en été)
--    Si un job du même nom existe déjà, on le déplanifie d'abord.
DO $$
BEGIN
  -- Déplanifier l'ancien job si existant (idempotence)
  PERFORM cron.unschedule('expire-annonces-daily')
  WHERE EXISTS (
    SELECT 1 FROM cron.job WHERE jobname = 'expire-annonces-daily'
  );

  -- Planifier le nouveau
  PERFORM cron.schedule(
    'expire-annonces-daily',
    '0 3 * * *',
    $cron$SELECT public.expire_old_annonces();$cron$
  );
END$$;

-- 4. Permissions — seul postgres / service_role exécute la fonction
REVOKE ALL ON FUNCTION public.expire_old_annonces() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.expire_old_annonces() TO service_role;

-- ============================================================================
-- Vérification (à lancer manuellement) :
--   SELECT * FROM cron.job WHERE jobname = 'expire-annonces-daily';
--   SELECT * FROM public.expire_old_annonces(); -- exécution manuelle
-- ============================================================================
