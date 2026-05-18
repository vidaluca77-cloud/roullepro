/**
 * Source legifrss.org — flux Atom non-officiel de Legifrance.
 *
 * Couvre ~7 jours glissants de publications JORF (lois, decrets, arretes,
 * avis, etc.) avec ~380 entries par fetch (~5 MB).
 *
 * Format Atom :
 *   <feed>
 *     <entry>
 *       <title>...</title>
 *       <id>https://www.legifrance.gouv.fr/jorf/id/JORFTEXT...</id>
 *       <updated>2026-05-12T02:00:00+02:00</updated>
 *       <content type="html">...resume HTML...</content>
 *     </entry>
 *     ...
 *   </feed>
 *
 * L'URL canonique du texte est dans <id> (pas dans <link>).
 *
 * Ajoute le 18/05/2026 pour elargir la veille hebdo (droit.org ne couvre que
 * le JO du jour).
 */

import { XMLParser } from "fast-xml-parser";
import type { IngestionSource, RawCandidate } from "./types";

const FEED_URL = "https://legifrss.org/latest";
const USER_AGENT = "RoullePro-Veille/1.0 (+https://roullepro.com)";
const TIMEOUT_MS = 30_000;

async function fetchFeed(): Promise<string> {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(FEED_URL, {
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "application/atom+xml, application/xml, */*",
      },
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`legifrss HTTP ${res.status}`);
    return await res.text();
  } finally {
    clearTimeout(t);
  }
}

function asString(v: unknown): string {
  if (typeof v === "string") return v.trim();
  if (v && typeof v === "object") {
    const o = v as Record<string, unknown>;
    if (typeof o["#text"] === "string") return o["#text"].trim();
    if (typeof o["@_href"] === "string") return o["@_href"].trim();
  }
  return "";
}

function extractLinkHref(link: unknown): string {
  if (Array.isArray(link)) {
    for (const l of link) {
      const href = asString(l);
      if (href) return href;
    }
    return "";
  }
  return asString(link);
}

function parseDate(raw: unknown): string | undefined {
  const s = asString(raw);
  if (!s) return undefined;
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toISOString().slice(0, 10);
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractJorfId(url: string): string | undefined {
  if (!url) return undefined;
  const m = url.match(/JORFTEXT\d+/i);
  if (m) return m[0].toUpperCase();
  return undefined;
}

export function parseLegifrssAtom(xml: string): RawCandidate[] {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    trimValues: true,
  });
  const data = parser.parse(xml);
  const entries = data?.feed?.entry;
  if (!entries) return [];
  const list = Array.isArray(entries) ? entries : [entries];

  const out: RawCandidate[] = [];
  for (const e of list as Record<string, unknown>[]) {
    const title = asString(e.title);
    // L'URL canonique est dans <id> ; <link> peut aussi exister mais pointe
    // souvent vers la meme chose.
    const url = asString(e.id) || extractLinkHref(e.link);
    if (!title || !url) continue;
    const contentRaw = asString(e.content) || asString(e.summary);
    const summary = contentRaw ? stripHtml(contentRaw).slice(0, 800) : undefined;
    const published =
      parseDate(e.updated) || parseDate(e.published) || undefined;
    out.push({
      source_url: url,
      source_identifier: extractJorfId(url),
      title,
      summary,
      publication_date: published,
      raw_content: e,
    });
  }
  return out;
}

export const legifrssSource: IngestionSource = {
  key: "legifrss",
  async fetch(): Promise<RawCandidate[]> {
    const xml = await fetchFeed();
    return parseLegifrssAtom(xml);
  },
};
