/**
 * GET /api/voice/pros-a-appeler?demande_id=...
 *
 * Appelée par l'agent vocal (ou par l'orchestrateur qui déclenche des appels
 * sortants en masse) avant une session d'appels de dispatch. Retourne la liste
 * des pros à contacter pour une demande donnée — à la fois les pros déjà
 * inscrits (claimed=true, dans demandes_transport_pros avec statut='proposee')
 * ET les pros non inscrits du même département/catégorie qui ont un numéro
 * public mais n'ont pas encore de fiche revendiquée (claimed=false).
 *
 * Distinction volontaire des deux listes : le prompt de l'agent doit adapter
 * son discours (pro inscrit connaît déjà RoullePro / pro non inscrit doit être
 * présenté au service avant de recevoir la proposition de course).
 *
 * Sécurité : Authorization: Bearer ${VOICE_AGENT_SECRET}.
 */

export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifierSecretAgentVocal, reponseNonAutorisee } from "@/lib/voice-agent-auth";

const getAdminClient = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

export async function GET(req: Request) {
  if (!verifierSecretAgentVocal(req)) return reponseNonAutorisee();

  try {
    const url = new URL(req.url);
    const demandeId = url.searchParams.get("demande_id");
    if (!demandeId) {
      return NextResponse.json({ error: "demande_id est obligatoire" }, { status: 400 });
    }

    const admin = getAdminClient();

    const { data: demande, error: demandeError } = await admin
      .from("demandes_transport")
      .select("id, type_transport, departement_cible, statut")
      .eq("id", demandeId)
      .maybeSingle();

    if (demandeError || !demande) {
      return NextResponse.json({ error: "Demande introuvable" }, { status: 404 });
    }

    if (demande.statut === "acceptee") {
      return NextResponse.json({
        ok: true,
        demande_deja_acceptee: true,
        pros_inscrits_a_appeler: [],
        pros_non_inscrits_a_appeler: [],
        message_pour_agent: "Cette demande a déjà été acceptée par un professionnel, aucun appel supplémentaire n'est nécessaire.",
      });
    }

    // Pros inscrits déjà sollicités par le fan-out automatique, encore en attente.
    const { data: prosInscrits } = await admin
      .from("demandes_transport_pros")
      .select("id, pro_id, pros_sanitaire(id, nom_commercial, raison_sociale, telephone_public, categorie)")
      .eq("demande_id", demandeId)
      .eq("statut", "proposee");

    const categorieMap: Record<string, string[]> = {
      taxi: ["taxi_conventionne"],
      vsl: ["vsl", "taxi_conventionne"],
      ambulance: ["ambulance"],
    };
    const categories = categorieMap[demande.type_transport] ?? [];

    // Pros non inscrits du même département/catégorie, avec un numéro public,
    // qui n'ont pas déjà une ligne dans demandes_transport_pros pour cette demande.
    const idsDejaSollicites = (prosInscrits ?? []).map((p) => p.pro_id).filter(Boolean);

    const { data: prosNonInscrits } = await admin
      .from("pros_sanitaire")
      .select("id, nom_commercial, raison_sociale, telephone_public, categorie, departement")
      .eq("claimed", false)
      .eq("departement", demande.departement_cible)
      .in("categorie", categories)
      .not("telephone_public", "is", null)
      .limit(15);

    return NextResponse.json({
      ok: true,
      demande_id: demande.id,
      type_transport: demande.type_transport,
      departement: demande.departement_cible,
      pros_inscrits_a_appeler: (prosInscrits ?? []).map((p: any) => ({
        demande_pro_id: p.id,
        pro_id: p.pro_id,
        nom: p.pros_sanitaire?.nom_commercial || p.pros_sanitaire?.raison_sociale || "Professionnel",
        telephone: p.pros_sanitaire?.telephone_public,
      })),
      pros_non_inscrits_a_appeler: (prosNonInscrits ?? [])
        .filter((p) => !idsDejaSollicites.includes(p.id))
        .map((p) => ({
          pro_id: p.id,
          nom: p.nom_commercial || p.raison_sociale || "Professionnel",
          telephone: p.telephone_public,
        })),
    });
  } catch (e) {
    console.error("[voice/pros-a-appeler] erreur inattendue", e);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
