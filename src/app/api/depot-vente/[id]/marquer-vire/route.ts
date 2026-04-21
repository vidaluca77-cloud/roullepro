/**
 * POST /api/depot-vente/[id]/marquer-vire
 * Admin uniquement. Enregistre le virement SEPA effectue vers le vendeur.
 * Met la transaction en "completed" et le depot en "paye_vendeur".
 */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createSbClient } from "@supabase/supabase-js";
import { apiError } from "@/lib/api-utils";

export const dynamic = "force-dynamic";

type RouteParams = { params: { id: string } };

export async function POST(req: NextRequest, { params }: RouteParams) {
  const depotId = params.id;

  try {
    const sb = await createClient();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Authentification requise" }, { status: 401 });
    }

    const sbService = createSbClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: profile } = await sbService
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Reserve aux administrateurs" }, { status: 403 });
    }

    let body: { reference?: string; iban_last4?: string };
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    const reference = body.reference?.trim() || `VIR-${Date.now()}`;
    const iban4 = body.iban_last4?.replace(/\s/g, "").slice(-4);

    const { data: tx, error: txErr } = await sbService
      .from("transactions_depot")
      .select("*")
      .eq("depot_id", depotId)
      .in("statut", ["splitted", "remise_confirmee"])
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (txErr || !tx) {
      return NextResponse.json(
        { error: "Aucune transaction eligible (remise non confirmee ou deja viree)" },
        { status: 400 }
      );
    }

    await sbService
      .from("transactions_depot")
      .update({
        statut: "completed",
        vendeur_vire_at: new Date().toISOString(),
        vendeur_vire_reference: reference,
        vendeur_iban_last4: iban4 ?? tx.vendeur_iban_last4,
      })
      .eq("id", tx.id);

    await sbService
      .from("depots")
      .update({ statut: "paye_vendeur" })
      .eq("id", depotId);

    await sbService.from("depot_events").insert({
      depot_id: depotId,
      type_event: "vendeur_vire",
      description: `Virement SEPA effectue vers vendeur - ref ${reference}${iban4 ? ` - IBAN ****${iban4}` : ""}`,
      created_by: user.id,
    });

    return NextResponse.json({
      ok: true,
      reference,
      part_vendeur_cents: Number(tx.part_vendeur_cents),
    });
  } catch (err) {
    return apiError("POST /api/depot-vente/[id]/marquer-vire", err);
  }
}
