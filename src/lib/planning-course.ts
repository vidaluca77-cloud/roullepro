/**
 * Planning des courses (espace pro) — logique pure, testable sans React/Supabase.
 *
 * Alimenté par la sortie de la RPC `demandes_pro_dashboard()` (cf.
 * supabase/migrations/20260717140002_demandes_pro_dashboard_estimation.sql).
 * On ne s'intéresse ici qu'aux courses ACCEPTÉES par le pro connecté : la RPC
 * a déjà révélé les coordonnées patient pour le statut 'acceptee' et scope les
 * lignes sur auth.uid(). Ce module ne contient donc AUCUN contrôle d'accès
 * (assuré en amont par l'auth de la page pro et la RPC SECURITY DEFINER).
 */

import { LIBELLE_TYPE_TRANSPORT, type TypeTransport } from "@/lib/transport-types";

/** Sous-ensemble des colonnes de demandes_pro_dashboard nécessaires au planning. */
export type CoursePlanning = {
  dtp_id: string;
  demande_id: string;
  dtp_statut: string;
  acceptee_at: string | null;
  type_transport: string | null;
  lieu_depart: string | null;
  lieu_arrivee: string | null;
  date_souhaitee: string | null;
  aller_retour: boolean | null;
  mobilite: string | null;
  precisions: string | null;
  distance_km: number | null;
  prix_estime: number | null;
  demandeur_nom: string | null;
  demandeur_telephone: string | null;
  demandeur_email: string | null;
};

const MS_PAR_JOUR = 24 * 60 * 60 * 1000;
/** Durée par défaut d'une course pour l'export agenda (aucune heure de fin en BDD). */
export const DUREE_COURSE_MINUTES = 60;

/** Libellé humain du type de transport (fallback « Transport »). */
export function libelleType(type: string | null): string {
  if (type && type in LIBELLE_TYPE_TRANSPORT) {
    return LIBELLE_TYPE_TRANSPORT[type as TypeTransport];
  }
  return "Transport";
}

/**
 * Statuts d'une course prise en charge par ce pro :
 * - 'acceptee' : acceptée, coordonnées patient révélées par la RPC ;
 * - 'terminee' : course accompagnée puis clôturée (coordonnées re-masquées
 *   par la RPC, mais trajet/date/type restent utiles à l'historique).
 */
const STATUTS_RETENUS = new Set(["acceptee", "terminee"]);

/** Ne garde que les courses prises par ce pro dont la date_souhaitee est exploitable. */
function coursesRetenues(courses: CoursePlanning[]): CoursePlanning[] {
  return courses.filter(
    (c) =>
      STATUTS_RETENUS.has(c.dtp_statut) &&
      c.date_souhaitee !== null &&
      !Number.isNaN(new Date(c.date_souhaitee).getTime())
  );
}

function timestamp(c: CoursePlanning): number {
  return new Date(c.date_souhaitee as string).getTime();
}

/**
 * Sépare les courses acceptées en « à venir » (date >= maintenant, tri
 * chronologique croissant) et « historique » (date < maintenant, tri
 * décroissant : la plus récente d'abord).
 */
export function partitionnerCourses(
  courses: CoursePlanning[],
  now: Date = new Date()
): { aVenir: CoursePlanning[]; historique: CoursePlanning[] } {
  const t = now.getTime();
  const datees = coursesRetenues(courses);
  // Une course terminée est close : toujours dans l'historique, même datée dans le futur.
  const aVenir = datees
    .filter((c) => c.dtp_statut === "acceptee" && timestamp(c) >= t)
    .sort((a, b) => timestamp(a) - timestamp(b));
  const historique = datees
    .filter((c) => c.dtp_statut === "terminee" || timestamp(c) < t)
    .sort((a, b) => timestamp(b) - timestamp(a));
  return { aVenir, historique };
}

export type JourPlanning = {
  /** Clé stable AAAA-MM-JJ (fuseau local). */
  cle: string;
  /** Date de début de journée (00:00 local). */
  date: Date;
  courses: CoursePlanning[];
};

/** Clé de jour local AAAA-MM-JJ (sans dépendance de fuseau UTC). */
function cleJourLocal(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const j = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${j}`;
}

/**
 * Regroupe les courses à venir par jour sur une fenêtre glissante de 7 jours
 * (aujourd'hui inclus). Renvoie toujours 7 entrées, y compris les jours vides,
 * pour un affichage « vue semaine » régulier.
 */
export function grouperParJourSemaine(
  courses: CoursePlanning[],
  now: Date = new Date()
): JourPlanning[] {
  const debut = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const jours: JourPlanning[] = [];
  const index = new Map<string, CoursePlanning[]>();

  for (let i = 0; i < 7; i++) {
    const date = new Date(debut.getTime() + i * MS_PAR_JOUR);
    const cle = cleJourLocal(date);
    const liste: CoursePlanning[] = [];
    index.set(cle, liste);
    jours.push({ cle, date, courses: liste });
  }

  for (const c of coursesRetenues(courses)) {
    const cle = cleJourLocal(new Date(c.date_souhaitee as string));
    const liste = index.get(cle);
    if (liste) liste.push(c);
  }

  for (const j of jours) {
    j.courses.sort((a, b) => timestamp(a) - timestamp(b));
  }
  return jours;
}

/* ------------------------------------------------------------------ *
 * Export iCalendar (.ics)
 * ------------------------------------------------------------------ */

/** Échappe les caractères spéciaux d'une valeur texte iCalendar (RFC 5545). */
function escapeICS(v: string): string {
  return v
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

/** Formate une Date en UTC au format iCalendar : AAAAMMJJTHHMMSSZ. */
function formatICSDate(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}` +
    `T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`
  );
}

