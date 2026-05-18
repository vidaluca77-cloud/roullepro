/**
 * Source legifrss.org — flux Atom non-officiel de Legifrance.
 *
 * Strategie de fetch (18/05/2026, V2) :
 *   Le full-feed `legifrss.org/latest` (~5 MB, ~380 entries) timeout
 *   systematiquement sur Netlify Functions (limite ~10 s). On le remplace
 *   par plusieurs petites requetes filtrees via `?q=<terme>` qui renvoient
 *   typiquement quelques KB en moins d'une seconde. On parallelise par
 *   batches de 8 (Promise.allSettled : une query qui echoue n'arrete pas
 *   les autres), puis on fusionne et on dedupe par URL.
 *
 * Format Atom retourne par legifrss.org :
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
 */

import { XMLParser } from "fast-xml-parser";
import type { IngestionSource, RawCandidate } from "./types";

const BASE_URL = "https://legifrss.org/latest";
const USER_AGENT = "RoullePro-Veille/1.0 (+https://roullepro.com)";
const QUERY_TIMEOUT_MS = 8_000;
const MAX_PARALLEL = 8;

/**
 * Queries thematiques ciblees transport sanitaire / CPAM. Chaque mot-cle
 * declenche un appel ?q=<query> qui renvoie ~quelques KB.
 */
export const LEGIFRSS_QUERIES: string[] = [
  "transport+sanitaire",
  "taxi+conventionne",
  "ambulance",
  "VSL",
  "vehicule+sanitaire+leger",
  "SEFi",
  "service+electronique+facturation",
  "convention+nationale+taxi",
  "transport+medical",
  "transport+partage",
  "ATSU",
  "transport+prescrit",
  "prescription+medicale+transport",
  "agrement+sanitaire",
  "remboursement+transport",
  "tarification+transport",
  "garde+ambulanciere",
  "auxiliaire+ambulancier",
  "hemodialyse",
  "transport+bariatrique",
];

async function fetchQuery(q: string): Promise<string> {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), QUERY_TIMEOUT_MS);
  try {
    const res = await fetch(`${BASE_URL}?q=${q}`, {
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "application/atom+xml, application/xml, */*",
      },
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`legifrss ?q=${q} HTTP ${res.status}`);
    return await res.text();
  } finally {
    clearTimeout(t);
  }
}

type QueryResult = { q: string; xml?: string; error?: string };

async function fetchInBatches(queries: string[]): Promise<QueryResult[]> {
  const results: QueryResult[] = [];
  for (let i = 0; i < queries.length; i += MAX_PARALLEL) {
    const batch = queries.slice(i, i + MAX_PARALLEL);
    const settled = await Promise.allSettled(batch.map((q) => fetchQuery(q)));
    settled.forEach((s, idx) => {
      const q = batch[idx];
      if (s.status === "fulfilled") {
        results.push({ q, xml: s.value });
      } else {
        const reason = s.reason instanceof Error ? s.reason.message : String(s.reason);
        results.push({ q, error: reason });
      }
    });
  }
  return results;
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
    const results = await fetchInBatches(LEGIFRSS_QUERIES);

    const okCount = results.filter((r) => r.xml).length;
    const errCount = results.filter((r) => r.error).length;
    if (errCount > 0) {
      const failed = results
        .filter((r) => r.error)
        .map((r) => `${r.q}:${r.error}`)
        .slice(0, 5)
        .join(" | ");
      console.warn(
        `[legifrss] ${errCount}/${results.length} queries failed (first: ${failed})`
      );
    }
    if (okCount === 0) {
      throw new Error(
        `legifrss : aucune query n'a abouti (${errCount} echecs sur ${results.length})`
      );
    }

    // Fusion + dedup intra-source par URL (le meme texte peut sortir sur
    // plusieurs queries thematiques).
    const all: RawCandidate[] = [];
    const seen = new Set<string>();
    for (const r of results) {
      if (!r.xml) continue;
      const candidates = parseLegifrssAtom(r.xml);
      for (const c of candidates) {
        const key = c.source_url;
        if (!key || seen.has(key)) continue;
        seen.add(key);
        all.push(c);
      }
    }
    return all;
  },
};
