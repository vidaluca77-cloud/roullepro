/**
 * Estimation de valeur vehicule - proche de la cote Argus.
 *
 * Approche :
 * - Prix de base par categorie de vehicule (utilitaire leger, VP compact, berline, SUV, premium)
 * - Detection par marque + modele (fallback par marque seule, sinon categorie par defaut)
 * - Courbe de depreciation Argus-like : forte en debut de vie, plus lente ensuite
 * - Ajustement kilometrique : bareme par categorie (un utilitaire tient plus de km qu'une citadine)
 * - Ajustement etat general
 *
 * Cette estimation reste INDICATIVE. Le prix de vente final est toujours negocie
 * entre le vendeur et l'acquereur - le PDF contrat laisse ce champ vide.
 *
 * Sources indicatives (cotes moyennes 2026) :
 * - L'Argus (argus.fr) cote pro
 * - La Centrale cote vendeur particulier
 * - AutoScout24 data France
 */

export type EtatGeneral = "bon" | "moyen" | "a_revoir";

type Categorie =
  | "utilitaire_leger" // Kangoo, Partner, Berlingo, Caddy
  | "utilitaire_compact" // Expert, Traffic, Vivaro, Transporter
  | "utilitaire_grand" // Master, Boxer, Ducato, Sprinter, Daily, Transit
  | "citadine" // Clio, 208, Fiesta, Polo, Corsa
  | "compacte" // Golf, Mégane, 308, Focus, Astra
  | "berline" // C-Class, 3-Series, A4, Insignia
  | "suv_compact" // 2008, Captur, Juke, T-Roc, Tucson
  | "suv" // 3008, Kadjar, Qashqai, Tiguan
  | "suv_premium" // X3, Q5, GLC, Macan
  | "premium"; // A6, 5-Series, E-Class

interface CategorieSpec {
  prix_neuf_cents: number; // prix neuf indicatif en centimes (evite flottants)
  km_annuel_ref: number; // km annuels de reference pour la categorie
  km_penalite_par_10k: number; // penalite en euros pour 10 000 km au-dessus de la ref
}

// Prix neuf indicatifs (marche francais 2026, en euros)
const CATEGORIES: Record<Categorie, CategorieSpec> = {
  utilitaire_leger: { prix_neuf_cents: 2200000, km_annuel_ref: 20000, km_penalite_par_10k: 350 },
  utilitaire_compact: { prix_neuf_cents: 3000000, km_annuel_ref: 22000, km_penalite_par_10k: 450 },
  utilitaire_grand: { prix_neuf_cents: 4200000, km_annuel_ref: 25000, km_penalite_par_10k: 600 },
  citadine: { prix_neuf_cents: 2000000, km_annuel_ref: 14000, km_penalite_par_10k: 400 },
  compacte: { prix_neuf_cents: 2800000, km_annuel_ref: 15000, km_penalite_par_10k: 500 },
  berline: { prix_neuf_cents: 4500000, km_annuel_ref: 18000, km_penalite_par_10k: 800 },
  suv_compact: { prix_neuf_cents: 3200000, km_annuel_ref: 15000, km_penalite_par_10k: 550 },
  suv: { prix_neuf_cents: 4000000, km_annuel_ref: 16000, km_penalite_par_10k: 700 },
  suv_premium: { prix_neuf_cents: 6500000, km_annuel_ref: 16000, km_penalite_par_10k: 1000 },
  premium: { prix_neuf_cents: 7500000, km_annuel_ref: 18000, km_penalite_par_10k: 1200 },
};

// Table de mapping modele precis -> categorie (priorite sur la marque seule)
const MODELE_CATEGORIE: Array<{ match: RegExp; cat: Categorie; prix?: number }> = [
  // Utilitaires legers
  { match: /kangoo|partner|berlingo|caddy|doblo|nemo|bipper|fiorino/i, cat: "utilitaire_leger" },
  // Utilitaires compacts
  { match: /expert|traffic|trafic|vivaro|scudo|jumpy|proace|transporter|t6|t5/i, cat: "utilitaire_compact" },
  // Utilitaires grands
  { match: /master|boxer|ducato|jumper|movano|sprinter|crafter|daily|transit|relay/i, cat: "utilitaire_grand" },
  // Citadines
  { match: /clio|208|fiesta|polo|corsa|twingo|yaris|i10|i20|ka\b|panda|500\b|up\b|mii|aygo|c1\b|108/i, cat: "citadine" },
  // Compactes
  { match: /golf|megane|308|focus|astra|308|civic|auris|corolla|leon|octavia|a3\b|serie\s*1|classe\s*a\b/i, cat: "compacte" },
  // SUV compacts
  { match: /2008|captur|juke|t-roc|tucson|kona|arkana|puma|mokka|crossland|3008|5008/i, cat: "suv_compact" },
  // SUV
  { match: /kadjar|qashqai|tiguan|sportage|santa\s*fe|tucson|ateca|kuga|cx-5|rav4|x-trail|xtrail/i, cat: "suv" },
  // SUV premium
  { match: /x3|x4|q5|glc|macan|f-pace|xc60|nx\b/i, cat: "suv_premium" },
  // Berlines
  { match: /c-class|classe\s*c\b|3-?series|serie\s*3|a4\b|insignia|passat|laguna|talisman|mondeo|accord/i, cat: "berline" },
  // Premium (grandes berlines)
  { match: /a6\b|5-?series|serie\s*5|e-class|classe\s*e\b|xf\b|s60|s90|x5\b|q7\b|gle|x6\b/i, cat: "premium" },
];

