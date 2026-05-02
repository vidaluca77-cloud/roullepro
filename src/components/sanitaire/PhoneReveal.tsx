"use client";

import { useState } from "react";
import { Phone } from "lucide-react";

interface Props {
  proId: string;
  telephone: string;
  categorie?: string;
  ville?: string;
  /**
   * Variante d'affichage :
   *  - "primary" : gros bouton bleu plein largeur (bloc Contacter)
   *  - "card"    : ligne compacte avec icône (sidebar Coordonnées)
   */
  variant?: "primary" | "card";
}

/**
 * Bouton "Voir le numéro" : reveal direct au clic, tracking serveur + GA4.
 * Le numéro reste présent dans le DOM SSR (data-phone) pour SEO/schema.org,
 * masqué visuellement tant que l'utilisateur n'a pas cliqué.
 */
export default function PhoneReveal({
  proId,
  telephone,
  categorie,
  ville,
  variant = "primary",
}: Props) {
  const [revealed, setRevealed] = useState(false);
  const telClean = telephone.replace(/\s/g, "");

  function handleReveal() {
    if (revealed) return;
    setRevealed(true);

    // Tracking GA4 (silencieux si pas chargé)
    try {
      window.gtag?.("event", "phone_reveal", {
        pro_id: proId,
        categorie,
        ville,
      });
    } catch {
      // ignore
    }

    // Tracking serveur (fire-and-forget)
    try {
      fetch("/api/phone-reveal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pro_id: proId }),
        keepalive: true,
      }).catch(() => {});
    } catch {
      // ignore
    }
  }

  if (variant === "card") {
    if (!revealed) {
      return (
        <button
          onClick={handleReveal}
          type="button"
          className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 hover:bg-blue-100 transition w-full text-left"
          data-phone={telephone}
          aria-label="Voir le numéro de téléphone"
        >
          <Phone className="w-5 h-5 text-[#0066CC]" />
          <div>
            <div className="text-xs text-gray-500">Téléphone</div>
            <div className="font-semibold text-[#0066CC]">Voir le numéro</div>
          </div>
        </button>
      );
    }
    return (
      <a
        href={`tel:${telClean}`}
        className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 hover:bg-blue-100 transition"
      >
        <Phone className="w-5 h-5 text-[#0066CC]" />
        <div>
          <div className="text-xs text-gray-500">Téléphone</div>
          <div className="font-semibold text-gray-900">{telephone}</div>
        </div>
      </a>
    );
  }

  // variant="primary"
  if (!revealed) {
    return (
      <button
        onClick={handleReveal}
        type="button"
        className="inline-flex items-center gap-2 bg-[#0066CC] hover:bg-[#0052a3] text-white font-semibold px-5 py-3 rounded-xl transition w-full justify-center mb-5"
        data-phone={telephone}
        aria-label="Voir le numéro de téléphone"
      >
        <Phone className="w-4 h-4" />
        Voir le numéro
      </button>
    );
  }
  return (
    <a
      href={`tel:${telClean}`}
      className="inline-flex items-center gap-2 bg-[#0066CC] hover:bg-[#0052a3] text-white font-semibold px-5 py-3 rounded-xl transition w-full justify-center mb-5"
    >
      <Phone className="w-4 h-4" />
      Appeler le {telephone}
    </a>
  );
}
