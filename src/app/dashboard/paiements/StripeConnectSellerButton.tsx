"use client";

import { useState } from "react";

export default function StripeConnectSellerButton({ label }: { label: string }) {
  const [loading, setLoading] = useState(false);

  async function go() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/connect-seller/onboard", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Erreur");
        return;
      }
      window.location.href = data.url;
    } catch (e: any) {
      alert(e?.message);
      setLoading(false);
    }
  }

  return (
    <button
      onClick={go}
      disabled={loading}
      className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg font-semibold disabled:opacity-50"
    >
      {loading ? "..." : label}
    </button>
  );
}
