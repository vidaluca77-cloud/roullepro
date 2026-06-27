# Analyse pré-lancement — Chantiers FINESS + Formulaires + Home

Document de validation préparé le 22 juin 2026, avant ouverture de la branche `feat/finess-formulaires` et démarrage du Sprint 1.

Référence: `chantiers_finess_formulaires_home.md` (asset `9059aaa7-e4dd-4673-9d0f-9040eb1d2011`).

---

## 1. Verdict global

Le cahier des charges est solide et cohérent avec l'existant. Aucune incompatibilité majeure détectée. Quelques ajustements nécessaires avant le premier commit, listés en chapitre 3.

Couverture du spec vérifiée:
- Schéma Supabase actuel: catégories `taxi_conventionne` (17 026) / `ambulance` (9 673) / `vsl` (529) — cohérent avec le doc
- Bridge `bridge_roulepro_to_tcp()` actuel récupéré et confirmé conforme à la description du chapitre B5
- Vues `pros_sanitaire_public`, `sanitaire_top_villes`, `sanitaire_home_stats`, `sanitaire_regions` existent et seront laissées intactes
- Aucun conflit avec la table existante `prescripteur_demandes` (champs différents, usage différent)
- Composants à réutiliser présents: `SearchHero`, `ContactProForm`, `ReclamerForm`, `AmeliBadge`, `OpenStatusBadge`, `NearbyCities`

---

## 2. Ce que le doc ne couvre pas mais existe déjà (bonne nouvelle)

### 2.1 Rate limit
Le doc parle d'Upstash Redis "si dispo" ou d'une table SQL TTL. **Inutile**: `src/lib/rate-limit.ts` expose déjà `checkRateLimit(key, limit, windowMs)` et `getClientIp(request)`, en mémoire avec fallback documenté vers Upstash si besoin plus tard. On réutilise tel quel.

### 2.2 Email Resend
Le doc évoque "envoi des emails Resend (1 par pro)". **Wrapper existe**: `src/lib/email.ts` exporte `sendEmail({ to, subject, html, reply_to? })`. Variable `RESEND_FROM_EMAIL` déjà gérée.

Limite à connaître: le wrapper n'accepte PAS `bcc`. Trois options:
- a) Étendre `sendEmail` pour accepter un `bcc?: string | string[]` (1 ligne)
- b) Faire un second envoi explicite vers `contact@roullepro.com` (plus simple, plus auditable)
- c) Lister `contact@roullepro.com` dans `to` en plus du pro

Recommandation: option (a) — extension minimaliste du helper, plus propre.

### 2.3 Helpers SEO et stats
`getProStats()` (src/lib/stats.ts) déjà en place avec cache 15 min, comptage `estimated` (perf homepage). On ajoutera juste un `etablissementsCount`.

`sitemap-builders.ts` exporte `SANITAIRE_FICHES_CHUNKS = 80` et expose le pattern à suivre pour les 2 nouveaux builders FINESS.

### 2.4 Forms et Netlify
`public/__forms.html` existe (formulaire de contact Netlify Forms). Pour les nouveaux formulaires on n'utilisera **pas** Netlify Forms (le doc le prévoit déjà via API POST `/api/demande-transport`), donc pas de conflit.

---

## 3. Manquements et ajustements nécessaires avant le premier commit

### 3.1 Dépendance manquante: `csv-parse`
Le script `scripts/import-finess.ts` (Chantier A4) en a besoin. Le doc dit "déjà installé probablement" → **faux**. À ajouter:
```bash
npm i csv-parse
```
Aucune autre dépendance manquante détectée.

### 3.2 Catégorie taxi mal orthographiée dans certains passages
Le doc utilise tantôt `'taxi'` (dans le filtre matrice de routage et props du composant) tantôt `'taxi_conventionne'` (dans le bridge). **La valeur réelle en BDD est `taxi_conventionne`** (avec underscore et sans accent).

Décision: dans l'UI on garde le libellé "Taxi conventionné" affiché à l'utilisateur, mais côté state et payload API la valeur stockée doit être `taxi_conventionne` partout. Une fonction de mapping unique dans `src/lib/transport-types.ts` pour normaliser:
```ts
export const TYPE_TRANSPORT_TO_CATEGORIE = {
  taxi: 'taxi_conventionne',
  vsl: 'vsl',
  ambulance: 'ambulance',
} as const;
```
Ça évite la dérive de strings en clair dans 5 fichiers différents.

