"use client";

import { useState } from "react";
import { Search, Loader2, MapPin, ArrowRight } from "lucide-react";

type SearchResult = {
  id: string;
  siret: string;
  raison_sociale: string;
  nom_commercial: string | null;
  ville: string;
  code_postal: string;
  categorie: string;
  claimed: boolean;
};

export default function ReclamerRechercheForm() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[] | null>(null);

  const onSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim().length < 3) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/sanitaire/search?q=${encodeURIComponent(query.trim())}`);
      const data = await res.json();
      setResults(data.results || []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-2xl">
      <form onSubmit={onSearch} className="flex flex-col sm:flex-row gap-2">
        <div className="flex-1 flex items-center gap-3 border border-gray-200 rounded-xl px-4">
          <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Nom de votre entreprise ou numéro SIRET"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full py-3 text-gray-900 outline-none bg-transparent placeholder:text-gray-400"
          />
        </div>
        <button
          type="submit"
          disabled={loading || query.trim().length < 3}
          className="inline-flex items-center justify-center gap-2 bg-[#0066CC] hover:bg-[#0052a3] disabled:opacity-60 text-white font-semibold px-6 py-3 rounded-xl transition"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          Rechercher
        </button>
      </form>

      {results !== null && (
        <div className="mt-4 space-y-2 max-h-96 overflow-y-auto">
          {results.length === 0 ? (
            <div className="text-sm text-gray-600 bg-gray-50 rounded-xl p-4 text-center">
              Aucune entreprise trouvée. Si vous exercez dans une région hors Normandie/Bretagne,
              votre fiche sera ajoutée dans les prochaines semaines — ou{" "}
              <a href="mailto:contact@roullepro.com?subject=Ajout de ma fiche" className="text-[#0066CC] font-medium">
                contactez-nous
              </a>
              .
            </div>
          ) : (
            results.map((r) => (
              <a
                key={r.id}
                href={`/transport-medical/pro/reclamer?pro=${r.id}`}
                className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl hover:border-[#0066CC] hover:bg-blue-50/50 transition group"
              >
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900 text-sm truncate">
                    {r.nom_commercial || r.raison_sociale}
                  </div>
                  <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3" />
                    {r.code_postal} {r.ville} · SIRET {r.siret}
                    {r.claimed && <span className="ml-2 text-amber-600">déjà réclamée</span>}
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#0066CC] flex-shrink-0" />
              </a>
            ))
          )}
        </div>
      )}
    </div>
  );
}
