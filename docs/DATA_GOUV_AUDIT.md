# Audit data.gouv.fr — sources publiques exploitables pour RoullePro

Date : 3 mai 2026  
Méthode : interrogation API v1 datasets + API v2 dataservices sur 12 mots-clés cibles + 10 mots-clés complémentaires  
Statut : audit pur, aucun import effectué

## 1. Synthèse executive

Sur les 12 mots-clés demandés, 4 ne renvoient AUCUN dataset (« taxi conventionné », « ADS taxi », « agrément ARS », « convention CPAM », « déserts médicaux ») et 1 ne renvoie rien côté API datasets (« dialyse »). Cela confirme empiriquement ce que nous savions : il n'existe pas de fichier national centralisé pour les taxis conventionnés CPAM, les ADS taxi ou les agréments ARS sur data.gouv.fr.

Les sources réellement exploitables pour RoullePro se concentrent sur 3 référentiels nationaux :
- L'Annuaire Santé Ameli (CNAM) — déjà identifié, 153 Mo, ambulanciers + mixtes
- Le référentiel FINESS (ministère Solidarités Santé) — établissements sanitaires/sociaux, dont sociétés de transport sanitaire avec n° FINESS
- Le RPPS via Annuaire Santé ANS — professionnels de santé personnes physiques (1 Go quotidien)

Aucune source publique n'expose les emails. Pour l'enrichissement email, la seule voie reste Findymail (déjà connecté) ou collecte déclarative.

## 2. Résultats datasets par mot-clé

### 2.1 Mots-clés cœur métier RoullePro

#### transport sanitaire (1 résultat)

