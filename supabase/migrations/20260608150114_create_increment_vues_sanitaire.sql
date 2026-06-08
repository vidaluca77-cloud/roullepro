-- ============================================================================
-- Bug 5 — Route RPC 404 : increment_vues_sanitaire
-- ============================================================================
-- Le code front (src/app/api/sanitaire/vue/route.ts) appelle
--   supabase.rpc("increment_vues_sanitaire", { p_pro_id })
-- mais la fonction n'existe pas en base → erreur 404 (le code retombe sur un
-- fallback fetch+update bruyant et non atomique).
--
-- On crée la fonction manquante. La vraie colonne compteur de pros_sanitaire
-- est `vues_totales` (cf. migration 20260423_annuaire_sanitaire.sql), PAS `vues`.
-- Incrément atomique côté base, SECURITY DEFINER pour fonctionner même appelée
-- avec la clé anon depuis le front public.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.increment_vues_sanitaire(p_pro_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.pros_sanitaire
  SET vues_totales = COALESCE(vues_totales, 0) + 1
  WHERE id = p_pro_id;
$$;

GRANT EXECUTE ON FUNCTION public.increment_vues_sanitaire(uuid) TO anon, authenticated;
