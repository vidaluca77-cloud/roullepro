export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { listerAgents } from "@/lib/ia-assistant";

// Liste des agents spécialisés actifs (lecture publique authentifiée via RLS).
export async function GET() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const agents = await listerAgents(supabase);
  return NextResponse.json({ agents });
}
