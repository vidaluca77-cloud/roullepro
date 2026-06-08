"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Send, Check } from "lucide-react";

export default function ReplyForm({
  messageId,
  alreadyReplied,
}: {
  messageId: string;
  alreadyReplied: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (content.trim().length < 5) {
      setError("Réponse trop courte (5 caractères minimum).");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/sanitaire/messages/${messageId}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: content.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error || "Erreur lors de l'envoi.");
        return;
      }
      setDone(true);
      setContent("");
      router.refresh();
    } catch {
      setError("Erreur réseau, réessayez.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="mt-4 inline-flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 px-3 py-2 rounded-lg">
        <Check className="w-4 h-4" />
        Réponse envoyée au patient par email.
      </div>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-1 inline-flex items-center gap-1 bg-[#0066CC] hover:bg-[#0052a3] text-white text-sm font-semibold px-4 py-2 rounded-lg"
      >
        <Send className="w-3.5 h-3.5" />
        {alreadyReplied ? "Répondre à nouveau" : "Répondre en ligne"}
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-2">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={4}
        placeholder="Votre réponse au patient…"
        className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0066CC]"
        disabled={loading}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-1 bg-[#0066CC] hover:bg-[#0052a3] disabled:opacity-60 text-white text-sm font-semibold px-4 py-2 rounded-lg"
        >
          <Send className="w-3.5 h-3.5" />
          {loading ? "Envoi…" : "Envoyer la réponse"}
        </button>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setError(null);
          }}
          disabled={loading}
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold px-4 py-2 rounded-lg"
        >
          Annuler
        </button>
      </div>
    </form>
  );
}
