/**
 * Données du dossier éditorial « SEFi & géolocalisation 2027 ».
 *
 * RÈGLE ABSOLUE : aucune donnée inventée. Chaque fait, prix ou statut provient du
 * dossier de recherche sourcé (recherche du 18 juillet 2026) et est accompagné de
 * son URL source officielle ou tierce. Les informations « n.a. » (non trouvées sur
 * une source fiable) sont exposées via la constante NON_COMMUNIQUE et affichées
 * « non communiqué » côté pages.
 *
 * Les pages du dossier ne contiennent aucune donnée en dur : tout est importé d'ici.
 */

export const DATE_VERIFICATION = "18 juillet 2026";

/** Valeur affichée pour toute information non communiquée / non trouvée (« n.a. »). */
export const NON_COMMUNIQUE = "non communiqué";

export type Source = { nom: string; url: string };

/**
 * Registre central des sources officielles et tierces citées dans le dossier.
 * Réutilisé par les faits réglementaires, le calendrier et les sections « Sources ».
 */
export const SOURCES = {
  loi2026534: {
    nom: "Loi n° 2026-534 du 25 juin 2026 (lutte contre les fraudes sociales et fiscales, PDF)",
    url: "https://www.afg.asso.fr/app/uploads/2026/06/Loi-2026-534-du-25-juin-2026-lutte-contre-les-fraudes-sociales-et-fiscales.pdf",
  },
  senat12nov2025: {
    nom: "Sénat, séance du 12 novembre 2025",
    url: "https://www.senat.fr/seances/s202511/s20251112/s20251112022.html",
  },
  etudeImpact: {
    nom: "Étude d'impact du Sénat (PJL fraudes, article 7)",
    url: "https://www.senat.fr/leg/etudes-impact/pjl25-024-ei/pjl25-024-ei.html",
  },
  servicePublic: {
    nom: "Service-public / Entreprendre (30 juin 2026)",
    url: "https://entreprendre.service-public.gouv.fr/actualites/A18978",
  },
  lofficiel: {
    nom: "L'Officiel des Métiers (28 juin 2026)",
    url: "https://www.lofficieldesmetiers.fr/taxis-ambulances-6-mois-pour-passer-au-sefi/",
  },
  conventionCadre: {
    nom: "JO n° 116 du 18 mai 2025, convention-cadre nationale des taxis (PDF)",
    url: "https://www.unsa.org/IMG/pdf/jo180525conv_taxis_securite_sociale.pdf",
  },
  senat31mars2026: {
    nom: "Sénat, séance du 31 mars 2026",
    url: "https://www.senat.fr/seances/s202603/s20260331/s20260331005.html",
  },
  cndaActu: {
    nom: "CNDA, actualités éditeurs",
    url: "https://cnda.ameli.fr/editeurs/actu-cnda/",
  },
  sesamSefi: {
    nom: "GIE SESAM-Vitale, page SEFi",
    url: "https://www.sesam-vitale.fr/en/sefi",
  },
  cnda2019: {
    nom: "CNDA, 17 juin 2019 — l'offre SEFi étendue aux taxis conventionnés",
    url: "https://cnda.ameli.fr/editeurs/17-juin-2019-loffre-sefi-etendue-aux-taxis-conventionnes/",
  },
  cndaTest: {
    nom: "CNDA, convention d'ouverture d'environnement de tests SEFi Taxi (PDF)",
    url: "https://cnda.ameli.fr/wp-content/files/Conditions_Ouverture_env._Test_dapprentissage_SEFi_Taxi_1.0.pdf",
  },
  cndaLogiciels: {
    nom: "CNDA, liste des logiciels certifiés",
    url: "https://cnda.ameli.fr/logiciels-certifies/",
  },
  bressuire: {
    nom: "Bressuire Informatique — Mélusine SEFi Taxi (PDF)",
    url: "https://www.bressuire-informatique.fr/Melusine_SEFi_Taxi.pdf",
  },
  cpamGironde: {
    nom: "CPAM Gironde — mémo SEFi transporteurs",
    url: "https://www.cpam-bordeaux.fr/newsletter/2016/nsl1216trans.html",
  },
  fnap: {
    nom: "FNAP — convention-cadre & expérimentation géolocalisation",
    url: "https://federationnationaleambulanciersprives.fr/index.php/actualites/a-la-une/assurance-maladie/1424-taxis-publication-dune-nouvelle-convention-cadre-nationale-prevoyant-dexperimenter-la-geolocalisation",
  },
  companeo: {
    nom: "Companeo — prix géolocalisation de véhicules 2026",
    url: "https://www.companeo.com/geolocalisation-de-vehicules/guide/systemes-de-geolocalisation-de-vehicule-:-quel-prix",
  },
  traceurEntreprise: {
    nom: "Traceur Entreprise — prix géolocalisation véhicule",
    url: "https://www.traceur-entreprise.fr/article-geolocalisation-vehicule-entreprise-prix",
  },
  trackeo: {
    nom: "Trackeo — prix géolocalisation de flotte",
    url: "https://www.trackeo.fr/blogs/guides-conseils/prix-geolocalisation-flotte-cout-traceur-gps-vehicule",
  },
  scrPtv: {
    nom: "Communiqué SCR Informatiques / PTV Logistics",
    url: "https://www.faq-logistique.com/CP20250923-PTV-Logistics-SCR-Transport-Sanitaire-Developer.htm",
  },
  cofidoc: {
    nom: "Cofidoc — facturation taxi conventionné",
    url: "https://www.cofidoc.fr/taxis/",
  },
  comptaTaxis: {
    nom: "Comptabilité Taxis — service CPAM",
    url: "https://comptabilitetaxis.fr/comptabilite-taxis/cpam-taxi/",
  },
  calculTaxi: {
    nom: "Calcul Taxi Conventionné",
    url: "https://calcul-taxi-conventionne.fr/",
  },
  qonto: {
    nom: "Qonto — logiciel de facturation taxi",
    url: "https://qonto.com/fr/blog/gestion-entreprise/facturation/logiciel-facturation-taxi",
  },
} as const satisfies Record<string, Source>;

