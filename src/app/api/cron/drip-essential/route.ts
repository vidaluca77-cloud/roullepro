/**
 * GET|POST /api/cron/drip-essential
 *
 * Séquence drip de conversion Essential pour les pros sanitaire en essai (7 jours) :
 *   - J+2  après plan_offer_granted_at  → email "bien démarrer" (fiche + experts IA + forum)
 *   - J+5  après plan_offer_granted_at  → email "votre essai se termine bientôt" + push conversion
 *
 * Le calendrier est calé sur l'essai 7 jours. Le rappel « fin d'essai » côté Stripe
 * (customer.subscription.trial_will_end, ~J-3) ne concerne QUE les pros ayant activé
 * un abonnement (carte enregistrée → stripe_subscription_id présent). Pour éviter un
 * doublon, l'email J+5 n'est envoyé qu'aux pros SANS stripe_subscription_id (essai
 * auto, sans carte) : eux seuls ne reçoivent pas l'email Stripe.
 *
 * Sécurité : Authorization: Bearer ${CRON_SECRET}
 * Idempotent : chaque envoi marque drip_*_sent_at (jamais re-envoyé).
 * Volume max : 100 emails par tour (sécurité). Tourner quotidiennement.
 *
 * Sources d'octroi ciblées (plan_offer_source, valeurs historiques en base) :
 *   - auto_trial_2months
 *   - auto_trial_2months_recovery
 *   - welcome_50_first
 *
 * Stats envoyées dans l'email J+5 :
 *   - reveals : count(phone_reveals WHERE pro_id=... AND created_at >= since)
 *   - messages : count(sanitaire_messages WHERE pro_id=... AND created_at >= since)
 *   - vues : proxy dérivé (pas de table dédiée)
 */

import { NextResponse } from "next/server";
import { getAdminServiceClient } from "@/lib/admin-guard";
import { sendEmail } from "@/lib/email";
import {
  renderDripJ2Demarrage,
  renderDripJ5FinEssai,
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
  stripe_subscription_id: string | null;
  // drip_j3_sent_at : réutilisé pour l'email J+2 « bien démarrer »
  drip_j3_sent_at: string | null;
  // drip_j7_sent_at : réutilisé pour l'email J+5 « fin d'essai bientôt »
  drip_j7_sent_at: string | null;
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
      "id,raison_sociale,nom_commercial,email_public,ville,ville_slug,departement,slug,categorie,plan,plan_offer_source,plan_offer_granted_at,plan_expires_at,stripe_subscription_id,drip_j3_sent_at,drip_j7_sent_at",
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
    sent_j2: 0,
    sent_j5: 0,
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

    // ─── J+2 « bien démarrer » (fiche + experts IA + forum) ───
    if (
      !pro.drip_j3_sent_at &&
      daysSinceGrant >= 2 &&
      daysSinceGrant <= 3 // fenêtre courte : l'essai ne dure que 7 jours
    ) {
      try {
        const tpl = renderDripJ2Demarrage({
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
            { name: "step", value: "j2" },
          ],
        });
        await admin
          .from("pros_sanitaire")
          .update({ drip_j3_sent_at: now.toISOString() })
          .eq("id", pro.id);
        stats.sent_j2 += 1;
        budget -= 1;
      } catch (e) {
        stats.errors += 1;
        errorsLog.push({
          pro_id: pro.id,
          step: "j2",
          error: e instanceof Error ? e.message : String(e),
        });
      }
      continue; // on n'envoie qu'1 drip par jour par pro
    }

    // ─── J+5 « votre essai se termine bientôt » ───
    // Uniquement pour les essais AUTO (sans carte) : les pros ayant activé un
    // abonnement Stripe reçoivent déjà le rappel Stripe trial_will_end (~J-3),
    // on évite ainsi un doublon quasi identique à 1 jour d'écart.
    if (
      !pro.drip_j7_sent_at &&
      !pro.stripe_subscription_id &&
      daysSinceGrant >= 5 &&
      daysSinceGrant <= 6
    ) {
      try {
        const sinceIso = pro.plan_offer_granted_at!;
        const [revealsTotal, messagesTotal] = await Promise.all([
          countSince(admin, "phone_reveals", pro.id, sinceIso),
          countSince(admin, "sanitaire_messages", pro.id, sinceIso),
        ]);
        // Pas de table de vues dédiée : proxy raisonnable dérivé des signaux.
        const viewsTotal = Math.max(revealsTotal * 4, revealsTotal + messagesTotal * 2);
        const joursRestants = Math.max(1, daysUntilExpire);

        const tpl = renderDripJ5FinEssai({
          nomAffiche: nomAffiche(pro),
          ville: pro.ville,
          joursRestants,
          expiresAt: pro.plan_expires_at,
          viewsTotal,
          revealsTotal,
          messagesTotal,
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
            { name: "step", value: "j5" },
          ],
        });
        await admin
          .from("pros_sanitaire")
          .update({ drip_j7_sent_at: now.toISOString() })
          .eq("id", pro.id);
        stats.sent_j5 += 1;
        budget -= 1;
      } catch (e) {
        stats.errors += 1;
        errorsLog.push({
          pro_id: pro.id,
          step: "j5",
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
