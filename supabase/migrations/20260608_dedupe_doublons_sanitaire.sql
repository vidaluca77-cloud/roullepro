-- ============================================================================
-- Dédupe des doublons pros_sanitaire — MODE DRY-RUN (aucune suppression active)
-- ============================================================================
-- Cette migration NE SUPPRIME RIEN. Elle crée des vues listant les fiches
-- candidates à la suppression afin de permettre une revue manuelle avant
-- toute action destructive.
--
-- Logique de choix de la fiche à GARDER (priorité décroissante) :
--   1. claimed = true        → fiche intouchable, toujours conservée
--   2. email_public OU phone_e164 non null → fiche la plus enrichie conservée
--   3. sinon                 → fiche la plus récente (created_at DESC)
--
-- Critères de groupement des doublons :
--   A. (lower(trim(nom_commercial)), code_postal)
--   B. (phone_e164)  — uniquement si phone_e164 IS NOT NULL
--
-- EXCLUSIONS OBLIGATOIRES (filtrées explicitement) :
--   - Tout groupe contenant au moins une fiche claimed = true
--   - La fiche Etienne PETIT id = 4275105a-4d45-46fd-9012-6701f1c9ea81
--
-- ⚠️  Aucun DROP TABLE / TRUNCATE / DELETE actif dans cette migration.
--     Les blocs DELETE sont fournis EN COMMENTAIRE, à décommenter après revue.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Vue A — Doublons par (nom_commercial normalisé + code_postal)
-- ----------------------------------------------------------------------------
-- rn = 1  → fiche conservée (la plus prioritaire du groupe)
-- rn > 1  → fiche candidate à la suppression
CREATE OR REPLACE VIEW public._candidats_dedupe_nom_cp AS
WITH groupes_sans_claim AS (
  -- On ne garde que les groupes où AUCUNE fiche n'est claimed
  SELECT lower(trim(nom_commercial)) AS k_nom, code_postal AS k_cp
  FROM pros_sanitaire
  WHERE nom_commercial IS NOT NULL
    AND code_postal IS NOT NULL
  GROUP BY lower(trim(nom_commercial)), code_postal
  HAVING count(*) > 1
     AND bool_or(claimed) = false
)
SELECT
  p.id,
  p.nom_commercial,
  p.code_postal,
  p.ville,
  p.phone_e164,
  p.email_public,
  p.claimed,
  p.created_at,
  ROW_NUMBER() OVER (
    PARTITION BY lower(trim(p.nom_commercial)), p.code_postal
    ORDER BY
      p.claimed DESC,                                                   -- 1. claimed d'abord (sécurité)
      ((p.email_public IS NOT NULL) OR (p.phone_e164 IS NOT NULL)) DESC, -- 2. la plus enrichie
      p.created_at DESC                                                 -- 3. la plus récente
  ) AS rn
FROM pros_sanitaire p
JOIN groupes_sans_claim g
  ON lower(trim(p.nom_commercial)) = g.k_nom
 AND p.code_postal = g.k_cp
WHERE p.id <> '4275105a-4d45-46fd-9012-6701f1c9ea81';
-- Les lignes avec rn > 1 sont candidates à la suppression.

-- ----------------------------------------------------------------------------
-- Vue B — Doublons par phone_e164 (uniquement si phone_e164 IS NOT NULL)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW public._candidats_dedupe_phone AS
WITH groupes_sans_claim AS (
  SELECT phone_e164 AS k_phone
  FROM pros_sanitaire
  WHERE phone_e164 IS NOT NULL
    AND length(trim(phone_e164)) > 0
  GROUP BY phone_e164
  HAVING count(*) > 1
     AND bool_or(claimed) = false
)
SELECT
  p.id,
  p.nom_commercial,
  p.code_postal,
  p.ville,
  p.phone_e164,
  p.email_public,
  p.claimed,
  p.created_at,
  ROW_NUMBER() OVER (
    PARTITION BY p.phone_e164
    ORDER BY
      p.claimed DESC,
      ((p.email_public IS NOT NULL) OR (p.phone_e164 IS NOT NULL)) DESC,
      p.created_at DESC
  ) AS rn
FROM pros_sanitaire p
JOIN groupes_sans_claim g
  ON p.phone_e164 = g.k_phone
WHERE p.id <> '4275105a-4d45-46fd-9012-6701f1c9ea81';
-- Les lignes avec rn > 1 sont candidates à la suppression.

-- ----------------------------------------------------------------------------
-- Vue de synthèse — union des candidats (rn > 1) des deux critères
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW public._candidats_dedupe AS
SELECT DISTINCT id, nom_commercial, code_postal, ville, phone_e164,
       email_public, claimed, created_at, 'nom_commercial+code_postal' AS critere
FROM public._candidats_dedupe_nom_cp
WHERE rn > 1
UNION
SELECT DISTINCT id, nom_commercial, code_postal, ville, phone_e164,
       email_public, claimed, created_at, 'phone_e164' AS critere
FROM public._candidats_dedupe_phone
WHERE rn > 1;

-- ============================================================================
-- ⚠️  ACTION MANUELLE REQUISE — SUPPRESSION EFFECTIVE
-- ============================================================================
-- Après revue manuelle du contenu de public._candidats_dedupe, décommenter
-- les blocs ci-dessous pour supprimer effectivement les doublons.
--
-- Les filtres de sécurité (claimed, Etienne PETIT) sont déjà appliqués par les
-- vues : aucune fiche claimed ni la fiche protégée ne peut s'y retrouver.
-- Vérifier malgré tout AVANT toute exécution :
--   SELECT count(*) FROM public._candidats_dedupe;                      -- total
--   SELECT critere, count(*) FROM public._candidats_dedupe GROUP BY 1;  -- par critère
--   SELECT * FROM public._candidats_dedupe WHERE claimed = true;        -- DOIT être vide
--   SELECT * FROM public._candidats_dedupe
--     WHERE id = '4275105a-4d45-46fd-9012-6701f1c9ea81';                 -- DOIT être vide
--
-- -- Suppression des doublons par (nom_commercial + code_postal) :
-- -- DELETE FROM pros_sanitaire
-- --  WHERE id IN (SELECT id FROM public._candidats_dedupe_nom_cp WHERE rn > 1)
-- --    AND claimed = false
-- --    AND id <> '4275105a-4d45-46fd-9012-6701f1c9ea81';
--
-- -- Suppression des doublons par phone_e164 :
-- -- DELETE FROM pros_sanitaire
-- --  WHERE id IN (SELECT id FROM public._candidats_dedupe_phone WHERE rn > 1)
-- --    AND claimed = false
-- --    AND id <> '4275105a-4d45-46fd-9012-6701f1c9ea81';
-- ============================================================================
