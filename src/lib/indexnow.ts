/**
 * Helper IndexNow : ping immediat de Bing/Yandex/etc. lors de la creation
 * ou de la mise a jour d'une URL importante.
 *
 * - Skip en non-production (pas de ping depuis preview Netlify ou dev local).
 * - Try/catch silencieux : un echec IndexNow ne casse JAMAIS le flow business.
 * - Max 10 000 URLs par appel (limite IndexNow).
 *
 * Integration courante : juste apres un INSERT/UPDATE Supabase reussi,
 * preceder l'appel par `void` pour fire-and-forget si on ne veut pas attendre.
 *
 * Endroits ou ce helper est appele :
 *   - /api/sanitaire/inscription           creation fiche pro sanitaire
 *   - /api/sanitaire/claim/verify          validation de claim
 *   - /api/sanitaire/fiche                 mise a jour fiche depuis dashboard pro
 *   - /admin/veille/alertes/_actions       publication d'une alerte reglementaire
 *
 * Le cron quotidien /api/cron/indexnow (existant) reste utile pour le batch
 * nocturne 500 URLs/jour : ce helper le complete pour les actions instantanees.
 */

const HOST = "roullepro.com";
const KEY = "9569b8627b1543759478b373636ff7b8";
const ENDPOINT = "https://api.indexnow.org/indexnow";

export const INDEXNOW_BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL || "https://roullepro.com";
const KEY_LOCATION = `${INDEXNOW_BASE_URL}/${KEY}.txt`;

export type IndexNowResult = { ok: boolean; status: number; skipped?: boolean };

export async function pingIndexNow(urls: string[]): Promise<IndexNowResult> {
  // Skip si on n'est pas en prod (preview Netlify ou dev local).
  if (process.env.NODE_ENV !== "production") {
    return { ok: true, status: 0, skipped: true };
  }

  const cleaned = (urls || [])
    .map((u) => (typeof u === "string" ? u.trim() : ""))
    .filter((u) => u.length > 0);

  if (cleaned.length === 0) {
    return { ok: true, status: 0, skipped: true };
  }

  const payload = {
    host: HOST,
    key: KEY,
    keyLocation: KEY_LOCATION,
    urlList: cleaned.slice(0, 10_000),
  };

  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify(payload),
    });
    if (!res.ok && res.status >= 400) {
      console.warn(
        `[indexnow] ping non-OK status=${res.status} (${cleaned.length} URLs)`
      );
    } else {
      console.log(
        `[indexnow] ping ok status=${res.status} (${cleaned.length} URLs)`
      );
    }
    return { ok: res.ok, status: res.status };
  } catch (err) {
    console.warn(
      "[indexnow] ping error:",
      err instanceof Error ? err.message : err
    );
    return { ok: false, status: 0 };
  }
}

/**
 * Helper : reconstitue l'URL canonique d'une fiche pros_sanitaire.
 * Renvoie une chaine vide si une partie manque.
 */
export function buildFicheUrl(p: {
  ville_slug?: string | null;
  categorie?: string | null;
  slug?: string | null;
}): string {
  if (!p.ville_slug || !p.categorie || !p.slug) return "";
  const catUrl = p.categorie === "taxi_conventionne" ? "taxi-conventionne" : p.categorie;
  return `${INDEXNOW_BASE_URL}/transport-medical/${p.ville_slug}/${catUrl}/${p.slug}`;
}

/**
 * Helper : URL de la page ville (parente d'une fiche).
 */
export function buildVilleUrl(villeSlug?: string | null): string {
  if (!villeSlug) return "";
  return `${INDEXNOW_BASE_URL}/transport-medical/${villeSlug}`;
}
