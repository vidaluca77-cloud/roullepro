/**
 * POST /api/suivi-demande/[token]/annuler
 * Annulation d'une demande de transport par le patient lui-meme, via son lien
 * magique (suivi_token non devinable). Aucune authentification : le token fait foi.
 *
 * - Passe la demande en statut 'annulee' (idempotent).
 * - Si un pro avait accepte la course, il en est informe par email (best-effort).
 */

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { LIBELLE_TYPE_TRANSPORT, type TypeTransport } from "@/lib/transport-types";
import { sendDemandeTransportAnnuleePro } from "@/lib/email";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type RouteParams = { params: Promise<{ token: string }> };

const getAdminClient = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

export async function POST(req: Request, { params }: RouteParams) {
  const { token } = await params;
  if (!token) {
    return NextResponse.json({ error: "Lien invalide" }, { status: 400 });
  }

  const ip = getClientIp(req);
  const { ok } = checkRateLimit(`suivi-annuler:${ip}`, 10, 900_000);
  if (!ok) {
    return NextResponse.json(
      { error: "Trop de requêtes, réessayez dans un instant." },
      { status: 429 }
    );
  }

  const admin = getAdminClient();

  // Recherche de la demande par token. Tolerant a l'absence de suivi_token.
  type DemandeRow = {
    id: string;
    statut: string | null;
    accepte_par_pro_id: string | null;
    type_transport: string | null;
    lieu_depart: string | null;
    lieu_arrivee: string | null;
    date_souhaitee: string | null;
  };
  let demande: DemandeRow | null = null;
  try {
    const { data } = await admin
      .from("demandes_transport")
      .select(
        "id, statut, accepte_par_pro_id, type_transport, lieu_depart, lieu_arrivee, date_souhaitee"
      )
      .eq("suivi_token", token)
      .maybeSingle();
    demande = (data as DemandeRow | null) ?? null;
  } catch {
    demande = null;
  }

  if (!demande) {
    return NextResponse.json({ error: "Demande introuvable" }, { status: 404 });
  }

  // Deja annulee : idempotent.
  if (demande.statut === "annulee") {
    return NextResponse.json({ ok: true, statut: "annulee" });
  }

  // Passage a 'annulee' (conditionnel : ne rien faire si deja annulee entre-temps).
  const { data: updated, error: updateErr } = await admin
    .from("demandes_transport")
    .update({ statut: "annulee" })
    .eq("suivi_token", token)
    .neq("statut", "annulee")
    .select("id")
    .maybeSingle();

  if (updateErr) {
    return NextResponse.json({ error: "L'annulation a échoué." }, { status: 500 });
  }
  if (!updated) {
    // Course deja annulee entre-temps : on renvoie un succes idempotent.
    return NextResponse.json({ ok: true, statut: "annulee" });
  }

  // Si un pro avait accepte, on l'informe de l'annulation (best-effort).
  if (demande.accepte_par_pro_id) {
    try {
      const { data: pro } = await admin
        .from("pros_sanitaire")
        .select("email_public, nom_commercial, raison_sociale")
        .eq("id", demande.accepte_par_pro_id)
        .maybeSingle();
      const to = pro?.email_public;
      if (to) {
        const libelle =
          LIBELLE_TYPE_TRANSPORT[demande.type_transport as TypeTransport] ||
          demande.type_transport ||
          "Transport";
        await sendDemandeTransportAnnuleePro({
          to,
          proNom: pro.nom_commercial || pro.raison_sociale || "Professionnel",
          typeLibelle: libelle,
          lieuDepart: demande.lieu_depart,
          lieuArrivee: demande.lieu_arrivee,
          dateSouhaitee: demande.date_souhaitee,
        }).catch(() => undefined);
      }
    } catch {
      // Un echec de notification ne doit jamais casser l'annulation.
    }
  }

  return NextResponse.json({ ok: true, statut: "annulee" });
}
