/**
 * Orchestration des emails déclenchés à l'acceptation d'une demande de transport.
 * Partagé entre la route /accepter (pro authentifié) et /accepter-direct (lien signé).
 * Tous les envois sont best-effort : un échec email ne doit pas casser l'acceptation.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { LIBELLE_TYPE_TRANSPORT, type TypeTransport } from "@/lib/transport-types";
import {
  sendDemandeTransportAcceptationPro,
} from "@/lib/email";

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
}
