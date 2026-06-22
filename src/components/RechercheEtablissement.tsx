"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2, MapPin } from "lucide-react";

type Resultat = {
  id: string;
  slug: string;
  nom_court: string | null;
  raison_sociale: string;
  ville: string | null;
  departement: string | null;
  categorie_simple: string;
};

// Libelle court par categorie_simple (evite d'importer le module data cote client).
const LABEL_CATEGORIE: Record<string, string> = {
  hopital: "Hôpital",
  clinique: "Clinique",
  ehpad: "EHPAD",
  "centre-sante": "Centre de santé",
  "centre-dialyse": "Centre de dialyse",
  "centre-oncologie": "Centre d'oncologie",
  psychiatrie: "Psychiatrie",
  rehabilitation: "Réadaptation",
  autre: "Établissement",
};

export default function RechercheEtablissement({
  className = "",
  placeholder = "Rechercher un hôpital, EHPAD, clinique...",
}: {
  className?: string;
  placeholder?: string;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Resultat[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounce 250ms sur la requete.
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/etablissements/search?q=${encodeURIComponent(q)}`,
          { signal: controller.signal }
        );
        if (!res.ok) throw new Error("erreur");
        const data = await res.json();
        setResults(Array.isArray(data.results) ? data.results : []);
        setOpen(true);
        setActiveIndex(-1);
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setResults([]);
        }
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  // Fermeture au clic exterieur.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const aller = (r: Resultat) => {
    setOpen(false);
    router.push(`/etablissements/${r.slug}`);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!open || results.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i <= 0 ? results.length - 1 : i - 1));
    } else if (e.key === "Enter") {
      if (activeIndex >= 0 && activeIndex < results.length) {
        e.preventDefault();
        aller(results[activeIndex]);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const showDropdown = open && query.trim().length >= 2;

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          aria-label="Rechercher un établissement de santé"
          role="combobox"
          aria-expanded={showDropdown}
          aria-controls="recherche-etablissement-resultats"
          autoComplete="off"
          className="w-full pl-11 pr-10 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-[#0066CC] focus:ring-2 focus:ring-blue-100 outline-none transition"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#0066CC] animate-spin" />
        )}
      </div>

      {showDropdown && (
        <ul
          id="recherche-etablissement-resultats"
          role="listbox"
          className="absolute z-30 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden max-h-80 overflow-y-auto"
        >
          {results.length === 0 && !loading ? (
            <li className="px-4 py-3 text-sm text-gray-500">Aucun résultat</li>
          ) : (
            results.map((r, i) => (
              <li key={r.id} role="option" aria-selected={i === activeIndex}>
                <button
                  type="button"
                  onMouseEnter={() => setActiveIndex(i)}
                  onClick={() => aller(r)}
                  className={`w-full text-left px-4 py-2.5 flex items-center justify-between gap-3 transition ${
                    i === activeIndex ? "bg-blue-50" : "hover:bg-gray-50"
                  }`}
                >
                  <span className="min-w-0">
                    <span className="block font-semibold text-gray-900 truncate">
                      {r.nom_court || r.raison_sociale}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <MapPin className="w-3 h-3" />
                      {r.ville}
                      {r.departement ? ` (${r.departement})` : ""}
                    </span>
                  </span>
                  <span className="flex-shrink-0 text-xs font-medium text-[#0066CC] bg-blue-50 px-2 py-0.5 rounded-full">
                    {LABEL_CATEGORIE[r.categorie_simple] ?? "Établissement"}
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
