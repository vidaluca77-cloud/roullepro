export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";

// Messages d'une conversation.
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  // RLS garantit que l'utilisateur ne lit que ses propres conversations/messages.
  const { data: conversation } = await supabase
    .from("ia_conversations")
    .select("id, titre, created_at, updated_at, is_archived")
    .eq("id", params.id)
    .maybeSingle();
  if (!conversation) return NextResponse.json({ error: "Introuvable" }, { status: 404 });

  const { data: messages } = await supabase
    .from("ia_messages")
    .select("id, role, contenu, created_at")
    .eq("conversation_id", params.id)
    .order("created_at", { ascending: true });

  return NextResponse.json({ conversation, messages: messages || [] });
}

// Renommer / archiver une conversation.
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  let body: { titre?: string; is_archived?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
  }

  const patch: Record<string, unknown> = {};
  if (typeof body.titre === "string" && body.titre.trim()) {
    patch.titre = body.titre.trim().slice(0, 120);
  }
  if (typeof body.is_archived === "boolean") {
    patch.is_archived = body.is_archived;
  }
  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "Rien à mettre à jour" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("ia_conversations")
    .update(patch)
    .eq("id", params.id)
    .select("id, titre, created_at, updated_at, is_archived")
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  return NextResponse.json({ conversation: data });
}

// Supprimer une conversation (cascade sur les messages).
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { error } = await supabase.from("ia_conversations").delete().eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
