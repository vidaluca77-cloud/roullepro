/**
 * GET /api/cron/veille-weekly
 * Cron hebdomadaire (mardi 6h UTC = 8h Paris ete / 7h Paris hiver).
 * Envoi segmente par metier de la newsletter veille reglementaire.
 *
 * Query :
 *   - dry_run=1 : execute la logique sans envoyer les emails
 *   - force_email=<email> : si present, envoie uniquement a cet email (mode test)
 *
 * Protection : Authorization: Bearer ${CRON_SECRET}
 */

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import {
  VEILLE_FROM_EMAIL,
  buildVeilleWeeklyHtml,
  type WeeklyAlertSummary,
} from "@/lib/veille-email-templates";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://roullepro.com";

type AlertRow = {
  id: string;
  slug: string;
  title_short: string;
  summary_oneliner: string;
  metiers: string[] | null;
  urgency: "critical" | "high" | "medium" | "info";
  applicable_from: string | null;
  deadline: string | null;
  published_at: string | null;
};

type SubscriberRow = {
  id: string;
  email: string;
  metiers_segments: string[] | null;
  unsubscribe_token: string | null;
};

const URGENCY_RANK: Record<AlertRow["urgency"], number> = {
  critical: 0,
  high: 1,
  medium: 2,
  info: 3,
};

function sortAlerts(rows: AlertRow[]): AlertRow[] {
  return [...rows].sort((a, b) => {
    const u = URGENCY_RANK[a.urgency] - URGENCY_RANK[b.urgency];
    if (u !== 0) return u;
    const da = a.published_at ? Date.parse(a.published_at) : 0;
    const db = b.published_at ? Date.parse(b.published_at) : 0;
    return db - da;
  });
}

function pickMaxUrgency(alertes: AlertRow[]): AlertRow["urgency"] {
  let best: AlertRow["urgency"] = "info";
  for (const a of alertes) {
    if (URGENCY_RANK[a.urgency] < URGENCY_RANK[best]) best = a.urgency;
  }
  return best;
}

function subjectFor(urgency: AlertRow["urgency"]): string {
  switch (urgency) {
    case "critical":
      return "🚨 Veille transport sanitaire — Alerte critique cette semaine";
    case "high":
      return "⚠️ Veille transport sanitaire — Mises à jour importantes";
    default:
      return "Veille transport sanitaire — Récap de la semaine";
  }
}

function toSummary(a: AlertRow): WeeklyAlertSummary {
  return {
    slug: a.slug,
    title_short: a.title_short,
    summary_oneliner: a.summary_oneliner,
    urgency: a.urgency,
    applicable_from: a.applicable_from,
  };
}

