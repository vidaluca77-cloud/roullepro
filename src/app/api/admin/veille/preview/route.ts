/**
 * GET /api/admin/veille/preview
 *
 * Endpoint debug pour l'admin : fetch les sources veille en parallele, applique
 * le matcher + dedup, renvoie un JSON avec :
 *   - counts.{dila_jorf, legifrss, after_dedup}
 *   - top10_score : 10 candidats les mieux scores
 *   - rejected_examples : 10 candidats rejetes pour donner un apercu du bruit
 *
 * Auth : Lucas (email) OU profiles.role = 'admin' (pattern existant).
 */

import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { dilaJorfSource } from "@/lib/veille/sources/dila-jorf";
import { legifrssSource } from "@/lib/veille/sources/legifrss";
import { matchCandidate, MIN_RELEVANCE_SCORE } from "@/lib/veille/matcher";
import { dedupeCandidates } from "@/lib/veille/dedup";
import type { RawCandidate, SourceKey } from "@/lib/veille/sources/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const ADMIN_EMAIL = "lucas.horville@lvlia.net";

async function isAdmin(): Promise<boolean> {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;
  if (user.email === ADMIN_EMAIL) return true;
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  return !!profile && (profile as { role?: string }).role === "admin";
}

type FetchResult = {
  key: SourceKey;
  candidates: RawCandidate[];
  error?: string;
};

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const startedAt = Date.now();

  const [dilaSettled, legifrssSettled] = await Promise.allSettled([
    dilaJorfSource.fetch(),
    legifrssSource.fetch(),
  ]);

  const dila: FetchResult = {
    key: "dila_jorf",
    candidates:
      dilaSettled.status === "fulfilled" ? dilaSettled.value : [],
    error:
      dilaSettled.status === "rejected"
        ? dilaSettled.reason instanceof Error
          ? dilaSettled.reason.message
          : String(dilaSettled.reason)
        : undefined,
  };
  const legifrss: FetchResult = {
    key: "legifrss",
    candidates:
      legifrssSettled.status === "fulfilled" ? legifrssSettled.value : [],
    error:
      legifrssSettled.status === "rejected"
        ? legifrssSettled.reason instanceof Error
          ? legifrssSettled.reason.message
          : String(legifrssSettled.reason)
        : undefined,
  };

  const tagged: ({ source: SourceKey } & RawCandidate)[] = [
    ...dila.candidates.map((c) => ({ source: "dila_jorf" as SourceKey, ...c })),
    ...legifrss.candidates.map((c) => ({ source: "legifrss" as SourceKey, ...c })),
  ];
  const deduped = dedupeCandidates(tagged);

  // Match all deduped candidates.
  const scored = deduped.map((c) => {
    const { source, ...candidate } = c;
    const m = matchCandidate(candidate);
    return {
      source,
      title: candidate.title,
      url: candidate.source_url,
      publication_date: candidate.publication_date,
      score: m.score,
      matched: m.matched,
    };
  });

  const relevant = scored.filter((s) => s.score >= MIN_RELEVANCE_SCORE);
  const rejected = scored.filter((s) => s.score < MIN_RELEVANCE_SCORE);

  const top10 = [...relevant]
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
    .map((s) => ({
      source: s.source,
      title: s.title,
      url: s.url,
      publication_date: s.publication_date,
      score: s.score,
      matched: s.matched,
    }));

  const rejectedExamples = rejected
    .filter((s) => s.title)
    .slice(0, 10)
    .map((s) => ({
      source: s.source,
      title: s.title,
      score: s.score,
      matched: s.matched,
    }));

  return NextResponse.json({
    ok: true,
    duration_ms: Date.now() - startedAt,
    counts: {
      dila_jorf: dila.candidates.length,
      legifrss: legifrss.candidates.length,
      after_dedup: deduped.length,
      relevant: relevant.length,
      rejected: rejected.length,
    },
    errors: {
      dila_jorf: dila.error || null,
      legifrss: legifrss.error || null,
    },
    min_relevance_score: MIN_RELEVANCE_SCORE,
    top10_score: top10,
    rejected_examples: rejectedExamples,
  });
}
