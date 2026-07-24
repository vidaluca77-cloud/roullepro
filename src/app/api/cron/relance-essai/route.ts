/**
 * GET|POST /api/cron/relance-essai
 *
 * Relances automatiques de fin d'essai / d'offre gratuite des pros sanitaire « claimed ».
 * Fenêtres J-7 / J-3 / J-1 avant l'échéance COALESCE(free_trial_ends_at, plan_active_until, plan_expires_at),
 * comparaison par date calendaire Europe/Paris (cf. src/lib/relance-essai.ts).
 *
 * Deux tons d'email (src/lib/email-templates/sanitaire/relance-essai.ts) :
 *   - carte enregistrée (stripe_subscription_id) → « informatif » : bascule Pro automatique.
 *   - sinon                                       → « conversion » : inviter à passer au plan Pro.
 *
 * Idempotence : table relances_essai avec UNIQUE (pro_id, echeance_date, type_relance).
 * On n'envoie l'email que si aucune ligne n'existe déjà pour ce triplet, puis on trace
 * l'envoi (sent_at, resend_id). Best-effort : un échec d'email n'interrompt pas les autres.
 *
 * Sécurité : Authorization: Bearer ${CRON_SECRET}.
 * Planification : Netlify Scheduled Function relance-essai, quotidien 07:30 UTC (netlify.toml).
 */

import { NextResponse } from "next/server";
import { getAdminServiceClient } from "@/lib/admin-guard";
import { sendEmail } from "@/lib/email";
import { renderRelanceEssai } from "@/lib/email-templates/sanitaire";
import {
  selectionnerRelance,
  choisirVariante,
  calculerEcheance,
  type ProRelance,
} from "@/lib/relance-essai";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://www.roullepro.com";
const DASHBOARD_URL = `${APP_URL}/transport-medical/pro/dashboard`;
const UPGRADE_URL = `${APP_URL}/transport-medical/tarifs`;

const MAX_EMAILS_PER_RUN = 200;

type ProRow = ProRelance & {
  raison_sociale: string | null;
  nom_commercial: string | null;
  email_public: string | null;
  ville: string | null;
};

function nomAffiche(p: ProRow): string {
  return (p.nom_commercial?.trim() || p.raison_sociale?.trim() || "RoullePro").slice(0, 80);
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

  // Fenêtre large côté SQL (échéance entre aujourd'hui et +8 jours sur l'une DES trois
  // colonnes) ; le filtrage calendaire fin J-7/J-3/J-1 est fait en JS par selectionnerRelance.
  // Le 3e terme cible les essais auto 7 jours qui n'ont QUE plan_expires_at renseigné
  // (free_trial_ends_at et plan_active_until NULL) — cf. sanitaire-auto-trial.ts.
  const bornInf = now.toISOString();
  const bornSup = new Date(now.getTime() + 8 * 86_400_000).toISOString();

  const { data: pros, error } = await admin
    .from("pros_sanitaire")
    .select(
      "id,claimed,raison_sociale,nom_commercial,email_public,ville,free_trial_ends_at,plan_active_until,plan_expires_at,stripe_subscription_id",
    )
    .eq("claimed", true)
    .not("email_public", "is", null)
    .or(
      `and(free_trial_ends_at.gte.${bornInf},free_trial_ends_at.lte.${bornSup}),` +
        `and(free_trial_ends_at.is.null,plan_active_until.gte.${bornInf},plan_active_until.lte.${bornSup}),` +
        `and(free_trial_ends_at.is.null,plan_active_until.is.null,plan_expires_at.gte.${bornInf},plan_expires_at.lte.${bornSup})`,
    )
    .limit(1000);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = (pros as ProRow[] | null) || [];
  const stats = {
    scanned: rows.length,
    sent: 0,
    sent_j7: 0,
    sent_j3: 0,
    sent_j1: 0,
    skipped_deja_envoye: 0,
    skipped_no_email: 0,
    hors_fenetre: 0,
    errors: 0,
  };

  let budget = MAX_EMAILS_PER_RUN;
  const errorsLog: Array<{ pro_id: string; type?: string; error: string }> = [];

  for (const pro of rows) {
    if (budget <= 0) break;
    if (!pro.email_public) {
      stats.skipped_no_email += 1;
      continue;
    }

    const selection = selectionnerRelance({ pro, now });
    if (!selection) {
      stats.hors_fenetre += 1;
      continue;
    }

    // ─── Idempotence : ne pas renvoyer la même relance ───
    try {
      const { data: existant } = await admin
        .from("relances_essai")
        .select("id")
        .eq("pro_id", pro.id)
        .eq("echeance_date", selection.echeanceDate)
        .eq("type_relance", selection.type)
        .maybeSingle();
      if (existant) {
        stats.skipped_deja_envoye += 1;
        continue;
      }
    } catch (e) {
      stats.errors += 1;
      errorsLog.push({
        pro_id: pro.id,
        type: selection.type,
        error: `lecture idempotence: ${e instanceof Error ? e.message : String(e)}`,
      });
      continue;
    }

    // ─── Envoi de l'email (best-effort) ───
    const variante = choisirVariante(pro);
    const echeanceIso = calculerEcheance(pro)!;
    try {
      const tpl = renderRelanceEssai({
        variante,
        type: selection.type,
        nomAffiche: nomAffiche(pro),
        ville: pro.ville,
        echeanceIso,
        ctaUrl: variante === "informatif" ? DASHBOARD_URL : UPGRADE_URL,
        dashboardUrl: DASHBOARD_URL,
      });

      const res = await sendEmail({
        to: pro.email_public,
        subject: tpl.subject,
        html: tpl.html,
        text: tpl.text,
        tags: [
          { name: "category", value: "relance_essai" },
          { name: "step", value: selection.type.toLowerCase() },
          { name: "variante", value: variante },
        ],
      });

      // Trace de l'envoi (garantit l'idempotence via la contrainte UNIQUE).
      const { error: insertErr } = await admin.from("relances_essai").insert({
        pro_id: pro.id,
        echeance_date: selection.echeanceDate,
        type_relance: selection.type,
        sent_at: new Date().toISOString(),
        resend_id: res?.id ?? null,
      });
      if (insertErr) {
        // Conflit UNIQUE = déjà tracé par un run concurrent : on ne compte pas d'erreur.
        errorsLog.push({
          pro_id: pro.id,
          type: selection.type,
          error: `insert trace: ${insertErr.message}`,
        });
      }

      stats.sent += 1;
      if (selection.type === "J7") stats.sent_j7 += 1;
      else if (selection.type === "J3") stats.sent_j3 += 1;
      else stats.sent_j1 += 1;
      budget -= 1;
    } catch (e) {
      stats.errors += 1;
      errorsLog.push({
        pro_id: pro.id,
        type: selection.type,
        error: e instanceof Error ? e.message : String(e),
      });
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
