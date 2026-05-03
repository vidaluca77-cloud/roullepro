# Rapport de matching Ameli — dry-run (lecture seule)

Date : 3 mai 2026, 14h50 CEST  
Source : data.gouv.fr — annuaire-sante-ameli (snapshot 2026-04-27)  
Specialite_code : 55 (Transport sanitaire — Ambulance / VSL)  
Aucune écriture effectuée à ce stade. Validation requise avant B6.

## Volumétrie globale

| Métrique | Valeur |
|---|---|
| Lignes Ameli téléchargées (CSV brut) | 548 968 |
| Lignes filtrées specialite_code=55 | 5 076 |
| Sautées (téléphone ou adresse manquants) | 695 |
| Retenues qualité (4 critères) | 4 381 |
| Uniques après dédup | 4 378 |
| Fiches existantes pros_sanitaire (ambulance + taxi_conv + vsl) | 25 938 |

## Répartition matching

| Cas | Méthode | Volume | Action B6 prévue |
|---|---|---|---|
| 1 | téléphone E.164 + code postal | 137 staging → 137 pros (140 paires) | UPDATE des 134 sans collision · 3 ambigus → `ameli_match_review` |
| 2A high | nom (≥0.85) + code postal | 1 673 | UPDATE auto |
| 2B medium | nom (0.70-0.85) + code postal | 920 | À valider — soit UPDATE, soit `ameli_match_review` |
| 3 | aucun match | 1 648 | INSERT nouvelles fiches `source = 'ameli_cnam'` |
| Total | | 4 378 | — |

## Fiches protégées (claimed/verified) → JAMAIS touchées

- 1 fiche détectée en collision Cas 1 (skippée)
- 1 fiche détectée en collision Cas 2 (skippée)
- Les 4 fiches reclaimed connues (Taxi PETIT 73, TAXI YVES 68, TAXI MULOT 89, AMBULANCES CANTONALES 59) sont automatiquement exclues par le filtre `claimed_by IS NOT NULL OR claimed = true OR verified = true`

## Risques de collision (à arbitrer)

- Cas 1 : 3 staging matchent plusieurs pros sur même téléphone+CP (ex Collonges 01550 : MEDIC 01 et THIANA partagent +33450994794 → ambiguïté nom). **Reco : envoyer ces 3 paires en `ameli_match_review` au lieu d'UPDATE auto.**
- Cas 2 : 6 pros différents matchent plusieurs staging (cabinets multi-établissements). Reco identique.

## Échantillons Cas 1 — UPDATE prévu (12 sur 137)

| Ameli (CSV) | CP | Téléphone | Pros existant | Catégorie |
|---|---|---|---|---|
| MEDIC 01 AMBULANCES | 01550 | +33450994794 | MEDIC 01 AMBULANCES | ambulance |
| SARL NEUILLY AMBULANCE | 03340 | +33470438804 | NEUILLY AMBULANCE | ambulance |
| INTER AMBULANCES | 05000 | +33492536363 | INTER AMBULANCES | ambulance |
| AMBULANCES UNIVERS2 | 06000 | +33493831000 | UNIVERS AMBULANCES 2 | ambulance |
| SARL AMBULANCE MEDITERRANEE | 06110 | +33423196684 | AMBULANCE MEDITERRANEE | ambulance |
| ADONIS AMBULANCES SARL | 06150 | +33493934352 | ADONIS AMBULANCES | ambulance |
| MOOVEO ANTIBES AMBULANCE GOLFE FONTONNE | 06220 | +33493349151 | AMBULANCES GOLFE/FONTONNE | ambulance |
| SARL ACCES AMBULANCES | 06610 | +33493225952 | SARL ACCES AMBULANCES | ambulance |
| SARL AMBULANCES OLLIVIER ET FILS | 11230 | +33561689494 | AMBULANCES OLLIVIER ET FILS | ambulance |
| SAS AMBULANCES TOMASELLO | 11800 | +33468255573 | AMBULANCES TOMASELLO | ambulance |
| SARL AMBULANCE FALIPPOU SALDANA | 12110 | +33565630207 | AMBULANCE FALIPPOU SALDANA - A.F.S. | ambulance |
| SARL PRADAYROL-CARLES SERVICE | 12390 | +33565645200 | SARL PRADAYROL DIDIER | ambulance |

## Échantillons Cas 2A high (sim ≥ 0.85) — 15 sur 1 673

