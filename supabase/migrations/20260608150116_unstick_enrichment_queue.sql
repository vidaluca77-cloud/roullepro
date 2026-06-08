-- ============================================================================
-- Bug 6 — Queue d'enrichissement bloquée en 'processing'
-- ============================================================================
-- Une (ou plusieurs) ligne(s) de phone_enrichment_queue restent coincées en
-- statut 'processing' après un crash du worker (la RPC claim_phone_enrichment_batch
-- bascule pending → processing, mais si le worker meurt avant le "mark done",
-- la ligne n'est jamais remise en pending et n'est plus jamais traitée).
--
-- Le schéma exact de la colonne d'horodatage de prise en charge n'est pas
-- versionné (la table et la RPC ont été créées via le dashboard Supabase). Cette
-- migration est donc DÉFENSIVE : elle détecte dynamiquement la colonne timestamp
-- présente et l'utilise pour ne débloquer que les lignes coincées depuis > 30 min.
-- Si aucune colonne d'horodatage n'est trouvée, on débloque tout ce qui est en
-- 'processing' (état orphelin par définition après un run terminé).
-- ============================================================================

DO $$
DECLARE
  ts_col  text;
  has_err boolean;
  sql     text;
BEGIN
  -- Garde-fou : la table doit exister
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'phone_enrichment_queue'
  ) THEN
    RAISE NOTICE 'phone_enrichment_queue absente, rien à faire';
    RETURN;
  END IF;

  -- Détection de la colonne d'horodatage de prise en charge (par ordre de préférence)
  SELECT c.column_name INTO ts_col
  FROM information_schema.columns c
  WHERE c.table_schema = 'public'
    AND c.table_name = 'phone_enrichment_queue'
    AND c.column_name = ANY (ARRAY[
      'processing_started_at', 'started_at', 'locked_at',
      'claimed_at', 'updated_at', 'created_at'
    ])
  ORDER BY array_position(ARRAY[
      'processing_started_at', 'started_at', 'locked_at',
      'claimed_at', 'updated_at', 'created_at'
    ], c.column_name)
  LIMIT 1;

  -- La colonne 'error' existe-t-elle ? (pour tracer la raison du déblocage)
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'phone_enrichment_queue'
      AND column_name = 'error'
  ) INTO has_err;

  IF ts_col IS NOT NULL THEN
    sql := format(
      'UPDATE public.phone_enrichment_queue
         SET status = ''pending''%s
       WHERE status = ''processing''
         AND %I < NOW() - INTERVAL ''30 minutes''',
      CASE WHEN has_err THEN ', error = ''Auto-recovered from stuck processing''' ELSE '' END,
      ts_col
    );
  ELSE
    -- Aucune colonne d'horodatage : on débloque tous les 'processing' orphelins
    sql := format(
      'UPDATE public.phone_enrichment_queue
         SET status = ''pending''%s
       WHERE status = ''processing''',
      CASE WHEN has_err THEN ', error = ''Auto-recovered from stuck processing''' ELSE '' END
    );
  END IF;

  EXECUTE sql;
  RAISE NOTICE 'Déblocage queue effectué (colonne horodatage utilisée: %)', COALESCE(ts_col, 'aucune');
END $$;

-- ----------------------------------------------------------------------------
-- TODO (suivi) : prévenir les futurs blocages
-- ----------------------------------------------------------------------------
-- Cette migration ne corrige que l'état présent. Pour éviter que le problème ne
-- réapparaisse, prévoir l'UNE des options suivantes (hors scope de cette PR) :
--   1. Un job cron Supabase (pg_cron) qui relance ce même UPDATE toutes les
--      15-30 min, ex :
--        SELECT cron.schedule('unstick-enrichment', '*/15 * * * *', $$
--          UPDATE public.phone_enrichment_queue
--          SET status = 'pending'
--          WHERE status = 'processing'
--            AND processing_started_at < NOW() - INTERVAL '30 minutes';
--        $$);
--   2. Faire en sorte que la RPC claim_phone_enrichment_batch ré-éligibilise
--      automatiquement les lignes 'processing' trop anciennes au moment du claim
--      (recovery paresseux, pas besoin de cron).
