/**
 * POST /api/admin/demandes-transport/[id]/relancer
 * Re-envoie l'email pro a tous les pros encore en statut 'proposee' pour cette
 * demande. Refuse si la demande est deja acceptee (accepte_par_pro_id non nul).
 * Auth admin. Met a jour email_status / email_sent_at.
 */

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { sendDemandeTransportPro } from "@/lib/email";
import { LIBELLE_TYPE_TRANSPORT, type TypeTransport } from "@/lib/transport-types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(_req: Request, { params }: RouteParams) {
  const { id } = await params;
  if (!id) return NextResponse.json({ error: "id manquant" }, { status: 400 });

  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  const { data: demande } = await guard.admin
    .from("demandes_transport")
    .select(
      "id, type_transport, lieu_depart, lieu_arrivee, ville_cible, date_souhaitee, aller_retour, mobilite, precisions, taux_prise_en_charge, taux_prise_en_charge_autre, bon_transport_medical, source_form, accepte_par_pro_id, statut"
    )
    .eq("id", id)
    .maybeSingle();

  if (!demande) return NextResponse.json({ error: "Demande introuvable" }, { status: 404 });
  if (demande.accepte_par_pro_id) {
    return NextResponse.json({ error: "Demande déjà acceptée" }, { status: 409 });
  }

  const { data: rows } = await guard.admin
    .from("demandes_transport_pros")
    .select(
      "id, pro_id, pros_sanitaire ( email_public, nom_commercial, raison_sociale )"
    )
    .eq("demande_id", id)
    .eq("statut", "proposee");

  type Row = {
    id: string;
    pro_id: string;
    pros_sanitaire: {
      email_public: string | null;
      nom_commercial: string | null;
      raison_sociale: string | null;
    } | null;
  };
  const pros = (rows as Row[] | null) || [];
  const type = demande.type_transport as TypeTransport;
  const libelle = LIBELLE_TYPE_TRANSPORT[type] || demande.type_transport || "Transport";

  let relances = 0;
  await Promise.all(
    pros.map(async (row) => {
      const to = row.pros_sanitaire?.email_public;
      if (!to) {
        await guard.admin
          .from("demandes_transport_pros")
          .update({ email_status: "skipped_no_email" })
          .eq("id", row.id);
        return;
      }
      const sent = await sendDemandeTransportPro({
        to,
        proNom:
          row.pros_sanitaire?.nom_commercial ||
          row.pros_sanitaire?.raison_sociale ||
          "Professionnel",
        typeLibelle: libelle,
        lieuDepart: demande.lieu_depart,
        lieuArrivee: demande.lieu_arrivee || demande.ville_cible,
        dateSouhaitee: demande.date_souhaitee,
        allerRetour: !!demande.aller_retour,
        mobilite: demande.mobilite,
        precisions: demande.precisions,
        tauxPriseEnCharge: demande.taux_prise_en_charge,
        tauxPriseEnChargeAutre: demande.taux_prise_en_charge_autre,
        bonTransportMedical: !!demande.bon_transport_medical,
        sourceForm: demande.source_form,
        typeTransport: demande.type_transport,
        demandeId: demande.id,
        proId: row.pro_id,
      }).catch(() => null);
      await guard.admin
        .from("demandes_transport_pros")
        .update(
          sent
            ? {
                email_status: "sent",
                email_sent_at: new Date().toISOString(),
                email_resend_id: sent.id,
              }
            : { email_status: "failed" }
        )
        .eq("id", row.id);
      if (sent) relances += 1;
    })
  );

  return NextResponse.json({ ok: true, relances, pros_pending: pros.length });
}
