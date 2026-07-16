export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { QUOTA_MENSUEL } from "@/lib/ia-assistant";

function moisCourant(): string {
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-01`;
}

// Liste des conversations de l'utilisateur + quota du mois courant.
export async function GET() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const [{ data: conversations }, { data: usage }] = await Promise.all([
    supabase
      .from("ia_conversations")
      .select("id, titre, created_at, updated_at, is_archived, agent_slug")
      .eq("is_archived", false)
      .order("updated_at", { ascending: false }),
    supabase
      .from("ia_usage")
      .select("nb_messages")
      .eq("user_id", user.id)
      .eq("mois", moisCourant())
      .maybeSingle(),
  ]);

  return NextResponse.json({
    conversations: conversations || [],
    quota: { utilise: usage?.nb_messages ?? 0, limite: QUOTA_MENSUEL },
  });
}

// Création d'une conversation vide.
export async function POST(req: Request) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  let titre = "Nouvelle conversation";
  let agentSlug = "general";
  try {
    const body = await req.json();
    if (typeof body?.titre === "string" && body.titre.trim()) {
      titre = body.titre.trim().slice(0, 120);
    }
    if (typeof body?.agent_slug === "string" && body.agent_slug.trim()) {
      agentSlug = body.agent_slug.trim();
    }
  } catch {
    // corps optionnel
  }

  const { data, error } = await supabase
    .from("ia_conversations")
    .insert({ user_id: user.id, titre, agent_slug: agentSlug })
    .select("id, titre, created_at, updated_at, is_archived, agent_slug")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ conversation: data });
}