### 3.3 BCC dans les envois Resend
Voir 2.2: il faut étendre `sendEmail` ou faire un envoi explicite vers `contact@roullepro.com`. À traiter dans le Sprint 3 quand on attaque les templates.

### 3.4 Colonnes téléphone des pros
Le doc évoque `email_public` (correct), mais ne précise pas les champs téléphone. En BDD réelle on a:
- `phone_e164` (format international, source de vérité pour les reveals)
- `telephone_public` (format affichable)

À noter pour les emails Resend si on veut afficher le téléphone du pro dans l'email envoyé au demandeur (template `demande-transport-confirmation`).

### 3.5 Volumétrie FINESS révisée
Le doc dit ~15-20k établissements après filtrage. À vérifier sur le CSV réel: les codes catégories d'agrégation listés au A4 vont sans doute donner plutôt **8-12k** établissements pertinents (les EHPAD font le gros volume, ~7000). Pas un blocage, juste à confirmer après l'import initial.

### 3.6 `pros_proches_etablissement` — index complémentaire
La fonction Haversine SQL pure proposée tourne mais sera lente sans l'index combiné. À ajouter dans la même migration:
```sql
CREATE INDEX IF NOT EXISTS idx_pros_geo_active
ON pros_sanitaire (categorie, latitude, longitude)
WHERE actif = true AND COALESCE(suspendu, false) = false
  AND latitude IS NOT NULL AND longitude IS NOT NULL;
```
Sub-100ms garanti à 26k pros.

### 3.7 Tracking GA4 — IDs d'events à standardiser
Le doc cite `home_form_submit`. À élargir pour la cohérence:
- `demande_transport_submit` (param: `type_transport`, `source_page`, `pros_notifies`, `tcp_notifies`)
- `demande_transport_view` (param: `source_page`)
- `etablissement_view` (param: `etablissement_id`, `categorie_simple`)
- `transport_vers_view` (param: `etablissement_id`)

À implémenter via dataLayer push, on déclarera les events dans GA4 admin après le premier déploiement.

---

## 4. Zones de risque et points de vigilance

