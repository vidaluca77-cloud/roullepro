"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowRight, CheckCircle, AlertCircle, Truck, MapPin, Building2 } from "lucide-react";

export default function ReserverPage({ params }: { params: { id: string } }) {
  const searchParams = useSearchParams();
  const estimationId = searchParams.get("estimation") ?? "";

  const [mode, setMode] = useState<"garage" | "domicile">("garage");
  const [date, setDate] = useState("");
  const [adresseRecup, setAdresseRecup] = useState("");
  const [cpRecup, setCpRecup] = useState("");
  const [villeRecup, setVilleRecup] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Date minimum = demain
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  const fraisRecuperation = 79; // Forfait fixe

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!estimationId) {
      setError("Identifiant de dépôt manquant. Recommencez depuis l'estimation.");
      return;
    }
    if (mode === "domicile") {
      if (!adresseRecup.trim() || !cpRecup.trim() || !villeRecup.trim()) {
        setError("Renseignez votre adresse complète pour la récupération.");
        return;
      }
    }
    setLoading(true);
    try {
      const res = await fetch("/api/depot-vente/reserver", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          depot_id: estimationId,
          garage_id: params.id,
          date_depot_prevu: date || null,
          recuperation_domicile: mode === "domicile",
          adresse_recuperation: mode === "domicile" ? adresseRecup.trim() : null,
          code_postal_recuperation: mode === "domicile" ? cpRecup.trim() : null,
          ville_recuperation: mode === "domicile" ? villeRecup.trim() : null,
          frais_recuperation: mode === "domicile" ? fraisRecuperation : 0,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) {
          window.location.href = `/auth/login?redirect=/depot-vente/garages/${params.id}/reserver?estimation=${estimationId}`;
          return;
        }
        setError(data.error ?? "Une erreur est survenue.");
        return;
      }
      setSuccess(true);
    } catch {
      setError("Erreur de connexion. Vérifiez votre réseau.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 py-16 flex items-center justify-center">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-md p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Demande confirmée</h1>
          <p className="text-slate-500 mb-8">
            {mode === "domicile"
              ? "Votre demande de récupération à domicile est transmise au garage partenaire. Il vous contactera sous 24h pour convenir du créneau précis."
              : "Vous allez recevoir un email de confirmation. Le garage vous contactera pour finaliser les détails du dépôt."}
          </p>
          <Link
            href="/dashboard/depots"
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold px-6 py-3 rounded-xl hover:from-blue-500 hover:to-indigo-500 transition"
          >
            Suivre mon dépôt
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-md p-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Comment souhaitez-vous procéder ?</h1>
          <p className="text-slate-500 text-sm mb-8">
            Choisissez entre déposer le véhicule au garage ou demander une récupération à domicile.
          </p>

          {/* Toggle mode */}
          <div className="grid sm:grid-cols-2 gap-3 mb-8">
            <button
              type="button"
              onClick={() => setMode("garage")}
              className={`text-left p-5 rounded-2xl border-2 transition ${
                mode === "garage"
                  ? "border-blue-600 bg-blue-50/50"
                  : "border-slate-200 hover:border-slate-300 bg-white"
              }`}
            >
              <Building2
                size={20}
                className={mode === "garage" ? "text-blue-600" : "text-slate-400"}
              />
              <div className="font-bold text-slate-900 mt-3">Je dépose au garage</div>
              <div className="text-sm text-slate-500 mt-1">Vous apportez le véhicule vous-même au créneau convenu.</div>
              <div className="text-xs font-semibold text-emerald-700 mt-2">Gratuit</div>
            </button>

            <button
              type="button"
              onClick={() => setMode("domicile")}
              className={`text-left p-5 rounded-2xl border-2 transition ${
                mode === "domicile"
                  ? "border-blue-600 bg-blue-50/50"
                  : "border-slate-200 hover:border-slate-300 bg-white"
              }`}
            >
              <Truck
                size={20}
                className={mode === "domicile" ? "text-blue-600" : "text-slate-400"}
              />
              <div className="font-bold text-slate-900 mt-3">Le garage vient chez moi</div>
              <div className="text-sm text-slate-500 mt-1">Un convoyeur vient récupérer votre véhicule à l&apos;adresse indiquée.</div>
              <div className="text-xs font-semibold text-blue-700 mt-2">Forfait {fraisRecuperation} € · déduit du prix de vente</div>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="date_depot" className="block text-sm font-medium text-slate-700 mb-1">
                {mode === "domicile" ? "Date souhaitée pour la récupération" : "Date de dépôt souhaitée"}
              </label>
              <input
                id="date_depot"
                type="date"
                min={minDate}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-slate-400 mt-1">
                Le garage confirmera le créneau exact avec vous.
              </p>
            </div>

            {mode === "domicile" && (
              <div className="space-y-4 bg-blue-50 border border-blue-100 rounded-xl p-5">
                <div className="flex items-center gap-2 text-blue-900 font-semibold text-sm">
                  <MapPin size={16} />
                  Adresse de récupération
                </div>

                <div>
                  <label htmlFor="adresse" className="block text-sm font-medium text-slate-700 mb-1">
                    Adresse <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="adresse"
                    type="text"
                    required
                    value={adresseRecup}
                    onChange={(e) => setAdresseRecup(e.target.value)}
                    placeholder="12 rue des Artisans"
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label htmlFor="cp" className="block text-sm font-medium text-slate-700 mb-1">
                      Code postal <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="cp"
                      type="text"
                      required
                      value={cpRecup}
                      onChange={(e) => setCpRecup(e.target.value.replace(/\D/g, "").slice(0, 5))}
                      placeholder="75001"
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="col-span-2">
                    <label htmlFor="ville" className="block text-sm font-medium text-slate-700 mb-1">
                      Ville <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="ville"
                      type="text"
                      required
                      value={villeRecup}
                      onChange={(e) => setVilleRecup(e.target.value)}
                      placeholder="Paris"
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <p className="text-xs text-blue-900/80 leading-relaxed">
                  Service inclus : convoyage par chauffeur professionnel assuré, prise en charge à l&apos;adresse, livraison au garage, photos de l&apos;état du véhicule au chargement. Frais {fraisRecuperation} € (couvre jusqu&apos;à 50 km autour du garage partenaire, sinon un devis vous est envoyé).
                </p>
              </div>
            )}

            {error && (
              <div className="flex items-start gap-2 text-red-600 bg-red-50 border border-red-100 rounded-xl p-3 text-sm">
                <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3.5 rounded-xl transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Confirmation en cours...
                </span>
              ) : (
                <>
                  {mode === "domicile" ? "Confirmer la récupération" : "Confirmer le rendez-vous"}
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
