# Rapport de session — 3 mai 2026

## 1. Ce qui a été fait

### 1.1 Phase B — Import Ameli CNAM (terminée)

Import de l'annuaire santé Ameli (specialite_code 55 = transport sanitaire) depuis data.gouv.fr, snapshot 2026-04-27.

| Étape | Résultat |
|---|---|
| B1 — Migration SQL | Tables `ameli_staging` et `ameli_match_review` créées · 3 colonnes ajoutées à `pros_sanitaire` (`ameli_conventionne`, `ameli_last_seen`, `phone_e164`) |
| B2 — Téléchargement et nettoyage CSV | 153 Mo bruts → 4 378 lignes uniques specialite 55 avec téléphone E.164 |
| B3 — Normalisation E.164 | 705 fiches existantes ont reçu leur `phone_e164` |
| B4 — Matching dry-run | Rapport `AMELI_MATCH_REPORT.md` produit · répartition Cas 1/2/3 |
| B5 — Validation utilisateur | 3 décisions tranchées (UPDATE auto Cas 2B, catégorie ambulance, adresse telle quelle) |
| B6 — Application | 2 711 UPDATE + 1 648 INSERT + 2 581 compléments téléphone |
| B7 — Commit Git | `d355328` poussé sur `main` |

### 1.2 Audit data.gouv (préalable)

Cartographie de 12 mots-clés (24 requêtes API) sur datasets et dataservices data.gouv.fr → rapport `DATA_GOUV_AUDIT.md`. Conclusion clé : pas d'email dans les sources publiques, FINESS gratuit (266 Mo), API Recherche Entreprises pour SIRET, Ameli annuaire-santé exploitable.

### 1.3 Nettoyage post-import

- Compléments téléphone sur 2 581 fiches Cas 2 (UPDATE manquant à la première passe)
- Suppression de 7 doublons internes validés (ARCANGE ×1, EVRECY ×3, NEUBOURG ×1, NATHALIE ×1, HRV ambulance ×1 — la fiche HRV vsl protégée a été conservée)
- Edge function `ameli-ingest-staging` neutralisée (version 2 retourne 410 Gone)

### 1.4 Garde-fous appliqués et vérifiés

- Aucune fiche `claimed_by IS NOT NULL OR claimed = true OR verified = true` n'a été modifiée
- Les 4 fiches reclaimed connues ont toutes `ameli_conventionne = false` après import : Taxi PETIT 73, TAXI YVES 68, TAXI MULOT 89, AMBULANCES CANTONALES 59
- Aucune migration touchant Stripe, le frontend ou les fonctions métier
- Tous les UPDATE et INSERT ont été précédés d'un dry-run validé par toi

## 2. Photo de la base avant / après

| Indicateur | Avant Phase B | Après Phase B + nettoyage |
|---|---|---|
| Total `pros_sanitaire` | 25 938 | **27 580** |
| Ambulances | 9 692 | 11 335 |
| Taxis conventionnés | 14 503 | 14 502 |
| VSL | 1 743 | 1 743 |
| Avec téléphone E.164 | ~705 | **4 880** |
| Conventionnées Ameli | 0 | **4 359** |
| Source `ameli_cnam` | 0 | 1 648 |
| Réclamées/vérifiées | 30 | 30 (intactes) |
| Plan payant | 0 | 0 |
| Avec email public | 49 | 49 |
| Avec site web | 6 | 6 |

## 3. Ce qui reste à faire

### 3.1 Dette historique identifiée

- **1 994 groupes de doublons** (raison_sociale + code_postal) totalisant ~4 494 fiches, hérités des imports SIRENE. Pas créés par Phase B.
- **22 700 fiches sans téléphone** (8 609 ambulances/VSL + 14 091 taxis) — sources SIRENE n'en fournissaient pas.
- **49 emails seulement** sur 27 580 fiches.
- **6 sites web seulement**.

### 3.2 État commercial

