"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Search, Cross, Car, Users, Loader2 } from "lucide-react";
import { CATEGORIES_SANITAIRE } from "@/lib/sanitaire-data";

type Suggestion = {
  ville: string;
  ville_slug: string;
  code_postal: string;
  departement: string;
  count: number;
};

type Props = {
  variant?: "hero" | "compact";
  defaultVille?: string;
  defaultCategorie?: string;
};

export default function SearchHero({ variant = "hero", defaultVille = "", defaultCategorie = "" }: Props) {
  const router = useRouter();
  const [ville, setVille] = useState(defaultVille);
  const [categorie, setCategorie] = useState(defaultCategorie);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (ville.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    if (abortRef.current) abortRef.current.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/sanitaire/autocomplete?q=${encodeURIComponent(ville.trim())}`, { signal: ctrl.signal });
        if (!res.ok) return;
        const data = await res.json();
        setSuggestions(data.results || []);
        setOpen(true);
      } catch {
        // ignore abort
      } finally {
        setLoading(false);
      }
    }, 180);
    return () => {
      clearTimeout(timer);
      ctrl.abort();
    };
  }, [ville]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const params = new URLSearchParams();
    if (ville.trim()) params.set("q", ville.trim());
    if (categorie) params.set("categorie", categorie);
    router.push(`/transport-medical/recherche?${params.toString()}`);
  };

  const pickSuggestion = (s: Suggestion) => {
    setVille(s.ville);
    setOpen(false);
    // Redirection directe vers la page ville
    setSubmitting(true);
    const params = new URLSearchParams();
    params.set("q", s.ville);
    if (categorie) params.set("categorie", categorie);
    router.push(`/transport-medical/recherche?${params.toString()}`);
  };

  const containerClass = variant === "hero"
    ? "bg-white rounded-2xl shadow-2xl p-2 flex flex-col md:flex-row gap-2"
    : "bg-white rounded-xl shadow-md p-2 flex flex-col md:flex-row gap-2 border border-gray-200";

  const catIcon = (slug: string) => {
    if (slug === "ambulance") return <Cross className="w-4 h-4" />;
    if (slug === "vsl") return <Car className="w-4 h-4" />;
    if (slug === "taxi-conventionne") return <Users className="w-4 h-4" />;
    return null;
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      <form onSubmit={handleSubmit} className={containerClass}>
        <div className="flex-1 flex items-center gap-3 px-4 relative">
          <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0" />
          <input
            type="text"
            value={ville}
            onChange={(e) => setVille(e.target.value)}
            onFocus={() => ville.length >= 2 && setOpen(true)}
            placeholder="Ville, code postal ou département"
            className="w-full py-3 text-gray-900 bg-transparent outline-none placeholder:text-gray-400"
            aria-label="Ville ou code postal"
            autoComplete="off"
          />
          {loading && <Loader2 className="w-4 h-4 text-gray-400 animate-spin flex-shrink-0" />}
        </div>
        <select
          value={categorie}
          onChange={(e) => setCategorie(e.target.value)}
          className="px-4 py-3 text-gray-900 bg-transparent outline-none md:border-l md:border-gray-200 cursor-pointer"
          aria-label="Type de transport"
        >
          <option value="">Tous types</option>
          {CATEGORIES_SANITAIRE.map((c) => (
            <option key={c.slug} value={c.slug}>{c.labelPluriel}</option>
          ))}
        </select>
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center justify-center gap-2 bg-[#0066CC] hover:bg-[#0052a3] disabled:opacity-60 text-white font-semibold px-6 py-3 rounded-xl transition"
        >
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          Rechercher
        </button>
      </form>

      {open && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50">
          <ul className="max-h-80 overflow-y-auto">
            {suggestions.map((s) => (
              <li key={s.ville_slug}>
                <button
                  type="button"
                  onClick={() => pickSuggestion(s)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 text-left transition"
                >
                  <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {s.ville} <span className="text-gray-500 font-normal">({s.code_postal?.slice(0, 2)})</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {s.count} professionnel{s.count > 1 ? "s" : ""} référencé{s.count > 1 ? "s" : ""}
                    </div>
                  </div>
                  {categorie && <span className="text-gray-400">{catIcon(categorie)}</span>}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
