/**
 * Source DILA JORF : flux RSS quotidien du Journal officiel.
 *
 * Historique :
 *  - URL DILA officielle (www.dila.premier-ministre.gouv.fr/repertoire/JO_RSS.xml)
 *    retournait 404 (HTTP) au 18 mai 2026, l'ancien repertoire DILA est ferme.
 *  - URL Legifrance officielle (legifrance.gouv.fr/rss/jo.xml) reste tentee en
 *    primaire mais peut etre instable selon la heure d'archivage.
 *  - URL relais fiable retenue le 18/05/2026 : droit.org (RSS 2.0 standard,
 *    ~90 KB, balises <item> avec title/link/description/pubDate). Verifie HTTP
 *    200 et structure compatible avec le parser existant.
 *  - Backup secondaire envisage : legifrss.org (Atom, ~5 MB). Commente pour
 *    l'instant car charge plus lourde et structure differente.
 *
 * Pas d'auth, mais on s'identifie via User-Agent.
 */

import { XMLParser } from "fast-xml-parser";
import type { IngestionSource, RawCandidate } from "./types";

// Primaire : Legifrance officiel. Fallback : droit.org (relais fiable).
const PRIMARY_URL = "https://www.legifrance.gouv.fr/rss/jo.xml";
const FALLBACK_URL = "https://droit.org/flux/jorf.rss";
// Backup secondaire envisage (Atom, plus lourd) si jamais droit.org tombe :
// const FALLBACK_URL_2 = "https://legifrss.org/latest";

const USER_AGENT = "RoullePro-Veille/1.0 (+https://roullepro.com)";
const TIMEOUT_MS = 15_000;

async function fetchWithTimeout(url: string): Promise<string> {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "application/rss+xml, application/xml, text/xml, */*",
      },
      signal: controller.signal,
    });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status} sur ${url}`);
    }
    return await res.text();
  } finally {
    clearTimeout(t);
  }
}

function parsePubDate(raw: unknown): string | undefined {
  if (typeof raw !== "string" || !raw.trim()) return undefined;
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return undefined;
  // YYYY-MM-DD
  return d.toISOString().slice(0, 10);
}

function extractJoIdentifier(url: string): string | undefined {
  if (!url) return undefined;
  // Format 1 : /jo/texte/YYYY/MM/DD
  const m1 = url.match(/\/jo\/texte\/(\d{4}\/\d{1,2}\/\d{1,2})/);
  if (m1) return m1[1].replace(/\//g, "-");
  // Format 2 : id_jo=XYZ ou cidTexte=XYZ ou jorftext000XXXXXXX
  const m2 = url.match(/(?:id_jo|cidTexte)=([A-Z0-9]+)/i);
  if (m2) return m2[1];
  const m3 = url.match(/jorftext\d+/i);
  if (m3) return m3[0].toUpperCase();
  return undefined;
}

function asString(v: unknown): string {
  if (typeof v === "string") return v.trim();
  if (v && typeof v === "object" && "#text" in (v as Record<string, unknown>)) {
    const t = (v as Record<string, unknown>)["#text"];
    if (typeof t === "string") return t.trim();
  }
  return "";
}

export function parseJorfRss(xml: string): RawCandidate[] {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    trimValues: true,
    parseTagValue: true,
  });
  const data = parser.parse(xml);

  // Structures possibles : RSS 2.0 (rss.channel.item[]) ou Atom (feed.entry[]).
  const candidates: RawCandidate[] = [];

  const rssItems: unknown =
    data?.rss?.channel?.item ?? data?.channel?.item ?? null;
  if (rssItems) {
    const list = Array.isArray(rssItems) ? rssItems : [rssItems];
    for (const it of list) {
      const item = it as Record<string, unknown>;
      const title = asString(item.title);
      const link = asString(item.link);
      const description = asString(item.description);
      const pubDate = asString(item.pubDate);
      if (!title || !link) continue;
      candidates.push({
        source_url: link,
        source_identifier: extractJoIdentifier(link),
        title,
        summary: description || undefined,
        publication_date: parsePubDate(pubDate),
        raw_content: item,
      });
    }
    return candidates;
  }

  // Fallback Atom.
  const atomEntries: unknown = data?.feed?.entry ?? null;
  if (atomEntries) {
    const list = Array.isArray(atomEntries) ? atomEntries : [atomEntries];
    for (const it of list) {
      const item = it as Record<string, unknown>;
      const title = asString(item.title);
      let link = "";
      const linkRaw = item.link;
      if (typeof linkRaw === "string") link = linkRaw;
      else if (Array.isArray(linkRaw) && linkRaw[0]) {
        const first = linkRaw[0] as Record<string, unknown>;
        link = (first["@_href"] as string) || asString(first);
      } else if (linkRaw && typeof linkRaw === "object") {
        link = ((linkRaw as Record<string, unknown>)["@_href"] as string) || "";
      }
      const summary = asString(item.summary) || asString(item.content);
      const updated = asString(item.updated) || asString(item.published);
      if (!title || !link) continue;
      candidates.push({
        source_url: link,
        source_identifier: extractJoIdentifier(link),
        title,
        summary: summary || undefined,
        publication_date: parsePubDate(updated),
        raw_content: item,
      });
    }
  }

  return candidates;
}

async function fetchDilaJorfXml(): Promise<string> {
  try {
    return await fetchWithTimeout(PRIMARY_URL);
  } catch (errPrimary) {
    console.warn(
      "[dila-jorf] primary failed, falling back:",
      errPrimary instanceof Error ? errPrimary.message : errPrimary
    );
    return await fetchWithTimeout(FALLBACK_URL);
  }
}

export const dilaJorfSource: IngestionSource = {
  key: "dila_jorf",
  async fetch(): Promise<RawCandidate[]> {
    const xml = await fetchDilaJorfXml();
    return parseJorfRss(xml);
  },
};
