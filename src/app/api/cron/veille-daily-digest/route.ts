/**
 * GET /api/cron/veille-daily-digest
 * Cron quotidien J+1 — envoi d'un digest admin des nouveaux candidats veille.
 *
 * Logique :
 *   - Compte les reg_alerts_candidates avec status='pending' détectés dans les
 *     dernières 24h (colonne detected_at).
 *   - Si 0 nouveauté : ne fait rien (silencieux).
 *   - Si >= 1 : envoie un email récap à contact@roullepro.com avec liste
 *     (titre, source, score, lien admin) pour permettre une validation rapide.
 *
 * Protection : Authorization: Bearer ${CRON_SECRET}
 *
 * SCHEDULER :
 *   Ce cron doit être déclenché quotidiennement par un scheduler externe.
 *   Il NE dépend PAS de Supabase pg_cron.
 *   Options recommandées (à configurer côté Lucas) :
 *     - Netlify Scheduled Functions : toutes les 24h (08:00 Paris)
 *     - Perplexity schedule_cron : fréquence daily
 *   Commande curl type :
 *     curl -X GET https://www.roullepro.com/api/cron/veille-daily-digest \
 *       -H "Authorization: Bearer $CRON_SECRET"
 */

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendEmail } from "@/lib/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const DIGEST_TO = "contact@roullepro.com";
const ADMIN_URL =
  process.env.NEXT_PUBLIC_APP_URL || "https://www.roullepro.com";

type CandidateRow = {
  id: string;
  source: string;
  source_url: string;
  title: string;
  summary: string | null;
  relevance_score: number | null;
  detected_at: string;
  keywords_matched: string[] | null;
};

function formatFrDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Paris",
  });
}

function scoreLabel(score: number | null): string {
  if (score === null) return "—";
  if (score >= 20) return `${score} (fort)`;
  if (score >= 10) return `${score} (moyen)`;
  return `${score} (faible)`;
}

function buildDigestHtml(candidates: CandidateRow[], date: string): string {
  const rows = candidates
    .map(
      (c) => `
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 10px 12px; vertical-align: top;">
            <p style="margin: 0 0 4px 0; font-weight: 600; color: #1e293b; font-size: 14px;">
              ${c.title.slice(0, 120)}${c.title.length > 120 ? "…" : ""}
            </p>
            ${c.summary ? `<p style="margin: 0 0 4px 0; color: #64748b; font-size: 12px;">${c.summary.slice(0, 200)}${c.summary.length > 200 ? "…" : ""}</p>` : ""}
            <a href="${c.source_url}" style="color: #2563eb; font-size: 11px;" target="_blank">${c.source_url.slice(0, 80)}</a>
          </td>
          <td style="padding: 10px 12px; vertical-align: top; white-space: nowrap; font-size: 12px; color: #475569;">
            ${c.source}
          </td>
          <td style="padding: 10px 12px; vertical-align: top; white-space: nowrap; font-size: 12px; color: #475569;">
            ${scoreLabel(c.relevance_score)}
          </td>
          <td style="padding: 10px 12px; vertical-align: top;">
            <a
              href="${ADMIN_URL}/admin/veille/candidats"
              style="display: inline-block; background: #2563eb; color: white; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 600; text-decoration: none;"
            >
              Valider
            </a>
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
      <p style="color: white; font-weight: 600; margin: 12px 0 0; font-size: 16px;">Veille J+1 — ${date}</p>
    </div>

    <div style="padding: 28px 32px;">
      <p style="color: #1e293b; font-size: 15px; margin: 0 0 20px 0;">
        <strong>${candidates.length} nouveau${candidates.length > 1 ? "x candidats" : " candidat"}</strong>
        détecté${candidates.length > 1 ? "s" : ""} dans les dernières 24h — à valider ou ignorer.
      </p>

      <table style="width: 100%; border-collapse: collapse; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
        <thead>
          <tr style="background: #f8fafc;">
            <th style="padding: 8px 12px; text-align: left; font-size: 11px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em;">Titre</th>
            <th style="padding: 8px 12px; text-align: left; font-size: 11px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em;">Source</th>
            <th style="padding: 8px 12px; text-align: left; font-size: 11px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em;">Score</th>
            <th style="padding: 8px 12px; text-align: left; font-size: 11px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em;">Action</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>

      <div style="margin: 24px 0 0; text-align: center;">
        <a
          href="${ADMIN_URL}/admin/veille/candidats"
          style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; border-radius: 8px; font-weight: 700; font-size: 14px; text-decoration: none;"
        >
          Ouvrir le tableau de bord veille
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

  // Fenetre 24h glissante.
  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from("reg_alerts_candidates")
    .select(
      "id, source, source_url, title, summary, relevance_score, detected_at, keywords_matched"
    )
    .eq("status", "pending")
    .gte("detected_at", since24h)
    .order("relevance_score", { ascending: false })
    .limit(50);

  if (error) {
    console.error("[veille-daily-digest] select error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const candidates = (data || []) as CandidateRow[];

  if (candidates.length === 0) {
    console.log("[veille-daily-digest] 0 nouveaute, email non envoye.");
    return NextResponse.json({ ok: true, sent: false, count: 0 });
  }

  const today = formatFrDate(new Date().toISOString());
  const html = buildDigestHtml(candidates, today);

  const result = await sendEmail({
    to: DIGEST_TO,
    subject: `Veille J+1 — ${today} (${candidates.length} candidat${candidates.length > 1 ? "s" : ""})`,
    html,
  });

  console.log("[veille-daily-digest] email envoye", {
    to: DIGEST_TO,
    count: candidates.length,
    resendId: result?.id ?? null,
  });

  return NextResponse.json({
    ok: true,
    sent: true,
    count: candidates.length,
    resend_id: result?.id ?? null,
  });
}

export async function GET(req: Request) {
  return handle(req);
}

export async function POST(req: Request) {
  return handle(req);
}
