/**
 * Deduplication des candidats veille entre sources.
 *
 * Strategie de cle (par ordre de preference) :
 *   1. URL normalisee (origin + pathname, sans hash ni trailing slash)
 *   2. source_identifier si present (ex : JORFTEXT000XXX, identifiant JO daté)
 *   3. fallback : titre normalise + publication_date
 *
 * Priorite source : dila_jorf (officiel) > legifrss > autres.
 */

import type { RawCandidate, SourceKey } from "./sources/types";

const SOURCE_PRIORITY: Record<SourceKey | string, number> = {
  dila_jorf: 0,
  legifrance_piste: 1,
  legifrss: 2,
};

function priorityFor(source: string): number {
  return SOURCE_PRIORITY[source] ?? 99;
}

function normalizeTitle(t: string): string {
  return t
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeUrl(u: string): string {
  if (!u) return "";
  try {
    const url = new URL(u);
    url.hash = "";
    const path = url.pathname.replace(/\/+$/, "");
    return `${url.origin}${path}${url.search}`;
  } catch {
    return u;
  }
}

function buildKey(c: RawCandidate): string {
  const url = normalizeUrl(c.source_url);
  if (url) return `u:${url}`;
  if (c.source_identifier) return `id:${c.source_identifier}`;
  return `t:${normalizeTitle(c.title)}|${c.publication_date ?? ""}`;
}

export type Tagged = RawCandidate & { source: SourceKey };

/**
 * Dedup global entre plusieurs sources. La source la plus prioritaire (poids
 * le plus bas) gagne en cas de collision.
 */
export function dedupeCandidates<T extends Tagged>(candidates: T[]): T[] {
  const byKey = new Map<string, T>();
  for (const c of candidates) {
    const k = buildKey(c);
    const prev = byKey.get(k);
    if (!prev || priorityFor(c.source) < priorityFor(prev.source)) {
      byKey.set(k, c);
    }
  }
  return Array.from(byKey.values());
}