### 4.1 Modification du bridge — minimale et sûre
Version finale (après clarification 22 juin): on ajoute UNIQUEMENT le filtre `categorie='taxi_conventionne'` au bridge. Le filtre claimed actuel reste en place. Effets:
- VSL et ambulance ne déclenchent plus jamais le bridge → anomalie corrigée (ils n'auraient jamais dû)
- Les ~1000 fiches taxi claimed gardent leur exclusivité → zero changement de comportement pour les pros claimed
- Les fiches taxi non claimed continuent de fan-outer vers TCP → comportement actuel inchangé

Aucun email d'information à envoyer aux pros taxi claimed: leur expérience ne change pas.

### 4.2 PostGIS absent
Confirmé: PostGIS pas installé sur Supabase RoullePro. Haversine SQL pur reste viable jusqu'à ~50k pros. Pour la V2 et le scaling au-delà, basculer PostGIS sera une migration séparée (extension `postgis`, colonne `geog geography`, GiST index).

### 4.3 Fiche Etienne PETIT — règle absolue
Le bridge modifié et la nouvelle fonction `pros_proches_etablissement` n'ont rien qui touche directement Etienne PETIT (id `4275105a-4d45-46fd-9012-6701f1c9ea81`), mais comme le département 73 a 0 chauffeur TCP éligible, en pratique aucune demande taxi ne sera fan-outée dans le 73 → fiche pas affectée. Confirmé par requête BDD.

### 4.4 Stripe et abonnements
Le doc confirme: aucune modification touchant Stripe. Les 3 price IDs critiques (`price_1TPTHrJQRPoIacwzO3PxAv8M`, `price_1ThR52JQRPoIacwzwqsXusLv`, `price_1TZFdwJQRPoIacwzQ4zPEYLF`) ne sont jamais référencés dans les nouveaux fichiers. À vérifier en code review avant chaque merge.

### 4.5 Sitemaps chunks intouchables
Les 80 SANITAIRE_FICHES_CHUNKS restent en place. On ajoute 2 nouveaux sitemap noms (`etablissements.xml`, `transport-vers.xml`) qui s'insèrent dans `namedItems` du sitemap index, **après** les chunks. Aucune renumérotation.

### 4.6 Volumétrie pages ISR
~15-20k fiches établissements + ~15-20k pages "transport vers" → ~40k pages supplémentaires à ISR. Avec `generateStaticParams` limité aux top 500 et le reste en ISR à la demande, pas d'explosion du temps de build. Risque modéré: cache misses au début sur les pages longue traîne. À monitorer via GSC après 30 jours.

---

## 5. Setup Netlify pour Deploy Previews — protocole

### 5.1 Comportement par défaut confirmé
Netlify avec `@netlify/plugin-nextjs` v5 (config actuelle dans `netlify.toml`) génère automatiquement:
- **Deploy Preview** pour chaque PR ouverte sur GitHub vers la branche par défaut (`main`)
- **Branch Deploy** pour chaque push sur une branche non-main (si activé dans le dashboard)

La config actuelle `netlify.toml` ne désactive pas ces comportements → Deploy Previews actifs par défaut.

### 5.2 Vérification à faire dans le dashboard Netlify
Avant de pousser la première PR, il faut confirmer dans **Site settings → Build & deploy → Continuous deployment**:
- "Branch deploys" = `All` OU au minimum activé pour la branche `feat/finess-formulaires`
- "Deploy Previews" = `Any pull request against your production branch & branch deploy branches`

Action: je peux vérifier ça via l'API Netlify (connecteur `netlify__pipedream`) ou tu peux le confirmer manuellement en 30 secondes. À toi de me dire.

### 5.3 Variables d'environnement preview
Critique: il faut vérifier que les ENV vars sont bien scopées **`All deploy contexts`** dans Netlify, sinon le Deploy Preview tournera sans `RESEND_API_KEY` / `SUPABASE_SERVICE_ROLE_KEY` et les tests E2E échoueront.

Vars à vérifier:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `NEXT_PUBLIC_APP_URL` (à override pour les previews → la valeur sera l'URL `deploy-preview-*.netlify.app`)

### 5.4 Protocole de travail recommandé

```
Étape 1: Création de la branche
  git checkout main
  git pull origin main
  git checkout -b feat/finess-formulaires

Étape 2: Premier commit "scaffold"
  - Documentation: copie du spec dans docs/finess-import.md
  - Ajout csv-parse au package.json
  - Pas de code, juste setup

Étape 3: Push initial et création PR draft
  git push -u origin feat/finess-formulaires
  gh pr create --draft --title "feat: FINESS + formulaires unifiés + home conversion" \
    --body "$(cat docs/finess-import.md)"
  → Netlify génère automatiquement le Deploy Preview
  → URL preview disponible dans 3-5 minutes
  → Tu reçois la notif GitHub avec le lien

Étape 4: Sprints 1 à 5
  Chaque sprint = série de commits + push.
  Chaque push → Netlify build automatiquement le Deploy Preview.
  La PR reste en draft jusqu'à validation E2E complète.

Étape 5: Tests E2E sur preview
  Une fois Sprint 3 terminé, tester les 6 scénarios de routage sur l'URL preview:
  - Taxi + claimed → double envoi (RoullePro + TCP)
  - Taxi + non claimed → fan-out TCP uniquement
  - VSL + claimed → email pro + BCC contact@
  - VSL + non claimed → fallback contact@
  - Ambulance + claimed → email pro + BCC contact@
  - Ambulance + non claimed → fallback contact@

Étape 6: Marquer PR ready for review
  gh pr ready
  → Si OK pour toi, merge sur main = déploiement prod automatique

Étape 7: Plan B en cas de problème
  Tout reste sur la branche feature. Si quelque chose casse au merge:
  git revert <commit> ou rollback Netlify en 1 clic dans le dashboard.
```

### Note matrice de routage — demandes ouvertes (home, FINESS)

Pour les nouveaux formulaires sans pro_id_cible, l'exclusivité claimed ne s'applique pas (pas de pro cible). La logique applicative dans `/api/demande-transport`:
- Taxi: fan-out TCP du département + emails Resend top 5 pros taxi avec email_public dans rayon 30 km
- VSL: emails Resend top 5 pros VSL avec email_public dans rayon 30 km, fallback contact@ si aucun
- Ambulance: emails Resend top 5 pros ambulance avec email_public dans rayon 30 km, fallback contact@ si aucun

L'exclusivité claimed reste un avantage de la fiche pro (formulaire ContactProForm sur la page du pro), pas un privilège transverse à toute la zone.

### 5.5 Base Supabase et previews
Important: les Deploy Previews tapent par défaut sur **la même base Supabase que la prod**. Donc:
- Les `INSERT` dans `etablissements_sante` faits en test depuis la preview seront visibles en prod
- Idem pour `demandes_transport`

Deux options:
- a) Marquer les demandes de test avec un flag `source_page='preview_test'` → filtrable et nettoyable
- b) Créer un projet Supabase staging séparé (long, pas recommandé pour ces chantiers)

