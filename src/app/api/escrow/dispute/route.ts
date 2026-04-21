export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

function getAdmin() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

/**
 * POST /api/escrow/dispute
 * Body: { tx_id, reason }
 * L'acheteur ou le vendeur signale un litige. Les fonds restent bloqués en attendant
 * qu'un admin tranche (refund ou release).
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

    const { tx_id, reason } = await request.json();
    if (!tx_id || !reason?.trim()) {
      return NextResponse.json({ error: "tx_id et reason requis" }, { status: 400 });
    }

    const admin = getAdmin();
    const { data: tx, error } = await admin
      .from("escrow_transactions")
      .select("id, buyer_id, seller_id, status")
      .eq("id", tx_id)
      .single();

    if (error || !tx) return NextResponse.json({ error: "Transaction introuvable" }, { status: 404 });
    if (tx.buyer_id !== user.id && tx.seller_id !== user.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }
    if (tx.status !== "held" && tx.status !== "pending") {
      return NextResponse.json({ error: `Impossible de contester en statut ${tx.status}` }, { status: 400 });
    }

    await admin
      .from("escrow_transactions")
      .update({ status: "disputed", dispute_reason: reason.trim() })
      .eq("id", tx_id);

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("[escrow/dispute]", e?.message);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
