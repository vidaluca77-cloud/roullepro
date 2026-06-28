"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, BookOpen, Book } from "lucide-react";
import { TERMES, TermeCategorie } from "@/lib/glossaire-data";

const CATEGORIE_LABELS: Record<TermeCategorie, string> = {
  metier: "Métiers",
  vehicule: "Véhicules",
  reglementation: "Réglementation",
  financement: "Financement",
  medical: "Médical",
  administratif: "Administratif",
  technique: "Technique",
};

const CATEGORIES: TermeCategorie[] = [
  "metier",
  "vehicule",
  "reglementation",
  "financement",
  "medical",
  "administratif",
  "technique",
];

export default function GlossaireClient() {
  const [search, setSearch] = useState("");
  const [activeCategories, setActiveCategories] = useState<TermeCategorie[]>([]);

  const filtered = useMemo(() => {
    let results = Array.from(TERMES);

    if (activeCategories.length > 0) {
      results = results.filter((t) => activeCategories.includes(t.categorie));
    }

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      results = results.filter(
        (t) =>
          t.terme.toLowerCase().includes(q) ||
          t.termeComplet.toLowerCase().includes(q) ||
          (t.abreviation && t.abreviation.toLowerCase().includes(q)) ||
          (t.alternativesOrtho &&
            t.alternativesOrtho.some((a) => a.toLowerCase().includes(q))) ||
          t.definitionCourte.toLowerCase().includes(q)
      );
    }

    return results.sort((a, b) => a.terme.localeCompare(b.terme, "fr"));
  }, [search, activeCategories]);

  function toggleCategorie(cat: TermeCategorie) {
    setActiveCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  }

  return (
    <>
      {/* Search + Filters */}
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 mb-8">
        <div className="relative mb-4">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
            aria-hidden="true"
          />
          <input
            type="search"
            placeholder="Rechercher un terme (DEA, ARS, FINESS, ALD...)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Rechercher dans le glossaire"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => toggleCategorie(cat)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition ${
                activeCategories.includes(cat)
                  ? "bg-blue-600 border-blue-600 text-white"
                  : "bg-white border-gray-300 text-gray-700 hover:border-blue-400"
              }`}
              aria-pressed={activeCategories.includes(cat)}
            >
              {CATEGORIE_LABELS[cat]}
            </button>
          ))}
          {activeCategories.length > 0 && (
            <button
              onClick={() => setActiveCategories([])}
              className="px-3 py-1.5 rounded-full text-sm font-medium border border-red-300 text-red-600 hover:bg-red-50 transition"
            >
              Réinitialiser
            </button>
          )}
        </div>

        <p className="mt-3 text-sm text-gray-500">
          {filtered.length} terme{filtered.length > 1 ? "s" : ""} affiché
          {filtered.length > 1 ? "s" : ""}
          {TERMES.length !== filtered.length ? ` sur ${TERMES.length}` : ""}
        </p>
      </div>

      {/* Terms grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <Book
            size={40}
            className="mx-auto mb-3 text-gray-300"
            aria-hidden="true"
          />
          <p className="text-lg">Aucun terme ne correspond à votre recherche.</p>
          <button
            onClick={() => {
              setSearch("");
              setActiveCategories([]);
            }}
            className="mt-3 text-blue-600 hover:underline text-sm"
          >
            Réinitialiser les filtres
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((terme) => (
            <Link
              key={terme.slug}
              href={`/glossaire/${terme.slug}`}
              className="group block bg-white border border-gray-200 rounded-xl p-5 hover:border-blue-400 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <span className="font-bold text-gray-900 text-lg group-hover:text-blue-700 transition">
                    {terme.terme}
                  </span>
                  {terme.abreviation && terme.abreviation !== terme.terme && (
                    <span className="ml-2 text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                      {terme.abreviation}
                    </span>
                  )}
                </div>
                <span className="shrink-0 text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full capitalize">
                  {CATEGORIE_LABELS[terme.categorie]}
                </span>
              </div>
              <p className="text-sm text-gray-500 italic mb-2 leading-snug">
                {terme.termeComplet}
              </p>
              <p className="text-sm text-gray-700 leading-relaxed line-clamp-3">
                {terme.definitionCourte}
              </p>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
