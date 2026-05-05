# RoullePro — Récap final imports CPAM (4 départements)

Date : 5 mai 2026
Owner : Lucas Horville (lucas.horville@lvlia.net)
Supabase project : ypgolzcibtjljfydxcun

---

## Vue d'ensemble — État final pros_sanitaire

| Dept | Source | Fiches | Villes distinctes |
|------|--------|--------|-------------------|
| 14 | cpam_pdf_2024_03 | 130 | 79 |
| 14 | sirene | 164 | 69 |
| 14 | ameli_cnam | 3 | 3 |
| 14 | self_registration | 1 | 1 |
| 33 | itaxis_2024 | 40 | 37 |
| 33 | sirene_import_sprint25 | 144 | 71 |
| 33 | ameli_cnam | 29 | 22 |
| 69 | cpam_pdf_69_2021 | 505 | 113 |
| 69 | ameli_cnam | 24 | 17 |
| 69 | self_registration | 1 | 1 |
| 91 | cpam_pdf_91_2024 | 31 | 24 |

---

## Phase 1 — Correction slugs/villes 14, 33, 91 (60 fiches)

**120 UPDATE exécutés** (chunks 0+1 de 60 chacun) sur les fiches dont le slug ne reflétait pas la ville réelle après import. Aucune fiche claimed ni badge CPAM n'a été touchée hors override accepté par l'utilisateur.

---

## Phase 2 — Correction profonde dept 69 (476 fiches)

### Diagnostic initial (avant correction)
- 505 fiches dept 69 source cpam_pdf_69_2021
- Seulement 29 fiches cohérentes (ville+CP stockés = adresse SIRET)
- **476 fiches incorrectes (94 %)** :
  - 324 avec CP générique 69000
  - 409 mismatch ville (mauvaise commune)
  - 67 mismatch CP seul

### Cause racine
Le PDF CPAM 69 fournit la commune de rattachement administratif au lieu de la commune réelle. Sur 301 fiches initialement étiquetées Lyon, seulement 61 étaient vraiment à Lyon.

### Correction appliquée
- **6 chunks SQL exécutés** (80 + 80 + 80 + 80 + 80 + 76 = 476 UPDATE)
- Réécriture de 4 colonnes : `ville`, `code_postal`, `ville_slug`, `slug`
- Source : adresse SIRET réelle (dernier CP+commune extrait)
- Format slug : `{rs_slug}-{ville_slug}-cpam69`

### Résultat — Top 25 villes dept 69 après correction

| # | Ville | Nb |
|---|-------|----|
| 1 | Lyon | 89 |
| 2 | Vénissieux | 39 |
| 3 | Villeurbanne | 37 |
| 4 | Saint-Priest | 31 |
| 5 | Meyzieu | 21 |
| 6 | Bron | 16 |
| 7 | Décines-Charpieu | 16 |
| 8 | Vaulx-en-Velin | 12 |
| 9 | Rillieux-la-Pape | 12 |
| 10 | Caluire-et-Cuire | 11 |
| 11 | Saint-Fons | 9 |
| 12 | Tassin-la-Demi-Lune | 8 |
| 13-16 | Givors, Genas, Mions, Oullins-Pierre-Bénite | 7 |
| 17-19 | Sainte-Foy-lès-Lyon, Genay, Feyzin | 6 |
| 20-25 | Villefranche-sur-Saône, Brignais, Grigny, Écully, Corbas, Francheville | 5 |

**Diversité** : 113 villes distinctes (vs 1 dominante Lyon avant). Les 505 fiches sont désormais correctement géolocalisées sur l'ensemble du Rhône.

---

## Garanties qualité

- Aucune fiche `claimed=true` modifiée
- Aucune fiche `claim_status IN ('approved','en_attente_validation')` modifiée
- 6 IDs NEVER TOUCH intacts (Taxi Etienne PETIT, Taxi Yves EURL, Taxi Mulot, Ambulances Cantonales, Taxi 33K Sainte-Eulalie, Taxi Bernardi Vourles)
- Aucun doublon créé (slug UNIQUE respecté avec dédup `-2`, `-3` si nécessaire)
- Stripe price_1TPTHrJQRPoIacwzO3PxAv8M intact

---

## Fichiers de référence (workspace)

- `audit_69_export.json` — snapshot 505 fiches avant correction
- `audit_69_mismatches.json` — détail des 476 mismatches
- `update_69_plan.json` — plan complet anciennes/nouvelles valeurs
- `audit_69_apres_correction.json` — vérification post-correction
- `backup_14_33_avant_siret.json` — backup phase 1
- `update_slugs.sql` — SQL phase 1 (120 UPDATE)
- `update_69_full.sql` — SQL phase 2 (476 UPDATE)