/* ------------------------------------------------------------------ */
/* 1. Faits réglementaires clés                                        */
/* ------------------------------------------------------------------ */

export type FaitReglementaire = {
  id: string;
  titre: string;
  contenu: string;
  source: Source;
};

/** Citation exacte de l'article L. 322-5-3 CSS rétabli par l'article 27. */
export const CITATION_ARTICLE_L322_5_3 =
  "Les entreprises de transport sanitaire et les entreprises de taxi ayant conclu une convention avec un organisme local d'assurance maladie équipent l'ensemble de leurs véhicules d'un dispositif de géolocalisation certifié par l'assurance maladie, dont les conditions d'utilisation sont précisées par décret en Conseil d'État, et d'un système électronique de facturation intégré.";

export const CITATION_ENTREE_VIGUEUR =
  "à une date fixée par décret, et au plus tard le 1er janvier 2027";

export const FAITS_REGLEMENTAIRES: FaitReglementaire[] = [
  {
    id: "fondement",
    titre: "Fondement légal",
    contenu:
      "L'obligation résulte de l'article 27 de la loi n° 2026-534 du 25 juin 2026 relative à la lutte contre les fraudes sociales et fiscales, qui rétablit l'article L. 322-5-3 du code de la sécurité sociale. La rédaction est identique à celle adoptée par le Sénat en séance du 12 novembre 2025.",
    source: SOURCES.loi2026534,
  },
  {
    id: "concernes",
    titre: "Qui est concerné",
    contenu:
      "Les entreprises de transport sanitaire (ambulances, VSL) et les entreprises de taxi ayant conclu une convention avec un organisme local d'assurance maladie (taxis conventionnés CPAM). La mesure est applicable en métropole et en Guadeloupe, Guyane, Martinique, La Réunion, Mayotte, Saint-Barthélemy, Saint-Martin et Saint-Pierre-et-Miquelon ; elle n'est pas applicable en Polynésie française, Nouvelle-Calédonie, Wallis-et-Futuna et dans les TAAF.",
    source: SOURCES.etudeImpact,
  },
  {
    id: "contenu-obligation",
    titre: "Contenu de l'obligation",
    contenu:
      "Deux équipements obligatoires sur l'ensemble des véhicules : (1) un dispositif de géolocalisation certifié par l'assurance maladie et (2) un système électronique de facturation intégré (SEFi). Le SEFi consiste en un service en ligne intégré au logiciel métier permettant d'élaborer une facture normée à partir d'une prescription de transport et des données détenues par l'Assurance maladie, ainsi qu'un service de numérisation des pièces justificatives.",
    source: SOURCES.etudeImpact,
  },
  {
    id: "sanctions",
    titre: "Sanctions prévues",
    contenu:
      "L'article 27 lui-même ne fixe aucune sanction chiffrée. L'étude d'impact indique seulement que la mesure « permettrait d'assortir l'obligation de sanctions en cas de manquement », sans les détailler. En parallèle, la convention-cadre taxis prévoit qu'à défaut d'équipement certifié au 1er janvier 2027, l'entreprise ne conserve pas son conventionnement, et qu'à compter du 31 mai 2026 la facturation avec un logiciel non certifié CNDA peut entraîner une suspension du conventionnement.",
    source: SOURCES.conventionCadre,
  },
  {
    id: "decret",
    titre: "État du décret d'application",
    contenu:
      "L'article 27 renvoie à deux textes : un décret en Conseil d'État fixant les conditions d'utilisation du dispositif de géolocalisation, et un décret simple fixant la date d'entrée en vigueur. Au 30 juin 2026, la fiche officielle du service public indique que « des textes sont en attente ». Aucun décret en Conseil d'État spécifique à l'article 27 n'a pu être trouvé comme publié à la date du 18 juillet 2026.",
    source: SOURCES.servicePublic,
  },
];

