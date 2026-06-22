export const dynamic = "force-dynamic";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import crypto from "crypto";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import {
  TYPE_TRANSPORT_TO_CATEGORIE,
  LIBELLE_TYPE_TRANSPORT,
  type TypeTransport,
  type SourcePage,
} from "@/lib/transport-types";
import {
  sendDemandeTransportPro,
  sendDemandeTransportConfirmation,
  sendDemandeTransportFallback,
} from "@/lib/email";

const getAdminClient = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

const RAYON_KM = 30;
const MAX_PROS = 5;

type ProProche = {
  id: string;
  raison_sociale: string | null;
  nom_commercial: string | null;
  slug: string | null;
  ville: string | null;
  email_public: string | null;
  claimed: boolean | null;
  plan: string | null;
  distance_km: number;
};

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const { ok } = checkRateLimit(`demande-transport:${ip}`, 5, 60_000);
    if (!ok) {
      return NextResponse.json(
        { error: "Trop de requetes, reessayez dans un instant." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const typeTransport = body.type_transport as TypeTransport;
    const nom = (body.nom ?? "").toString().trim();
    const telephone = (body.telephone ?? "").toString().trim();
    const email = (body.email ?? "").toString().trim();

    if (!["taxi", "vsl", "ambulance"].includes(typeTransport)) {
      return NextResponse.json({ error: "Type de transport invalide" }, { status: 400 });
    }
    if (!nom || !telephone) {
      return NextResponse.json(
        { error: "Nom et telephone sont obligatoires" },
        { status: 400 }
      );
    }
    if (email) {
      const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRe.test(email)) {
        return NextResponse.json({ error: "Email invalide" }, { status: 400 });
      }
    }

    const categorie = TYPE_TRANSPORT_TO_CATEGORIE[typeTransport];
    const supabase = getAdminClient();
    const ipHash = crypto.createHash("sha256").update(ip).digest("hex").slice(0, 16);

    // Contexte optionnel : etablissement, pro cible, dept/ville.
    const etablissementId = body.etablissement_id || null;
    const proIdCible = body.pro_id_cible || null;
    let departementCible: string | null = body.departement_cible || null;
    let villeCible: string | null = body.ville_cible || null;

    // Si on a un etablissement, on recupere ses coordonnees pour le matching geo.
    let lat: number | null = null;
    let lng: number | null = null;
    if (etablissementId) {
      const { data: etab } = await supabase
        .from("etablissements_sante")
        .select("latitude, longitude, departement, ville")
        .eq("id", etablissementId)
        .maybeSingle();
      if (etab) {
        lat = etab.latitude ?? null;
        lng = etab.longitude ?? null;
        departementCible = departementCible || etab.departement || null;
        villeCible = villeCible || etab.ville || null;
      }
    }

    // 1. Recherche des pros a notifier.
    let pros: ProProche[] = [];

    if (proIdCible) {
      // Demande ciblee sur une fiche pro precise.
      const { data } = await supabase
        .from("pros_sanitaire")
        .select("id, raison_sociale, nom_commercial, slug, ville, email_public, claimed, plan")
        .eq("id", proIdCible)
        .maybeSingle();
      if (data) pros = [{ ...(data as Omit<ProProche, "distance_km">), distance_km: 0 }];
    } else if (lat != null && lng != null) {
      // Matching geo Haversine via la fonction SQL.
      const { data } = await supabase.rpc("pros_proches_etablissement", {
        p_lat: lat,
        p_lng: lng,
        p_categorie: categorie,
        p_rayon_km: RAYON_KM,
        p_limit: MAX_PROS,
      });
      pros = (data as ProProche[]) || [];
    } else if (departementCible) {
      // Fallback departemental quand on n'a pas de coordonnees.
      const { data } = await supabase
        .from("pros_sanitaire")
        .select("id, raison_sociale, nom_commercial, slug, ville, email_public, claimed, plan")
        .eq("actif", true)
        .eq("categorie", categorie)
        .eq("departement", departementCible)
        .limit(MAX_PROS);
      pros = ((data as Omit<ProProche, "distance_km">[]) || []).map((p) => ({
        ...p,
        distance_km: 0,
      }));
    }

    // 2. Insertion de la demande (audit + analytics).
    const { data: demande, error: insertErr } = await supabase
      .from("demandes_transport")
      .insert({
        type_transport: typeTransport,
        nom,
        telephone,
        email: email || null,
        date_souhaitee: body.date_souhaitee || null,
        lieu_depart: body.lieu_depart || null,
        lieu_arrivee: body.lieu_arrivee || null,
        aller_retour: !!body.aller_retour,
        mobilite: body.mobilite || null,
        precisions: body.precisions || null,
        source_page: (body.source_page as SourcePage) || null,
        etablissement_id: etablissementId,
        pro_id_cible: proIdCible,
        departement_cible: departementCible,
        ville_cible: villeCible,
        ip_hash: ipHash,
        user_agent: req.headers.get("user-agent")?.slice(0, 255) || null,
        pros_notifies: pros.length,
      })
      .select("id")
      .single();

    if (insertErr) {
      return NextResponse.json({ error: "Erreur technique" }, { status: 500 });
    }

    const libelle = LIBELLE_TYPE_TRANSPORT[typeTransport];

    // 3. Notification des pros disposant d'un email public.
    const prosAvecEmail = pros.filter((p) => p.email_public);
    await Promise.all(
      prosAvecEmail.map((p) =>
        sendDemandeTransportPro({
          to: p.email_public!,
          proNom: p.nom_commercial || p.raison_sociale || "Professionnel",
          typeLibelle: libelle,
          demandeurNom: nom,
          telephone,
          email: email || null,
          lieuDepart: body.lieu_depart || null,
          lieuArrivee: body.lieu_arrivee || villeCible || null,
          dateSouhaitee: body.date_souhaitee || null,
          allerRetour: !!body.aller_retour,
          mobilite: body.mobilite || null,
          precisions: body.precisions || null,
        }).catch(() => undefined)
      )
    );

    // 4. Aucun pro joignable : on bascule sur l'email de secours interne.
    if (prosAvecEmail.length === 0) {
      const fallback = process.env.DEMANDE_TRANSPORT_FALLBACK_EMAIL || process.env.ADMIN_EMAIL;
      if (fallback) {
        await sendDemandeTransportFallback({
          to: fallback,
          typeLibelle: libelle,
          demandeurNom: nom,
          telephone,
          email: email || null,
          departement: departementCible,
          ville: villeCible,
          lieuDepart: body.lieu_depart || null,
          lieuArrivee: body.lieu_arrivee || null,
          dateSouhaitee: body.date_souhaitee || null,
          precisions: body.precisions || null,
          demandeId: demande.id,
        }).catch(() => undefined);
      }
    }

    // 5. Confirmation au demandeur (si email fourni).
    if (email) {
      await sendDemandeTransportConfirmation({
        to: email,
        demandeurNom: nom,
        typeLibelle: libelle,
        nbPros: prosAvecEmail.length,
      }).catch(() => undefined);
    }

    return NextResponse.json({
      ok: true,
      pros_notifies: prosAvecEmail.length,
    });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
