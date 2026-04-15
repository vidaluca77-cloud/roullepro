'use client';

import { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface SignalementModalProps {
  annonceId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function SignalementModal({ annonceId, isOpen, onClose }: SignalementModalProps) {
  const [raison, setRaison] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const raisons = [
    'Contenu inapproprié ou offensant',
    'Annonce frauduleuse ou arnaque',
    'Informations trompeuses',
    'Spam ou publicité abusive',
    'Véhicule déjà vendu',
    'Prix anormalement bas (arnaque potentielle)',
    'Photos ne correspondant pas au véhicule',
    'Autre'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!raison) {
      setMessage({ type: 'error', text: 'Veuillez sélectionner une raison' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/signalements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ annonce_id: annonceId, raison })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Merci pour votre signalement. Notre équipe va examiner cette annonce.' });
        setTimeout(() => {
          onClose();
          setRaison('');
          setMessage(null);
        }, 2000);
      } else {
        setMessage({ type: 'error', text: data.error || 'Une erreur est survenue' });
      }
    } catch (error) {
      console.error('Erreur:', error);
      setMessage({ type: 'error', text: 'Une erreur est survenue lors du signalement' });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <h2 className="text-xl font-bold">Signaler cette annonce</h2>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
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

          {message && (
            <div className={`mb-4 p-3 rounded-lg ${
              message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {message.text}
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              disabled={loading}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
              disabled={loading || !raison}
            >
              {loading ? 'Envoi...' : 'Signaler'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
