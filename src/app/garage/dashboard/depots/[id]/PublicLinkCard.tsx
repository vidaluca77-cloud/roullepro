"use client";

import { useState } from "react";
import { Copy, Check, ExternalLink, Share2 } from "lucide-react";

type Props = {
  garageId: string;
  statut: string;
};

export default function PublicLinkCard({ garageId, statut }: Props) {
  const [copied, setCopied] = useState(false);

  // Uniquement si le véhicule est en vente publique
  if (!["en_vente", "offre_en_cours"].includes(statut)) {
    return null;
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://roullepro.com";
  const publicUrl = `${baseUrl}/depot-vente/garages/${garageId}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback silencieux
    }
  };

  return (
    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-6">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center flex-shrink-0">
          <Share2 className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="font-bold text-slate-900">Page publique de vente</h2>
          <p className="text-sm text-slate-600 mt-1">
            Partagez ce lien avec des acheteurs potentiels. Dès qu&apos;un acheteur
            clique sur &laquo;&nbsp;Acheter&nbsp;&raquo;, le paiement Stripe est
            d&eacute;clench&eacute; automatiquement.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-emerald-200 px-4 py-3 flex items-center gap-2 mb-3">
        <span className="text-sm text-slate-700 font-mono truncate flex-1">
          {publicUrl}
        </span>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <button
          type="button"
          onClick={handleCopy}
          className="flex-1 inline-flex items-center justify-center gap-2 bg-white border border-emerald-300 hover:bg-emerald-50 text-emerald-700 font-medium px-4 py-2.5 rounded-xl transition text-sm"
        >
          {copied ? (
            <>
              <Check size={16} />
              Lien copi&eacute;
            </>
          ) : (
            <>
              <Copy size={16} />
              Copier le lien
            </>
          )}
        </button>
        <a
          href={publicUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-4 py-2.5 rounded-xl transition text-sm"
        >
          <ExternalLink size={16} />
          Voir la page publique
        </a>
      </div>
    </div>
  );
}
