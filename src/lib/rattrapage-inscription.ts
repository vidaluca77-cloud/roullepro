/**
 * Rattrapage des demandes ouvertes a l'inscription d'un pro.
 *
 * Contexte : les SMS de recrutement (cf. sms-recrutement.ts) demarchent des
 * pros NON inscrits quand une demande arrive. Lorsqu'un pro revendique enfin sa
 * fiche (flux claim), la demande qui l'avait motive n'etait rattachee a son
 * profil que manuellement. Ce module rattache automatiquement, apres un claim
 * reussi, les demandes ouvertes pertinentes au nouveau pro :
 *   1. demande encore ouverte (statut non ferme) ;
 *   2. date_souhaitee dans le futur ;
 *   3. deposee dans les 7 derniers jours ;
 *   4. categorie compatible (CATEGORIES_COMPATIBLES) ;
 *   5. match geographique : pool regional (Ile-de-France) > meme commune
 *      (ville_slug) > repli 15 km si la demande est geocodee.
 *
 * La selection (`selectionnerDemandesEligibles`) est PURE et testee. L'envoi
 * effectif (upsert idempotent, email de proposition signe, increment
 * pros_notifies) reste best-effort : jamais bloquant pour le claim.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import {
  CATEGORIES_COMPATIBLES,
  LIBELLE_TYPE_TRANSPORT,
  type CategoriePro,
  type TypeTransport,
} from "@/lib/transport-types";
import { departementsPoolRegional } from "@/lib/pool-regional";
import { distanceHaversineKm } from "@/lib/distance-course";
import { communeSlugRecrutement, RAYON_REPLI_KM } from "@/lib/sms-recrutement";
import { sendDemandeTransportPro } from "@/lib/email";

/** Fenetre de depot retenue : demandes des 7 derniers jours. */
export const FENETRE_RATTRAPAGE_JOURS = 7;

/**
 * Statuts de demande consideres FERMES (plus rattachables). Une demande dont le
 * statut n'est pas dans cet ensemble est « ouverte » (typiquement 'envoyee').
 */
export const STATUTS_DEMANDE_FERMES = new Set<string>([
  "acceptee",
  "annulee",
  "expiree",
  "terminee",
]);

/** Demande minimale necessaire a la selection (colonnes de demandes_transport). */
export type DemandeRattrapage = {
  id: string;
  type_transport: string | null;
  statut: string | null;
  date_souhaitee: string | null;
  created_at: string | null;
  departement_cible: string | null;
  ville_cible: string | null;
  lieu_depart_lat: number | null;
  lieu_depart_lng: number | null;
};

/** Profil pro minimal necessaire au matching. */
export type ProRattrapage = {
  categorie: string | null;
  departement: string | null;
  ville_slug: string | null;
  latitude: number | null;
  longitude: number | null;
};

/** Vrai si le pro peut assurer le type de transport demande. */
function categorieCompatible(
  typeTransport: string | null,
  categoriePro: string | null
): boolean {
  if (!typeTransport || !categoriePro) return false;
  const categories = CATEGORIES_COMPATIBLES[typeTransport as TypeTransport];
  if (!categories) return false;
  return categories.includes(categoriePro as CategoriePro);
}

/**
 * Vrai si la demande est geographiquement pertinente pour le pro. Reutilise
 * l'existant sans le reinventer, dans l'ordre du dispatch :
 *   - pool regional : le departement cible est dans le meme pool multi-
 *     departemental que le pro (ex. Ile-de-France). Aligne sur la route de
 *     dispatch, on ne considere le pool que s'il compte plus d'un departement
 *     (sinon un pro « rattraperait » toutes les demandes de son departement) ;
 *   - sinon meme commune : le slug de la ville cible == ville_slug du pro ;
 *   - sinon repli 15 km : si la demande est geocodee et le pro localise,
 *     distance haversine <= RAYON_REPLI_KM.
 */
