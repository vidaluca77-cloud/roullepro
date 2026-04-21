import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: { annonceId: string } }
) {
  const sb = await createClient();
  const {
    data: { user },
  } = await sb.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
  }

  const { data: annonce, error } = await sb
    .from("annonces")
    .select("id, user_id, title, marque, modele, annee, kilometrage, images, price")
    .eq("id", params.annonceId)
    .single();

  if (error || !annonce) {
    return NextResponse.json({ error: "Annonce introuvable" }, { status: 404 });
  }

  if (annonce.user_id !== user.id) {
    return NextResponse.json({ error: "Acces refuse" }, { status: 403 });
  }

  return NextResponse.json({
    marque: annonce.marque ?? null,
    modele: annonce.modele ?? null,
    annee: annonce.annee ?? null,
    kilometrage: annonce.kilometrage ?? null,
    images: Array.isArray(annonce.images) ? annonce.images : [],
    prix_actuel: annonce.price ?? null,
  });
}
