'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Search, ChevronLeft, ChevronRight, SlidersHorizontal, ChevronDown, ChevronUp, X } from 'lucide-react';
import AnnonceCard from '@/components/AnnonceCard';

type Category = { id: string; name: string; slug: string };

interface AnnoncesClientProps {
  initialAnnonces: any[];
  initialCategories: Category[];
  initialSearch: string;
  initialCategorie: string;
}

const PAGE_SIZE = 12;

const REGIONS = [
  'Auvergne-Rhône-Alpes',
  'Bourgogne-Franche-Comté',
  'Bretagne',
  'Centre-Val de Loire',
  'Corse',
  'Grand Est',
  'Hauts-de-France',
  'Île-de-France',
  'Normandie',
  'Nouvelle-Aquitaine',
  'Occitanie',
  'Pays de la Loire',
  "Provence-Alpes-Côte d'Azur",
];

const REGION_CITIES: Record<string, string[]> = {
  'Île-de-France': ['paris', 'versailles', 'boulogne', 'saint-denis', 'montreuil', 'argenteuil', 'nanterre', 'créteil', 'vitry', 'colombes', 'île-de-france'],
  'Auvergne-Rhône-Alpes': ['lyon', 'grenoble', 'saint-étienne', 'clermont', 'annecy', 'chambéry', 'valence', 'auvergne', 'rhône'],
  'Hauts-de-France': ['lille', 'amiens', 'roubaix', 'tourcoing', 'dunkerque', 'valenciennes', 'calais', 'hauts-de-france', 'nord', 'pas-de-calais'],
  'Nouvelle-Aquitaine': ['bordeaux', 'limoges', 'poitiers', 'pau', 'bayonne', 'périgueux', 'nouvelle-aquitaine', 'gironde'],
  'Occitanie': ['toulouse', 'montpellier', 'nîmes', 'perpignan', 'béziers', 'occitanie', 'hérault'],
  'Grand Est': ['strasbourg', 'reims', 'metz', 'nancy', 'mulhouse', 'colmar', 'grand est', 'alsace', 'lorraine', 'champagne'],
  "Provence-Alpes-Côte d'Azur": ['marseille', 'nice', 'toulon', 'aix-en-provence', 'avignon', 'antibes', 'paca', 'provence'],
  'Pays de la Loire': ['nantes', 'angers', 'le mans', 'saint-nazaire', 'pays de la loire', 'loire'],
  'Bretagne': ['rennes', 'brest', 'quimper', 'lorient', 'vannes', 'bretagne'],
  'Normandie': ['rouen', 'caen', 'le havre', 'cherbourg', 'normandie'],
  'Centre-Val de Loire': ['tours', 'orléans', 'bourges', 'chartres', 'centre', 'val de loire'],
  'Bourgogne-Franche-Comté': ['dijon', 'besançon', 'bourgogne', 'franche-comté'],
  'Corse': ['ajaccio', 'bastia', 'corse'],
};

const KM_OPTIONS = [
  { label: 'Tous', value: '' },
  { label: '< 50 000 km', value: '50000' },
  { label: '< 100 000 km', value: '100000' },
  { label: '< 200 000 km', value: '200000' },
  { label: '< 300 000 km', value: '300000' },
];

const currentYear = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: currentYear - 2010 + 1 }, (_, i) => 2010 + i);

