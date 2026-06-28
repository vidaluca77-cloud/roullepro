/**
 * FAQ globale transport sanitaire — source unique partagée entre :
 *  - /faq (page publique avec JSON-LD FAQPage)
 *  - /llms-full.txt (section text/plain pour LLM)
 */

export type FaqEntry = {
  question: string;
  reponse: string;
};

export const FAQ_GLOBALE: FaqEntry[] = [
  {
    question: "Quelle est la différence entre une ambulance, un VSL et un taxi conventionné ?",
    reponse:
      "L'ambulance transporte des patients allongés ou en état instable, avec un équipage diplômé (DEA + auxiliaire ambulancier), du matériel médical à bord (oxygène, défibrillateur, matelas coquille). Le VSL (Véhicule Sanitaire Léger) transporte des patients stables en position assise sur prescription médicale, le conducteur est titulaire du diplôme d'auxiliaire ambulancier. Le taxi conventionné est un taxi agréé par la CPAM qui transporte des patients autonomes en position assise vers leur lieu de soins.",
  },
  {
    question: "Le transport sanitaire est-il remboursé par la Sécurité sociale ?",
    reponse:
      "Oui. Le transport en ambulance, VSL ou taxi conventionné est remboursé à 65 % par l'Assurance maladie sur prescription médicale. Le taux passe à 100 % pour les patients en ALD (Affection Longue Durée), en maternité ou victimes d'un accident du travail. Le tiers payant est généralement appliqué : vous n'avancez pas les frais.",
  },
  {
    question: "Comment obtenir une prescription de transport sanitaire ?",
    reponse:
      "Votre médecin traitant, un médecin spécialiste ou un médecin hospitalier peut établir une prescription médicale de transport (PMT). La prescription doit préciser la destination, le type de transport prescrit (ambulance, VSL ou taxi conventionné) et la raison médicale. Sans PMT, le transport ne sera pas remboursé.",
  },
  {
    question: "Qu'est-ce que le conventionnement CPAM pour les taxis ?",
    reponse:
      "Un taxi conventionné a signé une convention individuelle avec sa caisse primaire d'Assurance maladie (CPAM). Cela lui permet de transporter des patients sur prescription médicale avec tiers payant. La convention cadre nationale du 13 mai 2025 a réformé les tarifs et les conditions d'accès au conventionnement. La liste des taxis conventionnés est disponible sur ameli.fr.",
  },
  {
    question: "Qu'est-ce que l'agrément ARS pour les ambulances et VSL ?",
    reponse:
      "Les entreprises de transport sanitaire terrestre (ambulances et VSL) doivent obtenir un agrément délivré par l'Agence Régionale de Santé (ARS). Cet agrément atteste que l'entreprise respecte les conditions réglementaires : diplômes du personnel, équipements des véhicules, organisation de service. Sans agrément, l'entreprise ne peut pas facturer à l'Assurance maladie.",
  },
  {
    question: "Qu'est-ce que le transport partagé obligatoire depuis 2025 ?",
    reponse:
      "Depuis le 1er avril 2025, le décret n°2025-202 du 2 mars 2025 impose le transport partagé pour les transports assis programmés répétitifs (dialyse, chimiothérapie, radiothérapie et soins itératifs). Cela signifie que plusieurs patients peuvent partager le même véhicule sur un même trajet. Ce mécanisme vise à réduire les dépenses de l'Assurance maladie et à optimiser les tournées des transporteurs.",
  },
  {
    question: "Comment trouver un ambulancier, un VSL ou un taxi conventionné près de chez moi ?",
    reponse:
      "Utilisez l'annuaire gratuit RoullePro sur roullepro.com/transport-medical. Tapez votre ville pour voir la liste des professionnels avec leur numéro de téléphone direct, leurs horaires et leur statut de conventionnement CPAM. Vous pouvez aussi filtrer par type (ambulance, VSL, taxi conventionné) ou par disponibilité.",
  },
  {
    question: "Peut-on choisir librement son transporteur sanitaire ?",
    reponse:
      "En principe oui, le patient peut choisir son transporteur. Cependant, la prescription médicale indique le type de transport (ambulance, VSL ou taxi). L'Assurance maladie peut refuser le remboursement si le type de véhicule utilisé est plus onéreux que ce qui était prescrit sans justification médicale.",
  },
  {
    question: "Que coûte un transport en ambulance non remboursé ?",
    reponse:
      "Sans prescription médicale ou hors Assurance maladie, un transport en ambulance coûte entre 150 et 600 euros selon la distance et la région. Le tarif est réglementé par convention avec l'Assurance maladie. Il est donc fortement recommandé d'avoir une prescription avant de commander un transport.",
  },
  {
    question: "Quels sont les tarifs des taxis conventionnés en 2025 ?",
    reponse:
      "La nouvelle convention cadre nationale du 13 mai 2025 a revu les tarifs des taxis conventionnés. Les tarifs de base sont fixés nationalement puis adaptés par département. Ils comprennent un forfait de prise en charge et un tarif kilométrique. L'Assurance maladie rembourse 65 % du tarif conventionnel, ou 100 % pour les patients en ALD. Consultez ameli.fr pour les tarifs exacts de votre département.",
  },
  {
    question: "Comment s'inscrire comme professionnel du transport sanitaire sur RoullePro ?",
    reponse:
      "Si vous êtes ambulancier, gérant de VSL ou taxi conventionné, votre fiche est probablement déjà créée à partir des données publiques INSEE (SIRENE). Rendez-vous sur roullepro.com/transport-medical/pro pour la réclamer gratuitement. Si votre entreprise n'est pas encore référencée, inscrivez-la sur roullepro.com/transport-medical/inscription.",
  },
  {
    question: "Qu'est-ce que le SEFi et quand est-il obligatoire ?",
    reponse:
      "Le SEFi (Système Electronique de Facturation Instantanée) est le futur système de facturation électronique obligatoire pour tous les transporteurs sanitaires conventionnés. Il comprend un boîtier GPS, un terminal de facturation électronique et la géolocalisation en temps réel. L'obligation s'applique à partir du 1er janvier 2027 pour tous les transporteurs sanitaires conventionnés.",
  },
  {
    question: "Quels diplômes sont nécessaires pour exercer comme ambulancier ?",
    reponse:
      "Le DEA (Diplôme d'État d'Ambulancier) est obligatoire pour au moins un des membres de l'équipage d'une ambulance. L'auxiliaire ambulancier doit détenir le CCA (Certificat de Capacité d'Ambulancier). Pour les VSL, le conducteur doit être titulaire du diplôme d'auxiliaire ambulancier. Ces diplômes sont délivrés après une formation spécialisée.",
  },
  {
    question: "Qu'est-ce que l'ADS pour les taxis conventionnés ?",
    reponse:
      "L'ADS (Autorisation De Stationnement) est une licence administrative délivrée par la commune qui autorise le taxi à stationner sur la voie publique et à prendre en charge des clients en maraude dans sa zone. Un taxi peut effectuer des courses hors de sa zone ADS uniquement sur réservation préalable (art. L.3121-1 du Code des transports). La ZUPC (Zone Unique de Prise en Charge) regroupe plusieurs communes couvertes par une même ADS.",
  },
  {
    question: "Le transport sanitaire est-il différent selon les régions ?",
    reponse:
      "Les règles nationales s'appliquent uniformément, mais les conventions locales peuvent prévoir des adaptations tarifaires. Certains départements ou régions ont des accords spécifiques avec les CPAM locales. L'agrément ARS est délivré par région. Pour les taxis conventionnés, la convention est nationale mais les barèmes kilométriques peuvent varier légèrement selon les CPAM.",
  },
  {
    question: "Comment fonctionne le tiers payant pour les transports sanitaires ?",
    reponse:
      "Avec le tiers payant, vous ne payez pas le transport au moment de la course. Le transporteur facture directement l'Assurance maladie et votre mutuelle. Vous devez cependant présenter votre carte Vitale et votre prescription médicale. La prise en charge à 100 % (sans aucun reste à charge) s'applique aux patients en ALD, en maternité ou après un accident du travail.",
  },
  {
    question: "Peut-on appeler une ambulance en urgence sans prescription ?",
    reponse:
      "En cas d'urgence absolue, appelez le 15 (SAMU), le 18 (pompiers) ou le 112. Ces numéros envoient des secours gratuitement. Pour un transport non urgent sur prescription médicale, contactez directement un ambulancier référencé dans l'annuaire RoullePro. Sans prescription, le transport sera à votre charge.",
  },
  {
    question: "Quelle est la différence entre transport sanitaire d'urgence et programmé ?",
    reponse:
      "Le transport d'urgence (SMUR, ambulance de réanimation) est déclenché par le 15/SAMU pour des situations vitales. Le transport programmé couvre les rendez-vous médicaux, hospitalisations planifiées, séances de dialyse, chimiothérapie, etc. L'annuaire RoullePro recense principalement les transporteurs pour les transports programmés remboursés par l'Assurance maladie.",
  },
  {
    question: "Comment vérifier si un professionnel est bien conventionné CPAM ?",
    reponse:
      "Sur chaque fiche RoullePro, le badge « Conventionné CPAM » indique que le professionnel est référencé dans l'annuaire officiel de l'Assurance maladie (ameli.fr). Vous pouvez aussi vérifier directement sur ameli.fr dans la section « Trouver un professionnel de santé ».",
  },
  {
    question: "Quelles sont les obligations du patient lors d'un transport sanitaire conventionné ?",
    reponse:
      "Le patient doit présenter une prescription médicale valide, sa carte Vitale et son attestation d'assurance complémentaire (si applicable). Il doit se montrer ponctuel pour les horaires de prise en charge. En cas d'annulation, il est recommandé de prévenir le transporteur le plus tôt possible. Pour les transports partagés depuis 2025, le patient doit accepter de partager le véhicule.",
  },
  {
    question: "Combien de temps à l'avance faut-il réserver un transport sanitaire programmé ?",
    reponse:
      "Pour les transports programmés réguliers (dialyse, radiothérapie), il est conseillé de contacter le transporteur au moins 48 heures à l'avance. Pour les hospitalisations ou rendez-vous ponctuels, 24 heures de délai est un minimum. Certains transporteurs peuvent parfois intervenir le jour même sur disponibilité.",
  },
  {
    question: "Existe-t-il des aides spécifiques pour le transport de personnes à mobilité réduite (PMR) ?",
    reponse:
      "Les VSL et taxis conventionnés PMR (accessibles en fauteuil roulant) bénéficient du même régime de remboursement. Des véhicules TPMR (Transport de Personnes à Mobilité Réduite) spécialisés sont disponibles pour les patients en fauteuil roulant électrique ou non repliable. Certaines CPAM ont des partenariats spécifiques pour les patients en situation de handicap.",
  },
  {
    question: "Peut-on effectuer un transport sanitaire transfrontalier remboursé ?",
    reponse:
      "Les transports vers des établissements à l'étranger sont exceptionnellement pris en charge par l'Assurance maladie, uniquement si l'établissement étranger est agréé et si le transport est médicalement justifié et prescrit. Dans les zones frontalières, des accords bilatéraux peuvent exister. Il est indispensable d'obtenir un accord préalable de la CPAM avant le transport.",
  },
  {
    question: "Qu'est-ce que la convention cadre nationale des taxis conventionnés de 2025 ?",
    reponse:
      "La convention cadre nationale signée le 13 mai 2025 réforme en profondeur le conventionnement des taxis avec l'Assurance maladie. Elle révise les tarifs (application au 1er octobre 2025), renforce les obligations de qualité de service, instaure des critères d'accès plus stricts au conventionnement et prépare la transition vers le SEFi obligatoire en 2027. Elle s'applique à tous les taxis conventionnés en France métropolitaine et dans les DOM.",
  },
  {
    question: "Où signaler une fraude ou un comportement incorrect d'un transporteur sanitaire ?",
    reponse:
      "Vous pouvez signaler une anomalie via le formulaire de signalement sur chaque fiche RoullePro, contacter votre CPAM locale, ou signaler sur le portail de l'Assurance maladie (amelie.fr). Pour les cas graves (fraude à la facturation, non-respect des normes de sécurité), contactez l'ARS de votre région.",
  },
];