// Table coefficient de marque (facteur multiplicatif final)
const MARQUE_COEF: Record<string, number> = {
  mercedes: 1.15,
  "mercedes-benz": 1.15,
  bmw: 1.12,
  audi: 1.12,
  porsche: 1.25,
  volkswagen: 1.02,
  vw: 1.02,
  volvo: 1.05,
  lexus: 1.08,
  land: 1.1,
  "land rover": 1.1,
  range: 1.1,
  "range rover": 1.1,
  peugeot: 0.95,
  renault: 0.92,
  citroen: 0.9,
  ford: 0.92,
  opel: 0.88,
  fiat: 0.85,
  dacia: 0.85,
  seat: 0.95,
  skoda: 0.98,
  toyota: 1.05,
  honda: 1.0,
  nissan: 0.95,
  hyundai: 0.95,
  kia: 0.95,
  mazda: 1.0,
  iveco: 1.0,
};

function detectCategorie(marque?: string | null, modele?: string | null): Categorie {
  const label = `${marque ?? ""} ${modele ?? ""}`.trim();
  for (const entry of MODELE_CATEGORIE) {
    if (entry.match.test(label)) return entry.cat;
  }
  // Fallback : marque seule pour utilitaires
  if (marque) {
    const m = marque.toLowerCase();
    if (m.includes("iveco")) return "utilitaire_grand";
  }
  // Defaut : compacte
  return "compacte";
}

/**
 * Courbe de depreciation Argus-like cumulee.
 * Retourne le % de valeur residuelle vs prix neuf apres N annees.
 * Basee sur donnees marche France : -22% premiere annee puis plus progressif.
 */
function valeurResiduellePct(age: number): number {
  if (age < 0) return 1;
  const points: Array<[number, number]> = [
    [0, 1.0],
    [1, 0.78],
    [2, 0.66],
    [3, 0.56],
    [4, 0.48],
    [5, 0.41],
    [6, 0.35],
    [7, 0.3],
    [8, 0.26],
    [10, 0.2],
    [12, 0.15],
    [15, 0.1],
    [20, 0.06],
  ];
  // Interpolation lineaire entre points
  for (let i = 0; i < points.length - 1; i++) {
    const [a1, v1] = points[i];
    const [a2, v2] = points[i + 1];
    if (age >= a1 && age <= a2) {
      const ratio = (age - a1) / (a2 - a1);
      return v1 + (v2 - v1) * ratio;
    }
  }
  return points[points.length - 1][1];
}

export interface EstimationInput {
  annee: number;
  kilometrage: number;
  etat_general: EtatGeneral;
  marque?: string | null;
  modele?: string | null;
}

export interface EstimationResult {
  estimation_min: number;
  estimation_max: number;
  estimation_centrale: number;
  categorie: string;
  confiance: "haute" | "moyenne" | "basse";
}

export function estimerVehicule(input: EstimationInput): EstimationResult {
  const { annee, kilometrage, etat_general, marque, modele } = input;
  const currentYear = new Date().getFullYear();
  const age = Math.max(0, currentYear - annee);

  const cat = detectCategorie(marque, modele);
  const spec = CATEGORIES[cat];

  // 1. Valeur neuve - depreciation Argus
  const prixNeuf = spec.prix_neuf_cents / 100;
  const residuel = valeurResiduellePct(age);
  let prix = prixNeuf * residuel;

  // 2. Ajustement kilometrique (si au-dessus ou en dessous de la ref categorie)
  const kmRef = spec.km_annuel_ref * age;
  const ecartKm = kilometrage - kmRef;
  const penalite = (ecartKm / 10000) * spec.km_penalite_par_10k;
  prix -= penalite;

  // 3. Ajustement marque (prestige / decote)
  if (marque) {
    const m = marque.toLowerCase().trim();
    const coef = MARQUE_COEF[m];
    if (coef !== undefined) {
      prix *= coef;
    }
  }

  // 4. Ajustement etat
  if (etat_general === "bon") prix *= 1.08;
  else if (etat_general === "a_revoir") prix *= 0.78;
  // moyen = pas de modification

  // 5. Borner (utilitaire grand en bon etat peut aller haut, citadine basse)
  const plancher = 500;
  const plafond = 120000;
  prix = Math.max(plancher, Math.min(plafond, prix));

  // 6. Fourchette : +/- 10% autour de la valeur centrale
  const centrale = Math.round(prix);
  const estimation_min = Math.round(prix * 0.9);
  const estimation_max = Math.round(prix * 1.1);

  // 7. Niveau de confiance : si on a marque ET modele detectes, c'est mieux
  const hasModeleDetecte = MODELE_CATEGORIE.some((e) =>
    e.match.test(`${marque ?? ""} ${modele ?? ""}`.trim())
  );
  const hasMarqueConnue = marque ? MARQUE_COEF[marque.toLowerCase().trim()] !== undefined : false;
  let confiance: "haute" | "moyenne" | "basse" = "basse";
  if (hasModeleDetecte && hasMarqueConnue) confiance = "haute";
  else if (hasModeleDetecte || hasMarqueConnue) confiance = "moyenne";

  return {
    estimation_min,
    estimation_max,
    estimation_centrale: centrale,
    categorie: cat,
    confiance,
  };
}
