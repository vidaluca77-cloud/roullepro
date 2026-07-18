"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Phone,
  MapPin,
  Clock,
  Mail,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Car,
  Cross,
  Stethoscope,
  Sparkles,
} from "lucide-react";
import { LIBELLE_TYPE_TRANSPORT, type TypeTransport } from "@/lib/transport-types";
import { MENTION_ESTIMATION_CPAM } from "@/lib/tarif-cpam";
import { MENTION_ESTIMATION_TRANSPORT_SANITAIRE } from "@/lib/tarif-transport-sanitaire";

export type DemandeProRow = {
  dtp_id: string;
  demande_id: string;
  pro_id: string;
  dtp_statut: string;
  // Statut de la demande mere. Optionnel : absent tant que la migration
  // 20260718150000 n'est pas appliquee (l'ancien RPC ne le renvoie pas).
  demande_statut?: string | null;
  proposee_at: string | null;
  acceptee_at: string | null;
  type_transport: string | null;
  lieu_depart: string | null;
  lieu_arrivee: string | null;
  date_souhaitee: string | null;
  aller_retour: boolean | null;
  mobilite: string | null;
  precisions: string | null;
  taux_prise_en_charge: string | null;
  taux_prise_en_charge_autre: string | null;
  bon_transport_medical: boolean | null;
  source_form: string | null;
  distance_km: number | null;
  prix_estime: number | null;
  demandeur_nom: string | null;
  demandeur_telephone: string | null;
  demandeur_email: string | null;
};

/**
 * Mention indicative adaptee au type de transport : taxi -> convention CPAM ;
 * VSL / ambulance -> convention nationale des transporteurs sanitaires.
 */
function mentionEstimation(typeTransport: string | null): string {
  return typeTransport === "vsl" || typeTransport === "ambulance"
    ? MENTION_ESTIMATION_TRANSPORT_SANITAIRE
    : MENTION_ESTIMATION_CPAM;
}

/** Ligne "Distance estimée : X km · Estimation : ~Y €" (null si rien). */
function formatEstimation(distanceKm: number | null, prixEstime: number | null): string | null {
  const parts: string[] = [];
  if (typeof distanceKm === "number" && distanceKm > 0) parts.push(`Distance estimée : ${distanceKm} km`);
  if (typeof prixEstime === "number" && prixEstime > 0) parts.push(`Estimation : ~${prixEstime} €`);
  return parts.length ? parts.join(" · ") : null;
}

const LABEL_MOBILITE: Record<string, string> = {
  autonome: "Autonome",
  aide_marche: "Aide à la marche",
  fauteuil: "Fauteuil roulant",
  brancard: "Allongé / brancard",
};

const ICONES: Record<TypeTransport, typeof Car> = {
  taxi: Car,
  vsl: Stethoscope,
  ambulance: Cross,
};

function libelleType(type: string | null): string {
  if (type && type in LIBELLE_TYPE_TRANSPORT) {
    return LIBELLE_TYPE_TRANSPORT[type as TypeTransport];
  }
  return "Transport";
}

function libelleTaux(taux: string | null, autre: string | null): string | null {
  if (!taux) return null;
  if (taux === "100") return "Prise en charge 100 %";
  if (taux === "65") return "Prise en charge 65 %";
  if (taux === "autre") return autre ? `Prise en charge : ${autre}` : "Prise en charge : autre";
  return null;
}

function formatDate(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleString("fr-FR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Paris",
  });
}

function formatCourt(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Paris",
  });
}

function Trajet({ d }: { d: DemandeProRow }) {
  const dateLabel = formatDate(d.date_souhaitee);
  const taux = libelleTaux(d.taux_prise_en_charge, d.taux_prise_en_charge_autre);
  const estimation = formatEstimation(d.distance_km, d.prix_estime);
  return (
    <div className="space-y-2 mt-2">
      <div className="flex items-start gap-2 text-sm text-gray-700">
        <MapPin className="w-4 h-4 text-[#0066CC] flex-shrink-0 mt-0.5" />
        <span>
          {d.lieu_depart || "Départ non précisé"}
          <ArrowRight className="inline w-3.5 h-3.5 mx-1 text-gray-400" />
          {d.lieu_arrivee || "Arrivée non précisée"}
          {d.aller_retour ? " (aller-retour)" : ""}
        </span>
      </div>
      {dateLabel && (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <span className="capitalize">{dateLabel}</span>
        </div>
      )}
      {estimation && (
        <div className="bg-blue-50 border border-blue-100 rounded-lg px-2.5 py-1.5">
          <div className="text-xs font-semibold text-blue-800">{estimation}</div>
          <div className="text-[10px] text-gray-500 mt-0.5">{mentionEstimation(d.type_transport)}</div>
        </div>
      )}
      <div className="flex flex-wrap gap-1.5 text-[11px]">
        {d.mobilite && (
          <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
            {LABEL_MOBILITE[d.mobilite] || d.mobilite}
          </span>
        )}
        {taux && (
          <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">{taux}</span>
        )}
        <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
          {d.bon_transport_medical ? "Avec bon de transport" : "Sans bon de transport"}
        </span>
      </div>
      {d.precisions && (
        <div className="bg-amber-50 border border-amber-100 rounded-lg p-2 text-xs text-amber-900 whitespace-pre-line">
          {d.precisions}
        </div>
      )}
    </div>
  );
}

