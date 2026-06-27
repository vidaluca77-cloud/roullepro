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

// Liste des 50 villes SEO prioritaires (selectionnees par densite d'etablissements
// de sante FINESS pour maximiser le maillage interne ville <-> etablissement).
export const VILLES_SEO = [
  { slug: "paris", nom: "Paris", region: "Ile-de-France" },
  { slug: "marseille", nom: "Marseille", region: "Provence-Alpes-Cote d'Azur" },
  { slug: "toulouse", nom: "Toulouse", region: "Occitanie" },
  { slug: "lyon", nom: "Lyon", region: "Auvergne-Rhone-Alpes" },
  { slug: "lille", nom: "Lille", region: "Hauts-de-France" },
  { slug: "nantes", nom: "Nantes", region: "Pays de la Loire" },
  { slug: "nice", nom: "Nice", region: "Provence-Alpes-Cote d'Azur" },
  { slug: "rennes", nom: "Rennes", region: "Bretagne" },
  { slug: "strasbourg", nom: "Strasbourg", region: "Grand Est" },
  { slug: "montpellier", nom: "Montpellier", region: "Occitanie" },
  { slug: "bordeaux", nom: "Bordeaux", region: "Nouvelle-Aquitaine" },
  { slug: "angers", nom: "Angers", region: "Pays de la Loire" },
  { slug: "nimes", nom: "Nimes", region: "Occitanie" },
  { slug: "brest", nom: "Brest", region: "Bretagne" },
  { slug: "le-havre", nom: "Le Havre", region: "Normandie" },
  { slug: "dijon", nom: "Dijon", region: "Bourgogne-Franche-Comte" },
  { slug: "saint-etienne", nom: "Saint-Etienne", region: "Auvergne-Rhone-Alpes" },
  { slug: "clermont-ferrand", nom: "Clermont-Ferrand", region: "Auvergne-Rhone-Alpes" },
  { slug: "rouen", nom: "Rouen", region: "Normandie" },
  { slug: "perpignan", nom: "Perpignan", region: "Occitanie" },
  { slug: "reims", nom: "Reims", region: "Grand Est" },
  { slug: "le-mans", nom: "Le Mans", region: "Pays de la Loire" },
  { slug: "amiens", nom: "Amiens", region: "Hauts-de-France" },
  { slug: "saint-denis", nom: "Saint-Denis", region: "Ile-de-France" },
  { slug: "aix-en-provence", nom: "Aix-en-Provence", region: "Provence-Alpes-Cote d'Azur" },
  { slug: "mulhouse", nom: "Mulhouse", region: "Grand Est" },
  { slug: "besancon", nom: "Besancon", region: "Bourgogne-Franche-Comte" },
  { slug: "caen", nom: "Caen", region: "Normandie" },
  { slug: "metz", nom: "Metz", region: "Grand Est" },
  { slug: "tours", nom: "Tours", region: "Centre-Val de Loire" },
  { slug: "toulon", nom: "Toulon", region: "Provence-Alpes-Cote d'Azur" },
  { slug: "nancy", nom: "Nancy", region: "Grand Est" },
  { slug: "grenoble", nom: "Grenoble", region: "Auvergne-Rhone-Alpes" },
  { slug: "villeurbanne", nom: "Villeurbanne", region: "Auvergne-Rhone-Alpes" },
  { slug: "montreuil", nom: "Montreuil", region: "Ile-de-France" },
  { slug: "valence", nom: "Valence", region: "Auvergne-Rhone-Alpes" },
  { slug: "nanterre", nom: "Nanterre", region: "Ile-de-France" },
  { slug: "limoges", nom: "Limoges", region: "Nouvelle-Aquitaine" },
  { slug: "orleans", nom: "Orleans", region: "Centre-Val de Loire" },
  { slug: "fort-de-france", nom: "Fort-de-France", region: "Martinique" },
  { slug: "la-rochelle", nom: "La Rochelle", region: "Nouvelle-Aquitaine" },
  { slug: "avignon", nom: "Avignon", region: "Provence-Alpes-Cote d'Azur" },
  { slug: "poitiers", nom: "Poitiers", region: "Nouvelle-Aquitaine" },
  { slug: "annecy", nom: "Annecy", region: "Auvergne-Rhone-Alpes" },
  { slug: "chambery", nom: "Chambery", region: "Auvergne-Rhone-Alpes" },
  { slug: "bayonne", nom: "Bayonne", region: "Nouvelle-Aquitaine" },
  { slug: "pau", nom: "Pau", region: "Nouvelle-Aquitaine" },
  { slug: "ajaccio", nom: "Ajaccio", region: "Corse" },
  { slug: "chelles", nom: "Chelles", region: "Ile-de-France" },
  { slug: "argenteuil", nom: "Argenteuil", region: "Ile-de-France" },
];

export function findCategorie(slug: string): CategorieSeo | undefined {
  return CATEGORIES_SEO.find((c) => c.slug === slug);
}

export function findVille(slug: string) {
  return VILLES_SEO.find((v) => v.slug === slug);
}
