/**
 * Mapping code departement -> { nom, region, prefecture }.
 * Source : INSEE - codes officiels geographiques.
 * Couvre la France metropolitaine et l'outre-mer.
 */

export type DepartementInfo = {
  code: string;
  nom: string;
  region: string;
  prefecture: string;
};

export const DEPARTEMENTS_FR: Record<string, DepartementInfo> = {
  "01": { code: "01", nom: "Ain", region: "Auvergne-Rhone-Alpes", prefecture: "Bourg-en-Bresse" },
  "02": { code: "02", nom: "Aisne", region: "Hauts-de-France", prefecture: "Laon" },
  "03": { code: "03", nom: "Allier", region: "Auvergne-Rhone-Alpes", prefecture: "Moulins" },
  "04": { code: "04", nom: "Alpes-de-Haute-Provence", region: "Provence-Alpes-Cote d'Azur", prefecture: "Digne-les-Bains" },
  "05": { code: "05", nom: "Hautes-Alpes", region: "Provence-Alpes-Cote d'Azur", prefecture: "Gap" },
  "06": { code: "06", nom: "Alpes-Maritimes", region: "Provence-Alpes-Cote d'Azur", prefecture: "Nice" },
  "07": { code: "07", nom: "Ardeche", region: "Auvergne-Rhone-Alpes", prefecture: "Privas" },
  "08": { code: "08", nom: "Ardennes", region: "Grand Est", prefecture: "Charleville-Mezieres" },
  "09": { code: "09", nom: "Ariege", region: "Occitanie", prefecture: "Foix" },
  "10": { code: "10", nom: "Aube", region: "Grand Est", prefecture: "Troyes" },
  "11": { code: "11", nom: "Aude", region: "Occitanie", prefecture: "Carcassonne" },
  "12": { code: "12", nom: "Aveyron", region: "Occitanie", prefecture: "Rodez" },
  "13": { code: "13", nom: "Bouches-du-Rhone", region: "Provence-Alpes-Cote d'Azur", prefecture: "Marseille" },
  "14": { code: "14", nom: "Calvados", region: "Normandie", prefecture: "Caen" },
  "15": { code: "15", nom: "Cantal", region: "Auvergne-Rhone-Alpes", prefecture: "Aurillac" },
  "16": { code: "16", nom: "Charente", region: "Nouvelle-Aquitaine", prefecture: "Angouleme" },
  "17": { code: "17", nom: "Charente-Maritime", region: "Nouvelle-Aquitaine", prefecture: "La Rochelle" },
  "18": { code: "18", nom: "Cher", region: "Centre-Val de Loire", prefecture: "Bourges" },
  "19": { code: "19", nom: "Correze", region: "Nouvelle-Aquitaine", prefecture: "Tulle" },
  "2A": { code: "2A", nom: "Corse-du-Sud", region: "Corse", prefecture: "Ajaccio" },
  "2B": { code: "2B", nom: "Haute-Corse", region: "Corse", prefecture: "Bastia" },
  "21": { code: "21", nom: "Cote-d'Or", region: "Bourgogne-Franche-Comte", prefecture: "Dijon" },
  "22": { code: "22", nom: "Cotes-d'Armor", region: "Bretagne", prefecture: "Saint-Brieuc" },
  "23": { code: "23", nom: "Creuse", region: "Nouvelle-Aquitaine", prefecture: "Gueret" },
  "24": { code: "24", nom: "Dordogne", region: "Nouvelle-Aquitaine", prefecture: "Perigueux" },
  "25": { code: "25", nom: "Doubs", region: "Bourgogne-Franche-Comte", prefecture: "Besancon" },
  "26": { code: "26", nom: "Drome", region: "Auvergne-Rhone-Alpes", prefecture: "Valence" },
  "27": { code: "27", nom: "Eure", region: "Normandie", prefecture: "Evreux" },
  "28": { code: "28", nom: "Eure-et-Loir", region: "Centre-Val de Loire", prefecture: "Chartres" },
  "29": { code: "29", nom: "Finistere", region: "Bretagne", prefecture: "Quimper" },
  "30": { code: "30", nom: "Gard", region: "Occitanie", prefecture: "Nimes" },
  "31": { code: "31", nom: "Haute-Garonne", region: "Occitanie", prefecture: "Toulouse" },
  "32": { code: "32", nom: "Gers", region: "Occitanie", prefecture: "Auch" },
  "33": { code: "33", nom: "Gironde", region: "Nouvelle-Aquitaine", prefecture: "Bordeaux" },
  "34": { code: "34", nom: "Herault", region: "Occitanie", prefecture: "Montpellier" },
  "35": { code: "35", nom: "Ille-et-Vilaine", region: "Bretagne", prefecture: "Rennes" },
  "36": { code: "36", nom: "Indre", region: "Centre-Val de Loire", prefecture: "Chateauroux" },
  "37": { code: "37", nom: "Indre-et-Loire", region: "Centre-Val de Loire", prefecture: "Tours" },
  "38": { code: "38", nom: "Isere", region: "Auvergne-Rhone-Alpes", prefecture: "Grenoble" },
  "39": { code: "39", nom: "Jura", region: "Bourgogne-Franche-Comte", prefecture: "Lons-le-Saunier" },
  "40": { code: "40", nom: "Landes", region: "Nouvelle-Aquitaine", prefecture: "Mont-de-Marsan" },
  "41": { code: "41", nom: "Loir-et-Cher", region: "Centre-Val de Loire", prefecture: "Blois" },
  "42": { code: "42", nom: "Loire", region: "Auvergne-Rhone-Alpes", prefecture: "Saint-Etienne" },
  "43": { code: "43", nom: "Haute-Loire", region: "Auvergne-Rhone-Alpes", prefecture: "Le Puy-en-Velay" },
  "44": { code: "44", nom: "Loire-Atlantique", region: "Pays de la Loire", prefecture: "Nantes" },
  "45": { code: "45", nom: "Loiret", region: "Centre-Val de Loire", prefecture: "Orleans" },
  "46": { code: "46", nom: "Lot", region: "Occitanie", prefecture: "Cahors" },
  "47": { code: "47", nom: "Lot-et-Garonne", region: "Nouvelle-Aquitaine", prefecture: "Agen" },
  "48": { code: "48", nom: "Lozere", region: "Occitanie", prefecture: "Mende" },
  "49": { code: "49", nom: "Maine-et-Loire", region: "Pays de la Loire", prefecture: "Angers" },
  "50": { code: "50", nom: "Manche", region: "Normandie", prefecture: "Saint-Lo" },
  "51": { code: "51", nom: "Marne", region: "Grand Est", prefecture: "Chalons-en-Champagne" },
  "52": { code: "52", nom: "Haute-Marne", region: "Grand Est", prefecture: "Chaumont" },
  "53": { code: "53", nom: "Mayenne", region: "Pays de la Loire", prefecture: "Laval" },
  "54": { code: "54", nom: "Meurthe-et-Moselle", region: "Grand Est", prefecture: "Nancy" },
  "55": { code: "55", nom: "Meuse", region: "Grand Est", prefecture: "Bar-le-Duc" },
  "56": { code: "56", nom: "Morbihan", region: "Bretagne", prefecture: "Vannes" },
  "57": { code: "57", nom: "Moselle", region: "Grand Est", prefecture: "Metz" },
  "58": { code: "58", nom: "Nievre", region: "Bourgogne-Franche-Comte", prefecture: "Nevers" },
  "59": { code: "59", nom: "Nord", region: "Hauts-de-France", prefecture: "Lille" },
  "60": { code: "60", nom: "Oise", region: "Hauts-de-France", prefecture: "Beauvais" },
  "61": { code: "61", nom: "Orne", region: "Normandie", prefecture: "Alencon" },
  "62": { code: "62", nom: "Pas-de-Calais", region: "Hauts-de-France", prefecture: "Arras" },
  "63": { code: "63", nom: "Puy-de-Dome", region: "Auvergne-Rhone-Alpes", prefecture: "Clermont-Ferrand" },
  "64": { code: "64", nom: "Pyrenees-Atlantiques", region: "Nouvelle-Aquitaine", prefecture: "Pau" },
  "65": { code: "65", nom: "Hautes-Pyrenees", region: "Occitanie", prefecture: "Tarbes" },
  "66": { code: "66", nom: "Pyrenees-Orientales", region: "Occitanie", prefecture: "Perpignan" },
  "67": { code: "67", nom: "Bas-Rhin", region: "Grand Est", prefecture: "Strasbourg" },
  "68": { code: "68", nom: "Haut-Rhin", region: "Grand Est", prefecture: "Colmar" },
  "69": { code: "69", nom: "Rhone", region: "Auvergne-Rhone-Alpes", prefecture: "Lyon" },
  "70": { code: "70", nom: "Haute-Saone", region: "Bourgogne-Franche-Comte", prefecture: "Vesoul" },
  "71": { code: "71", nom: "Saone-et-Loire", region: "Bourgogne-Franche-Comte", prefecture: "Macon" },
  "72": { code: "72", nom: "Sarthe", region: "Pays de la Loire", prefecture: "Le Mans" },
  "73": { code: "73", nom: "Savoie", region: "Auvergne-Rhone-Alpes", prefecture: "Chambery" },
  "74": { code: "74", nom: "Haute-Savoie", region: "Auvergne-Rhone-Alpes", prefecture: "Annecy" },
  "75": { code: "75", nom: "Paris", region: "Ile-de-France", prefecture: "Paris" },
  "76": { code: "76", nom: "Seine-Maritime", region: "Normandie", prefecture: "Rouen" },
  "77": { code: "77", nom: "Seine-et-Marne", region: "Ile-de-France", prefecture: "Melun" },
  "78": { code: "78", nom: "Yvelines", region: "Ile-de-France", prefecture: "Versailles" },
  "79": { code: "79", nom: "Deux-Sevres", region: "Nouvelle-Aquitaine", prefecture: "Niort" },
  "80": { code: "80", nom: "Somme", region: "Hauts-de-France", prefecture: "Amiens" },
  "81": { code: "81", nom: "Tarn", region: "Occitanie", prefecture: "Albi" },
  "82": { code: "82", nom: "Tarn-et-Garonne", region: "Occitanie", prefecture: "Montauban" },
  "83": { code: "83", nom: "Var", region: "Provence-Alpes-Cote d'Azur", prefecture: "Toulon" },
  "84": { code: "84", nom: "Vaucluse", region: "Provence-Alpes-Cote d'Azur", prefecture: "Avignon" },
  "85": { code: "85", nom: "Vendee", region: "Pays de la Loire", prefecture: "La Roche-sur-Yon" },
  "86": { code: "86", nom: "Vienne", region: "Nouvelle-Aquitaine", prefecture: "Poitiers" },
  "87": { code: "87", nom: "Haute-Vienne", region: "Nouvelle-Aquitaine", prefecture: "Limoges" },
  "88": { code: "88", nom: "Vosges", region: "Grand Est", prefecture: "Epinal" },
  "89": { code: "89", nom: "Yonne", region: "Bourgogne-Franche-Comte", prefecture: "Auxerre" },
  "90": { code: "90", nom: "Territoire de Belfort", region: "Bourgogne-Franche-Comte", prefecture: "Belfort" },
  "91": { code: "91", nom: "Essonne", region: "Ile-de-France", prefecture: "Evry-Courcouronnes" },
  "92": { code: "92", nom: "Hauts-de-Seine", region: "Ile-de-France", prefecture: "Nanterre" },
  "93": { code: "93", nom: "Seine-Saint-Denis", region: "Ile-de-France", prefecture: "Bobigny" },
  "94": { code: "94", nom: "Val-de-Marne", region: "Ile-de-France", prefecture: "Creteil" },
  "95": { code: "95", nom: "Val-d'Oise", region: "Ile-de-France", prefecture: "Cergy" },
  "971": { code: "971", nom: "Guadeloupe", region: "Guadeloupe", prefecture: "Basse-Terre" },
  "972": { code: "972", nom: "Martinique", region: "Martinique", prefecture: "Fort-de-France" },
  "973": { code: "973", nom: "Guyane", region: "Guyane", prefecture: "Cayenne" },
  "974": { code: "974", nom: "La Reunion", region: "La Reunion", prefecture: "Saint-Denis" },
  "976": { code: "976", nom: "Mayotte", region: "Mayotte", prefecture: "Mamoudzou" },
};

