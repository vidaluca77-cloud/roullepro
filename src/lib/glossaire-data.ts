/**
 * Glossaire / Encyclopédie du transport sanitaire — RoullePro
 * 200+ termes officiels avec définitions sourcées (Légifrance, ameli.fr, ars.sante.fr)
 * Dernière mise à jour : 2026-06-28
 */

export type TermeCategorie =
  | "metier"
  | "vehicule"
  | "reglementation"
  | "financement"
  | "medical"
  | "administratif"
  | "technique";

export type SourceLegale = {
  intitule: string;
  url: string;
};

export type TermeGlossaire = {
  slug: string;
  terme: string;
  termeComplet: string;
  categorie: TermeCategorie;
  definitionCourte: string;
  definitionLongue: string;
  sourcesLegales?: SourceLegale[];
  termeReliesSlug?: string[];
  exemples?: string[];
  abreviation?: string;
  alternativesOrtho?: string[];
  miseAJour: string;
};

export const TERMES: TermeGlossaire[] = [
  // ────────────────────────────────────────────────────────────────────
  // MÉTIERS (30 termes)
  // ────────────────────────────────────────────────────────────────────
  {
    slug: "dea-diplome-etat-ambulancier",
    terme: "DEA",
    termeComplet: "Diplôme d'État d'Ambulancier",
    categorie: "metier",
    abreviation: "DEA",
    definitionCourte:
      "Diplôme d'État requis pour exercer le métier d'ambulancier en France. Il sanctionne une formation de 801 heures théoriques et pratiques incluant les gestes d'urgence.",
    definitionLongue:
      "Le Diplôme d'État d'Ambulancier (DEA) est le titre professionnel réglementé permettant d'exercer la profession d'ambulancier en France. Régi par l'arrêté du 26 janvier 2006 modifié, il est délivré par les instituts de formation agréés par les agences régionales de santé (ARS) après une formation de 801 heures réparties entre enseignements théoriques, travaux pratiques et stages cliniques.\n\nLa formation comprend notamment : les techniques de secourisme et gestes d'urgence, la conduite d'ambulance en situation normale et dégradée, les protocoles de soins d'urgence, la surveillance du patient pendant le transport, et la communication avec la régulation médicale du SAMU.\n\nDepuis la réforme de 2022, le DEA est inscrit au cadre national des certifications professionnelles (RNCP). Le titulaire du DEA est habilité à conduire et équiper un ambulance de type A, A1, A2 ou B, à réaliser des bilans vitaux, à mettre en œuvre les gestes de premiers secours et à prendre en charge les patients sur prescription médicale. Il travaille sous la responsabilité du médecin prescripteur et peut intervenir en renfort du SMUR en dehors de ses horaires de service régulier.",
    sourcesLegales: [
      {
        intitule: "Arrêté du 26 janvier 2006 relatif aux conditions de formation de l'auxiliaire ambulancier et du titulaire du diplôme d'Etat d'ambulancier",
        url: "https://www.legifrance.gouv.fr/loda/id/JORFTEXT000000638571",
      },
      {
        intitule: "Article L.6312-4 du code de la santé publique",
        url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000006692173",
      },
    ],
    termeReliesSlug: ["auxiliaire-ambulancier", "deaa-diplome-etat-auxiliaire-ambulancier", "ambulancier-diplome", "ars-agence-regionale-sante"],
    exemples: [
      "Un titulaire du DEA peut être chef d'équipage sur une ambulance type B.",
      "La formation DEA dure en moyenne 6 mois dans un IFAS (Institut de Formation des Ambulanciers).",
    ],
    miseAJour: "2026-06-28",
  },
  {
    slug: "deaa-diplome-etat-auxiliaire-ambulancier",
    terme: "DEAA",
    termeComplet: "Diplôme d'État d'Auxiliaire Ambulancier",
    categorie: "metier",
    abreviation: "DEAA",
    definitionCourte:
      "Diplôme d'État de niveau 3 permettant d'exercer comme auxiliaire ambulancier. Remplace depuis 2022 l'ancien certificat de formation aux activités de premiers secours en équipe.",
    definitionLongue:
      "Le Diplôme d'État d'Auxiliaire Ambulancier (DEAA) est un titre professionnel de niveau 3 (anciennement niveau V) créé pour remplacer et structurer la formation des auxiliaires ambulanciers. Il est régi par l'arrêté du 10 mai 2021 portant création du diplôme d'État d'auxiliaire ambulancier, entré en vigueur progressivement.\n\nLa formation mène à une qualification reconnue permettant de travailler en équipage aux côtés d'un ambulancier titulaire du DEA. L'auxiliaire ambulancier assure la conduite du véhicule sanitaire léger (VSL), assiste l'ambulancier lors des transports en ambulance, prend en charge les patients assis ou semi-allongés sur prescription médicale, et effectue les formalités administratives liées au transport (feuille de soins, bon de transport).\n\nContrairement au titulaire du DEA, l'auxiliaire ambulancier ne peut pas conduire seul une ambulance médicalisée et ne peut pas réaliser certains gestes médicaux. Il est cependant formé aux gestes de premiers secours, à la surveillance des paramètres vitaux de base et au transport des patients à mobilité réduite.",
    sourcesLegales: [
      {
        intitule: "Arrêté du 10 mai 2021 portant création du diplôme d'État d'auxiliaire ambulancier",
        url: "https://www.legifrance.gouv.fr/loda/id/JORFTEXT000043527049",
      },
    ],
    termeReliesSlug: ["dea-diplome-etat-ambulancier", "auxiliaire-ambulancier", "vsl-vehicule-sanitaire-leger"],
    exemples: [
      "Un DEAA peut conduire un VSL en solo ou assister un DEA en équipage ambulance.",
    ],
    miseAJour: "2026-06-28",
  },
  {
    slug: "auxiliaire-ambulancier",
    terme: "Auxiliaire ambulancier",
    termeComplet: "Auxiliaire ambulancier",
    categorie: "metier",
    definitionCourte:
      "Professionnel du transport sanitaire titulaire du DEAA, habilité à conduire un VSL et à assister un ambulancier. Il assure le transport des patients assis stables sur prescription médicale.",
    definitionLongue:
      "L'auxiliaire ambulancier est le second membre d'équipage d'une ambulance ou le conducteur d'un véhicule sanitaire léger (VSL). Il doit être titulaire du Diplôme d'État d'Auxiliaire Ambulancier (DEAA) ou d'un titre antérieur reconnu équivalent.\n\nSes missions principales comprennent : la conduite du VSL pour les transports de patients assis stables, l'assistance à l'ambulancier DEA lors des transports en ambulance (portage du brancard, surveillance basique, aide à l'installation du patient), la réalisation des formalités administratives (lecture de la carte Vitale, établissement de la feuille de transport), et l'entretien courant du véhicule.\n\nL'auxiliaire ambulancier ne peut pas conduire seul une ambulance de type B ou C. En VSL, il transporte uniquement des patients dont l'état nécessite une position assise et ne requiert pas de surveillance médicale permanente. Il est soumis aux mêmes obligations déontologiques que l'ambulancier : secret professionnel, respect de la dignité du patient, neutralité.",
    sourcesLegales: [
      {
        intitule: "Article R.6312-7 du code de la santé publique",
        url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000006916428",
      },
    ],
    termeReliesSlug: ["dea-diplome-etat-ambulancier", "deaa-diplome-etat-auxiliaire-ambulancier", "vsl-vehicule-sanitaire-leger", "ambulance-type-b"],
    exemples: [
      "En VSL, un seul auxiliaire ambulancier suffit pour le transport d'un patient assis stable.",
      "En ambulance type A2, l'équipage minimum comprend un DEA et un auxiliaire ambulancier.",
    ],
    miseAJour: "2026-06-28",
  },
  {
    slug: "ambulancier-diplome",
    terme: "Ambulancier diplômé",
    termeComplet: "Ambulancier titulaire du Diplôme d'État",
    categorie: "metier",
    definitionCourte:
      "Professionnel paramédical titulaire du DEA, habilité à prendre en charge des patients dans une ambulance, à réaliser des bilans vitaux et des gestes d'urgence.",
    definitionLongue:
      "L'ambulancier diplômé est le professionnel de santé responsable du transport médicalisé en ambulance. Son activité est encadrée par le code de la santé publique (articles L.6312-1 à L.6312-5) et le décret du 9 mai 2007 relatif à l'organisation de la garde départementale.\n\nSes compétences clés incluent : la réalisation d'un bilan clinique initial et continu du patient, la mise en œuvre de gestes de premiers secours (défibrillation automatisée, oxygénothérapie, immobilisation des fractures, relevage et brancardage), la communication avec la régulation médicale du SAMU-Centre 15, la conduite d'une ambulance en situation d'urgence (vitesse, signaux), et la traçabilité des soins et actes effectués.\n\nL'ambulancier est membre à part entière de la chaîne des soins d'urgence. Il peut être sollicité par le SAMU dans le cadre de la garde ATSU (Association de Transport Sanitaire Urgent) pour les missions urgentes non médicalisées. Il travaille généralement en binôme avec un auxiliaire ambulancier.",
    sourcesLegales: [
      {
        intitule: "Articles L.6312-1 à L.6312-5 du code de la santé publique",
        url: "https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006072665/LEGISCTA000006190614/",
      },
      {
        intitule: "Décret n°2007-656 du 30 avril 2007 relatif aux conditions techniques",
        url: "https://www.legifrance.gouv.fr/loda/id/JORFTEXT000000462540",
      },
    ],
    termeReliesSlug: ["dea-diplome-etat-ambulancier", "ambulance-type-b", "samu-centre-15", "atsu-association-transport-sanitaire-urgent"],
    exemples: [
      "L'ambulancier diplômé est chef d'équipage obligatoire sur toute ambulance de type B.",
    ],
    miseAJour: "2026-06-28",
  },
  {
    slug: "regulateur-samu",
    terme: "Régulateur SAMU",
    termeComplet: "Médecin régulateur du SAMU",
    categorie: "metier",
    definitionCourte:
      "Médecin urgentiste qui régule les appels du 15 (SAMU-Centre 15), décide des moyens de secours à engager et oriente les patients vers la structure de soins appropriée.",
    definitionLongue:
      "Le médecin régulateur du SAMU est un médecin urgentiste (ou en formation spécialisée en médecine d'urgence) qui assure la régulation médicale au sein du Centre 15. Sa mission est définie par le code de la santé publique (article R.6311-1 et suivants).\n\nSon rôle comprend : la réception et l'analyse médicale de chaque appel, la décision d'engager ou non un moyen de secours (ambulance privée ATSU, SMUR, pompiers, médecin libéral), l'orientation du patient vers la structure hospitalière adaptée (urgences, UHCD, réanimation), le suivi en temps réel des transports en cours, et la validation des protocoles infirmiers en préhospitalier.\n\nLe médecin régulateur travaille en binôme avec l'ARM (assistant de régulation médicale). Il est l'interlocuteur privilégié des ambulanciers lors des missions urgentes. Sa décision engage la responsabilité médicale sur l'ensemble de la chaîne de prise en charge pré-hospitalière.",
    sourcesLegales: [
      {
        intitule: "Article R.6311-1 du code de la santé publique relatif à l'aide médicale urgente",
        url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000006916355",
      },
    ],
    termeReliesSlug: ["arm-assistant-regulation-medicale", "samu-centre-15", "smur", "atsu-association-transport-sanitaire-urgent"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "arm-assistant-regulation-medicale",
    terme: "ARM",
    termeComplet: "Assistant de Régulation Médicale",
    categorie: "metier",
    abreviation: "ARM",
    definitionCourte:
      "Professionnel paramédical qui réceptionne et oriente les appels au SAMU-Centre 15, réalise le premier bilan et déclenche les moyens de secours sous la supervision du médecin régulateur.",
    definitionLongue:
      "L'Assistant de Régulation Médicale (ARM) est le premier interlocuteur des personnes qui appellent le 15. Formé spécifiquement à la régulation médicale, il joue un rôle pivot dans l'organisation des secours. Son métier est reconnu par la circulaire DHOS/P1/2006/497 du 23 novembre 2006 et fait l'objet d'un référentiel métier officiel.\n\nSes missions incluent : la réception immédiate de tous les appels du 15, la collecte rapide des informations essentielles (localisation, nature du problème, état du patient), le renseignement du médecin régulateur, le déclenchement des moyens d'intervention selon les protocoles définis, la coordination avec les ambulanciers privés, les pompiers (SDIS) et le SMUR, et la gestion du dossier de régulation médicale (DRM).\n\nL'ARM doit détenir le certificat de qualification professionnelle (CQP) d'assistant de régulation médicale ou équivalent. Il travaille en postes de 12 heures, 24h/24 et 7j/7 au sein du centre de réception et de régulation (C15).",
    sourcesLegales: [
      {
        intitule: "Circulaire DHOS/P1/2006/497 relative au métier d'assistant de régulation médicale",
        url: "https://www.legifrance.gouv.fr/circulaire/id/16571",
      },
    ],
    termeReliesSlug: ["regulateur-samu", "samu-centre-15", "smur"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "medecin-regulateur",
    terme: "Médecin régulateur",
    termeComplet: "Médecin régulateur du SAMU-Centre 15",
    categorie: "metier",
    definitionCourte:
      "Médecin urgentiste assurant la régulation médicale au Centre 15. Il prend les décisions médicales sur les moyens à engager et l'orientation des patients.",
    definitionLongue:
      "Le médecin régulateur est le garant médical de la régulation au SAMU. Urgentiste qualifié, il est responsable de chaque décision d'engagement de moyen de secours et d'orientation hospitalière. Il supervise les ARM, valide les bilans transmis par les équipes de terrain et peut donner des conseils médicaux par téléphone (CCMU 1 ou 2 sans déplacement nécessaire). Il participe à la formation continue des équipes pré-hospitalières et à l'élaboration des protocoles d'intervention.",
    sourcesLegales: [
      {
        intitule: "Article R.6311-2 du code de la santé publique",
        url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000006916356",
      },
    ],
    termeReliesSlug: ["arm-assistant-regulation-medicale", "samu-centre-15", "smur"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "infirmier-transport",
    terme: "IADE",
    termeComplet: "Infirmier Anesthésiste Diplômé d'État",
    categorie: "metier",
    abreviation: "IADE",
    definitionCourte:
      "Infirmier spécialisé en anesthésie-réanimation, souvent intégré aux équipes SMUR pour les transports médicalisés des patients les plus graves.",
    definitionLongue:
      "L'Infirmier Anesthésiste Diplômé d'État (IADE) est un professionnel paramédical de niveau master qui a suivi une formation spécialisée de 24 mois après l'obtention du diplôme d'État infirmier. Il est habilité à réaliser des actes d'anesthésie générale et locorégionale sous la responsabilité d'un médecin anesthésiste-réanimateur.\n\nDans le contexte du transport sanitaire, l'IADE intervient principalement lors des transports médicalisés de patients critiques (transport inter-hospitalier médicalisé, TIHAM), au sein des équipes SMUR (Service Mobile d'Urgence et de Réanimation). Il peut prendre en charge la ventilation mécanique, la gestion des voies veineuses centrales, l'administration des agents anesthésiques et sédatifs, et la surveillance des paramètres hémodynamiques pendant le transport.",
    sourcesLegales: [
      {
        intitule: "Décret n°2010-1390 du 12 novembre 2010 portant statut particulier des infirmiers anesthésistes",
        url: "https://www.legifrance.gouv.fr/loda/id/JORFTEXT000023036162",
      },
    ],
    termeReliesSlug: ["smur", "transport-inter-hospitalier-medicalise", "samu-centre-15"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "conducteur-taxi-conventionne",
    terme: "Conducteur de taxi conventionné",
    termeComplet: "Conducteur de taxi conventionné CPAM",
    categorie: "metier",
    definitionCourte:
      "Chauffeur de taxi ayant signé une convention avec la CPAM pour transporter des patients autonomes en position assise. Le transport est remboursé par la Sécurité sociale sur prescription médicale.",
    definitionLongue:
      "Le conducteur de taxi conventionné est un artisan taxi ou salarié d'une société de taxi qui a adhéré à la convention nationale des taxis conventionnés par la CPAM. Pour être conventionné, il doit être titulaire d'une carte professionnelle de taxi, exploiter un véhicule conforme aux critères CPAM (âge, kilométrage, équipement), et justifier d'une formation aux gestes d'urgence de base.\n\nSa spécificité par rapport à un taxi ordinaire est le conventionnement avec l'Assurance maladie, qui lui permet de pratiquer le tiers payant pour les transports médicaux prescrits. Il transporte uniquement des patients en position assise, autonomes (ou avec aide légère), dont l'état de santé ne nécessite pas de surveillance médicale particulière.\n\nLe tarif est réglementé par la convention nationale et ne peut être supérieur au tarif opposable fixé par la CPAM. La facturation se fait par feuille de transport (volet transport de la prescription médicale) ou par télétransmission SESAM-Vitale.",
    sourcesLegales: [
      {
        intitule: "Convention nationale des taxis",
        url: "https://www.ameli.fr/medecin/exercice-liberal/transport-sanitaire/taxis",
      },
    ],
    termeReliesSlug: ["taxi-conventionne", "convention-nationale-taxis", "prescription-medicale-transport", "tiers-payant", "cpam"],
    exemples: [
      "Un patient dialysé résidant loin de sa clinique peut être transporté 3 fois par semaine par taxi conventionné remboursé à 100% (ALD).",
    ],
    miseAJour: "2026-06-28",
  },
  {
    slug: "medecin-smur",
    terme: "Médecin SMUR",
    termeComplet: "Médecin du Service Mobile d'Urgence et de Réanimation",
    categorie: "metier",
    definitionCourte:
      "Médecin urgentiste ou réanimateur intervenant en pré-hospitalier au sein d'une équipe SMUR pour les urgences vitales et les transports médicalisés.",
    definitionLongue:
      "Le médecin SMUR est un médecin spécialisé en médecine d'urgence ou réanimation qui intervient sur des missions pré-hospitalières déclenchées par le SAMU-Centre 15. Il est responsable de la prise en charge médicale sur les lieux de l'intervention et pendant le transport vers le service hospitalier adapté.\n\nSes attributions comprennent : le diagnostic médical initial sur place, la réalisation de gestes médicaux (intubation, défibrillation manuelle, pose de voie centrale, drogues d'urgence), la régulation en liaison avec le Centre 15, le choix de la structure hospitalière destinataire, et la transmission du bilan médical à l'équipe hospitalière. Il travaille avec une infirmière SMUR et/ou un ambulancier SMUR.",
    sourcesLegales: [
      {
        intitule: "Article R.6123-15 du code de la santé publique relatif aux SMUR",
        url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000006916458",
      },
    ],
    termeReliesSlug: ["smur", "samu-centre-15", "infirmier-transport", "regulateur-samu"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "ambulancier-smur",
    terme: "Ambulancier SMUR",
    termeComplet: "Ambulancier hospitalier affecté au SMUR",
    categorie: "metier",
    definitionCourte:
      "Ambulancier hospitalier (ou APHP) intégré à l'équipe d'un SMUR, conduisant le véhicule médicalisé et assistant le médecin urgentiste lors des interventions pré-hospitalières.",
    definitionLongue:
      "L'ambulancier SMUR est un ambulancier titulaire du DEA employé par un établissement de santé public (hôpital, APHP) et affecté aux missions du Service Mobile d'Urgence et de Réanimation. Il se distingue de l'ambulancier privé par son statut de fonctionnaire hospitalier ou agent contractuel de la fonction publique hospitalière.\n\nSon rôle spécifique dans l'équipe SMUR comprend : la conduite du véhicule SMUR (VSAB, VPSP, VLM) en situation d'urgence, l'assistance technique au médecin et à l'infirmière (préparation du matériel, aide à l'intubation, installation du patient), le maintien et la vérification quotidienne du matériel embarqué, et la participation aux transferts inter-hospitaliers médicalisés.",
    sourcesLegales: [
      {
        intitule: "Décret n°2014-513 du 20 mai 2014 portant statut particulier du corps des ambulanciers",
        url: "https://www.legifrance.gouv.fr/loda/id/JORFTEXT000029009641",
      },
    ],
    termeReliesSlug: ["smur", "dea-diplome-etat-ambulancier", "transport-inter-hospitalier-medicalise"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "dispatcheur-transport-sanitaire",
    terme: "Dispatcheur",
    termeComplet: "Dispatcheur de transport sanitaire",
    categorie: "metier",
    definitionCourte:
      "Opérateur chargé d'affecter les véhicules sanitaires disponibles aux missions de transport prescrites, en optimisant les tournées et en assurant la liaison avec les ambulanciers.",
    definitionLongue:
      "Le dispatcheur (ou régulateur opérationnel) est le coordinateur logistique des sociétés de transport sanitaire. Il ne doit pas être confondu avec le médecin régulateur du SAMU : son rôle est purement opérationnel, sans dimension médicale.\n\nSes missions incluent : la réception des prescriptions de transport transmises par les établissements de santé, les EHPAD ou les patients eux-mêmes, l'affectation des équipages et véhicules disponibles selon la nature du transport (ambulance, VSL, taxi), la gestion en temps réel des imprévus (pannes, retards), la communication radio ou téléphonique avec les ambulanciers en mission, et la gestion administrative des feuilles de transport.\n\nAvec la digitalisation du secteur, le dispatcheur utilise des logiciels métiers agréés (SEFi compatible) permettant la géolocalisation des véhicules et l'optimisation des tournées.",
    sourcesLegales: [],
    termeReliesSlug: ["sefi-systeme-electronique-facturation", "bon-de-transport", "prescription-medicale-transport"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "cadre-de-sante-transport",
    terme: "Cadre de santé",
    termeComplet: "Cadre de santé en transport sanitaire",
    categorie: "metier",
    definitionCourte:
      "Professionnel de santé responsable de l'encadrement d'une équipe d'ambulanciers dans un établissement de santé ou une entreprise de transport sanitaire.",
    definitionLongue:
      "Le cadre de santé dans le domaine du transport sanitaire est un professionnel paramédical (souvent un ambulancier expérimenté ayant suivi la formation de cadre de santé) qui encadre et supervise une équipe d'ambulanciers au sein d'un établissement de santé public.\n\nIl est responsable de la qualité des prises en charge, du respect des protocoles, de la gestion des plannings, de la formation continue des équipes, et du lien avec les directions médicales et administratives. Dans les grandes structures hospitalières, il peut gérer une flotte de plusieurs véhicules SMUR et coordonner avec la régulation SAMU.",
    sourcesLegales: [],
    termeReliesSlug: ["ambulancier-diplome", "dea-diplome-etat-ambulancier", "smur"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "brancardier",
    terme: "Brancardier",
    termeComplet: "Brancardier hospitalier",
    categorie: "metier",
    definitionCourte:
      "Agent hospitalier chargé du transport interne des patients au sein d'un établissement de santé (entre services, vers le bloc opératoire, vers les examens).",
    definitionLongue:
      "Le brancardier est un agent hospitalier (aide-soignant ou agent des services hospitaliers qualifié) dont la mission est le transport intra-hospitalier des patients. Il intervient à la demande des équipes soignantes pour déplacer les patients entre les services (urgences, radiologie, blocs opératoires, réanimation).\n\nContrairement à l'ambulancier, le brancardier n'effectue pas de transports sur la voie publique. Il n'est pas tenu d'être titulaire du DEA. Sa formation inclut les techniques de manutention des patients, la prévention des risques liés aux postures, et les procédures d'urgence intra-hospitalières.\n\nLe brancardage est parfois assuré par des ambulanciers DEA dans le cadre de missions en ambulance (transport domicile-hôpital avec montée en chambre).",
    sourcesLegales: [],
    termeReliesSlug: ["brancardage", "ambulancier-diplome", "ambulance-type-b"],
    exemples: [
      "Le brancardage (montée et descente de l'escalier avec le brancard) peut être facturé en supplément par l'ambulancier.",
    ],
    miseAJour: "2026-06-28",
  },
  {
    slug: "pompier-secouriste",
    terme: "Sapeur-pompier secouriste",
    termeComplet: "Sapeur-pompier titulaire du PSE",
    categorie: "metier",
    definitionCourte:
      "Membre du service départemental d'incendie et de secours (SDIS), titulaire du brevet de premiers secours en équipe (PSE), intervenant notamment sur les accidents de la voie publique.",
    definitionLongue:
      "Le sapeur-pompier secouriste intervient dans les situations d'urgence pré-hospitalière en lien avec le SAMU-Centre 15. Il est titulaire du PSE1 et PSE2 (premiers secours en équipe de niveaux 1 et 2). Les SDIS disposent de véhicules de secours et d'assistance aux victimes (VSAV) pouvant transporter des patients.\n\nLa coordination entre pompiers et ambulanciers privés est encadrée par les conventions SAMU-SDIS. Dans les zones couvertes par les deux types de service, la régulation médicale du Centre 15 décide quel moyen engager en premier selon le délai d'intervention estimé et la nature du cas.",
    sourcesLegales: [],
    termeReliesSlug: ["samu-centre-15", "smur", "ambulancier-diplome"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "moniteur-ambulancier",
    terme: "Moniteur ambulancier",
    termeComplet: "Formateur moniteur ambulancier",
    categorie: "metier",
    definitionCourte:
      "Ambulancier expérimenté titulaire d'un certificat de formateur, habilité à dispenser la formation initiale et continue aux ambulanciers dans les instituts de formation agréés ARS.",
    definitionLongue:
      "Le moniteur ambulancier est un ambulancier titulaire du DEA ayant une expérience professionnelle significative (généralement 5 ans minimum) et ayant suivi une formation pédagogique spécifique validée par une certification de formateur. Il est habilité par l'ARS de sa région à enseigner dans un Institut de Formation aux Soins Infirmiers et Aides-Soignants (IFSI) ou un centre de formation spécialisé.\n\nSes activités comprennent : l'enseignement théorique et pratique des modules de formation DEA et DEAA, l'encadrement des stages cliniques, l'évaluation des compétences des stagiaires, et la mise à jour continue de ses connaissances pour maintenir son habilitation.",
    sourcesLegales: [],
    termeReliesSlug: ["dea-diplome-etat-ambulancier", "deaa-diplome-etat-auxiliaire-ambulancier", "ars-agence-regionale-sante"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "infirmier-sapeur-pompier",
    terme: "Infirmier sapeur-pompier",
    termeComplet: "Infirmier de sapeur-pompier (ISP)",
    categorie: "metier",
    abreviation: "ISP",
    definitionCourte:
      "Infirmier diplômé intégré aux unités de secours des SDIS, pouvant réaliser des actes infirmiers pré-hospitaliers selon des protocoles définis par le médecin-chef départemental.",
    definitionLongue:
      "L'infirmier sapeur-pompier (ISP) est un professionnel paramédical titulaire du diplôme d'État infirmier, engagé dans un service départemental d'incendie et de secours (SDIS). Il intervient sur des VSAV médicalisés ou en appui des équipes de secours pour des interventions nécessitant un niveau de soin supérieur aux premiers secours.\n\nDans le cadre d'une convention avec le SAMU, l'ISP peut réaliser certains actes infirmiers relevant de sa compétence (pose de voie veineuse, administration de médicaments selon protocoles, etc.) sous la responsabilité médicale du médecin régulateur du Centre 15. Son rôle dans la chaîne de soins pré-hospitaliers est reconnu mais varie selon les départements.",
    sourcesLegales: [],
    termeReliesSlug: ["samu-centre-15", "smur", "regulateur-samu"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "technicien-ambulancier",
    terme: "Technicien ambulancier",
    termeComplet: "Technicien ambulancier (pays francophones hors France)",
    categorie: "metier",
    definitionCourte:
      "Dénomination utilisée en Belgique et en Suisse pour désigner le professionnel équivalent à l'ambulancier DEA français. Non utilisé en France mais courant dans les référentiels internationaux.",
    definitionLongue:
      "Le terme 'technicien ambulancier' n'est pas utilisé en droit français mais est courant dans les systèmes belge et suisse. En France, la profession est désignée par le titre de 'ambulancier diplômé d'État' (DEA). Cette distinction est utile pour les professionnels francophones souhaitant travailler dans d'autres pays de la francophonie ou pour comprendre les comparaisons dans les publications médicales internationales.",
    sourcesLegales: [],
    termeReliesSlug: ["dea-diplome-etat-ambulancier", "ambulancier-diplome"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "chauffeur-vsl",
    terme: "Chauffeur VSL",
    termeComplet: "Chauffeur de véhicule sanitaire léger",
    categorie: "metier",
    definitionCourte:
      "Conducteur d'un véhicule sanitaire léger (VSL), titulaire du DEAA. Transporte les patients assis stables sur prescription médicale, avec remboursement Sécurité sociale.",
    definitionLongue:
      "Le chauffeur VSL est le conducteur d'un véhicule sanitaire léger, habilité à effectuer des transports de patients assis. Il doit être titulaire du DEAA (Diplôme d'État d'Auxiliaire Ambulancier) ou d'un titre reconnu équivalent. Le VSL est un véhicule intermédiaire entre le taxi conventionné et l'ambulance : il peut transporter jusqu'à 3 patients simultanément, dispose d'un minimum d'équipement sanitaire (oxygène non obligatoire mais disponible, extincteur, trousse de secours) et permet le tiers payant CPAM.\n\nLe chauffeur VSL est soumis aux mêmes obligations que les ambulanciers concernant la tenue vestimentaire professionnelle, le secret professionnel et le respect de la dignité du patient.",
    sourcesLegales: [
      {
        intitule: "Article D.6312-49 du code de la santé publique",
        url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000006916490",
      },
    ],
    termeReliesSlug: ["vsl-vehicule-sanitaire-leger", "deaa-diplome-etat-auxiliaire-ambulancier", "auxiliaire-ambulancier"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "formateur-psc",
    terme: "Formateur PSC1",
    termeComplet: "Formateur en Prévention et Secours Civiques de niveau 1",
    categorie: "metier",
    definitionCourte:
      "Titulaire d'une unité d'enseignement permettant de former le grand public aux gestes de premiers secours (arrêt cardiaque, hémorragie, étouffement).",
    definitionLongue:
      "Le formateur PSC1 est habilité par la préfecture ou par une association agréée de sécurité civile (Croix-Rouge, Protection Civile, etc.) à dispenser la formation aux gestes de premiers secours. Dans le transport sanitaire, nombre d'ambulanciers détiennent cette qualification complémentaire pour intervenir dans les formations proposées aux entreprises, aux EHPAD et aux écoles.",
    sourcesLegales: [],
    termeReliesSlug: ["dea-diplome-etat-ambulancier", "auxiliaire-ambulancier"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "directeur-entreprise-transport-sanitaire",
    terme: "Directeur d'entreprise de transport sanitaire",
    termeComplet: "Directeur d'exploitation d'entreprise de transport sanitaire",
    categorie: "metier",
    definitionCourte:
      "Responsable légal d'une entreprise de transport sanitaire. Doit justifier d'une aptitude professionnelle et satisfaire aux conditions d'agrément ARS.",
    definitionLongue:
      "Le directeur ou gérant d'une entreprise de transport sanitaire est le responsable légal devant l'ARS, la CPAM et les autorités fiscales. Pour obtenir et maintenir l'agrément ARS, il doit justifier : d'une aptitude professionnelle validée (souvent la détention du DEA ou d'un diplôme de gestion d'entreprise sanitaire), de la moralité de l'entreprise, de la conformité du parc de véhicules, et de la permanence de personnel qualifié.\n\nIl est responsable de la tenue du registre des transports, du renouvellement des agréments, du suivi de la convention CPAM, de la formation continue du personnel et du respect des règles d'hygiène et de désinfection des véhicules.",
    sourcesLegales: [
      {
        intitule: "Article L.6312-2 du code de la santé publique",
        url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000043549381",
      },
    ],
    termeReliesSlug: ["agrement-ars", "conventionnement-cpam", "ars-agence-regionale-sante", "finess-geographique"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "manipulateur-electroradio",
    terme: "Manipulateur en électroradiologie",
    termeComplet: "Manipulateur d'électroradiologie médicale",
    categorie: "metier",
    definitionCourte:
      "Professionnel paramédical réalisant les examens d'imagerie médicale (scanner, IRM, radiographie). Certains patients nécessitent un transport en ambulance pour leurs examens d'imagerie.",
    definitionLongue:
      "Le manipulateur en électroradiologie médicale est un professionnel paramédical titulaire du DTS (Diplôme de Technicien Supérieur) ou du DE (Diplôme d'État) de manipulateur en électroradiologie. Il réalise les examens d'imagerie médicale dans les établissements de santé ou les centres de radiologie libéraux.\n\nDans le contexte du transport sanitaire, les patients dont l'état nécessite un scanner ou une IRM urgente peuvent être transportés par ambulance et nécessitent une préparation spécifique du manipulateur pour accueillir un patient sur brancard ou avec équipement médical embarqué.",
    sourcesLegales: [],
    termeReliesSlug: ["ambulance-type-b", "transport-inter-hospitalier-medicalise"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "prepose-nettoyage-vehicule",
    terme: "Préposé à la désinfection",
    termeComplet: "Préposé à la désinfection des véhicules sanitaires",
    categorie: "metier",
    definitionCourte:
      "Agent chargé de l'entretien, du nettoyage et de la désinfection des véhicules sanitaires selon les protocoles d'hygiène réglementaires (bionettoyage).",
    definitionLongue:
      "La désinfection régulière des véhicules sanitaires est une obligation réglementaire fixée par l'arrêté du 10 février 2009. Les entreprises de transport sanitaire doivent tenir un registre de désinfection pour chaque véhicule. Le préposé à la désinfection (qui peut être l'ambulancier lui-même ou un agent dédié) effectue le bionettoyage quotidien des surfaces de contact, la stérilisation des équipements réutilisables et le remplacement des consommables après chaque transport.",
    sourcesLegales: [
      {
        intitule: "Arrêté du 10 février 2009 fixant les conditions de désinfection des véhicules sanitaires",
        url: "https://www.legifrance.gouv.fr/loda/id/JORFTEXT000020252028",
      },
    ],
    termeReliesSlug: ["ambulance-type-b", "vsl-vehicule-sanitaire-leger", "norme-en-1789"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "infirmier-de-coordination",
    terme: "Infirmier de coordination",
    termeComplet: "Infirmier coordinateur de transport sanitaire (IDEC)",
    categorie: "metier",
    definitionCourte:
      "Infirmier responsable de la coordination des transports sanitaires au sein d'un établissement de santé, assurant l'interface entre les services cliniques et les sociétés de transport.",
    definitionLongue:
      "L'infirmier de coordination (ou infirmier coordinateur de transport, IDEC en EHPAD) joue un rôle central dans la planification des transports médicaux depuis les établissements de santé. Il assure la prescription et la validation des bons de transport, la sélection des prestataires de transport, la vérification de la conformité des prescriptions et le suivi administratif des feuilles de transport.\n\nDans les EHPAD, l'IDEC coordonne les transports réguliers des résidents (dialyse, radiothérapie, consultations spécialisées) et s'assure que les prescriptions médicales sont correctement renseignées pour le remboursement CPAM.",
    sourcesLegales: [],
    termeReliesSlug: ["bon-de-transport", "prescription-medicale-transport", "cpam"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "agent-facturation-transport",
    terme: "Agent de facturation",
    termeComplet: "Agent de facturation du transport sanitaire",
    categorie: "metier",
    definitionCourte:
      "Personnel administratif chargé de la facturation des transports sanitaires auprès de la CPAM, des mutuelles et des patients (reste à charge).",
    definitionLongue:
      "L'agent de facturation dans une entreprise de transport sanitaire gère l'ensemble du cycle de facturation : vérification des feuilles de transport, télétransmission des FSE (feuilles de soins électroniques) à la CPAM via le logiciel agréé SEFi, suivi des rejets et demandes de remboursement, facturation du reste à charge aux patients ou aux mutuelles, et gestion des indus éventuels.\n\nC'est un poste clé pour la rentabilité de l'entreprise : les erreurs de facturation (mauvaise prescription, code acte erroné, absence de signature) peuvent entraîner des rejets CPAM ou des indus à rembourser.",
    sourcesLegales: [],
    termeReliesSlug: ["sefi-systeme-electronique-facturation", "feuille-de-soins-electronique", "tiers-payant", "indu"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "coordinateur-atsu",
    terme: "Coordinateur ATSU",
    termeComplet: "Coordinateur de garde ATSU",
    categorie: "metier",
    definitionCourte:
      "Responsable de la gestion des tours de garde des ambulanciers privés dans le cadre de l'Association de Transport Sanitaire Urgent (ATSU).",
    definitionLongue:
      "Le coordinateur ATSU est généralement un responsable désigné par les entreprises de transport sanitaire participant à la garde départementale urgente. Il gère les plannings de garde, assure la liaison avec le SAMU-Centre 15, et coordonne l'intervention des entreprises pendant les plages horaires de garde (nuits, week-ends, jours fériés).\n\nEn cas d'appel du Centre 15 pour une urgence relevant d'un ambulancier privé, c'est l'entreprise de garde ATSU qui doit intervenir. Le coordinateur assure que les véhicules et équipages sont bien positionnés et disponibles pendant la plage de garde.",
    sourcesLegales: [],
    termeReliesSlug: ["atsu-association-transport-sanitaire-urgent", "garde-departementale-atsu", "samu-centre-15"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "responsable-qualite-ts",
    terme: "Responsable qualité",
    termeComplet: "Responsable qualité en entreprise de transport sanitaire",
    categorie: "metier",
    definitionCourte:
      "Professionnel chargé de mettre en œuvre et de maintenir le système qualité d'une entreprise de transport sanitaire, notamment en vue du renouvellement de l'agrément ARS.",
    definitionLongue:
      "Le responsable qualité en transport sanitaire pilote la démarche qualité de l'entreprise : rédaction et mise à jour des procédures, gestion des non-conformités, préparation des audits ARS, suivi des indicateurs de performance (ponctualité, incidents, réclamations), formation du personnel aux protocoles qualité et veille réglementaire.\n\nDans le cadre de la démarche CAPAS (Certification des Activités du Préhospitalier Ambulancier et du Sanitaire), certaines grandes entreprises de transport sanitaire s'engagent dans une certification qualité volontaire.",
    sourcesLegales: [],
    termeReliesSlug: ["agrement-ars", "ars-agence-regionale-sante"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "technicien-maintenance-vehicule-sanitaire",
    terme: "Technicien de maintenance",
    termeComplet: "Technicien de maintenance des véhicules sanitaires",
    categorie: "metier",
    definitionCourte:
      "Mécanicien spécialisé dans l'entretien des ambulances et VSL, veillant à la conformité technique des véhicules aux normes EN 1789 et aux exigences de l'agrément ARS.",
    definitionLongue:
      "La maintenance des véhicules sanitaires est soumise à des exigences réglementaires strictes. Le technicien de maintenance spécialisé doit assurer le respect de la norme NF EN 1789 pour les ambulances (configuration de l'habitacle, équipements médicaux embarqués, marquage), les révisions périodiques imposées par l'agrément ARS, et les contrôles techniques spécifiques aux véhicules sanitaires.",
    sourcesLegales: [],
    termeReliesSlug: ["norme-en-1789", "agrement-ars", "ambulance-type-b"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "aide-soignant-transport",
    terme: "Aide-soignant",
    termeComplet: "Aide-soignant en structure de soins",
    categorie: "metier",
    definitionCourte:
      "Professionnel paramédical titulaire du DEAS, assurant les soins d'hygiène et de confort des patients. Peut assister les ambulanciers lors des transferts intra-hospitaliers.",
    definitionLongue:
      "L'aide-soignant est titulaire du Diplôme d'État d'Aide-Soignant (DEAS). Bien qu'il n'exerce pas à proprement parler dans le transport sanitaire extrahospitalier, il intervient dans le brancardage intra-hospitalier et dans l'accompagnement des patients lors de transports prévus depuis les services de soins.\n\nDans certaines structures (EHPAD notamment), l'aide-soignant accompagne parfois les résidents dans le véhicule de transport pour assurer une présence soignante continue, en particulier pour les patients désorientés ou nécessitant des soins d'hygiène pendant le déplacement.",
    sourcesLegales: [],
    termeReliesSlug: ["brancardier", "brancardage", "ambulancier-diplome"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "prestataire-transport-medico-social",
    terme: "Prestataire TPMS",
    termeComplet: "Prestataire de transport médico-social",
    categorie: "metier",
    definitionCourte:
      "Entreprise assurant le transport de personnes handicapées ou dépendantes vers des établissements médico-sociaux (ESAT, IME, EHPAD). Distinct du transport sanitaire remboursé par la CPAM.",
    definitionLongue:
      "Le transport médico-social (TPMS) désigne le transport de personnes en situation de handicap ou de dépendance vers des établissements et services médico-sociaux (ESMS) : ESAT, IME, SESSAD, EHPAD, foyers d'hébergement, etc. Ce transport n'est pas pris en charge par la CPAM mais par les conseils départementaux (au titre de l'aide sociale à l'enfance ou des allocations pour adultes handicapés) ou par les agences régionales de santé (via les dotations aux ESMS).\n\nLe prestataire TPMS n'est pas tenu d'être agréé par l'ARS pour les transports sanitaires stricto sensu, mais peut être soumis à des cahiers des charges des donneurs d'ordre (conseils départementaux, ARS).",
    sourcesLegales: [],
    termeReliesSlug: ["tpmr-transport-personnes-mobilite-reduite", "pmr-personne-mobilite-reduite"],
    miseAJour: "2026-06-28",
  },

  // ────────────────────────────────────────────────────────────────────
  // VÉHICULES (25 termes)
  // ────────────────────────────────────────────────────────────────────
  {
    slug: "ambulance-type-a",
    terme: "Ambulance type A",
    termeComplet: "Ambulance de transport (type A)",
    categorie: "vehicule",
    definitionCourte:
      "Véhicule sanitaire destiné au transport des patients assis ou couchés ne nécessitant pas de surveillance médicale particulière. Comprend les types A1 (1 patient allongé) et A2 (patients assis).",
    definitionLongue:
      "L'ambulance de type A est définie par la norme NF EN 1789 et le code de la santé publique. Elle est divisée en deux sous-catégories selon le décret du 14 décembre 2009 :\n\n- Type A1 : ambulance de secours et soins d'urgence, pouvant transporter un patient allongé, avec équipements de soins d'urgence complets.\n- Type A2 : ambulance de transport polyvalente, pouvant transporter plusieurs patients assis.\n\nL'ambulance type A doit respecter les équipements minimaux fixés par l'arrêté du 10 février 2009 : brancard principal, chaise portoir, matelas à dépression, oxygène médical, défibrillateur semi-automatique (DSA), matériel de pansement et d'immobilisation.",
    sourcesLegales: [
      {
        intitule: "Arrêté du 10 février 2009 fixant les dispositions relatives aux transports sanitaires terrestres",
        url: "https://www.legifrance.gouv.fr/loda/id/JORFTEXT000020252028",
      },
      {
        intitule: "Norme NF EN 1789 : véhicules pour services médicaux d'urgence",
        url: "https://www.boutique.afnor.org",
      },
    ],
    termeReliesSlug: ["ambulance-type-b", "ambulance-type-a1", "ambulance-type-a2", "norme-en-1789", "dea-diplome-etat-ambulancier"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "ambulance-type-a1",
    terme: "Ambulance type A1",
    termeComplet: "Ambulance de secours et soins d'urgence (type A1)",
    categorie: "vehicule",
    definitionCourte:
      "Ambulance pouvant transporter un patient allongé, équipée pour les soins d'urgence basiques. Nécessite un équipage d'au moins un ambulancier DEA.",
    definitionLongue:
      "L'ambulance type A1 est la configuration la plus courante dans le transport sanitaire privé. Elle transporte un patient principal allongé sur brancard et peut accueillir un patient assis supplémentaire. Son équipement réglementaire comprend : brancard principal (fixé au sol), chaise portoir, matelas à dépression ou attelle de traction, défibrillateur semi-automatique, bouteille d'oxygène médical avec masque et lunettes, trousse de pharmacie conforme, matériel de pansement et d'immobilisation.\n\nL'équipage minimal est composé d'un ambulancier titulaire du DEA (chef d'équipage) et d'un auxiliaire ambulancier DEAA. Elle est utilisée pour les transports programmés (dialyse, radiothérapie, consultations) et les urgences non médicalisées sur décision du SAMU.",
    sourcesLegales: [
      {
        intitule: "Arrêté du 10 février 2009 — Équipements des ambulances type A1",
        url: "https://www.legifrance.gouv.fr/loda/id/JORFTEXT000020252028",
      },
    ],
    termeReliesSlug: ["ambulance-type-a", "ambulance-type-b", "dea-diplome-etat-ambulancier", "norme-en-1789"],
    exemples: [
      "Après une fracture de la hanche, une patiente est transportée en ambulance A1 depuis l'hôpital vers une maison de convalescence.",
    ],
    miseAJour: "2026-06-28",
  },
  {
    slug: "ambulance-type-a2",
    terme: "Ambulance type A2",
    termeComplet: "Ambulance de transport collectif (type A2)",
    categorie: "vehicule",
    definitionCourte:
      "Ambulance pouvant transporter plusieurs patients assis. Utilisée pour le transport collectif de patients non urgents se rendant à des soins programmés.",
    definitionLongue:
      "L'ambulance type A2 est configurée pour transporter plusieurs patients assis (généralement 2 à 3) se rendant à des soins programmés (dialyse, radiothérapie, consultations). Elle est moins équipée que l'ambulance A1 sur le plan des urgences mais doit respecter un équipement de sécurité minimal (oxygène, défibrillateur).\n\nElle est souvent utilisée pour les tournées de transport itératif (dialyse 3 fois par semaine, radiothérapie quotidienne). Sa rentabilité est supérieure à l'A1 grâce à la mutualisation des transports, mais nécessite une organisation rigoureuse des horaires et une compatibilité médicale entre les patients transportés simultanément.",
    sourcesLegales: [],
    termeReliesSlug: ["ambulance-type-a", "ambulance-type-a1", "transport-partage", "transport-iteratif"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "ambulance-type-b",
    terme: "Ambulance type B",
    termeComplet: "Ambulance de soins intensifs (type B)",
    categorie: "vehicule",
    definitionCourte:
      "Ambulance médicalisée de soins intensifs, équipée pour le transport de patients instables sous surveillance médicale. Réservée aux transports inter-hospitaliers médicalisés (TIHAM).",
    definitionLongue:
      "L'ambulance type B (dite « de soins intensifs ») est définie par la norme NF EN 1789 comme véhicule adapté aux interventions d'urgence médicale et aux transferts de patients instables. Elle est équipée d'un moniteur-défibrillateur manuel, d'un ventilateur de transport, d'une pompe à seringue, d'un aspirateur de sécrétions, d'un scope multiparamétrique (SpO2, ECG, TA, capnographie) et d'une pharmacie médicale complète.\n\nElle est principalement utilisée par les équipes SMUR pour les interventions pré-hospitalières et les transports inter-hospitaliers médicalisés (TIHAM). Son utilisation requiert la présence d'un médecin, d'une infirmière et d'un ambulancier DEA.",
    sourcesLegales: [
      {
        intitule: "Norme NF EN 1789 — Classification des ambulances type B",
        url: "https://www.boutique.afnor.org",
      },
    ],
    termeReliesSlug: ["ambulance-type-a", "smur", "transport-inter-hospitalier-medicalise", "norme-en-1789"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "ambulance-type-c",
    terme: "Ambulance type C",
    termeComplet: "Ambulance de réanimation mobile (type C — SMUR)",
    categorie: "vehicule",
    definitionCourte:
      "Ambulance de réanimation mobile (SMUR), équipée pour la réanimation sur place et pendant le transport. Correspond au SMUR français.",
    definitionLongue:
      "L'ambulance type C selon la classification NF EN 1789 correspond à l'unité mobile hospitalière (UMH) du SMUR en France. C'est le véhicule de réanimation pré-hospitalière. Elle emporte l'ensemble du matériel de réanimation avancée : défibrillateur manuel, scope multiparamétrique, ventilateur de transport, pompes à perfusion, plateau chirurgical pour gestes invasifs (drainage pleural, intubation), et une pharmacie médicale complète incluant les médicaments d'urgence.\n\nElle est uniquement armée par des équipes hospitalières SMUR et déclenchée sur décision du médecin régulateur du Centre 15 pour les urgences vitales.",
    sourcesLegales: [],
    termeReliesSlug: ["smur", "ambulance-type-b", "norme-en-1789", "samu-centre-15"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "vsl-vehicule-sanitaire-leger",
    terme: "VSL",
    termeComplet: "Véhicule Sanitaire Léger",
    categorie: "vehicule",
    abreviation: "VSL",
    definitionCourte:
      "Véhicule sanitaire destiné au transport de patients assis stables (jusqu'à 3 passagers), conduit par un auxiliaire ambulancier. Moins équipé qu'une ambulance, il est remboursé par la CPAM sur prescription médicale.",
    definitionLongue:
      "Le Véhicule Sanitaire Léger (VSL) est un véhicule de transport sanitaire terrestre de 4 à 9 places (en pratique souvent 3 places passagers) destiné aux patients pouvant voyager en position assise et ne nécessitant pas de surveillance médicale particulière. Il est défini par l'article D.6312-49 du code de la santé publique.\n\nSon équipement réglementaire minimal comprend : siège ou trousse de secours, extincteur, triangle de signalisation, carte professionnelle du conducteur, une balise de couleur jaune (pas de gyrophare), marquage réglementaire « AMBULANCE » ou « VSL » selon le type. Contrairement à l'ambulance, le VSL n'emporte pas obligatoirement d'oxygène médical ni de défibrillateur.\n\nLe VSL peut transporter jusqu'à 3 patients simultanément (transport partagé), ce qui en fait un vecteur d'optimisation économique pour les transports itératifs (dialyse, radiothérapie). Le transport en VSL est remboursé par la Sécurité sociale à 65 % sur prescription médicale (à 100 % pour les ALD).",
    sourcesLegales: [
      {
        intitule: "Article D.6312-49 du code de la santé publique",
        url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000006916490",
      },
      {
        intitule: "Conditions de remboursement des frais de transport — ameli.fr",
        url: "https://www.ameli.fr/assure/remboursements/rembourse/transport-malade/prise-en-charge-frais-transport",
      },
    ],
    termeReliesSlug: ["ambulance-type-a", "taxi-conventionne", "transport-partage", "auxiliaire-ambulancier", "prescription-medicale-transport"],
    exemples: [
      "Trois patients dialysés habitant le même quartier peuvent être transportés ensemble en VSL vers le centre de dialyse.",
      "Un patient atteint d'une ALD30 voyageant en VSL est remboursé à 100 % sans avance de frais.",
    ],
    miseAJour: "2026-06-28",
  },
  {
    slug: "taxi-conventionne",
    terme: "Taxi conventionné",
    termeComplet: "Taxi conventionné CPAM",
    categorie: "vehicule",
    definitionCourte:
      "Taxi ayant signé une convention avec la CPAM permettant le remboursement des transports médicaux de patients autonomes en position assise sur prescription médicale.",
    definitionLongue:
      "Le taxi conventionné est un véhicule de transport public particulier de personnes (taxi) dont le conducteur a adhéré à la convention nationale ou à une convention locale avec la CPAM. Il est distinct du VSL et de l'ambulance : le taxi conventionné transporte des patients autonomes en position assise qui n'ont pas besoin d'assistance médicale ou para-médicale particulière.\n\nPour être conventionné, le taxi doit : avoir moins de 5 ans (règle générale, sauf dérogation), être en bon état général, être équipé d'un taximètre homologué, être couvert par une assurance spécifique transport médical, et son conducteur doit être titulaire de la carte professionnelle de taxi et avoir suivi une formation aux gestes de premier secours (PSC1 minimum).\n\nLes tarifs de remboursement sont fixés par la convention nationale signée entre l'Assurance maladie et les syndicats de taxis. Le taxi conventionné ne peut pas pratiquer le tiers payant pour les déplacements non médicaux.",
    sourcesLegales: [
      {
        intitule: "Convention nationale organisant les rapports entre les taxis et l'Assurance Maladie",
        url: "https://www.ameli.fr/medecin/exercice-liberal/transport-sanitaire/taxis",
      },
    ],
    termeReliesSlug: ["vsl-vehicule-sanitaire-leger", "convention-nationale-taxis", "tiers-payant", "prescription-medicale-transport", "cpam"],
    exemples: [
      "Un patient en dialyse vivant seul et autonome peut bénéficier d'un taxi conventionné pris en charge à 100 % par la CPAM.",
    ],
    miseAJour: "2026-06-28",
  },
  {
    slug: "tpmr-transport-personnes-mobilite-reduite",
    terme: "TPMR",
    termeComplet: "Transport de Personnes à Mobilité Réduite",
    categorie: "vehicule",
    abreviation: "TPMR",
    definitionCourte:
      "Véhicule adapté au transport de personnes en fauteuil roulant ou à mobilité réduite, équipé d'un plancher bas, d'une rampe d'accès et d'un dispositif d'arrimage du fauteuil.",
    definitionLongue:
      "Le TPMR désigne à la fois le type de transport et le véhicule utilisé pour le transport des personnes en situation de handicap moteur se déplaçant en fauteuil roulant. Le véhicule TPMR est aménagé avec : un plancher surbaissé, une rampe ou hayon élévateur, des emplacements réservés aux fauteuils roulants avec dispositifs d'arrimage certifiés (norme ISO 10542), des ceintures de sécurité adaptées.\n\nLe transport TPMR peut relever du transport sanitaire (remboursé par la CPAM si prescription médicale) ou du transport médico-social (pris en charge par les conseils départementaux ou les ESMS). Pour être pris en charge par la CPAM, le patient en fauteuil roulant doit disposer d'une prescription médicale de transport indiquant expressément l'utilisation d'un véhicule adapté PMR.",
    sourcesLegales: [
      {
        intitule: "Arrêté du 2 juillet 1982 relatif au transport en commun de personnes — accessibilité PMR",
        url: "https://www.legifrance.gouv.fr",
      },
    ],
    termeReliesSlug: ["pmr-personne-mobilite-reduite", "vsl-vehicule-sanitaire-leger", "prescription-medicale-transport"],
    exemples: [
      "Un patient paraplégique se rendant en consultation à l'hôpital nécessite un véhicule TPMR avec arrimage de fauteuil roulant.",
    ],
    miseAJour: "2026-06-28",
  },
  {
    slug: "pmr-personne-mobilite-reduite",
    terme: "PMR",
    termeComplet: "Personne à Mobilité Réduite",
    categorie: "medical",
    abreviation: "PMR",
    definitionCourte:
      "Toute personne dont la mobilité est réduite en raison d'un handicap moteur, sensoriel, cognitif ou d'un âge avancé, nécessitant des aménagements spécifiques pour le transport.",
    definitionLongue:
      "La notion de Personne à Mobilité Réduite (PMR) est définie dans le droit européen (directive 2001/85/CE) et reprise en droit français. Elle englobe toutes les personnes ayant des difficultés à utiliser les transports en commun ordinaires, que ce soit en raison d'un handicap moteur (fauteuil roulant, difficultés à la marche), sensoriel (déficience visuelle ou auditive), cognitif (démence, handicap mental), ou liées à l'âge ou à une grossesse avancée.\n\nDans le transport sanitaire, la qualification PMR est importante car elle détermine le type de véhicule approprié (TPMR, ambulance avec brancard ou chaise portoir) et le niveau d'équipement requis. La prescription médicale doit préciser si le patient nécessite un transport en véhicule PMR adapté.",
    sourcesLegales: [],
    termeReliesSlug: ["tpmr-transport-personnes-mobilite-reduite", "vsl-vehicule-sanitaire-leger", "prescription-medicale-transport"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "smur",
    terme: "SMUR",
    termeComplet: "Service Mobile d'Urgence et de Réanimation",
    categorie: "vehicule",
    abreviation: "SMUR",
    definitionCourte:
      "Équipe médicale mobile composée d'un médecin urgentiste, d'une infirmière et d'un ambulancier, intervenant sur les urgences vitales pré-hospitalières en France.",
    definitionLongue:
      "Le Service Mobile d'Urgence et de Réanimation (SMUR) est une structure hospitalière de médecine d'urgence qui assure les interventions médicales pré-hospitalières pour les urgences vitales. Il est rattaché à un établissement de santé autorisé aux urgences et déclenché par le médecin régulateur du SAMU-Centre 15.\n\nUne équipe SMUR type comprend : un médecin urgentiste (ou réanimateur), une infirmière diplômée d'État (parfois IADE), et un conducteur ambulancier DEA. Le véhicule SMUR (UMH, véhicule léger médicalisé VLM, ou hélicoptère SMUR) emporte l'ensemble du matériel de réanimation.\n\nLes missions SMUR comprennent : les interventions primaires (sur accident ou urgence à domicile), les transferts inter-hospitaliers médicalisés (TIHAM) de patients instables nécessitant une équipe médicale, et les évacuations sanitaires dans le cadre du plan ORSEC.",
    sourcesLegales: [
      {
        intitule: "Articles R.6123-15 à R.6123-22 du code de la santé publique relatifs aux SMUR",
        url: "https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006072665/LEGISCTA000006196050/",
      },
    ],
    termeReliesSlug: ["samu-centre-15", "medecin-smur", "ambulancier-smur", "transport-inter-hospitalier-medicalise", "ambulance-type-b"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "helicoptere-smur",
    terme: "Hélicoptère SMUR",
    termeComplet: "Héliporteur médicalisé SMUR",
    categorie: "vehicule",
    definitionCourte:
      "Hélicoptère armé par une équipe SMUR, permettant des interventions et des transferts médicalisés rapides sur des zones difficiles d'accès ou à grande distance.",
    definitionLongue:
      "L'hélicoptère médicalisé (SMUR aérien) est un vecteur de prise en charge pré-hospitalière déclenché par le Centre 15 pour des interventions nécessitant une rapidité d'intervention ou un accès difficile par voie terrestre. En France, les SMUR hélicoptères sont le plus souvent mis à disposition par la sécurité civile (Hélicoptères de Sécurité Civile) ou par la SÉCURIMED.\n\nL'équipe embarquée est la même que celle d'un SMUR terrestre : médecin, infirmière (IADE ou IDE urgentiste), et le pilote. Les transports héliportés médicalisés permettent notamment de desservir les zones de montagne, les îles, et d'assurer des transfers rapides vers des centres spécialisés (neurovasculaire, brûlés, polytraumatisés).",
    sourcesLegales: [],
    termeReliesSlug: ["smur", "samu-centre-15", "transport-inter-hospitalier-medicalise"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "assu-ambulance-secours-soins-urgence",
    terme: "ASSU",
    termeComplet: "Ambulance de Secours et Soins d'Urgence",
    categorie: "vehicule",
    abreviation: "ASSU",
    definitionCourte:
      "Désignation ancienne de l'ambulance type A1, véhicule de secours et soins d'urgence des entreprises privées de transport sanitaire.",
    definitionLongue:
      "L'ASSU (Ambulance de Secours et Soins d'Urgence) est l'ancienne appellation, encore largement utilisée dans le milieu professionnel, de ce qui correspond à l'ambulance type A1 selon la norme NF EN 1789. C'est le véhicule de base de toute entreprise de transport sanitaire agréée ARS.\n\nL'ASSU est armée d'un équipage DEA + auxiliaire ambulancier et transporte un patient principal allongé. Elle est le vecteur des urgences non médicalisées déclenchées par le SAMU dans le cadre de la garde ATSU.",
    sourcesLegales: [],
    termeReliesSlug: ["ambulance-type-a1", "ambulance-type-a", "atsu-association-transport-sanitaire-urgent", "dea-diplome-etat-ambulancier"],
    alternativesOrtho: ["ambulance type A1", "ambulance de secours"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "vlm-vehicule-leger-medicalise",
    terme: "VLM",
    termeComplet: "Véhicule Léger Médicalisé",
    categorie: "vehicule",
    abreviation: "VLM",
    definitionCourte:
      "Véhicule léger utilisé par le médecin SMUR pour rejoindre rapidement un lieu d'intervention, souvent en avance d'une ambulance de réanimation.",
    definitionLongue:
      "Le Véhicule Léger Médicalisé (VLM) est un véhicule rapide (souvent de type break ou monospace) permettant au médecin SMUR et à l'infirmière de rejoindre les lieux d'une urgence vitale avant l'arrivée de l'ambulance lourde. Il emporte le matériel médical essentiel (défibrillateur manuel, scope, pharmacie d'urgence, matériel d'intubation) dans des mallettes.\n\nLe VLM est particulièrement utile dans les zones urbaines denses où la circulation rend difficile la progression rapide d'un véhicule volumineux. Après la prise en charge initiale par le médecin du VLM, l'ambulance de réanimation complète le transport vers l'hôpital.",
    sourcesLegales: [],
    termeReliesSlug: ["smur", "medecin-smur", "ambulance-type-b", "samu-centre-15"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "vsav-vehicule-secours-assistance-victimes",
    terme: "VSAV",
    termeComplet: "Véhicule de Secours et d'Assistance aux Victimes",
    categorie: "vehicule",
    abreviation: "VSAV",
    definitionCourte:
      "Ambulance des sapeurs-pompiers, équipée pour le secours aux victimes et pouvant assurer un transport pré-hospitalier. Intervient souvent en premier sur les accidents.",
    definitionLongue:
      "Le VSAV (Véhicule de Secours et d'Assistance aux Victimes) est l'équivalent pompiers de l'ambulance privée. Il est armé par 3 sapeurs-pompiers secouristes (SP1 + PSE) et peut transporter une victime sur brancard.\n\nLe VSAV est déclenché par le 18 (numéro d'urgence des pompiers) mais peut l'être aussi par le Centre 15 dans le cadre d'une convention SAMU-SDIS. En cas de carence ambulancière (absence d'entreprise privée disponible), les pompiers peuvent être sollicités par le SAMU pour pallier la défaillance, avec facturation à la caisse primaire d'assurance maladie.",
    sourcesLegales: [],
    termeReliesSlug: ["samu-centre-15", "pompier-secouriste", "ambulancier-diplome"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "vehicule-reserve-sanitaire",
    terme: "Véhicule de réserve sanitaire",
    termeComplet: "Véhicule de réserve sanitaire nationale",
    categorie: "vehicule",
    definitionCourte:
      "Véhicule stocké par l'Établissement de Préparation et de Réponse aux Urgences Sanitaires (EPRUS) pour renforcer les capacités de transport en cas de crise sanitaire majeure.",
    definitionLongue:
      "La réserve sanitaire nationale comprend des véhicules (ambulances, VSL, véhicules logistiques) mobilisables par le ministère de la Santé en cas de crise sanitaire (pandémie, catastrophe naturelle, plan ORSEC). Ces véhicules sont gérés par Santé publique France (qui a succédé à l'EPRUS) et peuvent être déployés dans les régions sinistrées pour renforcer les capacités d'évacuation et de transport.\n\nLors de la crise COVID-19 (2020), des TGV médicalisés et des véhicules de réserve sanitaire ont été mobilisés pour les transferts inter-régionaux de patients en réanimation.",
    sourcesLegales: [],
    termeReliesSlug: ["smur", "ambulance-type-b", "samu-centre-15"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "amg-ambulance-medicalisee-garde",
    terme: "AMG",
    termeComplet: "Ambulance médicalisée de garde",
    categorie: "vehicule",
    abreviation: "AMG",
    definitionCourte:
      "Appellation désignant une ambulance privée armée d'une équipe DEA et mise à disposition pour la garde ATSU, intervenant sur réquisition du SAMU-Centre 15.",
    definitionLongue:
      "L'AMG (ou ambulance de garde médicalisée dans certains systèmes locaux) désigne une ambulance privée dont la mise à disposition est organisée dans le cadre de la garde départementale ATSU. Pendant ses plages de garde, cette ambulance est disponible pour répondre aux appels du Centre 15 dans un délai fixé par la convention ATSU (généralement 15 à 20 minutes).\n\nLe terme AMG est plus courant dans certains départements et organisations locales que dans le texte réglementaire national.",
    sourcesLegales: [],
    termeReliesSlug: ["atsu-association-transport-sanitaire-urgent", "garde-departementale-atsu", "ambulance-type-a1", "samu-centre-15"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "vehicule-bariatrique",
    terme: "Véhicule bariatrique",
    termeComplet: "Véhicule sanitaire adapté aux patients obèses (bariatrique)",
    categorie: "vehicule",
    definitionCourte:
      "Ambulance renforcée et équipée de matériel spécifique pour le transport de patients en situation d'obésité morbide, avec brancard renforcé et portes élargies.",
    definitionLongue:
      "Le véhicule bariatrique est une ambulance spécialement aménagée pour le transport de patients obèses (IMC > 40 ou poids > 150 kg). Il se distingue par : un brancard principal renforcé (charge maximale 300 à 450 kg), des sangles et dispositifs d'arrimage adaptés, un hayon électrique plus large, une cabine médicale spacieuse. Son équipage nécessite souvent du renfort (3 ou 4 personnes) pour assurer la manutention en toute sécurité.\n\nLa demande de véhicule bariatrique doit être signalée lors de la prescription de transport pour que le dispatcheur puisse affecter le bon type de véhicule. Son coût de transport est généralement plus élevé du fait des équipements spécifiques.",
    sourcesLegales: [],
    termeReliesSlug: ["ambulance-type-a1", "brancardage", "prescription-medicale-transport"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "ambulance-pediatrique",
    terme: "Ambulance pédiatrique",
    termeComplet: "Ambulance de soins pédiatriques",
    categorie: "vehicule",
    definitionCourte:
      "Ambulance équipée de matériel spécifique aux nourrissons et enfants (couveuse de transport, moniteur néonatal, matériel d'intubation pédiatrique).",
    definitionLongue:
      "L'ambulance pédiatrique ou néonatale est une ambulance type B fortement médicalisée pour le transport de nouveau-nés prématurés ou d'enfants gravement malades. Elle emporte une couveuse de transport (incubateur portable), un ventilateur néonatal, un moniteur multi-paramétrique adapté, et une pharmacie pédiatrique. L'équipe est composée d'un médecin pédiatre ou réanimateur néonatal, d'une infirmière puéricultrice ou IADE et d'un ambulancier conducteur.\n\nEn France, les transports néonatals sont coordonnés par les SMUR néonatals des CHU.",
    sourcesLegales: [],
    termeReliesSlug: ["smur", "ambulance-type-b", "transport-inter-hospitalier-medicalise"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "vehicule-sanitaire-leger-adapte",
    terme: "VSL adapté",
    termeComplet: "Véhicule Sanitaire Léger adapté PMR",
    categorie: "vehicule",
    definitionCourte:
      "VSL équipé d'un hayon ou d'une rampe d'accès permettant le transport de patients en fauteuil roulant sans nécessiter de transfert sur le siège du véhicule.",
    definitionLongue:
      "Le VSL adapté PMR est une configuration intermédiaire entre le VSL classique et le TPMR. Il permet à un patient en fauteuil roulant non médicalisé de monter dans le véhicule en restant dans son fauteuil. Cela réduit les manipulations douloureuses et améliore le confort du patient.\n\nPour la CPAM, le remboursement suit les mêmes règles que le VSL classique si le patient est autonome et stable. La mention de la nécessité d'un véhicule adapté doit figurer sur la prescription médicale de transport.",
    sourcesLegales: [],
    termeReliesSlug: ["vsl-vehicule-sanitaire-leger", "tpmr-transport-personnes-mobilite-reduite", "pmr-personne-mobilite-reduite"],
    miseAJour: "2026-06-28",
  },

  // ────────────────────────────────────────────────────────────────────
  // RÉGLEMENTATION (40 termes)
  // ────────────────────────────────────────────────────────────────────
  {
    slug: "ars-agence-regionale-sante",
    terme: "ARS",
    termeComplet: "Agence Régionale de Santé",
    categorie: "reglementation",
    abreviation: "ARS",
    definitionCourte:
      "Établissement public de l'État chargé de la mise en œuvre de la politique de santé dans sa région, notamment l'agrément des entreprises de transport sanitaire.",
    definitionLongue:
      "L'Agence Régionale de Santé (ARS) est un établissement public administratif de l'État créé par la loi HPST du 21 juillet 2009. Il existe 18 ARS en France (13 régions métropolitaines + 5 régions d'outre-mer). L'ARS est la tutelle directe des entreprises de transport sanitaire.\n\nSes missions dans le domaine du transport sanitaire comprennent : la délivrance et le renouvellement des agréments des entreprises de transport sanitaire, le contrôle de la conformité des véhicules et du personnel, la planification de l'offre de transport sanitaire dans le schéma régional de santé, la supervision de l'organisation de la garde ATSU, et le retrait d'agrément en cas de manquement grave.\n\nL'ARS travaille en étroite collaboration avec les CPAM pour la coordination des aspects médicaux et financiers du transport sanitaire conventionné.",
    sourcesLegales: [
      {
        intitule: "Loi n°2009-879 du 21 juillet 2009 portant réforme de l'hôpital (HPST) — Création des ARS",
        url: "https://www.legifrance.gouv.fr/loda/id/JORFTEXT000020879475",
      },
      {
        intitule: "Articles L.6312-1 et suivants du code de la santé publique",
        url: "https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006072665/LEGISCTA000006190614/",
      },
    ],
    termeReliesSlug: ["agrement-ars", "cpam", "conventionnement-cpam", "finess-geographique"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "cpam",
    terme: "CPAM",
    termeComplet: "Caisse Primaire d'Assurance Maladie",
    categorie: "reglementation",
    abreviation: "CPAM",
    definitionCourte:
      "Organisme de Sécurité sociale qui rembourse les soins et transports médicaux. C'est la CPAM qui signe les conventions avec les ambulanciers, VSL et taxis conventionnés.",
    definitionLongue:
      "La Caisse Primaire d'Assurance Maladie (CPAM) est l'organisme local de la branche maladie de la Sécurité sociale. Il en existe une par département, chapeautée par la CNAM (Caisse Nationale de l'Assurance Maladie).\n\nDans le domaine du transport sanitaire, la CPAM : signe les conventions de conventionnement avec les entreprises de transport sanitaire (ambulances, VSL) et les taxis, fixe les tarifs de remboursement opposables, contrôle la facturation des feuilles de transport, rembourse les prestations de transport sur prescription médicale (65 % en régime normal, 100 % pour les ALD et certaines situations médicales), et détecte les fraudes et abus (contrôle des indus).\n\nLa conventionnement CPAM est distinct de l'agrément ARS : une entreprise peut être agréée ARS sans être conventionnée CPAM (pas de remboursement Sécurité sociale dans ce cas).",
    sourcesLegales: [
      {
        intitule: "Code de la sécurité sociale — Articles L.322-1 et suivants sur le remboursement des transports",
        url: "https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006073189/LEGISCTA000006172575/",
      },
    ],
    termeReliesSlug: ["ars-agence-regionale-sante", "conventionnement-cpam", "tiers-payant", "convention-nationale-taxis", "remboursement-transport"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "finess-geographique",
    terme: "FINESS géographique",
    termeComplet: "Numéro FINESS géographique",
    categorie: "administratif",
    definitionCourte:
      "Identifiant à 9 chiffres attribué par l'ATIH à chaque établissement de santé ou médico-social, identifiant un site géographique d'activité.",
    definitionLongue:
      "Le numéro FINESS (Fichier National des Établissements Sanitaires et Sociaux) est géré par l'Agence Technique de l'Information sur l'Hospitalisation (ATIH). Il existe deux types de numéros FINESS :\n\n- Le FINESS géographique : identifie un établissement à une adresse précise. Une entreprise de transport sanitaire ayant plusieurs sites aura un FINESS géographique par site.\n- Le FINESS juridique : identifie la personne morale (entreprise) indépendamment du lieu d'activité.\n\nLe FINESS géographique est structuré en 9 chiffres : les deux premiers correspondent au code département, suivis de 6 chiffres d'identification et d'une clé de contrôle. Il est obligatoirement mentionné sur les feuilles de transport et dans les déclarations à la CPAM.",
    sourcesLegales: [
      {
        intitule: "Référentiel FINESS — Agence Technique de l'Information sur l'Hospitalisation",
        url: "https://finess.esante.gouv.fr",
      },
    ],
    termeReliesSlug: ["finess-juridique", "atih", "agrement-ars", "cpam"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "finess-juridique",
    terme: "FINESS juridique",
    termeComplet: "Numéro FINESS juridique",
    categorie: "administratif",
    definitionCourte:
      "Identifiant FINESS attribué à la personne morale (société ou association) gérant un ou plusieurs établissements de santé ou médico-sociaux.",
    definitionLongue:
      "Le FINESS juridique est attribué à l'entité légale (SAS, SARL, SA, association, etc.) qui gère un ou plusieurs établissements sanitaires ou médico-sociaux. Une entreprise de transport sanitaire ayant un seul site aura un FINESS juridique identique à son FINESS géographique. En cas de multi-sites, le FINESS juridique est unique pour tous les sites rattachés.\n\nLe FINESS juridique est utilisé dans les déclarations administratives, les conventions CPAM et la facturation électronique SEFi.",
    sourcesLegales: [
      {
        intitule: "Référentiel FINESS — ATIH",
        url: "https://finess.esante.gouv.fr",
      },
    ],
    termeReliesSlug: ["finess-geographique", "atih", "siret", "cpam"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "agrement-ars",
    terme: "Agrément ARS",
    termeComplet: "Agrément de mise en service d'une entreprise de transport sanitaire",
    categorie: "reglementation",
    definitionCourte:
      "Autorisation délivrée par l'ARS permettant à une entreprise de pratiquer le transport sanitaire. Conditionne l'activité légale et le conventionnement CPAM.",
    definitionLongue:
      "L'agrément de transport sanitaire est une autorisation administrative obligatoire délivrée par l'Agence Régionale de Santé (ARS) pour exercer l'activité de transport sanitaire terrestre. Il est régi par les articles L.6312-1 et R.6312-1 et suivants du code de la santé publique.\n\nPour obtenir l'agrément, l'entreprise doit justifier : d'une aptitude professionnelle du dirigeant (DEA ou équivalent), de la possession d'au moins deux véhicules agréés conformes (dont au moins une ambulance de type A), d'une permanence de personnel qualifié, d'un lieu de remisage des véhicules, et d'une assurance responsabilité civile spécifique.\n\nL'agrément est renouvelable et soumis à contrôle périodique par l'ARS. Son retrait ou sa suspension peut être prononcé en cas de manquements graves aux conditions d'exploitation.",
    sourcesLegales: [
      {
        intitule: "Articles L.6312-1 et R.6312-1 du code de la santé publique",
        url: "https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006072665/LEGISCTA000006190614/",
      },
    ],
    termeReliesSlug: ["ars-agence-regionale-sante", "conventionnement-cpam", "cpam", "finess-geographique"],
    exemples: [
      "Une société créant une nouvelle entreprise de transport sanitaire doit obtenir l'agrément ARS avant de commencer toute activité.",
    ],
    miseAJour: "2026-06-28",
  },
  {
    slug: "conventionnement-cpam",
    terme: "Conventionnement CPAM",
    termeComplet: "Convention de transport sanitaire avec la CPAM",
    categorie: "reglementation",
    definitionCourte:
      "Accord entre une entreprise de transport sanitaire (ou un taxi) et la CPAM locale, permettant le remboursement des transports médicaux par l'Assurance maladie.",
    definitionLongue:
      "Le conventionnement CPAM est un contrat bilatéral (entreprise / CPAM) qui encadre les conditions financières et administratives des transports médicaux remboursables. Il est distinct de l'agrément ARS : une entreprise agréée mais non conventionnée ne peut pas facturer à la CPAM.\n\nLa convention fixe : les tarifs de remboursement applicables (forfaits kilométriques, majorations de nuit/week-end/urgence), les modalités de facturation (FSE électronique via SEFi), les obligations de tiers payant, les conditions de transport partagé, et les règles de contrôle et de sanction en cas d'abus.\n\nLe conventionnement est accordé dans le cadre de la convention nationale (signée entre la CNAM et les syndicats professionnels) ou d'une convention locale. Il peut être suspendu ou résilié par la CPAM en cas de facturation frauduleuse ou de non-respect des obligations.",
    sourcesLegales: [
      {
        intitule: "Convention nationale du transport sanitaire — ameli.fr",
        url: "https://www.ameli.fr/professionnel-de-sante/transport-sanitaire/exercer/conventionnement",
      },
    ],
    termeReliesSlug: ["cpam", "agrement-ars", "tiers-payant", "sefi-systeme-electronique-facturation"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "convention-nationale-taxis",
    terme: "Convention nationale des taxis",
    termeComplet: "Convention nationale organisant les rapports entre les taxis et l'Assurance Maladie",
    categorie: "reglementation",
    definitionCourte:
      "Texte conventionnel signé entre la CNAM et les syndicats de taxis, définissant les tarifs et conditions de remboursement des transports médicaux effectués par taxi.",
    definitionLongue:
      "La convention nationale des taxis est le cadre réglementaire définissant les conditions dans lesquelles les taxis peuvent effectuer des transports médicaux remboursés par l'Assurance maladie. Elle est signée entre la Caisse Nationale de l'Assurance Maladie (CNAM) et les syndicats représentatifs des artisans taxis.\n\nSon contenu comprend : les critères d'éligibilité au conventionnement pour un taxi (conformité du véhicule, formation du conducteur), les tarifs de remboursement opposables (par département), les obligations de facturation et de tiers payant, les conditions d'adhésion et de retrait, et les modalités de contrôle.\n\nContrairement à une convention individuelle entre un transporteur et une CPAM, la convention nationale s'applique uniformément dans toute la France avec des adaptations tarifaires locales (avenants départementaux).",
    sourcesLegales: [
      {
        intitule: "Convention nationale des taxis — Ameli professionnels",
        url: "https://www.ameli.fr/medecin/exercice-liberal/transport-sanitaire/taxis",
      },
    ],
    termeReliesSlug: ["taxi-conventionne", "cpam", "conventionnement-cpam", "tiers-payant"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "atsu-association-transport-sanitaire-urgent",
    terme: "ATSU",
    termeComplet: "Association (ou garde) de Transport Sanitaire Urgent",
    categorie: "reglementation",
    abreviation: "ATSU",
    definitionCourte:
      "Système de garde organisé dans chaque département regroupant les entreprises privées de transport sanitaire pour assurer la permanence des soins pré-hospitaliers sur réquisition du SAMU.",
    definitionLongue:
      "L'ATSU (parfois dénommée garde ambulancière ou garde départementale) est le système de garde organisé par les entreprises privées de transport sanitaire sous la supervision de l'ARS pour assurer une couverture 24h/24 et 7j/7 dans le département. Elle est déclenchée par le médecin régulateur du SAMU-Centre 15 pour les urgences ne relevant pas d'un SMUR mais nécessitant un transport rapide.\n\nLe fonctionnement repose sur la rotation des entreprises agréées qui s'inscrivent dans un planning de garde. Pendant leur tour de garde, les entreprises doivent maintenir un véhicule et un équipage disponibles avec un temps de départ inférieur à 15 minutes (en zone urbaine) ou à 30 minutes (en zone rurale) après l'alerte du Centre 15.\n\nLe forfait de garde versé par la CPAM compense partiellement le coût de l'astreinte. Les missions effectuées pendant la garde sont facturées selon les tarifs de l'urgence prévus par la convention.",
    sourcesLegales: [
      {
        intitule: "Décret n°2007-656 du 30 avril 2007 relatif à la garde des transporteurs sanitaires",
        url: "https://www.legifrance.gouv.fr/loda/id/JORFTEXT000000462540",
      },
    ],
    termeReliesSlug: ["samu-centre-15", "garde-departementale-atsu", "ars-agence-regionale-sante", "ambulancier-diplome"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "garde-departementale-atsu",
    terme: "Garde départementale",
    termeComplet: "Garde départementale de transport sanitaire (ATSU)",
    categorie: "reglementation",
    definitionCourte:
      "Organisation de la permanence du transport sanitaire urgent dans un département, avec un tableau de garde des entreprises agréées transmis au SAMU.",
    definitionLongue:
      "La garde départementale est le dispositif concret d'organisation de la permanence ATSU. Elle repose sur un tableau de garde mensuel établi par les représentants des entreprises de transport sanitaire du département (souvent via une chambre syndicale ou une URPS) et validé par l'ARS et le SAMU.\n\nChaque entreprise participante est affectée à des plages horaires de garde (nuit, week-end, jours fériés). La CPAM verse une indemnité de garde pour chaque heure d'astreinte. En cas de défaut de couverture (aucune entreprise disponible), la carence est signalée au SAMU et peut être assurée par les pompiers (SDIS) avec facturation déportée à l'Assurance maladie.",
    sourcesLegales: [],
    termeReliesSlug: ["atsu-association-transport-sanitaire-urgent", "samu-centre-15", "ars-agence-regionale-sante", "cpam"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "code-sante-publique-l6312",
    terme: "Article L.6312",
    termeComplet: "Article L.6312-1 du code de la santé publique",
    categorie: "reglementation",
    definitionCourte:
      "Article fondateur du transport sanitaire dans le droit français, définissant les obligations d'agrément ARS et les conditions d'exercice.",
    definitionLongue:
      "L'article L.6312-1 du code de la santé publique pose les bases légales du transport sanitaire en France. Il dispose que 'les transports sanitaires sont effectués par des entreprises qui, après avoir satisfait à des conditions fixées par voie réglementaire, ont obtenu l'agrément de l'autorité compétente'.\n\nL'article L.6312-4 précise les qualifications professionnelles requises pour le personnel (DEA pour les ambulanciers). L'article L.6312-5 encadre les pouvoirs de contrôle et de sanction des ARS. Ces articles constituent le socle sur lequel repose l'ensemble de la réglementation du transport sanitaire terrestre.",
    sourcesLegales: [
      {
        intitule: "Articles L.6312-1 à L.6312-5 du code de la santé publique",
        url: "https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006072665/LEGISCTA000006190614/",
      },
    ],
    termeReliesSlug: ["agrement-ars", "ars-agence-regionale-sante", "code-sante-publique-r6312-7"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "code-sante-publique-r6312-7",
    terme: "Article R.6312-7",
    termeComplet: "Article R.6312-7 du code de la santé publique",
    categorie: "reglementation",
    definitionCourte:
      "Article réglementaire précisant les conditions de qualification des conducteurs de VSL et ambulanciers auxiliaires.",
    definitionLongue:
      "L'article R.6312-7 du code de la santé publique précise les conditions de qualification requises pour les conducteurs de véhicules sanitaires légers (VSL). Il établit que le conducteur de VSL doit être titulaire du diplôme d'État d'auxiliaire ambulancier (DEAA) ou d'un titre reconnu équivalent par arrêté ministériel.\n\nCet article est fréquemment cité dans les contrôles ARS et les procédures de conventionnement CPAM car il conditionne la légalité des transports effectués en VSL.",
    sourcesLegales: [
      {
        intitule: "Article R.6312-7 du code de la santé publique",
        url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000006916428",
      },
    ],
    termeReliesSlug: ["vsl-vehicule-sanitaire-leger", "deaa-diplome-etat-auxiliaire-ambulancier", "auxiliaire-ambulancier", "agrement-ars"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "avenant-10-convention",
    terme: "Avenant n°10",
    termeComplet: "Avenant n°10 à la convention nationale de transport sanitaire",
    categorie: "reglementation",
    definitionCourte:
      "Avenant à la convention nationale des transporteurs sanitaires signé avec la CNAM, modifiant les tarifs et les conditions de transport partagé.",
    definitionLongue:
      "Les avenants à la convention nationale du transport sanitaire sont des modifications négociées entre la CNAM et les syndicats professionnels (CNAMbulance, FNTS, etc.). L'avenant n°10 a notamment révisé les modalités du transport partagé obligatoire (partage du VSL imposé par la CPAM dès que plusieurs patients se rendent au même établissement à la même heure), les tarifs kilométriques, et les conditions de facturation des majorations de nuit et week-end.\n\nChaque avenant fait l'objet d'une publication au Journal Officiel et s'impose à toutes les entreprises conventionnées.",
    sourcesLegales: [
      {
        intitule: "Avenants à la convention nationale transport sanitaire — ameli.fr",
        url: "https://www.ameli.fr/professionnel-de-sante/transport-sanitaire/exercer/convention-nationale",
      },
    ],
    termeReliesSlug: ["convention-nationale-taxis", "conventionnement-cpam", "transport-partage", "cpam"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "samu-centre-15",
    terme: "SAMU-Centre 15",
    termeComplet: "Service d'Aide Médicale Urgente — Centre 15",
    categorie: "reglementation",
    abreviation: "SAMU",
    definitionCourte:
      "Service hospitalier assurant la régulation médicale des appels d'urgence via le numéro 15. Il coordonne l'intervention des ambulances privées (ATSU), des SMUR et des pompiers.",
    definitionLongue:
      "Le SAMU-Centre 15 est un service hospitalier créé par la loi du 6 janvier 1986 relative à l'aide médicale urgente et aux transports sanitaires. Il est rattaché à un hôpital de référence dans chaque département. Il est accessible 24h/24 par le numéro national 15.\n\nSa mission principale est la régulation médicale : analyser chaque appel, décider du niveau de réponse adapté (conseil médical, médecin généraliste, ambulance privée ATSU, SMUR, pompiers) et coordonner les moyens. Il tient le rôle de chef d'orchestre de la médecine d'urgence pré-hospitalière.\n\nPour les entreprises de transport sanitaire, le SAMU est le donneur d'ordre principal pour les missions urgentes. La liaison radio ou téléphonique avec le Centre 15 est obligatoire pendant les plages de garde ATSU.",
    sourcesLegales: [
      {
        intitule: "Loi n°86-11 du 6 janvier 1986 relative à l'aide médicale urgente et aux transports sanitaires",
        url: "https://www.legifrance.gouv.fr/loda/id/JORFTEXT000000319630",
      },
    ],
    termeReliesSlug: ["smur", "atsu-association-transport-sanitaire-urgent", "regulateur-samu", "arm-assistant-regulation-medicale"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "arrete-10-fevrier-2009",
    terme: "Arrêté du 10 février 2009",
    termeComplet: "Arrêté du 10 février 2009 fixant les dispositions relatives aux transports sanitaires terrestres",
    categorie: "reglementation",
    definitionCourte:
      "Texte réglementaire fixant les équipements obligatoires des ambulances et VSL, les règles de désinfection des véhicules et les conditions d'exercice du transport sanitaire.",
    definitionLongue:
      "L'arrêté du 10 février 2009 est le texte de référence pour les équipements des véhicules sanitaires terrestres. Il précise pour chaque type de véhicule (ambulance A, B, VSL) la liste exhaustive des équipements obligatoires embarqués, les règles de désinfection et de traçabilité, les obligations de marquage des véhicules et les uniformes du personnel.\n\nIl a remplacé l'arrêté du 20 mars 1990 et a été complété par plusieurs arrêtés modificatifs. Les entreprises de transport sanitaire doivent s'y conformer sous peine de retrait d'agrément ARS.",
    sourcesLegales: [
      {
        intitule: "Arrêté du 10 février 2009 relatif aux transports sanitaires terrestres",
        url: "https://www.legifrance.gouv.fr/loda/id/JORFTEXT000020252028",
      },
    ],
    termeReliesSlug: ["agrement-ars", "ambulance-type-a", "vsl-vehicule-sanitaire-leger", "norme-en-1789"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "decret-2007-656",
    terme: "Décret du 30 avril 2007",
    termeComplet: "Décret n°2007-656 relatif aux conditions techniques de fonctionnement",
    categorie: "reglementation",
    definitionCourte:
      "Décret précisant les conditions techniques d'agrément des entreprises de transport sanitaire et les règles d'organisation de la garde ambulancière.",
    definitionLongue:
      "Le décret n°2007-656 du 30 avril 2007 est la pièce centrale de la réglementation technique du transport sanitaire privé. Il précise les conditions auxquelles doivent satisfaire les entreprises pour obtenir et maintenir leur agrément ARS, notamment en termes d'effectifs qualifiés, de dotation minimale en véhicules, d'équipements, de locaux, et d'organisation de la garde.\n\nIl a été modifié à plusieurs reprises pour prendre en compte les évolutions technologiques (SEFi, géolocalisation) et les nouvelles exigences de qualité des soins.",
    sourcesLegales: [
      {
        intitule: "Décret n°2007-656 du 30 avril 2007 — Légifrance",
        url: "https://www.legifrance.gouv.fr/loda/id/JORFTEXT000000462540",
      },
    ],
    termeReliesSlug: ["agrement-ars", "ars-agence-regionale-sante", "atsu-association-transport-sanitaire-urgent"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "schema-regional-sante",
    terme: "Schéma régional de santé",
    termeComplet: "Schéma régional de santé (SRS)",
    categorie: "reglementation",
    abreviation: "SRS",
    definitionCourte:
      "Document de planification sanitaire établi par l'ARS pour 5 ans, définissant les objectifs et les besoins en offre de soins et transport sanitaire dans la région.",
    definitionLongue:
      "Le Schéma Régional de Santé (SRS) est le principal outil de planification de l'ARS. Établi pour une période de 5 ans dans le cadre du Projet Régional de Santé (PRS), il définit les objectifs d'évolution de l'offre de soins, incluant le transport sanitaire.\n\nPour le transport sanitaire, le SRS peut notamment : encadrer le nombre d'autorisations d'entreprises dans une zone géographique (carte sanitaire), définir des zones de densification ou de restriction selon les besoins démographiques et les temps de trajet, et fixer des objectifs qualité pour les gardes ATSU.",
    sourcesLegales: [
      {
        intitule: "Articles L.1434-1 et suivants du code de la santé publique — Schéma régional de santé",
        url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000038883682",
      },
    ],
    termeReliesSlug: ["ars-agence-regionale-sante", "agrement-ars"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "carte-professionnelle-ambulancier",
    terme: "Carte professionnelle",
    termeComplet: "Carte professionnelle d'ambulancier",
    categorie: "reglementation",
    definitionCourte:
      "Document officiel délivré par la CPAM attestant du conventionnement et de la qualification d'un ambulancier ou conducteur de VSL, à présenter lors des transports.",
    definitionLongue:
      "La carte professionnelle d'ambulancier ou de conducteur de véhicule sanitaire est un document délivré par la CPAM ou l'ARS certifiant que son titulaire est habilité à effectuer des transports sanitaires remboursés par l'Assurance maladie. Elle doit être portée visiblement et présentée sur demande.\n\nElle mentionne : l'identité du professionnel, son diplôme (DEA ou DEAA), le numéro FINESS de l'entreprise, la date de validité et l'organisme émetteur. Son absence lors d'un transport peut être sanctionnée par un refus de prise en charge CPAM.",
    sourcesLegales: [],
    termeReliesSlug: ["dea-diplome-etat-ambulancier", "deaa-diplome-etat-auxiliaire-ambulancier", "cpam", "finess-geographique"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "carence-ambulanciere",
    terme: "Carence ambulancière",
    termeComplet: "Carence ambulancière",
    categorie: "reglementation",
    definitionCourte:
      "Situation où aucune entreprise privée de transport sanitaire n'est disponible pour répondre à un appel SAMU en dehors des heures de garde, forçant le recours aux pompiers.",
    definitionLongue:
      "La carence ambulancière se produit lorsqu'aucune ambulance privée n'est disponible en dehors des plages de garde ATSU ou lorsque la demande excède la capacité disponible. Dans ce cas, le médecin régulateur du Centre 15 peut réquisitionner les pompiers (SDIS) pour assurer le transport, à condition que leur intervention soit médicalement justifiée.\n\nLe coût de l'intervention SDIS en carence ambulancière est facturé à la CPAM selon un tarif réglementé. Les carence répétées peuvent entraîner des pénalités pour les entreprises défaillantes ou une révision du tableau de garde par l'ARS.",
    sourcesLegales: [],
    termeReliesSlug: ["atsu-association-transport-sanitaire-urgent", "garde-departementale-atsu", "samu-centre-15"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "plan-blanc",
    terme: "Plan blanc",
    termeComplet: "Plan blanc hospitalier",
    categorie: "reglementation",
    definitionCourte:
      "Plan d'urgence hospitalier activé en cas d'afflux massif de victimes. Implique le renforcement des capacités de transport sanitaire vers l'hôpital.",
    definitionLongue:
      "Le plan blanc est le plan d'urgence interne des établissements de santé déclenché en situation exceptionnelle (accidents collectifs, attentats, pandémie, catastrophe naturelle). Il est défini par la circulaire du 3 mai 2002 relative à l'organisation des soins médicaux en cas de catastrophe.\n\nDans le cadre du plan blanc, les entreprises de transport sanitaire privées peuvent être réquisitionnées par le préfet pour assurer les transports massifs de victimes. Le SAMU coordonne la répartition des patients entre les hôpitaux selon les capacités d'accueil disponibles.",
    sourcesLegales: [],
    termeReliesSlug: ["samu-centre-15", "smur", "atsu-association-transport-sanitaire-urgent"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "taux-de-controle-cpam",
    terme: "Contrôle CPAM",
    termeComplet: "Contrôle des feuilles de transport par la CPAM",
    categorie: "reglementation",
    definitionCourte:
      "Procédure de vérification par la CPAM de la conformité des feuilles de transport facturées par les entreprises de transport sanitaire.",
    definitionLongue:
      "La CPAM dispose d'un pouvoir de contrôle des facturations de transport sanitaire. Ce contrôle peut être documentaire (vérification des feuilles de transport), informatique (analyse des anomalies de facturation) ou sur site (audit de l'entreprise).\n\nLes motifs courants de rejet ou de demande d'indu comprennent : absence ou erreur de prescription médicale, prescription non signée par un médecin autorisé, transport sans accord préalable pour un trajet long, absence de signature du patient, tarification incorrecte, transport non justifié médicalement.\n\nEn cas de fraude avérée, la CPAM peut demander le remboursement des indus, prononcer des pénalités financières, et saisir l'ARS pour une procédure de retrait d'agrément.",
    sourcesLegales: [],
    termeReliesSlug: ["indu", "cpam", "feuille-de-soins-electronique", "bon-de-transport"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "accord-prealable-transport",
    terme: "Accord préalable",
    termeComplet: "Accord préalable de la CPAM pour transport sanitaire",
    categorie: "reglementation",
    definitionCourte:
      "Autorisation demandée par l'assuré ou le médecin à la CPAM avant d'effectuer certains transports longs ou répétitifs, conditionnant le remboursement.",
    definitionLongue:
      "Pour certains transports (trajets aller-retour supérieurs à 150 km, transports en série de 4 ou plus sur 2 mois), le code de la sécurité sociale impose l'obtention d'un accord préalable de la CPAM avant d'effectuer le transport. Cet accord est demandé par le médecin prescripteur via un formulaire spécifique (cerfa n°12535).\n\nSans accord préalable, le remboursement peut être refusé ou réduit. L'accord préalable est différent du simple bon de transport et ne dispense pas de la prescription médicale.",
    sourcesLegales: [
      {
        intitule: "Article R.322-10 du code de la sécurité sociale",
        url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000006749673",
      },
    ],
    termeReliesSlug: ["bon-de-transport", "prescription-medicale-transport", "cpam", "remboursement-transport"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "contrat-objectifs-moyens",
    terme: "Contrat d'objectifs et de moyens",
    termeComplet: "Contrat d'objectifs et de moyens (COM) transport sanitaire",
    categorie: "reglementation",
    definitionCourte:
      "Contrat passé entre une ARS et une entreprise de transport sanitaire ou un groupement définissant des objectifs de qualité en contrepartie de financements spécifiques.",
    definitionLongue:
      "Les contrats d'objectifs et de moyens (COM) sont des outils contractuels utilisés par les ARS pour améliorer la qualité et la coordination du transport sanitaire. Ils peuvent inclure des objectifs de délai d'intervention, de formation du personnel, d'équipement des véhicules, ou de participation à la garde ATSU.\n\nEn contrepartie, l'ARS peut accorder des facilités administratives (renouvellement simplifié d'agrément) ou des financements complémentaires (dans le cadre du Fonds d'Intervention Régionale, FIR).",
    sourcesLegales: [],
    termeReliesSlug: ["ars-agence-regionale-sante", "agrement-ars", "atsu-association-transport-sanitaire-urgent"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "transport-sanitaire-urgent",
    terme: "Transport sanitaire urgent",
    termeComplet: "Transport sanitaire urgent (TSU)",
    categorie: "reglementation",
    abreviation: "TSU",
    definitionCourte:
      "Transport prescrit en urgence par le SAMU ou un médecin pour une situation mettant en jeu le pronostic vital ou fonctionnel du patient. Bénéficie d'un tarif majoré.",
    definitionLongue:
      "Le transport sanitaire urgent (TSU) est un transport déclenché en urgence, généralement sur appel du Centre 15, pour une situation médicale ne pouvant attendre. Il se distingue du transport programmé par son délai d'intervention très court (15 à 20 minutes maximum en zone urbaine).\n\nSur le plan tarifaire, le TSU bénéficie d'une majoration spécifique (MU : majoration urgence) sur le tarif de base de la convention. Cette majoration compense le coût de disponibilité permanente (garde ATSU) et les frais de déclenchement urgent.",
    sourcesLegales: [],
    termeReliesSlug: ["atsu-association-transport-sanitaire-urgent", "samu-centre-15", "cpam", "forfait-transport"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "transport-sanitaire-programme",
    terme: "Transport sanitaire programmé",
    termeComplet: "Transport sanitaire programmé (TSP)",
    categorie: "reglementation",
    definitionCourte:
      "Transport prévu à l'avance sur prescription médicale, pour des soins réguliers (dialyse, radiothérapie, chimiothérapie) ou des consultations planifiées.",
    definitionLongue:
      "Le transport sanitaire programmé est la forme la plus courante de transport remboursé par la CPAM. Il est prescrit à l'avance par un médecin pour des soins réguliers ou des consultations. La prescription peut être valable pour une ou plusieurs séances (prescription itérative).\n\nLe transport programmé n'ouvre pas droit à la majoration urgence mais peut ouvrir droit à d'autres majorations (nuit, dimanche, jours fériés si les soins sont programmés à ces horaires). Il représente l'essentiel du chiffre d'affaires des entreprises de transport sanitaire privées.",
    sourcesLegales: [],
    termeReliesSlug: ["transport-iteratif", "prescription-medicale-transport", "bon-de-transport", "dialyse"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "transport-inter-hospitalier",
    terme: "TIH",
    termeComplet: "Transport Inter-Hospitalier",
    categorie: "reglementation",
    abreviation: "TIH",
    definitionCourte:
      "Transport d'un patient d'un établissement hospitalier vers un autre, pouvant être médicalisé (TIHAM) ou non médicalisé selon l'état clinique du patient.",
    definitionLongue:
      "Le transport inter-hospitalier (TIH) désigne tout transport de patient entre deux établissements de santé. Selon l'état clinique du patient, il peut être :\n\n- Non médicalisé : réalisé par une ambulance privée A1 ou B avec équipage DEA/auxiliaire, sans médecin à bord.\n- Médicalisé (TIHAM) : réalisé avec une équipe SMUR (médecin + infirmière + ambulancier) pour les patients instables ou nécessitant une surveillance médicale continue.\n\nLe choix du type de transport est décidé par le médecin prescripteur de l'établissement d'envoi, souvent en accord avec le médecin régulateur du Centre 15.",
    sourcesLegales: [],
    termeReliesSlug: ["transport-inter-hospitalier-medicalise", "smur", "ambulance-type-b"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "transport-inter-hospitalier-medicalise",
    terme: "TIHAM",
    termeComplet: "Transport Inter-Hospitalier Médicalisé",
    categorie: "reglementation",
    abreviation: "TIHAM",
    definitionCourte:
      "Transport entre deux établissements hospitaliers avec équipe médicale SMUR embarquée, pour les patients instables ou nécessitant une réanimation continue.",
    definitionLongue:
      "Le TIHAM est la forme la plus exigeante du transport inter-hospitalier. Il est réalisé par une équipe SMUR complète (médecin, infirmière, ambulancier) embarquée dans une ambulance type B ou C. Il concerne les patients dont l'état clinique nécessite une surveillance et des soins médicaux continus pendant le transfert (patients en réanimation, polytraumatisés, AVC en phase aiguë, insuffisances respiratoires sévères).\n\nLe TIHAM est financé par les forfaits T2A des hôpitaux et non directement par la CPAM à titre individual. La coordination avec le Centre 15 est obligatoire.",
    sourcesLegales: [],
    termeReliesSlug: ["smur", "ambulance-type-b", "transport-inter-hospitalier", "samu-centre-15"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "loi-hpst",
    terme: "Loi HPST",
    termeComplet: "Loi Hôpital, Patients, Santé et Territoires",
    categorie: "reglementation",
    definitionCourte:
      "Loi du 21 juillet 2009 ayant créé les ARS et réformé le système de santé français, avec des implications directes sur l'organisation du transport sanitaire.",
    definitionLongue:
      "La loi n°2009-879 du 21 juillet 2009, dite loi HPST (Hôpital, Patients, Santé et Territoires), a profondément réformé l'organisation du système de santé français. Elle a notamment créé les Agences Régionales de Santé (ARS), regroupant en une seule structure les anciennes ARH (Agences Régionales de l'Hospitalisation), URCAM, DRASS et DDASS.\n\nPour le transport sanitaire, la loi HPST a renforcé le rôle de l'ARS comme autorité unique de régulation, en lui confiant la délivrance et le contrôle des agréments. Elle a également renforcé l'intégration du transport sanitaire dans la planification régionale de santé.",
    sourcesLegales: [
      {
        intitule: "Loi n°2009-879 du 21 juillet 2009 portant réforme de l'hôpital",
        url: "https://www.legifrance.gouv.fr/loda/id/JORFTEXT000020879475",
      },
    ],
    termeReliesSlug: ["ars-agence-regionale-sante", "agrement-ars", "schema-regional-sante"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "droit-de-renoncement",
    terme: "Droit de renonciation",
    termeComplet: "Droit de renonciation au transport sanitaire remboursé",
    categorie: "reglementation",
    definitionCourte:
      "Possibilité pour un patient de renoncer au transport remboursé par la CPAM pour choisir un transporteur non conventionné, sans aide au remboursement.",
    definitionLongue:
      "Le droit de renonciation permet à un patient de refuser le transport sanitaire proposé par la CPAM (VSL ou taxi conventionné) et d'en choisir un autre (plus confortable, plus rapide, etc.) sans prise en charge par l'Assurance maladie. Dans ce cas, le patient supporte l'intégralité du coût du transport.\n\nCe droit s'exerce librement mais le médecin doit avoir prescrit le mode de transport le moins onéreux médicalement justifié. Si le patient demande un mode plus coûteux (ambulance au lieu de VSL par exemple), la différence peut être à sa charge selon les circonstances.",
    sourcesLegales: [],
    termeReliesSlug: ["prescription-medicale-transport", "remboursement-transport", "cpam"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "signalement-non-conformite",
    terme: "Signalement de non-conformité",
    termeComplet: "Signalement de non-conformité à l'ARS",
    categorie: "reglementation",
    definitionCourte:
      "Procédure par laquelle un ambulancier, un patient ou un professionnel de santé signale à l'ARS une infraction aux règles d'exercice du transport sanitaire.",
    definitionLongue:
      "L'ARS dispose d'un dispositif de réception des signalements de non-conformité concernant les entreprises de transport sanitaire. Ces signalements peuvent porter sur : la non-qualification du personnel, le mauvais état des véhicules, le non-respect des protocoles de désinfection, les pratiques de facturation abusives, ou le non-respect des délais de garde.\n\nSuite à un signalement, l'ARS peut diligenter un contrôle sur place et, si les manquements sont avérés, prononcer une mise en demeure, une suspension ou un retrait d'agrément.",
    sourcesLegales: [],
    termeReliesSlug: ["agrement-ars", "ars-agence-regionale-sante"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "urbanisme-sanitaire",
    terme: "Urbanisme sanitaire",
    termeComplet: "Planification de l'urbanisme sanitaire",
    categorie: "reglementation",
    definitionCourte:
      "Organisation de l'offre de transport sanitaire sur un territoire, définie dans le Schéma Régional de Santé de l'ARS pour éviter les déserts sanitaires.",
    definitionLongue:
      "L'urbanisme sanitaire appliqué au transport désigne la planification territoriale de l'offre de transport sanitaire par les ARS. L'objectif est d'assurer une couverture suffisante sur l'ensemble du territoire, en évitant les zones de sous-densité (déserts sanitaires) tout en évitant les surcapacités qui nuisent à la rentabilité des entreprises.\n\nLes ARS peuvent délimiter des zones de garde prioritaires, inciter les entreprises à s'installer dans des zones sous-couvertes via des aides à l'installation, et restreindre les agréments dans les zones déjà bien couvertes.",
    sourcesLegales: [],
    termeReliesSlug: ["schema-regional-sante", "ars-agence-regionale-sante", "agrement-ars"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "declaration-activite-annuelle",
    terme: "Déclaration d'activité annuelle",
    termeComplet: "Déclaration annuelle d'activité des entreprises de transport sanitaire",
    categorie: "reglementation",
    definitionCourte:
      "Document obligatoire à transmettre chaque année à l'ARS, récapitulant l'activité de transport (nombre de missions, types de véhicules, effectifs).",
    definitionLongue:
      "Les entreprises de transport sanitaire agréées sont tenues de transmettre chaque année à leur ARS une déclaration d'activité récapitulant : le nombre de véhicules en service, les qualifications du personnel, les types de transports effectués (urgence, programmé, TIH), le nombre de missions réalisées, et les données financières pertinentes.\n\nCette déclaration permet à l'ARS de suivre l'évolution de l'offre de transport dans sa région, d'identifier les entreprises en difficulté et de planifier les ajustements nécessaires.",
    sourcesLegales: [],
    termeReliesSlug: ["agrement-ars", "ars-agence-regionale-sante", "finess-geographique"],
    miseAJour: "2026-06-28",
  },

  // ────────────────────────────────────────────────────────────────────
  // FINANCEMENT (35 termes)
  // ────────────────────────────────────────────────────────────────────
  {
    slug: "ald-affection-longue-duree",
    terme: "ALD",
    termeComplet: "Affection de Longue Durée",
    categorie: "financement",
    abreviation: "ALD",
    definitionCourte:
      "Maladie chronique grave ouvrant droit à une prise en charge à 100% par l'Assurance maladie, notamment pour les soins et transports médicaux en lien avec l'ALD.",
    definitionLongue:
      "L'Affection de Longue Durée (ALD) est une maladie chronique grave reconnue par la Sécurité sociale comme nécessitant un traitement prolongé et coûteux. Il existe 30 ALD « exonérantes » listées (ALD30), plus une liste des ALD « hors liste » pour les cas graves non inclus dans les 30.\n\nPour le transport sanitaire, l'ALD présente deux avantages majeurs : le taux de remboursement des transports en lien avec l'ALD passe à 100% (contre 65% en régime normal), et le tiers payant est automatiquement appliqué (pas d'avance de frais pour le patient). La prescription de transport doit mentionner explicitement le lien entre le transport et l'ALD pour bénéficier du taux à 100%.\n\nExemples d'ALD fréquentes ouvrant droit à des transports réguliers : insuffisance rénale chronique (dialyse), cancer (radiothérapie, chimiothérapie), sclérose en plaques, insuffisance cardiaque grave.",
    sourcesLegales: [
      {
        intitule: "Article L.322-3 du code de la sécurité sociale — Exonération du ticket modérateur pour ALD",
        url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000041446829",
      },
      {
        intitule: "Ameli.fr — Affections de longue durée (ALD)",
        url: "https://www.ameli.fr/assure/droits-demarches/maladie-accident-hospitalisation/affection-longue-duree-ald/affection-longue-duree-ald-definition",
      },
    ],
    termeReliesSlug: ["ald30", "remboursement-transport", "tiers-payant", "prescription-medicale-transport", "dialyse"],
    exemples: [
      "Un patient atteint de cancer en traitement par radiothérapie (ALD 30) bénéficie d'un transport quotidien remboursé à 100% sans avance de frais.",
    ],
    miseAJour: "2026-06-28",
  },
  {
    slug: "ald30",
    terme: "ALD30",
    termeComplet: "Liste des 30 affections de longue durée exonérantes",
    categorie: "financement",
    definitionCourte:
      "Les 30 maladies chroniques graves listées par décret ouvrant droit à une prise en charge à 100% par l'Assurance maladie, incluant le transport.",
    definitionLongue:
      "La liste des 30 ALD exonérantes est définie par l'article D.322-1 du code de la sécurité sociale. Elle comprend notamment : diabète de type 1 et 2, insuffisance rénale chronique grave, cancer, insuffisance cardiaque grave, BPCO, sclérose en plaques, maladies inflammatoires chroniques intestinales, maladies psychiatriques graves, etc.\n\nPour chacune de ces maladies, le patient bénéficie de l'exonération du ticket modérateur pour tous les soins en rapport direct avec son ALD. En matière de transport, cela signifie un remboursement à 100% des frais de déplacement vers les soins liés à l'ALD.",
    sourcesLegales: [
      {
        intitule: "Article D.322-1 du code de la sécurité sociale — Liste des ALD30",
        url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000025099843",
      },
    ],
    termeReliesSlug: ["ald-affection-longue-duree", "remboursement-transport", "tiers-payant"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "tiers-payant",
    terme: "Tiers payant",
    termeComplet: "Mécanisme du tiers payant en transport sanitaire",
    categorie: "financement",
    definitionCourte:
      "Mécanisme permettant au patient de ne pas avancer les frais de transport : la CPAM et la mutuelle règlent directement le transporteur.",
    definitionLongue:
      "Le tiers payant est un mécanisme de règlement par lequel le patient ne paie pas directement le transporteur sanitaire et n'a pas besoin d'avancer les frais pour se faire rembourser ensuite. La CPAM règle directement l'entreprise de transport à hauteur de la part obligatoire (65% en régime normal, 100% pour les ALD), et la mutuelle ou complémentaire santé règle le complément.\n\nLe tiers payant est obligatoire pour certaines catégories de patients (ALD, maternité, accident de travail, bénéficiaires de la CSS/CMU-C, patients en situation de précarité) et optionnel pour les autres. Depuis la loi de modernisation du système de santé de 2016, le tiers payant généralisé sur la part obligatoire est une faculté pour tous les assurés.\n\nPour bénéficier du tiers payant, le patient doit présenter sa carte Vitale (ou attestation d'assurance) et sa carte de mutuelle. L'entreprise de transport est ensuite remboursée par télétransmission SEFi.",
    sourcesLegales: [
      {
        intitule: "Article L.161-36-2 du code de la sécurité sociale — Tiers payant",
        url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000033212699",
      },
    ],
    termeReliesSlug: ["cpam", "ald-affection-longue-duree", "css-complementaire-sante-solidaire", "sefi-systeme-electronique-facturation"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "remboursement-transport",
    terme: "Remboursement transport sanitaire",
    termeComplet: "Remboursement des frais de transport sanitaire par la CPAM",
    categorie: "financement",
    definitionCourte:
      "Prise en charge par l'Assurance maladie des frais de transport prescrit par un médecin. Taux de base 65%, porté à 100% pour les ALD, maternité, accident de travail.",
    definitionLongue:
      "Le remboursement des frais de transport sanitaire est conditionné à la réunion de plusieurs critères : existence d'une prescription médicale de transport, transport effectué par un professionnel conventionné (ambulance, VSL, taxi), nature médicalement justifiée du transport (impossibilité de se déplacer par ses propres moyens).\n\nLe taux normal de remboursement est de 65% du tarif conventionnel opposable. Il est porté à 100% pour : les patients en ALD pour leurs soins en rapport avec l'ALD, les grossesses à partir du 6e mois, les accidents du travail et maladies professionnelles, les bénéficiaires de la CSS (complémentaire santé solidaire), les invalides, les victimes de guerre, et les personnes hospitalisées.\n\nLe calcul du remboursement prend en compte le tarif conventionnel (non le prix facturé si supérieur), déduction faite d'une franchise médicale (2 € par trajet, plafonnée à 50 € par an).",
    sourcesLegales: [
      {
        intitule: "Articles L.322-1 et R.322-1 du code de la sécurité sociale",
        url: "https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006073189/LEGISCTA000006172575/",
      },
      {
        intitule: "Ameli.fr — Remboursement des frais de transport",
        url: "https://www.ameli.fr/assure/remboursements/rembourse/transport-malade/prise-en-charge-frais-transport",
      },
    ],
    termeReliesSlug: ["tiers-payant", "ald-affection-longue-duree", "prescription-medicale-transport", "franchise-medicale"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "forfait-kilometric",
    terme: "Forfait kilométrique",
    termeComplet: "Forfait kilométrique de transport sanitaire",
    categorie: "financement",
    definitionCourte:
      "Mode de calcul du tarif de transport basé sur la distance parcourue, avec un tarif à la prise en charge et un tarif par kilomètre, fixés par la convention CPAM.",
    definitionLongue:
      "Le forfait kilométrique est la base de calcul des tarifs de transport sanitaire conventionné. Il comprend :\n\n- Un forfait de prise en charge (FPP) : montant fixe couvrant les frais de déplacement aller jusqu'au lieu de prise en charge.\n- Un tarif au kilomètre (TAK) : montant par kilomètre parcouru avec le patient à bord.\n- Des majorations éventuelles : nuit (MN), dimanche/férié (MD), urgence (MU), attente, péages.\n\nLes tarifs sont actualisés régulièrement par voie d'avenant à la convention nationale. Ils varient selon le type de véhicule (ambulance vs VSL vs taxi) et peuvent être modulés selon les zones géographiques (urbaine, semi-urbaine, rurale).",
    sourcesLegales: [
      {
        intitule: "Convention nationale transport sanitaire — Barème tarifaire",
        url: "https://www.ameli.fr/professionnel-de-sante/transport-sanitaire/exercer/tarifs",
      },
    ],
    termeReliesSlug: ["conventionnement-cpam", "cpam", "bon-de-transport"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "forfait-departement",
    terme: "Forfait département",
    termeComplet: "Forfait départemental de transport sanitaire",
    categorie: "financement",
    definitionCourte:
      "Forfait applicable pour un transport dont le point de départ ou d'arrivée se trouve dans un département différent de celui de la CPAM de rattachement du patient.",
    definitionLongue:
      "Le forfait département (ou FD) est une majoration applicable lors des transports inter-départementaux. Il correspond à un montant forfaitaire ajouté au calcul kilométrique pour tenir compte des contraintes administratives supplémentaires (facturation à une autre CPAM, accord préalable inter-caisses).\n\nCe forfait est défini dans la convention nationale et ses avenants. Il doit être mentionné explicitement sur la feuille de transport.",
    sourcesLegales: [],
    termeReliesSlug: ["forfait-kilometric", "cpam", "bon-de-transport"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "prescription-medicale-transport",
    terme: "Prescription médicale de transport",
    termeComplet: "Prescription médicale de transport sanitaire",
    categorie: "financement",
    definitionCourte:
      "Ordonnance établie par un médecin autorisant et justifiant le recours à un transport sanitaire remboursé. Condition sine qua non du remboursement par la CPAM.",
    definitionLongue:
      "La prescription médicale de transport est le document par lequel un médecin autorise un patient à être transporté en véhicule sanitaire aux frais de l'Assurance maladie. Elle est régie par l'article R.322-10 du code de la sécurité sociale.\n\nLa prescription doit mentionner : l'identité du patient (nom, prénom, numéro de sécurité sociale), la date de prescription, le motif médical du transport (impossibilité de se déplacer par ses propres moyens), le type de transport préconisé (ambulance, VSL, taxi), le lieu de départ et d'arrivée, la fréquence (unique ou itérative), et le lien avec une éventuelle ALD.\n\nUne prescription incorrecte ou incomplète peut entraîner le refus de remboursement par la CPAM. Le médecin prescripteur engage sa responsabilité professionnelle sur la justification médicale du mode de transport choisi.",
    sourcesLegales: [
      {
        intitule: "Article R.322-10 du code de la sécurité sociale",
        url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000006749673",
      },
      {
        intitule: "Ameli.fr — Prescription de transport en ambulance, VSL ou taxi",
        url: "https://www.ameli.fr/medecin/exercice-liberal/transport-sanitaire/prescription/prescription-ambulance-vsl-taxi",
      },
    ],
    termeReliesSlug: ["bon-de-transport", "remboursement-transport", "ald-affection-longue-duree", "accord-prealable-transport"],
    exemples: [
      "Un médecin prescrit un transport en VSL pour un patient ayant une arthrose sévère des genoux empêchant la marche vers l'arrêt de bus.",
    ],
    miseAJour: "2026-06-28",
  },
  {
    slug: "bon-de-transport",
    terme: "Bon de transport",
    termeComplet: "Bon de transport / Feuille de transport sanitaire",
    categorie: "financement",
    definitionCourte:
      "Document papier ou électronique rempli par l'ambulancier à chaque mission, récapitulant les informations du transport (patient, trajet, durée, tarif) nécessaires au remboursement CPAM.",
    definitionLongue:
      "Le bon de transport (ou feuille de transport) est le document comptable et médico-administratif rempli par le professionnel de transport sanitaire pour chaque mission. Il constitue la pièce justificative indispensable au remboursement par la CPAM.\n\nIl doit comporter : l'identification du patient (nom, prénom, numéro de sécurité sociale), la date et les horaires du transport, le lieu de départ et d'arrivée, la distance parcourue, le type de véhicule utilisé, le tarif appliqué (selon la convention), les codes CCAM ou actes de transport, la signature du patient (attestant sa présence dans le véhicule), et la signature de l'ambulancier.\n\nAvec la généralisation du SEFi, le bon de transport papier est progressivement remplacé par une feuille de soins électronique (FSE) transmise par télétransmission à la CPAM.",
    sourcesLegales: [],
    termeReliesSlug: ["prescription-medicale-transport", "sefi-systeme-electronique-facturation", "feuille-de-soins-electronique", "cpam"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "franchise-medicale",
    terme: "Franchise médicale",
    termeComplet: "Franchise médicale sur les transports sanitaires",
    categorie: "financement",
    definitionCourte:
      "Montant forfaitaire déduit du remboursement de chaque trajet en ambulance ou VSL (2 € par trajet, plafond annuel de 50 €). Ne s'applique pas aux exonérés du ticket modérateur.",
    definitionLongue:
      "Instaurée par la loi de financement de la Sécurité sociale pour 2008, la franchise médicale est une participation forfaitaire restant à la charge de l'assuré après remboursement. Pour les transports sanitaires, elle s'élève à 2 € par trajet (aller simple).\n\nElle est plafonnée à 50 € par an et par assuré pour les transports. Elle ne s'applique pas aux personnes exonérées du ticket modérateur (ALD pour les soins en rapport, maternité après le 6e mois, accidents du travail, invalides, bénéficiaires CSS/CMU-C, enfants et mineurs).\n\nLa franchise est déduite du remboursement par la CPAM et ne peut être prise en charge par une complémentaire santé (sauf contrats antérieurs à 2008).",
    sourcesLegales: [
      {
        intitule: "Article L.322-2 du code de la sécurité sociale — Franchise médicale",
        url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000041446826",
      },
    ],
    termeReliesSlug: ["remboursement-transport", "tiers-payant", "ald-affection-longue-duree"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "t2a-tarification-activite",
    terme: "T2A",
    termeComplet: "Tarification à l'Activité",
    categorie: "financement",
    abreviation: "T2A",
    definitionCourte:
      "Mode de financement des établissements hospitaliers publics et privés basé sur l'activité réelle de soins. Inclut les transports SMUR dans les GHM.",
    definitionLongue:
      "La Tarification à l'Activité (T2A) est le système de financement des hôpitaux français depuis 2004. Il remplace la dotation globale forfaitaire par un financement lié à l'activité réelle de chaque établissement, mesurée par les Groupes Homogènes de Malades (GHM) et les Groupes Homogènes de Séjour (GHS).\n\nDans le domaine du transport sanitaire, la T2A concerne directement les SMUR hospitaliers : leurs missions sont financées via des forfaits SMUR (activités de SAMU régulation, sorties SMUR primaires et secondaires) intégrés dans l'enveloppe T2A de l'hôpital. Les transports inter-hospitaliers médicalisés (TIHAM) sont également financés dans ce cadre, contrairement aux transports privés qui relèvent de la convention CPAM.",
    sourcesLegales: [
      {
        intitule: "Article L.162-22-18 du code de la sécurité sociale — T2A",
        url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000041895040",
      },
    ],
    termeReliesSlug: ["smur", "transport-inter-hospitalier-medicalise", "cpam"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "amo-assurance-maladie-obligatoire",
    terme: "AMO",
    termeComplet: "Assurance Maladie Obligatoire",
    categorie: "financement",
    abreviation: "AMO",
    definitionCourte:
      "Régime de base de la Sécurité sociale, prenant en charge une partie des frais de santé et de transport médicaux (65% en principe, 100% pour les ALD).",
    definitionLongue:
      "L'Assurance Maladie Obligatoire (AMO) est le régime de base de protection sociale couvrant les risques maladie, maternité, invalidité et décès. Elle est obligatoire pour tous les résidents en France et financée par les cotisations sociales et la CSG.\n\nPour les transports sanitaires, l'AMO prend en charge la part obligatoire du remboursement (65% ou 100% selon les cas). Elle est gérée localement par les CPAM (régime général), la MSA (régime agricole) et d'autres régimes spéciaux.",
    sourcesLegales: [],
    termeReliesSlug: ["amc-assurance-maladie-complementaire", "tiers-payant", "remboursement-transport", "cpam"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "amc-assurance-maladie-complementaire",
    terme: "AMC",
    termeComplet: "Assurance Maladie Complémentaire",
    categorie: "financement",
    abreviation: "AMC",
    definitionCourte:
      "Assurance complémentaire (mutuelle, assurance groupe) couvrant tout ou partie du ticket modérateur restant à charge après remboursement de l'AMO.",
    definitionLongue:
      "L'Assurance Maladie Complémentaire (AMC) est une assurance facultative (sauf pour les salariés qui bénéficient d'une complémentaire collective obligatoire depuis 2016) couvrant le reste à charge après intervention de l'AMO.\n\nPour les transports sanitaires, l'AMC peut couvrir : le ticket modérateur (35% du tarif conventionnel en régime normal), les franchises médicales (sauf contrats récents), et les dépassements de tarif si l'entreprise est en secteur optionnel.\n\nLa qualité de la couverture AMC varie selon les contrats. Certaines mutuelles « haut de gamme » remboursent intégralement les frais de transport, d'autres se limitent au ticket modérateur conventionnel.",
    sourcesLegales: [],
    termeReliesSlug: ["amo-assurance-maladie-obligatoire", "tiers-payant", "css-complementaire-sante-solidaire"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "css-complementaire-sante-solidaire",
    terme: "CSS",
    termeComplet: "Complémentaire Santé Solidaire",
    categorie: "financement",
    abreviation: "CSS",
    definitionCourte:
      "Aide complémentaire santé gratuite ou quasi-gratuite pour les personnes à faibles revenus, remplaçant la CMU-C. Couvre le reste à charge sur les soins et transports.",
    definitionLongue:
      "La Complémentaire Santé Solidaire (CSS) a remplacé la CMU-C (Couverture Maladie Universelle Complémentaire) et l'ACS (Aide au paiement d'une Complémentaire Santé) depuis le 1er novembre 2019. Elle est accordée sous conditions de ressources.\n\nPour les bénéficiaires de la CSS, le tiers payant intégral s'applique sur tous les soins et transports médicaux : ils ne paient rien chez le médecin, en pharmacie et lors d'un transport sanitaire prescrit. La franchise médicale ne leur est pas appliquée.\n\nLes bénéficiaires sont automatiquement exonérés du ticket modérateur (100% de prise en charge sur la base du tarif conventionnel) et bénéficient du tiers payant total sans avance de frais.",
    sourcesLegales: [
      {
        intitule: "Ameli.fr — Complémentaire santé solidaire (CSS)",
        url: "https://www.ameli.fr/assure/droits-demarches/difficultes-acces-droits-soins/complementaire-sante/complementaire-sante-solidaire",
      },
    ],
    termeReliesSlug: ["tiers-payant", "remboursement-transport", "amo-assurance-maladie-obligatoire"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "indu",
    terme: "Indu",
    termeComplet: "Paiement indu (remboursement CPAM)",
    categorie: "financement",
    definitionCourte:
      "Somme versée par la CPAM à un professionnel de santé ou à un patient sans justification légale, devant être remboursée. Peut résulter d'une erreur ou d'une fraude.",
    definitionLongue:
      "L'indu est un trop-perçu de la CPAM résultant d'un paiement effectué à tort. Dans le transport sanitaire, les indus peuvent provenir de : facturation de transports sans prescription valide, facturation de transports non effectués (fraude), erreur de codification (mauvais type de véhicule), double facturation d'un même trajet, ou dépassement du tarif conventionnel.\n\nLorsque la CPAM détecte un indu (lors d'un contrôle ou d'une demande de l'assuré), elle adresse une notification de trop-perçu au professionnel ou à l'assuré avec demande de remboursement. En cas de fraude avérée, des pénalités financières s'ajoutent au remboursement de l'indu, et une procédure pénale peut être engagée.",
    sourcesLegales: [],
    termeReliesSlug: ["cpam", "taux-de-controle-cpam", "bon-de-transport", "sefi-systeme-electronique-facturation"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "fonds-intervention-regionale",
    terme: "FIR",
    termeComplet: "Fonds d'Intervention Régionale",
    categorie: "financement",
    abreviation: "FIR",
    definitionCourte:
      "Enveloppe financière dédiée aux ARS pour financer des actions de santé spécifiques dans leurs régions, dont certaines initiatives d'amélioration du transport sanitaire.",
    definitionLongue:
      "Le Fonds d'Intervention Régionale (FIR) est doté annuellement par la loi de financement de la Sécurité sociale (LFSS) et mis à disposition des ARS pour financer des actions régionales de santé non couvertes par les enveloppes classiques. Cela inclut notamment des projets d'amélioration du transport sanitaire dans les zones sous-dotées, des actions de formation continue des ambulanciers, ou le soutien aux nouvelles organisations de garde ATSU.",
    sourcesLegales: [
      {
        intitule: "Article L.1435-8 du code de la santé publique — FIR",
        url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000043549489",
      },
    ],
    termeReliesSlug: ["ars-agence-regionale-sante", "atsu-association-transport-sanitaire-urgent"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "ticket-moderateur",
    terme: "Ticket modérateur",
    termeComplet: "Ticket modérateur en transport sanitaire",
    categorie: "financement",
    definitionCourte:
      "Part des frais de transport restant à la charge du patient après remboursement de l'AMO. Représente généralement 35% du tarif conventionnel en régime normal.",
    definitionLongue:
      "Le ticket modérateur est la fraction du coût d'un acte ou d'un transport médicaux non prise en charge par l'Assurance maladie obligatoire (AMO). Pour le transport sanitaire en régime normal, il représente 35% du tarif conventionnel.\n\nLe ticket modérateur est supprimé (exonération totale) pour les patients en ALD pour leurs soins en rapport avec l'ALD, les bénéficiaires CSS/CMU-C, les femmes enceintes à partir du 6e mois, les accidents du travail, les invalides de guerre, etc.\n\nLe ticket modérateur peut être remboursé par la complémentaire santé (mutuelle, assurance groupe). En l'absence de complémentaire, il reste entièrement à la charge du patient.",
    sourcesLegales: [],
    termeReliesSlug: ["amo-assurance-maladie-obligatoire", "amc-assurance-maladie-complementaire", "remboursement-transport", "ald-affection-longue-duree"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "majoration-nuit",
    terme: "Majoration de nuit",
    termeComplet: "Majoration de nuit en transport sanitaire (MN)",
    categorie: "financement",
    definitionCourte:
      "Supplément tarifaire appliqué aux transports effectués entre 20h et 8h, compensant les contraintes des horaires de nuit pour les ambulanciers.",
    definitionLongue:
      "La majoration de nuit (MN) est un supplément tarifaire prévu par la convention nationale de transport sanitaire pour les transports effectués entre 20h et 8h. Son montant est fixé par la convention et ses avenants. Elle s'applique en sus du forfait de prise en charge et du tarif kilométrique.\n\nDes majorations similaires existent pour les dimanches et jours fériés (MD) et pour les transports urgents déclenchés par le SAMU (MU). Ces majorations sont remboursées par la CPAM selon les mêmes taux que le transport de base.",
    sourcesLegales: [],
    termeReliesSlug: ["forfait-kilometric", "cpam", "bon-de-transport"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "forfait-garde",
    terme: "Forfait de garde",
    termeComplet: "Forfait d'indemnité de garde ATSU",
    categorie: "financement",
    definitionCourte:
      "Indemnité versée par la CPAM à chaque entreprise participant à la garde ATSU pour compenser le coût d'immobilisation du véhicule et de l'équipage pendant les heures d'astreinte.",
    definitionLongue:
      "Le forfait de garde est versé par la CPAM à chaque entreprise de transport sanitaire pour chaque heure de garde effective dans le cadre de l'ATSU. Il est distinct des tarifs de transport et compense le coût fixe de la disponibilité permanente (rémunération de l'équipage en attente, amortissement du véhicule, carburant à disposition).\n\nSon montant est fixé par la convention nationale et peut varier selon les zones géographiques (montant plus élevé en zones rurales ou sous-dotées). Il est versé mensuellement après validation du planning de garde par l'ARS et le SAMU.",
    sourcesLegales: [],
    termeReliesSlug: ["atsu-association-transport-sanitaire-urgent", "garde-departementale-atsu", "cpam"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "transport-partage",
    terme: "Transport partagé",
    termeComplet: "Transport sanitaire partagé",
    categorie: "financement",
    definitionCourte:
      "Transport dans lequel plusieurs patients (2 ou 3) se rendent au même établissement de soins simultanément dans le même véhicule (VSL ou ambulance A2). Économise les coûts pour la CPAM.",
    definitionLongue:
      "Le transport partagé est un mécanisme imposé par la convention nationale pour optimiser les coûts du transport sanitaire remboursé. Lorsque plusieurs patients se rendent à la même destination au même horaire, l'entreprise de transport doit les regrouper dans un seul véhicule (VSL ou ambulance A2) sauf contre-indication médicale.\n\nLe transporteur facture chaque patient séparément (à la même base tarifaire) et la CPAM rembourse autant de transports qu'il y a de patients, mais ne paye qu'un seul trajet kilométrique divisé. Pour le patient, le coût est identique à un transport individuel.\n\nLe médecin peut contre-indiquer le transport partagé sur la prescription si l'état du patient ne le permet pas (risque infectieux, état d'agitation, incompatibilité avec d'autres passagers).",
    sourcesLegales: [],
    termeReliesSlug: ["vsl-vehicule-sanitaire-leger", "ambulance-type-a2", "conventionnement-cpam", "cpam"],
    exemples: [
      "Trois patients dialysés habitant le même quartier et allant au même centre de dialyse sont transportés ensemble en VSL. La CPAM rembourse trois transports mais le transporteur n'effectue qu'un seul trajet.",
    ],
    miseAJour: "2026-06-28",
  },
  {
    slug: "transport-iteratif",
    terme: "Transport itératif",
    termeComplet: "Transport sanitaire itératif (en série)",
    categorie: "financement",
    definitionCourte:
      "Transport répété régulièrement pour des soins chroniques (dialyse 3 fois par semaine, radiothérapie quotidienne). Fait l'objet d'une prescription itérative valable plusieurs mois.",
    definitionLongue:
      "Le transport itératif désigne les transports médicaux réguliers effectués à fréquence fixe pour des soins chroniques. Les cas les plus courants sont la dialyse (3 séances par semaine), la radiothérapie (5 jours par semaine pendant plusieurs semaines), la chimiothérapie (à intervalles réguliers).\n\nLe médecin peut établir une prescription itérative valable pour une série de transports (par exemple : 12 séances de radiothérapie sur 3 semaines). Cette prescription évite de devoir en faire une nouvelle à chaque séance. Elle doit néanmoins être renouvelée à son échéance et ne doit pas être utilisée au-delà de la durée prescrite.\n\nPour les patients en ALD (dialyse, cancer), les transports itératifs sont remboursés à 100% et peuvent représenter plusieurs dizaines de milliers d'euros par an pour la CPAM.",
    sourcesLegales: [],
    termeReliesSlug: ["prescription-medicale-transport", "dialyse", "radiotherapie", "ald-affection-longue-duree"],
    miseAJour: "2026-06-28",
  },

  // ────────────────────────────────────────────────────────────────────
  // MÉDICAL (30 termes)
  // ────────────────────────────────────────────────────────────────────
  {
    slug: "dialyse",
    terme: "Dialyse",
    termeComplet: "Hémodialyse et dialyse péritonéale",
    categorie: "medical",
    definitionCourte:
      "Traitement de suppléance rénale pour les insuffisances rénales chroniques terminales. Nécessite 3 séances par semaine de 4 heures, avec transport aller-retour remboursé à 100% (ALD).",
    definitionLongue:
      "La dialyse est une technique médicale de suppléance rénale artificielle permettant de filtrer le sang des patients en insuffisance rénale chronique terminale (IRCT). On distingue deux modalités :\n\n- L'hémodialyse en centre : 3 séances de 4 heures par semaine dans une unité de dialyse hospitalière ou de dialyse médicalisée. C'est la modalité la plus courante (environ 45 000 patients en France).\n- La dialyse péritonéale à domicile : réalisée par le patient lui-même à son domicile, nécessitant moins de transports.\n\nPour les patients en hémodialyse en centre, le transport représente un enjeu logistique et financier majeur. La CPAM prend en charge les transports à 100% (ALD insuffisance rénale). L'organisation du transport (VSL partagé de préférence, taxi pour les patients autonomes, ambulance pour les patients nécessitant un brancardage) représente une part significative des dépenses de transport sanitaire.",
    sourcesLegales: [
      {
        intitule: "Ameli.fr — Insuffisance rénale chronique — prise en charge",
        url: "https://www.ameli.fr/assure/sante/themes/insuffisance-renale-chronique",
      },
    ],
    termeReliesSlug: ["ald-affection-longue-duree", "transport-iteratif", "vsl-vehicule-sanitaire-leger", "transport-partage"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "radiotherapie",
    terme: "Radiothérapie",
    termeComplet: "Radiothérapie oncologique",
    categorie: "medical",
    definitionCourte:
      "Traitement anticancéreux utilisant des rayonnements ionisants. Souvent quotidien sur plusieurs semaines, entraîne des besoins de transport fréquents remboursés à 100% (ALD cancer).",
    definitionLongue:
      "La radiothérapie est un traitement oncologique utilisant des rayonnements pour détruire les cellules cancéreuses. En France, elle est réalisée dans des centres de radiothérapie agréés (publics ou privés). Un cycle de radiothérapie comprend généralement 25 à 35 séances quotidiennes (du lundi au vendredi) sur 5 à 7 semaines.\n\nLes patients en radiothérapie peuvent être affaiblis par le traitement (fatigue, nausées) et nécessitent un transport médicalement justifié. Dans le cadre de l'ALD cancer, le transport est remboursé à 100%. La CPAM impose le transport partagé (VSL si possible) sauf contre-indication médicale.",
    sourcesLegales: [],
    termeReliesSlug: ["chimiotherapie", "ald-affection-longue-duree", "transport-iteratif", "vsl-vehicule-sanitaire-leger"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "chimiotherapie",
    terme: "Chimiothérapie",
    termeComplet: "Chimiothérapie oncologique",
    categorie: "medical",
    definitionCourte:
      "Traitement anticancéreux par médicaments cytotoxiques, réalisé en hôpital de jour ou en ambulatoire. Génère des besoins de transport réguliers remboursés à 100% en ALD.",
    definitionLongue:
      "La chimiothérapie est un traitement oncologique par médicaments qui détruisent ou inhibent les cellules cancéreuses. Elle est administrée à intervalles réguliers (cycles de 21 à 28 jours en général) en hôpital de jour (HDJ), en hospitalisation complète ou à domicile (HAD).\n\nLes patients en chimiothérapie ambulatoire (hôpital de jour) nécessitent un transport aller-retour à chaque séance. La fatigue et l'immunodépression post-traitement justifient souvent médicalement le transport en ambulance ou VSL plutôt qu'un taxi standard. Dans le cadre de l'ALD cancer, ces transports sont pris en charge à 100%.",
    sourcesLegales: [],
    termeReliesSlug: ["radiotherapie", "ald-affection-longue-duree", "transport-iteratif", "vsl-vehicule-sanitaire-leger"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "patient-assis-stable",
    terme: "Patient assis stable",
    termeComplet: "Patient en position assise stable",
    categorie: "medical",
    definitionCourte:
      "État clinique permettant le transport en VSL ou taxi : le patient peut rester assis seul pendant le trajet sans risque médical.",
    definitionLongue:
      "La notion de « patient assis stable » est déterminante dans le choix du mode de transport par le médecin prescripteur. Un patient assis stable peut être transporté en VSL ou en taxi conventionné, modes de transport moins coûteux qu'une ambulance.\n\nCritères d'un patient assis stable : capable de maintenir une position assise sans aide, pas de risque de décompensation soudaine pendant le trajet, pas d'équipement médical nécessitant une surveillance (sonde, perfusion continue, scope), absence de douleur majeure liée à la position assise.\n\nLe médecin prescripteur doit évaluer ces critères avant de prescrire le mode de transport. Prescrire une ambulance pour un patient assis stable est considéré comme une prescription inappropriée pouvant faire l'objet d'un contrôle CPAM.",
    sourcesLegales: [
      {
        intitule: "Ameli.fr — Choisir le bon mode de transport médical",
        url: "https://www.ameli.fr/medecin/exercice-liberal/transport-sanitaire/prescription/choisir-mode-transport",
      },
    ],
    termeReliesSlug: ["prescription-medicale-transport", "vsl-vehicule-sanitaire-leger", "taxi-conventionne"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "patient-allonge",
    terme: "Patient allongé",
    termeComplet: "Patient nécessitant le transport en position allongée",
    categorie: "medical",
    definitionCourte:
      "État clinique nécessitant le transport en ambulance : fracture, post-opératoire immédiat, douleur intense, incapacité à tenir assis, nécessité d'une surveillance.",
    definitionLongue:
      "Le transport en position allongée est indiqué lorsque l'état clinique du patient ne lui permet pas de maintenir la position assise pendant le trajet, ou lorsque la position allongée est médicalement nécessaire (fracture rachidienne, post-chirurgie abdominale, plaie ouverte, perfusion continue, état d'agitation).\n\nCe mode de transport nécessite obligatoirement une ambulance (type A1 ou B) avec un équipage DEA/auxiliaire. Il est plus coûteux qu'un VSL ou un taxi. La prescription médicale doit motiver explicitement la nécessité de la position allongée pour justifier le mode de transport ambulance.",
    sourcesLegales: [],
    termeReliesSlug: ["ambulance-type-a1", "prescription-medicale-transport", "dea-diplome-etat-ambulancier"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "urgence-vitale",
    terme: "Urgence vitale",
    termeComplet: "Urgence mettant en jeu le pronostic vital",
    categorie: "medical",
    definitionCourte:
      "Situation médicale où le pronostic vital est engagé dans les minutes ou heures suivantes, nécessitant un transport urgent médicalisé (SMUR) ou non médicalisé (ATSU).",
    definitionLongue:
      "L'urgence vitale est une situation médicale nécessitant une intervention immédiate pour sauvegarder le pronostic vital du patient. Les urgences vitales typiques comprennent : arrêt cardiorespiratoire, infarctus du myocarde en cours, AVC ischémique (accident vasculaire cérébral), détresse respiratoire aiguë, état de choc, traumatismes graves.\n\nLe SAMU-Centre 15 trie les appels et décide du niveau de réponse : SMUR pour les urgences médicalisées, ambulance ATSU pour les urgences ne nécessitant pas de médecin à bord. Le médecin régulateur utilise la CCMU (Classification Clinique des Malades aux Urgences) pour guider sa décision.\n\nEn dehors des heures d'ouverture des entreprises habituelles, la garde ATSU prend le relais pour répondre aux appels d'urgence non médicalisés. Le transport gratuit sur le plan financier pour le patient dans les urgences vitales est pris en charge à 100 % par l'Assurance Maladie.",
    sourcesLegales: [
      {
        intitule: "Article L.6311-1 du code de la santé publique - aide médicale urgente",
        url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000006690282",
      },
    ],
    termeReliesSlug: ["samu-centre-15", "smur", "atsu-association-transport-sanitaire-urgent", "garde-departementale-atsu"],
    miseAJour: "2026-06-28",
  },
  // ────────────────────────────────────────────────────────────────────
  // MÉDICAL (suite)
  // ────────────────────────────────────────────────────────────────────
  {
    slug: "brancardage",
    terme: "Brancardage",
    termeComplet: "Transport d'un patient par brancard",
    categorie: "medical",
    definitionCourte:
      "Opération consistant à transporter un patient allongé sur un brancard, du lieu de prise en charge jusqu'au véhicule sanitaire ou dans les couloirs d'un établissement de soins.",
    definitionLongue:
      "Le brancardage désigne l'ensemble des techniques et manœuvres permettant de déplacer un patient allongé ou semi-allongé sur un brancard ou une chaise de transport. Il constitue une compétence fondamentale de l'ambulancier DEA et de l'auxiliaire ambulancier.\n\nLes techniques de brancardage incluent : le relevage du patient depuis le sol ou le lit, la mise en place d'un matelas coquille en cas de traumatisme, le glissement sur plan dur, et les manœuvres en escalier. L'équipe ambulancière doit évaluer le poids du patient (bariatrique ou non), les conditions d'accès (escaliers, ascenseur, étages sans ascenseur) et les pathologies associées avant de choisir la technique adaptée.\n\nLe brancardage intra-hospitalier est réalisé par les brancardiers hospitaliers, agents de la fonction publique hospitalière formés spécifiquement à cet effet. Ils assurent les transferts entre services au sein d'un établissement de santé.",
    sourcesLegales: [],
    termeReliesSlug: ["dea-diplome-etat-ambulancier", "ambulance-type-b", "matelas-coquille"],
    exemples: ["Transport d'un patient fracturé depuis son domicile jusqu'à l'ambulance", "Brancardage d'un patient en salle de réveil vers sa chambre d'hospitalisation"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "position-laterale-securite",
    terme: "PLS",
    termeComplet: "Position Latérale de Sécurité",
    categorie: "medical",
    abreviation: "PLS",
    definitionCourte:
      "Position dans laquelle est placé un patient inconscient qui respire afin de maintenir ses voies aériennes libres et prévenir l'inhalation en cas de vomissements.",
    definitionLongue:
      "La Position Latérale de Sécurité (PLS) est un geste de premier secours consistant à placer un patient inconscient qui respire sur le côté (habituellement côté gauche), genoux fléchis, bouche légèrement ouverte et inclinée vers le bas. Ce positionnement maintient les voies aériennes libres et prévient le risque d'inhalation en cas de régurgitations ou vomissements.\n\nLa PLS est enseignée dans tous les modules de formation aux premiers secours (PSC1, PSE1, PSE2) et dans la formation DEA des ambulanciers. Elle ne doit jamais être réalisée chez un patient présentant une suspicion de traumatisme rachidien, pour lequel le maintien en axe est impératif.\n\nL'ambulancier doit maintenir la surveillance de la respiration du patient en PLS tout au long du transport et alerter immédiatement la régulation médicale SAMU en cas d'aggravation.",
    sourcesLegales: [],
    termeReliesSlug: ["dea-diplome-etat-ambulancier", "samu-centre-15", "defibrillateur"],
    exemples: ["Patient en état d'ivresse inconscient", "Patient en post-critique épileptique"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "oxygene-medical",
    terme: "Oxygène médical",
    termeComplet: "Oxygène à usage médical",
    categorie: "medical",
    definitionCourte:
      "Médicament gazeux administré par inhalation, obligatoirement présent dans toute ambulance de type B. Utilisé pour les patients en détresse respiratoire ou post-opératoires.",
    definitionLongue:
      "L'oxygène médical est classé comme médicament en France (article L.4211-1 du code de la santé publique) et doit être prescrit, dispensé et administré dans des conditions strictes. Il est obligatoire dans les ambulances de type B et dans les SMUR.\n\nDans les ambulances, l'oxygène est conditionné en bouteilles d'une capacité de 2 à 15 litres sous haute pression (200 bars), munies d'un détendeur débitmètre permettant d'ajuster le débit (2 à 15 L/min) selon les besoins du patient. L'administration se fait via un masque à oxygène à haute concentration ou une sonde nasale.\n\nL'ambulancier DEA est habilité à administrer l'oxygène médical selon les protocoles de soins établis, en l'absence ou avant l'arrivée d'un médecin. Les bouteilles doivent être vérifiées avant chaque prise en charge et leur remplacement planifié pour garantir l'autonomie suffisante pour le transport.",
    sourcesLegales: [
      {
        intitule: "Arrêté du 10 février 2009 fixant les référentiels des emplois et compétences des ambulanciers",
        url: "https://www.legifrance.gouv.fr/loda/id/JORFTEXT000020255358",
      },
    ],
    termeReliesSlug: ["ambulance-type-b", "defibrillateur", "smur"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "defibrillateur",
    terme: "DAE / DEA",
    termeComplet: "Défibrillateur Automatisé Externe",
    categorie: "medical",
    abreviation: "DAE",
    alternativesOrtho: ["défibrillateur semi-automatique", "DSA"],
    definitionCourte:
      "Appareil médical permettant d'analyser le rythme cardiaque et de délivrer un choc électrique pour traiter les fibrillations ventriculaires. Obligatoire dans toute ambulance de type B.",
    definitionLongue:
      "Le Défibrillateur Automatisé Externe (DAE) est un dispositif médical dont l'utilisation est désormais accessible au grand public depuis le décret du 4 mai 2007 (décret n° 2007-705). Il analyse automatiquement le rythme cardiaque et guide l'utilisateur par des instructions vocales pour la délivrance d'un choc électrique en cas de fibrillation ventriculaire ou de tachycardie ventriculaire sans pouls.\n\nDans les ambulances de type B, le défibrillateur est un équipement obligatoire selon la norme NF EN 1789. L'ambulancier DEA doit être formé à son utilisation dans le cadre de sa formation initiale et des recyclages annuels. Les modèles professionnels disponibles en ambulance (défibrillateurs semi-automatiques ou manuels) permettent également la surveillance cardiaque continue du patient pendant le transport.\n\nLa chaîne de survie recommande une défibrillation dans les 5 minutes suivant l'arrêt cardiaque pour maximiser les chances de survie. Le personnel SMUR utilise des défibrillateurs manuels plus sophistiqués permettant le traitement des arythmies complexes.",
    sourcesLegales: [
      {
        intitule: "Décret n° 2007-705 du 4 mai 2007 relatif à l'utilisation des défibrillateurs",
        url: "https://www.legifrance.gouv.fr/loda/id/JORFTEXT000000647799",
      },
    ],
    termeReliesSlug: ["ambulance-type-b", "smur", "urgence-vitale", "samu-centre-15"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "matelas-coquille",
    terme: "Matelas coquille",
    termeComplet: "Matelas immobilisateur à dépression",
    categorie: "medical",
    alternativesOrtho: ["matelas immobilisateur", "matelas à dépression"],
    definitionCourte:
      "Dispositif médical de stabilisation permettant d'immobiliser un patient traumatisé en maintenant la colonne vertébrale, les fractures et le corps en position d'attelle rigide.",
    definitionLongue:
      "Le matelas coquille, ou matelas immobilisateur à dépression (MID), est un dispositif médical permettant d'immobiliser un patient blessé ou traumatisé dans la position dans laquelle il a été trouvé. Il se compose d'une enveloppe souple remplie de petites billes de polystyrène. Une fois que le patient est positionné dessus et que l'air est retiré par aspiration, le matelas prend la forme du corps et se rigidifie, formant une « coque » de protection.\n\nIl est indiqué pour les traumatismes de la colonne vertébrale (rachis), les fractures instables des membres inférieurs ou du bassin, les polytraumatismes nécessitant une immobilisation totale du patient. Son utilisation est enseignée dans la formation DEA et est obligatoire dans les ambulances de type B.\n\nLa mise en place correcte d'un matelas coquille nécessite deux personnes et un minimum de 5 à 10 minutes. Il doit toujours être utilisé en complément d'un collier cervical en cas de traumatisme du rachis cervical.",
    sourcesLegales: [],
    termeReliesSlug: ["ambulance-type-b", "dea-diplome-etat-ambulancier", "brancardage"],
    miseAJour: "2026-06-28",
  },
  // ────────────────────────────────────────────────────────────────────
  // ADMINISTRATIF (20 termes)
  // ────────────────────────────────────────────────────────────────────
  {
    slug: "siret",
    terme: "SIRET",
    termeComplet: "Système d'Identification du Répertoire des Établissements",
    categorie: "administratif",
    abreviation: "SIRET",
    definitionCourte:
      "Numéro à 14 chiffres identifiant un établissement d'une entreprise en France, composé du SIREN (9 chiffres) suivi du NIC (5 chiffres). Obligatoire pour exercer légalement.",
    definitionLongue:
      "Le numéro SIRET (Système d'Identification du Répertoire des Établissements) est attribué par l'INSEE à chaque établissement de toute entreprise française lors de son immatriculation. Il est composé de 14 chiffres : les 9 premiers constituent le numéro SIREN de l'entreprise, auxquels s'ajoutent 5 chiffres formant le NIC (Numéro Interne de Classement) propre à chaque établissement.\n\nPour les entreprises de transport sanitaire, le SIRET est indispensable pour : l'obtention de l'agrément ARS, le conventionnement CPAM, la facturation des transports à l'Assurance Maladie, l'inscription au registre du commerce (KBIS), et la vérification de l'existence légale de l'entreprise par les partenaires et clients.\n\nRoullePro vérifie systématiquement le SIRET de chaque professionnel inscrit auprès du registre INSEE SIRENE pour garantir l'authenticité des fiches de l'annuaire. Un SIRET invalide ou d'une entreprise radiée entraîne le rejet automatique de l'inscription.",
    sourcesLegales: [
      {
        intitule: "INSEE - Répertoire SIRENE",
        url: "https://www.sirene.fr",
      },
    ],
    termeReliesSlug: ["siren", "kbis", "finess-geographique", "agrement-ars"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "siren",
    terme: "SIREN",
    termeComplet: "Système d'Identification du Répertoire des ENtreprises",
    categorie: "administratif",
    abreviation: "SIREN",
    definitionCourte:
      "Numéro à 9 chiffres identifiant une entreprise en France, attribué par l'INSEE lors de l'immatriculation. Identifie l'entité juridique, contrairement au SIRET qui identifie un établissement.",
    definitionLongue:
      "Le numéro SIREN est un identifiant unique à 9 chiffres attribué par l'INSEE à chaque personne morale ou physique inscrite au répertoire SIRENE. Il permet d'identifier l'entité juridique (la société ou l'auto-entrepreneur) indépendamment de ses établissements. Chaque établissement d'une même entreprise possède le même SIREN, mais des SIRET différents.\n\nContrairement au SIRET (14 chiffres, spécifique à un établissement), le SIREN représente l'identité de l'entreprise dans son ensemble. Il est utilisé dans les actes juridiques, les marchés publics, les contrats, et la facturation inter-entreprises.\n\nPour une entreprise de transport sanitaire, le SIREN figure sur le KBIS, les factures, les déclarations fiscales et sociales, et les contrats avec la CPAM. Le transfert ou la cession d'activité conserve le SIREN de l'entité juridique mais peut nécessiter un nouveau SIRET si un nouvel établissement est créé.",
    sourcesLegales: [
      {
        intitule: "INSEE - Répertoire SIRENE",
        url: "https://www.sirene.fr",
      },
    ],
    termeReliesSlug: ["siret", "kbis", "agrement-ars"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "kbis",
    terme: "KBIS",
    termeComplet: "Extrait Kbis du registre du commerce et des sociétés",
    categorie: "administratif",
    abreviation: "KBIS",
    definitionCourte:
      "Document officiel délivré par le greffe du tribunal de commerce, attestant de l'existence légale d'une société commerciale en France. Indispensable pour les démarches administratives.",
    definitionLongue:
      "L'extrait Kbis est le document officiel délivré par le greffe du tribunal de commerce qui atteste de l'existence légale et de l'immatriculation d'une société au Registre du Commerce et des Sociétés (RCS). Il contient : la dénomination sociale, le numéro SIREN/SIRET, la forme juridique, le capital social, l'adresse du siège, l'activité principale (code NAF/APE), les dirigeants, et les éventuelles procédures collectives.\n\nPour les entreprises de transport sanitaire, le Kbis est exigé pour : la demande d'agrément ARS, le conventionnement CPAM, l'ouverture d'un compte bancaire professionnel, la participation aux appels d'offres publics, et l'inscription sur RoullePro. Un Kbis de moins de 3 mois est généralement requis pour les démarches officielles.\n\nLes auto-entrepreneurs et entreprises individuelles ne reçoivent pas de Kbis mais un extrait D1 ou une attestation d'immatriculation au répertoire SIRENE. Depuis 2021, l'obtention du Kbis est gratuite et dématérialisée via le site infogreffe.fr.",
    sourcesLegales: [
      {
        intitule: "Article L.123-1 du code de commerce - Registre du commerce",
        url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000006219375",
      },
    ],
    termeReliesSlug: ["siret", "siren", "agrement-ars", "conventionnement-cpam"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "code-naf-ape",
    terme: "Code NAF / APE",
    termeComplet: "Nomenclature des Activités Françaises / Activité Principale Exercée",
    categorie: "administratif",
    abreviation: "NAF",
    alternativesOrtho: ["code APE", "NAF 86.90A"],
    definitionCourte:
      "Code à 5 caractères attribué par l'INSEE définissant l'activité principale d'une entreprise. Pour le transport sanitaire, le code est 86.90A (ambulances) ou 49.32Z (taxis).",
    definitionLongue:
      "Le code NAF (Nomenclature des Activités Françaises), aussi appelé code APE (Activité Principale Exercée), est un code alphanumérique à 5 caractères attribué par l'INSEE lors de l'immatriculation de l'entreprise. Il identifie la branche d'activité principale de l'entreprise selon la nomenclature européenne NACE.\n\nPour le secteur du transport sanitaire, les codes NAF pertinents sont :\n- 86.90A : Ambulances — sociétés d'ambulances, VSL, SMUR privés\n- 49.32Z : Transports de voyageurs par taxis — incluant les taxis conventionnés CPAM\n- 86.10Z : Activités hospitalières — pour les SMUR publics intégrés aux CHU/CHR\n\nLe code NAF conditionne les conventions collectives applicables, les cotisations URSSAF, et les conditions d'accès à certaines aides publiques. Il figure sur tous les documents officiels (KBIS, factures, déclarations fiscales) et est utilisé par les organismes d'assurance maladie pour vérifier la catégorie d'activité des professionnels conventionnés.",
    sourcesLegales: [
      {
        intitule: "INSEE - Nomenclature des activités françaises (NAF rév. 2)",
        url: "https://www.insee.fr/fr/information/2406147",
      },
    ],
    termeReliesSlug: ["siret", "kbis", "agrement-ars", "finess-geographique"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "rcs-registre-commerce",
    terme: "RCS",
    termeComplet: "Registre du Commerce et des Sociétés",
    categorie: "administratif",
    abreviation: "RCS",
    definitionCourte:
      "Fichier public tenu par les greffes des tribunaux de commerce recensant toutes les sociétés commerciales immatriculées en France. L'inscription est obligatoire pour les sociétés de transport sanitaire.",
    definitionLongue:
      "Le Registre du Commerce et des Sociétés (RCS) est un registre légal tenu par les greffes des tribunaux de commerce et de grande instance. Toute société commerciale (SARL, SAS, SA...) ainsi que les commerçants personnes physiques sont tenus de s'y inscrire. L'immatriculation au RCS confère la personnalité juridique à la société et lui attribue un numéro SIREN.\n\nPour une entreprise de transport sanitaire constituée sous forme de société commerciale, l'immatriculation au RCS est obligatoire avant toute demande d'agrément ARS. Les formalités sont réalisées via le guichet unique des formalités d'entreprises (formalites.entreprises.gouv.fr) depuis janvier 2023, en remplacement du CFE (Centre de Formalités des Entreprises).\n\nLes informations contenues au RCS sont publiques et accessibles via l'extrait Kbis : identité des dirigeants, capital social, date de création, éventuels redressements ou liquidations judiciaires.",
    sourcesLegales: [
      {
        intitule: "Article L.123-1 du code de commerce",
        url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000006219375",
      },
    ],
    termeReliesSlug: ["kbis", "siret", "siren"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "atih",
    terme: "ATIH",
    termeComplet: "Agence Technique de l'Information sur l'Hospitalisation",
    categorie: "administratif",
    abreviation: "ATIH",
    definitionCourte:
      "Établissement public français sous tutelle du ministère de la Santé, gérant le référentiel FINESS, les données médico-économiques des établissements de santé et la T2A.",
    definitionLongue:
      "L'Agence Technique de l'Information sur l'Hospitalisation (ATIH) est un établissement public administratif placé sous la tutelle conjointe du ministère chargé de la santé et du ministère chargé du budget. Elle a pour mission principale de collecter, traiter et diffuser les informations relatives à l'activité et aux coûts des établissements de santé français.\n\nSes principales missions comprennent : la gestion du référentiel FINESS (numéros d'identification des établissements de santé et médico-sociaux), le développement et la maintenance du PMSI (Programme de Médicalisation des Systèmes d'Information), la mise en œuvre de la tarification à l'activité (T2A), et la publication des bases de données médico-administratives.\n\nPour les entreprises de transport sanitaire, l'ATIH est l'autorité qui attribue les numéros FINESS géographiques et juridiques permettant aux ambulanciers et VSL d'être identifiés dans les systèmes d'information de santé et de facturer leurs actes à l'Assurance Maladie.",
    sourcesLegales: [
      {
        intitule: "ATIH - Référentiel FINESS",
        url: "https://finess.esante.gouv.fr",
      },
    ],
    termeReliesSlug: ["finess-geographique", "finess-juridique", "t2a-tarification-activite"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "carte-professionnelle-ambulancier",
    terme: "Carte professionnelle",
    termeComplet: "Carte professionnelle d'ambulancier",
    categorie: "administratif",
    definitionCourte:
      "Document délivré par l'ARS attestant que le titulaire remplit les conditions d'exercice de la profession d'ambulancier (DEA, aptitude médicale, casier judiciaire vierge).",
    definitionLongue:
      "La carte professionnelle d'ambulancier est délivrée par l'Agence Régionale de Santé (ARS) à toute personne souhaitant exercer la profession d'ambulancier. Son obtention est conditionnée à : la détention du DEA ou DEAA selon le poste, un certificat médical d'aptitude à la conduite et à la pratique professionnelle délivré par un médecin agréé, un extrait de casier judiciaire (bulletin n°3) vierge, et une attestation de formation aux gestes d'urgence à jour.\n\nLa carte est nominative et renouvelable périodiquement. Elle doit être présentée lors de tout contrôle par les autorités sanitaires ou les organismes de contrôle de l'Assurance Maladie. La suspension ou le retrait de la carte professionnelle interdit l'exercice de la profession.\n\nLa durée de validité et les conditions de renouvellement ont été précisées par l'arrêté du 26 janvier 2006 modifié par les textes ultérieurs sur les conditions d'exercice des ambulanciers.",
    sourcesLegales: [
      {
        intitule: "Article R.6312-7 du code de la santé publique",
        url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000006918053",
      },
    ],
    termeReliesSlug: ["dea-diplome-etat-ambulancier", "ars-agence-regionale-sante", "agrement-ars"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "convention-collective-transport-sanitaire",
    terme: "Convention collective",
    termeComplet: "Convention collective nationale des transports sanitaires privés",
    categorie: "administratif",
    definitionCourte:
      "Accord négocié entre les organisations patronales et syndicales du secteur, fixant les conditions de travail, les salaires, les classifications et les avantages des salariés du transport sanitaire.",
    definitionLongue:
      "La convention collective nationale des transports sanitaires privés (IDCC 0507) est le texte de référence régissant les relations de travail dans les entreprises d'ambulances, de VSL et de transport sanitaire privé en France. Elle est le fruit de négociations entre les organisations patronales (FNTS, FNAA, FFC) et les syndicats de salariés (CGT, CFDT, FO, CFTC).\n\nElle définit notamment : les classifications professionnelles (conducteur ambulancier, ambulancier DEA, responsable d'équipe...), les grilles de salaires minimaux par classification, les durées et conditions du travail (temps de travail, astreintes, gardes), les avantages liés à l'ancienneté, les conditions de rupture du contrat, et les modalités de formation professionnelle continue.\n\nLa convention collective est étendue, ce qui signifie qu'elle s'applique obligatoirement à toutes les entreprises du secteur, y compris celles dont les employeurs ne sont pas membres des organisations signataires. Elle est consultable via le site Légifrance.",
    sourcesLegales: [
      {
        intitule: "Convention collective nationale des transports sanitaires privés (IDCC 0507)",
        url: "https://www.legifrance.gouv.fr/conv_coll/id/KALICONT000005635534",
      },
    ],
    termeReliesSlug: ["dea-diplome-etat-ambulancier", "deaa-diplome-etat-auxiliaire-ambulancier", "agrement-ars"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "numero-ins",
    terme: "INS",
    termeComplet: "Identifiant National de Santé",
    categorie: "administratif",
    abreviation: "INS",
    definitionCourte:
      "Identifiant unique et permanent du patient dans le système de santé français, basé sur le NIR (numéro de sécurité sociale). Obligatoire pour l'alimentation du Dossier Médical Partagé.",
    definitionLongue:
      "L'Identifiant National de Santé (INS) est un identifiant unique permettant de référencer les données de santé d'une personne physique prise en charge par le système de santé français. Il est obligatoire depuis le 1er janvier 2021 pour tous les acteurs du soin dans le cadre de l'échange et du partage de données de santé.\n\nL'INS est basé sur les données d'état civil certifiées : le matricule INS (composé du NIR — numéro au répertoire de l'INSEE — et de la clé), le nom de naissance, les prénoms de naissance, la date de naissance, le sexe, et le lieu de naissance. Ces traits d'identité sont récupérés par le téléservice INSi auprès du RNIPP (répertoire national d'identification des personnes physiques) via la carte Vitale.\n\nPour les entreprises de transport sanitaire, l'utilisation de l'INS est requise pour l'alimentation du Dossier Médical Partagé (DMP) et pour les échanges de données de santé dématérialisés avec les établissements de santé et les médecins.",
    sourcesLegales: [
      {
        intitule: "Décret n° 2017-412 du 27 mars 2017 relatif à l'identifiant national de santé",
        url: "https://www.legifrance.gouv.fr/loda/id/JORFTEXT000034272841",
      },
    ],
    termeReliesSlug: ["dmp-dossier-medical-partage", "carte-vitale", "lecteur-sesam-vitale"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "numero-agree-cpam",
    terme: "Numéro agréé CPAM",
    termeComplet: "Numéro d'agrément CPAM pour le transport sanitaire",
    categorie: "administratif",
    definitionCourte:
      "Numéro attribué par la CPAM à chaque entreprise de transport sanitaire conventionnée, permettant l'identification dans les systèmes de facturation de l'Assurance Maladie.",
    definitionLongue:
      "Le numéro d'agrément CPAM est attribué par la caisse primaire d'assurance maladie à chaque entreprise de transport sanitaire après la signature de la convention. Il permet l'identification unique de l'entreprise dans le système d'information de l'Assurance Maladie et est utilisé sur toutes les feuilles de transport et les demandes de remboursement électroniques.\n\nCe numéro doit figurer sur les bons de transport, les feuilles de soins et les factures transmises à la CPAM. En cas de changement de situation (changement d'adresse, de forme juridique, de dirigeant), l'entreprise doit en informer la CPAM qui peut attribuer un nouveau numéro ou mettre à jour l'existant.\n\nLe respect des obligations conventionnelles conditionne le maintien du numéro agréé. En cas de résiliation conventionnelle par la CPAM (non-respect des tarifs, fraude, défaut de qualité), l'entreprise perd son numéro agréé et ne peut plus facturer les transports sanitaires à l'Assurance Maladie.",
    sourcesLegales: [
      {
        intitule: "Convention nationale organisant les rapports entre les transporteurs sanitaires privés et l'Assurance maladie",
        url: "https://www.ameli.fr/transporteur-sanitaire/exercice-professionnel/conventions-et-reglements",
      },
    ],
    termeReliesSlug: ["conventionnement-cpam", "cpam", "finess-geographique"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "facture-transport-sanitaire",
    terme: "Facture de transport",
    termeComplet: "Facture de transport sanitaire",
    categorie: "administratif",
    definitionCourte:
      "Document comptable établi par l'entreprise de transport sanitaire détaillant les prestations réalisées, les tarifs appliqués et les montants remboursables par l'Assurance Maladie.",
    definitionLongue:
      "La facture de transport sanitaire est un document comptable et légal établi par l'entreprise d'ambulance, de VSL ou le taxi conventionné pour chaque prestation réalisée. Elle doit mentionner : le numéro agréé CPAM de l'entreprise, les coordonnées complètes du patient, la date et les horaires du transport, le point de départ et d'arrivée, la distance parcourue, le tarif applicable (selon la nomenclature CPAM en vigueur), le montant total, la part remboursable par l'Assurance Maladie, et le montant restant à charge du patient.\n\nDepuis la généralisation du tiers payant dans le transport sanitaire, la facture est transmise directement à la CPAM par voie électronique (SEFi) sans que le patient ait à avancer les frais. Le patient signe le bon de transport qui autorise la facturation directe.\n\nLes contrôles CPAM portent notamment sur la conformité des factures avec les prescriptions médicales, la distance déclarée et les tarifs appliqués. Des erreurs répétées ou des écarts systématiques peuvent entraîner un contrôle sur pièces ou une visite de conformité.",
    sourcesLegales: [],
    termeReliesSlug: ["sefi-facturation-electronique", "tiers-payant", "bon-de-transport", "cpam"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "declaration-activite-transport",
    terme: "Déclaration d'activité",
    termeComplet: "Déclaration annuelle d'activité de transport sanitaire",
    categorie: "administratif",
    definitionCourte:
      "Obligation réglementaire annuelle pour les entreprises de transport sanitaire agréées, consistant à transmettre à l'ARS les données d'activité (nombre de transports, véhicules, personnels).",
    definitionLongue:
      "La déclaration annuelle d'activité est une obligation imposée aux entreprises de transport sanitaire agréées par l'ARS. Elle doit être transmise avant le 31 mars de chaque année au service de régulation et d'appui de l'ARS compétente, et couvre l'année civile précédente.\n\nElle comprend généralement : le nombre de transports réalisés par type (urgent, programmé, inter-hospitalier), le nombre de véhicules en service (ambulances type A1, A2, B, VSL), les effectifs (ambulanciers DEA, auxiliaires, chauffeurs VSL), le chiffre d'affaires global, et la répartition des financements (Assurance Maladie, autres financeurs).\n\nCes données permettent à l'ARS de piloter l'offre de transport sanitaire sur son territoire, d'identifier les zones de sous-densité ou de sur-densité, et d'adapter les schémas régionaux de santé. Le non-respect de cette obligation déclarative peut entraîner une mise en demeure et des sanctions dans le cadre du renouvellement de l'agrément.",
    sourcesLegales: [
      {
        intitule: "Article R.6312-1 du code de la santé publique",
        url: "https://www.legifrance.gouv.fr/codes/section_lc/LEGISCTA000006190522",
      },
    ],
    termeReliesSlug: ["agrement-ars", "ars-agence-regionale-sante", "transport-sanitaire-programme"],
    miseAJour: "2026-06-28",
  },
  // ────────────────────────────────────────────────────────────────────
  // TECHNIQUE (20 termes)
  // ────────────────────────────────────────────────────────────────────
  {
    slug: "sefi-facturation-electronique",
    terme: "SEFi",
    termeComplet: "Système de Facturation Électronique pour le transport sanitaire",
    categorie: "technique",
    abreviation: "SEFi",
    definitionCourte:
      "Système informatique permettant la transmission dématérialisée des feuilles de transport à l'Assurance Maladie, accélérant les remboursements et réduisant les erreurs de facturation.",
    definitionLongue:
      "Le SEFi (Système de Facturation Électronique) est le dispositif de télétransmission des feuilles de transport sanitaire vers les caisses d'assurance maladie. Il permet aux entreprises d'ambulances et de VSL de transmettre leurs actes de facturation de manière dématérialisée, en remplacement des feuilles de transport papier.\n\nLa télétransmission via SEFi présente plusieurs avantages : réduction des délais de remboursement (paiement sous 5 jours ouvrés au lieu de plusieurs semaines), diminution des erreurs de saisie, traçabilité complète des actes facturés, et détection automatique des anomalies. Elle est réalisée depuis un logiciel de gestion agréé par l'Assurance Maladie, interfacé avec les bornes de lecture de la carte Vitale.\n\nL'utilisation du SEFi est conditionnée à la signature d'une convention de télétransmission avec la CPAM et à l'utilisation d'un logiciel agréé. Le non-respect des formats de télétransmission entraîne le rejet des flux et le retard des remboursements.",
    sourcesLegales: [
      {
        intitule: "Assurance Maladie - Télétransmission dans le transport sanitaire",
        url: "https://www.ameli.fr/transporteur-sanitaire/exercice-professionnel/informatique-et-teletransmission",
      },
    ],
    termeReliesSlug: ["carte-vitale", "lecteur-sesam-vitale", "conventionnement-cpam", "logiciel-agree"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "geolocalistation-gps",
    terme: "Géolocalisation GPS",
    termeComplet: "Géolocalisation GPS des véhicules sanitaires",
    categorie: "technique",
    definitionCourte:
      "Technologie de localisation en temps réel des ambulances et VSL permettant l'optimisation des tournées, la régulation des gardes et la traçabilité des interventions.",
    definitionLongue:
      "La géolocalisation GPS dans le transport sanitaire est l'utilisation de systèmes de localisation par satellite pour suivre en temps réel la position des véhicules sanitaires. Elle est utilisée à plusieurs fins : l'optimisation des tournées programmées (regroupement des transports, calcul des distances réelles), la régulation des gardes ATSU (dispatching du véhicule disponible le plus proche), et la traçabilité des interventions à des fins de facturation et de contrôle.\n\nLes systèmes de géolocalisation professionnels pour transport sanitaire incluent généralement un boîtier embarqué connecté au réseau GSM/4G, une interface de gestion sur ordinateur ou tablette pour le responsable d'exploitation, et une application mobile pour le chauffeur. Ces systèmes peuvent être couplés aux logiciels de facturation SEFi pour automatiser la saisie des distances parcourue lors de la facturation CPAM.\n\nL'utilisation de données de géolocalisation doit respecter le RGPD et faire l'objet d'une information des salariés concernés (conformément aux obligations CNIL). La durée de conservation des données de localisation est limitée.",
    sourcesLegales: [],
    termeReliesSlug: ["sefi-facturation-electronique", "atsu-association-transport-sanitaire-urgent"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "dmp-dossier-medical-partage",
    terme: "DMP",
    termeComplet: "Dossier Médical Partagé",
    categorie: "technique",
    abreviation: "DMP",
    definitionCourte:
      "Carnet de santé numérique du patient accessible par l'ensemble des professionnels de santé autorisés, centralisant les antécédents, ordonnances, résultats d'examens et comptes-rendus.",
    definitionLongue:
      "Le Dossier Médical Partagé (DMP) est un service numérique de santé permettant à chaque assuré de centraliser et partager ses informations de santé avec les professionnels de santé de son choix. Créé par la loi du 13 août 2004, rendu obligatoire pour tous les assurés par la loi du 26 janvier 2016 (loi de modernisation du système de santé), il est hébergé sur l'infrastructure de l'Assurance Maladie.\n\nLe DMP contient : les antécédents médicaux et chirurgicaux, les traitements en cours, les allergies, les résultats d'analyses biologiques et d'imagerie, les comptes-rendus d'hospitalisation, les vaccinations, et les directives anticipées du patient.\n\nPour les professionnels du transport sanitaire, l'accès au DMP peut être utile lors de prises en charge urgentes pour connaître les antécédents du patient (allergies, traitements anticoagulants, pathologies cardiaques) avant son arrivée à l'hôpital. L'accès nécessite l'accord du patient et une carte CPS (Carte de Professionnel de Santé).",
    sourcesLegales: [
      {
        intitule: "Loi n° 2004-810 du 13 août 2004 relative à l'assurance maladie - article 3",
        url: "https://www.legifrance.gouv.fr/loda/id/JORFTEXT000000625158",
      },
    ],
    termeReliesSlug: ["carte-vitale", "numero-ins", "lecteur-sesam-vitale"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "carte-vitale",
    terme: "Carte Vitale",
    termeComplet: "Carte Vitale d'Assurance Maladie",
    categorie: "technique",
    definitionCourte:
      "Carte à puce verte délivrée par l'Assurance Maladie à chaque assuré, permettant la télétransmission des actes de soins et l'identification du patient dans le système de santé.",
    definitionLongue:
      "La carte Vitale est une carte à puce délivrée par l'Assurance Maladie à tout assuré social et ayant droit. Elle contient les informations administratives de l'assuré (numéro de sécurité sociale, identité, droits ouverts) et permet la télétransmission directe des feuilles de soins à l'Assurance Maladie, remplaçant les feuilles de soins papier.\n\nDans le transport sanitaire, la carte Vitale est lue par le lecteur SESAM-Vitale embarqué ou disponible au siège de l'entreprise. Sa lecture permet : l'identification certifiée du patient, la vérification de l'ouverture de ses droits à l'Assurance Maladie, et la préremplissage automatique des informations sur la feuille de transport électronique envoyée via SEFi.\n\nLa carte Vitale 2 (version actuelle) intègre une photo du titulaire. Une mise à jour annuelle est recommandée pour actualiser les droits. En cas d'urgence, le transport peut être réalisé sans carte Vitale, la régularisation administrative étant effectuée ultérieurement.",
    sourcesLegales: [],
    termeReliesSlug: ["sefi-facturation-electronique", "lecteur-sesam-vitale", "tiers-payant"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "lecteur-sesam-vitale",
    terme: "Lecteur SESAM-Vitale",
    termeComplet: "Lecteur SESAM-Vitale pour transport sanitaire",
    categorie: "technique",
    definitionCourte:
      "Dispositif de lecture des cartes Vitale et CPS permettant la télétransmission sécurisée des actes de transport sanitaire à l'Assurance Maladie via le protocole SESAM-Vitale.",
    definitionLongue:
      "Le lecteur SESAM-Vitale est un périphérique informatique permettant de lire les données de la carte Vitale du patient et de la carte CPS (Carte de Professionnel de Santé) du praticien pour l'authentification et la signature électronique des feuilles de soins. Dans le transport sanitaire, ce dispositif est couplé au logiciel de gestion agréé pour transmettre les données de transport via SEFi.\n\nIl en existe plusieurs formes : le lecteur de bureau fixe au siège de l'entreprise, le lecteur portable embarqué dans le véhicule pour une lecture au domicile du patient, et les solutions intégrées dans les tablettes ou smartphones professionnels. Les modèles homologués sont certifiés par le GIE SESAM-Vitale qui garantit leur conformité aux normes de sécurité de l'Assurance Maladie.\n\nL'utilisation d'un lecteur non homologué ou d'un logiciel non agréé est susceptible de bloquer la télétransmission et d'entraîner des rejets de facturation. La liste des matériels homologués est disponible sur le site du GIE SESAM-Vitale.",
    sourcesLegales: [],
    termeReliesSlug: ["sefi-facturation-electronique", "carte-vitale", "logiciel-agree"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "norme-en-1789",
    terme: "Norme EN 1789",
    termeComplet: "Norme européenne EN 1789 — Véhicules de transport médical",
    categorie: "technique",
    alternativesOrtho: ["NF EN 1789"],
    definitionCourte:
      "Norme européenne fixant les exigences de construction, équipement et performances des véhicules de transport médical (ambulances). Décline les types A1, A2, B et C selon leur niveau d'équipement.",
    definitionLongue:
      "La norme européenne EN 1789 (Véhicules de transport médical et leur équipement — Ambulances routières) est le référentiel technique définissant les exigences de conception, de construction, d'équipement et de performance auxquelles doivent répondre les ambulances. Elle est harmonisée au niveau européen et transposée en droit français comme norme NF EN 1789.\n\nElle classe les véhicules de transport médical en plusieurs types :\n- Type A1 : ambulance de transport pour un patient unique\n- Type A2 : ambulance de transport pour plusieurs patients\n- Type B : ambulance de soins d'urgence (équipement de soins complet)\n- Type C : unité mobile de soins intensifs (SMUR)\n\nPour chaque type, la norme définit : les dimensions minimales du compartiment patient, les équipements médicaux obligatoires (oxygène, aspirateur, défibrillateur, etc.), les exigences de sécurité (fixation du brancard, ceintures), les performances acoustiques et lumineuses des avertisseurs, et les exigences électriques.\n\nLe respect de la norme EN 1789 est une condition préalable à l'immatriculation du véhicule dans la catégorie ambulance et à l'obtention de l'agrément ARS.",
    sourcesLegales: [
      {
        intitule: "AFNOR - NF EN 1789 Véhicules de transport médical",
        url: "https://www.boutique.afnor.org/fr-fr/norme/nf-en-1789/vehicules-de-transport-medical-et-leur-equipement-ambulances-routieres/fa186085/82272",
      },
    ],
    termeReliesSlug: ["ambulance-type-a1", "ambulance-type-b", "ambulance-type-c", "agrement-ars"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "logiciel-agree",
    terme: "Logiciel agréé",
    termeComplet: "Logiciel de facturation agréé pour le transport sanitaire",
    categorie: "technique",
    definitionCourte:
      "Logiciel de gestion certifié par l'Assurance Maladie pour la facturation électronique des actes de transport sanitaire. Son utilisation est obligatoire pour la télétransmission SEFi.",
    definitionLongue:
      "Un logiciel agréé de transport sanitaire est un logiciel de facturation et de gestion certifié par l'Assurance Maladie (via le GIE SESAM-Vitale) pour être compatible avec les normes de télétransmission. Il permet de créer les feuilles de transport électroniques, de lire les cartes Vitale, de calculer automatiquement les tarifs conventionnels, et de transmettre les données de facturation via SEFi.\n\nLes principaux éditeurs de logiciels agréés pour le transport sanitaire sont : Nomad, Enovacar, Ambulances Plus, Mediflux, et d'autres solutions métier. Ces logiciels intègrent les mises à jour tarifaires dès leur publication (changements de forfaits kilométriques, nouveaux avenants conventionnels) pour garantir la conformité des facturations.\n\nL'utilisation d'un logiciel non agréé ou d'une version obsolète expose l'entreprise à des rejets de télétransmission et à des rappels de facturation indus. Les entreprises doivent maintenir leur logiciel à jour et renouveler leurs paramètres de connexion avec la CPAM lors des changements de convention.",
    sourcesLegales: [],
    termeReliesSlug: ["sefi-facturation-electronique", "lecteur-sesam-vitale", "conventionnement-cpam"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "tracabilite-transport",
    terme: "Traçabilité",
    termeComplet: "Traçabilité du transport sanitaire",
    categorie: "technique",
    definitionCourte:
      "Enregistrement horodaté de toutes les étapes du transport sanitaire (prise de commande, départ, prise en charge patient, arrivée, retour) permettant la facturation et les contrôles qualité.",
    definitionLongue:
      "La traçabilité dans le transport sanitaire désigne l'ensemble des procédures et outils permettant d'enregistrer et de documenter toutes les étapes d'une prestation de transport, depuis la prise en charge de la demande jusqu'au retour du véhicule au siège.\n\nElle comprend : l'horodatage de la demande de transport, les heures de départ et d'arrivée du véhicule, l'identité du conducteur et du convoyeur, les données du patient (avec son consentement), le trajet effectué (géolocalisation ou kilométrage), les actes réalisés à bord, la signature du bon de transport par le patient ou son représentant, et la transmission électronique des données de facturation.\n\nLa traçabilité est essentielle pour plusieurs raisons : elle justifie les actes facturés en cas de contrôle CPAM, elle permet l'analyse de la performance opérationnelle de l'entreprise (taux d'occupation des véhicules, temps moyens d'intervention), et elle constitue une preuve en cas de litige avec un patient ou un prescripteur.",
    sourcesLegales: [],
    termeReliesSlug: ["sefi-facturation-electronique", "geolocalistation-gps", "bon-de-transport"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "tablette-embarquee",
    terme: "Tablette embarquée",
    termeComplet: "Tablette numérique embarquée dans le véhicule sanitaire",
    categorie: "technique",
    definitionCourte:
      "Outil numérique fixé dans l'habitacle du véhicule sanitaire permettant la gestion des courses, la lecture des cartes Vitale, la signature électronique des bons de transport et la communication avec le dispatching.",
    definitionLongue:
      "La tablette embarquée est un dispositif numérique monté dans le véhicule sanitaire (généralement fixé sur le tableau de bord ou entre les sièges avant) qui intègre les fonctions nécessaires à la gestion opérationnelle du transport : réception et validation des missions depuis le dispatching, lecture de la carte Vitale via un lecteur SESAM-Vitale intégré ou connecté en Bluetooth, signature électronique du bon de transport par le patient, navigation GPS avec calcul du trajet optimal, et communication voix et données avec le centre de régulation.\n\nElle constitue le terminal de terrain du logiciel de gestion agréé, permettant la saisie des données en temps réel et la télétransmission immédiate (ou différée en cas de zone sans réseau) à la CPAM via SEFi. Certains modèles intègrent également un imprimante thermique portable pour éditer les bons de transport papier lorsque le patient ne peut pas signer électroniquement.\n\nL'utilisation de tablettes embarquées a considérablement réduit les délais de remboursement et les erreurs de facturation dans les entreprises qui les ont adoptées.",
    sourcesLegales: [],
    termeReliesSlug: ["sefi-facturation-electronique", "lecteur-sesam-vitale", "geolocalistation-gps", "logiciel-agree"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "radio-professionnelle",
    terme: "Radio professionnelle",
    termeComplet: "Radio professionnelle VHF/UHF pour ambulances",
    categorie: "technique",
    definitionCourte:
      "Système de communication radio analogique ou numérique permettant la liaison entre les véhicules sanitaires et le centre de régulation, indépendant du réseau téléphonique.",
    definitionLongue:
      "Les radios professionnelles à fréquences dédiées constituent un outil de communication de secours essentiel dans le transport sanitaire, complémentaire aux communications via téléphone mobile. Elles permettent la liaison entre les véhicules et le centre de dispatch en cas de défaillance du réseau téléphonique (zone blanche, saturation du réseau lors de catastrophes).\n\nLes fréquences allouées aux transporteurs sanitaires privés sont attribuées par l'ARCEP (Autorité de Régulation des Communications Électroniques et des Postes) via les ARS. Les systèmes modernes utilisent des réseaux radio numériques (TETRA, DMR) offrant de meilleures performances que les systèmes analogiques traditionnels.\n\nLes SMUR et les SAMU utilisent des réseaux radio dédiés (réseau ANTARES pour les services de secours) qui permettent une communication nationale interopérable entre tous les acteurs du secours (pompiers, SAMU, police, gendarmerie).",
    sourcesLegales: [],
    termeReliesSlug: ["samu-centre-15", "smur", "atsu-association-transport-sanitaire-urgent"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "tachygraphe",
    terme: "Tachygraphe",
    termeComplet: "Tachygraphe numérique pour véhicules sanitaires lourds",
    categorie: "technique",
    definitionCourte:
      "Appareil de contrôle enregistrant la vitesse, les distances et les temps de conduite et de repos des conducteurs. Obligatoire pour certains véhicules sanitaires de plus de 3,5 tonnes.",
    definitionLongue:
      "Le tachygraphe est un dispositif électronique homologué installé sur les véhicules de transport, qui enregistre en continu la vitesse du véhicule, les distances parcourues, les temps de conduite, de repos et les activités du conducteur. Son utilisation est régie par le règlement européen CE n°561/2006 sur les temps de conduite et de repos.\n\nDans le transport sanitaire, le tachygraphe est obligatoire pour les véhicules dont le poids total autorisé en charge (PTAC) dépasse 3,5 tonnes, soit principalement les véhicules bariatriques lourds ou certaines ambulances de grande capacité. Les ambulances standard de type A1/A2/B ont généralement un PTAC inférieur à 3,5 tonnes et ne sont pas soumises à cette obligation.\n\nL'équipage ambulancier doit utiliser des cartes conducteur individuelles dans le tachygraphe numérique, permettant aux services de contrôle de vérifier le respect des temps de conduite et de repos réglementaires. Les infractions sont passibles d'amendes et peuvent engager la responsabilité du chef d'entreprise.",
    sourcesLegales: [],
    termeReliesSlug: ["ambulance-type-b", "vehicule-bariatrique"],
    miseAJour: "2026-06-28",
  },
  // ────────────────────────────────────────────────────────────────────
  // FINANCEMENT (suite)
  // ────────────────────────────────────────────────────────────────────
  {
    slug: "remboursement-100-ald",
    terme: "Remboursement 100 % ALD",
    termeComplet: "Prise en charge à 100 % des transports en Affection de Longue Durée",
    categorie: "financement",
    definitionCourte:
      "Pour les patients en ALD, les transports sanitaires en rapport avec leur affection sont remboursés à 100 % par l'Assurance Maladie (exonération totale du ticket modérateur).",
    definitionLongue:
      "Les patients atteints d'une Affection de Longue Durée (ALD) bénéficient d'un remboursement intégral (100 %) des frais de transport sanitaire en rapport direct avec leur affection exonérante. Cette prise en charge totale s'applique aussi bien aux transports par ambulance que par VSL ou taxi conventionné.\n\nLa condition essentielle est que le transport soit prescrit par un médecin et soit en rapport avec le traitement de l'ALD (consultation spécialisée, hospitalisation pour l'ALD, séances de dialyse, chimiothérapie, radiothérapie...). Les transports pour motifs non liés à l'ALD restent remboursés au taux habituel (65 %).\n\nL'exonération du ticket modérateur doit être indiquée sur la prescription médicale de transport (case appropriée cochée). L'Assurance Maladie vérifie la cohérence entre le diagnostic exonérant et la destination du transport. En cas de doute, elle peut demander l'accord préalable d'un médecin-conseil.",
    sourcesLegales: [
      {
        intitule: "Article L.322-3 du code de la sécurité sociale - exonérations ALD",
        url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000038811547",
      },
    ],
    termeReliesSlug: ["ald-affection-longue-duree", "ald30", "ticket-moderateur", "prescription-medicale-transport"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "mutuelle-complementaire",
    terme: "Mutuelle complémentaire",
    termeComplet: "Assurance maladie complémentaire (mutuelle)",
    categorie: "financement",
    alternativesOrtho: ["assurance complémentaire", "complémentaire santé"],
    definitionCourte:
      "Organisme privé (mutuelle, institution de prévoyance, société d'assurance) couvrant tout ou partie du ticket modérateur et des dépassements d'honoraires non remboursés par l'Assurance Maladie obligatoire.",
    definitionLongue:
      "La mutuelle complémentaire santé (AMC — Assurance Maladie Complémentaire) est un organisme privé qui complète les remboursements de l'Assurance Maladie obligatoire (AMO). Dans le transport sanitaire, la mutuelle peut prendre en charge tout ou partie du ticket modérateur (35 % du tarif pour les non-ALD), ainsi que les éventuels frais de confort (chambre particulière, transport non prescrit...).\n\nDepuis le 1er janvier 2016, les salariés du secteur privé bénéficient obligatoirement d'une complémentaire santé collective proposée par leur employeur (ANI — Accord National Interprofessionnel). Les indépendants et non-salariés doivent souscrire une complémentaire individuelle.\n\nPour les patients en situation de précarité ne pouvant se payer de mutuelle, la Complémentaire Santé Solidaire (CSS) joue ce rôle gratuitement sous conditions de ressources. Dans les faits, l'impact de la mutuelle sur le remboursement des transports sanitaires est limité car le tiers payant généralisé couvre déjà la part AMO sans avance de frais.",
    sourcesLegales: [],
    termeReliesSlug: ["amo-assurance-maladie-obligatoire", "amc-assurance-maladie-complementaire", "css-complementaire-sante-solidaire", "ticket-moderateur"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "tarif-conventionne",
    terme: "Tarif conventionné",
    termeComplet: "Tarif conventionnel du transport sanitaire",
    categorie: "financement",
    definitionCourte:
      "Tarif fixé par la convention nationale entre les transporteurs sanitaires et l'Assurance Maladie, servant de base au remboursement. Tout dépassement est interdit pour les transporteurs conventionnés.",
    definitionLongue:
      "Le tarif conventionnel dans le transport sanitaire est le tarif officiel négocié entre les organisations professionnelles des transporteurs sanitaires et l'Assurance Maladie dans le cadre de la convention nationale. Il sert de base de remboursement pour l'Assurance Maladie et ne peut pas être dépassé par les transporteurs conventionnés, sous peine de résiliation de leur convention.\n\nLes tarifs comprennent : le forfait de prise en charge (FPA), le tarif kilométrique (TK), les majorations (nuit, dimanche, jours fériés, transport d'urgence), et les indemnités diverses (attente, péages, frais de mise à disposition). Ces tarifs sont révisés périodiquement par avenant à la convention nationale.\n\nContrairement aux professions médicales libérales où le dépassement d'honoraires est autorisé en secteur 2 et 3, les transporteurs sanitaires conventionnés ne peuvent jamais pratiquer de dépassements. Seuls les transports non remboursables (confort personnel, transport non prescrit) peuvent être facturés librement.",
    sourcesLegales: [
      {
        intitule: "Convention nationale des transporteurs sanitaires - tarifs et nomenclature",
        url: "https://www.ameli.fr/transporteur-sanitaire/exercice-professionnel/conventions-et-reglements",
      },
    ],
    termeReliesSlug: ["conventionnement-cpam", "forfait-kilometric", "remboursement-transport", "indu"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "remboursement-65-pourcent",
    terme: "Remboursement 65 %",
    termeComplet: "Taux de remboursement standard des transports sanitaires",
    categorie: "financement",
    definitionCourte:
      "Taux de prise en charge standard par l'Assurance Maladie pour les transports sanitaires prescrits (65 % du tarif conventionnel), le solde (35 %) restant à la charge du patient ou de sa mutuelle.",
    definitionLongue:
      "Le remboursement à 65 % est le taux de droit commun applicable aux transports sanitaires prescrits non exonérés. Il s'applique notamment aux patients n'étant pas en ALD, aux transports non en rapport avec une ALD, et aux transports de certains types d'actes non pris en charge à 100 %.\n\nConcrètement, si le tarif conventionnel d'un transport est de 50 €, l'Assurance Maladie rembourse 32,50 € (65 %) et le patient doit prendre en charge 17,50 € (35 %, soit le ticket modérateur). Cette part restante peut être couverte par une complémentaire santé (mutuelle) ou la CSS pour les personnes aux ressources limitées.\n\nDans la pratique, grâce au tiers payant généralisé dans le transport sanitaire, le patient ne paie généralement rien au moment du transport : l'entreprise de transport facture directement la CPAM et, via le mécanisme de délégation de tiers payant, la mutuelle du patient pour la part complémentaire. Cette pratique simplifie l'accès aux soins mais nécessite une gestion administrative rigoureuse côté transporteur.",
    sourcesLegales: [
      {
        intitule: "Article R.322-10 du code de la sécurité sociale - participations assurés",
        url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000006743200",
      },
    ],
    termeReliesSlug: ["ticket-moderateur", "tiers-payant", "ald-affection-longue-duree", "amc-assurance-maladie-complementaire"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "majoration-nuit-dimanche",
    terme: "Majoration nuit / dimanche",
    termeComplet: "Majoration tarifaire pour transports de nuit, dimanche et jours fériés",
    categorie: "financement",
    definitionCourte:
      "Supplément tarifaire conventionnel appliqué aux transports sanitaires réalisés entre 20h et 8h, les dimanches et les jours fériés. Ces majorations sont remboursées par l'Assurance Maladie.",
    definitionLongue:
      "Les majorations tarifaires dans le transport sanitaire sont des suppléments prévus par la convention nationale et applicables dans des conditions horaires particulières :\n- Majoration de nuit (MN) : applicable aux transports débutant entre 20h et 8h\n- Majoration dimanche et jours fériés (MDF) : applicable aux transports débutant le dimanche ou un jour férié légal\n- Ces majorations peuvent se cumuler (transport la nuit d'un dimanche)\n\nCes majorations sont remboursées par l'Assurance Maladie dans les mêmes conditions que le tarif de base (65 % ou 100 % selon le statut ALD du patient). Elles sont automatiquement calculées par les logiciels de facturation agréés en fonction de l'heure de départ du transport.\n\nEn cas de transport urgent la nuit prescrit par le SAMU, des majorations spécifiques peuvent s'appliquer. Ces tarifs sont révisés périodiquement dans le cadre des avenants à la convention nationale.",
    sourcesLegales: [
      {
        intitule: "Convention nationale des transporteurs sanitaires - annexe tarifaire",
        url: "https://www.ameli.fr/transporteur-sanitaire/exercice-professionnel/conventions-et-reglements",
      },
    ],
    termeReliesSlug: ["tarif-conventionne", "remboursement-transport", "forfait-kilometric"],
    miseAJour: "2026-06-28",
  },
  // ────────────────────────────────────────────────────────────────────
  // RÉGLEMENTATION (suite)
  // ────────────────────────────────────────────────────────────────────
  {
    slug: "inspection-veillage-ars",
    terme: "Inspection ARS",
    termeComplet: "Inspection et contrôle des entreprises de transport sanitaire par l'ARS",
    categorie: "reglementation",
    definitionCourte:
      "Contrôle périodique ou inoppiné réalisé par les agents de l'ARS pour vérifier la conformité de l'entreprise de transport sanitaire aux conditions d'agrément (véhicules, équipements, personnels).",
    definitionLongue:
      "Les inspections des entreprises de transport sanitaire sont réalisées par les agents de l'Agence Régionale de Santé (ARS) dans le cadre de leur mission de contrôle du respect des conditions d'agrément. Ces contrôles peuvent être programmés (renouvellement d'agrément, suivi suite à une plainte) ou inopinés.\n\nLes agents vérifient : la conformité des véhicules (équipements réglementaires, état général, normes EN 1789), la validité des documents obligatoires (agréments, cartes professionnelles, assurances), les qualifications du personnel (DEA, auxiliaire, AFGSU à jour), les protocoles de désinfection et d'hygiène, et la tenue des registres réglementaires.\n\nEn cas de manquement, l'ARS peut émettre : une simple recommandation, une mise en demeure de mise en conformité dans un délai imparti, une suspension temporaire de l'agrément, ou un retrait définitif de l'agrément pour les manquements les plus graves. Ces décisions font l'objet d'un droit de recours administratif.",
    sourcesLegales: [
      {
        intitule: "Articles L.6313-1 et suivants du code de la santé publique - inspection",
        url: "https://www.legifrance.gouv.fr/codes/section_lc/LEGISCTA000006190523",
      },
    ],
    termeReliesSlug: ["agrement-ars", "ars-agence-regionale-sante", "carte-professionnelle-ambulancier"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "rapport-annuel-activite-ars",
    terme: "Rapport annuel d'activité",
    termeComplet: "Rapport annuel d'activité transmis à l'ARS",
    categorie: "reglementation",
    definitionCourte:
      "Document annuel obligatoire transmis à l'ARS par chaque entreprise de transport sanitaire agréée, synthétisant l'activité, les effectifs, le parc de véhicules et les incidents de l'année écoulée.",
    definitionLongue:
      "Le rapport annuel d'activité est transmis à l'ARS par toute entreprise titulaire d'un agrément de transport sanitaire. Il doit être déposé avant le 31 mars de chaque année pour l'exercice précédent. Son contenu est fixé par les textes réglementaires et les instructions de l'ARS compétente.\n\nIl comprend généralement : les données quantitatives d'activité (nombre de transports par type, distances cumulées), la liste des véhicules agréés avec leurs numéros d'immatriculation et dates de contrôle technique, les effectifs de personnel qualifié et leurs diplômes, les éventuels incidents graves survenus (accidents de la route, plaintes patients), les actions de formation continue réalisées, et les résultats des contrôles internes de conformité.\n\nCes rapports permettent à l'ARS de suivre l'évolution de l'offre de transport sanitaire sur son territoire et d'identifier les entreprises en difficulté ou ne respectant pas leurs obligations. Ils constituent un élément important du dossier de renouvellement d'agrément.",
    sourcesLegales: [],
    termeReliesSlug: ["agrement-ars", "ars-agence-regionale-sante", "declaration-activite-transport"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "renouvellement-agrement",
    terme: "Renouvellement d'agrément",
    termeComplet: "Renouvellement de l'agrément ARS de transport sanitaire",
    categorie: "reglementation",
    definitionCourte:
      "Procédure administrative périodique permettant à une entreprise de transport sanitaire de maintenir son autorisation d'exercer en vérifiant le maintien des conditions initiales d'agrément.",
    definitionLongue:
      "Le renouvellement d'agrément ARS est une procédure obligatoire pour les entreprises de transport sanitaire qui doivent périodiquement démontrer qu'elles continuent de respecter les conditions ayant justifié l'octroi initial de leur autorisation. La fréquence et les modalités de renouvellement sont fixées par les textes réglementaires et peuvent varier selon les régions.\n\nLe dossier de renouvellement comprend généralement : les documents administratifs actualisés (KBIS récent, assurance RC professionnelle, justificatifs domiciliaires), les pièces relatives aux véhicules (certificats de conformité EN 1789, contrôles techniques récents, vignettes CRIT'Air), les documents concernant le personnel (copies des DEA, DEAA, AFGSU en cours de validité, fiches de poste), et les rapports d'activité des années précédentes.\n\nL'ARS instruit le dossier et peut demander des pièces complémentaires ou procéder à une inspection avant de statuer sur le renouvellement. En cas de refus, l'entreprise dispose d'un droit de recours devant le tribunal administratif.",
    sourcesLegales: [
      {
        intitule: "Article R.6312-5 du code de la santé publique",
        url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000006918051",
      },
    ],
    termeReliesSlug: ["agrement-ars", "ars-agence-regionale-sante", "inspection-veillage-ars"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "zone-carence",
    terme: "Zone de carence",
    termeComplet: "Zone de carence en transport sanitaire privé",
    categorie: "reglementation",
    definitionCourte:
      "Zone géographique insuffisamment couverte par des prestataires de transport sanitaire privés, nécessitant l'intervention des services publics de secours (SDIS) en carence ambulancière.",
    definitionLongue:
      "Une zone de carence en transport sanitaire est une zone géographique où l'offre de prestataires privés (ambulances ATSU) est insuffisante pour répondre à la demande d'urgences non médicalisées en dehors des heures ouvrables. Dans ces zones, lorsque le SAMU-Centre 15 ne peut pas obtenir de réponse d'un transporteur privé dans un délai acceptable, il fait appel aux sapeurs-pompiers du SDIS en « carence ambulancière ».\n\nLa carence ambulancière est une situation coûteuse pour les SDIS et préjudiciable à leur mission première (incendies, accidents). Sa réduction est un objectif des ARS qui cherchent à améliorer la couverture des gardes ATSU sur leur territoire, notamment par des incitations financières (forfait de garde) et la restructuration des associations ATSU.\n\nLes zones rurales et les territoires peu peuplés sont les plus touchés par ce phénomène, faute de rentabilité suffisante pour maintenir des équipages de garde la nuit et le week-end.",
    sourcesLegales: [],
    termeReliesSlug: ["atsu-association-transport-sanitaire-urgent", "garde-departementale-atsu", "samu-centre-15", "carence-ambulanciere"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "contrat-engagement-qualite",
    terme: "Contrat d'engagement qualité",
    termeComplet: "Contrat d'engagement qualité avec l'Assurance Maladie",
    categorie: "reglementation",
    definitionCourte:
      "Accord entre la CPAM et l'entreprise de transport sanitaire fixant des objectifs de qualité (délais, conformité facturation, taux d'erreur) et des incitations financières en contrepartie.",
    definitionLongue:
      "Le contrat d'engagement qualité est un dispositif incitatif proposé par les CPAM aux entreprises de transport sanitaire conventionnées présentant un volume d'activité significatif. Il vise à améliorer la qualité des prestations et la conformité de la facturation en échange de bonifications tarifaires ou de simplifications administratives.\n\nLes critères évalués comprennent généralement : le taux de conformité des prescriptions médicales présentées, le taux de rejets de télétransmission SEFi, le respect des délais de transport programmé, la qualité des informations transmises sur les bons de transport, et l'absence de plaintes patients répétées.\n\nCe dispositif s'inscrit dans la logique de la maîtrise médicalisée des dépenses de santé : les transporteurs vertueux sont récompensés, tandis que ceux présentant des anomalies récurrentes font l'objet d'un accompagnement ou de contrôles renforcés par le service médical de la CPAM.",
    sourcesLegales: [],
    termeReliesSlug: ["conventionnement-cpam", "cpam", "taux-de-controle-cpam", "indu"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "transport-coordonne",
    terme: "Transport coordonné",
    termeComplet: "Transport sanitaire coordonné par une plateforme",
    categorie: "reglementation",
    definitionCourte:
      "Organisation du transport sanitaire programmé via une plateforme de coordination regroupant plusieurs entreprises, visant à optimiser le remplissage des véhicules et réduire les coûts pour l'Assurance Maladie.",
    definitionLongue:
      "Le transport coordonné est un modèle organisationnel dans lequel plusieurs entreprises de transport sanitaire d'un même territoire mutualisent leurs ressources via une plateforme de coordination (souvent une association ATSU ou un GIE) pour optimiser les transports programmés (dialyse, chimiothérapie, radiothérapie).\n\nLa plateforme centralise les demandes de transport, les affecte aux véhicules disponibles selon leur localisation et leur disponibilité, et optimise les tournées pour le transport partagé. Elle gère également les relations avec les prescripteurs (hôpitaux, établissements de dialyse) et la facturation centralisée.\n\nL'Assurance Maladie encourage fortement le développement du transport coordonné car il permet de réduire significativement les coûts (moins de véhicules à moitié vides, moins de déplacements à vide) tout en maintenant la qualité de service. Des expérimentations de plateformes de transport coordonné sont menées dans plusieurs régions dans le cadre de l'article 51 de la loi de financement de la sécurité sociale.",
    sourcesLegales: [],
    termeReliesSlug: ["transport-partage", "transport-iteratif", "dialyse", "atsu-association-transport-sanitaire-urgent"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "afgsu",
    terme: "AFGSU",
    termeComplet: "Attestation de Formation aux Gestes et Soins d'Urgence",
    categorie: "metier",
    abreviation: "AFGSU",
    definitionCourte:
      "Formation obligatoire pour tous les professionnels de santé, y compris les ambulanciers, certifiant la maîtrise des gestes de premiers secours et des techniques de soins d'urgence.",
    definitionLongue:
      "L'Attestation de Formation aux Gestes et Soins d'Urgence (AFGSU) est une certification réglementaire créée par l'arrêté du 3 mars 2006, obligatoire pour tous les professionnels de santé en exercice en France, y compris les ambulanciers DEA et auxiliaires ambulanciers.\n\nIl existe deux niveaux d'AFGSU : l'AFGSU niveau 1, destinée aux personnels administratifs et de service des établissements de santé, couvrant les urgences vitales et non vitales immédiates ; et l'AFGSU niveau 2, obligatoire pour les ambulanciers, qui approfondit les techniques de réanimation cardiopulmonaire, l'utilisation du DAE, la gestion des risques NRBC (nucléaire, radiologique, biologique, chimique) et les techniques de brancardage.\n\nL'AFGSU doit être renouvelée tous les 4 ans par une session de recyclage. Les centres de formation habilités par les ARS délivrent cette formation et attestation. L'absence d'AFGSU en cours de validité constitue un défaut de qualification susceptible d'entraîner des sanctions lors d'une inspection ARS.",
    sourcesLegales: [
      {
        intitule: "Arrêté du 3 mars 2006 relatif à l'attestation de formation aux gestes et soins d'urgence",
        url: "https://www.legifrance.gouv.fr/loda/id/JORFTEXT000000274429",
      },
    ],
    termeReliesSlug: ["dea-diplome-etat-ambulancier", "deaa-diplome-etat-auxiliaire-ambulancier", "agrement-ars"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "protocole-soins-ambulancier",
    terme: "Protocole de soins",
    termeComplet: "Protocole de soins d'urgence pour ambulanciers",
    categorie: "metier",
    definitionCourte:
      "Procédure standardisée définissant les actes autorisés par les ambulanciers DEA en cas d'urgence pendant le transport, dans l'attente de l'arrivée d'un médecin ou selon instruction médicale à distance.",
    definitionLongue:
      "Les protocoles de soins pour ambulanciers définissent les actes que les ambulanciers DEA sont autorisés à réaliser en situation d'urgence, dans le cadre d'une prescription médicale anticipée ou sur instruction du médecin régulateur du SAMU. Ces protocoles sont élaborés à l'échelon régional par les SAMU et les organisations professionnelles, sous l'autorité des ARSs.\n\nLes actes autorisés dans le cadre des protocoles peuvent comprendre : l'administration d'oxygène médical, l'utilisation du défibrillateur, la pose d'une voie veineuse périphérique dans certaines conditions, l'administration de médicaments spécifiques (adrénaline en cas d'arrêt cardiaque) sur instruction médicale expresse, et la mise en place d'immobilisations d'urgence.\n\nCes protocoles permettent d'améliorer la prise en charge des patients en attendant l'arrivée d'un médecin, tout en encadrant clairement les responsabilités juridiques. L'ambulancier qui agit dans le cadre d'un protocole établi est protégé juridiquement pour les actes qu'il réalise.",
    sourcesLegales: [
      {
        intitule: "Article L.4311-1 du code de la santé publique - actes infirmiers et délégation",
        url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000038610474",
      },
    ],
    termeReliesSlug: ["dea-diplome-etat-ambulancier", "afgsu", "samu-centre-15", "smur"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "infirmier-de-bord",
    terme: "Infirmier de bord",
    termeComplet: "Infirmier(ère) de bord SMUR",
    categorie: "metier",
    definitionCourte:
      "Infirmier(ère) spécialisé(e) travaillant au sein des équipes SMUR, participant aux sorties de réanimation pré-hospitalière aux côtés du médecin urgentiste.",
    definitionLongue:
      "L'infirmier(ère) de bord SMUR est un professionnel de santé titulaire du diplôme d'État d'infirmier (DEI), travaillant au sein d'une unité SMUR (Service Mobile d'Urgence et de Réanimation). Il ou elle participe aux interventions médicalisées en pré-hospitalier aux côtés du médecin urgentiste.\n\nSes missions comprennent : la préparation et l'administration des médicaments d'urgence sur prescription médicale, la surveillance des paramètres vitaux du patient (scope, oxymétrie de pouls, capnographie), la pose et la surveillance des voies d'abord vasculaires, l'assistance du médecin lors des gestes techniques (intubation, défibrillation), et la gestion du matériel médicalisé du SMUR.\n\nDans certains contextes, des infirmiers anesthésistes diplômés d'État (IADE) participent également aux sorties SMUR pour les transports de patients nécessitant une anesthésie ou une sédation prolongée pendant le transport (transport inter-hospitalier de réanimation).",
    sourcesLegales: [],
    termeReliesSlug: ["smur", "infirmier-transport", "samu-centre-15", "transport-inter-hospitalier-medicalise"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "ccmu",
    terme: "CCMU",
    termeComplet: "Classification Clinique des Malades aux Urgences",
    categorie: "medical",
    abreviation: "CCMU",
    definitionCourte:
      "Échelle de gravité en 5 niveaux (CCMU 1 à 5) utilisée aux urgences et par les médecins régulateurs SAMU pour évaluer l'état clinique du patient et orienter sa prise en charge.",
    definitionLongue:
      "La Classification Clinique des Malades aux Urgences (CCMU) est une échelle de triage médicale utilisée en France dans les services d'urgences et par les médecins régulateurs des SAMU-Centre 15. Elle classe les patients en 5 niveaux selon leur gravité clinique :\n- CCMU 1 : état clinique stable, acte diagnostique ou thérapeutique non invasif\n- CCMU 2 : état clinique stable, acte diagnostique ou thérapeutique invasif\n- CCMU 3 : état clinique susceptible de s'aggraver, sans mise en jeu du pronostic vital\n- CCMU 4 : pronostic vital engagé à court terme, sans manœuvre de réanimation immédiate\n- CCMU 5 : pronostic vital immédiatement engagé, réanimation immédiate nécessaire\n\nLe médecin régulateur utilise implicitement cette classification pour décider du niveau de réponse au transport (taxi conventionné, VSL, ambulance ATSU, SMUR) lors d'une demande d'intervention. Les niveaux CCMU 4 et 5 déclenchent systématiquement l'envoi d'un SMUR.",
    sourcesLegales: [],
    termeReliesSlug: ["samu-centre-15", "smur", "urgence-vitale", "transport-sanitaire-urgent"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "avc-transport",
    terme: "AVC",
    termeComplet: "Accident Vasculaire Cérébral — protocole de transport",
    categorie: "medical",
    abreviation: "AVC",
    definitionCourte:
      "Urgence neurologique nécessitant un transport immédiat par SMUR ou ambulance vers une unité neurovasculaire (UNV). Chaque minute perdue aggrave le pronostic (« Time is Brain »).",
    definitionLongue:
      "L'Accident Vasculaire Cérébral (AVC) est une urgence médicale absolue caractérisée par l'obstruction (AVC ischémique, 80 %) ou la rupture (AVC hémorragique, 20 %) d'un vaisseau cérébral. Le pronostic dépend directement du délai entre l'apparition des symptômes et la recanalisation thérapeutique (thrombolyse, thrombectomie) : dans l'AVC ischémique, chaque heure de retard correspond à la perte d'environ 120 millions de neurones.\n\nLe protocole de transport en cas d'AVC suspecté comprend : l'appel immédiat au 15 (SAMU), la régulation médicale par le médecin du SAMU-Centre 15, l'envoi d'un SMUR ou d'une ambulance ATSU selon la gravité clinique, et le pré-avis à l'unité neurovasculaire (UNV) la plus proche pour préparer l'accueil du patient.\n\nLes signes d'alerte de l'AVC peuvent être mémorisés avec l'acronyme FAST : Face (déviation faciale), Arm (faiblesse d'un bras), Speech (trouble de la parole), Time (heure des premiers symptômes). En présence de ces signes, le 15 doit être appelé sans délai.",
    sourcesLegales: [],
    termeReliesSlug: ["samu-centre-15", "smur", "urgence-vitale", "transport-sanitaire-urgent"],
    exemples: ["Patient présentant une déviation faciale et une faiblesse du bras droit depuis 30 minutes", "Appel SAMU pour bilan AVC avec orientation UNV"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "infarctus-transport",
    terme: "Infarctus du myocarde",
    termeComplet: "Infarctus du myocarde — protocole de transport pré-hospitalier",
    categorie: "medical",
    alternativesOrtho: ["IDM", "syndrome coronarien aigu"],
    definitionCourte:
      "Urgence cardiologique nécessitant un transport immédiat par SMUR vers une salle de coronarographie. L'objectif est de déboucher l'artère coronaire en moins de 90 minutes après le premier contact médical.",
    definitionLongue:
      "L'infarctus du myocarde avec sus-décalage du segment ST (STEMI) est la forme la plus grave du syndrome coronarien aigu (SCA). Il résulte de l'occlusion complète d'une artère coronaire par un thrombus, entraînant la nécrose progressive du muscle cardiaque.\n\nLe protocole pré-hospitalier comprend : l'appel au 15, la régulation médicale SAMU avec envoi d'un SMUR, la réalisation d'un électrocardiogramme (ECG) 12 dérivations en pré-hospitalier, la transmission de l'ECG à la salle de coronarographie pour confirmation diagnostique, l'administration d'anticoagulants et d'antiagrégants plaquettaires par le SMUR, et le transport direct vers le plateau de coronarographie (angioplastie primaire) sans passage par les urgences.\n\nL'objectif de délai porte-à-ballon (premier contact médical → recanalisation coronaire) est de 90 minutes. Ce délai est surveillé par les SAMU et les réseaux régionaux de prise en charge des SCA. Chaque minute compte car la surface de myocarde sauvée dépend directement de la rapidité de revascularisation.",
    sourcesLegales: [],
    termeReliesSlug: ["samu-centre-15", "smur", "urgence-vitale", "defibrillateur"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "desinfection-vehicule",
    terme: "Désinfection du véhicule",
    termeComplet: "Protocole de désinfection du véhicule sanitaire",
    categorie: "technique",
    definitionCourte:
      "Procédure obligatoire de nettoyage et désinfection du compartiment patient et des équipements après chaque transport, prévenant la transmission d'infections nosocomiales ou communautaires.",
    definitionLongue:
      "La désinfection du véhicule sanitaire est une obligation réglementaire et une exigence des bonnes pratiques d'hygiène visant à prévenir la transmission d'agents pathogènes d'un patient à l'autre. Elle est encadrée par les recommandations du HCSP (Haut Conseil de la Santé Publique) et les instructions de l'ARS.\n\nLe protocole standard comprend : le nettoyage mécanique des surfaces (brancard, poignées, surfaces de contact) avec un détergent-désinfectant bactéricide, virucide et fongicide ; la désinfection des équipements réutilisables (masques, oxymètre de pouls, tensiomètre) ; l'élimination des déchets d'activité de soins à risques infectieux (DASRI) dans les contenants adaptés ; et la vérification de la stérilité des consommables.\n\nEn cas de transport d'un patient porteur d'un agent hautement pathogène (tuberculose, Clostridium difficile, COVID-19...), des protocoles de désinfection renforcés s'appliquent, incluant l'usage d'équipements de protection individuelle (EPI) pour le personnel et une désinfection approfondie avec des produits adaptés au spectre du pathogène.",
    sourcesLegales: [],
    termeReliesSlug: ["ambulance-type-b", "dea-diplome-etat-ambulancier", "agrement-ars"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "soin-palliatif-transport",
    terme: "Transport en soins palliatifs",
    termeComplet: "Transport sanitaire dans le cadre des soins palliatifs",
    categorie: "medical",
    definitionCourte:
      "Transport d'un patient en soins palliatifs (phase terminale d'une maladie incurable) nécessitant une prise en charge spécifique axée sur le confort, la dignité et la gestion de la douleur.",
    definitionLongue:
      "Le transport de patients en soins palliatifs requiert une approche particulière de la part des équipes ambulancières. Ces patients, souvent en phase terminale d'une maladie cancéreuse ou dégénérative, présentent des besoins spécifiques : gestion de la douleur (présence de perfusion de morphiniques, pompe à perfusion), positionnement adapté à leur état (matelas anti-escarres, coussins de positionnement), accompagnement psychologique du patient et des proches présents, et communication avec les soignants de l'établissement de départ et d'arrivée.\n\nLes transports palliatifs sont souvent des retours à domicile depuis un hôpital ou un transfert vers une unité de soins palliatifs (USP) ou une maison de retraite médicalisée (EHPAD). Ils nécessitent une coordination préalable entre le service hospitalier, l'équipe de soins palliatifs à domicile (HAD, EMSP) et le transporteur.\n\nLa formation des ambulanciers DEA intègre désormais une sensibilisation à la communication en situation de fin de vie et à la gestion des soins de confort, en réponse à l'augmentation de ce type de transport.",
    sourcesLegales: [],
    termeReliesSlug: ["ambulance-type-b", "transport-inter-hospitalier", "prescription-medicale-transport"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "transport-psychiatrique",
    terme: "Transport psychiatrique",
    termeComplet: "Transport sanitaire pour patients psychiatriques",
    categorie: "medical",
    definitionCourte:
      "Transport d'un patient présentant des troubles psychiatriques aigus (agitation, hallucinations, tentative de suicide) nécessitant des protocoles spécifiques de sécurité et de communication.",
    definitionLongue:
      "Le transport psychiatrique est l'une des prises en charge les plus complexes pour les équipes ambulancières. Les patients en crise psychiatrique aiguë peuvent présenter des comportements imprévisibles (agitation, violence verbale ou physique, refus de transport) nécessitant des protocoles adaptés.\n\nEn cas de trouble psychiatrique aigu avec risque pour le patient ou pour autrui, le transport se fait en lien avec le SAMU-Centre 15, qui peut décider d'envoyer un SMUR ou de demander le concours des forces de l'ordre (procédure d'hospitalisation sans consentement — HDT/HO). L'équipe ambulancière ne peut pas contraindre physiquement un patient sans autorisation judiciaire.\n\nL'hospitalisation sous contrainte (soins psychiatriques sans consentement — SPSC) est encadrée par la loi du 5 juillet 2011, qui distingue les soins à la demande d'un tiers (SDT), les soins en cas de péril imminent (PI), et les soins sur décision du représentant de l'État (SDRE, anciennement HO).",
    sourcesLegales: [
      {
        intitule: "Loi n° 2011-803 du 5 juillet 2011 relative aux droits et à la protection des personnes faisant l'objet de soins psychiatriques",
        url: "https://www.legifrance.gouv.fr/loda/id/JORFTEXT000024312040",
      },
    ],
    termeReliesSlug: ["samu-centre-15", "smur", "transport-sanitaire-urgent"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "transport-nouveau-ne",
    terme: "Transport néonatal",
    termeComplet: "Transport sanitaire néonatal",
    categorie: "medical",
    definitionCourte:
      "Transport médicalisé d'un nouveau-né (de moins de 28 jours) nécessitant le recours à un incubateur de transport et une équipe spécialisée en néonatologie, le plus souvent via le SMUR néonatal.",
    definitionLongue:
      "Le transport néonatal est une modalité très spécifique de transport médicalisé destinée aux nouveau-nés prématurés ou malades nécessitant un transfert vers une unité de soins intensifs de néonatologie (USIN) ou de réanimation néonatale. Il requiert un équipement très spécifique : incubateur de transport permettant le maintien d'une température optimale, ventilateur néonatal, monitoring cardiaque et respiratoire adapté aux nouveau-nés, et médicaments d'urgence pédiatriques.\n\nCe transport est réalisé par les SMUR néonatals, services spécialisés attachés aux maternités de niveau III (CHU et CHR). Ils interviennent soit pour un transport primaire (de la maternité de naissance vers une USIN si le nourrisson présente une pathologie grave), soit pour un transport en retour (de l'USIN vers la maternité de proximité une fois l'état du nourrisson stabilisé).\n\nLes ambulanciers ordinaires ne sont pas habilités à réaliser ces transports qui nécessitent un médecin néonatologue ou un infirmier spécialisé en néonatologie à bord.",
    sourcesLegales: [],
    termeReliesSlug: ["smur", "transport-inter-hospitalier-medicalise", "samu-centre-15"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "vehicule-sanitaire-leger",
    terme: "VSL",
    termeComplet: "Véhicule Sanitaire Léger",
    categorie: "vehicule",
    abreviation: "VSL",
    alternativesOrtho: ["véhicule sanitaire léger", "transport en VSL"],
    definitionCourte:
      "Véhicule aménagé pour transporter des patients assis stables sur prescription médicale, conduit par un auxiliaire ambulancier. Plus économique que l'ambulance, il est remboursé par l'Assurance Maladie.",
    definitionLongue:
      "Le Véhicule Sanitaire Léger (VSL) est un véhicule de transport sanitaire terrestre destiné au transport de patients en position assise. Contrairement à l'ambulance, il ne dispose pas de la capacité à accueillir un patient allongé et n'est pas équipé pour réaliser des soins pendant le trajet. Il est conduit par un auxiliaire ambulancier (DEAA) et peut transporter jusqu'à 3 patients assis simultanément.\n\nLe VSL est utilisé pour les transports sanitaires programmés de patients assis stables : consultations médicales, séances de dialyse, chimiothérapie, radiothérapie, visites de contrôle post-opératoires. Il est plus économique que l'ambulance et remboursé par l'Assurance Maladie dans les mêmes conditions (65 % ou 100 % selon le statut ALD) sur prescription médicale.\n\nLa distinction entre VSL et ambulance dans la prescription médicale est importante : la prescription doit justifier la nécessité d'une ambulance si le patient ne peut pas être transporté en VSL. À défaut, la CPAM peut demander le remboursement de la différence tarifaire (indu).",
    sourcesLegales: [
      {
        intitule: "Article R.6312-1 du code de la santé publique - définition VSL",
        url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000006918047",
      },
    ],
    termeReliesSlug: ["deaa-diplome-etat-auxiliaire-ambulancier", "prescription-medicale-transport", "transport-partage", "ambulance-type-a1"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "taxi-conventionne-cpam",
    terme: "Taxi conventionné CPAM",
    termeComplet: "Taxi conventionné par la Caisse Primaire d'Assurance Maladie",
    categorie: "vehicule",
    definitionCourte:
      "Taxi agréé par la CPAM pour transporter des patients autonomes en position assise. Remboursé par l'Assurance Maladie, il est moins coûteux que le VSL pour les patients pouvant voyager comme dans un taxi ordinaire.",
    definitionLongue:
      "Le taxi conventionné CPAM est un taxi traditionnel dont le chauffeur a signé une convention individuelle avec la caisse primaire d'assurance maladie de son département pour transporter des patients vers des établissements de soins. Il est utilisé pour les patients en position assise, autonomes, qui n'ont pas besoin d'aide pour monter et descendre du véhicule.\n\nLes conditions de conventionnement varient selon les départements mais incluent généralement : la détention d'une licence de taxi, un véhicule en bon état et assuré, la souscription à la convention départementale, et une formation aux spécificités du transport médical. La liste des taxis conventionnés est disponible auprès de chaque CPAM.\n\nLe tarif du taxi conventionné est basé sur les tarifs réglementés des taxis, complétés d'éventuelles majorations conventionnelles. Il est généralement moins coûteux que le VSL pour les courtes distances. La prise en charge est soumise aux mêmes conditions que le VSL : prescription médicale, patient assis stable, distance justifiée.",
    sourcesLegales: [
      {
        intitule: "Convention nationale des taxis conventionnés CPAM",
        url: "https://www.ameli.fr/assure/remboursements/rembourse/transport-handicap-maladie/transport-taxi-conventionne",
      },
    ],
    termeReliesSlug: ["conventionnement-cpam", "prescription-medicale-transport", "vsl-vehicule-sanitaire-leger", "conducteur-taxi-conventionne"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "helitreuillage",
    terme: "Hélitreuillage",
    termeComplet: "Hélitreuillage médical",
    categorie: "vehicule",
    definitionCourte:
      "Technique d'extraction d'un patient par hélicoptère à l'aide d'un treuil, utilisée lorsqu'un hélitreuil ne peut pas se poser (montagne, mer, zone inaccessible).",
    definitionLongue:
      "L'hélitreuillage médical est une technique de sauvetage utilisée lorsqu'un hélicoptère médicalisé (SMUR héliporté ou hélicoptère de la Sécurité Civile) ne peut pas se poser en raison du terrain ou de l'accès difficile (falaise, milieu montagneux, pont, bateau, zone forestière dense). Un treuil motorisé permet de monter ou descendre le secouriste et le patient dans une civière spéciale ou un brancard.\n\nEn France, les opérations d'hélitreuillage médical sont assurées principalement par les hélicoptères de la Sécurité Civile (Pelicans), les hélicoptères de la Marine nationale, et dans une moindre mesure par des hélicoptères SMUR équipés de treuils. Ces opérations nécessitent une formation spécifique des équipes médicales et secouristes à la médecine en altitude et aux techniques de treuillage.\n\nL'hélitreuillage en milieu montagneux est particulièrement développé dans les Alpes et les Pyrénées, où les PGHM (Pelotons de Gendarmerie de Haute Montagne) coordonnent les secours avec les SMUR régionaux.",
    sourcesLegales: [],
    termeReliesSlug: ["helicoptere-smur", "smur", "samu-centre-15"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "transport-medicament",
    terme: "Transport de médicaments",
    termeComplet: "Transport de médicaments et produits biologiques",
    categorie: "technique",
    definitionCourte:
      "Activité complémentaire exercée par certaines entreprises de transport sanitaire, consistant à acheminer des médicaments, poches de sang, organes ou produits biologiques entre établissements de santé.",
    definitionLongue:
      "Le transport de médicaments et de produits biologiques (organes, poches de sang, produits de transfusion, cellules souches, biopsies...) entre établissements de santé est une activité encadrée par des réglementations strictes. Ce transport est distinct du transport de patients mais peut être exercé par les entreprises de transport sanitaire dans le cadre de marchés passés avec les établissements de santé.\n\nLe transport d'organes destinés à la transplantation est une urgence absolue soumise à des procédures spécifiques de l'Agence de la Biomédecine. Il doit se faire dans des délais extrêmement contraints (ischémie froide limitée pour chaque organe) et peut nécessiter l'escorte policière ou le recours à un hélicoptère.\n\nLe transport de produits biologiques à usage médical doit respecter les conditions de température prescrites par le laboratoire ou la pharmacie hospitalière, dans des conteneurs isothermes homologués. Les entreprises réalisant ces transports doivent disposer d'une autorisation spécifique et respecter les bonnes pratiques de distribution des médicaments.",
    sourcesLegales: [],
    termeReliesSlug: ["transport-inter-hospitalier", "vehicule-reserve-sanitaire"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "soins-a-domicile",
    terme: "Soins à domicile",
    termeComplet: "Transport sanitaire en lien avec les soins à domicile",
    categorie: "medical",
    alternativesOrtho: ["HAD", "hospitalisation à domicile"],
    definitionCourte:
      "Organisation de santé permettant à un patient de recevoir des soins complexes à son domicile, le transport sanitaire assurant les transferts ponctuels nécessaires (examens, consultations, urgences).",
    definitionLongue:
      "L'Hospitalisation À Domicile (HAD) est une modalité d'hospitalisation qui permet de prendre en charge à domicile des patients souffrant de pathologies graves et aiguës ou complexes qui, en l'absence d'une telle prise en charge, seraient hospitalisés en établissement de santé. Les structures HAD travaillent en lien étroit avec les entreprises de transport sanitaire pour organiser les transferts nécessaires.\n\nDans le cadre des soins à domicile, les transporteurs sanitaires interviennent pour : les urgences médicales survenant chez un patient HAD, les transferts vers des plateaux techniques (scanner, IRM, consultation spécialisée), les retours à domicile après une hospitalisation, et les consultations de suivi.\n\nLes entreprises de transport sanitaire qui travaillent régulièrement avec des structures HAD développent souvent des protocoles de collaboration (numéros directs, documents médicaux transmis à l'avance, coordination avec l'infirmière coordinatrice HAD) pour améliorer la fluidité des prises en charge.",
    sourcesLegales: [],
    termeReliesSlug: ["prescription-medicale-transport", "transport-inter-hospitalier", "ambulance-type-b"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "transport-personne-agee",
    terme: "Transport de personnes âgées",
    termeComplet: "Transport sanitaire des personnes âgées dépendantes",
    categorie: "medical",
    definitionCourte:
      "Prise en charge spécifique des patients âgés (EHPAD, résidences médicalisées) nécessitant une attention particulière aux pathologies, fragilités et à la communication avec les équipes soignantes.",
    definitionLongue:
      "Le transport de personnes âgées, notamment des résidents d'EHPAD (Établissements d'Hébergement pour Personnes Âgées Dépendantes), représente une part importante de l'activité des entreprises de transport sanitaire. Ces patients présentent des caractéristiques spécifiques nécessitant une approche adaptée.\n\nLes particularités de cette prise en charge comprennent : la fréquence des comorbidités (insuffisance cardiaque, diabète, démence, fragilité osseuse), la polymédication et le risque de décompensation pendant le transport, la nécessité d'une communication douce et adaptée aux troubles cognitifs (Alzheimer, démences), la coordination avec les équipes infirmières de l'EHPAD pour les informations médicales, et la gestion des fauteuils roulants et des équipements de mobilité.\n\nLes entreprises spécialisées dans ce type de transport forment leurs équipes à la communication avec les personnes désorientées, aux techniques de transfert adaptées aux personnes fragiles, et aux protocoles de gestion des urgences survenant pendant le transport (chute tensionnelle, malaise, confusion aiguë).",
    sourcesLegales: [],
    termeReliesSlug: ["tpmr-transport-personnes-mobilite-reduite", "ambulance-type-a1", "brancardage", "prescription-medicale-transport"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "schéma-regional-offre-sanitaire",
    terme: "SROS",
    termeComplet: "Schéma Régional d'Organisation des Soins",
    categorie: "reglementation",
    abreviation: "SROS",
    definitionCourte:
      "Document de planification sanitaire élaboré par l'ARS, définissant les objectifs de l'offre de soins régionale, incluant la couverture en transport sanitaire sur le territoire.",
    definitionLongue:
      "Le Schéma Régional d'Organisation des Soins (SROS) est un volet du Projet Régional de Santé (PRS) élaboré par l'ARS. Il fixe les objectifs quantitatifs et qualitatifs de l'offre de soins pour chaque territoire de santé de la région, incluant les soins hospitaliers, ambulatoires et le transport sanitaire.\n\nPour le transport sanitaire, le SROS définit : la couverture géographique minimale requise en ambulances et VSL, les objectifs de délais de réponse aux urgences non médicalisées, les zones où le renforcement de l'offre est prioritaire, et les modalités d'organisation des gardes ATSU. Il sert de cadre de référence pour l'instruction des demandes d'agrément et de renouvellement.\n\nLes entreprises de transport sanitaire qui s'installent dans une zone sous-dotée selon le SROS peuvent bénéficier d'aides à l'installation de l'ARS ou de la CPAM (forfaits de garde majorés, subventions d'équipement). À l'inverse, l'installation dans une zone sur-dotée peut se heurter à des restrictions.",
    sourcesLegales: [
      {
        intitule: "Article L.1434-9 du code de la santé publique - Schéma régional de santé",
        url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000038887490",
      },
    ],
    termeReliesSlug: ["ars-agence-regionale-sante", "agrement-ars", "schema-regional-sante", "zone-carence"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "psr-plan-secours",
    terme: "Plan de secours",
    termeComplet: "Plan de secours régional et rôle du transport sanitaire",
    categorie: "reglementation",
    definitionCourte:
      "Dispositif planifié de réponse à un afflux massif de victimes (catastrophe naturelle, accident industriel, attentat), dans lequel les entreprises de transport sanitaire jouent un rôle de renfort défini.",
    definitionLongue:
      "Les plans de secours régionaux (Plan Blanc, Plan Rouge, Plan ORSEC) prévoient l'implication des entreprises de transport sanitaire privées en cas de crise sanitaire ou de catastrophe entraînant un afflux massif de victimes. Ces plans sont coordonnés par l'ARS (Plan Blanc étendu), le préfet (Plan ORSEC, Plan Rouge) et les SAMU régionaux.\n\nEn cas d'activation d'un plan de secours, les entreprises de transport sanitaire peuvent être réquisitionnées par les autorités préfectorales pour renforcer les capacités de transport hospitalier. Elles mettent alors leurs véhicules et équipes à disposition du SAMU coordonnateur, qui organise la répartition des patients entre les établissements hospitaliers.\n\nLes entreprises d'ambulances agréées ATSU sont intégrées dans les plans de réponse aux urgences de masse de leur département. Leurs coordonnées, effectifs et capacités sont communiqués à l'ARS dans le cadre de leur déclaration d'activité annuelle, servant à établir les plans de mobilisation d'urgence.",
    sourcesLegales: [],
    termeReliesSlug: ["atsu-association-transport-sanitaire-urgent", "ars-agence-regionale-sante", "plan-blanc", "samu-centre-15"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "assurance-rc-professionnelle",
    terme: "RC professionnelle",
    termeComplet: "Responsabilité Civile Professionnelle des entreprises de transport sanitaire",
    categorie: "administratif",
    abreviation: "RCP",
    definitionCourte:
      "Assurance obligatoire couvrant la responsabilité civile de l'entreprise de transport sanitaire en cas de préjudice causé à un patient, un tiers ou aux biens lors de l'exercice de l'activité.",
    definitionLongue:
      "La responsabilité civile professionnelle (RCP) est une assurance obligatoire pour toute entreprise de transport sanitaire agréée. Elle couvre les préjudices corporels, matériels et immatériels causés à des tiers (patients, autres usagers de la route, tiers présents sur les lieux d'intervention) dans le cadre de l'activité professionnelle.\n\nSon étendue comprend : les accidents de la circulation lors des transports, les erreurs ou négligences dans la prise en charge du patient (chute lors du brancardage, erreur d'administration d'oxygène), les dommages matériels aux biens d'un patient (objets perdus ou endommagés), et la responsabilité des salariés engagée lors d'actes professionnels.\n\nL'attestation d'assurance RC professionnelle en cours de validité est un document obligatoire dans le dossier d'agrément ARS et doit être renouvelée annuellement. Elle doit couvrir un montant minimal fixé par la réglementation. Le défaut d'assurance expose l'entreprise à la suspension de son agrément.",
    sourcesLegales: [],
    termeReliesSlug: ["agrement-ars", "kbis", "conventionnement-cpam"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "visite-technique-vehicule",
    terme: "Contrôle technique",
    termeComplet: "Contrôle technique des véhicules sanitaires",
    categorie: "technique",
    definitionCourte:
      "Inspection périodique obligatoire du véhicule sanitaire vérifiant sa conformité aux normes de sécurité routière, ainsi qu'à la norme EN 1789 pour les équipements médicaux embarqués.",
    definitionLongue:
      "Le contrôle technique des véhicules sanitaires comprend deux volets distincts : le contrôle technique réglementaire automobile (tous les 2 ans pour les véhicules de moins de 3,5 tonnes) qui vérifie la conformité aux normes de sécurité routière (freinage, éclairage, direction, pollution), et le contrôle de conformité aux normes sanitaires qui vérifie les équipements médicaux selon la norme EN 1789.\n\nLa vérification de la conformité médicale est effectuée par des organismes agréés ou par l'ARS lors des inspections. Elle porte sur : la présence et l'état de fonctionnement des équipements obligatoires (brancard réglementaire, fixations, oxygène, DAE, matelas coquille, etc.), la propreté et l'hygiène du compartiment patient, la signalisation lumineuse et sonore (gyrophares, sirènes), et les dispositifs de sécurité pour le personnel.\n\nL'ensemble des contrôles techniques et de conformité doit être documenté et les attestations conservées dans le dossier de l'entreprise, accessible lors des inspections ARS. Un véhicule présentant une défaillance lors d'un contrôle ne peut plus être mis en service jusqu'à régularisation.",
    sourcesLegales: [],
    termeReliesSlug: ["norme-en-1789", "agrement-ars", "inspection-veillage-ars", "ambulance-type-b"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "transport-bariatrique",
    terme: "Transport bariatrique",
    termeComplet: "Transport sanitaire bariatrique (patients obèses)",
    categorie: "vehicule",
    definitionCourte:
      "Transport spécialisé pour patients en situation d'obésité morbide (IMC supérieur à 40 kg/m²) nécessitant des équipements renforcés (brancard bariatrique, élévateur) et du personnel formé.",
    definitionLongue:
      "Le transport bariatrique concerne les patients dont le poids dépasse les capacités standard des équipements sanitaires (généralement 150 à 200 kg). Ces patients nécessitent des équipements spécifiquement conçus et certifiés pour supporter des charges supérieures.\n\nLes équipements spécifiques comprennent : le brancard bariatrique (capacité 300 à 500 kg), l'élévateur hydraulique ou électrique pour le chargement dans le véhicule, le véhicule adapté (fourgon aménagé avec espace suffisant et charge utile renforcée), et des renforts d'équipe lors des manœuvres de brancardage. La formation des équipes aux techniques de manutention des personnes obèses est essentielle pour prévenir les accidents du travail (TMS).\n\nLes entreprises disposant de véhicules bariatriques agréés sont peu nombreuses et souvent sollicitées sur de larges zones géographiques. La prise en charge des transports bariatriques est soumise aux mêmes conditions de prescription et de remboursement CPAM que les transports classiques, mais peut faire l'objet de majorations tarifaires conventionnelles.",
    sourcesLegales: [],
    termeReliesSlug: ["ambulance-type-b", "brancardage", "tpmr-transport-personnes-mobilite-reduite"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "accord-cadre-transport",
    terme: "Accord cadre",
    termeComplet: "Accord cadre de transport sanitaire avec un établissement de santé",
    categorie: "reglementation",
    definitionCourte:
      "Convention entre un établissement de santé et une ou plusieurs entreprises de transport sanitaire fixant les conditions de collaboration, les tarifs et les niveaux de service pour les transports programmés.",
    definitionLongue:
      "L'accord cadre de transport sanitaire est un contrat pluriannuel passé entre un établissement de santé (hôpital, clinique, centre de dialyse, centre de radiothérapie) et une ou plusieurs entreprises de transport sanitaire pour encadrer leurs relations commerciales et opérationnelles.\n\nIl définit généralement : les types de transports couverts (programmés, urgences internes, inter-hospitaliers), les délais de prise en charge garantis, les tarifs applicables (conventionnels ou avec marges de dépassement pour les non-remboursables), les procédures de commande et de facturation, les critères de qualité et les indicateurs de performance, et les conditions de résiliation.\n\nCes accords permettent aux établissements de santé de disposer de transporteurs fiables et disponibles, tandis que les entreprises de transport sécurisent un volume d'activité régulier. Ils peuvent être soumis à des procédures d'appels d'offres lorsque les montants annuels dépassent les seuils des marchés publics.",
    sourcesLegales: [],
    termeReliesSlug: ["transport-sanitaire-programme", "transport-inter-hospitalier", "conventionnement-cpam"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "dispositif-medico-social",
    terme: "Transport médico-social",
    termeComplet: "Transport médico-social non sanitaire",
    categorie: "medical",
    alternativesOrtho: ["transport adapté", "transport accompagné"],
    definitionCourte:
      "Transport de personnes en situation de handicap ou de dépendance vers des établissements médico-sociaux (IME, ESAT, EHPAD, SSIAD), distinct du transport sanitaire stricto sensu et non remboursé par l'Assurance Maladie.",
    definitionLongue:
      "Le transport médico-social désigne le transport de personnes handicapées ou dépendantes vers des structures médico-sociales (instituts médicaux-éducatifs, établissements et services d'aide par le travail, centres médico-psychologiques, services de soins infirmiers à domicile). Ce transport est organisé et financé par les conseils départementaux ou les établissements médico-sociaux eux-mêmes, et n'est généralement pas couvert par l'Assurance Maladie.\n\nLa distinction avec le transport sanitaire est importante : le transport médico-social ne nécessite pas de prescription médicale et n'est pas remboursé par la CPAM. Il peut être réalisé par des transporteurs non conventionnés (taxis, services de transport adapté) ou par les propres véhicules des établissements.\n\nCertaines entreprises de transport sanitaire diversifient leur activité en proposant des services de transport médico-social, utilisant leurs véhicules TPMR pendant les créneaux non occupés par les transports sanitaires conventionnés. Cette activité est soumise à des réglementations spécifiques (autorisation de transport de personnes handicapées).",
    sourcesLegales: [],
    termeReliesSlug: ["tpmr-transport-personnes-mobilite-reduite", "pmr-personne-mobilite-reduite", "taxi-conventionne"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "permanence-des-soins",
    terme: "PDS",
    termeComplet: "Permanence Des Soins ambulatoires",
    categorie: "reglementation",
    abreviation: "PDS",
    definitionCourte:
      "Organisation garantissant l'accès aux soins en dehors des heures ouvrables des cabinets médicaux (nuits, week-ends, jours fériés), à laquelle le transport sanitaire est étroitement lié.",
    definitionLongue:
      "La Permanence Des Soins (PDS) est un dispositif organisationnel garantissant l'accès aux soins médicaux en dehors des heures d'ouverture habituelles des cabinets (nuits, samedis après-midi, dimanches et jours fériés). Elle est encadrée par les ARS et organisée par les conseils départementaux de l'ordre des médecins.\n\nLa PDS comprend plusieurs niveaux : les maisons médicales de garde (MMG), la médecine libérale de permanence (médecins de garde), les urgences hospitalières, et le SAMU-Centre 15 qui oriente les appels. Le transport sanitaire est indispensable à la PDS car les patients sans moyens de transport personnel ont besoin d'une ambulance ou d'un VSL pour se rendre aux consultations de garde.\n\nLes relations entre la PDS et le transport sanitaire sont étroites : le médecin de garde peut prescrire un transport en urgence pour un patient qu'il estime nécessiter une hospitalisation, et la régulation du SAMU-Centre 15 coordonne l'ensemble de la chaîne de soins en urgence, incluant le transport.",
    sourcesLegales: [
      {
        intitule: "Article L.6314-1 du code de la santé publique - Permanence des soins",
        url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000038887566",
      },
    ],
    termeReliesSlug: ["samu-centre-15", "garde-departementale-atsu", "transport-sanitaire-urgent"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "reclamation-transport",
    terme: "Réclamation patient",
    termeComplet: "Gestion des réclamations patients dans le transport sanitaire",
    categorie: "administratif",
    definitionCourte:
      "Procédure par laquelle un patient peut signaler une insatisfaction ou un incident lors d'un transport sanitaire, auprès de l'entreprise, de la CPAM ou de l'ARS selon la nature du problème.",
    definitionLongue:
      "La gestion des réclamations patients dans le transport sanitaire est encadrée par plusieurs dispositifs. Le patient peut adresser sa plainte directement à l'entreprise de transport (voie amiable), à la CPAM en cas de litige sur la facturation ou le remboursement, ou à l'ARS en cas de problème de sécurité ou de non-conformité de la prestation.\n\nLes motifs de réclamations les plus fréquents sont : les retards de prise en charge, le comportement du personnel, les conditions de transport (inconfort, manque d'équipement), les erreurs de facturation, et les incidents lors du brancardage (chutes, dommages aux équipements du patient).\n\nLes entreprises de transport sanitaire sont tenues de mettre en place un dispositif de traitement des réclamations et d'en garder la trace. Les réclamations récurrentes peuvent déclencher un contrôle par la CPAM ou l'ARS. En cas d'incident grave, l'entreprise doit effectuer une déclaration d'événement indésirable grave (EIG) auprès de l'ARS.",
    sourcesLegales: [],
    termeReliesSlug: ["agrement-ars", "cpam", "conventionnement-cpam", "inspection-veillage-ars"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "bilan-circonstanciel",
    terme: "Bilan circonstanciel",
    termeComplet: "Bilan circonstanciel ambulancier",
    categorie: "medical",
    definitionCourte:
      "Évaluation rapide réalisée par l'ambulancier à son arrivée sur les lieux permettant d'identifier les dangers environnementaux, le nombre de victimes et la nature de l'incident avant la prise en charge.",
    definitionLongue:
      "Le bilan circonstanciel est la première étape de toute intervention ambulancière. Il consiste à évaluer rapidement et méthodiquement la situation dans laquelle se trouve l'ambulancier avant d'approcher le patient. Il comprend l'évaluation des risques pour l'équipe (accidents de la route, dangers électriques, effondrements), le dénombrement des victimes, l'identification du mécanisme de l'incident (chute, accident de la circulation, malaise...), et la demande de moyens supplémentaires si nécessaire.\n\nLe bilan circonstanciel est suivi du bilan primaire (évaluation de l'état de conscience et de la respiration) et du bilan secondaire (bilan complet des fonctions vitales et recherche de lésions). L'ensemble de ces bilans est transmis au médecin régulateur du SAMU pour guide la décision thérapeutique et logistique.\n\nLa méthodologie du bilan circonstanciel est enseignée dans la formation DEA et les formations AFGSU. Elle constitue l'une des compétences fondamentales de l'ambulancier intervenant en urgence.",
    sourcesLegales: [],
    termeReliesSlug: ["dea-diplome-etat-ambulancier", "afgsu", "samu-centre-15", "urgence-vitale"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "prise-en-charge-globale",
    terme: "Prise en charge globale",
    termeComplet: "Prise en charge globale du patient dans le transport sanitaire",
    categorie: "medical",
    definitionCourte:
      "Approche du transport sanitaire intégrant les aspects physiques, psychologiques et relationnels de la prise en charge, visant à assurer le confort, la sécurité et la dignité du patient pendant le transport.",
    definitionLongue:
      "La prise en charge globale du patient est un concept issu des sciences infirmières appliqué au transport sanitaire. Elle dépasse la simple fonction de « chauffeur avec brancardier » pour intégrer une dimension soignante, relationnelle et préventive.\n\nSes composantes comprennent : la communication avec le patient (information sur le déroulement du transport, écoute des préoccupations, rassurage), la surveillance des fonctions vitales pendant le trajet (conscience, respiration, pouls, tension), la prévention des complications de transport (hypotension orthostatique lors des changements de position, nausées, hypothermie), la transmission d'informations précises à l'équipe soignante à l'arrivée, et le respect de la dignité et de l'intimité du patient.\n\nCette approche est de plus en plus valorisée dans les formations ambulancières et les critères d'évaluation de la qualité des entreprises de transport sanitaire par les ARS et les établissements partenaires.",
    sourcesLegales: [],
    termeReliesSlug: ["dea-diplome-etat-ambulancier", "transport-personne-agee", "soin-palliatif-transport"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "ambulancier-volontaire",
    terme: "Ambulancier volontaire",
    termeComplet: "Ambulancier volontaire de la protection civile ou des associations de secours",
    categorie: "metier",
    definitionCourte:
      "Bénévole formé aux gestes de premiers secours et au brancardage, participant aux activités de secours des associations agréées de sécurité civile lors de manifestations ou en renfort des services de secours.",
    definitionLongue:
      "L'ambulancier volontaire est un bénévole engagé dans une association agréée de sécurité civile (Croix-Rouge Française, Fédération Nationale de Protection Civile, Ordre de Malte, ADPC...) ou dans une amicale de sapeurs-pompiers volontaires. Il participe aux missions de secours et d'aide médicale urgente lors de rassemblements de public, de catastrophes, ou en renfort des services publics de secours.\n\nSa formation comprend au minimum le PSC1 (Prévention et Secours Civiques de niveau 1) ou le PSE1/PSE2 (Premiers Secours en Équipe) selon le niveau d'engagement. Il est bénévole et n'est pas rémunéré pour ses interventions, mais peut recevoir des remboursements de frais.\n\nL'ambulancier volontaire ne doit pas être confondu avec l'ambulancier professionnel DEA ou l'auxiliaire ambulancier DEAA. Il ne peut pas exercer à titre professionnel dans une entreprise d'ambulances sans les diplômes réglementaires.",
    sourcesLegales: [],
    termeReliesSlug: ["dea-diplome-etat-ambulancier", "afgsu", "pompier-secouriste"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "cotisation-formation-professionnelle",
    terme: "Formation professionnelle continue",
    termeComplet: "Formation professionnelle continue dans le transport sanitaire",
    categorie: "metier",
    definitionCourte:
      "Obligation pour les ambulanciers de maintenir et développer leurs compétences tout au long de leur carrière, notamment via les recyclages AFGSU, les formations aux nouveaux équipements et les actions qualité.",
    definitionLongue:
      "La formation professionnelle continue dans le transport sanitaire est une obligation réglementaire et contractuelle. Les employeurs doivent financer les formations obligatoires (recyclage AFGSU tous les 4 ans, formations spécifiques aux nouveaux équipements ou protocoles) et contribuer au financement de la formation continue via les OPCO (opérateurs de compétences) de la branche.\n\nL'OPCO mobilités (anciennement AGEFOS-PME puis OPCALIA) gère les financements de formation pour les entreprises de transport sanitaire relevant de la convention collective nationale des transports sanitaires privés. Les entreprises cotisent un pourcentage de leur masse salariale et peuvent obtenir des prises en charge pour les formations de leurs salariés.\n\nLes principales formations continues demandées dans le secteur comprennent : les recyclages PSE1/PSE2 et AFGSU, les formations aux nouveaux protocoles de soins SAMU, les formations à la conduite en situations d'urgence, les formations à la désinfection et à la prévention des infections, et les formations à la communication avec les patients.",
    sourcesLegales: [],
    termeReliesSlug: ["afgsu", "dea-diplome-etat-ambulancier", "moniteur-ambulancier"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "fonds-aide-installation",
    terme: "Aides à l'installation",
    termeComplet: "Aides à l'installation des entreprises de transport sanitaire",
    categorie: "financement",
    definitionCourte:
      "Dispositifs de soutien financier proposés par les ARS, les CPAM et les collectivités pour encourager l'installation d'entreprises de transport sanitaire dans les zones sous-dotées.",
    definitionLongue:
      "Dans les zones géographiques présentant un déficit en offre de transport sanitaire, plusieurs dispositifs d'aide à l'installation peuvent être mobilisés pour attirer de nouveaux opérateurs.\n\nLes ARS peuvent proposer : des forfaits de garde majorés pour les entreprises s'engageant à assurer les gardes ATSU dans les zones déficitaires, des subventions d'équipement pour l'achat de véhicules ou d'équipements médicaux, et un accompagnement administratif accéléré pour les demandes d'agrément.\n\nLes CPAM peuvent offrir : des avances sur remboursements pour faciliter la trésorerie des nouvelles entreprises, des conditions tarifaires avantageuses pour les zones sous-dotées, et des missions de conseil pour l'optimisation de la facturation.\n\nCes aides sont conditionnées à des engagements de durée de présence sur le territoire (généralement 3 à 5 ans) et à la réalisation effective des gardes départementales.",
    sourcesLegales: [],
    termeReliesSlug: ["agrement-ars", "garde-departementale-atsu", "zone-carence", "ars-agence-regionale-sante"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "audit-qualite-transport",
    terme: "Audit qualité",
    termeComplet: "Audit qualité dans le transport sanitaire",
    categorie: "reglementation",
    definitionCourte:
      "Évaluation systématique et documentée de la conformité d'une entreprise de transport sanitaire aux exigences réglementaires et aux bonnes pratiques professionnelles du secteur.",
    definitionLongue:
      "L'audit qualité dans le transport sanitaire est une démarche d'évaluation interne ou externe permettant de vérifier la conformité de l'entreprise aux normes réglementaires et aux bonnes pratiques du secteur. Il peut être réalisé à l'initiative de l'entreprise (audit interne de préparation à une inspection ARS), par un organisme certificateur externe, ou imposé par l'ARS en cas de signalement ou d'incident.\n\nIl porte sur : la conformité réglementaire des véhicules et équipements, les qualifications et formations du personnel, les procédures opérationnelles (hygiène, désinfection, facturation, traçabilité), la gestion des incidents et des réclamations, et les indicateurs de performance (délais de prise en charge, taux d'occupation des véhicules, taux de rejets SEFi).\n\nCertaines entreprises de transport sanitaire s'engagent dans des démarches de certification qualité volontaires (type ISO 9001 ou certification spécifique au secteur) pour valoriser leur engagement qualité auprès de leurs clients et partenaires (hôpitaux, CPAM, patients).",
    sourcesLegales: [],
    termeReliesSlug: ["agrement-ars", "inspection-veillage-ars", "taux-de-controle-cpam", "conventionnement-cpam"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "ambulancier-salarie",
    terme: "Ambulancier salarié",
    termeComplet: "Ambulancier salarié d'une entreprise privée de transport sanitaire",
    categorie: "metier",
    definitionCourte:
      "Ambulancier DEA ou auxiliaire ambulancier employé sous contrat de travail par une entreprise privée de transport sanitaire, relevant de la convention collective des transports sanitaires privés (IDCC 0507).",
    definitionLongue:
      "L'ambulancier salarié représente la grande majorité des professionnels du transport sanitaire en France. Contrairement aux ambulanciers libéraux ou gérants d'entreprise, le salarié est lié à son employeur par un contrat de travail à durée déterminée (CDD) ou indéterminée (CDI), régi par la convention collective nationale des transports sanitaires privés (IDCC 0507).\n\nSes conditions de travail sont encadrées par la loi et la convention collective : amplitude maximale de travail journalière de 12 heures, durée hebdomadaire moyenne de 35 heures, repos quotidien d'au moins 11 heures consécutives, temps de pause obligatoire. Les gardes de nuit et de week-end sont rémunérées avec des majorations conventionnelles.\n\nL'ambulancier salarié bénéficie des protections sociales liées au salariat : assurance chômage, retraite, prévoyance, mutuelle d'entreprise obligatoire. En contrepartie, il est soumis au lien de subordination avec son employeur pour l'organisation du travail et le respect des consignes.",
    sourcesLegales: [
      {
        intitule: "Convention collective nationale des transports sanitaires privés (IDCC 0507)",
        url: "https://www.legifrance.gouv.fr/conv_coll/id/KALICONT000005635534",
      },
    ],
    termeReliesSlug: ["dea-diplome-etat-ambulancier", "convention-collective-transport-sanitaire", "agrement-ars"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "chef-equipe-transport",
    terme: "Chef d'équipe",
    termeComplet: "Chef d'équipe dans une entreprise de transport sanitaire",
    categorie: "metier",
    definitionCourte:
      "Ambulancier DEA expérimenté chargé de superviser une équipe de transporteurs, coordonner les plannings, assurer la conformité des prises en charge et servir d'interface entre le terrain et la direction.",
    definitionLongue:
      "Le chef d'équipe dans une entreprise de transport sanitaire est généralement un ambulancier DEA senior disposant d'une expérience significative (5 ans minimum) et ayant démontré des qualités managériales. Il exerce une fonction d'encadrement de proximité sans nécessairement quitter le terrain.\n\nSes responsabilités comprennent : la supervision des équipes ambulancières au quotidien, la gestion des plannings d'astreinte et de garde, la vérification de la conformité des véhicules et des équipements avant chaque prise de service, la formation pratique des nouveaux ambulanciers, la gestion des incidents et la transmission des réclamations à la direction, et le suivi de la facturation en lien avec le service administratif.\n\nLe chef d'équipe joue un rôle central dans la culture qualité et sécurité de l'entreprise. Il est souvent le premier interlocuteur lors des inspections ARS ou des contrôles CPAM, et doit maîtriser parfaitement les obligations réglementaires.",
    sourcesLegales: [],
    termeReliesSlug: ["dea-diplome-etat-ambulancier", "responsable-qualite-ts", "directeur-entreprise-transport-sanitaire"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "transport-sanitaire-outre-mer",
    terme: "Transport sanitaire Outre-mer",
    termeComplet: "Transport sanitaire dans les départements et régions d'Outre-mer",
    categorie: "reglementation",
    definitionCourte:
      "Organisation spécifique du transport sanitaire dans les DROM (Réunion, Martinique, Guadeloupe, Mayotte, Guyane) avec des conventions CPAM adaptées aux contraintes géographiques et démographiques locales.",
    definitionLongue:
      "Le transport sanitaire dans les départements et régions d'Outre-mer (DROM) est soumis aux mêmes dispositions législatives et réglementaires qu'en métropole (code de la santé publique, convention nationale CPAM), mais avec des adaptations locales tenant compte des spécificités géographiques, démographiques et économiques.\n\nChaque DROM dispose de ses propres caisses générales de sécurité sociale (CGSS) qui jouent le rôle de CPAM et signent des conventions avec les transporteurs sanitaires locaux. Les tarifs conventionnels peuvent différer de la métropole pour tenir compte du coût de la vie et des spécificités du marché local.\n\nDes défis particuliers se posent dans certains DROM : le manque de professionnels formés (DEA) en Guyane et à Mayotte, les distances importantes et les zones isolées en Guyane, le coût élevé des véhicules sanitaires importés dans les îles, et la forte densité de population dans certaines zones péri-urbaines comme la Réunion ou la Martinique. Des plans régionaux spécifiques sont élaborés par les ARS de Outre-mer pour répondre à ces enjeux.",
    sourcesLegales: [],
    termeReliesSlug: ["ars-agence-regionale-sante", "cpam", "conventionnement-cpam", "agrement-ars"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "urgences-pediatriques-transport",
    terme: "Transport pédiatrique",
    termeComplet: "Transport sanitaire pédiatrique",
    categorie: "medical",
    definitionCourte:
      "Transport sanitaire d'un enfant (moins de 15 ans), nécessitant des équipements adaptés (sièges rehausseurs, ceintures pédiatriques) et une formation spécifique du personnel.",
    definitionLongue:
      "Le transport pédiatrique nécessite des adaptations spécifiques par rapport au transport adulte. Les ambulances transportant régulièrement des enfants doivent disposer d'équipements dédiés : sièges enfants adaptés à l'âge et au poids (0-36 kg), fixations sécurisées pour les sièges auto dans le compartiment patient, masques et canules d'oxygène de taille pédiatrique, tensiomètres pédiatriques, et médicaments de taille pédiatrique dans la trousse d'urgence.\n\nLes ambulanciers DEA reçoivent dans leur formation de base une initiation aux spécificités physiologiques et anatomiques de l'enfant (constantes vitales différentes selon l'âge, risque d'hypothermie accru, communication adaptée). Les urgences pédiatriques graves (arrêt cardiaque, traumatisme crânien sévère, détresse respiratoire) déclenchent systématiquement l'envoi d'un SMUR.\n\nLes transports inter-hospitaliers de nourrissons et enfants en état critique sont assurés par les SMUR pédiatriques (SMPICU) des CHU disposant de services de réanimation pédiatrique.",
    sourcesLegales: [],
    termeReliesSlug: ["smur", "ambulance-type-b", "transport-nouveau-ne", "samu-centre-15"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "livret-accueil-patient",
    terme: "Livret d'accueil patient",
    termeComplet: "Livret d'accueil du patient dans le transport sanitaire",
    categorie: "administratif",
    definitionCourte:
      "Document remis au patient ou à son représentant légal lors de la prise en charge, présentant l'entreprise, ses obligations, les droits du patient et les procédures de réclamation.",
    definitionLongue:
      "Le livret d'accueil patient est un document informatif remis par l'entreprise de transport sanitaire à ses clients. Son contenu type comprend : la présentation de l'entreprise (agrément ARS, conventionnement CPAM, coordonnées), les droits du patient (dignité, respect, information sur le transport), les obligations de l'entreprise (ponctualité, qualité, sécurité), les informations pratiques (que prévoir pour le transport, comment annuler), les informations sur la facturation et le remboursement, et les voies de recours en cas d'insatisfaction.\n\nBien que non obligatoire par la réglementation générale du transport sanitaire, le livret d'accueil patient est une bonne pratique recommandée par les ARS et les organisations professionnelles. Il contribue à la transparence de la relation avec le patient et peut prévenir les malentendus et les réclamations.\n\nDans les établissements de santé, un livret d'accueil institutionnel est obligatoire en vertu de la loi du 4 mars 2002 relative aux droits des malades. Certaines entreprises de transport sanitaire sous-traitant pour des hôpitaux adaptent leur livret à cette exigence.",
    sourcesLegales: [],
    termeReliesSlug: ["reclamation-transport", "tiers-payant", "prescription-medicale-transport"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "bilan-vital",
    terme: "Bilan vital",
    termeComplet: "Bilan vital ambulancier",
    categorie: "medical",
    definitionCourte:
      "Évaluation systématique des grandes fonctions vitales (conscience, respiration, circulation) réalisée par l'ambulancier à l'arrivée auprès du patient et transmise au SAMU-Centre 15.",
    definitionLongue:
      "Le bilan vital est une évaluation structurée et méthodique des fonctions vitales du patient réalisée par l'ambulancier DEA dans les premières minutes de la prise en charge. Il s'organise selon la méthode ABCDE (Airway — voies aériennes, Breathing — respiration, Circulation, Disability — neurologie, Exposure — exposition et environnement).\n\nIl comprend : l'évaluation de l'état de conscience (score de Glasgow, réponse aux stimuli), la vérification de la liberté des voies aériennes (corps étranger, encombrement), l'évaluation de la respiration (fréquence, amplitude, saturation en oxygène SpO2), l'évaluation de la circulation (pouls, tension artérielle, teint, temps de recoloration cutané), et l'évaluation neurologique (pupilles, déficit moteur ou sensitif).\n\nLe résultat du bilan vital est transmis par radio ou téléphone au médecin régulateur du SAMU-Centre 15, qui décide alors de l'orientation du patient (hospitalisation directe, passage aux urgences, consultation de médecine générale...) et peut envoyer du renfort (SMUR).",
    sourcesLegales: [],
    termeReliesSlug: ["dea-diplome-etat-ambulancier", "afgsu", "samu-centre-15", "bilan-circonstanciel"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "dispositif-alerte-rouge",
    terme: "Alerte rouge",
    termeComplet: "Alerte rouge CPAM — contrôle renforcé du transport sanitaire",
    categorie: "reglementation",
    definitionCourte:
      "Niveau de contrôle renforcé déclenché par la CPAM lorsqu'une entreprise de transport sanitaire présente des anomalies de facturation significatives ou répétées, pouvant conduire à un contrôle sur site.",
    definitionLongue:
      "L'alerte rouge CPAM dans le transport sanitaire désigne un niveau de surveillance renforcé déclenché par les services de contrôle de l'Assurance Maladie lorsque les données de facturation d'une entreprise présentent des anomalies statistiquement significatives par rapport aux normes du secteur.\n\nLes critères déclencheurs peuvent inclure : un taux de transports en ambulance anormalement élevé par rapport aux VSL (possibles prescriptions inadaptées), des distances déclarées supérieures aux distances réelles mesurées, des transports en dehors des horaires des établissements de destination, un nombre anormal de majorations de nuit ou de week-end, ou des facturations de transports non confirmés par les prescripteurs.\n\nL'alerte rouge peut conduire à : une convocation de l'entreprise à un entretien avec la CPAM, un contrôle sur pièces (vérification des bons de transport, des prescriptions, des feuilles d'horaires), un contrôle sur site, et en cas de fraude avérée, le lancement d'une procédure d'indu, la résiliation de la convention, voire le dépôt de plainte pénale pour fraude à l'assurance maladie.",
    sourcesLegales: [],
    termeReliesSlug: ["taux-de-controle-cpam", "indu", "conventionnement-cpam", "cpam"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "plan-qualite-sécurite-entreprise",
    terme: "Plan Qualité-Sécurité",
    termeComplet: "Plan Qualité-Sécurité d'une entreprise de transport sanitaire",
    categorie: "reglementation",
    definitionCourte:
      "Document interne planifiant les actions à mettre en œuvre pour maintenir et améliorer la qualité et la sécurité des prestations de transport, exigé par certaines ARS dans le cadre de l'agrément.",
    definitionLongue:
      "Le Plan Qualité-Sécurité est un document de gestion interne élaboré par les entreprises de transport sanitaire pour structurer leur démarche d'amélioration continue. Il identifie les risques liés à l'activité, définit les mesures préventives et correctives, fixe des objectifs mesurables et prévoit les modalités d'évaluation.\n\nIl couvre typiquement : la sécurité routière (formation à la conduite d'urgence, respect des règles de circulation avec sirènes), la prévention des accidents du travail (manutention, risques biologiques), la qualité de la prise en charge patient (respect des protocoles, formation continue), la prévention des infections (désinfection, hygiène), la fiabilité de la facturation (prévention des indus et des erreurs), et la gestion des incidents.\n\nCertaines ARS exigent la présentation d'un plan qualité-sécurité lors de l'instruction des demandes d'agrément ou de renouvellement. Les entreprises certifiées ISO 9001 intègrent ce plan dans leur système de management de la qualité.",
    sourcesLegales: [],
    termeReliesSlug: ["agrement-ars", "inspection-veillage-ars", "audit-qualite-transport"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "vehicule-de-premiere-intervention",
    terme: "VPI",
    termeComplet: "Véhicule de Première Intervention",
    categorie: "vehicule",
    abreviation: "VPI",
    definitionCourte:
      "Véhicule léger rapide permettant l'envoi d'un premier secouriste ou d'un médecin sur le lieu d'une urgence avant l'arrivée de l'ambulance, optimisant le temps de réponse initial.",
    definitionLongue:
      "Le Véhicule de Première Intervention (VPI) est un véhicule léger (type berline ou SUV) utilisé pour envoyer rapidement un premier intervenant qualifié sur le lieu d'une urgence médicale. Il est plus agile que l'ambulance dans les centres-villes et peut arriver plusieurs minutes avant l'équipe ambulancière complète.\n\nDans les SAMU, le VPI est souvent utilisé pour envoyer un médecin régulateur de terrain (médecin urgentiste ou généraliste de garde) en renfort. Dans certaines organisations ATSU, un ambulancier DEA expérimenté est envoyé seul en VPI pour réaliser un premier bilan et préparer la prise en charge, avant l'arrivée de l'équipe complète en ambulance.\n\nL'utilisation de VPI permet d'optimiser les ressources en permettant à l'ambulance de prendre en charge d'autres transports programmés pendant le déplacement du VPI vers l'urgence. Cette organisation est particulièrement adaptée en milieu urbain dense où la circulation peut ralentir les ambulances.",
    sourcesLegales: [],
    termeReliesSlug: ["smur", "atsu-association-transport-sanitaire-urgent", "samu-centre-15"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "score-glasgow",
    terme: "Score de Glasgow",
    termeComplet: "Échelle de coma de Glasgow (Glasgow Coma Scale)",
    categorie: "medical",
    alternativesOrtho: ["GCS", "Glasgow Coma Scale"],
    abreviation: "GCS",
    definitionCourte:
      "Échelle neurologique internationale évaluant le niveau de conscience d'un patient sur 15 points (ouverture des yeux, réponse verbale, réponse motrice). Utilisée par les ambulanciers dans le bilan vital.",
    definitionLongue:
      "L'Échelle de Coma de Glasgow (GCS — Glasgow Coma Scale) est un outil standardisé d'évaluation neurologique créé en 1974 par les Dr Teasdale et Jennett à l'Université de Glasgow. Elle est utilisée mondialement pour quantifier le niveau de conscience d'un patient et surveiller son évolution.\n\nElle évalue trois paramètres indépendants, chacun coté :\n- Ouverture des yeux (E) : spontanée (4), à la voix (3), à la douleur (2), absente (1)\n- Réponse verbale (V) : orientée (5), confuse (4), inappropriée (3), incompréhensible (2), absente (1)\n- Réponse motrice (M) : obéit aux ordres (6), localise la douleur (5), retrait (4), flexion anormale (3), extension (2), absente (1)\n\nLe score total varie de 3 (coma profond) à 15 (conscience normale). Un GCS inférieur à 9 indique un coma grave nécessitant une prise en charge immédiate par le SMUR. Les ambulanciers notent le GCS dans leur bilan vital et le transmettent au médecin régulateur du SAMU.",
    sourcesLegales: [],
    termeReliesSlug: ["bilan-vital", "smur", "samu-centre-15", "urgence-vitale"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "oxymetre-pouls",
    terme: "Oxymètre de pouls",
    termeComplet: "Oxymètre de pouls (saturomètre)",
    categorie: "technique",
    alternativesOrtho: ["saturomètre", "SpO2", "pulsioxymètre"],
    definitionCourte:
      "Dispositif médical mesurant de manière non invasive la saturation en oxygène du sang (SpO2) et la fréquence cardiaque. Obligatoire dans les ambulances de type B pour la surveillance continue du patient.",
    definitionLongue:
      "L'oxymètre de pouls (ou saturomètre, pulsioxymètre) est un dispositif médical électronique permettant de mesurer de façon non invasive la saturation en oxygène de l'hémoglobine dans le sang (SpO2) et la fréquence cardiaque. Son principe repose sur la spectrophotométrie : il émet deux longueurs d'onde de lumière (rouge et infrarouge) à travers un tissu vascularisé (doigt, oreille, nez) et mesure l'absorption différentielle selon le degré d'oxygénation de l'hémoglobine.\n\nUne SpO2 normale est supérieure à 95 %. En dessous de 90 %, la prise en charge est urgente (hypoxémie). L'oxymètre permet à l'ambulancier de surveiller en continu l'état respiratoire du patient pendant le transport et d'adapter l'administration d'oxygène en conséquence.\n\nIl est obligatoire dans les ambulances de type B selon la norme EN 1789, et recommandé dans tous les véhicules sanitaires transportant des patients dont l'état respiratoire peut se modifier (bronchopneumopathies, insuffisance cardiaque, post-opératoires). Les modèles portables sans fil sont particulièrement adaptés au transport sanitaire.",
    sourcesLegales: [],
    termeReliesSlug: ["ambulance-type-b", "norme-en-1789", "oxygene-medical", "bilan-vital"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "tensiometre-ambulancier",
    terme: "Tensiomètre",
    termeComplet: "Tensiomètre pour transport sanitaire",
    categorie: "technique",
    alternativesOrtho: ["sphygmomanomètre", "appareil à pression artérielle"],
    definitionCourte:
      "Dispositif médical permettant la mesure de la pression artérielle, indispensable dans le bilan vital ambulancier pour détecter hypotension, hypertension et surveiller l'évolution du patient.",
    definitionLongue:
      "Le tensiomètre (ou sphygmomanomètre) est un dispositif médical mesurant la pression artérielle systolique (PA max, lors de la contraction cardiaque) et diastolique (PA min, entre deux contractions). Les valeurs normales sont environ 120/80 mmHg chez l'adulte.\n\nDans le transport sanitaire, la mesure de la tension artérielle fait partie intégrante du bilan vital. Elle permet de détecter : une hypotension (PA systolique < 90 mmHg), signe d'état de choc nécessitant une prise en charge urgente, une hypertension sévère (PA systolique > 180 mmHg), pouvant indiquer une urgence neurologique ou cardiovasculaire, et de surveiller l'évolution de l'état circulatoire du patient pendant le transport.\n\nLes ambulances de type B sont équipées de tensiomètres automatiques ou semi-automatiques permettant des mesures répétées sans intervention manuelle de l'ambulancier. Les modèles adaptés au transport sont robustes, résistants aux vibrations, et permettent une mesure fiable même en condition de mouvement.",
    sourcesLegales: [],
    termeReliesSlug: ["bilan-vital", "ambulance-type-b", "norme-en-1789", "oxymetre-pouls"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "electrocardiogramme-embarque",
    terme: "ECG embarqué",
    termeComplet: "Électrocardiogramme embarqué dans l'ambulance SMUR",
    categorie: "technique",
    abreviation: "ECG",
    definitionCourte:
      "Dispositif d'enregistrement de l'activité électrique du cœur, présent dans les véhicules SMUR et certaines ambulances de type B, permettant le diagnostic des urgences cardiaques en pré-hospitalier.",
    definitionLongue:
      "L'électrocardiogramme (ECG) est un examen médical enregistrant l'activité électrique du cœur via des électrodes placées sur la peau. Dans le contexte du transport sanitaire, l'ECG 12 dérivations est réalisé par le SMUR en pré-hospitalier pour le diagnostic des urgences cardiaques (infarctus du myocarde, troubles du rythme graves, bloc auriculo-ventriculaire).\n\nLa transmission de l'ECG pré-hospitalier à la salle de coronarographie (système COEUR) permet d'anticiper la prise en charge et d'éviter le passage par les urgences, réduisant le délai de revascularisation dans l'infarctus. Cette pratique est intégrée dans les protocoles de prise en charge des syndromes coronariens aigus dans toutes les régions françaises.\n\nCertaines ambulances de type B sont équipées de moniteurs défibrillateurs permettant la réalisation d'ECG par les ambulanciers DEA sur instruction médicale du SAMU. La télétransmission de cet ECG au médecin régulateur permet une décision thérapeutique plus rapide.",
    sourcesLegales: [],
    termeReliesSlug: ["smur", "defibrillateur", "infarctus-transport", "samu-centre-15"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "appel-15",
    terme: "Appel au 15",
    termeComplet: "Appel au SAMU — Numéro national d'urgence médicale",
    categorie: "medical",
    abreviation: "15",
    definitionCourte:
      "Numéro national gratuit permettant d'accéder 24h/24 à la régulation médicale du SAMU. À composer en cas d'urgence médicale pour obtenir un conseil, une orientation ou l'envoi de secours.",
    definitionLongue:
      "Le 15 est le numéro national d'urgence médicale en France, accessible gratuitement 24h/24 et 7j/7 depuis tout téléphone fixe ou mobile. Il permet de joindre le Centre 15 (SAMU — Service d'Aide Médicale Urgente) de son département pour obtenir une réponse médicale adaptée à la situation.\n\nLors de l'appel, l'assistant de régulation médicale (ARM) prend en charge la communication, recueille les informations sur la situation et les transmet au médecin régulateur. Ce dernier décide de la réponse appropriée : conseil médical téléphonique, envoi d'un médecin de garde, envoi d'une ambulance ATSU, ou déclenchement du SMUR selon la gravité.\n\nLe 15 est à composer en cas d'urgence médicale. Les autres numéros d'urgence en France sont : le 17 (police), le 18 (pompiers), le 112 (numéro européen d'urgence). En cas de doute sur le numéro à appeler, le 15 et le 112 transfèrent automatiquement vers le bon service d'urgence.",
    sourcesLegales: [
      {
        intitule: "Article L.6311-1 du code de la santé publique - SAMU",
        url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000006690282",
      },
    ],
    termeReliesSlug: ["samu-centre-15", "arm-assistant-regulation-medicale", "medecin-regulateur", "smur"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "signalisation-vehicule-prioritaire",
    terme: "Signalisation prioritaire",
    termeComplet: "Signalisation lumineuse et sonore des véhicules d'urgence sanitaires",
    categorie: "vehicule",
    definitionCourte:
      "Dispositifs réglementaires (gyrophares bleus, sirènes 2 tons) permettant aux ambulances et SMUR de circuler en priorité et de dépasser certaines règles du code de la route lors d'interventions urgentes.",
    definitionLongue:
      "Les ambulances et véhicules des services d'aide médicale urgente (SAMU, SMUR) sont équipés de signalisations prioritaires leur permettant de bénéficier de la priorité de passage dans la circulation. La réglementation française autorise l'usage de gyrophares à lumière bleue et de sirènes à 2 tons (520 Hz et 660 Hz alternés) pour les véhicules de secours et d'urgence.\n\nEn mode urgence (gyrophare et sirène actifs), l'ambulance peut : franchir les feux rouges après s'être assuré que les autres conducteurs l'ont laissé passer, dépasser par la droite ou par la ligne médiane, circuler sur voie de bus, et excéder les limitations de vitesse dans la mesure compatible avec la sécurité. Ces dérogations n'exonèrent pas le conducteur de sa responsabilité en cas d'accident.\n\nL'activation des dispositifs prioritaires est réservée aux interventions urgentes. Toute utilisation abusive (pour gagner du temps lors d'un transport programmé) constitue une infraction et peut entraîner des poursuites disciplinaires et judiciaires contre le conducteur et son employeur.",
    sourcesLegales: [
      {
        intitule: "Articles R.432-1 et R.313-27 du code de la route - véhicules d'urgence",
        url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000022086019",
      },
    ],
    termeReliesSlug: ["ambulance-type-b", "smur", "norme-en-1789", "urgence-vitale"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "hospitalisation-non-programmee",
    terme: "Hospitalisation non programmée",
    termeComplet: "Hospitalisation non programmée suite à un transport d'urgence",
    categorie: "medical",
    definitionCourte:
      "Admission hospitalière non planifiée résultant d'une urgence médicale, entraînant un transport par ambulance d'urgence (ATSU ou SMUR) vers les urgences ou une unité spécialisée.",
    definitionLongue:
      "L'hospitalisation non programmée désigne une admission hospitalière qui n'était pas prévue à l'avance, consécutive à une urgence médicale ou traumatique. Elle représente une part significative de l'activité des entreprises de transport sanitaire, particulièrement des équipes de garde ATSU.\n\nLes causes les plus fréquentes sont : les décompensations cardiaques ou respiratoires chez des patients chroniques, les accidents vasculaires cérébraux, les traumatismes (chutes, accidents), les urgences abdominales (appendicite, occlusion), les crises hyperglycémiques, et les infections graves.\n\nContrairement aux transports programmés, les transports non programmés ne disposent pas toujours d'une prescription médicale préalable. Dans ce cas, le médecin régulateur du SAMU délivre une prescription médicale de transport par téléphone, confirmée ultérieurement par écrit. L'ambulancier doit documenter précisément les circonstances pour justifier le transport auprès de la CPAM.",
    sourcesLegales: [],
    termeReliesSlug: ["transport-sanitaire-urgent", "samu-centre-15", "prescription-medicale-transport", "atsu-association-transport-sanitaire-urgent"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "reglementation-desinfection",
    terme: "Réglementation désinfection",
    termeComplet: "Réglementation de la désinfection des véhicules sanitaires",
    categorie: "reglementation",
    definitionCourte:
      "Cadre réglementaire fixant les obligations de nettoyage et de désinfection des ambulances et VSL entre chaque transport patient, intégrant les recommandations du HCSP et les circulaires ARS.",
    definitionLongue:
      "La réglementation de la désinfection des véhicules sanitaires est issue de plusieurs sources : les circulaires du ministère de la Santé, les recommandations du Haut Conseil de la Santé Publique (HCSP), les protocoles des ARS, et les bonnes pratiques professionnelles des organisations du secteur.\n\nLes principales obligations comprennent : la désinfection systématique du compartiment patient et des équipements réutilisables après chaque transport, l'utilisation de produits désinfectants référencés (listés par le HCSP ou possédant les normes NF EN appropriées), la gestion réglementaire des Déchets d'Activité de Soins à Risques Infectieux (DASRI), la traçabilité des opérations de désinfection dans un registre, et le suivi de la formation du personnel à l'hygiène.\n\nDes protocoles renforcés sont requis pour les patients porteurs de bactéries multi-résistantes (BMR), de Clostridium difficile (CPD), ou de pathogènes hautement dangereux. Ces protocoles peuvent inclure : le port d'EPI complets (masque FFP2, blouse, sur-gants), une désinfection en deux temps, et un confinement temporaire du véhicule.",
    sourcesLegales: [],
    termeReliesSlug: ["desinfection-vehicule", "agrement-ars", "inspection-veillage-ars"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "dispositif-aide-medicale-etat",
    terme: "AME",
    termeComplet: "Aide Médicale d'État",
    categorie: "financement",
    abreviation: "AME",
    definitionCourte:
      "Dispositif de protection maladie pour les personnes étrangères en situation irrégulière résidant en France depuis plus de 3 mois, couvrant les soins urgents y compris les transports sanitaires urgents.",
    definitionLongue:
      "L'Aide Médicale d'État (AME) est un dispositif de protection sociale accordé par la France aux personnes étrangères en situation irrégulière résidant sur le territoire depuis plus de trois mois et remplissant des conditions de ressources. Elle est financée par l'État et gérée par les CPAM.\n\nDans le cadre de l'AME, les transports sanitaires urgents (via le SAMU) sont pris en charge. Les transports programmés peuvent également être couverts sous conditions. La prise en charge est à 100 % sans ticket modérateur pour les bénéficiaires de l'AME.\n\nLes entreprises de transport sanitaire facturrent les transports de bénéficiaires de l'AME selon les mêmes procédures que pour les assurés ordinaires, avec un code de facturation spécifique sur la feuille de transport. Les délais de remboursement peuvent être légèrement plus longs pour l'AME que pour l'assurance maladie ordinaire.",
    sourcesLegales: [
      {
        intitule: "Article L.251-1 du code de l'action sociale et des familles - Aide Médicale d'État",
        url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000038836651",
      },
    ],
    termeReliesSlug: ["css-complementaire-sante-solidaire", "amo-assurance-maladie-obligatoire", "tiers-payant"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "contrat-assurance-vehicule",
    terme: "Assurance véhicule sanitaire",
    termeComplet: "Contrat d'assurance spécifique aux véhicules sanitaires",
    categorie: "administratif",
    definitionCourte:
      "Contrat d'assurance automobile adapté aux véhicules d'ambulance et de transport sanitaire, couvrant les risques spécifiques liés à l'activité (transport de patients, conduite prioritaire, équipements médicaux).",
    definitionLongue:
      "L'assurance des véhicules sanitaires nécessite une couverture spécifique adaptée aux risques particuliers de l'activité ambulancière. Les contrats standards d'assurance automobile ne couvrent généralement pas l'intégralité des risques liés à cette activité professionnelle.\n\nLes garanties spécifiques requises comprennent : la responsabilité civile professionnelle pour les dommages causés aux patients pendant le transport, la couverture des équipements médicaux embarqués (oxygène, défibrillateur, matelas coquille...) en cas de sinistre, l'assurance du conducteur lors des interventions d'urgence avec signalisation prioritaire, la couverture des tiers lors des manœuvres de brancardage, et la garantie «tout risque» sur le véhicule compte tenu de son coût d'équipement élevé.\n\nCertaines compagnies d'assurance proposent des contrats spécialement conçus pour le transport sanitaire, en partenariat avec les organisations professionnelles (FNTS, FNAA). Le renouvellement annuel de l'attestation d'assurance est une condition obligatoire du maintien de l'agrément ARS.",
    sourcesLegales: [],
    termeReliesSlug: ["assurance-rc-professionnelle", "agrement-ars", "ambulance-type-b"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "registre-incidents",
    terme: "Registre d'incidents",
    termeComplet: "Registre des incidents et événements indésirables du transport sanitaire",
    categorie: "administratif",
    definitionCourte:
      "Document obligatoire dans lequel l'entreprise de transport sanitaire consigne tous les incidents survenus (accidents, chutes patient, pannes, réclamations), servant aux démarches qualité et aux déclarations ARS.",
    definitionLongue:
      "Le registre des incidents est un document de traçabilité interne tenu à jour par les entreprises de transport sanitaire pour recenser tous les événements indésirables et incidents survenus dans le cadre de l'activité. Sa tenue est une bonne pratique professionnelle recommandée par les ARS et les organisations du secteur.\n\nIl comprend : la date et description de chaque incident, les personnes impliquées (patients, personnel, tiers), les circonstances et causes identifiées, les conséquences pour les personnes et les équipements, les actions correctives prises, et les éventuelles déclarations auprès des autorités (ARS, assurance, police, CPAM).\n\nCertains incidents graves doivent faire l'objet de déclarations obligatoires : les accidents de la route avec victimes (à la police et à l'assurance), les événements indésirables graves (EIG) survenant lors d'une prise en charge patient (à l'ARS), et les accidents du travail (à la Sécurité Sociale et à l'inspection du travail). Le registre sert de preuve de la gestion rigoureuse de l'entreprise lors des inspections ARS.",
    sourcesLegales: [],
    termeReliesSlug: ["agrement-ars", "inspection-veillage-ars", "reclamation-transport", "assurance-rc-professionnelle"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "convention-nationale-transporteurs",
    terme: "Convention nationale transporteurs",
    termeComplet: "Convention nationale organisant les rapports entre les transporteurs sanitaires et l'Assurance Maladie",
    categorie: "reglementation",
    definitionCourte:
      "Accord national négocié entre les syndicats représentatifs des transporteurs sanitaires privés et l'Union Nationale des Caisses d'Assurance Maladie (UNCAM), fixant les tarifs et les conditions d'exercice conventionné.",
    definitionLongue:
      "La convention nationale des transporteurs sanitaires privés est le texte de référence encadrant les relations entre les entreprises d'ambulances, de VSL et les taxis conventionnés d'une part, et l'Assurance Maladie d'autre part. Elle est négociée par l'Union Nationale des Caisses d'Assurance Maladie (UNCAM) avec les syndicats représentatifs du secteur (FNTS, FNAA, FFT, FFFP...).\n\nElle définit : les conditions d'accès au conventionnement (agrément ARS préalable, engagement de respecter les tarifs et les règles de bonne pratique), les tarifs conventionnels applicables aux différentes prestations (ambulance, VSL, taxi), les majorations (nuit, dimanche, urgence), les obligations documentaires (prescription médicale, bon de transport), les conditions de contrôle et les sanctions en cas de non-respect, et les procédures de résiliation.\n\nLa convention est révisée périodiquement par des avenants négociés entre les parties. Les transporteurs qui ne signent pas la convention ou dont la convention est résiliée ne peuvent pas facturer à l'Assurance Maladie.",
    sourcesLegales: [
      {
        intitule: "Convention nationale des transporteurs sanitaires privés - ameli.fr",
        url: "https://www.ameli.fr/transporteur-sanitaire/exercice-professionnel/conventions-et-reglements",
      },
    ],
    termeReliesSlug: ["conventionnement-cpam", "cpam", "tarif-conventionne", "avenant-10-convention"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "transport-aller-retour",
    terme: "Aller-retour",
    termeComplet: "Transport sanitaire aller-retour",
    categorie: "financement",
    definitionCourte:
      "Mode de facturation du transport sanitaire couvrant le trajet aller vers l'établissement de soins ET le trajet retour au domicile du patient, remboursé en deux actes distincts par l'Assurance Maladie.",
    definitionLongue:
      "Dans le transport sanitaire conventionné, l'aller et le retour constituent deux actes de transport distincts, chacun donnant lieu à une prescription médicale et une facturation séparée. La prescription médicale de transport peut couvrir simultanément l'aller et le retour (prescription unique valable pour les deux trajets) ou faire l'objet de deux prescriptions distinctes.\n\nPour les traitements itératifs (dialyse, chimiothérapie, radiothérapie), la prescription peut être globale sur une période (exemple : prescription mensuelle pour les dialyses, avec facturation au fil des séances). Dans ce cas, l'entreprise de transport doit conserver le planning des séances et les signatures de bons de transport pour chaque aller et retour.\n\nLa CPAM vérifie la cohérence entre le nombre d'allers-retours facturés et les dates de séances confirmées par l'établissement de soins. Des écarts peuvent entraîner des demandes de remboursement (indus) sur les transports non justifiés.",
    sourcesLegales: [],
    termeReliesSlug: ["transport-iteratif", "prescription-medicale-transport", "bon-de-transport", "dialyse"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "non-transport",
    terme: "Non-transport",
    termeComplet: "Refus ou impossibilité de transport sanitaire",
    categorie: "reglementation",
    definitionCourte:
      "Situation dans laquelle un transporteur sanitaire refuse ou ne peut pas réaliser un transport demandé, nécessitant une procédure documentée et une orientation vers un autre prestataire.",
    definitionLongue:
      "Le non-transport désigne la situation dans laquelle une entreprise de transport sanitaire sollicitée ne peut pas ou refuse de réaliser un transport demandé. Les causes légitimes de non-transport comprennent : l'absence de disponibilité de véhicule et de personnel (hors garde ATSU), l'impossibilité technique (véhicule en panne, conditions météorologiques extrêmes), et la dangerosité du transport pour le personnel ou le patient dans certaines situations exceptionnelles.\n\nEn dehors des heures ouvrables, les entreprises de garde ATSU ne peuvent pas refuser un transport urgent régulé par le SAMU sauf impossibilité technique avérée. Tout refus doit être signalé immédiatement au SAMU-Centre 15 pour qu'il puisse solliciter un autre transporteur ou activer la carence ambulancière.\n\nLes transporteurs conventionnés ont une obligation de disponibilité dans le cadre de leur garde départementale. Un non-transport injustifié peut constituer une faute conventionnelle susceptible d'entraîner des sanctions de la CPAM ou de l'ARS.",
    sourcesLegales: [],
    termeReliesSlug: ["garde-departementale-atsu", "carence-ambulanciere", "atsu-association-transport-sanitaire-urgent", "samu-centre-15"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "vehicule-ambu-utilitaire",
    terme: "Fourgon ambulance",
    termeComplet: "Fourgon aménagé en ambulance",
    categorie: "vehicule",
    alternativesOrtho: ["fourgonnette ambulance", "utilitaire sanitaire"],
    definitionCourte:
      "Véhicule utilitaire léger (type Fiat Ducato, Mercedes Sprinter, Renault Master) transformé et aménagé pour le transport sanitaire selon la norme EN 1789, constituant la base des ambulances de type A1 et B en France.",
    definitionLongue:
      "Le fourgon aménagé en ambulance est le type de véhicule le plus répandu dans le parc français de transport sanitaire. Les modèles les plus utilisés sont : Fiat Ducato, Mercedes Sprinter, Renault Master, Volkswagen Crafter et Citroën Jumper. Ces véhicules utilitaires légers offrent le meilleur compromis entre capacité d'emport, agilité en milieu urbain, coût d'achat et facilité de maintenance.\n\nL'aménagement sanitaire est réalisé par des carrossiers spécialisés agréés, qui installent le compartiment patient (brancard, fixations, banquette convoyeur), les équipements médicaux (oxygène, DAE, matelas coquille), la signalisation prioritaire, et les systèmes informatiques (tablette, lecteur Vitale). Le coût d'un fourgon ambulance neuf complet varie entre 70 000 € et 150 000 € selon l'équipement.\n\nLa durée de vie moyenne d'un fourgon ambulance est de 5 à 7 ans ou 200 000 à 300 000 km selon l'intensité d'utilisation. Les véhicules d'occasion sont disponibles sur des places de marché spécialisées comme RoullePro, permettant aux entreprises de renouveler leur flotte à moindre coût.",
    sourcesLegales: [],
    termeReliesSlug: ["ambulance-type-a1", "ambulance-type-b", "norme-en-1789", "agrement-ars"],
    exemples: ["Fiat Ducato 35 aménagé type A1", "Mercedes Sprinter 316 CDI type B avec défibrillateur"],
    miseAJour: "2026-06-28",
  },
  {
    slug: "taux-occupation-vehicule",
    terme: "Taux d'occupation",
    termeComplet: "Taux d'occupation des véhicules sanitaires",
    categorie: "technique",
    definitionCourte:
      "Indicateur de performance mesurant la proportion du temps de service d'un véhicule sanitaire effectivement consacré au transport de patients, par rapport au temps total disponible. Optimisé par le transport partagé.",
    definitionLongue:
      "Le taux d'occupation est un indicateur clé de performance opérationnelle (KPI) pour les entreprises de transport sanitaire. Il mesure le pourcentage du temps de service d'un véhicule effectivement utilisé pour transporter des patients, par opposition aux temps morts (déplacements à vide, attentes, opérations de nettoyage et désinfection).\n\nUn taux d'occupation élevé (supérieur à 70 %) traduit une bonne optimisation des tournées et une rentabilité satisfaisante pour l'entreprise. À l'inverse, un taux inférieur à 40 % peut signaler une sous-activité, une mauvaise organisation des plannings, ou un déséquilibre entre l'offre et la demande dans la zone d'activité.\n\nL'optimisation du taux d'occupation passe par : le transport partagé (plusieurs patients dans le même véhicule), le regroupement géographique des courses, l'utilisation de logiciels d'optimisation des tournées, et la participation aux plateformes de transport coordonné. L'Assurance Maladie encourage le développement du transport partagé car il réduit les coûts pour la collectivité.",
    sourcesLegales: [],
    termeReliesSlug: ["transport-partage", "transport-coordonne", "logiciel-agree", "geolocalistation-gps"],
    miseAJour: "2026-06-28",
  },
];

