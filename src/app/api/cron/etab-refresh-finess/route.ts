import { NextResponse } from "next/server";
import { runFinessImport } from "@/lib/finess-import";

export const dynamic = "force-dynamic";
// L'import telecharge un CSV de ~45 Mo et fait des UPSERT par lots : on autorise
// une execution longue (le refresh est mensuel, pas dans le chemin utilisateur).
export const maxDuration = 300;

/**
 * Endpoint appele par la fonction planifiee Netlify (etab-refresh-finess) pour
 * rafraichir le referentiel FINESS une fois par mois.
 *
 * Toute la logique vit dans src/lib/finess-import.ts (partagee avec le script
 * manuel scripts/import-finess.ts).
 *
 * Protection : header Authorization: Bearer <CRON_SECRET>
 */
export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  const expectedToken = process.env.CRON_SECRET;
  if (!expectedToken || authHeader !== `Bearer ${expectedToken}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const result = await runFinessImport();
    return NextResponse.json({ success: true, ...result });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "unknown" },
      { status: 500 }
    );
  }
}
