'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, DollarSign, AlertCircle } from 'lucide-react';

interface Props {
  depotId: string;
  statut: string;
  prixAffiche: number | null;
}

export default function GarageDepotActions({ depotId, statut, prixAffiche }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [newPrix, setNewPrix] = useState(prixAffiche ? String(prixAffiche) : '');
  const [showPrixForm, setShowPrixForm] = useState(false);

  const handleMarquerRecu = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/garage/depot-recu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ depot_id: depotId }),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error ?? 'Erreur');
        return;
      }
      router.refresh();
    } catch {
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const handleModifierPrix = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/garage/depot-prix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ depot_id: depotId, prix_affiche: Number(newPrix) }),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error ?? 'Erreur');
        return;
      }
      setShowPrixForm(false);
      router.refresh();
    } catch {
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
      <h2 className="font-bold text-slate-900 mb-4">Actions</h2>

      {error && (
        <div className="flex items-start gap-2 text-red-600 bg-red-50 border border-red-100 rounded-xl p-3 text-sm mb-4">
          <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="space-y-3">
        {/* Marquer comme reçu */}
        {statut === 'rdv_pris' && (
          <button
            onClick={handleMarquerRecu}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded-xl transition disabled:opacity-60 text-sm"
          >
            <CheckCircle size={16} />
            Marquer comme reçu et mettre en vente
          </button>
        )}

        {/* Modifier le prix */}
        {['en_vente', 'offre_en_cours', 'depose'].includes(statut) && (
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
    </div>
  );
}