| Titre | Producteur | MAJ | Format | Taille | Évaluation |
|---|---|---|---|---|---|
| [Transports sanitaires terrestres GHT Lorraine Nord](https://www.data.gouv.fr/datasets/transports-sanitaires-terrestres-de-patients-du-groupement-hospitalier-de-territoire-lorraine-nord) | CHR Metz-Thionville | 2025-12-09 | DOC | 0,16 Mo | hors sujet — appel d'offres marché public, pas de référentiel |

#### ambulance (1 résultat)

| Titre | Producteur | MAJ | Format | Taille | Évaluation |
|---|---|---|---|---|---|
| [AMBULANCE TAXI MERLIN](https://www.data.gouv.fr/datasets/ambulance-taxi-merlin) | MA BORNE AUTO | 2024-12-06 | CSV | <0,01 Mo | hors sujet — fiche borne IRVE d'une seule entreprise (recharge véhicule) |

#### taxi conventionné, ADS taxi, agrément ARS, convention CPAM, dialyse, déserts médicaux

Aucun dataset retourné par l'API. Confirmation : ces données n'existent pas sous forme de fichier national publié sur data.gouv.fr. Pour les taxis conventionnés et ADS, gestion départementale (CPAM/préfecture) sans agrégation nationale ouverte.

#### accessibilité PMR (1 résultat)

| Titre | Producteur | MAJ | Format | Taille | Évaluation |
|---|---|---|---|---|---|
| [Accessibilité - Stationnement PMR](https://www.data.gouv.fr/datasets/accessibilite-stationnement-pmr) | Ville du Havre | 2025-12-27 | DXF, JSON, KMZ, SHP, WFS | non chiffrée | hors sujet pour fiche pro — données géographiques places de parking PMR Le Havre uniquement |

### 2.2 Référentiels santé exploitables

#### FINESS (5 résultats) + recherche complémentaire

| Titre | Producteur | MAJ | Format | Taille | Évaluation |
|---|---|---|---|---|---|
| [Référentiel Finess (t_finess)](https://www.data.gouv.fr/datasets/referentiel-finess-t-finess) | Atlasanté | 2026-03-16 | CSV, PDF, XLSX | 318,65 Mo | à explorer — référentiel complet structures sanitaires/sociales/médico-sociales |
| [FINESS Extraction du Fichier des établissements](https://www.data.gouv.fr/datasets/finess-extraction-du-fichier-des-etablissements-d-hospitalisation-publics-et-prives) | Ministère Solidarités Santé | bimonthly | CSV, PDF, ZIP | 266,56 Mo | intégrable directement — source officielle, contient les sociétés de transport sanitaire avec n° FINESS, géolocalisation, catégorie d'établissement |
| [Open FINESS](https://www.data.gouv.fr/datasets/open-finess) | InterHop | 2025-03-27 | CSV | 37,84 Mo | à explorer — version communautaire enrichie (horaires, données toobib) |
| [Finess: attributs](https://www.data.gouv.fr/datasets/finess-attributs) | InterHop | 2025-02-09 | CSV | 0,18 Mo | à explorer — table de correspondance codes AMF/AMM/disciplines pour décoder FINESS |

Le FINESS officiel ministère est la pépite manquée jusqu'ici. Catégorie d'établissement 700 = transport sanitaire. Cela donnerait un appariement par n° FINESS avec :
- raison sociale
- adresse complète géocodée
- date d'autorisation
- entité juridique (lien SIREN possible)

#### RPPS (5 résultats)

| Titre | Producteur | MAJ | Format | Taille | Évaluation |
|---|---|---|---|---|---|
| [Annuaire Santé RPPS - Extractions libre accès](https://www.data.gouv.fr/datasets/annuaire-sante-extractions-des-donnees-en-libre-acces-des-professionnels-intervenant-dans-le-systeme-de-sante-rpps) | Agence du Numérique en Santé | daily | TXT | 1074 Mo | hors sujet pour transport sanitaire — RPPS = personnes physiques (médecins, infirmiers, etc.), pas les sociétés de transport |
| [CNAM/RPPS : Professions](https://www.data.gouv.fr/datasets/cnam-rpps-professions) | InterHop | 2025-02-09 | CSV | 0,03 Mo | à explorer — table de correspondance codes profession Ameli ↔ RPPS |
| [CNAM : Alignement vers RPPS](https://www.data.gouv.fr/datasets/cnam-alignement-vers-rpps) | InterHop | 2025-03-01 | CSV, PDF | 119,29 Mo | à explorer — propose alignement Annuaire Ameli vers RPPS |
| [RPPS : Alignement vers BAN et RNB](https://www.data.gouv.fr/datasets/rpps-alignement-vers-ban-et-rnb) | InterHop | 2025-03-02 | CSV, PDF | 97,58 Mo | à explorer — géocodage adresses RPPS via Base Adresse Nationale |

#### EHPAD (5 résultats)

Tous EHPAD individuels ou listes locales (Paris, Agen, Grand Est). Hors sujet sauf si RoullePro veut un jour proposer un module « courses régulières dialyse/EHPAD », ce qui justifierait alors d'utiliser le FINESS national filtré sur catégorie EHPAD.

### 2.3 Référentiels d'appariement (recherche complémentaire)

| Titre | Producteur | MAJ | Format | Taille | Évaluation |
|---|---|---|---|---|---|
| [Base SIRENE des entreprises](https://www.data.gouv.fr/datasets/base-sirene-des-entreprises-et-de-leurs-etablissements-siren-siret-nic) | INSEE | monthly | CSV, parquet, PDF, ZIP | 10 502 Mo | intégrable directement — pivot SIREN/SIRET pour matcher Ameli ↔ RoullePro. Code APE 8690A = Ambulances |
| [Base Adresse Nationale (BAN)](https://www.data.gouv.fr/datasets/base-adresse-nationale-1) | IGN/DINUM | continuous | CSV, JSON | variable | à explorer — géocodage homogène des adresses (lat/lon, code INSEE) |
| [Code Officiel Géographique (COG)](https://www.data.gouv.fr/datasets/code-officiel-geographique-cog) | INSEE | annual | CSV | <10 Mo | intégrable directement — référentiel communes, codes INSEE, jonction départements/régions |
| [Annuaire Santé Soissons](https://www.data.gouv.fr/datasets/annuaire-sante-liste-localisation-et-tarifs-des-professionnels-de-sante) | Ville de Soissons | punctual | CSV, GeoJSON | 3,87 Mo | hors sujet — extrait local |

## 3. Résultats dataservices (API publiques)

#### transport sanitaire, ambulance, EHPAD, accessibilité PMR

Aucun dataservice pertinent sur ces mots-clés. Les résultats retournés (Hub'Eau qualité de l'eau, EDF Open Data) sont des faux positifs liés à du matching texte large.

#### FINESS (5 résultats — 2 utiles)

| Titre | Producteur | MAJ | URL doc | Restreint | Évaluation |
|---|---|---|---|---|---|
| [API FHIR Annuaire Santé](https://www.data.gouv.fr/fr/dataservices/api-fhir-annuaire-sante/) | Agence du Numérique en Santé | 2025-12-15 | non documentée publiquement | non | à explorer — API REST FHIR pour interroger l'Annuaire Santé en libre accès, alternative au CSV 1 Go |
| [Annuaire des pharmacies](https://www.data.gouv.fr/fr/dataservices/annuaire-des-pharmacies-et-rendez-vous-de-vaccination/) | Officine.tech | 2026-04-21 | [openapi.json](https://officine.tech/api/openapi.json) | non | hors sujet — pharmacies uniquement |

#### RPPS (3 résultats)

| Titre | Producteur | URL doc | Évaluation |
|---|---|---|---|
| [API Pro Santé Connect](https://www.data.gouv.fr/fr/dataservices/api-pro-sante-connect/) | ANS | [wallet.esw.esante.gouv.fr](https://wallet.esw.esante.gouv.fr/login-page) | hors sujet — bouton de connexion fédérée pour pros de santé personnes physiques (ne s'applique pas aux ambulanciers/sociétés transport) |
| [API Sesali](https://www.data.gouv.fr/fr/dataservices/api-sesali/) | ANS | non publique | hors sujet — synthèse médicale patients européens |

#### Légifrance (apparu sur « transport sanitaire » et « déserts médicaux »)

| Titre | Producteur | URL | Évaluation |
|---|---|---|---|
| [API Légifrance](https://www.data.gouv.fr/fr/dataservices/legifrance/) | DILA | [piste.gouv.fr](https://piste.gouv.fr/) | à explorer — accès aux textes EGalim, code de la santé publique, conventions CPAM. Inscription PISTE requise (gratuit). Pas pour enrichir les fiches pro mais utile pour le contenu juridique du site (page mentions, articles SEO sur la convention CPAM) |

## 4. Sources hors data.gouv mentionnées par Lucas

#### API Recherche Entreprises ([recherche-entreprises.api.gouv.fr](https://recherche-entreprises.api.gouv.fr))

- Gratuit, sans clé, public
- Données SIRENE + INPI (dirigeants, effectifs) + RNE
- Filtres possibles par code APE, géolocalisation
- Pas d'email, pas de téléphone
- Évaluation : intégrable directement pour pivot SIREN/SIRET et enrichissement légal (raison sociale officielle, dirigeants, effectifs, date de création)

#### API Entreprise ([entreprise.api.gouv.fr](https://entreprise.api.gouv.fr/developpeurs))

- Accès réservé administrations et délégataires de service public
- Kit de mise en production strict
- Données plus complètes (attestations fiscales, sociales, marchés publics)
- Pas d'email
- Évaluation : hors sujet pour RoullePro (pas habilité à demander cet accès en tant qu'annuaire privé)

## 5. Top 5 recommandations d'intégrations prioritaires

### Priorité 1 — FINESS Ministère Solidarités Santé
Pourquoi : seul référentiel officiel national qui liste les sociétés de transport sanitaire avec un identifiant pérenne (n° FINESS), une adresse géocodable et un lien vers l'entité juridique. Bimonthly = stable.  
Volume : 266 Mo CSV, ~150 000 établissements, dont catégorie 700 « Transport sanitaire ».  
Effort : moyen — import filtré sur catégorie 700 → table `etablissements_finess` avec FK vers `pros_sanitaire`.  
Bénéfice : permet un matching beaucoup plus robuste que Ameli (FINESS = identifiant pérenne, contrairement à raison sociale + ville). Géolocalisation officielle.  
Page : https://www.data.gouv.fr/datasets/finess-extraction-du-fichier-des-etablissements-d-hospitalisation-publics-et-prives

### Priorité 2 — API Recherche Entreprises (recherche-entreprises.api.gouv.fr)
Pourquoi : enrichissement légal en temps réel sans téléchargement, avec SIREN/SIRET officiel, code APE, dirigeants, effectifs, date de création. Permet de poser un badge « Société active » + afficher l'ancienneté.  
Volume : API live, pas de stockage.  
Effort : faible — endpoint REST simple, pas d'auth.  
Bénéfice : crédibilité fiches + filtre anti-fantômes (sociétés radiées). SEO long-tail (pages « Ambulances [ville] » avec sociétés vérifiées).  
Page : https://recherche-entreprises.api.gouv.fr

### Priorité 3 — Ameli Annuaire Santé (déjà en cours)
Pourquoi : seule source du badge « Conventionné CPAM » pour les ambulanciers et mixtes ambulance/taxi/VSL. Couverture estimée 25-30 % de la base RoullePro.  
Volume : 153 Mo CSV, weekly.  
Effort : déjà cadré (Phase B/C/D).  
Bénéfice : badge réglementaire crédible.  
Statut : audit fait, en attente validation Lucas pour Phase B.

### Priorité 4 — Code Officiel Géographique INSEE
Pourquoi : référentiel communes/codes INSEE/départements/régions pour homogénéiser le maillage SEO et le filtrage géographique. Vital si on veut générer des pages /transport-sanitaire/[departement]/[ville] propres.  
Volume : <10 Mo, annuel.  
Effort : faible — table de référence.  
Bénéfice : SEO local fiable, normalisation des entrées utilisateur.  
Page : https://www.data.gouv.fr/datasets/code-officiel-geographique-cog

### Priorité 5 — Base Adresse Nationale (BAN)
Pourquoi : géocodage homogène et certifié des adresses pros (lat/lon + code INSEE). Pré-requis pour proximité « ambulances près de moi ».  
Volume : variable, continuous.  
Effort : moyen — utilisable via API live (api-adresse.data.gouv.fr) sans télécharger le fichier complet.  
Bénéfice : géocoder les 26 049 fiches RoullePro en mode batch (gratuit, illimité raisonnable). Active la recherche par rayon.  
Page : https://www.data.gouv.fr/datasets/base-adresse-nationale-1 — API : https://adresse.data.gouv.fr/api-doc/adresse

## 6. Sources écartées

- RPPS Annuaire Santé ANS : 1 Go, mais référentiel de personnes physiques (médecins, infirmiers, etc.). Les ambulanciers personnes physiques y figurent rarement, et les sociétés de transport sanitaire en sont absentes par définition (RPPS ≠ FINESS).
- Pro Santé Connect : SSO médecins, sans rapport avec un annuaire transport.
- API Sesali : synthèse médicale patient, hors scope.
- API Légifrance : utile pour contenu juridique éditorial, pas pour enrichir les fiches pro.
- SIRENE INSEE complet : 10 Go. Trop lourd. Utiliser l'API Recherche Entreprises à la place.
- Datasets locaux EHPAD : redondants avec FINESS national.

## 7. Observations & risques

1. Le sujet « taxis conventionnés CPAM » reste irrésolu côté open data. Confirmé par double absence (data.gouv + forum officiel Ameli). Le workflow déclaratif sur RoullePro reste la seule option.
2. Aucune source publique n'expose les emails. L'enrichissement email passera obligatoirement par Findymail (connecté) ou par formulaire de réclamation.
3. Le FINESS pourrait permettre un appariement plus robuste qu'Ameli sur les sociétés (n° FINESS pérenne vs raison sociale + ville fragile). À évaluer en Phase B comme alternative ou complément à Ameli.
4. L'API Recherche Entreprises est la pépite cachée : gratuite, sans clé, et fournit le SIREN/SIRET des sociétés ambulancières. Cela débloquerait potentiellement un appariement croisé Ameli ↔ FINESS ↔ SIRENE ↔ RoullePro très fiable.

## 8. Estimation crédits / temps des intégrations possibles

| Priorité | Source | Effort dev | Crédits estimés | Bénéfice attendu |
|---|---|---|---|---|
| 1 | FINESS ministère | 2-3 sessions | moyen (parsing + import) | élevé (badge officiel + matching pérenne) |
| 2 | API Recherche Entreprises | 1 session | faible (API live) | élevé (vérif sociétés actives, SEO) |
| 3 | Ameli (en cours) | 2 sessions restantes | moyen | moyen (~25 % couverture) |
| 4 | COG INSEE | 0,5 session | faible | moyen (SEO local) |
| 5 | BAN (géocodage API) | 1-2 sessions | moyen (batch 26 k requêtes) | élevé (recherche proximité) |

## 9. Recommandation finale

Avant de poursuivre Phase B Ameli, je propose d'envisager un changement d'ordre :

**Hypothèse alternative** : commencer par la Priorité 2 (API Recherche Entreprises) qui est rapide, gratuite et apporte une valeur immédiate (vérif SIRET sur les 26 049 fiches), puis enchaîner sur Priorité 1 (FINESS) qui pourrait remplacer ou compléter Ameli avec un matching plus solide, et seulement ensuite faire Ameli (Priorité 3) sur la portion résiduelle.

À ton arbitrage. L'audit est livré, je n'engage rien sans ton feu vert.