function matchGeographique(
  demande: DemandeRattrapage,
  pro: ProRattrapage
): boolean {
  const pool = departementsPoolRegional(pro.departement);
  if (
    pool.length > 1 &&
    demande.departement_cible &&
    pool.includes(demande.departement_cible)
  ) {
    return true;
  }

  const slugDemande = communeSlugRecrutement(demande.ville_cible);
  if (slugDemande && pro.ville_slug && slugDemande === pro.ville_slug) {
    return true;
  }

  if (
    demande.lieu_depart_lat != null &&
    demande.lieu_depart_lng != null &&
    Number.isFinite(demande.lieu_depart_lat) &&
    Number.isFinite(demande.lieu_depart_lng) &&
    pro.latitude != null &&
    pro.longitude != null &&
    Number.isFinite(pro.latitude) &&
    Number.isFinite(pro.longitude)
  ) {
    const distance = distanceHaversineKm(
      { lat: pro.latitude, lng: pro.longitude },
      { lat: demande.lieu_depart_lat, lng: demande.lieu_depart_lng }
    );
    if (distance <= RAYON_REPLI_KM) return true;
  }

  return false;
}

/**
 * Selectionne, parmi les demandes fournies, celles eligibles au rattrapage pour
 * le pro. Fonction PURE : cœur testable de la feature. Applique dans l'ordre :
 * statut ouvert, date future, fenetre 7 jours, categorie compatible, match
 * geographique. Ne fait aucun acces reseau.
 */
export function selectionnerDemandesEligibles(params: {
  pro: ProRattrapage;
  demandes: DemandeRattrapage[];
  now?: Date;
}): DemandeRattrapage[] {
  const now = params.now ?? new Date();
  const nowMs = now.getTime();
  const seuilDepot = nowMs - FENETRE_RATTRAPAGE_JOURS * 24 * 60 * 60 * 1000;

  return params.demandes.filter((demande) => {
    if (demande.statut && STATUTS_DEMANDE_FERMES.has(demande.statut)) {
      return false;
    }

    const dateSouhaitee = demande.date_souhaitee
      ? new Date(demande.date_souhaitee).getTime()
      : NaN;
    if (Number.isNaN(dateSouhaitee) || dateSouhaitee <= nowMs) return false;

    const depot = demande.created_at
      ? new Date(demande.created_at).getTime()
      : NaN;
    if (Number.isNaN(depot) || depot < seuilDepot) return false;

    if (!categorieCompatible(demande.type_transport, params.pro.categorie)) {
      return false;
    }

    return matchGeographique(demande, params.pro);
  });
}

/** Colonnes de demandes_transport necessaires a la selection + l'email. */
const COLONNES_DEMANDE =
  "id, type_transport, statut, date_souhaitee, created_at, departement_cible, " +
  "ville_cible, lieu_depart, lieu_arrivee, lieu_depart_lat, lieu_depart_lng, " +
  "aller_retour, mobilite, precisions, taux_prise_en_charge, " +
  "taux_prise_en_charge_autre, bon_transport_medical, source_form, distance_km, " +
  "prix_estime, pros_notifies";

type DemandeComplete = DemandeRattrapage & {
  lieu_depart: string | null;
  lieu_arrivee: string | null;
  aller_retour: boolean | null;
  mobilite: string | null;
  precisions: string | null;
  taux_prise_en_charge: string | null;
  taux_prise_en_charge_autre: string | null;
  bon_transport_medical: boolean | null;
  source_form: string | null;
  distance_km: number | null;
  prix_estime: number | null;
  pros_notifies: number | null;
};

/**
 * Rattache automatiquement les demandes ouvertes pertinentes au pro qui vient
 * de revendiquer sa fiche. Best-effort de bout en bout : toute erreur est
 * capturee et journalisee ; le claim appelant ne doit jamais echouer a cause
 * du rattrapage. Renvoie le nombre de demandes nouvellement proposees.
 */
