"use client";

import { useEffect, useState, useRef } from "react";
import { Search, AlertTriangle, Check, Loader2 } from "lucide-react";

interface ProResult {
  id: string;
  siret: string | null;
  raison_sociale: string;
  nom_commercial: string | null;
  ville: string;
  code_postal: string;
  categorie: string;
  claimed: boolean | null;
}

const MOTIFS = [
  {
    value: "numero_errone",
    label: "Erreur de numéro de téléphone",
    description: "Le numéro affiché n'est pas le bon ou ne fonctionne plus.",
  },
  {
    value: "activite_cessee",
    label: "Activité cessée ou rachetée",
    description: "L'entreprise n'existe plus ou a été reprise par une autre.",
  },
  {
    value: "demande_suppression",
    label: "Demande de suppression (RGPD)",
    description: "Le professionnel demande le retrait de sa fiche.",
  },
  {
    value: "autre",
    label: "Autre",
    description: "Tout autre problème : doublon, informations erronées, etc.",
  },
];

export default function SignalerForm({
  initialFicheId,
  initialFicheNom,
}: {
  initialFicheId?: string;
  initialFicheNom?: string;
}) {
  const [query, setQuery] = useState(initialFicheNom || "");
  const [results, setResults] = useState<ProResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState<{ id: string; label: string } | null>(
    initialFicheId && initialFicheNom
      ? { id: initialFicheId, label: initialFicheNom }
      : null
  );
  const [showResults, setShowResults] = useState(false);

  const [motif, setMotif] = useState("");
  const [commentaire, setCommentaire] = useState("");
  const [email, setEmail] = useState("");
  const [hp, setHp] = useState("");

  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Recherche live (debounced)
  useEffect(() => {
    if (selected || query.trim().length < 3) {
      setResults([]);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(
          `/api/sanitaire/search?q=${encodeURIComponent(query.trim())}`
        );
        const data = await res.json();
        setResults(data.results || []);
        setShowResults(true);
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, selected]);

  function selectFiche(r: ProResult) {
    const label = `${r.nom_commercial || r.raison_sociale} — ${r.ville} (${r.code_postal})`;
    setSelected({ id: r.id, label });
    setQuery(label);
    setShowResults(false);
  }

  function clearSelection() {
    setSelected(null);
    setQuery("");
    setResults([]);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (hp) return;
    if (!selected) {
      setError("Sélectionnez d'abord la fiche concernée.");
      return;
    }
    if (!motif) {
      setError("Choisissez un motif.");
      return;
    }
    setLoading(true);
    try {
      const motifLabel = MOTIFS.find((m) => m.value === motif)?.label || motif;
      const res = await fetch("/api/signalements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target_type: "fiche_sanitaire",
          fiche_id: selected.id,
          raison: motifLabel,
          commentaire: commentaire.trim() || undefined,
          reporter_email: email.trim() || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setDone(true);
      } else {
        setError(data?.error || "Une erreur est survenue.");
      }
    } catch {
      setError("Une erreur réseau est survenue.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="text-center py-8">
        <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
          <Check className="w-7 h-7 text-emerald-600" />
        </div>
        <h2 className="text-lg font-bold text-gray-900 mb-2">Signalement transmis</h2>
        <p className="text-sm text-gray-600 max-w-md mx-auto">
          Notre équipe traite votre demande sous 72 heures ouvrées. Si vous avez
          renseigné votre email, vous recevrez une confirmation à réception du
          traitement.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      {/* Honeypot */}
      <input
        type="text"
        name="company"
        value={hp}
        onChange={(e) => setHp(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        style={{ position: "absolute", left: "-9999px", width: 1, height: 1 }}
        aria-hidden="true"
      />

      {/* 1. Recherche fiche */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          1. Quelle fiche souhaitez-vous signaler ?
        </label>
        {selected ? (
          <div className="flex items-center justify-between gap-3 px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl">
            <div className="flex items-center gap-2 min-w-0">
              <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <span className="text-sm font-medium text-gray-900 truncate">
                {selected.label}
              </span>
            </div>
            <button
              type="button"
              onClick={clearSelection}
              className="text-xs text-gray-500 hover:text-gray-700 underline"
            >
              Changer
            </button>
          </div>
        ) : (
          <div className="relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setShowResults(true)}
                placeholder="Nom de l'entreprise, ville ou SIRET (14 chiffres)…"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#0066CC] focus:border-transparent"
              />
              {searching && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />
              )}
            </div>
            {showResults && query.length >= 3 && results.length > 0 && (
              <ul className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-64 overflow-y-auto z-10">
                {results.map((r) => (
                  <li key={r.id}>
                    <button
                      type="button"
                      onClick={() => selectFiche(r)}
                      className="w-full text-left px-4 py-2.5 hover:bg-blue-50 transition border-b border-gray-100 last:border-0"
                    >
                      <div className="text-sm font-medium text-gray-900">
                        {r.nom_commercial || r.raison_sociale}
                      </div>
                      <div className="text-xs text-gray-500">
                        {r.ville} ({r.code_postal}) ·{" "}
                        {r.categorie === "taxi_conventionne"
                          ? "Taxi conventionné"
                          : r.categorie === "ambulance"
                            ? "Ambulance"
                            : "VSL"}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {showResults && query.length >= 3 && !searching && results.length === 0 && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg p-4 text-sm text-gray-500 z-10">
                Aucune fiche trouvée. Essayez avec le SIRET ou un autre mot-clé.
              </div>
            )}
          </div>
        )}
      </div>

      {/* 2. Motif */}
      <fieldset>
        <legend className="block text-sm font-semibold text-gray-900 mb-2">
          2. Quel est le motif du signalement ?
        </legend>
        <div className="space-y-2">
          {MOTIFS.map((m) => (
            <label
              key={m.value}
              className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${
                motif === m.value
                  ? "border-[#0066CC] bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <input
                type="radio"
                name="motif"
                value={m.value}
                checked={motif === m.value}
                onChange={() => setMotif(m.value)}
                className="mt-1"
              />
              <span className="flex-1">
                <span className="block text-sm font-medium text-gray-900">{m.label}</span>
                <span className="block text-xs text-gray-500">{m.description}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {/* 3. Commentaire */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          3. Précisez votre demande (optionnel)
        </label>
        <textarea
          rows={4}
          maxLength={1000}
          value={commentaire}
          onChange={(e) => setCommentaire(e.target.value)}
          placeholder={
            motif === "demande_suppression"
              ? "Indiquez votre lien avec l'entreprise (gérant, ayant-droit) pour traitement RGPD."
              : motif === "numero_errone"
                ? "Indiquez le bon numéro si vous le connaissez."
                : "Détails utiles à la vérification."
          }
          className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-[#0066CC] focus:border-transparent resize-none"
        />
      </div>

      {/* 4. Email contact */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          4. Votre email (recommandé pour le suivi)
        </label>
        <input
          type="email"
          maxLength={120}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="vous@exemple.fr"
          className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-[#0066CC] focus:border-transparent"
        />
        <p className="text-xs text-gray-500 mt-1">
          Utilisé uniquement pour vous tenir informé du traitement. Aucun usage commercial.
        </p>
      </div>

      {error && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !selected || !motif}
        className="w-full bg-[#0066CC] hover:bg-[#0052a3] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold px-5 py-3 rounded-xl transition"
      >
        {loading ? "Envoi…" : "Envoyer le signalement"}
      </button>
    </form>
  );
}