Tous à sim 1.000 (parfaits) :
- AMBULANCE COTRO 01300 → COTRO (AMBULANCE COTRO) Belley
- SOINS AMBULANCES 01140 → SOINS AMBULANCES Saint-Didier-Sur-Chalaronne
- AMBULANCES TAXIS JACQUES DANIEL 01310 → AMBULANCES TAXIS JACQUES DANIEL Polliat
- AMBULANCES TAXI DE BROU 01250 → AMBULANCES TAXI DE BROU Ceyzeriat
- AMBULANCES DE MONTLUEL 01120 → AMBULANCES DE MONTLUEL
- VITAL AMBULANCE 01120 → VITAL AMBULANCE
- PRO MED 01 01500 → PRO.MED 01
- AMBULANCES DE JASSANS 01600 → AMBULANCES DE JASSANS
- AMBULANCES ANGLESKY 01800 → AMBULANCES ANGLESKY
- SN AMBULANCES AMBARROISES 01640 → SN AMBULANCES AMBARROISES
- AMBULANCES MARLIE 01360 → AMBULANCES MARLIE
- EPIONE AMBULANCES 01550 → EPIONE AMBULANCES
- SAFE AMBULANCES 01700 → SAFE AMBULANCES
- AMD AMBULANCES 01600 → AMD AMBULANCES
- AMBULANCES DU LAC 01460 → AMBULANCES DU LAC

## Échantillons Cas 2B medium (sim 0.70-0.85) — 15 sur 920

| Ameli | CP | Pros candidat | sim |
|---|---|---|---|
| SARL AMBULANCES TAXIS VSL MARINE | 66420 | AMBULANCES TAXIS V.S.L MARINE | 0.703 |
| SARL AMBULANCES LA MEDITERRANNEE | 13011 | AMBULANCES LA MEDITERRANEENNE | 0.703 |
| ASSISTANCE MOBILE SANIT AMS AMBULANCE | 06600 | ASSISTANCE MOBILE SANITAIRE (AMS) | 0.703 |
| AMBULANCES DIOISES SARL GIRAUD | 26150 | SOCIETE GIRAUD - AMBULANCES DIOISES | 0.703 |
| EURL AMBULANCES LA MARINA | 13400 | AMBULANCE LA MARINA | 0.704 |
| AMBULANCES CHAMPAL CHRISTIAN | 29160 | AMBULANCES CHAMPAL | 0.704 |
| SARL AMBULANCES DU MIRAIL | 84120 | AMBULANCE DU MIRAIL | 0.704 |
| RADIO TAXI DEMADE SAS | 41200 | SARL RADIO TAXIS DEMADE | 0.704 |
| FLORENCE G AMBULANCE | 97433 | AMBULANCE ET TAXI FLORENCE.G | 0.704 |
| SARL AMBULFRANCE | 33600 | AMBULFRANCE | 0.706 |
| SARL DDL EXPRESS | 76340 | DDL EXPRESS (NESLE-NORMANDEUSE) | 0.706 |
| SARL AMBULANCES PONT DE L ARC | 13090 | AMBULANCES DU PONT DE L'ARC (PDL) | 0.706 |
| SARL AMB.CHARENTES POITOU | 16430 | SARL AMBULANCES CHARENTE-POITOU | 0.706 |
| AMBULANCES HERON-FATOUX | 59400 | AMBULANCES HERON | 0.708 |
| SARL SE AMBULANCES VOLPE | 04200 | AMBULANCES VOLPE | 0.708 |

Verdict : la quasi-totalité des matches medium sont corrects (variations SARL/SAS/EURL ou suffixes). Le seul potentiellement douteux est `DDL EXPRESS` 76340 où la ville Pros est NESLE-NORMANDEUSE alors qu'Ameli annonce FOUCARMONT (même CP partagé entre plusieurs communes).

## Échantillons Cas 3 — INSERT nouvelles fiches (15 sur 1 648)

