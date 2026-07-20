/**
 * Pool regional de mutualisation inter-departementale des courses.
 *
 * Par defaut, une demande de transport n'est proposee qu'aux pros inscrits du
 * departement cible exact (cf. dispatch_demande_transport). C'est trop
 * restrictif en zone dense : une course a Nanterre (92) n'etait proposee a
 * aucun des pros inscrits d'Ile-de-France (75, 77, 78, 93...).
 *
 * Un « pool regional » regroupe plusieurs departements qui se partagent les
 * courses : si la demande cible l'un d'eux, elle est proposee a TOUS les pros
 * inscrits du pool (un chauffeur du 93 peut accepter une course du 92).
 *
 * Generique : ajouter une region = ajouter un tableau dans REGIONS_MUTUALISEES.
 */

/** Ensembles de departements se partageant les courses. */
export const REGIONS_MUTUALISEES: string[][] = [
  // Ile-de-France : Paris + petite et grande couronne.
  ["75", "77", "78", "91", "92", "93", "94", "95"],
];

/**
 * Renvoie l'ensemble des departements auxquels une course ciblant `departement`
 * doit etre proposee.
 * - departement membre d'une region mutualisee -> toute la region.
 * - sinon -> le departement seul (comportement inchange).
 * - valeur vide -> tableau vide.
 */
export function departementsPoolRegional(
  departement: string | null | undefined
): string[] {
  const dep = (departement || "").trim();
  if (!dep) return [];
  const region = REGIONS_MUTUALISEES.find((r) => r.includes(dep));
  return region ? [...region] : [dep];
}