export function getDepartementByCode(code: string): DepartementInfo | null {
  if (!code) return null;
  // Normalisation : "1" -> "01"
  const normalized = code.length === 1 ? `0${code}` : code.toUpperCase();
  return DEPARTEMENTS_FR[normalized] || null;
}

export function getAllDepartementCodes(): string[] {
  return Object.keys(DEPARTEMENTS_FR);
}

/**
 * Article grammatical de chaque departement, encode explicitement (pas
 * d'heuristique fragile). Determine la forme correcte de "dans le/la/l'/les X"
 * et "du/de la/de l'/des X" :
 *  - "le"   : masculin, consonne         -> dans le Calvados / du Calvados
 *  - "la"   : feminin, consonne          -> dans la Manche / de la Manche
 *  - "l"    : singulier a initiale vocalique (m. ou f.) -> dans l'Ain / de l'Ain
 *  - "les"  : pluriel                    -> dans les Landes / des Landes
 *  - "sans" : nom propre sans article (Paris, Mayotte, La Reunion) -> a Paris / de Paris
 * Le "h" de "Haut(e)(s)" etant aspire, ces departements prennent le/la/les
 * (jamais l'). Le "h" de l'Herault est muet -> "l".
 */
export type ArticleDepartement = "le" | "la" | "l" | "les" | "sans";

