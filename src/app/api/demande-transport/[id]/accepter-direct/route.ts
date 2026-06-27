/**
 * GET /api/demande-transport/[id]/accepter-direct?token=...
 *
 * Acceptation d'une demande de transport directement depuis l'email du pro,
 * sans authentification dashboard. Le pro est identifié par un token HMAC
 * signé (cf. lib/demande-accept-token), valable 48h et lié à la demande.
 *
 * Renvoie une page HTML simple (succès / déjà prise / lien invalide).
 * L'acceptation reste race-safe via l'UPDATE conditionnel + le trigger SQL.
 */

import { createClient } from "@supabase/supabase-js";
import { verifyDemandeAcceptToken } from "@/lib/demande-accept-token";
import { notifyDemandeAcceptee } from "@/lib/demande-transport-accept";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type RouteParams = { params: Promise<{ id: string }> };

const getAdminClient = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://roullepro.com";

function page(title: string, message: string, accent: string, cta = true): Response {
  const html = `<!DOCTYPE html>
<html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${title}</title></head>
<body style="margin:0;font-family:Arial,sans-serif;background:#f3f4f6;color:#1f2937">
  <div style="max-width:520px;margin:48px auto;padding:0 16px">
    <div style="background:white;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1)">
      <div style="background:${accent};padding:20px 28px"><h1 style="color:white;margin:0;font-size:18px">RoullePro</h1></div>
      <div style="padding:28px">
        <h2 style="margin:0 0 12px;font-size:20px">${title}</h2>
        <p style="font-size:15px;color:#374151;line-height:1.6">${message}</p>
        ${cta ? `<div style="margin-top:24px"><a href="${APP_URL}/transport-medical/pro/dashboard" style="background:#2563eb;color:white;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;display:inline-block">Ouvrir mon tableau de bord</a></div>` : ""}
      </div>
    </div>
  </div>
</body></html>`;
  return new Response(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

export async function GET(req: Request, { params }: RouteParams) {
  const { id: demandeId } = await params;
  const url = new URL(req.url);
  const token = url.searchParams.get("token");

  if (!demandeId) {
    return page("Lien invalide", "Ce lien d'acceptation est incomplet.", "#b91c1c", false);
  }

  const verified = verifyDemandeAcceptToken(demandeId, token);
  if (!verified.ok) {
    const msg =
      verified.reason === "expired"
        ? "Ce lien d'acceptation a expiré (valable 48h). Connecte-toi à ton tableau de bord pour accepter la course si elle est encore disponible."
        : "Ce lien d'acceptation est invalide. Connecte-toi à ton tableau de bord pour accepter la course.";
    return page("Lien expiré ou invalide", msg, "#b45309");
  }

  const admin = getAdminClient();

  // La ligne de proposition doit exister pour ce pro et être encore ouverte.
  const { data: ligne } = await admin
    .from("demandes_transport_pros")
    .select("id, statut")
    .eq("demande_id", demandeId)
    .eq("pro_id", verified.proId)
    .maybeSingle();

  if (!ligne) {
    return page(
      "Demande introuvable",
      "Cette demande n'existe plus ou ne t'est pas attribuée.",
      "#b45309"
    );
  }

  if (ligne.statut !== "proposee") {
    const dejaPrise = ligne.statut === "acceptee";
    return page(
      dejaPrise ? "Course déjà acceptée" : "Course non disponible",
      dejaPrise
        ? "Tu as déjà accepté cette course. Retrouve les coordonnées du client dans ton tableau de bord."
        : "Cette course a déjà été attribuée à un autre professionnel ou n'est plus disponible.",
      dejaPrise ? "#059669" : "#b45309"
    );
  }

  // UPDATE conditionnel race-safe : passe à 'acceptee' seulement si encore 'proposee'.
  const { data: updated } = await admin
    .from("demandes_transport_pros")
    .update({ statut: "acceptee", acceptee_at: new Date().toISOString() })
    .eq("id", ligne.id)
    .eq("statut", "proposee")
    .select("id")
    .maybeSingle();

  if (!updated) {
    return page(
      "Course non disponible",
      "Cette course vient d'être prise par un autre professionnel.",
      "#b45309"
    );
  }

  // Le trigger a soit confirmé 'acceptee', soit retombé 'autre_acceptee'.
  const { data: apres } = await admin
    .from("demandes_transport_pros")
    .select("statut")
    .eq("id", ligne.id)
    .maybeSingle();

  if (apres?.statut !== "acceptee") {
    return page(
      "Course non disponible",
      "Cette course vient d'être prise par un autre professionnel.",
      "#b45309"
    );
  }

  // Notifications (pro + client + autres pros). Best-effort.
  await notifyDemandeAcceptee(admin, demandeId, verified.proId).catch(
    () => undefined
  );

  return page(
    "Course acceptée",
    "C'est noté, la course t'est attribuée. Tu vas recevoir un email avec les coordonnées du client. Tu peux aussi les retrouver dans ton tableau de bord.",
    "#059669"
  );
}
