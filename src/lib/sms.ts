/**
 * Envoi de SMS transactionnels via l'API Brevo (ex-Sendinblue).
 *
 * Phase 1 : notifications transactionnelles aux pros inscrits opt-in lors du
 * dispatch d'une nouvelle demande de transport. Le contenu est strictement
 * factuel (aucun argumentaire commercial) pour rester dans le cadre du SMS
 * transactionnel — pas de mention STOP requise, envoi possible a toute heure.
 *
 * Ce module est silencieux et jamais bloquant : une erreur d'envoi SMS ne doit
 * JAMAIS faire echouer la creation d'une demande (cf. route demande-transport).
 */

import type { TypeTransport } from "@/lib/transport-types";

/** Endpoint Brevo pour les SMS transactionnels. */
const BREVO_SMS_ENDPOINT = "https://api.brevo.com/v3/transactionalSMS/sms";

/** Delai maximal d'un appel a l'API Brevo (ms). */
const TIMEOUT_MS = 10_000;

/**
 * Convertit un numero de mobile francais en E.164 (`+336…` / `+337…`).
 *
 * Formats acceptes :
 *   - 06/07 xx xx xx xx (espaces, points, tirets tolerables) ;
 *   - +33 6…/+33 7… (metropole) ;
 *   - numeros DROM deja en E.164 (+590/+594/+596/+262/+269) laisses tels quels ;
 *   - tout numero FR a 10 chiffres commencant par 06/07 (inclut les mobiles DROM
 *     0690/0691/0692/0693/0694…).
 *
 * Renvoie `null` si ce n'est pas un mobile FR exploitable.
 */
export function normaliserTelephoneFr(tel: string): string | null {
  if (!tel) return null;

  // On conserve le « + » eventuel puis on ne garde que les chiffres.
  const brut = tel.trim();
  const aPlus = brut.startsWith("+") || brut.startsWith("00");
  const chiffres = brut.replace(/[^\d]/g, "");
  if (!chiffres) return null;

  // Deja en international : on tolere 00 comme prefixe equivalent a +.
  let intl = chiffres;
  if (brut.startsWith("00")) intl = chiffres.slice(2);

  if (aPlus || intl.startsWith("33") || intl.startsWith("262") || intl.startsWith("59") || intl.startsWith("269")) {
    // Metropole : +33 suivi de 6/7 puis 8 chiffres.
    if (intl.startsWith("33")) {
      const reste = intl.slice(2);
      if ((reste.startsWith("6") || reste.startsWith("7")) && reste.length === 9) {
        return `+33${reste}`;
      }
      // +33 avec un 0 en trop (ex. +33 06…) : on retire le 0 initial.
      if (reste.startsWith("0") && (reste[1] === "6" || reste[1] === "7") && reste.length === 10) {
        return `+33${reste.slice(1)}`;
      }
      return null;
    }
    // DROM deja en E.164 (+590/+594/+596/+262/+269) : on laisse passer tel quel.
    if (
      intl.startsWith("590") ||
      intl.startsWith("594") ||
      intl.startsWith("596") ||
      intl.startsWith("262") ||
      intl.startsWith("269")
    ) {
      return `+${intl}`;
    }
    return null;
  }

  // Format national : 10 chiffres commencant par 06 ou 07.
  if (chiffres.length === 10 && (chiffres.startsWith("06") || chiffres.startsWith("07"))) {
    return `+33${chiffres.slice(1)}`;
  }

  return null;
}

/** Retire les accents pour rester en GSM-7 (1 credit SMS au lieu d'unicode). */
export function retirerAccents(s: string): string {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "");
}

/** Libelle SMS en majuscules du type de transport. */
const TYPE_SMS: Record<TypeTransport, string> = {
  taxi: "TAXI",
  vsl: "VSL",
  ambulance: "AMBULANCE",
};

/**
 * Construit le message SMS factuel d'une nouvelle course, ex. :
 *   "RoullePro: nouvelle course VSL le 21/07 a 10h00, depart Caen (14). Voir et accepter: roullepro.com/pro/demandes"
 *
 * - date/heure au fuseau Europe/Paris ;
 * - type en majuscules (TAXI/VSL/AMBULANCE) ;
 * - ville de depart + departement entre parentheses ;
 * - sans accents (GSM-7) pour maximiser la capacite (1 credit si <= 160).
 */
export function construireMessageSmsCourse(params: {
  typeTransport: TypeTransport;
  dateSouhaitee: string;
  villeDepart?: string | null;
  departement?: string | null;
  url?: string;
}): string {
  const { typeTransport, dateSouhaitee, villeDepart, departement } = params;
  const url = params.url || "roullepro.com/transport-medical/pro/dashboard";

  const type = TYPE_SMS[typeTransport] || retirerAccents(String(typeTransport)).toUpperCase();

  // Date + heure au fuseau Europe/Paris, format "21/07 a 10h00".
  let quand = "";
  const d = new Date(dateSouhaitee);
  if (!Number.isNaN(d.getTime())) {
    const dateStr = new Intl.DateTimeFormat("fr-FR", {
      timeZone: "Europe/Paris",
      day: "2-digit",
      month: "2-digit",
    }).format(d);
    const heureStr = new Intl.DateTimeFormat("fr-FR", {
      timeZone: "Europe/Paris",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
      .format(d)
      .replace(":", "h");
    quand = ` le ${dateStr} a ${heureStr}`;
  }

  // Lieu de depart : ville (departement) si disponibles.
  let lieu = "";
  const ville = villeDepart ? retirerAccents(villeDepart.trim()) : "";
  const dep = departement ? String(departement).trim() : "";
  if (ville && dep) lieu = `, depart ${ville} (${dep})`;
  else if (ville) lieu = `, depart ${ville}`;
  else if (dep) lieu = `, depart dep. ${dep}`;

  const message = `RoullePro: nouvelle course ${type}${quand}${lieu}. Voir et accepter: ${url}`;
  return retirerAccents(message);
}

/**
 * Envoie un SMS transactionnel via Brevo.
 *
 * - No-op silencieux si `BREVO_API_KEY` est absent ({ ok:false, erreur:… }).
 * - Ne throw jamais : toute erreur est capturee et renvoyee dans `erreur`.
 * - Timeout de 10 s via AbortController.
 */
export async function envoyerSmsTransactionnel(params: {
  to: string;
  content: string;
  tag?: string;
}): Promise<{ ok: boolean; messageId?: string; erreur?: string }> {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    return { ok: false, erreur: "BREVO_API_KEY manquant" };
  }

  const recipient = normaliserTelephoneFr(params.to);
  if (!recipient) {
    return { ok: false, erreur: "Numero destinataire invalide" };
  }

  // Sender alphanumerique <= 11 caracteres (Brevo). "RoullePro" = 9 caracteres.
  const sender = process.env.BREVO_SMS_SENDER || "RoullePro";

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(BREVO_SMS_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        accept: "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify({
        type: "transactional",
        sender,
        recipient,
        content: params.content,
        ...(params.tag ? { tag: params.tag } : {}),
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      const texte = await res.text().catch(() => "");
      return { ok: false, erreur: `Brevo HTTP ${res.status} ${texte}`.trim() };
    }

    const data = (await res.json().catch(() => null)) as
      | { messageId?: string | number; reference?: string }
      | null;
    const messageId =
      data?.messageId != null ? String(data.messageId) : data?.reference || undefined;
    return { ok: true, messageId };
  } catch (e) {
    const erreur = e instanceof Error ? e.message : String(e);
    return { ok: false, erreur };
  } finally {
    clearTimeout(timer);
  }
}
