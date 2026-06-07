/**
 * Helpers pour interpreter le champ jsonb `horaires` des pros sanitaire.
 *
 * Format en base : un objet indexe par jour en francais minuscule
 *   { "lundi": "08:00–12:00, 14:00–19:00", "mardi": "Fermé", ... }
 * Compat legacy : { "general": "24h/24" } applique la meme valeur a tous les jours.
 *
 * Les valeurs sont des chaines saisies par les pros. On gere :
 *   - plusieurs creneaux separes par virgule (pause dejeuner)
 *   - separateur d'heures tiret "-", demi-cadratin "–" ou cadratin "—"
 *   - mention "24h/24" / "24/24" / "24h24" (ouvert toute la journee)
 *   - "Fermé" / "ferme" / chaine vide (ferme ce jour-la)
 */

export type HorairesJson = Record<string, string> | null | undefined;

type Creneau = { opens: string; closes: string };

const JOURS_ORDRE = [
  "lundi",
  "mardi",
  "mercredi",
  "jeudi",
  "vendredi",
  "samedi",
  "dimanche",
] as const;

export type JourKey = (typeof JOURS_ORDRE)[number];

// Index JS getDay() : 0 = dimanche, 1 = lundi ...
const JS_DAY_TO_JOUR: Record<number, JourKey> = {
  0: "dimanche",
  1: "lundi",
  2: "mardi",
  3: "mercredi",
  4: "jeudi",
  5: "vendredi",
  6: "samedi",
};

const JOUR_LABELS: Record<JourKey, string> = {
  lundi: "lundi",
  mardi: "mardi",
  mercredi: "mercredi",
  jeudi: "jeudi",
  vendredi: "vendredi",
  samedi: "samedi",
  dimanche: "dimanche",
};

// dayOfWeek schema.org pour le JSON-LD
const JOUR_SCHEMA_ORG: Record<JourKey, string> = {
  lundi: "Monday",
  mardi: "Tuesday",
  mercredi: "Wednesday",
  jeudi: "Thursday",
  vendredi: "Friday",
  samedi: "Saturday",
  dimanche: "Sunday",
};

function isFerme(valeur: string | undefined | null): boolean {
  if (!valeur) return true;
  const v = valeur.trim().toLowerCase();
  if (v === "") return true;
  return v === "fermé" || v === "ferme" || v === "fermée" || v === "fermee";
}

function is24h(valeur: string): boolean {
  const v = valeur.toLowerCase().replace(/\s/g, "");
  return (
    v.includes("24h/24") ||
    v.includes("24/24") ||
    v.includes("24h24") ||
    v === "24h" ||
    v.includes("24/7")
  );
}

/**
 * Normalise une valeur jour en liste de creneaux { opens, closes } au format HH:MM.
 * Retourne [] si ferme, ou un creneau 00:00-23:59 si "24h/24".
 */
export function parseCreneaux(valeur: string | undefined | null): Creneau[] {
  if (isFerme(valeur)) return [];
  const v = (valeur as string).trim();
  if (is24h(v)) return [{ opens: "00:00", closes: "23:59" }];

  const creneaux: Creneau[] = [];
  // Decoupe par virgule ou point-virgule (plusieurs creneaux dans la journee)
  for (const part of v.split(/[,;]/)) {
    // Capture HH:MM ou HHhMM ou HHh autour d'un separateur tiret/cadratin
    const m = part.match(
      /(\d{1,2})\s*[h:]\s*(\d{2})?\s*[-–—àa]+\s*(\d{1,2})\s*[h:]\s*(\d{2})?/i
    );
    if (!m) continue;
    const oh = m[1].padStart(2, "0");
    const om = (m[2] || "00").padStart(2, "0");
    const ch = m[3].padStart(2, "0");
    const cm = (m[4] || "00").padStart(2, "0");
    creneaux.push({ opens: `${oh}:${om}`, closes: `${ch}:${cm}` });
  }
  return creneaux;
}

/**
 * Resout le champ horaires en une map jour -> creneaux, en gerant le format legacy
 * { general: "..." }. Retourne null si aucun horaire exploitable.
 */
export function resolveHoraires(
  horaires: HorairesJson
): Record<JourKey, Creneau[]> | null {
  if (!horaires || typeof horaires !== "object") return null;
  const aJourExplicite = JOURS_ORDRE.some((j) => horaires[j]);
  const legacyGeneral =
    !aJourExplicite && typeof horaires.general === "string"
      ? horaires.general
      : null;

  if (!aJourExplicite && !legacyGeneral) return null;

  const out = {} as Record<JourKey, Creneau[]>;
  let hasAny = false;
  for (const jour of JOURS_ORDRE) {
    const valeur = horaires[jour] ?? legacyGeneral ?? "";
    const creneaux = parseCreneaux(valeur);
    out[jour] = creneaux;
    if (creneaux.length > 0) hasAny = true;
  }
  return hasAny ? out : null;
}

