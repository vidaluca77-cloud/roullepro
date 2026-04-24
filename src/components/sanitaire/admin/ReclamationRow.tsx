"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ExternalLink, FileText, CheckCircle2, XCircle, Loader2, Eye, MapPin } from "lucide-react";

type Item = {
  id: string;
  raison_sociale: string;
  nom_commercial: string | null;
  ville: string;
  ville_slug: string;
  categorie: string;
  slug: string;
  siret: string;
  claimed_at: string | null;
  justificatif_url: string | null;
  email_public: string | null;
  rejection_reason: string | null;
  validated_at: string | null;
  claimer_email: string | null;
};

export default function ReclamationRow({ item, mode }: { item: Item; mode: "pending" | "approved" | "rejected" }) {
  const router = useRouter();
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showReject, setShowReject] = useState(false);
  const [justUrlLoading, setJustUrlLoading] = useState(false);

  const openJustificatif = async () => {
    if (!item.justificatif_url) return;
    setJustUrlLoading(true);
    try {
      const res = await fetch(`/api/admin/sanitaire/justificatif?path=${encodeURIComponent(item.justificatif_url)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      window.open(data.url, "_blank", "noopener,noreferrer");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setJustUrlLoading(false);
    }
  };

  const submitAction = async (action: "approve" | "reject") => {
    if (action === "reject" && !rejectReason.trim()) {
      setError("Précisez le motif du refus.");
      return;
    }
    setLoading(action);
    setError(null);
    try {
      const res = await fetch("/api/admin/sanitaire/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pro_id: item.id, action, reason: action === "reject" ? rejectReason.trim() : null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur");
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
      setLoading(null);
    }
  };

  const categorieUrl = item.categorie === "taxi_conventionne" ? "taxi-conventionne" : item.categorie;
  const categorieLabel = item.categorie === "taxi_conventionne" ? "Taxi conventionné" : item.categorie === "ambulance" ? "Ambulance" : item.categorie === "vsl" ? "VSL" : item.categorie;
  const nomAffiche = item.nom_commercial || item.raison_sociale;
  const ficheUrl = `/transport-medical/${item.ville_slug}/${categorieUrl}/${item.slug}`;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5">
      <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h3 className="font-bold text-gray-900">{nomAffiche}</h3>
            <span className="text-xs font-medium bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
              {categorieLabel}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-600 mb-1">
            <MapPin className="w-3 h-3" />
            {item.ville}
          </div>
          <div className="text-xs text-gray-500">SIRET : {item.siret}</div>
        </div>
        <Link
          href={ficheUrl}
          target="_blank"
          className="inline-flex items-center gap-1 text-xs text-[#0066CC] hover:underline"
        >
          <Eye className="w-3.5 h-3.5" />
          Voir fiche publique
        </Link>
      </div>

      <div className="grid sm:grid-cols-2 gap-3 bg-gray-50 rounded-xl p-3 text-sm mb-4">
        <div>
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-0.5">Réclamant</div>
          <div className="text-gray-900 break-all">{item.claimer_email || item.email_public || "—"}</div>
        </div>
        <div>
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-0.5">
            {mode === "pending" ? "Réclamée le" : "Traitée le"}
          </div>
          <div className="text-gray-900">
            {mode === "pending"
              ? item.claimed_at
                ? new Date(item.claimed_at).toLocaleString("fr-FR")
                : "—"
              : item.validated_at
              ? new Date(item.validated_at).toLocaleString("fr-FR")
              : "—"}
          </div>
        </div>
      </div>

      {item.justificatif_url && (
        <button
          type="button"
          onClick={openJustificatif}
          disabled={justUrlLoading}
          className="inline-flex items-center gap-2 text-sm bg-blue-50 hover:bg-blue-100 text-[#0066CC] font-medium px-3 py-2 rounded-lg transition mb-4 disabled:opacity-60"
        >
          {justUrlLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
          Consulter le justificatif
          <ExternalLink className="w-3 h-3" />
        </button>
      )}

      {mode === "rejected" && item.rejection_reason && (
        <div className="bg-red-50 border border-red-100 rounded-lg p-3 text-sm text-red-800 mb-4">
          <div className="text-xs font-semibold text-red-600 uppercase tracking-wide mb-1">Motif du refus</div>
          {item.rejection_reason}
        </div>
      )}

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-3">{error}</div>
      )}

      {mode === "pending" && (
        <>
          {showReject && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-3 mb-3">
              <label className="block text-xs font-semibold text-red-700 uppercase tracking-wide mb-1">
                Motif du refus (envoyé au pro)
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Ex: justificatif illisible / nom ne correspond pas au gérant / SIRET incohérent"
                rows={2}
                className="w-full px-3 py-2 bg-white border border-red-200 rounded-lg text-sm focus:border-red-400 outline-none"
              />
            </div>
          )}
          <div className="flex gap-2 flex-wrap">
            {!showReject ? (
              <>
                <button
                  type="button"
                  onClick={() => submitAction("approve")}
                  disabled={loading !== null}
                  className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
                >
                  {loading === "approve" ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  Approuver
                </button>
                <button
                  type="button"
                  onClick={() => setShowReject(true)}
                  disabled={loading !== null}
                  className="inline-flex items-center gap-2 bg-white border border-red-200 hover:bg-red-50 text-red-700 text-sm font-semibold px-4 py-2 rounded-lg transition"
                >
                  <XCircle className="w-4 h-4" />
                  Refuser
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => submitAction("reject")}
                  disabled={loading !== null || !rejectReason.trim()}
                  className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
                >
                  {loading === "reject" ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                  Confirmer le refus
                </button>
                <button
                  type="button"
                  onClick={() => { setShowReject(false); setRejectReason(""); setError(null); }}
                  className="text-sm text-gray-600 hover:text-gray-900 px-4 py-2"
                >
                  Annuler
                </button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
