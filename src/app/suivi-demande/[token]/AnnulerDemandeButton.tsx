"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, XCircle } from "lucide-react";

export default function AnnulerDemandeButton({ token }: { token: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const annuler = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/suivi-demande/${token}/annuler`, {
        method: "POST",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error || "L'annulation a échoué. Réessayez.");
        setLoading(false);
        return;
      }
      router.refresh();
    } catch {
      setError("Connexion impossible. Réessayez.");
      setLoading(false);
    }
  };

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="inline-flex items-center justify-center gap-2 border border-red-200 text-red-700 hover:bg-red-50 font-semibold px-4 py-2.5 rounded-xl transition text-sm"
      >
        <XCircle className="w-4 h-4" />
        Annuler ma demande
      </button>
    );
  }

  return (
    <div className="border border-red-200 bg-red-50 rounded-xl p-4">
      <p className="text-sm text-red-900 font-medium mb-3">
        Confirmez-vous l&apos;annulation de cette demande de transport ? Cette action est
        définitive.
      </p>
      {error && <p className="text-sm text-red-700 mb-3">{error}</p>}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={annuler}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-semibold px-4 py-2.5 rounded-xl transition text-sm"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
          Oui, annuler ma demande
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          disabled={loading}
          className="inline-flex items-center justify-center bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-60 text-gray-700 font-medium px-4 py-2.5 rounded-xl transition text-sm"
        >
          Non, garder ma demande
        </button>
      </div>
    </div>
  );
}
