"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarOff, CalendarCheck, Loader2, AlertCircle } from "lucide-react";
import { estIndisponibleMaintenant } from "@/lib/disponibilite";

// Format YYYY-MM-DD (fuseau local) pour l'input date et les raccourcis.
function toDateInput(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const j = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${j}`;
}

function dansNJours(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return toDateInput(d);
}

function formatFr(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Paris",
  });
}

export default function DisponibiliteSection({
  proId,
  indispoDebut,
  indispoFin,
}: {
  proId: string;
  indispoDebut: string | null | undefined;
  indispoFin: string | null | undefined;
}) {
  const router = useRouter();
  const indisponible = estIndisponibleMaintenant(indispoDebut, indispoFin);
  // Fin d'indispo saisie : par defaut la borne existante, sinon dans 1 semaine.
  const [dateFin, setDateFin] = useState<string>(
    indispoFin ? toDateInput(new Date(indispoFin)) : dansNJours(7)
  );
  const [loading, setLoading] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  async function envoyer(finIso: string | null) {
    setLoading(true);
    setErreur(null);
    try {
      const res = await fetch("/api/sanitaire/disponibilite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pro_id: proId, indispo_fin: finIso }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErreur(data?.error || "Une erreur est survenue");
        return;
      }
      router.refresh();
    } catch {
      setErreur("Impossible de contacter le serveur");
    } finally {
      setLoading(false);
    }
  }

  function poserIndispo() {
    if (!dateFin) {
      setErreur("Choisissez une date de fin");
      return;
    }
    // Fin de journee locale pour inclure toute la derniere journee.
    const fin = new Date(`${dateFin}T23:59:59`);
    if (fin.getTime() <= Date.now()) {
      setErreur("La date de fin doit être dans le futur");
      return;
    }
    void envoyer(fin.toISOString());
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5">
      <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
        {indisponible ? (
          <CalendarOff className="w-4 h-4 text-amber-600" />
        ) : (
          <CalendarCheck className="w-4 h-4 text-emerald-600" />
        )}
        Disponibilité
      </h3>

      {indisponible ? (
        <div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-3">
            <p className="text-sm font-semibold text-amber-900">
              Indisponible{indispoFin ? ` jusqu'au ${formatFr(indispoFin)}` : ""}
            </p>
            <p className="text-xs text-amber-800 mt-0.5">
              Vous ne recevez pas de nouvelles demandes de course pendant cette période.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void envoyer(null)}
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-sm font-semibold px-4 py-2 rounded-xl transition"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CalendarCheck className="w-4 h-4" />
            )}
            Je suis de retour
          </button>
        </div>
      ) : (
        <div>
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 mb-3">
            <p className="text-sm font-semibold text-emerald-900">
              Vous recevez les demandes
            </p>
            <p className="text-xs text-emerald-800 mt-0.5">
              Déclarez-vous indisponible (congés, semaine off) pour ne plus recevoir de
              nouvelles demandes pendant votre absence.
            </p>
          </div>

          <label className="block text-xs font-medium text-gray-700 mb-1">
            Indisponible jusqu&apos;au
          </label>
          <input
            type="date"
            value={dateFin}
            min={dansNJours(0)}
            onChange={(e) => setDateFin(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-[#0066CC]"
          />
          <div className="flex gap-2 mb-3">
            <button
              type="button"
              onClick={() => setDateFin(dansNJours(7))}
              className="flex-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium px-2 py-1.5 rounded-lg transition"
            >
              1 semaine
            </button>
            <button
              type="button"
              onClick={() => setDateFin(dansNJours(14))}
              className="flex-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium px-2 py-1.5 rounded-lg transition"
            >
              2 semaines
            </button>
          </div>
          <button
            type="button"
            onClick={poserIndispo}
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 bg-[#0066CC] hover:bg-[#0052a3] disabled:opacity-60 text-white text-sm font-semibold px-4 py-2 rounded-xl transition"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CalendarOff className="w-4 h-4" />
            )}
            Me déclarer indisponible
          </button>
        </div>
      )}

      {erreur && (
        <p className="mt-2 text-xs text-red-600 flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5" /> {erreur}
        </p>
      )}
    </div>
  );
}
