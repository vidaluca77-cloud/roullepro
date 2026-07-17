export const dynamic = "force-dynamic";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import crypto from "crypto";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import {
  LIBELLE_TYPE_TRANSPORT,
  type TypeTransport,
  type SourcePage,
} from "@/lib/transport-types";
import {
  sendDemandeTransportPro,
  sendDemandeTransportConfirmation,
  sendDemandeTransportFallback,
  sendAdminNouvelleDemande,
} from "@/lib/email";
import { geocodeAdresse } from "@/lib/geocode-adresse";
import { normaliserDepartement } from "@/lib/departement";
import { calculerDistanceCourse } from "@/lib/distance-course";
import { estimerPrixCPAM, type EstimationCPAM } from "@/lib/tarif-cpam";

const getAdminClient = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

const SOURCE_FORMS = ["home", "etablissement", "transport_vers", "widget", "fiche_pro"] as const;
type SourceForm = (typeof SOURCE_FORMS)[number];

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    // Rate limit : 5 requetes / 15 min par IP.
    const { ok } = checkRateLimit(`demande-transport:${ip}`, 5, 900_000);
    if (!ok) {
      return NextResponse.json(
        { error: "Trop de requetes, reessayez dans un instant." },
        { status: 429 }
      );
    }

    // Parsing defensif : corps JSON invalide -> 400.
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Requete invalide" }, { status: 400 });
    }

    // Honeypot anti-bot : champ invisible "website". Si rempli -> 200 silencieux.
    if (typeof body.website === "string" && body.website.trim() !== "") {
      return NextResponse.json({ ok: true, pros_notifies: 0 });
    }

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

    // Email obligatoire pour confirmer la prise en charge au client.
    if (!email) {
      return NextResponse.json(
        { error: "L'email est obligatoire" },
        { status: 400 }
      );
    }
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(email)) {
      return NextResponse.json({ error: "Email invalide" }, { status: 400 });
    }

    // Date souhaitee obligatoire pour planifier la course.
    const dateSouhaiteeRaw = (body.date_souhaitee ?? "").toString().trim();
    if (!dateSouhaiteeRaw) {
      return NextResponse.json(
        { error: "La date et heure souhaitees sont obligatoires" },
        { status: 400 }
      );
    }
    // Validation de la date : parseable, pas dans le passe (tolerance 1h),
    // pas au-dela d'un an. Stockee en ISO normalise.
    const dateSouhaiteeDate = new Date(dateSouhaiteeRaw);
    if (Number.isNaN(dateSouhaiteeDate.getTime())) {
      return NextResponse.json(
        { error: "La date et heure souhaitees sont invalides" },
        { status: 400 }
      );
    }
    const nowMs = Date.now();
    if (dateSouhaiteeDate.getTime() < nowMs - 3_600_000) {
      return NextResponse.json(
        { error: "La date souhaitee ne peut pas etre dans le passe." },
        { status: 400 }
      );
    }
    if (dateSouhaiteeDate.getTime() > nowMs + 365 * 86_400_000) {
      return NextResponse.json(
        { error: "La date souhaitee est trop lointaine (un an maximum)." },
        { status: 400 }
      );
    }
    const dateSouhaiteeIso = dateSouhaiteeDate.toISOString();

    // Lieu de depart obligatoire : sans ca on ne peut pas dispatcher la demande
    // au bon pro (le trigger fait p.departement = NEW.departement_cible).
    const lieuDepartRaw = (body.lieu_depart ?? "").toString().trim();
    const lieuArriveeRaw = (body.lieu_arrivee ?? "").toString().trim();
    if (!lieuDepartRaw) {
      return NextResponse.json(
        { error: "Le lieu de depart est obligatoire" },
        { status: 400 }
      );
    }

    // Taux de prise en charge (facultatif).
    let tauxPriseEnCharge: string | null = null;
    let tauxPriseEnChargeAutre: string | null = null;
    if (body.taux_prise_en_charge != null && body.taux_prise_en_charge !== "") {
      const t = String(body.taux_prise_en_charge);
      if (!["100", "65", "autre"].includes(t)) {
        return NextResponse.json({ error: "Taux de prise en charge invalide" }, { status: 400 });
      }
      tauxPriseEnCharge = t;
      if (t === "autre" && body.taux_prise_en_charge_autre != null) {
        const n = Number(body.taux_prise_en_charge_autre);
        if (!Number.isFinite(n) || n < 0 || n > 100) {
          return NextResponse.json({ error: "Taux personnalise invalide" }, { status: 400 });
        }
        tauxPriseEnChargeAutre = String(n);
      }
    }

    // Bon de transport medical : doit etre booleen si fourni.
    if (body.bon_transport_medical != null && typeof body.bon_transport_medical !== "boolean") {
      return NextResponse.json({ error: "Champ bon de transport invalide" }, { status: 400 });
    }
    const bonTransportMedical = body.bon_transport_medical === true;

    // source_form : whitelisté, fallback null.
    const sourceForm: SourceForm | null = SOURCE_FORMS.includes(body.source_form)
      ? (body.source_form as SourceForm)
      : null;

    const supabase = getAdminClient();
    const ipHash = crypto.createHash("sha256").update(ip).digest("hex").slice(0, 16);

    const etablissementId = body.etablissement_id || null;
    const proIdCible = body.pro_id_cible || null;
    let departementCible: string | null = normaliserDepartement(body.departement_cible);
    let villeCible: string | null = (body.ville_cible ?? "").toString().trim() || null;

    // Coordonnees + ville + departement de chaque extremite fournies par le front
    // (Google Places). Completees ensuite par geocodage de secours si besoin.
    const numOrNull = (v: unknown) =>
      typeof v === "number" && Number.isFinite(v) ? v : null;
    let lieuDepartLat = numOrNull(body.lieu_depart_lat);
    let lieuDepartLng = numOrNull(body.lieu_depart_lng);
    let lieuArriveeLat = numOrNull(body.lieu_arrivee_lat);
    let lieuArriveeLng = numOrNull(body.lieu_arrivee_lng);
    let villeDepart: string | null = (body.ville_depart ?? "").toString().trim() || null;
    let villeArrivee: string | null = (body.ville_arrivee ?? "").toString().trim() || null;
    let departementDepart: string | null = normaliserDepartement(body.departement_depart);
    let departementArrivee: string | null = normaliserDepartement(body.departement_arrivee);

    // Si on a un etablissement, on recupere dept/ville pour le fan-out departemental.
    if (etablissementId) {
      const { data: etab } = await supabase
        .from("etablissements_sante")
        .select("departement, ville")
        .eq("id", etablissementId)
        .maybeSingle();
      if (etab) {
        departementCible = departementCible || etab.departement || null;
        villeCible = villeCible || etab.ville || null;
        // L'arrivee est l'etablissement pour ce formulaire.
        departementArrivee = departementArrivee || etab.departement || null;
        villeArrivee = villeArrivee || etab.ville || null;
      }
    }

    // Si pro_id_cible est fourni (formulaire fiche pro), on recupere son
    // departement comme cible par defaut.
    if (!departementCible && proIdCible) {
      const { data: pro } = await supabase
        .from("pros_sanitaire")
        .select("departement, ville")
        .eq("id", proIdCible)
        .maybeSingle();
      if (pro) {
        departementCible = pro.departement || null;
        villeCible = villeCible || pro.ville || null;
      }
    }

    // Geocodage de secours cote serveur (api-adresse, gratuit, sans cle) pour
    // fiabiliser le dispatch ET la distance : on complete depart puis arrivee
    // quand le front n'a pas fourni coordonnees / ville / departement.
    if ((!lieuDepartLat || !lieuDepartLng || !departementDepart || !villeDepart) && lieuDepartRaw) {
      const geo = await geocodeAdresse(lieuDepartRaw);
      if (geo) {
        lieuDepartLat = lieuDepartLat ?? geo.latitude;
        lieuDepartLng = lieuDepartLng ?? geo.longitude;
        departementDepart = departementDepart || geo.departement;
        villeDepart = villeDepart || geo.ville;
      }
    }
    // Ne jamais rejeter la demande si seule l'arrivee est introuvable.
    if ((!lieuArriveeLat || !lieuArriveeLng || !departementArrivee || !villeArrivee) && lieuArriveeRaw) {
      const geo = await geocodeAdresse(lieuArriveeRaw);
      if (geo) {
        lieuArriveeLat = lieuArriveeLat ?? geo.latitude;
        lieuArriveeLng = lieuArriveeLng ?? geo.longitude;
        departementArrivee = departementArrivee || geo.departement;
        villeArrivee = villeArrivee || geo.ville;
      }
    }

    // Departement / ville cible du dispatch : a defaut de parent, on prend le depart.
    departementCible = departementCible || departementDepart;
    villeCible = villeCible || villeDepart;

    if (!departementCible) {
      return NextResponse.json(
        {
          error:
            "Lieu de depart introuvable. Merci de selectionner une adresse dans la liste de suggestions.",
        },
        { status: 400 }
      );
    }

    // Distance de la course (Haversine x 1,3) + estimation CPAM indicative.
    // Si une extremite n'est pas geolocalisable, pas d'estimation (pas de 0 km).
    const distance = calculerDistanceCourse(
      lieuDepartLat != null && lieuDepartLng != null
        ? { lat: lieuDepartLat, lng: lieuDepartLng }
        : null,
      lieuArriveeLat != null && lieuArriveeLng != null
        ? { lat: lieuArriveeLat, lng: lieuArriveeLng }
        : null
    );
    const distanceKm = distance?.distanceKm ?? null;

    let prixEstime: number | null = null;
    let prixEstimeDetails: EstimationCPAM["details"] | null = null;
    if (distanceKm != null) {
      const estimation = estimerPrixCPAM({
        distanceKm,
        departementCible,
        villeDepart,
        villeArrivee,
        departementDepart,
        departementArrivee,
        dateSouhaitee: dateSouhaiteeIso,
        allerRetour: !!body.aller_retour,
      });
      if (estimation) {
        prixEstime = estimation.total;
        prixEstimeDetails = estimation.details;
      }
    }

    // Insertion de la demande. Le trigger dispatch_demande_transport() fait le
    // fan-out RoullePro (demandes_transport_pros) + TCP (tcp.reservations).
    const { data: demande, error: insertErr } = await supabase
      .from("demandes_transport")
      .insert({
        type_transport: typeTransport,
        nom,
        telephone,
        email: email || null,
        date_souhaitee: dateSouhaiteeIso,
        lieu_depart: lieuDepartRaw,
        lieu_arrivee: lieuArriveeRaw || null,
        lieu_depart_lat: lieuDepartLat,
        lieu_depart_lng: lieuDepartLng,
        lieu_arrivee_lat: lieuArriveeLat,
        lieu_arrivee_lng: lieuArriveeLng,
        lieu_arrivee_ville: villeArrivee,
        aller_retour: !!body.aller_retour,
        mobilite: body.mobilite || null,
        precisions: body.precisions || null,
        source_page: (body.source_page as SourcePage) || null,
        source_form: sourceForm,
        taux_prise_en_charge: tauxPriseEnCharge,
        taux_prise_en_charge_autre: tauxPriseEnChargeAutre,
        bon_transport_medical: bonTransportMedical,
        etablissement_id: etablissementId,
        pro_id_cible: proIdCible,
        departement_cible: departementCible,
        ville_cible: villeCible,
        distance_km: distanceKm,
        prix_estime: prixEstime,
        prix_estime_details: prixEstimeDetails,
        ip_hash: ipHash,
        user_agent: req.headers.get("user-agent")?.slice(0, 255) || null,
      })
      .select("id")
      .single();

    if (insertErr || !demande) {
      return NextResponse.json({ error: "Erreur technique" }, { status: 500 });
    }

    const libelle = LIBELLE_TYPE_TRANSPORT[typeTransport];

    // Recuperation des pros notifies par le trigger (avec leur email public).
    const { data: dtpRows } = await supabase
      .from("demandes_transport_pros")
      .select("id, pro_id, pros_sanitaire ( email_public, nom_commercial, raison_sociale )")
      .eq("demande_id", demande.id);

    type DtpRow = {
      id: string;
      pro_id: string;
      pros_sanitaire: {
        email_public: string | null;
        nom_commercial: string | null;
        raison_sociale: string | null;
      } | null;
    };
    const rows = (dtpRows as DtpRow[] | null) || [];

    // Envoi des emails pros (sans coordonnees demandeur) + tracking en base.
    let prosNotifies = 0;
    await Promise.all(
      rows.map(async (row) => {
        const pro = row.pros_sanitaire;
        const to = pro?.email_public;
        if (!to) {
          await supabase
            .from("demandes_transport_pros")
            .update({ email_status: "skipped_no_email" })
            .eq("id", row.id);
          return;
        }
        console.log("[demande-transport] resend send", {
          demande_id: demande.id,
          pro_id: row.pro_id,
          to,
        });
        const sent = await sendDemandeTransportPro({
          to,
          proNom: pro.nom_commercial || pro.raison_sociale || "Professionnel",
          typeLibelle: libelle,
          lieuDepart: lieuDepartRaw,
          lieuArrivee: lieuArriveeRaw || villeCible || null,
          dateSouhaitee: dateSouhaiteeIso,
          allerRetour: !!body.aller_retour,
          mobilite: body.mobilite || null,
          precisions: body.precisions || null,
          tauxPriseEnCharge,
          tauxPriseEnChargeAutre,
          bonTransportMedical,
          sourceForm,
          typeTransport,
          distanceKm,
          prixEstime,
          demandeId: demande.id,
          proId: row.pro_id,
        }).catch(() => null);
        await supabase
          .from("demandes_transport_pros")
          .update(
            sent
              ? { email_status: "sent", email_sent_at: new Date().toISOString(), email_resend_id: sent.id }
              : { email_status: "failed" }
          )
          .eq("id", row.id);
        if (sent) prosNotifies += 1;
      })
    );

    // Aucun pro joignable : email de secours interne.
    if (prosNotifies === 0) {
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
          lieuDepart: lieuDepartRaw,
          lieuArrivee: lieuArriveeRaw || null,
          dateSouhaitee: dateSouhaiteeIso,
          precisions: body.precisions || null,
          demandeId: demande.id,
        }).catch(() => undefined);
      }
    }

    // Confirmation au demandeur (si email fourni).
    if (email) {
      await sendDemandeTransportConfirmation({
        to: email,
        demandeurNom: nom,
        typeLibelle: libelle,
        nbPros: prosNotifies,
      }).catch(() => undefined);
    }

    // Notification admin (best-effort, non bloquante). Part meme si aucun pro
    // n'a ete notifie pour que l'admin puisse traiter manuellement.
    try {
      await sendAdminNouvelleDemande({
        id: demande.id,
        nom,
        telephone,
        email: email || null,
        type_transport: typeTransport,
        date_souhaitee: dateSouhaiteeIso,
        lieu_depart: lieuDepartRaw,
        lieu_arrivee: lieuArriveeRaw || null,
        departement_cible: departementCible,
        ville_cible: villeCible,
        precisions: body.precisions || null,
        taux_prise_en_charge: tauxPriseEnCharge,
        taux_prise_en_charge_autre: tauxPriseEnChargeAutre,
        source_form: sourceForm,
        distance_km: distanceKm,
        prix_estime: prixEstime,
        pros_notifies: prosNotifies,
      });
      await supabase
        .from("demandes_transport")
        .update({ admin_email_sent_at: new Date().toISOString() })
        .eq("id", demande.id);
    } catch (e) {
      console.error("[admin notif] failed", e);
    }

    return NextResponse.json({ ok: true, pros_notifies: prosNotifies });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