async function sleep(ms: number) {
  await new Promise((r) => setTimeout(r, ms));
}

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  const expectedToken = process.env.CRON_SECRET;
  if (!expectedToken || authHeader !== `Bearer ${expectedToken}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const dryRun = url.searchParams.get("dry_run") === "1";
  const forceEmail = url.searchParams.get("force_email")?.trim().toLowerCase() || "";

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

  // 1. Selection des alertes nouvelles de la semaine (8 jours pour marge).
  const sinceIso = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString();
  const todayIso = new Date().toISOString().slice(0, 10);

  let mode: "weekly" | "weekly_fallback" = "weekly";

  const { data: freshRows, error: freshError } = await supabase
    .from("reg_alerts")
    .select(
      "id, slug, title_short, summary_oneliner, metiers, urgency, applicable_from, deadline, published_at"
    )
    .eq("status", "published")
    .gte("published_at", sinceIso)
    .limit(10);

  if (freshError) {
    console.error("[veille-weekly] fresh alerts error:", freshError.message);
    return NextResponse.json(
      { error: "Lecture alertes échouée" },
      { status: 500 }
    );
  }

  let alertes: AlertRow[] = sortAlerts((freshRows || []) as AlertRow[]);

  if (alertes.length === 0) {
    mode = "weekly_fallback";
    const { data: fallbackRows, error: fbError } = await supabase
      .from("reg_alerts")
      .select(
        "id, slug, title_short, summary_oneliner, metiers, urgency, applicable_from, deadline, published_at"
      )
      .eq("status", "published")
      .in("urgency", ["critical", "high"])
      .lte("applicable_from", todayIso)
      .limit(20);

    if (fbError) {
      console.error("[veille-weekly] fallback alerts error:", fbError.message);
    }

    const filtered = ((fallbackRows || []) as AlertRow[]).filter(
      (a) => !a.deadline || a.deadline >= todayIso
    );
    alertes = sortAlerts(filtered).slice(0, 3);
  }

  // 2. Selection des abonnes actifs.
  let subscribersQuery = supabase
    .from("newsletter_subscribers")
    .select("id, email, metiers_segments, unsubscribe_token")
    .eq("reg_newsletter_optin", true)
    .is("unsubscribed_at", null);

  if (forceEmail) {
    subscribersQuery = subscribersQuery.eq("email", forceEmail);
  }

  const { data: subsRows, error: subsError } = await subscribersQuery;
  if (subsError) {
    console.error("[veille-weekly] subscribers error:", subsError.message);
    return NextResponse.json(
      { error: "Lecture abonnés échouée" },
      { status: 500 }
    );
  }

  const subscribers = (subsRows || []) as SubscriberRow[];

  // 3. Construire le job d'envoi : filtrer alertes par metier de chaque abonne.
  type Job = {
    subscriber: SubscriberRow;
    relevantAlertes: AlertRow[];
  };
  const jobs: Job[] = [];

  for (const sub of subscribers) {
    const metiers = (sub.metiers_segments || []).filter(Boolean);
    if (metiers.length === 0) continue;
    const relevant = alertes.filter((a) =>
      (a.metiers || []).some((m) => metiers.includes(m))
    );
    if (relevant.length === 0) continue;
    jobs.push({ subscriber: sub, relevantAlertes: relevant });
  }

  const resendKey = process.env.RESEND_API_KEY;
  const resend = resendKey ? new Resend(resendKey) : null;

  let sentCount = 0;
  let failedCount = 0;
  const skippedCount = subscribers.length - jobs.length;

  // 4. Envois par batches de 10 + 500ms entre batches.
  const BATCH = 10;
  for (let i = 0; i < jobs.length; i += BATCH) {
    const batch = jobs.slice(i, i + BATCH);

    await Promise.all(
      batch.map(async (job) => {
        const { subscriber, relevantAlertes } = job;
        const unsubscribeUrl = `${APP_URL}/api/veille/unsubscribe?token=${subscriber.unsubscribe_token || ""}`;
        const maxUrgency = pickMaxUrgency(relevantAlertes);
        const subject = subjectFor(maxUrgency);
        const html = buildVeilleWeeklyHtml({
          alertes: relevantAlertes.map(toSummary),
          metiers: subscriber.metiers_segments || [],
          unsubscribeUrl,
          appUrl: APP_URL,
          mode,
        });

        if (dryRun) {
          sentCount += 1;
          return;
        }

        if (!resend) {
          console.warn("[veille-weekly] RESEND_API_KEY manquant");
          failedCount += 1;
          return;
        }

        try {
          await resend.emails.send({
            from: VEILLE_FROM_EMAIL,
            to: subscriber.email,
            subject,
            html,
            headers: {
              "List-Unsubscribe": `<${unsubscribeUrl}>, <mailto:unsubscribe@roullepro.com>`,
              "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
            },
          });
          sentCount += 1;
        } catch (err) {
          failedCount += 1;
          console.warn(
            `[veille-weekly] send failed for ${subscriber.email}:`,
            err
          );
        }
      })
    );

    if (i + BATCH < jobs.length) {
      await sleep(500);
    }
  }

  // 5. Log de l'execution.
  const stats = {
    sent_count: sentCount,
    skipped_count: skippedCount,
    failed_count: failedCount,
    alerts_count: alertes.length,
    subscribers_count: subscribers.length,
    mode,
    dry_run: dryRun,
    force_email: forceEmail || null,
  };

  if (!dryRun) {
    try {
      const { error: logError } = await supabase
        .from("reg_newsletter_sends")
        .insert({
          mode,
          stats,
          sent_at: new Date().toISOString(),
        });
      if (logError) {
        console.warn("[veille-weekly] log insert error:", logError.message);
      }
    } catch (err) {
      console.warn("[veille-weekly] log exception:", err);
    }
  }

  return NextResponse.json({ ok: true, ...stats });
}