/* ------------------------------------------------------------------ */
/* 2. Calendrier en 3 étapes                                           */
/* ------------------------------------------------------------------ */

export type EtapeCalendrier = {
  date: string;
  dateIso: string;
  titre: string;
  description: string;
  source: Source;
};

export const CALENDRIER: EtapeCalendrier[] = [
  {
    date: "1er novembre 2025",
    dateIso: "2025-11-01",
    titre: "Entrée en vigueur de la convention-cadre taxis",
    description:
      "Entrée en vigueur de la nouvelle convention-cadre nationale et de la tarification des taxis conventionnés.",
    source: SOURCES.senat31mars2026,
  },
  {
    date: "31 mai 2026",
    dateIso: "2026-05-31",
    titre: "Bascule vers un logiciel certifié CNDA",
    description:
      "Bascule obligatoire vers une facturation en norme B2 réalisée avec un logiciel certifié CNDA, sous peine de suspension du conventionnement.",
    source: SOURCES.conventionCadre,
  },
  {
    date: "1er janvier 2027 (au plus tard)",
    dateIso: "2027-01-01",
    titre: "SEFi + géolocalisation certifiée obligatoires",
    description:
      "Système électronique de facturation intégré (SEFi) et dispositif de géolocalisation certifié par l'Assurance maladie obligatoires sur l'ensemble des véhicules.",
    source: SOURCES.loi2026534,
  },
];

/* ------------------------------------------------------------------ */
/* 3. Tableau des solutions                                            */
/* ------------------------------------------------------------------ */

/**
 * Statut de certification / référencement CNDA au 18 juillet 2026 :
 * - "certifie" : présent dans la liste officielle du CNDA (catégorie Taxi
 *   conventionné et/ou Transports sanitaires), sur la base SESAM-Vitale / B2 /
 *   PEC+ / SCOR — sans préjuger d'une future autorisation « SEFi Taxis ».
 * - "revendique" : certification CNDA revendiquée par l'éditeur, non confirmée
 *   sur la liste officielle à ce stade.
 * - "en_attente" : référencement CNDA / SEFi non affiché ou en cours d'obtention.
 */
export type StatutCnda = "certifie" | "revendique" | "en_attente";

export const STATUT_LABEL: Record<StatutCnda, string> = {
  certifie: "Certifié CNDA",
  revendique: "Certification revendiquée",
  en_attente: "Référencement en attente",
};

export type Solution = {
  nom: string;
  editeur: string;
  statutCnda: StatutCnda;
  /** Précision exacte reprise du dossier de recherche. */
  statutDetail: string;
  fonctions: string;
  /** Prix public ou NON_COMMUNIQUE. */
  prix: string;
  cible: string;
  siteUrl: string | null;
  sources: Source[];
};

