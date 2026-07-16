'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { useForumUser } from './useForumUser';
import { LoginInvite, ClaimInvite } from './GatingMessage';

const TITLE_MAX = 200;
const CONTENT_MAX = 10000;

export default function NewThreadCta({ categorieSlug }: { categorieSlug: string }) {
  const { loading, userId, isVerified } = useForumUser();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [titre, setTitre] = useState('');
  const [contenu, setContenu] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (loading) {
    return <div className="h-10 w-40 animate-pulse rounded-lg bg-gray-100" />;
  }
  if (!userId) {
    return <LoginInvite label="Connectez-vous pour lancer un nouveau sujet." />;
  }
  if (!isVerified) {
    return <ClaimInvite />;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (titre.trim().length < 3) {
      setError('Le titre doit contenir au moins 3 caractères.');
      return;
    }
    if (contenu.trim().length < 1) {
      setError('Le message ne peut pas être vide.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/forum/threads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categorieSlug, titre, contenu }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || 'Une erreur est survenue.');
        setSubmitting(false);
        return;
      }
      router.push(`/forum/${categorieSlug}/${json.slug}`);
    } catch {
      setError('Une erreur réseau est survenue.');
      setSubmitting(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
      >
        <Plus size={16} /> Nouveau sujet
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-xl border border-gray-200 bg-white p-4">
      <h2 className="mb-3 font-semibold text-gray-900">Nouveau sujet</h2>
      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
      <input
        type="text"
        value={titre}
        onChange={(e) => setTitre(e.target.value)}
        maxLength={TITLE_MAX}
        placeholder="Titre du sujet"
        className="mb-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
      />
      <textarea
        value={contenu}
        onChange={(e) => setContenu(e.target.value)}
        maxLength={CONTENT_MAX}
        rows={6}
        placeholder="Votre message…"
        className="mb-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
      />
      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {submitting ? 'Publication…' : 'Publier'}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
        >
          Annuler
        </button>
      </div>
    </form>
  );
}
