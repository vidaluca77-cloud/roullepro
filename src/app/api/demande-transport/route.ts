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
    if (email) {
      const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRe.test(email)) {
        return NextResponse.json({ error: "Email invalide" }, { status: 400 });
      }
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
    let departementCible: string | null = body.departement_cible || null;
    let villeCible: string | null = body.ville_cible || null;

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
        date_souhaitee: body.date_souhaitee || null,
        lieu_depart: body.lieu_depart || null,
        lieu_arrivee: body.lieu_arrivee || null,
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
          lieuDepart: body.lieu_depart || null,
          lieuArrivee: body.lieu_arrivee || villeCible || null,
          dateSouhaitee: body.date_souhaitee || null,
          allerRetour: !!body.aller_retour,
          mobilite: body.mobilite || null,
          precisions: body.precisions || null,
          tauxPriseEnCharge,
          tauxPriseEnChargeAutre,
          bonTransportMedical,
          sourceForm,
          typeTransport,
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
          lieuDepart: body.lieu_depart || null,
          lieuArrivee: body.lieu_arrivee || null,
          dateSouhaitee: body.date_souhaitee || null,
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
        date_souhaitee: body.date_souhaitee || null,
        lieu_depart: body.lieu_depart || null,
        lieu_arrivee: body.lieu_arrivee || null,
        departement_cible: departementCible,
        ville_cible: villeCible,
        precisions: body.precisions || null,
        taux_prise_en_charge: tauxPriseEnCharge,
        taux_prise_en_charge_autre: tauxPriseEnChargeAutre,
        source_form: sourceForm,
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