| Raison sociale | CP | Ville | Téléphone | Adresse |
|---|---|---|---|---|
| BELLEGARDE AMBULANCES MULTIN HUMBERT | 01204 | VALSERHONE | +33450560256 | 738 RUE SANTOS DUMONT, ZA ETOURNELLES |
| ATB AMBULANCE | 01250 | CEYZERIAT | +33762822454 | 110 RUE PAUL BERLIET |
| AB TRANSPORTS | 01480 | FRANS | +33474081699 | ZONE D ACTIVITE DU PARDY |
| SAS TAXI AMBULANCE PETITE MONTAGNE | 01590 | LAVANCIA EPERCY | +33384480780 | ZI SOUS LA COMBE |
| SARL BONNET AMBULANCES ST JEAN | 02100 | SAINT QUENTIN | +33323626275 | 152 RUE DU CDT J YVES COUSTEAU |
| SAS 3A ROUSSEL FISMES | 02160 | MAIZY SUR AISNE | +33326091836 | 20 RUE DE LA VIEILLE EGLISE |
| AMB ASSISTANCE 24 GENNARO | 02200 | SOISSONS | +33323590505 | 21 BOULEVARD PAUL DOUMER |
| ALIZARD TAXI (AMBULANCES DUSSAUX) | 02300 | CHAUNY | +33323400175 | 10 RUE MARECHAL DE LATTRE |
| AMBULANCES 2000 CHAUNY | 02300 | CHAUNY | +33323521616 | 47 RUE DU BROUAGE |
| AMBULANCE LAVAL | 02360 | ROZOY SUR SERRE | +33323982440 | 213 RUE CHARLES DE GAULLE |
| GAUCHY AMBULANCES | 02430 | GAUCHY | +33323623220 | 13 RUE CASANOVA |
| AMBULANCES LAFEROISE | 02520 | FLAVY LE MARTEL | +33323562264 | 85B RUE ANDRE BRULE |
| SAS AMBULANCE TERNOISE | 02700 | TERGNIER | +33323570333 | 5B AVENUE DU GENERAL DE GAULLE |
| EURL AMB ST ERME | 02820 | ST ERME OUTRE ET RAMECOUR | +33323226200 | 1 RUE SAINT PAUL |
| SARL AMB GUIRADO | 03100 | MONTLUCON | +33470290445 | 19 AVENUE MICHEL DE L HOSPITAL |

## Stratégie B6 proposée

### UPDATE des fiches existantes
- Cas 1 (134 sans collision) : UPDATE `phone_e164` (si vide), `ameli_conventionne = true`, `ameli_last_seen = '2026-04-27'`
- Cas 1 ambigus (3) : insertion dans `ameli_match_review` au lieu d'UPDATE
- Cas 2A high sans collision (≈1 670) : UPDATE mêmes 3 colonnes
- Cas 2B medium : **deux options** à arbitrer
  - Option A (sûre) : tous en `ameli_match_review`, pas d'UPDATE auto (920 reviews manuels)
  - Option B (économe) : UPDATE auto, surveillance après coup (920 UPDATE)
  - **Reco : Option A** car les sim 0.70 peuvent inverser le sens (DDL EXPRESS notamment)

### INSERT des 1 648 nouvelles fiches Cas 3
- Catégorie : `ambulance` (specialite_code 55 = transport sanitaire pur)
- `source = 'ameli_cnam'`
- `actif = true`, `suspendu = false`, `verified = false`, `claimed = false`
- Slug à générer (existe déjà sur table, on calculera de la même façon que les imports précédents)
- Tous les champs requis présents : raison_sociale, code_postal, ville, ville_slug (à calculer), departement (à dériver du CP), region (à dériver), categorie

### Champs NON modifiés
- Toute fiche `claimed_by IS NOT NULL OR claimed = true OR verified = true` est skippée par défaut
- Email : Ameli n'en fournit pas
- SIRET : Ameli n'en fournit pas (uniquement la spécialité)

## Volumétrie d'écriture estimée (Option A)

- UPDATEs : 134 (Cas 1) + 1 670 (Cas 2A) = **1 804 UPDATE**
- Reviews manuels créés : 3 + 920 = **923 dans `ameli_match_review`**
- INSERTs : **1 648 nouvelles fiches**
- Total opérations : ~4 375 écritures

## Validation demandée

3 décisions :

1. **Option Cas 2B medium** : A (review manuel des 920) ou B (UPDATE auto) ?
2. **Catégorie INSERT Cas 3** : `ambulance` pour les 1 648 (puisque specialite_code=55 = transport sanitaire incluant ambulance et VSL) — OK ?
3. **Champ adresse Ameli** : on l'importe tel quel pour les nouvelles fiches (Cas 3) — OK ?

Aucune écriture tant que validation pas reçue.
