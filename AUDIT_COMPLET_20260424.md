# Audit complet roullepro.com — 24 avril 2026

**Scope** : site live roullepro.com, base Supabase ypgolzcibtjljfydxcun, dépôt GitHub vidaluca77-cloud/roullepro, infrastructure Netlify.
**Contexte** : site d'annuaire du transport sanitaire (ambulances / VSL / taxis conventionnés) en France, avec marketplace d'annonces véhicules pro et module dépôt-vente. Lancement SEO en phase d'indexation Google.

---

## Résumé exécutif

Le site est fonctionnellement **solide** (34 271 URLs dans le sitemap, schéma JSON-LD complet, architecture Next.js 14 propre, 29 tables en base, Stripe et Google Ads branchés), mais il souffre de **trois faiblesses critiques** qui bloquent la traction commerciale :

1. **Les 18 228 fiches sont des coquilles vides** (aucun téléphone, aucun email, aucun horaire, aucune description) — l'annuaire n'a quasi aucune valeur pour un patient qui arrive de Google.
2. **Une seule fiche a été revendiquée** sur 18 228, ce qui confirme que le parcours de conversion pro ne démarre pas (faute de trafic, faute de notoriété, ou les deux).
3. **Le site n'est indexé qu'à 1 URL** par Google (homepage). Le sitemap vient d'être corrigé mais la soumission GSC n'est pas encore faite et l'Indexing API renvoie un silent-fail.

Les corrections techniques sont simples (fix title "Cross" fait et pushé, RLS Supabase à optimiser, sitemap déjà OK). Le vrai chantier est **data + acquisition** : enrichir les fiches avec de vraies données externes et pousser la présence Google.

---

## 1. Performance technique

### Mesures

- **Homepage** : TTFB ~3 s — trop lent (idéal < 1 s, acceptable < 1,8 s). Cause probable : absence de cache ISR sur la home, trop de requêtes Supabase en SSR.
- **Page ville Paris** : HTML 857 KB — très lourd. Probablement 200 fiches listées en SSR + grille Tailwind non purgée + JSON-LD verbeux.
- **Fiche pro individuelle** : 831 ms — OK.
- **Sitemap (chunks)** : chaque sous-sitemap < 1 s après le refactor. Conforme aux attentes Google (< 10 s).

### Points positifs

- Next.js 14 app router, revalidate: 3600 bien posé sur les pages SEO.
- Images pro avec attributs alt.
- Google Ads tag actif (AW-18107104211), GA4 conditionnel sur env.

### À corriger

- **TTFB home** : mettre la home en ISR 1 h (on peut précalculer les stats en background) au lieu de force-dynamic implicite.
- **Page ville** : réduire la liste SSR à 50 fiches + pagination client-side pour les suivantes. Supprimer les classes Tailwind inutiles (purge).
- **Images** : vérifier que les tailles fichiers sont bien optimisées via next/image (lazy loading + AVIF/WebP).
- **Lighthouse CI** : aucun résultat lancé en automatique — à intégrer dans Netlify pour tracker la régression.

---

## 2. SEO on-page

### Audit réalisé

