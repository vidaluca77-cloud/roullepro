"use client";

import { useState } from "react";
import { Loader2, CheckCircle2, Car } from "lucide-react";

export default function MiniFormulaireReservation({
  etablissementId,
  lieuArrivee,
  departementCible = null,
  villeCible = null,
}: {
  etablissementId: string;
  lieuArrivee: string;
  departementCible?: string | null;
  villeCible?: string | null;
}) {
  const [nom, setNom] = useState("");
  const [telephone, setTelephone] = useState("");
  const [dateSouhaitee, setDateSouhaitee] = useState("");
  const [bonTransport, setBonTransport] = useState(false);
  // Honeypot anti-bot : doit rester vide.
  const [website, setWebsite] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!nom.trim() || !telephone.trim()) {
      setError("Merci d'indiquer votre nom et votre téléphone.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/demande-transport", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type_transport: "taxi",
          nom: nom.trim(),
          telephone: telephone.trim(),
          date_souhaitee: dateSouhaitee || null,
          lieu_arrivee: lieuArrivee,
          bon_transport_medical: bonTransport,
          etablissement_id: etablissementId,
          departement_cible: departementCible,
          ville_cible: villeCible,
          source_page: "fiche_etablissement",
          source_form: "widget",
          website,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Erreur lors de l'envoi");
      setSent(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="bg-white/10 border border-white/20 rounded-xl p-4 text-center">
        <CheckCircle2 className="w-8 h-8 text-white mx-auto mb-2" />
        <div className="font-semibold text-white">Votre demande a bien été envoyée</div>
        <p className="text-sm text-blue-100 mt-1">
          Un transporteur conventionné proche vous rappellera rapidement.
        </p>
      </div>
    );
  }

  const inputCls =
    "w-full px-3 py-2.5 rounded-xl border border-white/20 bg-white text-gray-900 placeholder-gray-400 focus:border-white focus:ring-2 focus:ring-white/40 outline-none transition text-sm";

  return (
    <form onSubmit={onSubmit} className="space-y-2.5" aria-label="Réserver un transport">
      <div className="flex items-center gap-2 text-white mb-1">
        <Car className="w-5 h-5" />
        <span className="font-bold">Réserver un transport</span>
      </div>
      <input
        type="text"
        placeholder="Votre nom"
        value={nom}
        onChange={(e) => setNom(e.target.value)}
        required
        minLength={2}
        aria-label="Votre nom"
        className={inputCls}
      />
      <input
        type="tel"
        placeholder="Votre téléphone"
        value={telephone}
        onChange={(e) => setTelephone(e.target.value)}
        required
        aria-label="Votre téléphone"
        className={inputCls}
      />
      <input
        type="date"
        value={dateSouhaitee}
        onChange={(e) => setDateSouhaitee(e.target.value)}
        aria-label="Date souhaitée"
        className={inputCls}
      />
      <label className="flex items-center gap-2 text-sm text-white cursor-pointer">
        <input
          type="checkbox"
          checked={bonTransport}
          onChange={(e) => setBonTransport(e.target.checked)}
          className="w-4 h-4 rounded border-white/40"
        />
        J&apos;ai un bon de transport médical
      </label>
      {/* Honeypot anti-bot : invisible. */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        style={{ display: "none" }}
      />
      {error && (
        <div className="text-xs text-white bg-red-500/30 border border-red-300/40 rounded-lg px-3 py-2">
          {error}
        </div>
      )}
      <button
        type="submit"
        disabled={loading}
        className="w-full inline-flex items-center justify-center gap-2 bg-white text-[#0066CC] font-semibold px-4 py-2.5 rounded-xl transition hover:bg-blue-50 disabled:opacity-60"
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        Réserver un transport
      </button>
      <p className="text-[11px] text-blue-100 text-center">
        Sans engagement. Ne mentionnez aucune donnée médicale.
      </p>
    </form>
  );
}
