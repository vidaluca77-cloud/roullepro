"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

export default function CheckoutButton({
  planKey,
  ficheId,
  popular,
}: {
  planKey: "essential" | "premium" | "pro_plus";
  ficheId: string;
  popular?: boolean;
}) {
  const [loading, setLoading] = useState(false);

  const onClick = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/sanitaire/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan_key: planKey, pro_id: ficheId }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Erreur");
        setLoading(false);
      }
    } catch (err) {
      alert((err as Error).message);
      setLoading(false);
    }
  };

  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`w-full inline-flex items-center justify-center gap-2 font-semibold px-4 py-2.5 rounded-xl transition ${popular ? "bg-indigo-600 hover:bg-indigo-700 text-white" : "bg-[#0066CC] hover:bg-[#0052a3] text-white"} disabled:opacity-60`}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      Activer l'abonnement
    </button>
  );
}
