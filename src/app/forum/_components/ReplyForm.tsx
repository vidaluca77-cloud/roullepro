'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForumUser } from './useForumUser';
import { LoginInvite, ClaimInvite } from './GatingMessage';

const CONTENT_MAX = 10000;

export default function ReplyForm({
  threadId,
  isLocked,
}: {
  threadId: string;
  isLocked: boolean;
}) {
  const { loading, userId, isVerified } = useForumUser();
  const router = useRouter();
  const [contenu, setContenu] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (isLocked) {
    return (
      <p className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-500">
        Ce sujet est verrouillé : il n&apos;est plus possible d&apos;y répondre.
      </p>
    );
  }
  if (loading) {
    return <div className="h-28 w-full animate-pulse rounded-lg bg-gray-100" />;
  }
  if (!userId) {
    return <LoginInvite label="Connectez-vous pour répondre à ce sujet." />;
  }
  if (!isVerified) {
    return <ClaimInvite />;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (contenu.trim().length < 1) {
      setError('Le message ne peut pas être vide.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/forum/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ threadId, contenu }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || 'Une erreur est survenue.');
        setSubmitting(false);
        return;
      }
      setContenu('');
      setSubmitting(false);
      router.refresh();
    } catch {
      setError('Une erreur réseau est survenue.');
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} className="rounded-xl border border-gray-200 bg-white p-4">
      <h2 className="mb-3 font-semibold text-gray-900">Répondre</h2>
      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
      <textarea
        value={contenu}
        onChange={(e) => setContenu(e.target.value)}
        maxLength={CONTENT_MAX}
        rows={5}
        placeholder="Votre réponse…"
        className="mb-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
      />
      <button
        type="submit"
        disabled={submitting}
        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
      >
        {submitting ? 'Envoi…' : 'Publier ma réponse'}
      </button>
    </form>
  );
}
