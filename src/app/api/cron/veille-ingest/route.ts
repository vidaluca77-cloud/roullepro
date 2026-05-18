/**
 * Endpoint d'ingestion automatique de la veille reglementaire (Phase 6 V1).
 *
 * - Protege par Authorization: Bearer ${CRON_SECRET}
 * - Lance toutes les sources enregistrees (V1 : dila_jorf uniquement)
 * - Pour chaque candidat pertinent (score >= MIN_RELEVANCE_SCORE), upsert dans
 *   reg_alerts_candidates avec ON CONFLICT (source, source_url) DO NOTHING.
 * - Trace l'execution dans reg_ingestion_runs.
 *
 * Query :
 *   - dry_run=1 : ne persiste rien, retourne juste les stats
 *   - source=<key> : limite a une source precise
 */

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { dilaJorfSource } from "@/lib/veille/sources/dila-jorf";
import { legifrancePisteSource } from "@/lib/veille/sources/legifrance-piste";
import { matchCandidate, MIN_RELEVANCE_SCORE } from "@/lib/veille/matcher";
import type { IngestionSource, RawCandidate } from "@/lib/veille/sources/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const ALL_SOURCES: IngestionSource[] = [
  dilaJorfSource,
  legifrancePisteSource,
];

type SourceStats = {
  fetched: number;
  matched: number;
  inserted: number;
  duplicates: number;
  errors: number;
  error_message?: string;
};

/* eslint-disable @typescript-eslint/no-explicit-any */
async function processSource(
  supabase: any,
  source: IngestionSource,
  dryRun: boolean
): Promise<SourceStats> {
  const stats: SourceStats = {
    fetched: 0,
    matched: 0,
    inserted: 0,
    duplicates: 0,
    errors: 0,
  };

  let candidates: RawCandidate[] = [];
  try {
    candidates = await source.fetch();
  } catch (err) {
    stats.errors = 1;
    stats.error_message = err instanceof Error ? err.message : String(err);
    console.error(`[veille-ingest] ${source.key} fetch error:`, stats.error_message);
    return stats;
  }
  stats.fetched = candidates.length;

  const relevant: { candidate: RawCandidate; score: number; matched: string[] }[] = [];
  for (const c of candidates) {
    const { score, matched } = matchCandidate(c);
    if (score >= MIN_RELEVANCE_SCORE) {
      relevant.push({ candidate: c, score, matched });
    }
  }
  stats.matched = relevant.length;

  if (dryRun) return stats;

  for (const { candidate, score, matched } of relevant) {
    const payload = {
      source: source.key,
      source_url: candidate.source_url,
      source_identifier: candidate.source_identifier ?? null,
      title: candidate.title.slice(0, 500),
      summary: candidate.summary?.slice(0, 4000) ?? null,
      raw_content: candidate.raw_content as Record<string, unknown>,
      publication_date: candidate.publication_date ?? null,
      keywords_matched: matched,
      relevance_score: score,
      status: "pending",
    };
    const { error } = await (supabase
      .from("reg_alerts_candidates") as unknown as {
        insert: (
          v: typeof payload
        ) => Promise<{ error: { message?: string; code?: string } | null }>;
      })
      .insert(payload);

    if (!error) {
      stats.inserted += 1;
      continue;
    }
    // Conflit unique : doublon attendu.
    const msg = error.message || "";
    if (
      /duplicate key|unique constraint|already exists/i.test(msg) ||
      (error as { code?: string }).code === "23505"
    ) {
      stats.duplicates += 1;
    } else {
      stats.errors += 1;
      console.warn(
        `[veille-ingest] ${source.key} insert error:`,
        msg,
        "for",
        candidate.source_url
      );
    }
  }

  return stats;
}

async function handle(req: Request) {
  const authHeader = req.headers.get("authorization");
  const expected = process.env.CRON_SECRET;
  if (!expected || authHeader !== `Bearer ${expected}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const dryRun = url.searchParams.get("dry_run") === "1";
  const sourceFilter = url.searchParams.get("source")?.trim() || "";

  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!SUPABASE_URL || !SERVICE_ROLE) {
    return NextResponse.json(
      { error: "Supabase service role manquant" },
      { status: 503 }
    );
  }
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE, {
    auth: { persistSession: false },
  });

  const sources = sourceFilter
    ? ALL_SOURCES.filter((s) => s.key === sourceFilter)
    : ALL_SOURCES;

  if (sources.length === 0) {
    return NextResponse.json({ error: "Source inconnue" }, { status: 400 });
  }

  // Trace de l'execution.
  let runId: string | null = null;
  if (!dryRun) {
    const { data: run, error } = await supabase
      .from("reg_ingestion_runs")
      .insert({
        source: sourceFilter || "all",
        started_at: new Date().toISOString(),
        status: "running",
      })
      .select("id")
      .single();
    if (!error && run) runId = (run as { id: string }).id;
  }

  const startedAt = Date.now();
  const statsBySource: Record<string, SourceStats> = {};
  for (const src of sources) {
    statsBySource[src.key] = await processSource(supabase, src, dryRun);
  }

  // Agrege final.
  const totals = Object.values(statsBySource).reduce<{
    fetched: number;
    matched: number;
    inserted: number;
    duplicates: number;
    errors: number;
  }>(
    (acc, s) => ({
      fetched: acc.fetched + s.fetched,
      matched: acc.matched + s.matched,
      inserted: acc.inserted + s.inserted,
      duplicates: acc.duplicates + s.duplicates,
      errors: acc.errors + s.errors,
    }),
    { fetched: 0, matched: 0, inserted: 0, duplicates: 0, errors: 0 }
  );

  let status: "success" | "partial" | "failed" = "success";
  if (totals.errors > 0 && totals.inserted + totals.duplicates === 0) {
    status = "failed";
  } else if (totals.errors > 0) {
    status = "partial";
  }

  const durationMs = Date.now() - startedAt;
  console.log("[veille-ingest] done", {
    runId,
    dryRun,
    durationMs,
    status,
    totals,
    statsBySource,
  });

  if (runId && !dryRun) {
    const { error } = await supabase
      .from("reg_ingestion_runs")
      .update({
        finished_at: new Date().toISOString(),
        status,
        items_fetched: totals.fetched,
        items_matched: totals.matched,
        items_inserted: totals.inserted,
        items_duplicates: totals.duplicates,
        error_message:
          status === "failed"
            ? Object.values(statsBySource)
                .map((s) => s.error_message)
                .filter(Boolean)
                .join(" | ") || null
            : null,
        stats: statsBySource as Record<string, unknown>,
      })
      .eq("id", runId);
    if (error) {
      console.warn("[veille-ingest] update run error:", error.message);
    }
  }

  return NextResponse.json({
    ok: true,
    dry_run: dryRun,
    run_id: runId,
    status,
    duration_ms: durationMs,
    totals,
    stats: statsBySource,
  });
}

export async function GET(req: Request) {
  return handle(req);
}

export async function POST(req: Request) {
  return handle(req);
}