export default function AnnoncesClient({
  initialAnnonces,
  initialCategories,
  initialSearch,
  initialCategorie,
}: AnnoncesClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [annonces] = useState(initialAnnonces);
  const [categories] = useState(initialCategories);
  const [search, setSearch] = useState(initialSearch);
  const [categoryId, setCategoryId] = useState(() => {
    if (!initialCategorie) return '';
    const matchSlug = initialCategories.find(c => c.slug === initialCategorie);
    const matchId   = initialCategories.find(c => c.id   === initialCategorie);
    return matchSlug?.id || matchId?.id || '';
  });
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [page, setPage] = useState(1);

  // Advanced filters
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [regionFilter, setRegionFilter] = useState('');
  const [kmMax, setKmMax] = useState('');
  const [yearMin, setYearMin] = useState('');

  // Collapsible state: open on desktop, closed on mobile (we detect via useState initial)
  const [filtersOpen, setFiltersOpen] = useState(true);

  useEffect(() => { loadFavorites(); }, []);

  // Close advanced filters by default on mobile
  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    if (isMobile) setFiltersOpen(false);
  }, []);

  const loadFavorites = async () => {
    try {
      const res = await fetch('/api/favoris');
      if (res.ok) {
        const data = await res.json();
        setFavoriteIds(data.favoriteIds || []);
      }
    } catch {}
  };

  const updateUrl = useCallback((newSearch: string, newCatId: string) => {
    const url = new URL(window.location.href);
    if (newSearch) url.searchParams.set('q', newSearch);
    else url.searchParams.delete('q');

    if (newCatId) {
      const cat = categories.find(c => c.id === newCatId);
      url.searchParams.set('categorie', cat?.slug || newCatId);
    } else {
      url.searchParams.delete('categorie');
    }
    window.history.replaceState({}, '', url.toString());
  }, [categories]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
    updateUrl(value, categoryId);
  };

  const handleCategoryChange = (id: string) => {
    setCategoryId(id);
    setPage(1);
    updateUrl(search, id);
  };

  const handleResetFilters = () => {
    setSearch('');
    setCategoryId('');
    setPriceMin('');
    setPriceMax('');
    setRegionFilter('');
    setKmMax('');
    setYearMin('');
    setPage(1);
    const url = new URL(window.location.href);
    url.searchParams.delete('q');
    url.searchParams.delete('categorie');
    window.history.replaceState({}, '', url.toString());
  };

  const hasActiveFilters = search || categoryId || priceMin || priceMax || regionFilter || kmMax || yearMin;

  // Client-side filtering
  const filtered = annonces.filter(a => {
    const matchCat = !categoryId || a.category_id === categoryId;
    if (!matchCat) return false;

    if (search) {
      const q = search.toLowerCase();
      const matchSearch = (
        a.title?.toLowerCase().includes(q) ||
        a.marque?.toLowerCase().includes(q) ||
        a.modele?.toLowerCase().includes(q) ||
        a.city?.toLowerCase().includes(q)
      );
      if (!matchSearch) return false;
    }

    // Prix
    if (priceMin && a.price < Number(priceMin)) return false;
    if (priceMax && a.price > Number(priceMax)) return false;

    // Région
    if (regionFilter) {
      const cities = REGION_CITIES[regionFilter] || [];
      const cityLower = (a.city || '').toLowerCase();
      const matchRegion = cities.some(c => cityLower.includes(c));
      if (!matchRegion) return false;
    }

    // Kilométrage
    if (kmMax && a.kilometrage > Number(kmMax)) return false;

    // Année
    if (yearMin && a.annee < Number(yearMin)) return false;

    return true;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const activeCat = categories.find(c => c.id === categoryId);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-600 text-white py-10 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-1">
            {activeCat ? activeCat.name : 'Véhicules professionnels'}
          </h1>
          <p className="text-blue-100">
            {activeCat
              ? `${filtered.length} annonce${filtered.length > 1 ? 's' : ''} dans cette catégorie`
              : 'VTC, taxi, ambulance, utilitaires et plus'}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Filtres bloc collapsible */}
        <div className="bg-white rounded-xl shadow-sm mb-6 overflow-hidden">
          {/* Header du bloc filtres */}
          <button
            onClick={() => setFiltersOpen(o => !o)}
            className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <SlidersHorizontal size={16} className="text-blue-600" />
              <span className="font-semibold text-gray-800 text-sm">Filtres</span>
              {hasActiveFilters && (
                <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-0.5 font-medium">
                  actifs
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500 font-medium">
                {filtered.length} résultat{filtered.length > 1 ? 's' : ''}
              </span>
              {filtersOpen ? (
                <ChevronUp size={16} className="text-gray-400" />
              ) : (
                <ChevronDown size={16} className="text-gray-400" />
              )}
            </div>
          </button>

          {filtersOpen && (
            <div className="border-t px-4 py-4">
              {/* Ligne 1 : Recherche + Catégorie */}
              <div className="flex flex-wrap gap-3 mb-4">
                <div className="flex-1 min-w-48 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    placeholder="Rechercher (marque, titre, ville...)"
                    value={search}
                    onChange={e => handleSearchChange(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
                <select
                  value={categoryId}
                  onChange={e => handleCategoryChange(e.target.value)}
                  className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                >
                  <option value="">Toutes catégories</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Ligne 2 : Filtres avancés */}
              <div className="flex flex-wrap gap-3 items-end">
                {/* Prix min / max */}
                <div className="flex gap-2 items-center">
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="Prix min €"
                      value={priceMin}
                      min={0}
                      onChange={e => { setPriceMin(e.target.value); setPage(1); }}
                      className="w-32 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <span className="text-gray-400 text-sm">—</span>
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="Prix max €"
                      value={priceMax}
                      min={0}
                      onChange={e => { setPriceMax(e.target.value); setPage(1); }}
                      className="w-32 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Région */}
                <select
                  value={regionFilter}
                  onChange={e => { setRegionFilter(e.target.value); setPage(1); }}
                  className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                >
                  <option value="">Toute la France</option>
                  {REGIONS.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>

                {/* Kilométrage max */}
                <select
                  value={kmMax}
                  onChange={e => { setKmMax(e.target.value); setPage(1); }}
                  className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                >
                  {KM_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>

                {/* Année min */}
                <select
                  value={yearMin}
                  onChange={e => { setYearMin(e.target.value); setPage(1); }}
                  className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                >
                  <option value="">Année min</option>
                  {YEAR_OPTIONS.map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>

                {/* Réinitialiser */}
                {hasActiveFilters && (
                  <button
                    onClick={handleResetFilters}
                    className="flex items-center gap-1.5 text-sm text-red-600 hover:text-red-700 border border-red-200 hover:border-red-300 rounded-lg px-3 py-2 transition-colors"
                  >
                    <X size={14} />
                    Réinitialiser les filtres
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Fil d'Ariane */}
        {activeCat && (
          <div className="flex items-center gap-2 mb-4 text-sm text-gray-600">
            <button onClick={() => handleCategoryChange('')} className="text-blue-600 hover:underline">
              Toutes catégories
            </button>
            <span>›</span>
            <span className="font-medium text-gray-900">{activeCat.name}</span>
            <span className="text-gray-400">({filtered.length} annonce{filtered.length > 1 ? 's' : ''})</span>
          </div>
        )}

        {/* Compteur */}
        {!activeCat && !search && (
          <p className="text-sm text-gray-500 mb-4">{filtered.length} annonce{filtered.length > 1 ? 's' : ''}</p>
        )}

        {/* Grille */}
        {paginated.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 mb-4">Aucune annonce trouvée</p>
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="text-blue-600 hover:underline text-sm mr-4"
              >
                Réinitialiser les filtres
              </button>
            )}
            <Link href="/deposer-annonce" className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg text-sm">
              Déposer une annonce
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {paginated.map(a => (
                <AnnonceCard
                  key={a.id}
                  annonce={a}
                  isFavorite={favoriteIds.includes(a.id)}
                  onFavoriteToggle={loadFavorites}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => { setPage(p => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  disabled={page === 1}
                  className="p-2 rounded-lg border hover:bg-gray-100 disabled:opacity-40 transition"
                >
                  <ChevronLeft size={18} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    onClick={() => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    className={`w-9 h-9 rounded-lg text-sm font-medium transition ${
                      p === page ? 'bg-blue-600 text-white' : 'border hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => { setPage(p => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  disabled={page === totalPages}
                  className="p-2 rounded-lg border hover:bg-gray-100 disabled:opacity-40 transition"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