const ARTICLE_PAR_DEPARTEMENT: Record<string, ArticleDepartement> = {
  "01": "l", "02": "l", "03": "l", "04": "les", "05": "les", "06": "les",
  "07": "l", "08": "les", "09": "l", "10": "l", "11": "l", "12": "l",
  "13": "les", "14": "le", "15": "le", "16": "la", "17": "la", "18": "le",
  "19": "la", "2A": "la", "2B": "la", "21": "la", "22": "les", "23": "la",
  "24": "la", "25": "le", "26": "la", "27": "l", "28": "l", "29": "le",
  "30": "le", "31": "la", "32": "le", "33": "la", "34": "l", "35": "l",
  "36": "l", "37": "l", "38": "l", "39": "le", "40": "les", "41": "le",
  "42": "la", "43": "la", "44": "la", "45": "le", "46": "le", "47": "le",
  "48": "la", "49": "le", "50": "la", "51": "la", "52": "la", "53": "la",
  "54": "la", "55": "la", "56": "le", "57": "la", "58": "la", "59": "le",
  "60": "l", "61": "l", "62": "le", "63": "le", "64": "les", "65": "les",
  "66": "les", "67": "le", "68": "le", "69": "le", "70": "la", "71": "la",
  "72": "la", "73": "la", "74": "la", "75": "sans", "76": "la", "77": "la",
  "78": "les", "79": "les", "80": "la", "81": "le", "82": "le", "83": "le",
  "84": "le", "85": "la", "86": "la", "87": "la", "88": "les", "89": "l",
  "90": "le", "91": "l", "92": "les", "93": "la", "94": "le", "95": "le",
  "971": "la", "972": "la", "973": "la", "974": "sans", "976": "sans",
};

