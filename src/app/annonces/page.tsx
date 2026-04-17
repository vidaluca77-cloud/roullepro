'use client';
import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import AnnonceCard from '@/components/AnnonceCard';

type Category = { id: string; name: string; slug: string };

function AnnoncesPageInner() {
  const searchParams = useSearchParams();
  const [annonces, setAnnonces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 12;
  const supabase = createClient();

  // Charger les catégories en premier (nécessaire pour résoudre les slugs)
  useEffect(() => {
    loadCategories();
  }, []);

  // Dès que les catégories sont chargées, lire les params URL
  useEffect(() => {
    if (categories.length === 0) return;

    // Lire ?q= pour la recherche
    const qParam = searchParams.get('q') || '';
    setSearch(qParam);

    // Lire ?categorie=slug OU ?categorie=uuid
    const catParam = searchParams.get('categorie') || '';
    if (catParam) {
      // Si c'est un slug (ex: "vtc"), résoudre en UUID
      const matchBySlug = categories.find(c => c.slug === catParam);
      // Si c'est déjà un UUID, l'utiliser directement
      const matchById = categories.find(c => c.id === catParam);
      setCategoryId(matchBySlug?.id || matchById?.id || '');
    } else {
      setCategoryId('');
    }
  }, [categories, searchParams]);

  // Charger les favoris
  useEffect(() => {
    loadFavorites();
  }, []);

  // Recharger les annonces quand categoryId change
  useEffect(() => {
    fetchAnnonces();
  }, [categoryId]);

  const loadCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('id, name, slug')
      .order('sort_order');
    if (data) setCategories(data);
  };

  const loadFavorites = async () => {
    try {
      const response = await fetch('/api/favoris');
      if (response.ok) {
        const data = await response.json();
        setFavoriteIds(data.favoriteIds || []);
      }
    } catch (error) {
      console.error('Erreur chargement favoris:', error);
    }
  };

  const fetchAnnonces = async () => {
    setLoading(true);
    let query = supabase
      .from('annonces')
      .select('*, categories(id, name, slug)')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (categoryId) query = query.eq('category_id', categoryId);

    const { data } = await query;
    setAnnonces(data || []);
    setLoading(false);
  };

  // Filtre texte côté client (titre + marque + modèle + ville)
  const filtered = annonces.filter((a) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      a.title?.toLowerCase().includes(q) ||
      a.marque?.toLowerCase().includes(q) ||
      a.modele?.toLowerCase().includes(q) ||
      a.city?.toLowerCase().includes(q)
    );
  });

  const handleCategoryChange = (id: string) => {
    setCategoryId(id);
    setPage(1);
    const url = new URL(window.location.href);
    if (id) {
      const cat = categories.find(c => c.id === id);
      url.searchParams.set('categorie', cat?.slug || id);
    } else {
      url.searchParams.delete('categorie');
    }
    window.history.replaceState({}, '', url.toString());
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
    const url = new URL(window.location.href);
    if (value) {
      url.searchParams.set('q', value);
    } else {
      url.searchParams.delete('q');
    }
    window.history.replaceState({}, '', url.toString());
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-blue-600 text-white py-10 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-1">Véhicules professionnels</h1>
          <p className="text-blue-100">VTC, taxi, ambulance et plus</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6 flex flex-wrap gap-3">
          <div className="flex-1 min-w-48 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Rechercher (marque, titre, ville...)"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
          <select
            value={categoryId}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
          >
            <option value="">Toutes catégories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Fil d'Ariane catégorie active */}
        {categoryId && (
          <div className="flex items-center gap-2 mb-4 text-sm text-gray-600">
            <button
              onClick={() => handleCategoryChange('')}
              className="text-blue-600 hover:underline"
            >
              Toutes catégories
            </button>
            <span>›</span>
            <span className="font-medium text-gray-900">
              {categories.find(c => c.id === categoryId)?.name}
            </span>
            <span className="text-gray-400">({filtered.length} annonce{filtered.length > 1 ? 's' : ''})</span>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin h-10 w-10 border-b-2 border-blue-600 rounded-full" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 mb-2">Aucune annonce trouvée</p>
            {(search || categoryId) && (
              <button
                onClick={() => { handleSearchChange(''); handleCategoryChange(''); }}
                className="text-blue-600 hover:underline text-sm mr-4"
              >
                Réinitialiser les filtres
              </button>
            )}
            <Link href="/deposer-annonce" className="mt-4 inline-block bg-blue-600 text-white px-6 py-2 rounded-lg">
              Déposer une annonce
            </Link>
          </div>
        ) : (
          (() => {
            const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
            const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
            return (
              <>
                {!categoryId && !search && (
                  <p className="text-sm text-gray-500 mb-4">{filtered.length} annonce{filtered.length > 1 ? 's' : ''}</p>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {paginated.map((a) => (
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
                      className="p-2 rounded-lg border hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                      <button
                        key={p}
                        onClick={() => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                        className={`w-9 h-9 rounded-lg text-sm font-medium transition ${
                          p === page
                            ? 'bg-blue-600 text-white'
                            : 'border hover:bg-gray-100 text-gray-700'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                    <button
                      onClick={() => { setPage(p => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                      disabled={page === totalPages}
                      className="p-2 rounded-lg border hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                )}
              </>
            );
          })()
        )}
      </div>
    </div>
  );
}

export default function AnnoncesPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center py-20">
        <div className="animate-spin h-10 w-10 border-b-2 border-blue-600 rounded-full" />
      </div>
    }>
      <AnnoncesPageInner />
    </Suspense>
  );
}
