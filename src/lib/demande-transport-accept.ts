/**
 * Orchestration des emails déclenchés à l'acceptation d'une demande de transport.
 * Partagé entre la route /accepter (pro authentifié) et /accepter-direct (lien signé).
 * Tous les envois sont best-effort : un échec email ne doit pas casser l'acceptation.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { LIBELLE_TYPE_TRANSPORT, type TypeTransport } from "@/lib/transport-types";
import {
  sendDemandeTransportAcceptationPro,
  sendDemandeTransportAcceptationClient,
  sendDemandeTransportAutreAcceptee,
} from "@/lib/email";
import {
  construireMessageSmsAcceptationPatient,
  envoyerSmsTransactionnel,
  normaliserTelephoneFr,
} from "@/lib/sms";

type DemandeRow = {
  id: string;
  nom: string | null;
  telephone: string | null;
  email: string | null;
  type_transport: string;
  lieu_depart: string | null;
  lieu_arrivee: string | null;
  date_souhaitee: string | null;
  aller_retour: boolean | null;
  mobilite: string | null;
  precisions: string | null;
  taux_prise_en_charge: string | null;
  taux_prise_en_charge_autre: string | null;
  bon_transport_medical: boolean | null;
};

/**
 * Envoie les notifications post-acceptation pour une demande attribuée à un pro.
 * @param fallbackProEmail email de secours (ex: email de session) si le pro n'a pas d'email public.
 */
export async function notifyDemandeAcceptee(
  admin: SupabaseClient,
  demandeId: string,
  acceptedProId: string,
  fallbackProEmail?: string | null
): Promise<void> {
  const { data: demande } = await admin
    .from("demandes_transport")
    .select(
      "id, nom, telephone, email, type_transport, lieu_depart, lieu_arrivee, date_souhaitee, aller_retour, mobilite, precisions, taux_prise_en_charge, taux_prise_en_charge_autre, bon_transport_medical"
    )
    .eq("id", demandeId)
    .maybeSingle();

  if (!demande) return;
  const d = demande as DemandeRow;
  const libelle =
    LIBELLE_TYPE_TRANSPORT[d.type_transport as TypeTransport] || d.type_transport;

  const { data: pro } = await admin
    .from("pros_sanitaire")
    .select("email_public, telephone_public, nom_commercial, raison_sociale")
    .eq("id", acceptedProId)
    .maybeSingle();

  const proNom = pro?.nom_commercial || pro?.raison_sociale || "Professionnel";
  const proEmail = pro?.email_public || fallbackProEmail || null;

  // GAP1 — email au pro qui accepte (coordonnées client en clair).
  if (proEmail) {
    await sendDemandeTransportAcceptationPro({
      to: proEmail,
      proNom,
      clientNom: d.nom,
      clientTelephone: d.telephone,
      clientEmail: d.email,
      typeLibelle: libelle,
      lieuDepart: d.lieu_depart,
      lieuArrivee: d.lieu_arrivee,
      dateSouhaitee: d.date_souhaitee,
      allerRetour: !!d.aller_retour,
      mobilite: d.mobilite,
      precisions: d.precisions,
      tauxPriseEnCharge: d.taux_prise_en_charge,
      tauxPriseEnChargeAutre: d.taux_prise_en_charge_autre,
      bonTransportMedical: !!d.bon_transport_medical,
      demandeId: d.id,
    }).catch(() => undefined);
  }

  // GAP2 — email au client : le pro accepteur, son nom et son téléphone.
  if (d.email) {
    await sendDemandeTransportAcceptationClient({
      to: d.email,
      clientNom: d.nom,
      proNom,
      proTelephone: pro?.telephone_public || null,
      typeLibelle: libelle,
      lieuDepart: d.lieu_depart,
      lieuArrivee: d.lieu_arrivee,
      dateSouhaitee: d.date_souhaitee,
      allerRetour: !!d.aller_retour,
      tauxPriseEnCharge: d.taux_prise_en_charge,
      tauxPriseEnChargeAutre: d.taux_prise_en_charge_autre,
      bonTransportMedical: !!d.bon_transport_medical,
    }).catch(() => undefined);
  }

  // SMS au patient : sa course est prise en charge (complete l'email GAP2).
  // Best-effort, jamais bloquant. Numero patient normalise en +33 ; absent ou
  // invalide -> ignore silencieusement. Journalise dans sms_log ('patient_acceptation').
  try {
    const numeroPatient = d.telephone ? normaliserTelephoneFr(d.telephone) : null;
    if (numeroPatient) {
      const contenu = construireMessageSmsAcceptationPatient({
        dateSouhaitee: d.date_souhaitee,
        proNom,
      });
      const res = await envoyerSmsTransactionnel({
        to: numeroPatient,
        content: contenu,
        tag: "patient-acceptation",
      });
      try {
        await admin.from("sms_log").insert({
          destinataire: numeroPatient,
          pro_id: null,
          demande_id: d.id,
          type: "patient_acceptation",
          contenu,
          statut: res.ok ? "envoye" : "echec",
          brevo_message_id: res.messageId || null,
          erreur: res.erreur || null,
        });
      } catch {
        // Table sms_log absente : journalisation ignoree.
      }
    }
  } catch {
    // Aucune erreur SMS ne doit casser l'acceptation.
  }

  // GAP3 — info aux autres pros RoullePro repassés en 'autre_acceptee' par le trigger.
  const { data: autres } = await admin
    .from("demandes_transport_pros")
    .select("pro_id, pros_sanitaire ( email_public, nom_commercial, raison_sociale )")
    .eq("demande_id", demandeId)
    .eq("statut", "autre_acceptee");

  type AutreRow = {
    pro_id: string;
    pros_sanitaire: {
      email_public: string | null;
      nom_commercial: string | null;
      raison_sociale: string | null;
    } | null;
  };
  const autresRows = ((autres as AutreRow[] | null) || []).filter(
    (r) => r.pro_id !== acceptedProId
  );

  await Promise.all(
    autresRows.map((row) => {
      const to = row.pros_sanitaire?.email_public;
      if (!to) return Promise.resolve();
      return sendDemandeTransportAutreAcceptee({
        to,
        proNom:
          row.pros_sanitaire?.nom_commercial ||
          row.pros_sanitaire?.raison_sociale ||
          "Professionnel",
        typeLibelle: libelle,
        lieuDepart: d.lieu_depart,
        lieuArrivee: d.lieu_arrivee,
        dateSouhaitee: d.date_souhaitee,
      }).catch(() => undefined);
    })
  );
}
