-- ============================================================================
-- Bug 4 — Colonnes vendeur_stats.nb_X_etoiles inexistantes
-- ============================================================================
-- La vue public.vendeur_stats a été redéfinie en migration 011 puis 012 sans
-- les colonnes de répartition par note (nb_5_etoiles … nb_1_etoile) qui
-- existaient en migration 007.
--
-- Or src/app/api/notations/route.ts les sélectionne toujours :
--   .select('nb_notations, note_moyenne, nb_5_etoiles, nb_4_etoiles, ...')
-- → erreur PostgREST "column does not exist".
--
-- On redéfinit la vue en réintroduisant les comptages par étoile, tout en
-- conservant les colonnes existantes (vendeur_id, note_moyenne, nb_annonces_actives).
-- On garde security_invoker = true (RLS de l'appelant), comme en migration 012.
-- ============================================================================

DROP VIEW IF EXISTS public.vendeur_stats;

CREATE VIEW public.vendeur_stats
WITH (security_invoker = true) AS
SELECT
  p.id                                                        AS vendeur_id,
  p.full_name,
  p.company_name,
  p.is_verified,
  COUNT(DISTINCT a.id) FILTER (WHERE a.status = 'active')     AS nb_annonces_actives,
  COUNT(n.id)::integer                                        AS nb_notations,
  COALESCE(ROUND(AVG(n.note)::numeric, 1), 0)                AS note_moyenne,
  COUNT(n.id) FILTER (WHERE n.note = 5)::integer              AS nb_5_etoiles,
  COUNT(n.id) FILTER (WHERE n.note = 4)::integer              AS nb_4_etoiles,
  COUNT(n.id) FILTER (WHERE n.note = 3)::integer              AS nb_3_etoiles,
  COUNT(n.id) FILTER (WHERE n.note = 2)::integer              AS nb_2_etoiles,
  COUNT(n.id) FILTER (WHERE n.note = 1)::integer              AS nb_1_etoile
FROM public.profiles p
LEFT JOIN public.annonces a ON a.user_id = p.id
LEFT JOIN public.notations n ON n.vendeur_id = p.id
GROUP BY p.id, p.full_name, p.company_name, p.is_verified;
