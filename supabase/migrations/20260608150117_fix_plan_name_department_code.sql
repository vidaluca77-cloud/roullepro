-- ============================================================================
-- Bug 2 — Colonne s.plan_name inexistante
-- Bug 3 — Colonne department_code inexistante
-- ============================================================================
-- Ces deux références ont été remontées par l'ultra-review mais n'existent dans
-- AUCUN fichier du dépôt versionné (ni code TypeScript, ni migrations) :
--
--   * Bug 2 : aucune requête ne sélectionne `plan_name`. La table subscriptions
--     (migration 017) et pros_sanitaire (migration 20260423) exposent la colonne
--     `plan` (texte). Le bon nom est donc `plan`, pas `plan_name`.
--
--   * Bug 3 : tout le code utilise déjà `departement` (convention FR du projet,
--     cf. pros_sanitaire). Le bon nom est `departement`, pas `department_code`.
--
-- Les erreurs proviennent donc d'objets SQL définis directement en base via le
-- dashboard Supabase (vue/fonction admin non versionnée). Comme leur définition
-- exacte est inconnue, cette migration est DÉFENSIVE et IDEMPOTENTE :
--   - si une table candidate porte réellement une colonne au mauvais nom, on la
--     renomme vers la convention correcte ;
--   - sinon, no-op (rien n'est cassé).
--
-- Toute vue/fonction en base référençant s.plan_name ou department_code devra
-- être recréée à la main côté dashboard pour pointer vers `plan` / `departement`
-- (voir description de la PR). On ne recrée pas ici un objet dont on ignore la
-- structure réelle, pour ne pas risquer de casser la prod.
-- ============================================================================

DO $$
BEGIN
  -- Bug 2 : si subscriptions.plan_name existe (mauvais nom), le renommer en plan
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'subscriptions'
      AND column_name = 'plan_name'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'subscriptions'
      AND column_name = 'plan'
  ) THEN
    ALTER TABLE public.subscriptions RENAME COLUMN plan_name TO plan;
    RAISE NOTICE 'subscriptions.plan_name renommée en plan';
  END IF;

  -- Bug 3 : si une table porte department_code (mauvais nom) sans departement,
  -- la renommer. On couvre les tables candidates connues du projet.
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'pros_sanitaire'
      AND column_name = 'department_code'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'pros_sanitaire'
      AND column_name = 'departement'
  ) THEN
    ALTER TABLE public.pros_sanitaire RENAME COLUMN department_code TO departement;
    RAISE NOTICE 'pros_sanitaire.department_code renommée en departement';
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'profiles'
      AND column_name = 'department_code'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'profiles'
      AND column_name = 'departement'
  ) THEN
    ALTER TABLE public.profiles RENAME COLUMN department_code TO departement;
    RAISE NOTICE 'profiles.department_code renommée en departement';
  END IF;
END $$;
