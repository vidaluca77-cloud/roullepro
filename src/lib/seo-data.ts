// Donnees statiques pour les pages SEO programmatiques (longue traine)

export type CategorieSeo = {
  slug: string;
  slugBdd: string; // slug reel dans la table categories
  nomH1: string;
  nomPhrase: string; // "taxi", "vehicule VTC", etc. (injectable dans une phrase)
  intro: string;
  motsClesConnexes: string[];
};

export const CATEGORIES_SEO: CategorieSeo[] = [
  {
    slug: "taxi",
    slugBdd: "taxi",
    nomH1: "Taxi d'occasion pour professionnels",
    nomPhrase: "taxi",
    intro:
      "RoullePro regroupe les annonces de taxis d'occasion verifies, avec ou sans licence cessible (autorisation de stationnement). Tous les vendeurs sont controles contre le registre SIRET et chaque vehicule est modere manuellement avant publication.",
    motsClesConnexes: [
      "licence taxi",
      "ADS cessible",
      "taxi parisien G7",
      "Renault Talisman taxi",
      "Peugeot 508 taxi",
      "Toyota Prius taxi",
    ],
  },
  {
    slug: "vtc",
    slugBdd: "vtc",
    nomH1: "Vehicule VTC d'occasion",
    nomPhrase: "vehicule VTC",
    intro:
      "Plateforme dediee aux berlines et SUV premium pour l'activite VTC : Mercedes Classe E, BMW Serie 5, Audi A6, Tesla Model 3. Les annonces precisent la carte VTC du vendeur et l'etat du vehicule pour un demarrage rapide d'activite.",
    motsClesConnexes: [
      "Mercedes Classe E VTC",
      "BMW Serie 5 VTC",
      "Tesla Model 3 VTC",
      "capacite professionnelle VTC",
      "berline premium VTC",
    ],
  },
  {
    slug: "ambulance",
    slugBdd: "ambulance",
    nomH1: "Ambulance et VSL d'occasion",
    nomPhrase: "ambulance",
    intro:
      "Place de marche specialisee pour les ambulances types A, B et C, les vehicules sanitaires legers (VSL) et les amenagements sanitaires homologues. Vendeurs verifies par agrement ARS et SIRET actif.",
    motsClesConnexes: [
      "Fiat Ducato ambulance",
      "Renault Trafic VSL",
      "Citroen Jumper ambulance",
      "amenagement sanitaire",
      "agrement ARS",
      "ambulance type B",
    ],
  },
  {
    slug: "tpmr",
    slugBdd: "tpmr",
    nomH1: "Vehicule TPMR / PMR d'occasion",
    nomPhrase: "vehicule TPMR",
    intro:
      "Vehicules amenages pour le transport de personnes a mobilite reduite, rampe d'acces, sieges pivotants, planchers abaisses. Annonces verifiees avec documents d'homologation disponibles.",
    motsClesConnexes: [
      "rampe acces fauteuil",
      "plancher abaisse",
      "Renault Kangoo TPMR",
      "Citroen Berlingo TPMR",
      "homologation TPMR",
    ],
  },
  {
    slug: "navette",
    slugBdd: "navette",
    nomH1: "Navette et minibus d'occasion",
    nomPhrase: "minibus",
    intro:
      "Navettes et minibus 9 places pour transport collectif, navette aeroport, transport scolaire ou touristique. Vehicules verifies SIRET et carte de transport collectif.",
    motsClesConnexes: [
      "minibus 9 places",
      "Mercedes Sprinter navette",
      "Renault Master minibus",
      "navette aeroport",
      "transport scolaire",
    ],
  },
  {
    slug: "utilitaire",
    slugBdd: "utilitaire",
    nomH1: "Utilitaire d'occasion pour professionnels",
    nomPhrase: "utilitaire",
    intro:
      "Fourgonnettes, fourgons et utilitaires de travail pour artisans, logisticiens et independants. Catalogue des grandes references : Renault Trafic, Master, Kangoo, Peugeot Expert, Boxer, Citroen Jumpy, Berlingo, Fiat Ducato, Ford Transit, Mercedes Vito, Sprinter, Iveco Daily.",
    motsClesConnexes: [
      "Renault Trafic",
      "Renault Master",
      "Peugeot Expert",
      "Fiat Ducato",
      "Ford Transit",
      "Mercedes Sprinter",
      "fourgon amenage",
    ],
  },
];

// Liste des 18 villes SEO prioritaires (reprises du sitemap existant)
export const VILLES_SEO = [
  { slug: "paris", nom: "Paris", region: "Ile-de-France" },
  { slug: "lyon", nom: "Lyon", region: "Auvergne-Rhone-Alpes" },
  { slug: "marseille", nom: "Marseille", region: "Provence-Alpes-Cote d'Azur" },
  { slug: "toulouse", nom: "Toulouse", region: "Occitanie" },
  { slug: "bordeaux", nom: "Bordeaux", region: "Nouvelle-Aquitaine" },
  { slug: "lille", nom: "Lille", region: "Hauts-de-France" },
  { slug: "nantes", nom: "Nantes", region: "Pays de la Loire" },
  { slug: "rennes", nom: "Rennes", region: "Bretagne" },
  { slug: "strasbourg", nom: "Strasbourg", region: "Grand Est" },
  { slug: "montpellier", nom: "Montpellier", region: "Occitanie" },
  { slug: "nice", nom: "Nice", region: "Provence-Alpes-Cote d'Azur" },
  { slug: "rouen", nom: "Rouen", region: "Normandie" },
  { slug: "grenoble", nom: "Grenoble", region: "Auvergne-Rhone-Alpes" },
  { slug: "reims", nom: "Reims", region: "Grand Est" },
  { slug: "caen", nom: "Caen", region: "Normandie" },
  { slug: "saint-etienne", nom: "Saint-Etienne", region: "Auvergne-Rhone-Alpes" },
  { slug: "le-havre", nom: "Le Havre", region: "Normandie" },
  { slug: "chelles", nom: "Chelles", region: "Ile-de-France" },
];

export function findCategorie(slug: string): CategorieSeo | undefined {
  return CATEGORIES_SEO.find((c) => c.slug === slug);
}

export function findVille(slug: string) {
  return VILLES_SEO.find((v) => v.slug === slug);
}