/**
 * Ordre : solutions certifiées CNDA d'abord, puis certifications revendiquées et
 * référencements en attente. Aucun classement qualitatif (« meilleur »).
 */
export const SOLUTIONS: Solution[] = [
  {
    nom: "ISIS / Lomaco Online",
    editeur: "LOMACO (Figeac, 46)",
    statutCnda: "certifie",
    statutDetail:
      "Certifié CNDA catégories Taxi conventionné & Transports sanitaires (versions ISIS 15.x et Lomaco Online 4.x). Date de certification " +
      NON_COMMUNIQUE +
      ".",
    fonctions:
      "Facturation CPAM, télétransmission et retours NOEMIE, PEC+, SCOR, SEFi (en option selon éligibilité, Android), planning/régulation, application mobile, Chorus Pro.",
    prix:
      "Offre à l'usage : forfait mise en place 100 € HT + 0,20 à 1,50 € HT/facture (dégressif) ; offre forfait illimité (tarif " +
      NON_COMMUNIQUE +
      ").",
    cible: "Taxi conventionné, VSL, ambulance",
    siteUrl: "https://lomaco.fr/transport-sanitaire/taxi-conventionne/",
    sources: [
      SOURCES.cndaLogiciels,
      { nom: "Lomaco — taxi conventionné", url: "https://lomaco.fr/transport-sanitaire/taxi-conventionne/" },
    ],
  },
  {
    nom: "Mélusine / Mélusine Taxi / Mélusine Taxi Live",
    editeur: "BRESSUIRE INFORMATIQUE",
    statutCnda: "certifie",
    statutDetail:
      "Certifié CNDA catégories Taxi conventionné & Transports sanitaires ; autorisation SEFi service v3.31 le 11/02/2022 (phase de pré-série / expérimentation).",
    fonctions:
      "Facturation & télétransmission, PEC+, SEFi (dématérialisation des pièces + référentiels AMO), carte CDE/CPE.",
    prix: NON_COMMUNIQUE,
    cible: "Ambulanciers, taxis conventionnés",
    siteUrl: "https://www.bressuire-informatique.fr/logiciel/melusine/",
    sources: [SOURCES.cndaLogiciels, SOURCES.bressuire],
  },
  {
    nom: "INTELLIO TAXI",
    editeur: "ORISHA HEALTHCARE FRANCE",
    statutCnda: "certifie",
    statutDetail:
      "Certifié CNDA catégorie Taxi conventionné (versions 1.2 / 1.3, terminal TELIUM).",
    fonctions:
      "Terminal portable EFT930G, facturation sans réseau, télétransmission (avec réseau), paiement CB (FR/international/Amex), jusqu'à 5 comptes ; géolocalisation/SEFi non mentionnés sur la page produit.",
    prix: NON_COMMUNIQUE,
    cible: "Artisans taxis conventionnés",
    siteUrl: "https://www.intellio.fr/",
    sources: [
      SOURCES.cndaLogiciels,
      { nom: "Intellio Taxi", url: "https://www.intellio.fr/index.php?MenuItemId=40&option=com_content&view=article&id=12&Itemid=113" },
    ],
  },
  {
    nom: "DRIVESOFT",
    editeur: "DRIVESOFT",
    statutCnda: "certifie",
    statutDetail:
      "Certifié CNDA catégorie Transports sanitaires (Android/iOS/Windows/Mac) ; conforme Ameli & CNDA.",
    fonctions:
      "Régulation/dispatch, facturation Ameli B2 convention taxi, PEC+, télétransmission, relances automatiques, géolocalisation / suivi de flotte en temps réel, application mobile chauffeur (mode hors-ligne), Copilot IA, HDS ; SEFi non mentionné.",
    prix: "À partir de 60 € HT / véhicule / mois",
    cible: "Ambulances, VSL, taxis conventionnés",
    siteUrl: "https://www.drivesoft.fr/",
    sources: [SOURCES.cndaLogiciels, { nom: "Drivesoft", url: "https://www.drivesoft.fr/" }],
  },
  {
    nom: "SORAYA TAXI FULLweb",
    editeur: "SORAYA SARL",
    statutCnda: "certifie",
    statutDetail:
      "Certifié CNDA catégorie Taxi conventionné (Soraya Taxi Full Web 2.78 Windows) ; lecteur SMARTVITALE homologué GIE SESAM-Vitale depuis 2014.",
    fonctions:
      "Facturation médicale & libre, télétransmission, répertoire patients, agenda, cloud documents, application mobile (Soraya Taxi AndGo), lecteur Vitale SMARTVITALE ; SEFi non mentionné sur la page.",
    prix:
      "47 € HT/mois (SOFT) ; 49 € HT/mois (avec lecteur) ; 19 € HT dès la 2ᵉ société ; service Easy Taxi : 0 % du CA ; 3 mois offerts aux nouveaux conventionnés.",
    cible: "Taxi conventionné (indépendant, société, centre de facturation)",
    siteUrl: "https://soraya.fr/",
    sources: [SOURCES.cndaLogiciels, { nom: "Soraya — nos solutions", url: "https://soraya.fr/nos-solutions/" }],
  },
  {
    nom: "TASS / TELETAXI / MOBIPEC / TELEAMBU",
    editeur: "TELETAXI (Droz Édition)",
    statutCnda: "certifie",
    statutDetail:
      "Certifié CNDA catégories Taxi conventionné & Transports sanitaires ; homologué SESAM-Vitale, agrément CNDA.",
    fonctions:
      "Facturation & télétransmission CPAM, PEC+ ; versions Windows/Web/Android.",
    prix:
      "Revendeur ChronosTaxis : abonnement forfaitaire incluant la licence Télétaxi (tarif " +
      NON_COMMUNIQUE +
      ").",
    cible: "Taxis conventionnés, transporteurs sanitaires",
    siteUrl: "http://www.teletaxi.fr",
    sources: [
      SOURCES.cndaLogiciels,
      { nom: "ChronosTaxis", url: "https://www.chronos-solutions.fr/prestations.php" },
    ],
  },
  {
    nom: "ORDITAXI",
    editeur: "NBR INFORMATIQUE",
    statutCnda: "certifie",
    statutDetail: "Certifié CNDA catégorie Taxi conventionné (Orditaxi 1.20, Android).",
    fonctions: "Facturation / télétransmission taxi conventionné (application Android).",
    prix: NON_COMMUNIQUE,
    cible: "Taxi conventionné",
    siteUrl: null,
    sources: [SOURCES.cndaLogiciels],
  },
  {
    nom: "TAXILOG / TAXILOG NOMADE",
    editeur: "BUTZ-BARON INFORMATIQUE",
    statutCnda: "certifie",
    statutDetail:
      "Certifié CNDA catégorie Taxi conventionné (Taxilog 11 Windows ; Taxilog Nomade 1.0).",
    fonctions: "Facturation / télétransmission taxi conventionné.",
    prix: NON_COMMUNIQUE,
    cible: "Taxi conventionné",
    siteUrl: null,
    sources: [SOURCES.cndaLogiciels],
  },
  {
    nom: "BECOSE",
    editeur: "TAXI STRASBOURG",
    statutCnda: "certifie",
    statutDetail:
      "Certifié CNDA catégorie Taxi conventionné (Becose 1.0.9 ; Android/iOS/Mac/Windows).",
    fonctions: "Facturation / télétransmission multi-plateforme.",
    prix: NON_COMMUNIQUE,
    cible: "Taxi conventionné",
    siteUrl: null,
    sources: [SOURCES.cndaLogiciels],
  },
  {
    nom: "APECTAXI / VIT@PRINT",
    editeur: "SAFICARD",
    statutCnda: "certifie",
    statutDetail:
      "Certifié CNDA catégories Taxi conventionné & Transporteurs (Apectaxi 1.0 TELIUM ; Vit@print 1.1 Windows).",
    fonctions: "Facturation / télétransmission ; terminal.",
    prix: NON_COMMUNIQUE,
    cible: "Taxi conventionné, transporteurs",
    siteUrl: null,
    sources: [SOURCES.cndaLogiciels],
  },
  {
    nom: "MK TAXI WEB / MKAMBULANCE",
    editeur: "MK2I",
    statutCnda: "certifie",
    statutDetail:
      "Certifié CNDA catégories Taxi conventionné & Transports sanitaires.",
    fonctions:
      "Facturation / télétransmission taxi (MK Taxi Web) et ambulance (MKAmbulance).",
    prix: NON_COMMUNIQUE,
    cible: "Taxi conventionné, ambulance",
    siteUrl: null,
    sources: [SOURCES.cndaLogiciels],
  },
  {
    nom: "TAXIHANDGO / TAXIHANDGO-VITALE",
    editeur: "LECERF SÉBASTIEN",
    statutCnda: "certifie",
    statutDetail:
      "Certifié CNDA catégories Taxi conventionné & Transporteurs (iOS / Linux).",
    fonctions:
      "Facturation standard & conventionnée, devis/factures, télétransmission (formule premium).",
    prix: NON_COMMUNIQUE,
    cible: "Taxi conventionné, ambulances",
    siteUrl: "https://www.taxihandgo.com",
    sources: [SOURCES.cndaLogiciels],
  },
  {
    nom: "TAEOL",
    editeur: "ETIB",
    statutCnda: "revendique",
    statutDetail:
      "Certification CNDA revendiquée par l'éditeur et des tiers ; agrément SEFi revendiqué — non confirmé sur la liste CNDA à ce stade.",
    fonctions:
      "Facturation & gestion de transports sanitaires, télétransmission B2, versions web & mobile.",
    prix:
      "Via ETIB : licence hébergée 90 € HT (une fois) + 19 € HT/mois (revendeur Facturation Taxi 67).",
    cible: "Artisans taxis conventionnés, GIE de taxis",
    siteUrl: "https://www.etib.fr/",
    sources: [
      { nom: "ETIB — TAEOL", url: "https://www.etib.fr/FR/Solution/1/Logiciel-Taxi-Teletransmission-Facturation.awp" },
    ],
  },
  {
    nom: "Ondy",
    editeur: "ONDY",
    statutCnda: "revendique",
    statutDetail:
      "Certification CNDA revendiquée par l'éditeur ; conforme à la convention du 1er novembre 2025 ; SESAM-Vitale (format B2).",
    fonctions:
      "Facturation CPAM B2 automatique, télétransmission SESAM-Vitale, planning, multi-chauffeurs, application mobile iOS/Android, export comptable ; SEFi & géolocalisation non mentionnés.",
    prix:
      "Artisan : 30 €/mois ; Société : 50 €/mois par véhicule ; essai 7 jours.",
    cible: "Taxi conventionné, transports sanitaires",
    siteUrl: "https://ondy.fr/logiciel-facturation-taxi/",
    sources: [{ nom: "Ondy", url: "https://ondy.fr/logiciel-facturation-taxi/" }],
  },
  {
    nom: "GESTAV TXS",
    editeur: "GESTAV",
    statutCnda: "en_attente",
    statutDetail:
      "Référencement CNDA / SEFi " +
      NON_COMMUNIQUE +
      " ; présenté comme « solution agréée CPAM », certifié ISO 27001 & HDS ; certification CNDA non affichée.",
    fonctions:
      "Facturation CPAM (TAP), télétransmission B2 (NOEMIE), PEC+, tarifs préfectoraux & convention 2025, application mobile Android/iOS, signature sur mobile, HDS ; SEFi & géolocalisation non mentionnés.",
    prix:
      "Lite : 369 € HT/an ; Plus : 429 € HT/an ; option PA réception +49 €/an ; e-reporting +2,90 €/mois.",
    cible: "Artisans taxis conventionnés CPAM",
    siteUrl: "https://gestav.com/logiciel-taxi-conventionne",
    sources: [{ nom: "Gestav TXS", url: "https://gestav.com/logiciel-taxi-conventionne" }],
  },
  {
    nom: "AkosOne",
    editeur: "AKOSONE (La Garde, 83)",
    statutCnda: "en_attente",
    statutDetail:
      "Référencement CNDA / SEFi " +
      NON_COMMUNIQUE +
      " ; module SCOR « prochainement disponible » ; RGPD & HDS.",
    fonctions:
      "Facturation taxi conventionné CPAM, télétransmission, PEC+, lecture carte Vitale + signature sur mobile/tablette, multi-chauffeurs, statistiques ; géolocalisation & SEFi non mentionnés.",
    prix: "À partir de 27 € HT/mois (cité par Qonto) ; essai gratuit 15 jours.",
    cible: "Taxi conventionné (+ clients ambulance cités)",
    siteUrl: "https://www.akosone.fr/",
    sources: [{ nom: "AkosOne", url: "https://www.akosone.fr/" }, SOURCES.qonto],
  },
  {
    nom: "Caree",
    editeur: "CAREE",
    statutCnda: "en_attente",
    statutDetail:
      "Référencement CNDA / SEFi " + NON_COMMUNIQUE + " (non affiché) ; agrément CPAM évoqué.",
    fonctions:
      "Facturation, télétransmission CPAM, dispatch de courses, planning partagé, application mobile (smartphone/tablette/PC).",
    prix:
      "Essai gratuit ; offres « Essentiel » et « Équipe » (tarif " + NON_COMMUNIQUE + ").",
    cible: "Taxi conventionné (indépendants, sociétés, groupements)",
    siteUrl: "https://www.caree.fr/",
    sources: [{ nom: "Caree", url: "https://www.caree.fr/" }],
  },
  {
    nom: "AROBASWEB (Classic / Pro)",
    editeur: "AROBAS LOGICIELS",
    statutCnda: "en_attente",
    statutDetail:
      "Agréé PEC+ ; SEFi, SCOR et géolocalisation « en cours d'obtention » ; certification CNDA non affichée.",
    fonctions:
      "Facturation CPAM, télétransmission B2, PEC+, (SEFi/SCOR/géolocalisation en cours d'obtention).",
    prix: NON_COMMUNIQUE,
    cible: "Taxi conventionné CPAM, VSL, ambulance, centres de facturation",
    siteUrl: "https://arobas.pro/",
    sources: [{ nom: "Arobas Logiciels", url: "https://arobas.pro/" }],
  },
  {
    nom: "Appsolu (offre conventionné 2026)",
    editeur: "APPSOLU",
    statutCnda: "en_attente",
    statutDetail: "Référencement CNDA / SEFi " + NON_COMMUNIQUE + " (non affiché).",
    fonctions:
      "Facturation « offre médicale » convention 2025, géolocalisation (option), gestion des appels, intégrations donneurs d'ordres, application passager TaxiClub.",
    prix: "17 €/mois (offre promotionnelle, −43 %).",
    cible: "Taxis conventionnés",
    siteUrl: "https://www.appsolu.fr/conventionne-2026/",
    sources: [{ nom: "Appsolu", url: "https://www.appsolu.fr/conventionne-2026/" }],
  },
  {
    nom: "SCR'AMBGES / SCR'Urgences",
    editeur: "SCR INFORMATIQUES (Erbray, 44)",
    statutCnda: "en_attente",
    statutDetail:
      "Référencement CNDA / SEFi " +
      NON_COMMUNIQUE +
      " ; « trajets certifiés / facturation certifiée aux km » via API PTV.",
    fonctions:
      "ERP transport sanitaire : régulation, planning, géolocalisation (API PTV : géocodage, itinéraires, cartographie), transport partagé, facturation certifiée aux km réels.",
    prix: NON_COMMUNIQUE,
    cible: "Compagnies d'ambulance, VSL, taxis (~5000 véhicules)",
    siteUrl: "https://www.scr-informatique.com",
    sources: [SOURCES.scrPtv],
  },
];