function descriptionCourse(c: CoursePlanning): string {
  const lignes: string[] = [];
  if (c.demandeur_nom) lignes.push(`Patient : ${c.demandeur_nom}`);
  if (c.demandeur_telephone) lignes.push(`Tél : ${c.demandeur_telephone}`);
  if (c.demandeur_email) lignes.push(`Email : ${c.demandeur_email}`);
  if (c.mobilite) lignes.push(`Mobilité : ${c.mobilite}`);
  if (typeof c.distance_km === "number" && c.distance_km > 0) {
    lignes.push(`Distance estimée : ${c.distance_km} km`);
  }
  if (typeof c.prix_estime === "number" && c.prix_estime > 0) {
    lignes.push(`Estimation : ~${c.prix_estime} €`);
  }
  if (c.aller_retour) lignes.push("Aller-retour");
  if (c.precisions) lignes.push(`Précisions : ${c.precisions}`);
  return lignes.join("\n");
}

/**
 * Génère un fichier iCalendar valide à partir des courses fournies (typiquement
 * les courses à venir). Les lignes sont séparées par CRLF comme l'exige la RFC.
 */
export function genererICS(
  courses: CoursePlanning[],
  now: Date = new Date()
): string {
  const dtstamp = formatICSDate(now);
  const lignes: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//RoullePro//Planning des courses//FR",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
  ];

  for (const c of coursesRetenues(courses)) {
    const debut = new Date(c.date_souhaitee as string);
    const fin = new Date(debut.getTime() + DUREE_COURSE_MINUTES * 60 * 1000);
    const trajet = `${c.lieu_depart || "Départ"} → ${c.lieu_arrivee || "Arrivée"}`;
    const summary = `${libelleType(c.type_transport)} — ${trajet}`;
    lignes.push("BEGIN:VEVENT");
    lignes.push(`UID:${c.dtp_id}@roullepro.com`);
    lignes.push(`DTSTAMP:${dtstamp}`);
    lignes.push(`DTSTART:${formatICSDate(debut)}`);
    lignes.push(`DTEND:${formatICSDate(fin)}`);
    lignes.push(`SUMMARY:${escapeICS(summary)}`);
    if (c.lieu_depart) lignes.push(`LOCATION:${escapeICS(c.lieu_depart)}`);
    const desc = descriptionCourse(c);
    if (desc) lignes.push(`DESCRIPTION:${escapeICS(desc)}`);
    lignes.push("END:VEVENT");
  }

  lignes.push("END:VCALENDAR");
  return lignes.join("\r\n");
}

/* ------------------------------------------------------------------ *
 * Export CSV (historique)
 * ------------------------------------------------------------------ */

const CSV_SEPARATEUR = ";";

/** Échappe un champ CSV (séparateur « ; », compatible Excel FR). */
function escapeCSV(v: string): string {
  if (v.includes('"') || v.includes(CSV_SEPARATEUR) || /[\r\n]/.test(v)) {
    return `"${v.replace(/"/g, '""')}"`;
  }
  return v;
}

function champsCSV(c: CoursePlanning): string[] {
  const d = c.date_souhaitee ? new Date(c.date_souhaitee) : null;
  const dateStr =
    d && !Number.isNaN(d.getTime())
      ? d.toLocaleDateString("fr-FR")
      : "";
  const heureStr =
    d && !Number.isNaN(d.getTime())
      ? d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
      : "";
  return [
    dateStr,
    heureStr,
    libelleType(c.type_transport),
    c.lieu_depart || "",
    c.lieu_arrivee || "",
    c.aller_retour ? "Oui" : "Non",
    c.demandeur_nom || "",
    c.demandeur_telephone || "",
    c.demandeur_email || "",
    typeof c.distance_km === "number" ? String(c.distance_km) : "",
    typeof c.prix_estime === "number" ? String(c.prix_estime) : "",
  ];
}

const CSV_ENTETES = [
  "Date",
  "Heure",
  "Type",
  "Départ",
  "Arrivée",
  "Aller-retour",
  "Patient",
  "Téléphone",
  "Email",
  "Distance (km)",
  "Prix estimé (€)",
];

/**
 * Génère un CSV (séparateur « ; ») des courses fournies, avec un BOM UTF-8 en
 * tête pour l'ouverture directe dans Excel. Utilisé pour l'historique.
 */
export function genererCSV(courses: CoursePlanning[]): string {
  const lignes = [CSV_ENTETES, ...coursesRetenues(courses).map(champsCSV)];
  const corps = lignes
    .map((champs) => champs.map(escapeCSV).join(CSV_SEPARATEUR))
    .join("\r\n");
  return `﻿${corps}`;
}
