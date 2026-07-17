/**
 * Logique pure de saisie date + heure d'une course, partagee par le composant
 * `DateHeureCourse` et ses tests unitaires.
 *
 * Le composant expose au parent la chaine `datetime-local` locale
 * ("YYYY-MM-DDTHH:mm"). En interne, la saisie est scindee en deux champs (date
 * et heure) pour forcer un choix conscient de l'heure (cf. audit : la majorite
 * des patients laissaient l'heure vide ou fausse avec l'input unique).
 *
 * Toutes les comparaisons se font sur les chaines locales formatees a largeur
 * fixe : l'ordre lexicographique coincide avec l'ordre chronologique, ce qui
 * evite tout decalage de fuseau horaire.
 */

/** Marge minimale avant la premiere course reservable (en minutes). */
export const MARGE_MIN_MINUTES = 30;
/** Horizon maximal de reservation (en mois). */
export const HORIZON_MAX_MOIS = 6;

const p2 = (n: number) => String(n).padStart(2, "0");

/** Formate une Date en chaine locale "YYYY-MM-DD". */
export function formatLocalDate(d: Date): string {
  return `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}`;
}

/** Formate une Date en chaine locale "YYYY-MM-DDTHH:mm". */
export function formatLocalDateTime(d: Date): string {
  return `${formatLocalDate(d)}T${p2(d.getHours())}:${p2(d.getMinutes())}`;
}

/**
 * Convertit la chaine `datetime-local` locale saisie en ISO (avec offset du
 * fuseau du navigateur, typiquement Europe/Paris pour la cible). Renvoie null si
 * vide ou invalide.
 */
export function toISODateSouhaitee(local: string | null | undefined): string | null {
  if (!local) return null;
  const d = new Date(local);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

/** Scinde une chaine "YYYY-MM-DDTHH:mm" en { date, time }. */
export function splitDateHeure(value: string | null | undefined): {
  date: string;
  time: string;
} {
  const [date = "", time = ""] = (value || "").split("T");
  return { date, time };
}

/**
 * Recompose la chaine "YYYY-MM-DDTHH:mm" a partir des deux champs. Renvoie ""
 * tant que les DEUX champs ne sont pas renseignes (garantit que le parent ne
 * recoit jamais une valeur partielle).
 */
export function combineDateHeure(date: string, time: string): string {
  return date && time ? `${date}T${time}` : "";
}

/** Bornes du selecteur (dates) + bornes de validation (datetime). */
export function bornesDateHeure(now: Date = new Date()) {
  const minDateTime = new Date(now.getTime() + MARGE_MIN_MINUTES * 60_000);
  const maxDate = new Date(now);
  maxDate.setMonth(maxDate.getMonth() + HORIZON_MAX_MOIS);
  return {
    minDate: formatLocalDate(now),
    maxDate: formatLocalDate(maxDate),
    minDateTime: formatLocalDateTime(minDateTime),
    maxDateTime: formatLocalDateTime(maxDate),
  };
}

export type ChampDateHeure = "date" | "heure" | null;

/**
 * Valide la combinaison date + heure. Renvoie un message francais et le champ
 * concerne (pour l'`aria-describedby`), ou { erreur: null } si valide / vide.
 */
export function validerDateHeure(
  date: string,
  time: string,
  now: Date = new Date()
): { erreur: string | null; champ: ChampDateHeure } {
  if (!date && !time) return { erreur: null, champ: null };
  if (date && !time)
    return { erreur: "Merci d'indiquer l'heure de prise en charge.", champ: "heure" };
  if (!date && time)
    return { erreur: "Merci d'indiquer la date de prise en charge.", champ: "date" };

  const combined = `${date}T${time}`;
  const { minDateTime, maxDateTime } = bornesDateHeure(now);

  if (combined < minDateTime) {
    if (combined < formatLocalDateTime(now)) {
      return { erreur: "Cette date et cette heure sont déjà passées.", champ: "heure" };
    }
    return {
      erreur: `Merci de choisir un créneau au moins ${MARGE_MIN_MINUTES} minutes à l'avance.`,
      champ: "heure",
    };
  }
  if (combined > maxDateTime) {
    return {
      erreur: `Merci de choisir une date dans les ${HORIZON_MAX_MOIS} prochains mois.`,
      champ: "date",
    };
  }
  return { erreur: null, champ: null };
}

/**
 * Recapitulatif francais de confirmation, ex.
 * "→ Prise en charge le mardi 21 juillet 2026 à 10h00". Renvoie null si l'un
 * des champs manque ou si la combinaison est invalide.
 */
export function formaterRecap(date: string, time: string): string | null {
  if (!date || !time) return null;
  const d = new Date(`${date}T${time}`);
  if (Number.isNaN(d.getTime())) return null;
  const dateStr = d.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return `→ Prise en charge le ${dateStr} à ${time.replace(":", "h")}`;
}
