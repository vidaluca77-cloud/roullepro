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
import {
  geocodeAdresse,
  geocodageEstFiable,
  extraireCodePostal,
} from "@/lib/geocode-adresse";
import { normaliserDepartement, codePostalToDepartement } from "@/lib/departement";
import {
  construireMessageSmsCourse,
  construireMessageSmsDepotPatient,
  envoyerSmsTransactionnel,
  normaliserTelephoneFr,
} from "@/lib/sms";
import { TYPE_TRANSPORT_TO_CATEGORIE, CATEGORIES_COMPATIBLES } from "@/lib/transport-types";
import { departementsPoolRegional } from "@/lib/pool-regional";
import {
  PLAFOND_SMS_RECRUTEMENT,
  RAYON_REPLI_KM,
  communeSlugRecrutement,
  construireMessageSmsRecrutement,
  dansFenetreEnvoiParis,
  normaliserMobileRecrutement,
  selectionnerCiblesRecrutement,
  selectionnerProsDansRayon,
  type CibleRecrutement,
  type ProRepliGeo,
} from "@/lib/sms-recrutement";
import { FENETRE_DOUBLON_MS, trouverDoublon } from "@/lib/demande-doublon";
import { calculerDistanceCourse } from "@/lib/distance-course";
import { estimerPrixCourse, type EstimationCourse } from "@/lib/tarif-transport-sanitaire";
import { publierDemandeSurFacebook } from "@/lib/facebook-publish";

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

    // --- Anti-doublon serveur -------------------------------------------------
    // ~24 % des demandes sont des re-soumissions (meme patient, meme trajet, meme
    // date, < 24h) car le patient n'a aucun retour immediat. On cherche une
    // demande ouverte (statut 'envoyee') recente identique : si trouvee, on NE
    // recree PAS et on NE re-notifie PAS les pros. On renvoie le nombre de pros
    // deja prevenus pour rassurer le patient cote front.
    // Tolerant aux erreurs : une panne du dedup ne doit jamais bloquer un depot.
    try {
      const depuis = new Date(nowMs - FENETRE_DOUBLON_MS).toISOString();
      const { data: recentes } = await supabase
        .from("demandes_transport")
        .select("id, telephone, lieu_depart, lieu_arrivee, date_souhaitee")
        .eq("statut", "envoyee")
        .eq("date_souhaitee", dateSouhaiteeIso)
        .gte("created_at", depuis);

      const doublon = trouverDoublon(
        { telephone, lieu_depart: lieuDepartRaw, lieu_arrivee: lieuArriveeRaw || null, date_souhaitee: dateSouhaiteeIso },
        (recentes as Array<{
          id: string;
          telephone: string | null;
          lieu_depart: string | null;
          lieu_arrivee: string | null;
          date_souhaitee: string | null;
        }> | null) || []
      );

      if (doublon) {
        const { count } = await supabase
          .from("demandes_transport_pros")
          .select("id", { count: "exact", head: true })
          .eq("demande_id", doublon.id);
        // Token de suivi de la demande existante (lecture tolerante).
        let suiviTokenDoublon: string | null = null;
        try {
          const { data: tokenRow } = await supabase
            .from("demandes_transport")
            .select("suivi_token")
            .eq("id", doublon.id)
            .maybeSingle();
          suiviTokenDoublon =
            (tokenRow as { suivi_token?: string | null } | null)?.suivi_token ?? null;
        } catch {
          // Colonne absente : pas de lien de suivi.
        }
        return NextResponse.json({
          ok: true,
          doublon: true,
          pros_notifies: count ?? 0,
          suivi_token: suiviTokenDoublon,
        });
      }
    } catch (e) {
      console.error("[demande-transport] anti-doublon error", e);
    }

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
        if (geocodageEstFiable(lieuDepartRaw, geo)) {
          lieuDepartLat = lieuDepartLat ?? geo.latitude;
          lieuDepartLng = lieuDepartLng ?? geo.longitude;
          departementDepart = departementDepart || geo.departement;
          villeDepart = villeDepart || geo.ville;
        } else {
          // CP saisi incoherent avec la commune geocodee : le code postal fait
          // foi pour le dispatch, mais on ignore les coordonnees (pas de
          // distance / estimation fondee sur une mauvaise commune).
          const cpDepart = extraireCodePostal(lieuDepartRaw);
          const depCp = cpDepart ? codePostalToDepartement(cpDepart) : null;
          if (depCp) departementDepart = departementDepart || depCp;
        }
      }
    }
    // Ne jamais rejeter la demande si seule l'arrivee est introuvable.
    if ((!lieuArriveeLat || !lieuArriveeLng || !departementArrivee || !villeArrivee) && lieuArriveeRaw) {
      // Biais geographique : quand l'arrivee est saisie sans code postal, on
      // privilegie les resultats proches du depart pour lever l'ambiguite de
      // commune (ex. "verzy" -> Verzy 51 plutot que Nancy 54).
      const biais =
        !extraireCodePostal(lieuArriveeRaw) && lieuDepartLat != null && lieuDepartLng != null
          ? { lat: lieuDepartLat, lng: lieuDepartLng }
          : null;
      const geo = await geocodeAdresse(lieuArriveeRaw, biais ? { biais } : {});
      if (geo) {
        const reference =
          lieuDepartLat != null && lieuDepartLng != null
            ? { lat: lieuDepartLat, lng: lieuDepartLng }
            : null;
        // Si le resultat reste non fiable (mauvais departement / aberrant), on
        // ne renseigne rien : la demande part sans ville ni estimation d'arrivee
        // plutot qu'avec des valeurs fausses.
        if (geocodageEstFiable(lieuArriveeRaw, geo, { reference })) {
          lieuArriveeLat = lieuArriveeLat ?? geo.latitude;
          lieuArriveeLng = lieuArriveeLng ?? geo.longitude;
          departementArrivee = departementArrivee || geo.departement;
          villeArrivee = villeArrivee || geo.ville;
        }
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
    let prixEstimeDetails: EstimationCourse["details"] | null = null;
    if (distanceKm != null) {
      const estimation = estimerPrixCourse({
        typeTransport,
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

    // Token de suivi patient (lien magique). Lecture tolerante : si la colonne
    // suivi_token n'existe pas encore (migration non appliquee), on continue sans
    // lien de suivi plutot que d'echouer.
    let suiviToken: string | null = null;
    try {
      const { data: tokenRow } = await supabase
        .from("demandes_transport")
        .select("suivi_token")
        .eq("id", demande.id)
        .maybeSingle();
      suiviToken = (tokenRow as { suivi_token?: string | null } | null)?.suivi_token ?? null;
    } catch {
      // Colonne absente : pas de lien de suivi.
    }
    const suiviUrl = suiviToken
      ? `${process.env.NEXT_PUBLIC_APP_URL || "https://roullepro.com"}/suivi-demande/${suiviToken}`
      : null;

    // --- Publication Facebook anonymisee (best-effort, jamais bloquante) ------
    // Uniquement pour une NOUVELLE demande creee (pas les doublons). Ne diffuse
    // que villes + departement : aucune donnee personnelle. Fire-and-forget : un
    // echec Facebook ne doit jamais bloquer ni ralentir la reponse au patient.
    void publierDemandeSurFacebook({
      typeTransport,
      dateSouhaitee: dateSouhaiteeIso,
      villeDepart,
      villeArrivee,
      departementCible,
      lieuDepart: lieuDepartRaw,
      lieuArrivee: lieuArriveeRaw || null,
    });

    // --- Pool regional : mutualisation inter-departementale -------------------
    // Le trigger dispatch_demande_transport() n'insere que les pros du
    // departement cible EXACT. Pour les regions mutualisees (ex. Ile-de-France),
    // on etend la proposition a TOUS les pros inscrits du pool : un chauffeur du
    // 93 doit pouvoir accepter une course du 92. Additif et idempotent
    // (ignoreDuplicates) : ces lignes rendent la course visible dans l'espace
    // pro (RPC demandes_pro_dashboard) et declenchent l'email ci-dessous.
    // Best-effort : toute erreur est capturee et ne bloque jamais le depot.
    // L'exclusivite d'une demande ciblee sur une fiche claimed est preservee.
    try {
      const departementsPool = departementsPoolRegional(departementCible);
      const cibleClaimedExclusive = await (async () => {
        if (!proIdCible) return false;
        const { data: proCible } = await supabase
          .from("pros_sanitaire")
          .select("claimed")
          .eq("id", proIdCible)
          .maybeSingle();
        return (proCible as { claimed?: boolean } | null)?.claimed === true;
      })();

      if (departementsPool.length > 1 && !cibleClaimedExclusive) {
        const categories = CATEGORIES_COMPATIBLES[typeTransport];
        const { data: prosPool } = await supabase
          .from("pros_sanitaire")
          .select("id")
          .eq("claimed", true)
          .in("categorie", categories)
          .in("departement", departementsPool)
          // Semantique alignee sur le trigger : COALESCE(actif,true)=true,
          // COALESCE(suspendu,false)=false (les NULL sont eligibles).
          .or("actif.is.null,actif.eq.true")
          .or("suspendu.is.null,suspendu.eq.false");

        const lignesPool =
          (prosPool as { id: string }[] | null)?.map((p) => ({
            demande_id: demande.id,
            pro_id: p.id,
            statut: "proposee",
          })) ?? [];

        if (lignesPool.length > 0) {
          await supabase
            .from("demandes_transport_pros")
            .upsert(lignesPool, {
              onConflict: "demande_id,pro_id",
              ignoreDuplicates: true,
            });
        }
      }
    } catch (e) {
      console.error("[demande-transport] pool regional error", e);
    }

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

    // --- SMS transactionnels aux pros opt-in (best-effort, jamais bloquant) ---
    // Tolerant a l'absence des colonnes/tables SMS (avant application de la
    // migration) : toute erreur est capturee et l'envoi email n'est pas impacte.
    const proIdsNotifies = rows.map((r) => r.pro_id).filter(Boolean);
    if (proIdsNotifies.length > 0) {
      try {
        const { data: smsPros, error: smsSelErr } = await supabase
          .from("pros_sanitaire")
          .select("id, sms_notifications, telephone_sms, phone_e164")
          .in("id", proIdsNotifies)
          .eq("sms_notifications", true);

        if (!smsSelErr && smsPros && smsPros.length > 0) {
          const contenu = construireMessageSmsCourse({
            typeTransport,
            dateSouhaitee: dateSouhaiteeIso,
            villeDepart: villeDepart || villeCible,
            departement: departementCible,
          });

          // Numeros normalises en E.164 (fallback phone_e164 si telephone_sms vide).
          type SmsProRow = {
            id: string;
            telephone_sms: string | null;
            phone_e164: string | null;
          };
          const cibles = (smsPros as SmsProRow[])
            .map((p) => {
              const brut = p.telephone_sms || p.phone_e164 || null;
              const numero = brut ? normaliserTelephoneFr(String(brut)) : null;
              return numero ? { proId: p.id, numero } : null;
            })
            .filter((x): x is { proId: string; numero: string } => x !== null);

          // Exclusion des numeros presents dans sms_optout (table tolerante).
          let optout = new Set<string>();
          if (cibles.length > 0) {
            try {
              const { data: outRows } = await supabase
                .from("sms_optout")
                .select("numero")
                .in(
                  "numero",
                  cibles.map((c) => c.numero)
                );
              optout = new Set(
                ((outRows as { numero: string }[] | null) || []).map((r) => r.numero)
              );
            } catch {
              // Table absente : aucun opt-out connu, on continue.
            }
          }

          const aEnvoyer = cibles.filter((c) => !optout.has(c.numero));

          await Promise.allSettled(
            aEnvoyer.map(async ({ proId, numero }) => {
              const res = await envoyerSmsTransactionnel({
                to: numero,
                content: contenu,
                tag: "demande-transport",
              });
              try {
                await supabase.from("sms_log").insert({
                  destinataire: numero,
                  pro_id: proId,
                  demande_id: demande.id,
                  type: "transactionnel",
                  contenu,
                  statut: res.ok ? "envoye" : "echec",
                  brevo_message_id: res.messageId || null,
                  erreur: res.erreur || null,
                });
              } catch {
                // Table sms_log absente : journalisation ignoree.
              }
            })
          );
        }
      } catch (e) {
        console.error("[demande-transport] SMS pros error", e);
      }
    }

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
        suiviUrl,
      }).catch(() => undefined);
    }

    // --- SMS de confirmation au patient (best-effort, jamais bloquant) --------
    // Rassure le patient des le depot pour reduire les re-soumissions. Numero
    // patient stocke en national (ex. "0663603304") : normalise en +33 par le
    // helper. Numero absent/invalide -> ignore silencieusement (pas d'echec).
    try {
      const numeroPatient = normaliserTelephoneFr(telephone);
      if (numeroPatient) {
        const contenuPatient = construireMessageSmsDepotPatient({
          typeTransport,
          dateSouhaitee: dateSouhaiteeIso,
        });
        const resPatient = await envoyerSmsTransactionnel({
          to: numeroPatient,
          content: contenuPatient,
          tag: "patient-depot",
        });
        try {
          await supabase.from("sms_log").insert({
            destinataire: numeroPatient,
            pro_id: null,
            demande_id: demande.id,
            type: "patient_depot",
            contenu: contenuPatient,
            statut: resPatient.ok ? "envoye" : "echec",
            brevo_message_id: resPatient.messageId || null,
            erreur: resPatient.erreur || null,
          });
        } catch {
          // Table sms_log absente : journalisation ignoree.
        }
      }
    } catch (e) {
      console.error("[demande-transport] SMS patient depot error", e);
    }

    // --- SMS de recrutement aux pros NON inscrits ----------------------------
    // PUREMENT ADDITIF : n'altere ni le dispatch, ni les pros inscrits notifies
    // ci-dessus. Etape 1 : commune de depart exacte (ville_slug). Etape 2 (repli
    // geographique) : si la commune exacte ne donne AUCUNE cible eligible,
    // elargir aux pros non inscrits du meme departement a moins de 15 km, tries
    // par distance. Fiches non revendiquees (claimed=false) actives, mobile
    // public 06/07 uniquement, opt-out respecte, plafond 8, fenetre 8 h-20 h
    // Paris. Best-effort : toute erreur est capturee et ne fait jamais echouer
    // le depot ni le dispatch normal.
    let prosNonInscritsPrevenus = 0;
    try {
      const villeRecrutement = villeDepart || villeCible;
      const slugCommune = communeSlugRecrutement(villeRecrutement);
      if (slugCommune && villeRecrutement && dansFenetreEnvoiParis(new Date())) {
        const categorie = TYPE_TRANSPORT_TO_CATEGORIE[typeTransport];
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://roullepro.com";

        // Numeros candidats (mobiles FR uniquement) -> opt-out connus.
        const chargerOptout = async (numeros: string[]): Promise<Set<string>> => {
          if (numeros.length === 0) return new Set<string>();
          try {
            const { data: outRows } = await supabase
              .from("sms_optout")
              .select("numero")
              .in("numero", numeros);
            return new Set(
              ((outRows as { numero: string }[] | null) || []).map((r) => r.numero)
            );
          } catch {
            // Table absente : aucun opt-out connu, on continue.
            return new Set<string>();
          }
        };

        const numerosDe = (pros: { telephone_public: string | null }[]) =>
          Array.from(
            new Set(
              pros
                .map((p) => normaliserMobileRecrutement(p.telephone_public))
                .filter((n): n is string => n !== null)
            )
          );

        // Envoie les SMS aux cibles retenues et journalise ; renvoie le nombre
        // d'envois reussis.
        const envoyerCibles = async (cibles: CibleRecrutement[]): Promise<number> => {
          const resultats = await Promise.allSettled(
            cibles.map(async ({ proId, numero }) => {
              const contenu = construireMessageSmsRecrutement({
                typeTransport,
                dateSouhaitee: dateSouhaiteeIso,
                villeDepart: villeRecrutement,
                url: `${appUrl}/transport-medical/pro/reclamer?pro=${proId}`,
              });
              const res = await envoyerSmsTransactionnel({
                to: numero,
                content: contenu,
                tag: "recrutement-course",
              });
              try {
                await supabase.from("sms_log").insert({
                  destinataire: numero,
                  pro_id: proId,
                  demande_id: demande.id,
                  type: "recrutement_course",
                  contenu,
                  statut: res.ok ? "envoye" : "echec",
                  brevo_message_id: res.messageId || null,
                  erreur: res.erreur || null,
                });
              } catch {
                // Table sms_log absente : journalisation ignoree.
              }
              return res.ok;
            })
          );
          return resultats.filter(
            (r) => r.status === "fulfilled" && r.value === true
          ).length;
        };

        type ProNiRow = {
          id: string;
          telephone_public: string | null;
          actif: boolean | null;
          suspendu: boolean | null;
        };

        // --- Etape 1 : commune de depart exacte (ville_slug) ------------------
        let cibles: CibleRecrutement[] = [];
        const { data: prosNi, error: niErr } = await supabase
          .from("pros_sanitaire")
          .select("id, telephone_public, actif, suspendu")
          .eq("claimed", false)
          .eq("categorie", categorie)
          .eq("ville_slug", slugCommune);

        if (!niErr && prosNi && prosNi.length > 0) {
          // Semantique alignee sur le trigger : COALESCE(actif,true), COALESCE(suspendu,false).
          const eligibles = (prosNi as ProNiRow[]).filter(
            (p) => p.actif !== false && p.suspendu !== true
          );
          const optout = await chargerOptout(numerosDe(eligibles));
          cibles = selectionnerCiblesRecrutement({
            pros: eligibles,
            optout,
            plafond: PLAFOND_SMS_RECRUTEMENT,
          });
        }

        // --- Etape 2 : repli geographique 15 km (meme departement) ------------
        // Uniquement si la commune exacte n'a donne AUCUNE cible eligible, et si
        // le point de depart et le departement sont connus.
        const departementRepli = departementDepart || departementCible;
        if (cibles.length === 0 && lieuDepartLat != null && lieuDepartLng != null && departementRepli) {
          const { data: prosRepli, error: repliErr } = await supabase
            .from("pros_sanitaire")
            .select("id, telephone_public, actif, suspendu, latitude, longitude")
            .eq("claimed", false)
            .eq("categorie", categorie)
            .eq("departement", departementRepli)
            .neq("ville_slug", slugCommune)
            .not("latitude", "is", null)
            .not("longitude", "is", null)
            .limit(500);

          if (!repliErr && prosRepli && prosRepli.length > 0) {
            // Filtre rayon + tri par distance croissante (fonction pure).
            const prosProches = selectionnerProsDansRayon({
              depart: { lat: lieuDepartLat, lng: lieuDepartLng },
              pros: prosRepli as ProRepliGeo[],
              rayonKm: RAYON_REPLI_KM,
            });
            const optout = await chargerOptout(numerosDe(prosProches));
            // selectionnerCiblesRecrutement preserve l'ordre : les pros les plus
            // proches sont retenus en priorite lors de l'application du plafond.
            cibles = selectionnerCiblesRecrutement({
              pros: prosProches,
              optout,
              plafond: PLAFOND_SMS_RECRUTEMENT,
            });
          }
        }

        if (cibles.length > 0) {
          prosNonInscritsPrevenus = await envoyerCibles(cibles);
        }
      }
    } catch (e) {
      console.error("[demande-transport] SMS recrutement error", e);
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
        pros_non_inscrits_prevenus: prosNonInscritsPrevenus,
      });
      await supabase
        .from("demandes_transport")
        .update({ admin_email_sent_at: new Date().toISOString() })
        .eq("id", demande.id);
    } catch (e) {
      console.error("[admin notif] failed", e);
    }

    return NextResponse.json({ ok: true, pros_notifies: prosNotifies, suivi_token: suiviToken });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
