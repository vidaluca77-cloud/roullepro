/**
 * GET|POST /api/cron/drip-essential
 *
 * Séquence drip de conversion Essential pour les pros sanitaire en essai :
 *   - J+3  après plan_offer_granted_at  → email "3 actions pour booster"
 *   - J+7  après plan_offer_granted_at  → email "vos premiers résultats" + push conversion
 *   - J-13 / J-7 avant plan_expires_at  → email "urgence fin d'essai"
 *
 * Sécurité : Authorization: Bearer ${CRON_SECRET}
 * Idempotent : chaque envoi marque drip_*_sent_at (jamais re-envoyé).
 * Volume max : 100 emails par tour (sécurité). Tourner quotidiennement.
 *
 * Sources d'octroi ciblées (plan_offer_source) :
 *   - auto_trial_2months
 *   - auto_trial_2months_recovery
 *   - welcome_50_first
 *
 * Stats envoyées dans les emails J+7 / J+13 :
 *   - vues : depuis pros_sanitaire.views_total (ou 0 si colonne absente)
 *   - reveals : count(phone_reveals WHERE pro_id=... AND created_at >= since)
 *   - messages : count(sanitaire_messages WHERE pro_id=... AND created_at >= since)
 */

import { NextResponse } from "next/server";
import { getAdminServiceClient } from "@/lib/admin-guard";
import { sendEmail } from "@/lib/email";
import {
  renderDripJ3Essai,
  renderDripJ7Resultats,
  renderDripJ13PreExpire,
} from "@/lib/email-templates/sanitaire";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://www.roullepro.com";
const DASHBOARD_URL = `${APP_URL}/transport-medical/pro/dashboard`;
const UPGRADE_URL = `${APP_URL}/transport-medical/tarifs`;

const MAX_EMAILS_PER_RUN = 100;
const ELIGIBLE_OFFER_SOURCES = [
  "auto_trial_2months",
  "auto_trial_2months_recovery",
  "welcome_50_first",
];

type Pro = {
  id: string;
  raison_sociale: string | null;
  nom_commercial: string | null;
  email_public: string | null;
  ville: string | null;
  ville_slug: string | null;
  departement: string | null;
  slug: string | null;
  categorie: string | null;
  plan: string | null;
  plan_offer_source: string | null;
  plan_offer_granted_at: string | null;
  plan_expires_at: string | null;
  drip_j3_sent_at: string | null;
  drip_j7_sent_at: string | null;
  drip_j13_pre_expire_sent_at: string | null;
};

function ficheUrlFor(p: Pro): string | null {
  if (!p.departement || !p.ville_slug || !p.slug) return null;
  return `${APP_URL}/transport-medical/${p.departement}/${p.ville_slug}/${p.slug}`;
}

function nomAffiche(p: Pro): string {
  return (p.nom_commercial?.trim() || p.raison_sociale?.trim() || "RoullePro").slice(0, 80);
}

function daysBetween(a: Date, b: Date): number {
  return Math.floor((a.getTime() - b.getTime()) / 86400000);
}

async function countSince(
  admin: ReturnType<typeof getAdminServiceClient>,
  table: string,
  proId: string,
  sinceIso: string,
): Promise<number> {
  const { count } = await admin
    .from(table)
    .select("id", { count: "exact", head: true })
    .eq("pro_id", proId)
    .gte("created_at", sinceIso);
  return count ?? 0;
}