/* ------------------------------------------------------------------ */
/* Solutions périphériques (hors comparatif principal)                */
/* ------------------------------------------------------------------ */

export type SolutionPeripherique = {
  nom: string;
  description: string;
  prix: string;
  source: Source;
};

export const SOLUTIONS_PERIPHERIQUES: SolutionPeripherique[] = [
  {
    nom: "Cofidoc",
    description: "Service de facturation taxi conventionné externalisé (gestionnaire dédié).",
    prix: "À partir de 36 €/mois",
    source: SOURCES.cofidoc,
  },
  {
    nom: "Comptabilité Taxis",
    description: "Service externalisé : ouverture + licence mensuelle + tarif dégressif par course.",
    prix: "Ouverture 50 € HT + 25 € HT/mois de licence",
    source: SOURCES.comptaTaxis,
  },
  {
    nom: "Calcul Taxi Conventionné",
    description:
      "Simulateur / gestion de courses CPAM — outil de calcul, pas un logiciel de télétransmission certifié.",
    prix: "14,99 € HT/mois (offre Solo)",
    source: SOURCES.calculTaxi,
  },
  {
    nom: "Qonto",
    description:
      "Facturation électronique généraliste gratuite (non certifiée pour la télétransmission CPAM).",
    prix: "Gratuit",
    source: SOURCES.qonto,
  },
];

