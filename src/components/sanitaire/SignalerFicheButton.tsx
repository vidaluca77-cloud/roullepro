'use client';

import { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface Props {
  ficheId: string;
  ficheNom: string;
  categorie: 'taxi_conventionne' | 'ambulance' | 'vsl';
}

const RAISONS_TAXI = [
  "Taxi sans autorisation de stationnement (ADS) valide",
  "Numéro ADS incorrect ou inexistant",
  "Activité cessée ou retraité",
  "Fiche en doublon",
  "Informations erronées (nom, adresse, téléphone)",
  "Autre",
];

const RAISONS_AMBULANCE_VSL = [
  "Activité cessée",
  "Pas d'agrément ARS",
  "Fiche en doublon",
  "Informations erronées (nom, adresse, téléphone)",
  "Autre",
];

export default function SignalerFicheButton({ ficheId, ficheNom, categorie }: Props) {
  const [open, setOpen] = useState(false);
  const [raison, setRaison] = useState('');
  const [commentaire, setCommentaire] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const raisons = categorie === 'taxi_conventionne' ? RAISONS_TAXI : RAISONS_AMBULANCE_VSL;

  const close = () => {
    setOpen(false);
    setRaison('');
    setCommentaire('');
    setEmail('');
    setMessage(null);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!raison) {
      setMessage({ type: 'error', text: 'Veuillez sélectionner une raison.' });
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch('/api/signalements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target_type: 'fiche_sanitaire',
          fiche_id: ficheId,
          raison,
          commentaire: commentaire.trim() || undefined,
          reporter_email: email.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({
          type: 'success',
          text: 'Merci. Votre signalement a bien été transmis à l\'équipe RoullePro qui le traitera sous 48 h.',
        });
        setTimeout(close, 2500);
      } else {
        setMessage({ type: 'error', text: data.error || 'Une erreur est survenue.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Une erreur réseau est survenue.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-red-600 transition underline-offset-2 hover:underline"
      >
        <AlertTriangle size={13} />
        Signaler cette fiche
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 relative">
            <button
              onClick={close}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              aria-label="Fermer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Signaler cette fiche</h2>
                <p className="text-xs text-gray-500 truncate max-w-[260px]">{ficheNom}</p>
              </div>
            </div>

            <form onSubmit={submit} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Motif du signalement
                </label>
                <select
                  value={raison}
                  onChange={(e) => setRaison(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  disabled={loading}
                >
                  <option value="">Sélectionnez une raison</option>
                  {raisons.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Précisions (facultatif)
                </label>
                <textarea
                  value={commentaire}
                  onChange={(e) => setCommentaire(e.target.value)}
                  rows={3}
                  maxLength={1000}
                  placeholder="Ajoutez tout détail utile (commune concernée, lien officiel, etc.)"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Votre email (facultatif)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Pour vous tenir informé du suivi"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  disabled={loading}
                />
              </div>

              {message && (
                <div className={`p-3 rounded-lg text-sm ${
                  message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
                }`}>
                  {message.text}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={close}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm"
                  disabled={loading}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 text-sm font-medium"
                  disabled={loading || !raison}
                >
                  {loading ? 'Envoi...' : 'Envoyer le signalement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
