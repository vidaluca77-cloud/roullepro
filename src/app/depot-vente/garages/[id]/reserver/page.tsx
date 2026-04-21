'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';

export default function ReserverPage({ params }: { params: { id: string } }) {
  const searchParams = useSearchParams();
  const estimationId = searchParams.get('estimation') ?? '';

  const [date, setDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Date minimum = demain
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!estimationId) {
      setError("Identifiant de dépôt manquant. Recommencez depuis l'estimation.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/depot-vente/reserver', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          depot_id: estimationId,
          garage_id: params.id,
          date_depot_prevu: date || null,
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
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Rendez-vous confirmé !</h1>
          <p className="text-slate-500 mb-8">
            Vous allez recevoir un email de confirmation. Le garage vous contactera pour finaliser les détails.
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
    <div className="min-h-screen bg-slate-50 py-16 flex items-center justify-center">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-md p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Confirmer le dépôt</h1>
        <p className="text-slate-500 text-sm mb-8">
          Choisissez une date de dépôt souhaitée. Le garage vous contactera pour valider le créneau exact.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="date_depot" className="block text-sm font-medium text-slate-700 mb-1">
              Date de dépôt souhaitée
            </label>
            <input
              id="date_depot"
              type="date"
              min={minDate}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

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
                Confirmer le rendez-vous
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
