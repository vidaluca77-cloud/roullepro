/**
 * GET|POST /api/cron/admin-recap-quotidien
 * Recapitulatif quotidien des demandes de transport des 24 dernieres heures,
 * envoye par email a l'admin. Protege par Authorization: Bearer CRON_SECRET.
 * Silencieux (pas d'email) s'il n'y a aucune demande sur la periode.
 */

import { NextResponse } from "next/server";
import { getAdminServiceClient } from "@/lib/admin-guard";
import { sendAdminRecapQuotidien } from "@/lib/email";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type DemandeRow = {
  id: string;
  nom: string | null;
  type_transport: string | null;
  departement_cible: string | null;
  statut: string | null;
  created_at: string;
};

async function handle(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "CRON_SECRET non configuré" }, { status: 500 });
  }
  if (req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const admin = getAdminServiceClient();
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await admin
    .from("demandes_transport")
    .select("id, nom, type_transport, departement_cible, statut, created_at")
    .gte("created_at", since)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = (data as DemandeRow[] | null) || [];
  if (rows.length === 0) {
    return NextResponse.json({ ok: true, total: 0, sent: false });
  }

  const par_statut = { envoyee: 0, acceptee: 0, terminee: 0, annulee: 0 };
  const par_type = { taxi: 0, vsl: 0, ambulance: 0 };
  const deptCounts = new Map<string, number>();

  for (const r of rows) {
    switch (r.statut) {
      case "envoyee":
        par_statut.envoyee += 1;
        break;
      case "acceptee":
        par_statut.acceptee += 1;
        break;
      case "traitee":
        par_statut.terminee += 1;
        break;
      case "annulee":
        par_statut.annulee += 1;
        break;
    }
    if (r.type_transport === "taxi") par_type.taxi += 1;
    else if (r.type_transport === "vsl") par_type.vsl += 1;
    else if (r.type_transport === "ambulance") par_type.ambulance += 1;

    if (r.departement_cible) {
      deptCounts.set(r.departement_cible, (deptCounts.get(r.departement_cible) || 0) + 1);
    }
  }

  const top_departements = Array.from(deptCounts.entries())
    .map(([dpt, count]) => ({ dpt, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const sent = await sendAdminRecapQuotidien({
    date: new Date().toISOString(),
    total: rows.length,
    par_statut,
    par_type,
    top_departements,
    demandes_du_jour: rows.slice(0, 50).map((r) => ({
      id: r.id,
      nom: r.nom,
      type: r.type_transport,
      dpt: r.departement_cible,
      statut: r.statut,
      created_at: r.created_at,
    })),
  }).catch(() => null);

  return NextResponse.json({ ok: true, total: rows.length, sent: !!sent });
}

export async function GET(req: Request) {
  return handle(req);
}

export async function POST(req: Request) {
  return handle(req);
}
