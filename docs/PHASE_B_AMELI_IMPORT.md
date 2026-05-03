# Phase B — Import Ameli (CNAM)

Date : 1-3 mai 2026  
Source : data.gouv.fr — annuaire-sante-ameli (snapshot 2026-04-27)  
Specialite_code 55 (Transport sanitaire — Ambulance / VSL)

## Schéma SQL ajouté

### Nouvelles tables (B1)
- `ameli_staging` — table de travail, RLS service-role only
  - Colonnes : id, raison_sociale, raison_sociale_norm, adresse, code_postal, ville, ville_norm, telephone_raw, telephone_e164, specialite_libelle, secteur_conventionnel_libelle, nature_exercice_libelle, source_file_date, imported_at
- `ameli_match_review` — table d'arbitrage manuel pour les paires ambigües (vide après cet import — toutes les ambiguïtés ont été tranchées par Cas 2 sim≥0.7)

### Nouvelles colonnes sur `pros_sanitaire` (B1)
- `ameli_conventionne` (boolean, default false) — indique fiche présente dans Ameli
- `ameli_last_seen` (timestamp) — date du snapshot Ameli source
- `phone_e164` (text) — téléphone normalisé E.164

## Flux d'exécution

### B2 — Téléchargement (1 mai)
- CSV brut Ameli : 153 Mo, 548 968 lignes
- Filtre specialite_code = 55 : 5 076 lignes
- Filtre qualité (raison_sociale + adresse + téléphone + spécialité tous présents) : 4 381 retenues
- Téléphones normalisés au format E.164 (+33...)
- Dédup : 4 381 → 4 378 lignes uniques

### B3 — Normalisation E.164 sur fiches existantes (1 mai)
- 705 fiches `pros_sanitaire` ont reçu leur `phone_e164` calculé depuis `telephone_public`
- Toutes les autres fiches sont sans téléphone valide ou hors format

### B4 — Matching dry-run (3 mai)
3 cas identifiés (rapport complet : `AMELI_MATCH_REPORT.md`) :

| Cas | Critère | Volume |
|---|---|---|
| 1 | téléphone E.164 + code postal | 137 |
| 2 | nom (similarité ≥0.7) + code postal | 2 593 (1 673 high + 920 medium) |
| 3 | aucun match | 1 648 |

### B6 — Application (3 mai)
- **2 711 fiches existantes** mises à jour : `ameli_conventionne = true`, `ameli_last_seen = '2026-04-27'`
  - Cas 1 nettoyé des collisions multiples : 130 UPDATE
  - Cas 2 nettoyé des collisions : 2 581 UPDATE
- **1 648 nouvelles fiches** insérées avec `source = 'ameli_cnam'`, catégorie `ambulance`
- Total `pros_sanitaire` : 25 938 → 27 587

### Garde-fous appliqués
- Aucune fiche `claimed_by IS NOT NULL OR claimed = true OR verified = true` n'a été modifiée (filtre SQL au niveau de chaque UPDATE)
- Vérification post-import des 4 fiches reclaimed connues (Taxi PETIT 73, TAXI YVES 68, TAXI MULOT 89, AMBULANCES CANTONALES 59) : `ameli_conventionne = false` → intactes
- Cas 1 : 3 staging matchant plusieurs pros sur même téléphone+CP exclus de l'UPDATE auto
- Cas 2 : 6 pros matchant plusieurs staging exclus de l'UPDATE auto

## Cleanup à effectuer manuellement

- **Edge Function `ameli-ingest-staging`** : déployée puis abandonnée (crash WORKER_RESOURCE_LIMIT sur 153 Mo). À supprimer via dashboard Supabase → Edge Functions.
- **Fichiers temporaires** dans `/tmp/ameli/` : peuvent être supprimés en fin de session.

## Champs Ameli non utilisés pour cet import

- `numero_inscription` (RPPS) : pas exploité, structure pros_sanitaire ne le stocke pas
- `genre`, `nom`, `prenom` : c'est de la donnée individu, on indexe l'établissement via `raison_sociale`
- `secteur_conventionnel_libelle`, `nature_exercice_libelle` : conservés en staging seulement

## Volumétrie staging

`ameli_staging` reste rempli (4 378 lignes). À conserver tant que Phase B n'est pas refermée formellement, puis vidable via `TRUNCATE public.ameli_staging;` au prochain import (snapshot suivant Ameli).
