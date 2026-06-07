"use client";

import { useEffect, useState } from "react";
import { isOpenNow, type HorairesJson, type OpenStatus } from "@/lib/horaires";

// Badge dynamique "Ouvert / Fermé maintenant" calcule cote client a partir
// des horaires du pro et de l'heure reelle (fuseau Europe/Paris gere par le helper).
// Rendu cote client pour que le statut soit toujours juste, meme sur une page
// mise en cache (revalidate). Si aucun horaire exploitable, on n'affiche rien.

type Variant = "card" | "fiche";

export default function OpenStatusBadge({
  horaires,
  variant = "card",
}: {
  horaires: HorairesJson;
  variant?: Variant;
}) {
  const [status, setStatus] = useState<OpenStatus | null>(null);

  useEffect(() => {
    // Calcul au montage puis rafraichissement chaque minute pour suivre les bascules.
    const compute = () => setStatus(isOpenNow(horaires));
    compute();
    const id = setInterval(compute, 60000);
    return () => clearInterval(id);
  }, [horaires]);

  if (!status) return null;

  if (variant === "fiche") {
    return (
      <div className="inline-flex items-center gap-2 text-sm font-medium">
        <span
          className={`inline-block w-2.5 h-2.5 rounded-full ${
            status.open ? "bg-green-500" : "bg-red-500"
          }`}
          aria-hidden="true"
        />
        <span className={status.open ? "text-green-700" : "text-gray-700"}>{status.label}</span>
      </div>
    );
  }

  // variant carte : pill compacte
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium ${
        status.open
          ? "bg-green-50 text-green-700 border border-green-200"
          : "bg-red-50 text-red-700 border border-red-200"
      }`}
      title={status.label}
    >
      <span
        className={`inline-block w-1.5 h-1.5 rounded-full ${
          status.open ? "bg-green-500" : "bg-red-500"
        }`}
        aria-hidden="true"
      />
      {status.open ? "Ouvert" : status.nextDayLabel ? `Ouvre ${status.nextDayLabel}` : "Fermé"}
    </span>
  );
}
