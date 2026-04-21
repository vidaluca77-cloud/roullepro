"use client";

import { useState } from "react";

interface Props {
  garageId: string;
  started: boolean;
  ready: boolean;
}

export default function StripeConnectButton({ garageId, started, ready }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOnboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/connect/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ garage_id: garageId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Echec onboarding");
      if (!data.url) throw new Error("URL d'onboarding absente");
      window.location.href = data.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur inconnue");
      setLoading(false);
    }
  };

  const label = ready
    ? "Reprendre le compte Connect"
    : started
      ? "Continuer l'onboarding Stripe"
      : "Lancer l'onboarding Stripe Connect";

  return (
    <div>
      <button
        onClick={handleOnboard}
        disabled={loading}
        className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition disabled:opacity-60"
      >
        {loading ? "Redirection..." : label}
      </button>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}
