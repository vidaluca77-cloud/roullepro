export const dynamic = "force-dynamic";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { createClient as createServerClient } from "@/lib/supabase/server";

const getAdminClient = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const { ok } = checkRateLimit(`claim-verify:${ip}`, 10, 60_000);
    if (!ok) return NextResponse.json({ error: "Trop de tentatives" }, { status: 429 });

    const { claim_id, code } = await req.json();
    if (!claim_id || !code) return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });

    const supabaseAdmin = getAdminClient();
    const { data: claim } = await supabaseAdmin
      .from("sanitaire_claims")
      .select("*")
      .eq("id", claim_id)
      .maybeSingle();

    if (!claim) return NextResponse.json({ error: "Demande introuvable" }, { status: 404 });
    if (claim.status !== "pending") return NextResponse.json({ error: "Demande expirée ou déjà traitée" }, { status: 409 });
    if (new Date(claim.expires_at) < new Date()) {
      await supabaseAdmin.from("sanitaire_claims").update({ status: "expired" }).eq("id", claim_id);
      return NextResponse.json({ error: "Code expiré" }, { status: 410 });
    }
    if (claim.attempts >= 5) {
      await supabaseAdmin.from("sanitaire_claims").update({ status: "rejected" }).eq("id", claim_id);
      return NextResponse.json({ error: "Trop de tentatives erronées" }, { status: 429 });
    }
    if (claim.code !== code.trim()) {
      await supabaseAdmin.from("sanitaire_claims").update({ attempts: claim.attempts + 1 }).eq("id", claim_id);
      return NextResponse.json({ error: "Code incorrect" }, { status: 400 });
    }

    // OK : récupère user connecté, sinon on demandera connexion
    const supabaseUser = await createServerClient();
    const { data: { user } } = await supabaseUser.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: "Connectez-vous ou créez votre compte pour finaliser la réclamation.", requires_auth: true },
        { status: 401 }
      );
    }

    // Lie le pro au user
    const { error: updErr } = await supabaseAdmin
      .from("pros_sanitaire")
      .update({
        claimed: true,
        claimed_by: user.id,
        claimed_at: new Date().toISOString(),
        verified: true,
        email_public: claim.method === "email_domaine" ? claim.contact : undefined,
      })
      .eq("id", claim.pro_id);
    if (updErr) return NextResponse.json({ error: "Erreur association" }, { status: 500 });

    await supabaseAdmin
      .from("sanitaire_claims")
      .update({ status: "verified", verified_at: new Date().toISOString(), user_id: user.id })
      .eq("id", claim_id);

    return NextResponse.json({ ok: true, pro_id: claim.pro_id });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