Recommandation: option (a). On nettoie après les tests via:
```sql
DELETE FROM demandes_transport WHERE source_page = 'preview_test';
```

---

## 6. Plan d'attaque détaillé — ordre de commits

### Commit 1 — Scaffolding (branche `feat/finess-formulaires`)
- `docs/finess-import.md`: copie du spec + cette analyse
- `package.json`: ajout `csv-parse`
- `src/lib/transport-types.ts`: enums et mapping unique taxi/vsl/ambulance → catégorie BDD
- Pas de migration SQL, pas de route Next, pas de composant
- Objectif: PR draft ouverte, Deploy Preview généré, base saine

### Commits Sprint 1 (Chantier A.1 à A.5)
- 1 commit migration SQL `etablissements_sante` (table, index, RLS, vue)
- 1 commit `scripts/import-finess.ts` (sans run)
- 1 commit run d'import initial (manuel sur la branche, via `tsx scripts/import-finess.ts`)
- 1 commit edge function `etab-refresh-finess` + pg_cron

### Commits Sprint 2 (Chantier A.6 + A.7)
- 1 commit par route Next: `/etablissements`, `/etablissements/[type]`, `/etablissements/[type]/[ville]`, `/etablissements/[slug]`
- 1 commit sitemap builders + insertion dans namedItems

### Commits Sprint 3 (Chantier B)
- 1 commit migration `demandes_transport` + `pros_proches_etablissement` + index complémentaire
- 1 commit modification bridge `bridge_roulepro_to_tcp` (la plus risquée, à reviewer attentivement)
- 1 commit endpoint `/api/demande-transport`
- 1 commit composant `<DemandeTransportForm>` (sans intégration dans pages)
- 1 commit 3 templates Resend
- 1 commit tests E2E (script de validation des 6 scénarios)

### Commits Sprint 4 (A.6 dernière route + C)
- 1 commit route `/transport-medical/vers/[etablissement-slug]`
- 1 commit modification home `src/app/page.tsx` + intégration `<DemandeTransportForm variant="home">`

### Commits Sprint 5 (Polish)
- 1 commit FAQ et JSON-LD
- 1 commit doc finale `docs/finess-import.md` (procédure d'opération courante)

### Merge final
- Marquage PR ready for review
- Validation E2E une dernière fois sur preview
- Merge sur main → déploiement prod
- Tag `v0.X.0-finess`

---

## 7. Décisions figées

Décisions figées le 22 juin:
- Bridge: option minimale (filtre catégorie seul, claimed conservé) → validé
- Demandes ouvertes home/FINESS: option B (toujours fan-out TCP pour taxi, exclusivité claimed non applicable) → validé
- Aucun email d'info aux pros claimed nécessaire (rien ne change pour eux)

Reste à vérifier avant le merge final (pas avant le commit 1):
- Variables d'env Netlify scopées "All deploy contexts" → à vérifier dans le dashboard avant tests E2E Sprint 3
- Deploy Previews actifs sur la branche → à vérifier au push initial

---

## 8. Annexe — Identifiants vérifiés

- Projet Supabase RoullePro: `ypgolzcibtjljfydxcun`
- Repo GitHub: `vidaluca77-cloud/roullepro`
- Stack: Next.js 14.1.0, Resend 6.12.0, Stripe 22.0.2, Supabase SSR 0.4.0
- Catégories réelles: `taxi_conventionne` (17 026), `ambulance` (9 673), `vsl` (529)
- Bridge actuel: ignore claimed, fan-out toutes catégories — à modifier en Sprint 3
- Fiche intouchable: Etienne PETIT `4275105a-4d45-46fd-9012-6701f1c9ea81` (dpt 73, 0 chauffeur TCP éligible donc 0 impact)
- Prices Stripe intouchables: `price_1TPTHrJQRPoIacwzO3PxAv8M`, `price_1ThR52JQRPoIacwzwqsXusLv`, `price_1TZFdwJQRPoIacwzQ4zPEYLF`
