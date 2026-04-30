"use client";

import { useEffect, useState } from "react";
import { Sparkles, Copy, Check } from "lucide-react";

type Props = {
  /** Variante d'affichage : 'hero' (large, page tarifs) ou 'inline' (compact, intégré aux cartes) */
  variant?: "hero" | "inline";
  /** Texte d'appel à l'action contextuel */
  ctaHint?: string;
};

export default function PromoBanner({ variant = "hero", ctaHint }: Props) {
  const [copied, setCopied] = useState(false);

  // Réinitialise l'état "copié" après 2s
  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(t);
  }, [copied]);

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText("BIENVENUE2026");
      setCopied(true);
    } catch {
      // Silent fail si navigator.clipboard indisponible (HTTP, vieux navigateur)
    }
  };

  if (variant === "inline") {
    return (
      <div className="rounded-xl border border-emerald-300 bg-gradient-to-br from-emerald-50 to-white p-4 mb-5">
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 uppercase tracking-wide mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          Offre de lancement — 100 premiers pros
        </div>
        <div className="text-sm text-gray-700 mb-3">
          <strong>3 mois offerts</strong> sur le Plan Pro avec le code :
        </div>
        <button
          type="button"
          onClick={copyCode}
          className="w-full inline-flex items-center justify-between gap-2 bg-white border-2 border-dashed border-emerald-400 hover:border-emerald-500 rounded-lg px-3 py-2 transition"
        >
          <span className="font-mono text-base font-bold text-emerald-700 tracking-wider">
            BIENVENUE2026
          </span>
          {copied ? (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
              <Check className="w-3.5 h-3.5" /> Copié
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs text-gray-500">
              <Copy className="w-3.5 h-3.5" /> Copier
            </span>
          )}
        </button>
        <p className="text-xs text-gray-500 mt-2">
          Code à coller sur la page de paiement Stripe lors de l&apos;activation du plan.
        </p>
      </div>
    );
  }

  // Hero — large, mis en avant en haut de page
  return (
    <div className="relative overflow-hidden rounded-2xl border border-emerald-300 bg-gradient-to-br from-emerald-50 via-white to-blue-50 p-6 sm:p-7">
      <div className="absolute -top-8 -right-8 w-32 h-32 bg-emerald-400/10 rounded-full blur-2xl pointer-events-none" />
      <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-5">
        <div className="flex-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold bg-emerald-600 text-white px-2.5 py-1 rounded-full mb-2">
            <Sparkles className="w-3 h-3" />
            Offre de lancement — limitée aux 100 premiers
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
            3 mois offerts sur le Plan Pro
          </h3>
          <p className="text-sm text-gray-600">
            {ctaHint ||
              "Activez la messagerie patients et la mise en avant gratuitement pendant 3 mois. Sans engagement, résiliable en un clic."}
          </p>
        </div>
        <div className="w-full sm:w-auto sm:min-w-[200px]">
          <button
            type="button"
            onClick={copyCode}
            className="w-full inline-flex items-center justify-between gap-3 bg-white border-2 border-dashed border-emerald-500 hover:border-emerald-600 hover:shadow-md rounded-xl px-4 py-3 transition group"
          >
            <div className="flex flex-col items-start">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                Code promo
              </span>
              <span className="font-mono text-lg font-bold text-emerald-700 tracking-wider">
                BIENVENUE2026
              </span>
            </div>
            {copied ? (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 shrink-0">
                <Check className="w-4 h-4" /> Copié
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs text-gray-500 group-hover:text-gray-700 shrink-0">
                <Copy className="w-4 h-4" /> Copier
              </span>
            )}
          </button>
          <p className="text-[11px] text-gray-500 mt-1.5 text-center">
            À coller au paiement Stripe
          </p>
        </div>
      </div>
    </div>
  );
}
