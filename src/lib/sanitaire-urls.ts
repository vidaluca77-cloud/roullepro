/**
 * URLs canoniques des hubs ville x categorie du transport sanitaire.
 *
 * Deux formats coexistent volontairement :
 *   - URL courte  /{categorie}/{ville}                  -> ambulance, taxi-conventionne
 *   - URL longue  /transport-medical/{ville}/{categorie} -> vsl
 *
 * Les categories a fort volume commercial ("taxi conventionne Paris",
 * "ambulance Montpellier") sont servies sur l'URL courte, qui matche
 * exactement l'intention de recherche. Les anciennes URLs longues
 * correspondantes sont redirigees en 301 (voir next.config.js) : une seule
 * URL indexable par intention, donc aucune cannibalisation.
 *
 * Les fiches pro restent TOUJOURS sous /transport-medical/... : elles ne sont
 * pas concernees par la redirection (le motif 301 ne matche que 2 segments).
 */

/** Categories servies sur une URL courte /{categorie}/{ville}. */
export const CATEGORIES_URL_COURTE = ["ambulance", "taxi-conventionne"] as const;

export function utiliseUrlCourte(categorieSlug: string): boolean {
  return (CATEGORIES_URL_COURTE as readonly string[]).includes(categorieSlug);
}

/** URL canonique (chemin absolu) du hub ville x categorie. */
export function villeCategorieUrl(categorieSlug: string, villeSlug: string): string {
  return utiliseUrlCourte(categorieSlug)
    ? `/${categorieSlug}/${villeSlug}`
    : `/transport-medical/${villeSlug}/${categorieSlug}`;
}

/** URL canonique d'une fiche pro (inchangee, hors perimetre des URLs courtes). */
export function ficheUrl(villeSlug: string, categorieSlug: string, proSlug: string): string {
  return `/transport-medical/${villeSlug}/${categorieSlug}/${proSlug}`;
}
