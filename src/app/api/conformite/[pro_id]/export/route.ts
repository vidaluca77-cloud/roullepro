/**
 * GET /api/conformite/[pro_id]/export
 * Genere un PDF de rapport de conformite pour la fiche pro_id.
 *
 * - Auth obligatoire, ownership pros_sanitaire.claimed_by = user.id
 * - Plan payant requis (essential/premium/pro_plus)
 * - Profil de conformite requis
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  fetchMatchedAlerts,
  getProgressByAlert,
  getUpcomingDeadlines,
  computeComplianceScore,
  isPaidPlan,
  type ComplianceProfile,
} from "@/lib/compliance";
import {
  generateConformiteReportPDF,
  type ConformiteReportData,
} from "@/lib/pdf-conformite";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type RouteParams = { params: Promise<{ pro_id: string }> };

function slugSafe(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "fiche";
}

export async function GET(_req: Request, { params }: RouteParams) {
  const { pro_id: proId } = await params;
  if (!proId) {
    return NextResponse.json(
      { error: "pro_id manquant" },
      { status: 400 }
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "Authentification requise" },
      { status: 401 }
    );
  }

  const { data: ficheRow } = await supabase
    .from("pros_sanitaire")
    .select(
      "id, raison_sociale, nom_commercial, slug, categorie, ville, departement, plan, claimed_by"
    )
    .eq("id", proId)
    .maybeSingle();

  if (!ficheRow || ficheRow.claimed_by !== user.id) {
    return NextResponse.json({ error: "Fiche non autorisée" }, { status: 403 });
  }

  if (!isPaidPlan(ficheRow.plan as string | null)) {
    return NextResponse.json(
      { error: "Réservé aux abonnés Pro" },
      { status: 403 }
    );
  }

  const { data: profileRow } = await supabase
    .from("pro_compliance_profiles")
    .select("*")
    .eq("pro_id", proId)
    .maybeSingle();

  if (!profileRow) {
    return NextResponse.json(
      { error: "Profil de conformité non renseigné" },
      { status: 400 }
    );
  }
  const profile = profileRow as ComplianceProfile;

  const matched = await fetchMatchedAlerts(supabase, profile);
  const progress = await getProgressByAlert(supabase, proId);
  const deadlines = await getUpcomingDeadlines(supabase, profile);

  const score = computeComplianceScore(
    profile,
    matched.map((a) => ({ id: a.id, urgency: a.urgency })),
    progress
  );

  const reportData: ConformiteReportData = {
    pro: {
      raison_sociale: ficheRow.raison_sociale as string,
      nom_commercial: (ficheRow.nom_commercial as string) || null,
      ville: (ficheRow.ville as string) || null,
      departement: (ficheRow.departement as string) || null,
      categorie: (ficheRow.categorie as string) || null,
    },
    profile: {
      metiers: profile.metiers || [],
      activites: profile.activites || [],
      region_code: profile.region_code,
      fleet_size: profile.fleet_size,
      sefi_certified: profile.sefi_certified,
    },
    score,
    alerts: matched.map((a) => {
      const p = progress.get(a.id);
      return {
        title_short: a.title_short,
        urgency: a.urgency,
        applicable_from: a.applicable_from,
        deadline: a.deadline,
        checked: p?.checked ?? 0,
        total: p?.total ?? 0,
      };
    }),
    deadlines: deadlines.map((d) => ({
      label: d.label,
      due_date: d.due_date,
      alert_title: d.alert.title_short,
      kind: d.kind,
      status: d.status,
    })),
    generatedAt: new Date(),
  };

  let pdfBytes: Uint8Array;
  try {
    pdfBytes = await generateConformiteReportPDF(reportData);
  } catch (err) {
    console.error("[conformite-export] PDF gen error:", err);
    return NextResponse.json(
      { error: "Génération PDF échouée" },
      { status: 500 }
    );
  }

  const filename = `conformite-${slugSafe((ficheRow.slug as string) || (ficheRow.raison_sociale as string))}.pdf`;

  return new NextResponse(Buffer.from(pdfBytes), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "private, no-cache",
    },
  });
}
