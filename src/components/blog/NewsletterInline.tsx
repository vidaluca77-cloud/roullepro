"use client";
/**
 * Composant newsletter inline, placé au milieu / en fin d'article.
 * POST /api/newsletter/subscribe { email }
 */

import { useState } from "react";
import { Mail, CheckCircle2, Loader2 } from "lucide-react";

export function NewsletterInline({
  variant = "default",
}: {
  variant?: "default" | "compact";
}) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );
  const [errorMsg, setErrorMsg] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    setErrorMsg("");
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "blog" }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus("error");
        setErrorMsg(data?.error || "Une erreur est survenue.");
        return;
      }
      setStatus("success");
    } catch {
      setStatus("error");
      setErrorMsg("Connexion impossible, réessayez dans un instant.");
    }
  };

  if (status === "success") {
    return (
      <div className="my-10 rounded-2xl border border-emerald-200 bg-emerald-50 p-6 flex items-start gap-4">
        <CheckCircle2 className="text-emerald-600 flex-shrink-0 mt-0.5" size={22} />
        <div>
          <p className="font-semibold text-emerald-900">
            Inscription confirmée
          </p>
          <p className="text-sm text-emerald-700 mt-0.5">
            Vous recevrez nos prochains guides et l&apos;actualité du secteur sur{" "}
            <strong>{email}</strong>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="my-10 rounded-2xl border border-gray-200 bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6 md:p-7">
      <div className="flex items-start gap-4 mb-4">
        <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0">
          <Mail size={20} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">
            Restez informé du marché pro
          </h3>
          <p className="text-sm text-gray-600">
            Nos guides, analyses de prix et nouveautés réglementaires, une
            fois par mois. Désinscription en un clic.
          </p>
        </div>
      </div>

      <form onSubmit={submit} className="flex flex-col sm:flex-row gap-2">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="vous@entreprise.com"
          disabled={status === "loading"}
          className="flex-1 px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="px-6 py-3 rounded-xl bg-gray-900 hover:bg-gray-800 text-white font-semibold text-sm transition disabled:opacity-60 flex items-center justify-center gap-2 min-w-[140px]"
        >
          {status === "loading" ? (
            <>
              <Loader2 size={16} className="animate-spin" /> Envoi...
            </>
          ) : (
            "S'abonner"
          )}
        </button>
      </form>

      {status === "error" && (
        <p className="text-sm text-red-600 mt-3">{errorMsg}</p>
      )}

      <p className="text-xs text-gray-400 mt-3">
        En vous abonnant, vous acceptez de recevoir nos emails. Nous ne
        partageons jamais votre adresse.
      </p>
    </div>
  );
}