- 0 abonné payant
- 30 fiches réclamées mais pas converties en plan Pro
- 1 648 nouvelles fiches Ameli totalement neuves, jamais sollicitées par concurrents

## 4. Plan d'action recommandé

### Priorité 1 — Activer la conversion (semaine 1-2)

L'import Ameli est inutile si personne ne sait que sa fiche est en ligne. Le bottleneck immédiat : 0 abonné payant, 30 réclamations.

- **Phase C1 — Email outreach Ameli conventionnés** : enrichir les 4 359 fiches Ameli conventionnées avec emails via Findymail (déjà connecté). Cible : 800-1 200 emails trouvables (taux 20-30 % réaliste sur SIRET ambulance). Coût Findymail : à mesurer en pilote 100 fiches.
- **Phase C2 — Campagne prescripteurs hospitaliers** : tu as déjà la page `/prescripteurs`. La nourrir avec une recherche ciblée hôpitaux/cliniques par département pour leur dire "voici les ambulances conventionnées CPAM dans votre zone". Le statut Ameli est ton arme commerciale.

### Priorité 2 — Compléter les fiches existantes (semaine 2-4)

- **Phase C3 — Enrichissement téléphone via Outscrapper/Pages Jaunes** : prioriser les 8 609 ambulances/VSL sans phone (Ameli les rendra exploitables). Lot pilote 200, mesurer taux de match avant industrialisation.
- **Phase C4 — Dédoublonnage SIRENE** : 1 994 groupes à fusionner. Stratégie : règle automatique (garder fiche avec adresse la plus longue, claimed > non-claimed, fusionner phones), exécutée en lot par département avec dry-run préalable.

### Priorité 3 — Capitaliser sur le différenciant (semaine 3-6)

- **Phase C5 — Badge "Conventionné Ameli"** sur les fiches : 4 359 fiches concernées, à afficher visuellement sur le site. Améliore la confiance utilisateur et le SEO local.
- **Phase C6 — SEO ville × spécialité** : avec 4 359 fiches Ameli conventionnées réparties sur 103 départements, la matière première existe pour des pages "ambulance conventionnée [ville]" qui surperforment les concurrents qui n'ont pas cette donnée.
- **Phase C7 — Rafraîchissement mensuel Ameli** : automatiser un cron mensuel qui retélécharge le snapshot Ameli, met à jour `ameli_last_seen` et signale les fiches qui ne réapparaissent plus (déconventionnement).

### Priorité 4 — Sources complémentaires (semaine 4+)

- **FINESS** (266 Mo, audit déjà fait) : utile surtout pour les structures hospitalières, pertinent pour la cible prescripteurs en C2.
- **Annuaire ADS taxis** par préfectures : si tu veux compléter les 14 091 taxis sans téléphone, c'est la source officielle (mais multi-préfectures, lourd).
- **API Recherche Entreprises** : enrichir SIRET/SIREN sur les 1 648 nouvelles fiches Ameli (Ameli ne fournit pas le SIRET, ça permet de relier à la base SIRENE et vérifier l'activité).

## 5. Recommandation de l'ordre d'exécution

Ma reco : **C1 (emails Ameli) en pilote 100 fiches dès cette semaine**. C'est la voie la plus rapide vers du chiffre d'affaires :
- Tu as déjà Findymail connecté
- Tu as 4 359 cibles qualifiées Ameli (donc actives, donc avec un budget)
- Tu as déjà la page `/prescripteurs` et `/partenaires` pour convertir
- Stripe Pro existe (`price_1TPTHrJQRPoIacwzO3PxAv8M`)

Le reste (dédoublonnage, FINESS, ADS) n'apporte rien tant que tu n'as pas validé la mécanique commerciale sur un échantillon.

## 6. Décision attendue

Quel chantier ouvrir maintenant ?
- C1 — Pilote emails Ameli (100 fiches Findymail)
- C2 — Recherche prescripteurs hôpitaux/cliniques
- C4 — Dédoublonnage SIRENE
- Autre chose

Pas d'action automatique. J'attends ta décision.
