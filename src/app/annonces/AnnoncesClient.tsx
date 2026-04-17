'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Search, ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react';
import AnnonceCard from '@/components/AnnonceCard';

type Category = { id: string; name: string; slug: string };

interface AnnoncesClientProps {
  initialAnnonces: any[];
  initialCategories: Category[];
  initialSearch: string;
  initialCategorie: string;
}

const PAGE_SIZE = 12;

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

  useEffect(() => { loadFavorites(); }, []);

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

  // Filtre client (instantané, données déjà chargées en SSR)
  const filtered = annonces.filter(a => {
    const matchCat = !categoryId || a.category_id === categoryId;
    if (!matchCat) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      a.title?.toLowerCase().includes(q) ||
      a.marque?.toLowerCase().includes(q) ||
      a.modele?.toLowerCase().includes(q) ||
      a.city?.toLowerCase().includes(q)
    );
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
        {/* Filtres */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6 flex flex-wrap gap-3 items-center">
          <SlidersHorizontal size={16} className="text-gray-400" />
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
            {(search || categoryId) && (
              <button
                onClick={() => { handleSearchChange(''); handleCategoryChange(''); }}
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
