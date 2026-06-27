// Types d'etablissements de sante pour les pages SEO Chantier E.
// Chaque type genere des pages /etablissements/type/[type]/[ville] ciblant
// les requetes longue traine "transport medical [type] [ville]".

export type TypeEtablissementSeo = {
  /** Slug d'URL (utilise dans /etablissements/type/[type]/[ville]). */
  slug: string;
  /** Valeur reelle dans la colonne categorie_simple de etablissements_sante_public. */
  categorieSimple: string;
  /** Libelle pluriel pour H1 et title (ex: "EHPAD"). */
  libellePluriel: string;
  /** Libelle singulier ("un EHPAD", "un hopital"). */
  libelleSingulier: string;
  /** Article defini ("les EHPAD", "les hopitaux"). */
  articleDefini: string;
  /** Phrase d'accroche meta description. */
  metaDescriptionTemplate: string;
  /** Bloc intro contextuel (1-2 paragraphes). */
  introContexte: string;
  /** Mots-cles connexes pour densite semantique. */
  motsClesConnexes: string[];
};

export const TYPES_ETABLISSEMENTS: TypeEtablissementSeo[] = [
  {
    slug: "ehpad",
    categorieSimple: "ehpad",
    libellePluriel: "EHPAD",
    libelleSingulier: "un EHPAD",
    articleDefini: "les EHPAD",
    metaDescriptionTemplate:
      "Transport medical conventionne CPAM vers les EHPAD de {ville}. Taxi, VSL et ambulance pour residents et visiteurs. Reservation et tarifs Assurance Maladie.",
    introContexte:
      "Les Etablissements d'Hebergement pour Personnes Agees Dependantes (EHPAD) accueillent des residents qui ont souvent besoin de transports medicaux reguliers : consultations specialisees, hospitalisations programmees, dialyses, soins de suite. Sur RoullePro, retrouvez les transporteurs conventionnes Assurance Maladie qui desservent les EHPAD de votre ville, avec prise en charge a 100% sur prescription medicale.",
    motsClesConnexes: [
      "transport EHPAD",
      "taxi EHPAD CPAM",
      "ambulance maison de retraite",
      "VSL EHPAD",
      "transport residents EHPAD",
      "visite famille EHPAD",
    ],
  },
  {
    slug: "hopital",
    categorieSimple: "hopital",
    libellePluriel: "Hopitaux",
    libelleSingulier: "un hopital",
    articleDefini: "les hopitaux",
    metaDescriptionTemplate:
      "Transport medical conventionne CPAM vers les hopitaux de {ville}. Taxi, VSL et ambulance pour consultations, hospitalisations et urgences. Prise en charge Assurance Maladie sur prescription.",
    introContexte:
      "Les hopitaux publics et CHU realisent les consultations specialisees, les actes chirurgicaux et les hospitalisations qui necessitent souvent un transport medicalement adapte. Sur RoullePro, trouvez les taxis conventionnes, VSL et ambulances qui assurent les trajets vers les hopitaux de votre ville, avec tiers payant CPAM.",
    motsClesConnexes: [
      "transport hopital",
      "taxi CHU CPAM",
      "ambulance hospitalisation",
      "VSL consultation hopital",
      "transport urgence hopital",
      "tiers payant hopital",
    ],
  },
  {
    slug: "clinique",
    categorieSimple: "clinique",
    libellePluriel: "Cliniques",
    libelleSingulier: "une clinique",
    articleDefini: "les cliniques",
    metaDescriptionTemplate:
      "Transport medical conventionne CPAM vers les cliniques de {ville}. Taxi, VSL et ambulance pour consultations, chirurgie ambulatoire et hospitalisations privees. Prise en charge Assurance Maladie.",
    introContexte:
      "Les cliniques privees realisent une part importante de la chirurgie ambulatoire, des soins de suite et des consultations specialisees. Le transport vers une clinique conventionnee CPAM ouvre droit a la prise en charge a 100% sur prescription medicale. Retrouvez sur RoullePro les transporteurs conventionnes qui desservent les cliniques de votre ville.",
    motsClesConnexes: [
      "transport clinique",
      "taxi clinique CPAM",
      "ambulance chirurgie ambulatoire",
      "VSL clinique",
      "transport clinique privee",
      "post operatoire clinique",
    ],
  },
  {
    slug: "centre-dialyse",
    categorieSimple: "centre-dialyse",
    libellePluriel: "Centres de dialyse",
    libelleSingulier: "un centre de dialyse",
    articleDefini: "les centres de dialyse",
    metaDescriptionTemplate:
      "Transport medical conventionne CPAM vers les centres de dialyse de {ville}. VSL et taxi pour seances d'hemodialyse 3 fois par semaine. Affection longue duree (ALD), prise en charge 100% CPAM.",
    introContexte:
      "Les patients dialyses suivent des seances d'hemodialyse 3 fois par semaine, soit environ 156 trajets par an. Ce besoin recurrent ouvre droit a une prise en charge integrale par l'Assurance Maladie au titre de l'Affection Longue Duree (ALD). RoullePro regroupe les VSL et taxis conventionnes specialises dans le transport iteratif vers les centres de dialyse de votre ville.",
    motsClesConnexes: [
      "transport dialyse",
      "VSL dialyse ALD",
      "taxi dialyse CPAM",
      "hemodialyse transport",
      "transport iteratif dialyse",
      "ALD dialyse 100%",
    ],
  },
  {
    slug: "rehabilitation",
    categorieSimple: "rehabilitation",
    libellePluriel: "Centres de reeducation",
    libelleSingulier: "un centre de reeducation",
    articleDefini: "les centres de reeducation et soins de suite",
    metaDescriptionTemplate:
      "Transport medical conventionne CPAM vers les centres de reeducation de {ville}. Taxi, VSL et ambulance pour soins de suite (SSR), reeducation fonctionnelle et convalescence. Prise en charge Assurance Maladie.",
    introContexte:
      "Les centres de Soins de Suite et Readaptation (SSR) accueillent les patients en convalescence apres une hospitalisation ou pour une reeducation specialisee (orthopedie, neurologie, cardio-respiratoire). Les sejours impliquent souvent des transports reguliers entre le domicile et le centre. RoullePro reference les taxis conventionnes, VSL et ambulances qui assurent ces trajets dans votre ville.",
    motsClesConnexes: [
      "transport SSR",
      "taxi reeducation CPAM",
      "ambulance soins de suite",
      "VSL convalescence",
      "transport reeducation fonctionnelle",
      "trajet centre SSR",
    ],
  },
];

export function getTypeEtablissement(slug: string): TypeEtablissementSeo | undefined {
  return TYPES_ETABLISSEMENTS.find((t) => t.slug === slug);
}

export function getTypeEtablissementSlugs(): string[] {
  return TYPES_ETABLISSEMENTS.map((t) => t.slug);
}