- **Titles et meta** : globalement OK, canonicals présents, balises OpenGraph propres.
- **Bug "Cross"** : FIXÉ cette session. Les titles des pages /transport-medical et /transport-medical/[ville] utilisaient le mot "Cross" au lieu de "Ambulance" (confusion avec le nom de l'icône lucide-react). Commit [eec9618](https://github.com/vidaluca77-cloud/roullepro/commit/eec9618) poussé.
- **JSON-LD** : 8 types détectés (LocalBusiness, EmergencyService, TaxiService, FAQPage, BreadcrumbList, etc.) — conforme.
- **H1** : 1 par page. Correct.
- **Images alt** : présents sur les pages auditées.
- **Sitemap** : refait cette session, 34 271 URLs en 22 chunks.
- **robots.txt** : OK, pointe vers /sitemap.xml.
- **llms.txt** : enrichi la session précédente.

### À faire

- **Soumettre le sitemap dans GSC** avec le compte contact@roullepro.com : https://roullepro.com/sitemap.xml
- **Demander l'indexation manuelle** via GSC pour le top 10 des villes (Paris, Marseille, Lyon, Toulouse, Nice, Nantes, Montpellier, Strasbourg, Bordeaux, Lille) et la page /transport-medical.
- **Vérifier l'indexation** dans 7-10 jours avec `site:roullepro.com`.
- **Indexing API** : le connecteur Pipedream renvoie null pour les domaines non vérifiés — à abandonner, le sitemap suffit.

---

## 3. Structure et contenu

### Forces

- Architecture routes claire : /transport-medical, /transport-medical/[ville], /[ville]/[categorie]/[slug].
- Maillage interne : FAQ visible sur la fiche, liens villes voisines.
- Contenu éditorial ville (intro SEO) généré.
- Pages légales complètes : /cgu (61 KB), /mentions-legales, /contact.
- Blog : route /blog/[slug] et /blog/categorie/[slug] en place.

### Problème critique : données vides

Sur 18 228 fiches actives :

| Champ | Remplis |
|---|---|
| Téléphone | 0 |
| Email | 0 |
| Horaires | 0 |
| Description | 0 |
| Fiches revendiquées | 1 |
| Géolocalisation | 18 113 |

**C'est le bloqueur numéro 1**. L'utilisateur arrive sur la fiche depuis Google, ne trouve aucun numéro à appeler, repart. Google voit un taux de rebond de 100 % et déprécie le domaine. Le patient n'y revient pas.

### Plan d'enrichissement (sans inventer)

1. **Google Business Profile** : pour les 500 premières fiches (top villes), consulter la fiche GBP et remonter téléphone + horaires affichés publiquement. À faire manuellement ou via l'API Places (coût ~17 $/1000 lookups).
2. **Pages Jaunes / Annuaire Santé** : deux annuaires publics qui listent tous les ambulanciers avec téléphones. Extraction possible (page-à-page, dans le respect des CGU).
3. **INSEE / SIRENE** : on a le SIRET donc on peut parfois remonter des infos complémentaires. Les emails ne sont pas publics mais l'adresse postale l'est.
4. **Appel à revendication** : lancer une campagne mailing physique vers les 200 plus grosses structures (adresse via SIRENE) avec un lien unique /transport-medical/pro/reclamer?pro=XXX.

Point bloquant mentionné par l'utilisateur : **"rien d'inventer"** — donc l'enrichissement doit passer par ces sources externes vérifiables, pas par IA générative.

### Pages manquantes à envisager

- **/transport-medical/urgences** : page SEO dédiée "ambulance urgence" (très recherché).
- **/transport-medical/vsl-conventionne** : page par catégorie (actuellement catégorie en sous-route ville).
- **/blog/guides** : guides pratiques (remboursement sécurité sociale, bon de transport, etc.) — fort potentiel longue traîne.

---

## 4. Conversion

### Pricing et Stripe

- **Essential 19,90 €** / **Premium 39 €** / **Pro+ 79 €** — gamme cohérente, positionnement clair.
- 14 jours gratuits mis en avant, sans CB — excellent pour la conversion.
- Résiliation 1 clic promise — à vérifier que c'est bien implémenté côté portail.
- Page /transport-medical/tarifs propre, CTAs différenciés selon état (pas connecté / connecté sans fiche / connecté avec fiche / plan actuel).
- FAQ visible en bas de la page tarifs.

### CTAs et parcours pro

- `/transport-medical/pro` → landing dédiée pros.
- `/transport-medical/pro/reclamer?pro=xxx` → formulaire de réclamation (page simple, form dédié).
- `/transport-medical/pro/dashboard` et `/messages` → espace pro.

### Points de friction

1. **Le CTA de réclamation n'est pas assez visible sur la fiche**. Un pro qui tombe sur sa fiche doit voir en gros "C'est votre entreprise ? Réclamez-la en 2 min". À vérifier sur la page /[ville]/[cat]/[slug].
2. **Parcours réclamation à 2 étapes** : remplir un form + attendre validation admin. Simplifier : validation auto si email correspond au domaine du SIRET, sinon validation manuelle en 24 h max.
3. **Marketplace d'annonces** : 8 annonces actives, 8 profils, 1 abonnement actif. Volume très faible — pas de masse critique pour le moment.

### Actifs conversion

- Stripe en live : 3 prices configurés (price_1TPTHr...).
- Module dépôt-vente fonctionnel avec escrow.
- Garages partenaires : 4 inscrits.

---

## 5. Données et monitoring

### Supabase — advisors de sécurité (5 warnings)

- `function_search_path_mutable` sur `public.set_updated_at_sanitaire` — ajouter `SET search_path = public`.
- `extension_in_public` : `pg_net` installé dans public, à déplacer dans un schéma dédié.
- **`public_bucket_allows_listing`** : buckets `annonces-photos` et `depot-vente-photos` permettent le listing. À corriger — restreindre la policy SELECT aux fichiers connus uniquement, pas au listing complet. Risque d'exposition de photos non publiées.
- `auth_leaked_password_protection` désactivé — à activer dans Auth settings (vérif HaveIBeenPwned).

### Supabase — advisors de performance (~40+ warnings)

- **`unindexed_foreign_keys`** : ~10 FK sans index (depot_events, escrow_transactions, garage_creneaux, offres, pros_sanitaire.claimed_by, sanitaire_claims, sanitaire_replies, transactions_depot...). Impact perf modéré tant que le volume est bas. À indexer avant de scaler.
- **`auth_rls_initplan`** : ~25 policies RLS qui ré-évaluent `auth.uid()` par ligne au lieu de `(select auth.uid())`. Impact fort sur les tables à gros volume (pros_sanitaire 18 228 lignes). Pattern à corriger en bloc.

### Monitoring applicatif

- **Google Analytics 4** : tag présent (conditionnel sur env), à vérifier que l'ID est bien renseigné en prod.
- **Google Ads** : AW-18107104211 actif.
- **Sentry / logs** : pas de Sentry installé. Recommandé vu la criticité du module Stripe.
- **Netlify logs** : disponibles côté dashboard Netlify, pas d'alerte programmée.
- **Supabase logs** : accessibles via le tableau de bord.

### À brancher

- **Sentry** (ou équivalent) sur les routes API Stripe, escrow, checkout — détection proactive des erreurs de paiement.
- **Uptime monitoring** (UptimeRobot gratuit) sur /, /transport-medical, /api/sanitaire/stripe/checkout.

---

## Plan d'action priorisé

### P0 — À faire cette semaine

| # | Action | Effort | Impact |
|---|---|---|---|
| 1 | ~~Fix title "Cross" → "Ambulance"~~ | FAIT commit eec9618 | SEO |
| 2 | Soumettre sitemap.xml dans GSC (contact@roullepro.com) | 5 min | Indexation |
| 3 | Demande d'indexation manuelle top 10 villes dans GSC | 30 min | Indexation immédiate |
| 4 | Corriger les 2 buckets storage (annonces-photos, depot-vente-photos) | 30 min | Sécurité |
| 5 | Activer "Leaked password protection" dans Supabase Auth | 2 min | Sécurité |

### P1 — À faire ce mois-ci

| # | Action | Effort | Impact |
|---|---|---|---|
| 6 | Enrichir 500 fiches top villes avec téléphones (GBP ou annuaire public) | 2-3 jours | Conversion + SEO |
| 7 | Simplifier le CTA de réclamation sur la fiche pro | 2 h | Conversion |
| 8 | Optimiser TTFB home (ISR + cache stats) | 3 h | Perf + SEO |
| 9 | Optimiser HTML page ville (pagination 50 + purge Tailwind) | 4 h | Perf + SEO |
| 10 | Corriger les RLS initplan (pattern auth.uid() → (select auth.uid())) | 2 h | Perf DB |
| 11 | Ajouter les 10 index FK manquants | 1 h | Perf DB |
| 12 | Installer Sentry sur les routes Stripe/escrow | 2 h | Stabilité |
| 13 | Créer Google Business Profile RoullePro | 30 min | Notoriété |

### P2 — À faire dans les 90 jours

| # | Action | Effort | Impact |
|---|---|---|---|
| 14 | Campagne mailing physique 200 structures (SIRENE) | 1 semaine | Acquisition pros |
| 15 | Blog : 10 guides pratiques (remboursement, bon de transport, etc.) | 2 semaines | SEO longue traîne |
| 16 | Pages catégorielles transverses (/vsl-conventionne, /urgences) | 3 jours | SEO |
| 17 | Lighthouse CI intégré Netlify | 2 h | Non-régression perf |
| 18 | Uptime monitoring UptimeRobot | 30 min | Monitoring |
| 19 | Backlinks ciblés (annuaires santé, fédérations ambulanciers) | continu | Autorité domaine |

---

## Ce qui a été fait cette session

1. Fix du bug title "Cross" → "Ambulance" (commit eec9618 pushé).
2. Audit exhaustif Supabase (advisors sécurité + performance).
3. Audit des parcours conversion (tarifs, réclamation pro).
4. Ce rapport consolidé.

## Ce qui reste à faire sur le site après cet audit

Les 5 actions P0 + les items P1 techniques (RLS, index, TTFB). Les items data (enrichissement fiches) sont un chantier manuel ou semi-automatisé à organiser séparément.

---

_Auditeur : Computer · 24 avril 2026 · Dépôt : [vidaluca77-cloud/roullepro](https://github.com/vidaluca77-cloud/roullepro) · Prod : [roullepro.com](https://roullepro.com)_