function CarteProposee({ d, peutAccepter }: { d: DemandeProRow; peutAccepter: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState<"accepter" | "refuser" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const Icon = (d.type_transport && d.type_transport in ICONES
    ? ICONES[d.type_transport as TypeTransport]
    : Car) as typeof Car;

  const isNouvelle =
    !!d.proposee_at && Date.now() - new Date(d.proposee_at).getTime() < 24 * 60 * 60 * 1000;

  // Verrou abonnement côté serveur (403) : bascule l'affichage vers le CTA d'abonnement.
  const [abonnementRequis, setAbonnementRequis] = useState(!peutAccepter);

  const action = async (kind: "accepter" | "refuser") => {
    setError(null);
    setLoading(kind);
    try {
      const res = await fetch(`/api/demande-transport/${d.demande_id}/${kind}`, {
        method: "POST",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (res.status === 403 && data?.code === "abonnement_requis") {
          setAbonnementRequis(true);
        }
        setError(data?.error || "Une erreur est survenue. Réessaie.");
        setLoading(null);
        return;
      }
      router.refresh();
    } catch {
      setError("Connexion impossible. Réessaie.");
      setLoading(null);
    }
  };

  return (
    <li
      className={`p-3 rounded-xl border ${isNouvelle ? "bg-amber-50 border-amber-200" : "bg-white border-gray-200"}`}
    >
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1.5 font-semibold text-sm text-gray-900">
          <Icon className="w-4 h-4 text-[#0066CC]" />
          {libelleType(d.type_transport)}
        </div>
        {isNouvelle && (
          <span className="text-[10px] font-bold uppercase bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded">
            Nouveau
          </span>
        )}
      </div>
      <Trajet d={d} />
      <div className="mt-2 text-xs text-gray-400">
        {d.demandeur_nom || "Demandeur"}
        {d.demandeur_telephone ? ` · ${d.demandeur_telephone}` : ""}
        <span className="ml-1">(coordonnées révélées après acceptation)</span>
      </div>
      {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
      {abonnementRequis ? (
        <div className="mt-3 bg-emerald-50 border border-emerald-200 rounded-lg p-3">
          <p className="text-xs text-emerald-900 mb-2">
            Votre période d&apos;essai est terminée — passez au plan Pro (19,90 €/mois TTC)
            pour accepter les courses.
          </p>
          <Link
            href="/transport-medical/tarifs?raison=abonnement_requis"
            className="inline-flex items-center justify-center gap-1.5 w-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-3 py-2 rounded-lg transition"
          >
            <Sparkles className="w-4 h-4" />
            S&apos;abonner pour accepter cette course
          </Link>
        </div>
      ) : (
        <div className="flex gap-2 mt-3">
          <button
            type="button"
            onClick={() => action("accepter")}
            disabled={loading !== null}
            className="inline-flex items-center justify-center gap-1.5 flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-sm font-semibold px-3 py-2 rounded-lg transition"
          >
            {loading === "accepter" ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}
            Accepter cette course
          </button>
          <button
            type="button"
            onClick={() => action("refuser")}
            disabled={loading !== null}
            className="inline-flex items-center justify-center gap-1.5 bg-gray-100 hover:bg-gray-200 disabled:opacity-60 text-gray-700 text-sm font-medium px-3 py-2 rounded-lg transition"
          >
            {loading === "refuser" ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Refuser
          </button>
        </div>
      )}
    </li>
  );
}

function CarteAcceptee({ d }: { d: DemandeProRow }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const tel = d.demandeur_telephone ? d.demandeur_telephone.replace(/\s/g, "") : null;

  const terminer = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/demande-transport/${d.demande_id}/terminer`, {
        method: "POST",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error || "Impossible de marquer comme terminée.");
        setLoading(false);
        return;
      }
      router.refresh();
    } catch {
      setError("Connexion impossible. Réessaie.");
      setLoading(false);
    }
  };

  return (
    <li className="p-3 rounded-xl border bg-emerald-50 border-emerald-200">
      <div className="flex items-center justify-between mb-1">
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full">
          <CheckCircle2 className="w-3.5 h-3.5" /> Acceptée
        </span>
        {d.acceptee_at && (
          <span className="text-[11px] text-gray-500">{formatCourt(d.acceptee_at)}</span>
        )}
      </div>
      <div className="font-semibold text-sm text-gray-900">{d.demandeur_nom || "Demandeur"}</div>
      {tel && (
        <a
          href={`tel:${tel}`}
          className="inline-flex items-center gap-1 text-sm font-semibold text-[#0066CC] hover:underline mt-0.5"
        >
          <Phone className="w-3.5 h-3.5" />
          {d.demandeur_telephone}
        </a>
      )}
      {d.demandeur_email && (
        <a
          href={`mailto:${d.demandeur_email}`}
          className="flex items-center gap-1 text-sm text-gray-600 hover:underline mt-0.5"
        >
          <Mail className="w-3.5 h-3.5" />
          {d.demandeur_email}
        </a>
      )}
      <Trajet d={d} />
      {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
      <div className="flex gap-2 mt-3">
        {tel && (
          <a
            href={`tel:${tel}`}
            className="inline-flex items-center justify-center gap-1.5 flex-1 bg-[#0066CC] hover:bg-[#0052a3] text-white text-sm font-semibold px-3 py-2 rounded-lg transition"
          >
            <Phone className="w-4 h-4" />
            Appeler
          </a>
        )}
        <button
          type="button"
          onClick={terminer}
          disabled={loading}
          className="inline-flex items-center justify-center gap-1.5 bg-gray-100 hover:bg-gray-200 disabled:opacity-60 text-gray-700 text-sm font-medium px-3 py-2 rounded-lg transition"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          Marquer comme terminée
        </button>
      </div>
    </li>
  );
}

function CartePassee({ d }: { d: DemandeProRow }) {
  const LABELS: Record<string, string> = {
    autre_acceptee: "Prise par un autre transporteur",
    declinee: "Déclinée",
    expiree: "Expirée",
    terminee: "Terminée",
  };
  return (
    <li className="p-3 rounded-xl border bg-gray-50 border-gray-200 opacity-80">
      <div className="flex items-center justify-between mb-1">
        <div className="font-semibold text-sm text-gray-600">{libelleType(d.type_transport)}</div>
        <span className="text-[10px] font-semibold uppercase bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded">
          {LABELS[d.dtp_statut] || d.dtp_statut}
        </span>
      </div>
      <div className="flex items-start gap-2 text-xs text-gray-500">
        <MapPin className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
        <span>
          {d.lieu_depart || "Départ"} → {d.lieu_arrivee || "Arrivée"}
        </span>
      </div>
    </li>
  );
}

function CarteAnnulee({ d }: { d: DemandeProRow }) {
  return (
    <li className="p-3 rounded-xl border bg-gray-50 border-gray-200 opacity-80">
      <div className="flex items-center justify-between mb-1">
        <div className="font-semibold text-sm text-gray-600">{libelleType(d.type_transport)}</div>
        <span className="text-[10px] font-semibold uppercase bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded">
          Annulée par le patient
        </span>
      </div>
      <div className="flex items-start gap-2 text-xs text-gray-500">
        <MapPin className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
        <span>
          {d.lieu_depart || "Départ"} → {d.lieu_arrivee || "Arrivée"}
        </span>
      </div>
    </li>
  );
}

export default function DemandesTransportSection({
  demandes,
  peutAccepter = true,
}: {
  demandes: DemandeProRow[];
  peutAccepter?: boolean;
}) {
  // Demande annulee par le patient : plus de bouton accepter, affichage dedie.
  const annulees = demandes.filter((d) => d.demande_statut === "annulee");
  const actives = demandes.filter((d) => d.demande_statut !== "annulee");
  const proposees = actives.filter((d) => d.dtp_statut === "proposee");
  const acceptees = actives.filter((d) => d.dtp_statut === "acceptee");
  // 'declinee' exclu : apres refus, la carte disparait du tableau de bord du pro.
  const passees = actives.filter(
    (d) => !["proposee", "acceptee", "declinee"].includes(d.dtp_statut)
  );

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <Car className="w-4 h-4 text-[#0066CC]" />
          Demandes de transport
        </h3>
        {proposees.length > 0 && (
          <span className="text-[11px] font-semibold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
            {proposees.length} nouvelle{proposees.length > 1 ? "s" : ""}
          </span>
        )}
      </div>

      {demandes.length === 0 ? (
        <p className="text-xs text-gray-500">
          Aucune demande pour le moment. Tu recevras ici les courses qui te sont proposées dès
          qu&apos;un patient en fait la demande sur RoullePro.
        </p>
      ) : (
        <ul className="space-y-3">
          {proposees.map((d) => (
            <CarteProposee key={d.dtp_id} d={d} peutAccepter={peutAccepter} />
          ))}
          {acceptees.map((d) => (
            <CarteAcceptee key={d.dtp_id} d={d} />
          ))}
          {passees.map((d) => (
            <CartePassee key={d.dtp_id} d={d} />
          ))}
          {annulees.map((d) => (
            <CarteAnnulee key={d.dtp_id} d={d} />
          ))}
        </ul>
      )}
    </div>
  );
}
