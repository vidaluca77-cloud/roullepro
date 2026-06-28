/**
 * GET /api/cron/veille-auto-publish
 * Cron d'auto-promotion en brouillon des candidats veille a haut score.
 *
 * Logique (strictement conservatrice — PAS de publication automatique) :
 *   - Recupere les reg_alerts_candidates avec relevance_score >= 0.85
 *     (seuil eleve : 85/100 dans l'echelle normalisee, ou >= 17 en absolu
 *     si le score est deja sur 20 \u2014 voir commentaire ci-dessous) qui ont
 *     status='pending' et n'ont pas encore ete promus.
 *   - Pour chacun, insere un reg_alerts avec status='draft' (brouillon).
 *   - Met a jour le reg_alerts_candidate avec status='promoted' + promoted_alert_id.
 *   - Note l'operation dans reg_ingestion_runs sous source='auto_publish'.
 *   - Envoie un email recapitulatif a contact@roullepro.com avec liens
 *     1-click pour publier depuis l'interface admin.
 *
 * NOTE EDITORIALE IMPORTANTE :
 *   Les brouillons crees ici ont status='draft'. Ils ne sont PAS visibles
 *   publiquement. Lucas doit valider et publier manuellement depuis
 *   /admin/veille/alertes. Aucune publication automatique en production.
 *
 * NOTE SCORE :
 *   Le score dans reg_alerts_candidates est un entier (points accumules).
 *   Le seuil de 0.85 est interprete comme >= MIN_AUTO_PUBLISH_SCORE = 17
 *   (sur une echelle ou 20 = score parfait). Si votre scoring est different,
 *   ajustez MIN_AUTO_PUBLISH_SCORE en consequence.
 *
 * SCHEDULER :
 *   A executer apres /api/cron/veille-ingest (decalage 15 min recommande).
 *   Options : Netlify Scheduled Functions, Perplexity schedule_cron.
 *
 * Protection : Authorization: Bearer ${CRON_SECRET}
 */

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import slugify from "slugify";
import { sendEmail } from "@/lib/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Seuil absolu de score pour auto-promotion en brouillon.
 * 17 sur ~20 = environ 85 % de pertinence.
 * A ajuster si l'echelle de scoring evolue.
 */
const MIN_AUTO_PUBLISH_SCORE = 17;

const DIGEST_TO = "contact@roullepro.com";
const ADMIN_URL =
  process.env.NEXT_PUBLIC_APP_URL || "https://www.roullepro.com";

type CandidateRow = {
  id: string;
  source: string;
  source_url: string;
  title: string;
  summary: string | null;
  relevance_score: number;
  detected_at: string;
  keywords_matched: string[] | null;
  publication_date: string | null;
};

type DraftResult = {
  candidateId: string;
  alertId: string | null;
  title: string;
  slug: string;
  error?: string;
};

function formatFrDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function buildRecapHtml(drafts: DraftResult[], date: string): string {
  const rows = drafts
    .map(
      (d) => `
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 10px 12px; vertical-align: top;">
            <p style="margin: 0 0 4px 0; font-weight: 600; color: #1e293b; font-size: 14px;">
              ${d.title.slice(0, 120)}${d.title.length > 120 ? "\u2026" : ""}
            </p>
            ${d.error ? `<p style="margin: 0; color: #dc2626; font-size: 12px;">Erreur : ${d.error}</p>` : `<p style="margin: 0; color: #16a34a; font-size: 12px;">Brouillon cree — slug : ${d.slug}</p>`}
          </td>
          <td style="padding: 10px 12px; vertical-align: top;">
            ${
              d.alertId && !d.error
                ? `<a href="${ADMIN_URL}/admin/veille/alertes" style="display: inline-block; background: #16a34a; color: white; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 600; text-decoration: none;">Publier</a>`
                : `<span style="color: #dc2626; font-size: 12px;">Echec</span>`
            }
          </td>
        </tr>`
    )
    .join("\n");

  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin: 0; padding: 0; background: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
  <div style="max-width: 700px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.08);">

    <div style="background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%); padding: 28px 32px;">
      <h1 style="color: white; margin: 0; font-size: 20px; font-weight: 700;">RoullePro</h1>
      <p style="color: rgba(255,255,255,0.75); margin: 4px 0 0; font-size: 13px;">Annuaire du transport sanitaire</p>
      <p style="color: white; font-weight: 600; margin: 12px 0 0; font-size: 16px;">Auto-publication veille — ${date}</p>
    </div>

    <div style="padding: 28px 32px;">
      <p style="color: #1e293b; font-size: 15px; margin: 0 0 8px 0;">
        <strong>${drafts.length} brouillon${drafts.length > 1 ? "s" : ""}</strong>
        cree${drafts.length > 1 ? "s" : ""} automatiquement (score >= ${MIN_AUTO_PUBLISH_SCORE}).
      </p>
      <p style="color: #475569; font-size: 13px; margin: 0 0 20px 0;">
        Ces alertes sont en statut <strong>brouillon</strong> — elles ne sont pas encore visibles publiquement.
        Cliquez sur "Publier" pour les mettre en ligne apres relecture.
      </p>

      <table style="width: 100%; border-collapse: collapse; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
        <thead>
          <tr style="background: #f8fafc;">
            <th style="padding: 8px 12px; text-align: left; font-size: 11px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em;">Titre / Statut</th>
            <th style="padding: 8px 12px; text-align: left; font-size: 11px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em;">Action</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>

      <div style="margin: 24px 0 0; text-align: center;">
        <a
          href="${ADMIN_URL}/admin/veille/alertes?status=draft"
          style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; border-radius: 8px; font-weight: 700; font-size: 14px; text-decoration: none;"
        >
          Voir tous les brouillons
        </a>
      </div>
    </div>

    <div style="padding: 20px 32px; border-top: 1px solid #f3f4f6;">
      <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
        RoullePro — Annuaire du transport sanitaire |
        <a href="${ADMIN_URL}" style="color: #6b7280;">roullepro.com</a>
      </p>
    </div>
  </div>
</body>
</html>`;
}

async function handle(req: Request) {
  const authHeader = req.headers.get("authorization");
  const expected = process.env.CRON_SECRET;
  if (!expected || authHeader !== `Bearer ${expected}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

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

  // Recupere les candidats eligibles a l'auto-promotion.
  const { data, error } = await supabase
    .from("reg_alerts_candidates")
    .select(
      "id, source, source_url, title, summary, relevance_score, detected_at, keywords_matched, publication_date"
    )
    .eq("status", "pending")
    .gte("relevance_score", MIN_AUTO_PUBLISH_SCORE)
    .order("relevance_score", { ascending: false })
    .limit(20);

  if (error) {
    console.error("[veille-auto-publish] select error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const candidates = (data || []) as CandidateRow[];

  if (candidates.length === 0) {
    console.log("[veille-auto-publish] 0 candidat eligible, rien a faire.");
    return NextResponse.json({ ok: true, promoted: 0 });
  }

  // Trace de l'operation dans reg_ingestion_runs.
  let runId: string | null = null;
  {
    const { data: run, error: runErr } = await supabase
      .from("reg_ingestion_runs")
      .insert({
        source: "auto_publish",
        started_at: new Date().toISOString(),
        status: "running",
      })
      .select("id")
      .single();
    if (!runErr && run) runId = (run as { id: string }).id;
  }

  const drafts: DraftResult[] = [];

  for (const c of candidates) {
    const rawSlug = slugify(c.title.slice(0, 80), { lower: true, strict: true });
    if (!rawSlug) {
      drafts.push({ candidateId: c.id, alertId: null, title: c.title, slug: "", error: "Slug vide" });
      continue;
    }

    // On suffixe le slug avec un timestamp court pour eviter les collisions.
    const ts = Date.now().toString(36).slice(-4);
    const finalSlug = `${rawSlug}-${ts}`;

    const payload = {
      slug: finalSlug,
      title_short: c.title.slice(0, 200),
      title_long: c.title,
      summary_oneliner: (c.summary || "").slice(0, 400),
      metiers: [] as string[],
      activites: [] as string[],
      regions: [] as string[],
      urgency: "medium",
      applicable_from: c.publication_date ?? null,
      deadline: null,
      what_changes: c.summary || "",
      who_is_concerned: "",
      concrete_actions: [] as string[],
      key_numbers: [] as Record<string, string>[],
      sources: [
        {
          label: c.source === "dila_jorf" ? "JORF" : c.source,
          url: c.source_url,
        },
      ],
      status: "draft",
      // Note : brouillon cree automatiquement, validation humaine requise.
    };

    const { data: created, error: insertErr } = await supabase
      .from("reg_alerts")
      .insert(payload)
      .select("id")
      .single();

    if (insertErr || !created) {
      const msg = insertErr?.message || "Insertion echouee";
      console.warn("[veille-auto-publish] insert error for", c.id, msg);
      drafts.push({ candidateId: c.id, alertId: null, title: c.title, slug: finalSlug, error: msg });
      continue;
    }

    const alertId = (created as { id: string }).id;

    // Marque le candidat comme promu.
    await supabase
      .from("reg_alerts_candidates")
      .update({
        status: "promoted",
        promoted_alert_id: alertId,
        promoted_at: new Date().toISOString(),
        promoted_by: null, // auto
      })
      .eq("id", c.id);

    drafts.push({ candidateId: c.id, alertId, title: c.title, slug: finalSlug });
  }

  const successCount = drafts.filter((d) => !d.error).length;
  const failCount = drafts.filter((d) => !!d.error).length;

  // Met a jour le run.
  if (runId) {
    await supabase
      .from("reg_ingestion_runs")
      .update({
        finished_at: new Date().toISOString(),
        status: failCount === drafts.length ? "failed" : failCount > 0 ? "partial" : "success",
        items_inserted: successCount,
        error_message: failCount > 0 ? `${failCount} echec(s)` : null,
        stats: { successCount, failCount } as Record<string, unknown>,
      })
      .eq("id", runId);
  }

  // Envoie le recap si au moins un brouillon a ete cree.
  if (successCount > 0) {
    const today = formatFrDate(new Date().toISOString());
    const html = buildRecapHtml(drafts, today);
    const result = await sendEmail({
      to: DIGEST_TO,
      subject: `Veille auto-publish — ${today} (${successCount} brouillon${successCount > 1 ? "s" : ""} cree${successCount > 1 ? "s" : ""})`,
      html,
    });
    console.log("[veille-auto-publish] recap email envoye", { resendId: result?.id ?? null });
  }

  console.log("[veille-auto-publish] done", { successCount, failCount, runId });

  return NextResponse.json({
    ok: true,
    promoted: successCount,
    failed: failCount,
    run_id: runId,
    drafts: drafts.map((d) => ({ title: d.title.slice(0, 80), slug: d.slug, alertId: d.alertId, error: d.error })),
  });
}

export async function GET(req: Request) {
  return handle(req);
}

export async function POST(req: Request) {
  return handle(req);
}
