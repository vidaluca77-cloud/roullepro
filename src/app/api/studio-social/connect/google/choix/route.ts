/**
 * GET/POST /api/studio-social/connect/google/choix
 *
 * Écran de sélection d'établissement Google Business Profile : quand le callback
 * OAuth a détecté PLUSIEURS établissements accessibles (connexion en statut
 * 'en_attente_choix'), l'utilisateur doit choisir explicitement lequel connecter
 * plutôt que de laisser le code deviner à sa place.
 *
 * - GET  : renvoie la liste des établissements candidats (jamais de token).
 * - POST : reçoit le `name` (`accounts/{id}/locations/{id}`) choisi et finalise
 *   la connexion (statut 'active'). Le token déjà stocké au callback est réutilisé
 *   tel quel : aucune nouvelle autorisation Google n'est nécessaire.
 */
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { getAdminServiceClient } from "@/lib/admin-guard";
import { getProStudioActif } from "@/lib/studio-social";

type EtablissementCandidat = { name: string; title: string | null; compte: string };

async function contexte() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const admin = getAdminServiceClient();
  const pro = await getProStudioActif(admin, user.id);
  if (!pro) return null;

  return { admin, pro };
}

export async function GET() {
  const ctx = await contexte();
  if (!ctx) {
    return NextResponse.json({ error: "Non authentifié ou non éligible" }, { status: 401 });
  }
  const { admin, pro } = ctx;

  const { data } = await admin
    .from("social_connections")
    .select("statut, comptes_disponibles")
    .eq("pro_id", pro.id)
    .eq("provider", "google_business")
    .maybeSingle();

  if (!data || data.statut !== "en_attente_choix") {
    return NextResponse.json({ ok: true, enAttente: false, etablissements: [] });
  }

  return NextResponse.json({
    ok: true,
    enAttente: true,
    etablissements: (data.comptes_disponibles as EtablissementCandidat[] | null) || [],
  });
}

export async function POST(req: Request) {
  const ctx = await contexte();
  if (!ctx) {
    return NextResponse.json({ error: "Non authentifié ou non éligible" }, { status: 401 });
  }
  const { admin, pro } = ctx;

  const body = await req.json().catch(() => ({}));
  const name = typeof body?.name === "string" ? body.name : null;
  if (!name) return NextResponse.json({ error: "Établissement manquant" }, { status: 400 });

  const { data } = await admin
    .from("social_connections")
    .select("statut, comptes_disponibles")
    .eq("pro_id", pro.id)
    .eq("provider", "google_business")
    .maybeSingle();

  if (!data || data.statut !== "en_attente_choix") {
    return NextResponse.json(
      { error: "Aucune sélection en attente pour ce compte" },
      { status: 409 }
    );
  }

  const candidats = (data.comptes_disponibles as EtablissementCandidat[] | null) || [];
  const choisi = candidats.find((c) => c.name === name);
  if (!choisi) {
    return NextResponse.json({ error: "Établissement invalide" }, { status: 400 });
  }

  const { error } = await admin
    .from("social_connections")
    .update({
      account_id: choisi.name,
      account_name: choisi.title,
      account_metadata: { compte: choisi.compte, locations: [choisi] },
      comptes_disponibles: [],
      statut: "active",
      updated_at: new Date().toISOString(),
    })
    .eq("pro_id", pro.id)
    .eq("provider", "google_business");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
