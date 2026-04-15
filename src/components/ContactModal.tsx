'use client';

import { useState, useEffect } from 'react';
import { X, MessageSquare, Send } from 'lucide-react';

interface ContactModalProps {
  annonceId: string;
  annonceTitre: string;
  isOpen: boolean;
  onClose: () => void;
  currentUserName?: string;
  currentUserEmail?: string;
  isOwner?: boolean;
}

export default function ContactModal({
  annonceId,
  annonceTitre,
  isOpen,
  onClose,
  currentUserName = '',
  currentUserEmail = '',
  isOwner = false,
}: ContactModalProps) {
  // Variables d'état - noms internes en français pour la lisibilité
  const [senderNom, setSenderNom] = useState(currentUserName);
  const [senderEmail, setSenderEmail] = useState(currentUserEmail);
  const [contenu, setContenu] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSenderNom(currentUserName);
      setSenderEmail(currentUserEmail);
      setContenu('');
      setFeedback(null);
    }
  }, [isOpen, currentUserName, currentUserEmail]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          annonce_id: annonceId,
          sender_nom: senderNom,   // colonne réelle dans Supabase
          sender_email: senderEmail,
          contenu: contenu,                  // colonne réelle dans Supabase
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setFeedback({ type: 'success', text: 'Votre message a bien été envoyé ! Le vendeur vous contactera prochainement.' });
        setTimeout(() => {
          onClose();
          setContenu('');
          setFeedback(null);
        }, 2500);
      } else {
        setFeedback({ type: 'error', text: data.error || 'Une erreur est survenue' });
      }
    } catch {
      setFeedback({ type: 'error', text: 'Erreur réseau. Veuillez réessayer.' });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  if (isOwner) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg max-w-md w-full p-6 relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
          <div className="text-center py-4">
            <p className="text-gray-600 font-medium">Vous ne pouvez pas contacter votre propre annonce.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-lg max-w-md w-full p-6 relative shadow-xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition">
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Contacter le vendeur</h2>
            <p className="text-sm text-gray-500 truncate max-w-xs">{annonceTitre}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Votre nom <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={senderNom}
              onChange={(e) => setSenderNom(e.target.value)}
              placeholder="Jean Dupont"
              required
              disabled={loading}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition disabled:bg-gray-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Votre email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={senderEmail}
              onChange={(e) => setSenderEmail(e.target.value)}
              placeholder="jean@exemple.fr"
              required
              disabled={loading}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition disabled:bg-gray-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Votre message <span className="text-red-500">*</span>
            </label>
            <textarea
              value={contenu}
              onChange={(e) => setContenu(e.target.value)}
              placeholder="Bonjour, je suis intéressé par votre annonce..."
              required
              rows={4}
              disabled={loading}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition disabled:bg-gray-50 resize-none"
            />
            <p className="text-xs text-gray-400 mt-1">{contenu.length} caractères (min. 10)</p>
          </div>

          {feedback && (
            <div className={`p-3 rounded-lg text-sm ${
              feedback.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {feedback.text}
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium text-gray-700 disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading || contenu.trim().length < 10}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <><span className="animate-spin h-4 w-4 border-b-2 border-white rounded-full inline-block" />Envoi...</>
              ) : (
                <><Send size={16} />Envoyer</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