function minutesFromHHMM(hhmm: string): number {
  const [h, m] = hhmm.split(":").map((n) => parseInt(n, 10));
  return h * 60 + m;
}

/**
 * Recupere l'heure courante a Paris (heure, minute, jour de la semaine) en gerant
 * automatiquement l'heure d'ete/hiver via Intl, sans dependance externe.
 */
function nowInParis(now: Date): { jsDay: number; minutes: number } {
  const fmt = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Paris",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const parts = fmt.formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)?.value || "";
  const weekday = get("weekday").toLowerCase();
  const hour = parseInt(get("hour"), 10);
  const minute = parseInt(get("minute"), 10);
  const dayMap: Record<string, number> = {
    sun: 0,
    mon: 1,
    tue: 2,
    wed: 3,
    thu: 4,
    fri: 5,
    sat: 6,
  };
  const jsDay = dayMap[weekday] ?? now.getDay();
  return { jsDay, minutes: hour * 60 + minute };
}

function formatHeureFr(hhmm: string): string {
  const [h, m] = hhmm.split(":");
  return m === "00" ? `${parseInt(h, 10)}h` : `${parseInt(h, 10)}h${m}`;
}

export type OpenStatus = {
  open: boolean;
  /** Phrase prete a afficher, ex "Ouvert jusqu'a 19h" ou "Fermé — ouvre demain à 8h". */
  label: string;
  /** Prochaine bascule au format HH:MM (ouverture si ferme, fermeture si ouvert). */
  nextChange?: string;
  /** Jour de la prochaine ouverture quand ferme, ex "demain", "lundi". */
  nextDayLabel?: string;
};

/**
 * Indique si un pro est ouvert maintenant a partir de son champ horaires.
 * Retourne null si aucun horaire exploitable (on n'affiche alors aucun badge).
 */
export function isOpenNow(horaires: HorairesJson, now: Date = new Date()): OpenStatus | null {
  const resolved = resolveHoraires(horaires);
  if (!resolved) return null;

  const { jsDay, minutes } = nowInParis(now);
  const jourCourant = JS_DAY_TO_JOUR[jsDay];
  const creneauxAujourdhui = resolved[jourCourant] || [];

  for (const c of creneauxAujourdhui) {
    const o = minutesFromHHMM(c.opens);
    const cl = minutesFromHHMM(c.closes);
    if (minutes >= o && minutes < cl) {
      return {
        open: true,
        nextChange: c.closes,
        label: `Ouvert jusqu'à ${formatHeureFr(c.closes)}`,
      };
    }
  }

  // Ferme maintenant : cherche la prochaine ouverture (aujourd'hui plus tard, puis jours suivants)
  const prochainAujourdhui = creneauxAujourdhui
    .map((c) => ({ c, o: minutesFromHHMM(c.opens) }))
    .filter((x) => x.o > minutes)
    .sort((a, b) => a.o - b.o)[0];

  if (prochainAujourdhui) {
    return {
      open: false,
      nextChange: prochainAujourdhui.c.opens,
      label: `Fermé — ouvre à ${formatHeureFr(prochainAujourdhui.c.opens)}`,
    };
  }

  for (let offset = 1; offset <= 7; offset += 1) {
    const futurJsDay = (jsDay + offset) % 7;
    const futurJour = JS_DAY_TO_JOUR[futurJsDay];
    const creneaux = resolved[futurJour] || [];
    if (creneaux.length > 0) {
      const premier = creneaux
        .slice()
        .sort((a, b) => minutesFromHHMM(a.opens) - minutesFromHHMM(b.opens))[0];
      const jourLabel = offset === 1 ? "demain" : JOUR_LABELS[futurJour];
      return {
        open: false,
        nextChange: premier.opens,
        nextDayLabel: jourLabel,
        label: `Fermé — ouvre ${jourLabel} à ${formatHeureFr(premier.opens)}`,
      };
    }
  }

  // Horaires presents mais aucune ouverture future trouvee (cas degenere)
  return { open: false, label: "Fermé" };
}

/**
 * Genere le tableau openingHoursSpecification (schema.org) a partir du champ horaires.
 * Retourne null si aucun horaire exploitable (le champ doit alors etre omis du JSON-LD
 * plutot que de mentir avec un 24/7 hardcode).
 */
export function buildOpeningHoursSpecification(
  horaires: HorairesJson
): { "@type": string; dayOfWeek: string; opens: string; closes: string }[] | null {
  const resolved = resolveHoraires(horaires);
  if (!resolved) return null;

  const specs: { "@type": string; dayOfWeek: string; opens: string; closes: string }[] = [];
  for (const jour of JOURS_ORDRE) {
    for (const c of resolved[jour]) {
      specs.push({
        "@type": "OpeningHoursSpecification",
        dayOfWeek: JOUR_SCHEMA_ORG[jour],
        opens: c.opens,
        closes: c.closes,
      });
    }
  }
  return specs.length > 0 ? specs : null;
}
