'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Pencil, Trash2, Flag } from 'lucide-react';
import { useForumUser } from './useForumUser';

const CONTENT_MAX = 10000;

export default function PostActions({
  postId,
  authorUserId,
  initialContent,
}: {
  postId: string;
  authorUserId: string | null;
  initialContent: string;
}) {
  const { loading, userId, isVerified } = useForumUser();
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [content, setContent] = useState(initialContent);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (loading || !userId) return null;

  const isOwner = !!authorUserId && authorUserId === userId;

  async function saveEdit() {
    setError(null);
    if (content.trim().length < 1) {
      setError('Le message ne peut pas être vide.');
      return;
    }
    setBusy(true);
    const res = await fetch(`/api/forum/posts/${postId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contenu: content }),
    });
    setBusy(false);
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      setError(json.error || 'Échec de la modification.');
      return;
    }
    setEditing(false);
    router.refresh();
  }

  async function remove() {
    if (!window.confirm('Supprimer ce message ?')) return;
    setBusy(true);
    const res = await fetch(`/api/forum/posts/${postId}`, { method: 'DELETE' });
    setBusy(false);
    if (res.ok) router.refresh();
  }

  async function report() {
    const raison = window.prompt('Motif du signalement :');
    if (!raison || raison.trim().length < 3) return;
    const res = await fetch('/api/forum/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId, raison }),
    });
    if (res.ok) {
      window.alert('Signalement envoyé. Merci.');
    } else {
      const json = await res.json().catch(() => ({}));
      window.alert(json.error || 'Échec du signalement.');
    }
  }

  if (editing) {
    return (
      <div className="mt-3 border-t border-gray-100 pt-3">
        {error && <p className="mb-2 text-sm text-red-600">{error}</p>}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          maxLength={CONTENT_MAX}
          rows={5}
          className="mb-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        />
        <div className="flex gap-2">
          <button
            onClick={saveEdit}
            disabled={busy}
            className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
          >
            Enregistrer
          </button>
          <button
            onClick={() => {
              setEditing(false);
              setContent(initialContent);
            }}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50"
          >
            Annuler
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-3 flex items-center gap-4 border-t border-gray-100 pt-2 text-xs text-gray-500">
      {isOwner && (
        <>
          <button
            onClick={() => setEditing(true)}
            className="inline-flex items-center gap-1 hover:text-blue-600"
          >
            <Pencil size={13} /> Modifier
          </button>
          <button
            onClick={remove}
            disabled={busy}
            className="inline-flex items-center gap-1 hover:text-red-600"
          >
            <Trash2 size={13} /> Supprimer
          </button>
        </>
      )}
      {!isOwner && isVerified && (
        <button
          onClick={report}
          className="inline-flex items-center gap-1 hover:text-amber-600"
        >
          <Flag size={13} /> Signaler
        </button>
      )}
    </div>
  );
}
