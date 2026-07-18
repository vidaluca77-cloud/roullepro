export const dynamic = "force-dynamic";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";

const getAdminClient = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

// POST : pose ou annule une periode d'indisponibilite sur la fiche du pro
// connecte. Le pro ne peut modifier que sa propre fiche (verif claimed_by).
//   { pro_id, indispo_fin }            -> indisponible jusqu'a indispo_fin
//   { pro_id, indispo_fin: null }      -> "Je suis de retour" (annulation)
export async function POST(req: Request) {
  try {
    const supabaseUser = await createServerClient();
    const {
      data: { user },
    } = await supabaseUser.auth.getUser();
    if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const pro_id = body?.pro_id;
    if (!pro_id) return NextResponse.json({ error: "pro_id requis" }, { status: 400 });

    // Fin d'indisponibilite. null / absent => annulation (retour de disponibilite).
    let indispoFin: string | null = null;
    if (body?.indispo_fin != null && String(body.indispo_fin).trim() !== "") {
      const d = new Date(body.indispo_fin);
      if (Number.isNaN(d.getTime())) {
        return NextResponse.json({ error: "Date de fin invalide" }, { status: 400 });
      }
      if (d.getTime() <= Date.now()) {
        return NextResponse.json(
          { error: "La date de fin doit être dans le futur" },
          { status: 400 }
        );
      }
      indispoFin = d.toISOString();
    }

    const supabaseAdmin = getAdminClient();
    const { data: pro } = await supabaseAdmin
      .from("pros_sanitaire")
      .select("claimed_by")
      .eq("id", pro_id)
      .maybeSingle();
    if (!pro || pro.claimed_by !== user.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    // Indisponibilite : debut = maintenant, fin = date choisie.
    // Retour de disponibilite : les deux bornes remises a null.
    const patch = indispoFin
      ? { indispo_debut: new Date().toISOString(), indispo_fin: indispoFin }
      : { indispo_debut: null, indispo_fin: null };

    const { error } = await supabaseAdmin
      .from("pros_sanitaire")
      .update(patch)
      .eq("id", pro_id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ ok: true, ...patch });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
