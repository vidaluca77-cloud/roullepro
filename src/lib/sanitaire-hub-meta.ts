/**
 * Title et meta description des hubs /[categorie]/[ville].
 *
 * Extrait du composant VilleCategorieHub pour etre testable : sur des pages
 * positionnees 11-25, le title et la description sont le seul levier on-page
 * qui joue sur le CTR, donc sur la remontee.
 */

/** Longueur cible du <title>, hors suffixe de marque ajoute par title.template. */
export const HUB_TITLE_MAX = 60;

export const HUB_DESCRIPTION_MAX = 160;

/**
 * Contracte la preposition avec l'article du nom de commune : "a Le Tampon"
 * et "a Les Abymes" sont des fautes visibles dans le SERP.
 */
export function aVille(ville: string): string {
  if (ville.startsWith("Le ")) return `au ${ville.slice(3)}`;
  if (ville.startsWith("Les ")) return `aux ${ville.slice(4)}`;
  return `à ${ville}`;
}

/**
 * Tronque sur une frontiere de mot. Un `.slice()` brut coupe au milieu d'un
 * mot et Google reecrit alors la description.
 */
export function tronquerSurMot(texte: string, max: number): string {
  if (texte.length <= max) return texte;
  const coupe = texte.slice(0, max - 1);
  const espace = coupe.lastIndexOf(" ");
  const base = espace > max * 0.6 ? coupe.slice(0, espace) : coupe;
  return `${base.replace(/[\s,;:.—-]+$/, "")}…`;
}

/**
 * Variantes de title de la plus riche a la plus courte : on retient la premiere
 * qui tient dans HUB_TITLE_MAX, ce qui evite la troncature Google sur les
 * communes a nom long (Le Chambon-Feugerolles, Bordères-sur-l'Échez...).
 */
function variantesTitre(categorieSlug: string, ville: string, nb: number): string[] {
  const a = aVille(ville);
  const pros = nb > 1 ? `${nb} pros` : "1 pro";
  const services = nb > 1 ? `${nb} services` : "1 service";
  if (categorieSlug === "taxi-conventionne") {
    return nb > 0
      ? [
          `Taxi conventionné ${ville} : ${pros} CPAM, tarif Sécu et tiers payant`,
          `Taxi conventionné ${ville} : ${pros} CPAM, tarif Sécu`,
          `Taxi conventionné ${a} — tarif Sécu, tiers payant`,
          `Taxi conventionné ${a} — tarif Sécu`,
          `Taxi conventionné ${a}`,
        ]
      : [
          `Taxi conventionné ${a} — tarif Sécu, tiers payant`,
          `Taxi conventionné ${a} — tarif Sécu`,
          `Taxi conventionné ${a}`,
        ];
  }
  if (categorieSlug === "ambulance") {
    return nb > 0
      ? [
          `Ambulance ${ville} : ${services} agréés ARS, prise en charge CPAM`,
          `Ambulance ${ville} : ${services} agréés, prise en charge CPAM`,
          `Ambulance ${ville} : ${services}, prise en charge CPAM`,
          `Ambulance ${a} — prise en charge CPAM`,
          `Ambulance ${a}`,
        ]
      : [
          `Ambulance ${a} — intervention rapide, prise en charge CPAM`,
          `Ambulance ${a} — prise en charge CPAM`,
          `Ambulance ${a}`,
        ];
  }
  if (categorieSlug === "vsl") {
    return nb > 0
      ? [
          `VSL ${ville} : ${nb} transports assis conventionnés CPAM`,
          `VSL ${ville} : ${pros} CPAM, transport assis remboursé`,
          `VSL ${a} — transport assis, prise en charge CPAM`,
          `VSL ${a}`,
        ]
      : [`VSL ${a} — transport assis, prise en charge CPAM`, `VSL ${a}`];
  }
  return [];
}

/** Repli generique annuaire pour les categories sans variante dediee. */
function variantesAnnuaire(labelPluriel: string, ville: string, nb: number): string[] {
  const a = aVille(ville);
  if (nb > 1) {
    return [
      `${labelPluriel} ${a} : ${nb} pros conventionnés CPAM`,
      `${labelPluriel} ${a} : ${nb} pros CPAM`,
      `${labelPluriel} ${a}`,
    ];
  }
  if (nb === 1) {
    return [`${labelPluriel} ${a} : 1 pro conventionné CPAM`, `${labelPluriel} ${a}`];
  }
  return [`${labelPluriel} ${a}`];
}

export function buildHubTitle(
  categorieSlug: string,
  ville: string,
  nb: number,
  labelPluriel: string
): string {
  const variantes = [
    ...variantesTitre(categorieSlug, ville, nb),
    ...variantesAnnuaire(labelPluriel, ville, nb),
  ];
  return variantes.find((t) => t.length <= HUB_TITLE_MAX) ?? variantes[variantes.length - 1];
}

/**
 * Argument de reassurance propre a chaque categorie : un taxi conventionne et
 * une ambulance n'ont ni le meme usage ni le meme taux de remboursement, et
 * une description identique sur les trois pages d'une meme ville les rend
 * substituables aux yeux de Google.
 */
const ARGUMENT_CATEGORIE: Record<string, string> = {
  "taxi-conventionne":
    "Transport assis remboursé jusqu'à 100 % en ALD, tiers payant, sans avance de frais.",
  ambulance:
    "Transport allongé sur prescription, remboursé jusqu'à 100 % en ALD, tiers payant.",
  vsl: "Transport assis en véhicule agréé ARS, remboursé jusqu'à 100 % en ALD, tiers payant.",
};

const ARGUMENT_DEFAUT = "Tarif Sécurité sociale, tiers payant, réservation gratuite en ligne.";

/** Le libelle affiche doit s'accorder : "1 taxi conventionné", pas "1 taxis conventionnés". */
const NOM_CATEGORIE: Record<string, { un: string; plusieurs: string }> = {
  "taxi-conventionne": { un: "taxi conventionné", plusieurs: "taxis conventionnés" },
  ambulance: { un: "ambulance", plusieurs: "ambulances" },
  vsl: { un: "VSL", plusieurs: "VSL" },
};

export function buildHubDescription(
  categorieSlug: string,
  ville: string,
  nb: number,
  conventionnes: number,
  labelPluriel: string
): string {
  const a = aVille(ville);
  const nom = NOM_CATEGORIE[categorieSlug];
  const libelle = nb === 1 ? nom?.un ?? labelPluriel.toLowerCase() : nom?.plusieurs ?? labelPluriel.toLowerCase();
  const suffixeConventionnes =
    conventionnes > 0
      ? `, dont ${conventionnes} conventionné${conventionnes > 1 ? "s" : ""} CPAM`
      : "";
  const tete =
    nb > 0
      ? `${nb} ${libelle} ${a}${suffixeConventionnes}.`
      : `${labelPluriel} ${a} : annuaire gratuit et vérifié.`;
  const argument = ARGUMENT_CATEGORIE[categorieSlug] ?? ARGUMENT_DEFAUT;
  return tronquerSurMot(`${tete} ${argument}`, HUB_DESCRIPTION_MAX);
}
