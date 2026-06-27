// Combinaisons type x ville pour Chantier E - generation statique des pages SEO.
// Selectionne par densite d'etablissements FINESS (top N par type).

export type ChantierECombo = { villeSlug: string; villeNom: string; nbEtabs: number };

export const CHANTIER_E_COMBOS: Record<string, ChantierECombo[]> = {
  "ehpad": [
    { villeSlug: "paris", villeNom: "Paris", nbEtabs: 74 },
    { villeSlug: "marseille", villeNom: "Marseille", nbEtabs: 64 },
    { villeSlug: "lyon", villeNom: "Lyon", nbEtabs: 44 },
    { villeSlug: "toulouse", villeNom: "Toulouse", nbEtabs: 36 },
    { villeSlug: "nice", villeNom: "Nice", nbEtabs: 34 },
    { villeSlug: "nantes", villeNom: "Nantes", nbEtabs: 32 },
    { villeSlug: "strasbourg", villeNom: "Strasbourg", nbEtabs: 25 },
    { villeSlug: "st-etienne", villeNom: "Saint-Etienne", nbEtabs: 23 },
    { villeSlug: "bordeaux", villeNom: "Bordeaux", nbEtabs: 22 },
    { villeSlug: "lille", villeNom: "Lille", nbEtabs: 21 },
    { villeSlug: "montpellier", villeNom: "Montpellier", nbEtabs: 20 },
    { villeSlug: "rennes", villeNom: "Rennes", nbEtabs: 20 },
    { villeSlug: "angers", villeNom: "Angers", nbEtabs: 20 },
    { villeSlug: "toulon", villeNom: "Toulon", nbEtabs: 17 },
    { villeSlug: "metz", villeNom: "Metz", nbEtabs: 16 },
    { villeSlug: "brest", villeNom: "Brest", nbEtabs: 15 },
    { villeSlug: "dijon", villeNom: "Dijon", nbEtabs: 14 },
    { villeSlug: "clermont-ferrand", villeNom: "Clermont-Ferrand", nbEtabs: 14 },
    { villeSlug: "tours", villeNom: "Tours", nbEtabs: 14 },
    { villeSlug: "le-havre", villeNom: "Le-Havre", nbEtabs: 13 },
    { villeSlug: "nimes", villeNom: "Nimes", nbEtabs: 13 },
    { villeSlug: "le-mans", villeNom: "Le-Mans", nbEtabs: 13 },
    { villeSlug: "reims", villeNom: "Reims", nbEtabs: 12 },
    { villeSlug: "vannes", villeNom: "Vannes", nbEtabs: 12 },
    { villeSlug: "annecy", villeNom: "Annecy", nbEtabs: 11 },
    { villeSlug: "st-malo", villeNom: "Saint-Malo", nbEtabs: 11 },
    { villeSlug: "mulhouse", villeNom: "Mulhouse", nbEtabs: 11 },
    { villeSlug: "rouen", villeNom: "Rouen", nbEtabs: 10 },
    { villeSlug: "chambery", villeNom: "Chambery", nbEtabs: 10 },
    { villeSlug: "quimper", villeNom: "Quimper", nbEtabs: 10 },
  ],
  "hopital": [
    { villeSlug: "paris", villeNom: "Paris", nbEtabs: 55 },
    { villeSlug: "marseille", villeNom: "Marseille", nbEtabs: 30 },
    { villeSlug: "rennes", villeNom: "Rennes", nbEtabs: 28 },
    { villeSlug: "toulouse", villeNom: "Toulouse", nbEtabs: 22 },
    { villeSlug: "quimper", villeNom: "Quimper", nbEtabs: 20 },
    { villeSlug: "nantes", villeNom: "Nantes", nbEtabs: 20 },
    { villeSlug: "lille", villeNom: "Lille", nbEtabs: 19 },
    { villeSlug: "montpellier", villeNom: "Montpellier", nbEtabs: 17 },
    { villeSlug: "besancon", villeNom: "Besancon", nbEtabs: 14 },
    { villeSlug: "fort-de-france", villeNom: "Fort-de-France", nbEtabs: 14 },
    { villeSlug: "brest", villeNom: "Brest", nbEtabs: 14 },
    { villeSlug: "lyon", villeNom: "Lyon", nbEtabs: 14 },
    { villeSlug: "strasbourg", villeNom: "Strasbourg", nbEtabs: 13 },
    { villeSlug: "amiens", villeNom: "Amiens", nbEtabs: 13 },
    { villeSlug: "perpignan", villeNom: "Perpignan", nbEtabs: 13 },
    { villeSlug: "st-pierre", villeNom: "Saint-Pierre", nbEtabs: 12 },
    { villeSlug: "reims", villeNom: "Reims", nbEtabs: 12 },
    { villeSlug: "dijon", villeNom: "Dijon", nbEtabs: 12 },
    { villeSlug: "thonon-les-bains", villeNom: "Thonon-les-Bains", nbEtabs: 11 },
    { villeSlug: "les-abymes", villeNom: "Les-Abymes", nbEtabs: 11 },
    { villeSlug: "nice", villeNom: "Nice", nbEtabs: 11 },
    { villeSlug: "la-rochelle", villeNom: "La-Rochelle", nbEtabs: 11 },
    { villeSlug: "roubaix", villeNom: "Roubaix", nbEtabs: 11 },
    { villeSlug: "vannes", villeNom: "Vannes", nbEtabs: 11 },
    { villeSlug: "le-lamentin", villeNom: "Le-Lamentin", nbEtabs: 11 },
  ],
  "clinique": [
    { villeSlug: "paris", villeNom: "Paris", nbEtabs: 22 },
    { villeSlug: "marseille", villeNom: "Marseille", nbEtabs: 10 },
    { villeSlug: "lyon", villeNom: "Lyon", nbEtabs: 7 },
    { villeSlug: "bordeaux", villeNom: "Bordeaux", nbEtabs: 6 },
    { villeSlug: "toulouse", villeNom: "Toulouse", nbEtabs: 5 },
    { villeSlug: "nantes", villeNom: "Nantes", nbEtabs: 5 },
    { villeSlug: "montpellier", villeNom: "Montpellier", nbEtabs: 4 },
    { villeSlug: "toulon", villeNom: "Toulon", nbEtabs: 4 },
    { villeSlug: "cayenne", villeNom: "Cayenne", nbEtabs: 4 },
    { villeSlug: "neuilly-sur-seine", villeNom: "Neuilly-sur-Seine", nbEtabs: 4 },
    { villeSlug: "nice", villeNom: "Nice", nbEtabs: 4 },
    { villeSlug: "lille", villeNom: "Lille", nbEtabs: 3 },
    { villeSlug: "perpignan", villeNom: "Perpignan", nbEtabs: 3 },
    { villeSlug: "perigueux", villeNom: "Perigueux", nbEtabs: 3 },
    { villeSlug: "strasbourg", villeNom: "Strasbourg", nbEtabs: 3 },
    { villeSlug: "caen", villeNom: "Caen", nbEtabs: 3 },
    { villeSlug: "nimes", villeNom: "Nimes", nbEtabs: 3 },
    { villeSlug: "dijon", villeNom: "Dijon", nbEtabs: 3 },
    { villeSlug: "bayonne", villeNom: "Bayonne", nbEtabs: 3 },
    { villeSlug: "pau", villeNom: "Pau", nbEtabs: 3 },
  ],
  "centre-dialyse": [
    { villeSlug: "paris", villeNom: "Paris", nbEtabs: 12 },
    { villeSlug: "marseille", villeNom: "Marseille", nbEtabs: 9 },
    { villeSlug: "st-denis", villeNom: "Saint-Denis", nbEtabs: 6 },
    { villeSlug: "brest", villeNom: "Brest", nbEtabs: 5 },
    { villeSlug: "toulouse", villeNom: "Toulouse", nbEtabs: 5 },
    { villeSlug: "bordeaux", villeNom: "Bordeaux", nbEtabs: 4 },
    { villeSlug: "macon", villeNom: "Macon", nbEtabs: 3 },
    { villeSlug: "toulon", villeNom: "Toulon", nbEtabs: 3 },
    { villeSlug: "angers", villeNom: "Angers", nbEtabs: 3 },
    { villeSlug: "le-port", villeNom: "Le-Port", nbEtabs: 3 },
    { villeSlug: "cayenne", villeNom: "Cayenne", nbEtabs: 3 },
    { villeSlug: "st-priest-en-jarez", villeNom: "Saint-Priest-en-Jarez", nbEtabs: 3 },
    { villeSlug: "maubeuge", villeNom: "Maubeuge", nbEtabs: 3 },
    { villeSlug: "gradignan", villeNom: "Gradignan", nbEtabs: 3 },
    { villeSlug: "le-mans", villeNom: "Le-Mans", nbEtabs: 3 },
  ],
  "rehabilitation": [
    { villeSlug: "paris", villeNom: "Paris", nbEtabs: 20 },
    { villeSlug: "marseille", villeNom: "Marseille", nbEtabs: 16 },
    { villeSlug: "toulouse", villeNom: "Toulouse", nbEtabs: 7 },
    { villeSlug: "cambo-les-bains", villeNom: "Cambo-les-Bains", nbEtabs: 7 },
    { villeSlug: "st-denis", villeNom: "Saint-Denis", nbEtabs: 5 },
    { villeSlug: "le-port", villeNom: "Le-Port", nbEtabs: 5 },
    { villeSlug: "nice", villeNom: "Nice", nbEtabs: 5 },
    { villeSlug: "nantes", villeNom: "Nantes", nbEtabs: 5 },
    { villeSlug: "angers", villeNom: "Angers", nbEtabs: 4 },
    { villeSlug: "dijon", villeNom: "Dijon", nbEtabs: 4 },
    { villeSlug: "montpellier", villeNom: "Montpellier", nbEtabs: 4 },
    { villeSlug: "hyeres", villeNom: "Hyeres", nbEtabs: 4 },
    { villeSlug: "briancon", villeNom: "Briancon", nbEtabs: 4 },
    { villeSlug: "st-pierre", villeNom: "Saint-Pierre", nbEtabs: 3 },
    { villeSlug: "lille", villeNom: "Lille", nbEtabs: 3 },
  ],
};

export function getCombosForType(typeSlug: string): ChantierECombo[] {
  return CHANTIER_E_COMBOS[typeSlug] ?? [];
}

export function getAllCombosFlat(): { typeSlug: string; villeSlug: string }[] {
  const out: { typeSlug: string; villeSlug: string }[] = [];
  for (const [typeSlug, list] of Object.entries(CHANTIER_E_COMBOS)) {
    for (const c of list) out.push({ typeSlug, villeSlug: c.villeSlug });
  }
  return out;
}

export function getComboMeta(typeSlug: string, villeSlug: string): ChantierECombo | undefined {
  return CHANTIER_E_COMBOS[typeSlug]?.find((c) => c.villeSlug === villeSlug);
}