/* ------------------------------------------------------------------ */
/* 3. Repères de coûts géolocalisation                                */
/* ------------------------------------------------------------------ */

export type RepereCout = {
  categorie: string;
  detail: string;
  source: Source;
};

export const REPERES_COUTS_GEOLOC: RepereCout[] = [
  {
    categorie: "Abonnement (service de géolocalisation)",
    detail:
      "Entrée de gamme 12–19 € HT/mois ; standard B2B 20–45 € HT/mois ; premium métier jusqu'à 150 € HT/mois.",
    source: SOURCES.companeo,
  },
  {
    categorie: "Matériel (boîtier)",
    detail: "250–450 € HT l'unité + abonnement de service d'environ 10–15 €/mois.",
    source: SOURCES.companeo,
  },
  {
    categorie: "Alternative économique",
    detail:
      "Traceurs à partir d'environ 9 € HT/mois ; boîtiers OBD 79,99 € + carte SIM d'environ 50 €/an.",
    source: SOURCES.traceurEntreprise,
  },
  {
    categorie: "Logiciel SEFi / facturation métier (rappel)",
    detail:
      "Abonnements observés d'environ 17 à 60 € HT/mois/véhicule (Appsolu 17 € ; Ondy 30–50 € ; Soraya 47–49 € ; Drivesoft à partir de 60 €), ou forfait annuel Gestav 369–429 € HT/an.",
    source: SOURCES.companeo,
  },
];

