// Disponibilite des pros : un pro peut se declarer indisponible (conges, semaine
// off) pour ne plus recevoir de nouvelles demandes de course sur une periode.
// Logique pure partagee entre l'UI (etat affiche) et, cote SQL, le trigger de
// dispatch (voir supabase/migrations/*_pros_disponibilite.sql).

export type DateEntree = Date | string | number | null | undefined;

function toDate(valeur: DateEntree): Date | null {
  if (valeur == null) return null;
  const d = valeur instanceof Date ? valeur : new Date(valeur);
  return Number.isNaN(d.getTime()) ? null : d;
}

/**
 * Indique si un pro est indisponible pour une course a une date donnee.
 *
 * La periode d'indisponibilite est [indispoDebut, indispoFin] (bornes incluses) :
 * - indispoDebut null => indisponible depuis toujours (pas de borne basse) ;
 * - indispoFin null   => indisponible sans fin prevue (pas de borne haute) ;
 * - les deux null      => aucune indisponibilite declaree => disponible.
 *
 * @param indispoDebut debut de l'indisponibilite (null = depuis toujours)
 * @param indispoFin   fin de l'indisponibilite (null = sans fin)
 * @param dateCourse   date de la course a evaluer (COALESCE(date_souhaitee, now()))
 */
export function estIndisponible(
  indispoDebut: DateEntree,
  indispoFin: DateEntree,
  dateCourse: DateEntree
): boolean {
  const debut = toDate(indispoDebut);
  const fin = toDate(indispoFin);
  const course = toDate(dateCourse);

  // Aucune borne => aucune indisponibilite declaree.
  if (!debut && !fin) return false;

  // Sans date de course exploitable, on ne peut pas conclure a une exclusion.
  if (!course) return false;

  const t = course.getTime();
  if (debut && t < debut.getTime()) return false;
  if (fin && t > fin.getTime()) return false;
  return true;
}

/**
 * Etat lisible de la disponibilite, pour l'affichage dans l'espace pro.
 * `maintenant` permet d'injecter une horloge en test (defaut : now()).
 */
export function estIndisponibleMaintenant(
  indispoDebut: DateEntree,
  indispoFin: DateEntree,
  maintenant: DateEntree = new Date()
): boolean {
  return estIndisponible(indispoDebut, indispoFin, maintenant);
}
