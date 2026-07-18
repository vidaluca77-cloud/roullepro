import Link from "next/link";
import { ShieldCheck, Clock, FileSignature, AlertCircle, XCircle } from "lucide-react";

// Section "Statut Ameli" du dashboard pro
//
// 3 etats possibles :
//  1. Conventionne verifie (ameli_conventionne=true ET ameli_last_seen)
//     -> badge vert read-only, source affichee (cnam_annuaire ou manual_verified)
//  2. Demande en cours (status=pending ou need_info)
//     -> message bleu/orange selon status, pas de bouton resoumettre
//  3. Aucun statut Ameli
//     -> bouton "Demander le badge Ameli" vers /transport-medical/pro/ameli-demande

type AmeliSource = "cnam_annuaire" | "manual_verified" | null;
type RequestStatus = "pending" | "approved" | "rejected" | "need_info" | "spam" | null;

interface AmeliStatusSectionProps {
  conventionne: boolean | null;
  lastSeen: string | null;
  source: AmeliSource;
  pendingRequest: {
    status: RequestStatus;
    createdAt: string;
    rejectionReason?: string | null;
  } | null;
  proId: string;
}

function formatDateFr(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric", timeZone: "Europe/Paris" });
}

export default function AmeliStatusSection({
  conventionne,
  lastSeen,
  source,
  pendingRequest,
  proId,
}: AmeliStatusSectionProps) {
  // Etat 1 : conventionne verifie
  if (conventionne && lastSeen) {
    const dateFr = formatDateFr(lastSeen);
    const sourceLabel =
      source === "cnam_annuaire"
        ? "annuaire sante CNAM"
        : source === "manual_verified"
        ? "verification manuelle"
        : "annuaire Ameli";
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-emerald-900 text-base mb-1">Statut Ameli verifie</h3>
            <p className="text-sm text-emerald-800 leading-relaxed">
              Votre societe est referencee comme conventionnee par l&apos;Assurance Maladie
              {dateFr ? <> (mise a jour {dateFr})</> : null}. Source : {sourceLabel}. Le badge
              est affiche publiquement sur votre fiche.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Etat 2 : demande en cours
  if (pendingRequest && pendingRequest.status === "pending") {
    const dateFr = formatDateFr(pendingRequest.createdAt);
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
            <Clock className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-blue-900 text-base mb-1">Demande Ameli en cours</h3>
            <p className="text-sm text-blue-800 leading-relaxed">
              Nous avons bien recu votre demande{dateFr ? <> du {dateFr}</> : null}. Notre equipe
              verifie votre dossier sous 5 jours ouvres. Vous recevrez un email avec la decision.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (pendingRequest && pendingRequest.status === "need_info") {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-5 h-5 text-amber-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-amber-900 text-base mb-1">Information complementaire requise</h3>
            <p className="text-sm text-amber-800 leading-relaxed mb-3">
              {pendingRequest.rejectionReason || "Notre equipe a besoin d'informations supplementaires pour valider votre demande."}
              {" "}Consultez votre email pour plus de details.
            </p>
            <Link
              href={`/transport-medical/pro/ameli-demande?pro=${proId}`}
              className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-medium px-3 py-2 rounded-lg text-sm transition"
            >
              Completer ma demande
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Etat 3 (rejected aussi) : invitation a (re)demander
  if (pendingRequest && pendingRequest.status === "rejected") {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
            <XCircle className="w-5 h-5 text-red-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 text-base mb-1">Demande precedente rejetee</h3>
            <p className="text-sm text-gray-700 leading-relaxed mb-3">
              {pendingRequest.rejectionReason || "Votre derniere demande n'a pas pu etre validee."}
              {" "}Vous pouvez soumettre une nouvelle demande avec un justificatif valide.
            </p>
            <Link
              href={`/transport-medical/pro/ameli-demande?pro=${proId}`}
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-3 py-2 rounded-lg text-sm transition"
            >
              <FileSignature className="w-4 h-4" />
              Nouvelle demande
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Aucun statut, aucune demande : invitation
  return (
    <div className="bg-white border-2 border-emerald-200 rounded-2xl p-5">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900 text-base mb-1">Vous etes conventionne Ameli ?</h3>
          <p className="text-sm text-gray-700 leading-relaxed">
            Si votre societe est conventionnee par l&apos;Assurance Maladie mais n&apos;apparait pas
            encore avec le badge, demandez sa verification manuelle en quelques clics.
          </p>
        </div>
      </div>
      <Link
        href={`/transport-medical/pro/ameli-demande?pro=${proId}`}
        className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2.5 rounded-xl transition text-sm"
      >
        <FileSignature className="w-4 h-4" />
        Demander le badge Ameli
      </Link>
      <p className="text-xs text-gray-500 mt-2 text-center">Verification gratuite sous 5 jours ouvres</p>
    </div>
  );
}
