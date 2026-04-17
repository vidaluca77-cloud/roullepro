'use client';
import { useState } from 'react';
import { X, Star, Loader2, Trash2 } from 'lucide-react';
import StarRating from './StarRating';

interface NotationModalProps {
  vendeurId: string;
  vendeurNom: string;
  notationExistante?: { id: string; note: number; commentaire: string | null } | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function NotationModal({
  vendeurId,
  vendeurNom,
  notationExistante,
  onClose,
  onSuccess,
}: NotationModalProps) {
  const [note, setNote] = useState(notationExistante?.note || 0);
  const [commentaire, setCommentaire] = useState(notationExistante?.commentaire || '');
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  const LABELS: Record<number, string> = {
    1: 'Très insatisfait',
    2: 'Insatisfait',
    3: 'Correct',
    4: 'Satisfait',
    5: 'Excellent',
  };

  const handleSubmit = async () => {
    if (note === 0) { setError('Sélectionnez une note'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/notations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vendeur_id: vendeurId, note, commentaire }),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error || 'Erreur');
        return;
      }
      onSuccess();
      onClose();
    } catch {
      setError('Erreur réseau');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Supprimer votre notation ?')) return;
    setDeleting(true);
    try {
      await fetch(`/api/notations?vendeur_id=${vendeurId}`, { method: 'DELETE' });
      onSuccess();
      onClose();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-900">
            {notationExistante ? 'Modifier votre avis' : 'Laisser un avis'}
          </h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
            <X size={18} />
          </button>
        </div>

        <p className="text-sm text-gray-500 mb-5">
          Votre expérience avec <span className="font-medium text-gray-900">{vendeurNom}</span>
        </p>

        {/* Étoiles interactives */}
        <div className="flex flex-col items-center gap-2 mb-6">
          <StarRating note={note} size={36} interactive onChange={setNote} />
          {note > 0 && (
            <p className="text-sm font-medium text-amber-600">{LABELS[note]}</p>
          )}
        </div>

        {/* Commentaire */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Commentaire <span className="text-gray-400 font-normal">(optionnel)</span>
          </label>
          <textarea
            value={commentaire}
            onChange={e => setCommentaire(e.target.value)}
            rows={3}
            maxLength={500}
            placeholder="Partagez votre expérience avec ce vendeur..."
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 resize-none"
          />
          <p className="text-xs text-gray-400 text-right mt-1">{commentaire.length}/500</p>
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg mb-4">{error}</p>
        )}

        <div className="flex gap-2">
          {notationExistante && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center gap-1.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 border border-red-200 rounded-xl transition disabled:opacity-50"
            >
              {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
              Supprimer
            </button>
          )}
          <button
            onClick={handleSubmit}
            disabled={loading || note === 0}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium text-sm transition disabled:opacity-50"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Star size={16} />}
            {notationExistante ? 'Mettre à jour' : 'Publier mon avis'}
          </button>
        </div>
      </div>
    </div>
  );
}