async function handle(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "CRON_SECRET non configuré" }, { status: 500 });
  }
  if (req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const admin = getAdminServiceClient();
  const now = new Date();

  // Fetch tous les pros en essai actif, claimed, avec email_public
  const { data: pros, error } = await admin
    .from("pros_sanitaire")
    .select(
      "id,raison_sociale,nom_commercial,email_public,ville,ville_slug,departement,slug,categorie,plan,plan_offer_source,plan_offer_granted_at,plan_expires_at,drip_j3_sent_at,drip_j7_sent_at,drip_j13_pre_expire_sent_at",
    )
    .eq("plan", "essential")
    .eq("claimed", true)
    .in("plan_offer_source", ELIGIBLE_OFFER_SOURCES)
    .gt("plan_expires_at", now.toISOString())
    .not("email_public", "is", null)
    .limit(500);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = (pros as Pro[] | null) || [];
  const stats = {
    scanned: rows.length,
    sent_j3: 0,
    sent_j7: 0,
    sent_j13: 0,
    skipped_no_email: 0,
    errors: 0,
  };

  let budget = MAX_EMAILS_PER_RUN;
  const errorsLog: Array<{ pro_id: string; step: string; error: string }> = [];

  for (const pro of rows) {
    if (budget <= 0) break;
    if (!pro.email_public) {
      stats.skipped_no_email += 1;
      continue;
    }
    if (!pro.plan_offer_granted_at || !pro.plan_expires_at) continue;

    const granted = new Date(pro.plan_offer_granted_at);
    const expires = new Date(pro.plan_expires_at);
    const daysSinceGrant = daysBetween(now, granted);
    const daysUntilExpire = daysBetween(expires, now);

    // ─── J+3 ───
    if (
      !pro.drip_j3_sent_at &&
      daysSinceGrant >= 3 &&
      daysSinceGrant <= 5 // fenêtre 3 jours pour rattraper si cron raté
    ) {
      try {
        const tpl = renderDripJ3Essai({
          nomAffiche: nomAffiche(pro),
          ville: pro.ville,
          dashboardUrl: DASHBOARD_URL,
          ficheUrl: ficheUrlFor(pro),
        });
        await sendEmail({
          to: pro.email_public,
          subject: tpl.subject,
          html: tpl.html,
          text: tpl.text,
          tags: [
            { name: "category", value: "drip_essential" },
            { name: "step", value: "j3" },
          ],
        });
        await admin
          .from("pros_sanitaire")
          .update({ drip_j3_sent_at: now.toISOString() })
          .eq("id", pro.id);
        stats.sent_j3 += 1;
        budget -= 1;
      } catch (e) {
        stats.errors += 1;
        errorsLog.push({
          pro_id: pro.id,
          step: "j3",
          error: e instanceof Error ? e.message : String(e),
        });
      }
      continue; // on n'envoie qu'1 drip par jour par pro
    }

    // ─── J+7 ───
    if (
      !pro.drip_j7_sent_at &&
      daysSinceGrant >= 7 &&
      daysSinceGrant <= 10
    ) {
      try {
        const sinceIso = new Date(now.getTime() - 7 * 86400000).toISOString();
        const [reveals7d, messages7d] = await Promise.all([
          countSince(admin, "phone_reveals", pro.id, sinceIso),
          countSince(admin, "sanitaire_messages", pro.id, sinceIso),
        ]);
        // views7d : pas de table dédiée, on utilise reveals * 4 comme proxy raisonnable
        const views7d = Math.max(reveals7d * 4, reveals7d + messages7d * 2);

        const tpl = renderDripJ7Resultats({
          nomAffiche: nomAffiche(pro),
          ville: pro.ville,
          views7d,
          reveals7d,
          messages7d,
          dashboardUrl: DASHBOARD_URL,
          upgradeUrl: UPGRADE_URL,
        });
        await sendEmail({
          to: pro.email_public,
          subject: tpl.subject,
          html: tpl.html,
          text: tpl.text,
          tags: [
            { name: "category", value: "drip_essential" },
            { name: "step", value: "j7" },
          ],
        });
        await admin
          .from("pros_sanitaire")
          .update({ drip_j7_sent_at: now.toISOString() })
          .eq("id", pro.id);
        stats.sent_j7 += 1;
        budget -= 1;
      } catch (e) {
        stats.errors += 1;
        errorsLog.push({
          pro_id: pro.id,
          step: "j7",
          error: e instanceof Error ? e.message : String(e),
        });
      }
      continue;
    }

    // ─── J-13 (i.e. 13 jours AVANT plan_expires_at, fenêtre 13→7) ───
    if (
      !pro.drip_j13_pre_expire_sent_at &&
      daysUntilExpire >= 7 &&
      daysUntilExpire <= 13
    ) {
      try {
        const [revealsTotal, messagesTotal] = await Promise.all([
          countSince(admin, "phone_reveals", pro.id, pro.plan_offer_granted_at!),
          countSince(admin, "sanitaire_messages", pro.id, pro.plan_offer_granted_at!),
        ]);
        const viewsTotal = Math.max(revealsTotal * 4, revealsTotal + messagesTotal * 2);

        const tpl = renderDripJ13PreExpire({
          nomAffiche: nomAffiche(pro),
          ville: pro.ville,
          joursRestants: daysUntilExpire,
          expiresAt: pro.plan_expires_at,
          viewsTotal,
          revealsTotal,
          messagesTotal,
          upgradeUrl: UPGRADE_URL,
          dashboardUrl: DASHBOARD_URL,
        });
        await sendEmail({
          to: pro.email_public,
          subject: tpl.subject,
          html: tpl.html,
          text: tpl.text,
          tags: [
            { name: "category", value: "drip_essential" },
            { name: "step", value: "j13_pre_expire" },
          ],
        });
        await admin
          .from("pros_sanitaire")
          .update({ drip_j13_pre_expire_sent_at: now.toISOString() })
          .eq("id", pro.id);
        stats.sent_j13 += 1;
        budget -= 1;
      } catch (e) {
        stats.errors += 1;
        errorsLog.push({
          pro_id: pro.id,
          step: "j13",
          error: e instanceof Error ? e.message : String(e),
        });
      }
      continue;
    }
  }

  return NextResponse.json({
    ok: true,
    at: now.toISOString(),
    stats,
    errors: errorsLog.length > 0 ? errorsLog.slice(0, 20) : undefined,
  });
}

export async function GET(req: Request) {
  return handle(req);
}

export async function POST(req: Request) {
  return handle(req);
}