/**
 * Renvoie le complement de lieu grammaticalement correct pour un departement :
 * "dans le Calvados", "dans la Manche", "dans l'Ain", "dans les Landes",
 * "a Paris", "a Mayotte", "a La Reunion". Fonction pure. Renvoie "" si le code
 * est inconnu.
 */
export function dansLeDepartement(code: string): string {
  const dep = getDepartementByCode(code);
  if (!dep) return "";
  const art = ARTICLE_PAR_DEPARTEMENT[dep.code] ?? "le";
  switch (art) {
    case "la":
      return `dans la ${dep.nom}`;
    case "l":
      return `dans l'${dep.nom}`;
    case "les":
      return `dans les ${dep.nom}`;
    case "sans":
      return `à ${dep.nom}`;
    case "le":
    default:
      return `dans le ${dep.nom}`;
  }
}

/**
 * Renvoie le complement du nom grammaticalement correct pour un departement :
 * "du Calvados", "de la Manche", "de l'Ain", "des Landes", "de Paris",
 * "de Mayotte", "de La Reunion". Fonction pure. Renvoie "" si le code est inconnu.
 */
export function duDepartement(code: string): string {
  const dep = getDepartementByCode(code);
  if (!dep) return "";
  const art = ARTICLE_PAR_DEPARTEMENT[dep.code] ?? "le";
  switch (art) {
    case "la":
      return `de la ${dep.nom}`;
    case "l":
      return `de l'${dep.nom}`;
    case "les":
      return `des ${dep.nom}`;
    case "sans":
      return `de ${dep.nom}`;
    case "le":
    default:
      return `du ${dep.nom}`;
  }
}