export async function rattraperDemandesPourPro(params: {
  admin: SupabaseClient;
  proId: string;
  now?: Date;
}): Promise<{ rattrapees: number }> {
  const { admin, proId } = params;
  const now = params.now ?? new Date();

  try {
    const { data: proRow } = await admin
      .from("pros_sanitaire")
      .select(
        "id, categorie, departement, ville_slug, latitude, longitude, nom_commercial, raison_sociale, email_public"
      )
      .eq("id", proId)
      .maybeSingle();
    if (!proRow) return { rattrapees: 0 };

    const pro = proRow as ProRattrapage & {
      nom_commercial: string | null;
      raison_sociale: string | null;
      email_public: string | null;
    };
    if (!pro.email_public) return { rattrapees: 0 };

    // Prefiltre SQL grossier (statut ouvert + fenetre 7 jours) ; le matching fin
    // categorie/geo/date se fait dans la fonction pure.
    const seuilIso = new Date(
      now.getTime() - FENETRE_RATTRAPAGE_JOURS * 24 * 60 * 60 * 1000
    ).toISOString();
    const { data: demandesRows } = await admin
      .from("demandes_transport")
      .select(COLONNES_DEMANDE)
      .not("statut", "in", "(acceptee,annulee,expiree,terminee)")
      .gte("created_at", seuilIso)
      .gt("date_souhaitee", now.toISOString());

    const demandes = (demandesRows as DemandeComplete[] | null) || [];
    const eligibles = selectionnerDemandesEligibles({
      pro,
      demandes,
      now,
    }) as DemandeComplete[];
    if (eligibles.length === 0) return { rattrapees: 0 };

    // Ne notifier que les demandes pas deja rattachees a ce pro.
    const ids = eligibles.map((d) => d.id);
    const { data: existantes } = await admin
      .from("demandes_transport_pros")
      .select("demande_id")
      .eq("pro_id", proId)
      .in("demande_id", ids);
    const dejaLiees = new Set(
      ((existantes as { demande_id: string }[] | null) || []).map(
        (r) => r.demande_id
      )
    );

    // Upsert idempotent de toutes les eligibles (statut 'proposee').
    await admin.from("demandes_transport_pros").upsert(
      eligibles.map((d) => ({
        demande_id: d.id,
        pro_id: proId,
        statut: "proposee",
      })),
      { onConflict: "demande_id,pro_id", ignoreDuplicates: true }
    );

    const proNom =
      pro.nom_commercial || pro.raison_sociale || "Professionnel";
    let rattrapees = 0;

    for (const demande of eligibles) {
      if (dejaLiees.has(demande.id)) continue;

      const typeTransport = demande.type_transport as TypeTransport | null;
      const libelle =
        (typeTransport && LIBELLE_TYPE_TRANSPORT[typeTransport]) ||
        demande.type_transport ||
        "transport";

      const sent = await sendDemandeTransportPro({
        to: pro.email_public,
        proNom,
        typeLibelle: libelle,
        lieuDepart: demande.lieu_depart,
        lieuArrivee: demande.lieu_arrivee || demande.ville_cible || null,
        dateSouhaitee: demande.date_souhaitee,
        allerRetour: !!demande.aller_retour,
        mobilite: demande.mobilite,
        precisions: demande.precisions,
        tauxPriseEnCharge: demande.taux_prise_en_charge,
        tauxPriseEnChargeAutre: demande.taux_prise_en_charge_autre,
        bonTransportMedical: !!demande.bon_transport_medical,
        sourceForm: demande.source_form,
        typeTransport: demande.type_transport,
        distanceKm: demande.distance_km,
        prixEstime: demande.prix_estime,
        demandeId: demande.id,
        proId,
      }).catch(() => null);

      if (!sent) continue;
      rattrapees += 1;

      // Increment best-effort de pros_notifies (aligne sur le compteur du
      // dispatch). Lecture + ecriture : concurrence acceptable ici.
      await admin
        .from("demandes_transport")
        .update({ pros_notifies: (demande.pros_notifies ?? 0) + 1 })
        .eq("id", demande.id);
    }

    return { rattrapees };
  } catch (err) {
    console.error(
      "[rattrapage-inscription] erreur:",
      err instanceof Error ? err.message : err
    );
    return { rattrapees: 0 };
  }
}
