"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, DollarSign, AlertCircle, XCircle, Info } from "lucide-react";

interface Props {
  depotId: string;
  statut: string;
  prixAffiche: number | null;
  prixProposeVendeur?: number | null;
  messageVendeur?: string | null;
  refusRaison?: string | null;
}

function formatEuro(val: number): string {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(val);
}

export default function GarageDepotActions({
  depotId,
  statut,
  prixAffiche,
  prixProposeVendeur,
  messageVendeur,
  refusRaison,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Validation demande
  const [prixValide, setPrixValide] = useState(prixProposeVendeur ? String(prixProposeVendeur) : "");
  const [commissionGarage, setCommissionGarage] = useState("7");
  const [fraisPrep, setFraisPrep] = useState("250");
  const [noteGarage, setNoteGarage] = useState("");

  // Refus demande
  const [showRefusForm, setShowRefusForm] = useState(false);
  const [refusMotif, setRefusMotif] = useState("");

  // Prix affiché (en cours de vente)
  const [showPrixForm, setShowPrixForm] = useState(false);
  const [newPrix, setNewPrix] = useState(prixAffiche ? String(prixAffiche) : "");

  // Calcul prix net vendeur
  const prixNum = Number(prixValide) || 0;
  const commPct = Number(commissionGarage) || 0;
  const prepNum = Number(fraisPrep) || 0;
  const partRp = prixNum * 0.04;
  const partGarage = prixNum * (commPct / 100) + prepNum;
  const prixVendeurNet = Math.max(0, prixNum - partRp - partGarage);

  async function handleValider(e: React.FormEvent) {
    e.preventDefault();
    if (prixNum < 500) {
      setError("Prix minimum : 500 €");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/garage/valider-demande", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          depot_id: depotId,
          prix_valide: prixNum,
          commission_garage_pct: commPct,
          frais_preparation: prepNum,
          note_garage: noteGarage.trim() || null,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error ?? "Erreur");
        return;
      }
      router.refresh();
    } catch {
      setError("Erreur de connexion");
    } finally {
      setLoading(false);
    }
  }

  async function handleRefuser(e: React.FormEvent) {
    e.preventDefault();
    if (refusMotif.trim().length < 5) {
      setError("Motif requis (5 caractères minimum)");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/garage/refuser-demande", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ depot_id: depotId, refus_raison: refusMotif.trim() }),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error ?? "Erreur");
        return;
      }
      router.refresh();
    } catch {
      setError("Erreur de connexion");
    } finally {
      setLoading(false);
    }
  }

  async function handleMarquerRecu() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/garage/depot-recu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ depot_id: depotId }),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error ?? "Erreur");
        return;
      }
      router.refresh();
    } catch {
      setError("Erreur de connexion");
    } finally {
      setLoading(false);
    }
  }

  async function handleModifierPrix(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/garage/depot-prix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ depot_id: depotId, prix_affiche: Number(newPrix) }),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error ?? "Erreur");
        return;
      }
      setShowPrixForm(false);
      router.refresh();
    } catch {
      setError("Erreur de connexion");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
      <h2 className="font-bold text-slate-900 mb-4">Actions</h2>

      {error && (
        <div className="flex items-start gap-2 text-red-600 bg-red-50 border border-red-100 rounded-xl p-3 text-sm mb-4">
          <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* ============ DEMANDE EN ATTENTE ============ */}
      {statut === "demande_en_attente" && !showRefusForm && (
        <div className="space-y-4">
          {/* Info vendeur */}
          {(prixProposeVendeur || messageVendeur) && (
            <div className="bg-purple-50 border border-purple-100 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Info size={14} className="text-purple-700" />
                <p className="text-xs font-semibold text-purple-900 uppercase">Demande du vendeur</p>
              </div>
              {prixProposeVendeur && (
                <p className="text-sm text-slate-700">
                  Prix souhaité : <strong>{formatEuro(Number(prixProposeVendeur))}</strong>
                </p>
              )}
              {messageVendeur && (
                <p className="text-sm text-slate-700 mt-2 italic">« {messageVendeur} »</p>
              )}
            </div>
          )}

          <form onSubmit={handleValider} className="space-y-4">
            <div>
              <label htmlFor="prix_valide" className="block text-sm font-medium text-slate-700 mb-1.5">
                Prix de vente validé (TTC)
              </label>
              <input
                id="prix_valide"
                type="number"
                min="500"
                max="250000"
                step="100"
                required
                value={prixValide}
                onChange={(e) => setPrixValide(e.target.value)}
                placeholder="Ex : 12500"
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <p className="text-xs text-slate-500 mt-1">
                Prix auquel le véhicule sera mis en vente publique. Peut différer du prix souhaité par le vendeur.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="comm_pct" className="block text-xs font-medium text-slate-600 mb-1">
                  Commission garage (%)
                </label>
                <input
                  id="comm_pct"
                  type="number"
                  min="0"
                  max="20"
                  step="0.5"
                  value={commissionGarage}
                  onChange={(e) => setCommissionGarage(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label htmlFor="frais_prep" className="block text-xs font-medium text-slate-600 mb-1">
                  Forfait préparation (€)
                </label>
                <input
                  id="frais_prep"
                  type="number"
                  min="0"
                  max="2000"
                  step="10"
                  value={fraisPrep}
                  onChange={(e) => setFraisPrep(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            {prixNum >= 500 && (
              <div className="bg-slate-50 rounded-xl p-4 text-sm space-y-1">
                <div className="flex justify-between text-slate-600">
                  <span>Prix affiché</span>
                  <span className="font-semibold text-slate-900">{formatEuro(prixNum)}</span>
                </div>
                <div className="flex justify-between text-slate-500 text-xs">
                  <span>Commission RoullePro (4 %)</span>
                  <span>− {formatEuro(partRp)}</span>
                </div>
                <div className="flex justify-between text-slate-500 text-xs">
                  <span>Part garage ({commPct} % + {formatEuro(prepNum)})</span>
                  <span>− {formatEuro(partGarage)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200 font-bold">
                  <span className="text-emerald-700">Net vendeur</span>
                  <span className="text-emerald-700">{formatEuro(prixVendeurNet)}</span>
                </div>
              </div>
            )}

            <div>
              <label htmlFor="note_garage" className="block text-xs font-medium text-slate-600 mb-1">
                Message pour le vendeur (optionnel)
              </label>
              <textarea
                id="note_garage"
                rows={2}
                value={noteGarage}
                onChange={(e) => setNoteGarage(e.target.value)}
                placeholder="Ex : prix cohérent avec l'état du véhicule, disponible pour dépôt dès la semaine prochaine..."
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading || prixNum < 500}
                className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded-xl transition disabled:opacity-60 text-sm"
              >
                <CheckCircle size={16} />
                Valider et lancer le dépôt
              </button>
              <button
                type="button"
                onClick={() => setShowRefusForm(true)}
                disabled={loading}
                className="flex items-center justify-center gap-2 bg-white hover:bg-rose-50 border border-rose-200 text-rose-700 font-semibold px-4 py-2.5 rounded-xl transition text-sm"
              >
                <XCircle size={16} />
                Refuser
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ============ FORMULAIRE REFUS ============ */}
      {statut === "demande_en_attente" && showRefusForm && (
        <form onSubmit={handleRefuser} className="space-y-3">
          <div>
            <label htmlFor="refus_motif" className="block text-sm font-medium text-slate-700 mb-1.5">
              Motif du refus (communiqué au vendeur)
            </label>
            <textarea
              id="refus_motif"
              rows={3}
              required
              minLength={5}
              value={refusMotif}
              onChange={(e) => setRefusMotif(e.target.value)}
              placeholder="Ex : véhicule hors de notre zone d'expertise, kilométrage trop élevé, planning complet pour les 2 prochains mois..."
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading || refusMotif.trim().length < 5}
              className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-semibold py-2.5 rounded-xl transition disabled:opacity-60 text-sm"
            >
              Confirmer le refus
            </button>
            <button
              type="button"
              onClick={() => { setShowRefusForm(false); setRefusMotif(""); setError(""); }}
              disabled={loading}
              className="border border-slate-200 text-slate-600 px-4 py-2.5 rounded-xl transition hover:bg-slate-50 text-sm"
            >
              Annuler
            </button>
          </div>
        </form>
      )}

      {/* ============ DEMANDE REFUSEE ============ */}
      {statut === "demande_refusee" && (
        <div className="bg-rose-50 border border-rose-100 rounded-xl p-4">
          <p className="text-sm font-semibold text-rose-900 mb-1">Demande refusée</p>
          {refusRaison && <p className="text-sm text-rose-800">{refusRaison}</p>}
        </div>
      )}

      {/* ============ MARQUER RECU ============ */}
      {statut === "rdv_pris" && (
        <button
          onClick={handleMarquerRecu}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded-xl transition disabled:opacity-60 text-sm"
        >
          <CheckCircle size={16} />
          Marquer comme reçu et mettre en vente
        </button>
      )}

      {/* ============ MODIFIER PRIX EN VENTE ============ */}
      {["en_vente", "offre_en_cours", "depose"].includes(statut) && (
        <div>
          {showPrixForm ? (
            <form onSubmit={handleModifierPrix} className="flex gap-2">
              <div className="flex-1">
                <label htmlFor="new_prix" className="sr-only">Nouveau prix</label>
                <input
                  id="new_prix"
                  type="number"
                  min="0"
                  step="100"
                  value={newPrix}
                  onChange={(e) => setNewPrix(e.target.value)}
                  placeholder="Nouveau prix TTC"
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                type="submit"
                disabled={loading || !newPrix}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2.5 rounded-xl transition disabled:opacity-60 text-sm"
              >
                Valider
              </button>
              <button
                type="button"
                onClick={() => setShowPrixForm(false)}
                className="border border-slate-200 text-slate-600 px-3 py-2.5 rounded-xl transition hover:bg-slate-50 text-sm"
              >
                Annuler
              </button>
            </form>
          ) : (
            <button
              onClick={() => setShowPrixForm(true)}
              className="w-full flex items-center justify-center gap-2 border border-slate-200 hover:border-blue-300 text-slate-700 hover:text-blue-600 font-semibold py-2.5 rounded-xl transition text-sm"
            >
              <DollarSign size={16} />
              Modifier le prix affiché
            </button>
          )}
        </div>
      )}
    </div>
  );
}