/**
 * Aide à l'équipement prévue par la convention-cadre taxis : le principe d'une
 * aide/forfait pour l'acquisition d'outils de géolocalisation est prévu, mais son
 * montant précis n'est pas chiffré dans les textes consultés.
 */
export const AIDE_EQUIPEMENT = {
  principe:
    "La convention-cadre nationale des taxis prévoit une aide / un forfait à l'équipement pour l'acquisition d'outils de géolocalisation.",
  montant: NON_COMMUNIQUE,
  source: SOURCES.conventionCadre,
} as const;

/* ------------------------------------------------------------------ */
/* Solutions de géolocalisation identifiées                            */
/* ------------------------------------------------------------------ */

export type SolutionGeoloc = {
  nom: string;
  description: string;
  source: Source;
};

export const SOLUTIONS_GEOLOC: SolutionGeoloc[] = [
  {
    nom: "Le.Taxi (registre national des taxis)",
    description:
      "Outil dont l'intégration à l'expérimentation géolocalisation + facturation a été proposée dès décembre 2025 par la Cnam.",
    source: SOURCES.fnap,
  },
  {
    nom: "Drivesoft",
    description:
      "Géolocalisation / suivi de flotte en temps réel intégré, présenté comme conforme à la réglementation du transport sanitaire.",
    source: { nom: "Drivesoft", url: "https://www.drivesoft.fr/" },
  },
  {
    nom: "SCR Informatiques (SCR'AMBGES)",
    description:
      "Géolocalisation via l'API PTV Logistics, itinéraire réellement emprunté et facturation certifiée aux kilomètres réels.",
    source: SOURCES.scrPtv,
  },
  {
    nom: "Appsolu",
    description: "Géolocalisation proposée en option de l'offre conventionné.",
    source: { nom: "Appsolu", url: "https://www.appsolu.fr/conventionne-2026/" },
  },
  {
    nom: "Arobas Logiciels",
    description: "Agrément géolocalisation « en cours d'obtention ».",
    source: { nom: "Arobas Logiciels", url: "https://arobas.pro/" },
  },
];
