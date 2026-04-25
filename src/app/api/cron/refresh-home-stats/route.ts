import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

// Endpoint appelé par un cron externe (Netlify scheduled function ou cron-job.org)
// pour rafraîchir les vues matérialisées qui alimentent la home.
// Protégé par un token simple dans le header Authorization.

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  const expectedToken = process.env.CRON_SECRET;
  if (!expectedToken || authHeader !== `Bearer ${expectedToken}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { error } = await supabase.rpc("refresh_sanitaire_home_views");
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Invalide le cache ISR de la home et de l'annuaire
  // pour propager immediatement les nouveaux compteurs.
  try {
    revalidatePath("/");
    revalidatePath("/transport-medical");
  } catch {
    // ignore — refresh des vues a deja reussi
  }

  return NextResponse.json({
    success: true,
    refreshed_at: new Date().toISOString(),
    revalidated: ["/", "/transport-medical"],
  });
}
