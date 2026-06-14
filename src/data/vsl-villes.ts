/**
 * Donnees editoriales des 30 pages /vsl/[ville] (Phase 2 SEO).
 *
 * Chaque entree alimente une page ville generee dynamiquement par la route
 * /vsl/[ville]/page.tsx. Le slug correspond au ville_slug utilise dans Supabase
 * (table pros_sanitaire_public) afin de pouvoir filtrer l'annuaire local.
 * Centraliser ces donnees ici limite la duplication et facilite l'ajout de villes.
 */

export type VslVille = {
  /** ville_slug aligne sur Supabase / route /transport-medical/[ville]. */
  slug: string;
  /** Nom affiche (avec accents). */
  nom: string;
  /** Nom du departement. */
  departement: string;
  /** Code departement (2 ou 3 caracteres). */
  codeDepartement: string;
  /** Libelle de la caisse CPAM competente. */
  cpamLibelle: string;
  /** Principaux etablissements de sante locaux (ancrage editorial). */
  hopitaux: string[];
  /** Intro personnalisee facultative ; sinon une intro est generee. */
  introOverride?: string;
};

export const VSL_VILLES: VslVille[] = [
  {
    slug: "marseille",
    nom: "Marseille",
    departement: "Bouches-du-Rhône",
    codeDepartement: "13",
    cpamLibelle: "CPAM des Bouches-du-Rhône",
    hopitaux: ["AP-HM Timone", "Hôpital Nord", "Hôpital de la Conception", "Institut Paoli-Calmettes"],
  },
  {
    slug: "lyon",
    nom: "Lyon",
    departement: "Rhône",
    codeDepartement: "69",
    cpamLibelle: "CPAM du Rhône",
    hopitaux: ["Hôpital Édouard-Herriot", "Hôpital de la Croix-Rousse", "Centre Léon Bérard"],
  },
  {
    slug: "toulouse",
    nom: "Toulouse",
    departement: "Haute-Garonne",
    codeDepartement: "31",
    cpamLibelle: "CPAM de la Haute-Garonne",
    hopitaux: ["CHU de Toulouse-Rangueil", "Hôpital Purpan", "Institut Universitaire du Cancer (IUCT-Oncopole)"],
  },
  {
    slug: "bordeaux",
    nom: "Bordeaux",
    departement: "Gironde",
    codeDepartement: "33",
    cpamLibelle: "CPAM de la Gironde",
    hopitaux: ["CHU de Bordeaux-Pellegrin", "Hôpital Saint-André", "Hôpital Haut-Lévêque"],
  },
  {
    slug: "nice",
    nom: "Nice",
    departement: "Alpes-Maritimes",
    codeDepartement: "06",
    cpamLibelle: "CPAM des Alpes-Maritimes",
    hopitaux: ["CHU Pasteur", "Hôpital de l'Archet", "Centre Antoine Lacassagne"],
  },
  {
    slug: "nantes",
    nom: "Nantes",
    departement: "Loire-Atlantique",
    codeDepartement: "44",
    cpamLibelle: "CPAM de la Loire-Atlantique",
    hopitaux: ["CHU de Nantes-Hôtel-Dieu", "Hôpital Laennec", "Institut de Cancérologie de l'Ouest"],
  },
  {
    slug: "strasbourg",
    nom: "Strasbourg",
    departement: "Bas-Rhin",
    codeDepartement: "67",
    cpamLibelle: "CPAM du Bas-Rhin",
    hopitaux: ["Hôpital Civil", "Hôpital de Hautepierre", "Institut de Cancérologie Strasbourg Europe"],
  },
  {
    slug: "montpellier",
    nom: "Montpellier",
    departement: "Hérault",
    codeDepartement: "34",
    cpamLibelle: "CPAM de l'Hérault",
    hopitaux: ["CHU Lapeyronie", "Hôpital Gui de Chauliac", "Institut du Cancer de Montpellier (ICM)"],
  },
  {
    slug: "lille",
    nom: "Lille",
    departement: "Nord",
    codeDepartement: "59",
    cpamLibelle: "CPAM du Nord",
    hopitaux: ["CHU de Lille", "Hôpital Roger Salengro", "Centre Oscar Lambret"],
  },
  {
    slug: "rennes",
    nom: "Rennes",
    departement: "Ille-et-Vilaine",
    codeDepartement: "35",
    cpamLibelle: "CPAM d'Ille-et-Vilaine",
    hopitaux: ["CHU de Rennes-Pontchaillou", "Hôpital Sud", "Centre Eugène Marquis"],
  },
  {
    slug: "reims",
    nom: "Reims",
    departement: "Marne",
    codeDepartement: "51",
    cpamLibelle: "CPAM de la Marne",
    hopitaux: ["CHU de Reims-Robert Debré", "Hôpital Maison Blanche", "Institut Jean Godinot"],
  },
  {
    slug: "saint-etienne",
    nom: "Saint-Étienne",
    departement: "Loire",
    codeDepartement: "42",
    cpamLibelle: "CPAM de la Loire",
    hopitaux: ["CHU de Saint-Étienne-Nord", "Hôpital Bellevue", "Institut de Cancérologie Lucien Neuwirth"],
  },
  {
    slug: "le-havre",
    nom: "Le Havre",
    departement: "Seine-Maritime",
    codeDepartement: "76",
    cpamLibelle: "CPAM de la Seine-Maritime",
    hopitaux: ["Groupe Hospitalier du Havre (Hôpital Jacques Monod)", "Hôpital Flaubert"],
  },
  {
    slug: "toulon",
    nom: "Toulon",
    departement: "Var",
    codeDepartement: "83",
    cpamLibelle: "CPAM du Var",
    hopitaux: ["CHITS Hôpital Sainte-Musse", "Hôpital Font-Pré", "Hôpital d'instruction des armées Sainte-Anne"],
  },
  {
    slug: "grenoble",
    nom: "Grenoble",
    departement: "Isère",
    codeDepartement: "38",
    cpamLibelle: "CPAM de l'Isère",
    hopitaux: ["CHU Grenoble Alpes-La Tronche", "Hôpital Michallon", "Hôpital Sud"],
  },
  {
    slug: "dijon",
    nom: "Dijon",
    departement: "Côte-d'Or",
    codeDepartement: "21",
    cpamLibelle: "CPAM de la Côte-d'Or",
    hopitaux: ["CHU Dijon Bourgogne-Le Bocage", "Centre Georges-François Leclerc"],
  },
  {
    slug: "angers",
    nom: "Angers",
    departement: "Maine-et-Loire",
    codeDepartement: "49",
    cpamLibelle: "CPAM de Maine-et-Loire",
    hopitaux: ["CHU d'Angers", "Institut de Cancérologie de l'Ouest-Paul Papin"],
  },
  {
    slug: "nimes",
    nom: "Nîmes",
    departement: "Gard",
    codeDepartement: "30",
    cpamLibelle: "CPAM du Gard",
    hopitaux: ["CHU de Nîmes-Carémeau", "Institut de cancérologie du Gard"],
  },
  {
    slug: "villeurbanne",
    nom: "Villeurbanne",
    departement: "Rhône",
    codeDepartement: "69",
    cpamLibelle: "CPAM du Rhône",
    hopitaux: ["Médipôle Lyon-Villeurbanne", "proximité des Hospices Civils de Lyon"],
  },
  {
    slug: "saint-denis",
    nom: "Saint-Denis",
    departement: "Seine-Saint-Denis",
    codeDepartement: "93",
    cpamLibelle: "CPAM de la Seine-Saint-Denis",
    hopitaux: ["Centre Hospitalier de Saint-Denis-Delafontaine", "Hôpital Casanova"],
  },
  {
    slug: "aix-en-provence",
    nom: "Aix-en-Provence",
    departement: "Bouches-du-Rhône",
    codeDepartement: "13",
    cpamLibelle: "CPAM des Bouches-du-Rhône",
    hopitaux: ["Centre Hospitalier du Pays d'Aix", "Clinique Axium", "Polyclinique du Parc Rambot"],
  },
  {
    slug: "brest",
    nom: "Brest",
    departement: "Finistère",
    codeDepartement: "29",
    cpamLibelle: "CPAM du Finistère",
    hopitaux: ["CHU de Brest-La Cavale Blanche", "Hôpital Morvan"],
  },
  {
    slug: "limoges",
    nom: "Limoges",
    departement: "Haute-Vienne",
    codeDepartement: "87",
    cpamLibelle: "CPAM de la Haute-Vienne",
    hopitaux: ["CHU de Limoges-Dupuytren", "Hôpital de la Mère et de l'Enfant"],
  },
  {
    slug: "tours",
    nom: "Tours",
    departement: "Indre-et-Loire",
    codeDepartement: "37",
    cpamLibelle: "CPAM d'Indre-et-Loire",
    hopitaux: ["CHRU de Tours-Bretonneau", "Hôpital Trousseau", "Hôpital Clocheville"],
  },
  {
    slug: "amiens",
    nom: "Amiens",
    departement: "Somme",
    codeDepartement: "80",
    cpamLibelle: "CPAM de la Somme",
    hopitaux: ["CHU Amiens-Picardie", "Hôpital Sud"],
  },
  {
    slug: "perpignan",
    nom: "Perpignan",
    departement: "Pyrénées-Orientales",
    codeDepartement: "66",
    cpamLibelle: "CPAM des Pyrénées-Orientales",
    hopitaux: ["Centre Hospitalier de Perpignan-Saint-Jean", "Clinique Saint-Pierre"],
  },
  {
    slug: "metz",
    nom: "Metz",
    departement: "Moselle",
    codeDepartement: "57",
    cpamLibelle: "CPAM de la Moselle",
    hopitaux: ["CHR Metz-Thionville-Hôpital de Mercy", "Hôpital Legouest"],
  },
  {
    slug: "besancon",
    nom: "Besançon",
    departement: "Doubs",
    codeDepartement: "25",
    cpamLibelle: "CPAM du Doubs",
    hopitaux: ["CHU de Besançon-Jean Minjoz", "Hôpital Saint-Jacques"],
  },
  {
    slug: "orleans",
    nom: "Orléans",
    departement: "Loiret",
    codeDepartement: "45",
    cpamLibelle: "CPAM du Loiret",
    hopitaux: ["CHU d'Orléans-La Source", "Hôpital Madeleine"],
  },
  {
    slug: "mulhouse",
    nom: "Mulhouse",
    departement: "Haut-Rhin",
    codeDepartement: "68",
    cpamLibelle: "CPAM du Haut-Rhin",
    hopitaux: ["Groupe Hospitalier de la Région de Mulhouse Sud-Alsace (Hôpital Émile Muller)"],
  },
];

export function getVslVille(slug: string): VslVille | null {
  return VSL_VILLES.find((v) => v.slug === slug) ?? null;
}

export function getVslVilleSlugs(): string[] {
  return VSL_VILLES.map((v) => v.slug);
}
