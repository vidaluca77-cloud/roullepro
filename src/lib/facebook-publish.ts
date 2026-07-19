/**
 * Publication automatique et anonymisee des nouvelles demandes de transport sur
 * la page Facebook RoullePro via l'API Graph de Meta.
 *
 * Objectif : montrer publiquement le flux de demandes pour attirer de nouveaux
 * professionnels conventionnes, SANS jamais exposer la moindre donnee
 * personnelle du patient (ni nom, ni telephone, ni email, ni adresse precise).
 * Seules les villes et le departement sont diffuses.
 *
 * Ce module suit le meme contrat que les SMS/emails de la route
 * demande-transport : silencieux et jamais bloquant. Un echec de publication
 * Facebook ne doit JAMAIS faire echouer ni ralentir la creation d'une demande
 * (fire-and-forget, try/catch complet, timeout court).
 */

import { LIBELLE_TYPE_TRANSPORT, type TypeTransport } from "@/lib/transport-types";

/** Version de l'API Graph ciblee. */
const GRAPH_API_VERSION = "v21.0";

/** Delai maximal de l'appel a l'API Graph (ms). */
const TIMEOUT_MS = 5_000;

/** URL d'inscription des professionnels (appel a l'action du post). */
const URL_INSCRIPTION = "https://roullepro.com/transport-medical/inscription";

/**
 * Donnees strictement non personnelles necessaires a la construction du post.
 * On ne passe volontairement JAMAIS le nom, telephone ou email a ce module.
 */
export type DemandeFacebook = {
  typeTransport: TypeTransport;
  dateSouhaitee: string | null;
  villeDepart?: string | null;
  villeArrivee?: string | null;
  departementCible?: string | null;
  /** Adresses completes, utilisees uniquement en secours pour extraire la ville. */
  lieuDepart?: string | null;
  lieuArrivee?: string | null;
};

/** Libelle du type de transport en majuscules et en toutes lettres. */
function libelleType(typeTransport: TypeTransport): string {
  const libelle = LIBELLE_TYPE_TRANSPORT[typeTransport];
  return (libelle || String(typeTransport)).toUpperCase();
}

/**
 * Extrait la seule ville d'une adresse complete, sans jamais renvoyer la rue ni
 * le numero. On ne se fie qu'au motif « code postal + ville » (format Google
 * Places / API Adresse). En l'absence de ce motif, on renvoie null plutot que
 * de risquer d'exposer une adresse precise.
 */
export function extraireVille(adresse: string | null | undefined): string | null {
  if (!adresse) return null;
  for (const part of adresse.split(",")) {
    const m = part.trim().match(/^\d{5}\s+(.+)$/);
    if (m) {
      const ville = m[1].trim();
      if (ville) return ville;
    }
  }
  return null;
}

/** Premiere lettre en majuscule (le reste inchange). */
function capitaliser(s: string): string {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

/**
 * Formate la date/heure souhaitee en francais au fuseau Europe/Paris, ex.
 * "Lundi 20 juillet, 11h15". Renvoie "" si la date est absente ou invalide.
 */
function formaterQuand(dateSouhaitee: string | null | undefined): string {
  if (!dateSouhaitee) return "";
  const d = new Date(dateSouhaitee);
  if (Number.isNaN(d.getTime())) return "";
  const dateStr = new Intl.DateTimeFormat("fr-FR", {
    timeZone: "Europe/Paris",
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(d);
  const heureStr = new Intl.DateTimeFormat("fr-FR", {
    timeZone: "Europe/Paris",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
    .format(d)
    .replace(":", "h");
  return `${capitaliser(dateStr)}, ${heureStr}`;
}

/**
 * Construit le trajet anonymise « Voreppe → Grenoble (38) » a partir des villes
 * connues (ou extraites d'une adresse), avec le departement entre parentheses.
 * Adapte le rendu quand une ville manque, sans jamais afficher « undefined ».
 */
function formaterTrajet(demande: DemandeFacebook): string {
  const depart =
    (demande.villeDepart && demande.villeDepart.trim()) ||
    extraireVille(demande.lieuDepart) ||
    "";
  const arrivee =
    (demande.villeArrivee && demande.villeArrivee.trim()) ||
    extraireVille(demande.lieuArrivee) ||
    "";
  const dep = (demande.departementCible && demande.departementCible.trim()) || "";
  const suffixe = dep ? ` (${dep})` : "";

  if (depart && arrivee) return `${depart} → ${arrivee}${suffixe}`;
  if (depart) return `${depart}${suffixe}`;
  if (arrivee) return `${arrivee}${suffixe}`;
  if (dep) return `Departement ${dep}`;
  return "";
}

/**
 * Construit le message anonymise a publier sur Facebook. Ne contient QUE le type
 * de transport, la date/heure, les villes et le departement — aucune donnee
 * personnelle.
 */
export function construireMessageFacebook(demande: DemandeFacebook): string {
  const type = libelleType(demande.typeTransport);
  const quand = formaterQuand(demande.dateSouhaitee);
  const trajet = formaterTrajet(demande);

  const detail = [quand, trajet].filter(Boolean).join(" — ");

  const lignes = [
    `Nouvelle demande de transport — ${type}`,
    detail,
    `Vous êtes professionnel conventionné dans ce département ? Créez votre fiche gratuite et recevez ces demandes : ${URL_INSCRIPTION}`,
  ].filter(Boolean);

  return lignes.join("\n");
}

/**
 * Publie une nouvelle demande sur la page Facebook RoullePro (fire-and-forget).
 *
 * - No-op silencieux si FACEBOOK_PAGE_ID ou FACEBOOK_PAGE_ACCESS_TOKEN est absent.
 * - Ne throw jamais : toute erreur est capturee et journalisee.
 * - Timeout de 5 s via AbortController.
 */
export async function publierDemandeSurFacebook(
  demande: DemandeFacebook
): Promise<void> {
  const pageId = process.env.FACEBOOK_PAGE_ID;
  const accessToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
  if (!pageId || !accessToken) return;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const message = construireMessageFacebook(demande);
    const res = await fetch(
      `https://graph.facebook.com/${GRAPH_API_VERSION}/${pageId}/feed`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, access_token: accessToken }),
        signal: controller.signal,
      }
    );
    if (!res.ok) {
      const texte = await res.text().catch(() => "");
      console.error(
        `[facebook-publish] echec HTTP ${res.status} ${texte}`.trim()
      );
    }
  } catch (e) {
    console.error("[facebook-publish] erreur", e);
  } finally {
    clearTimeout(timer);
  }
}
