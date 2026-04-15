'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, MapPin, Heart } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

type Category = { id: string; name: string; slug: string };

export default function AnnoncesPage() {
  const [annonces, setAnnonces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categorie, setCategorie] = useState('');
    const [favoris, setFavoris] = useState<Set<string>>(new Set());
  const [categories, setCategories] = useState<Category[]>([]);
  const supabase = createClient();

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    fetchAnnonces();
  }, [categorie]);

  const loadCategories = async () => {
    const { data } = await supabase.from('categories').select('id, name, slug').order('name');
    if (data) setCategories(data);
  };

  const fetchAnnonces = async () => {
    setLoading(true);
    let query = supabase.from('annonces').select('*').eq('statut', 'active').order('created_at', { ascending: false });
    if (categorie) query = query.eq('category_id', categorie);
    const { data } = await query;
    setAnnonces(data || []);
    setLoading(false);
  };

    const toggleFavoris = async (annonceId: string, e: React.MouseEvent) => {
    e.preventDefault(); // Empêcher la navigation
    e.stopPropagation();
    
    const isFavoris = favoris.has(annonceId);
    
    try {
      if (isFavoris) {
        // Retirer des favoris
        const response = await fetch(`/api/favoris?annonce_id=${annonceId}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          setFavoris(prev => {
            const newSet = new Set(prev);
            newSet.delete(annonceId);
            return newSet;
          });
        }
      } else {
        // Ajouter aux favoris
        const response = await fetch('/api/favoris', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ annonce_id: annonceId })
        });
        
        if (response.ok) {
          setFavoris(prev => new Set(prev).add(annonceId));
        }
      }
    } catch (error) {
      console.error('Erreur favoris:', error);
    }
  };

  const filtered = annonces.filter((a) => {
    return !search || a.title?.toLowerCase().includes(search.toLowerCase()) || a.marque?.toLowerCase().includes(search.toLowerCase());
  });
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-blue-600 text-white py-10 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-1">Vehicules professionnels</h1>
          <p className="text-blue-100">VTC, taxi, ambulance et plus</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6 flex flex-wrap gap-3">
          <div className="flex-1 min-w-48 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Rechercher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm"
            />
          </div>
          <select
            value={categorie}
            onChange={(e) => setCategorie(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            <option value="">Toutes categories</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="animate-spin h-10 w-10 border-b-2 border-blue-600 rounded-full"></div></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500">Aucune annonce trouvee</p>
            <Link href="/deposer-annonce" className="mt-4 inline-block bg-blue-600 text-white px-6 py-2 rounded-lg">Deposer une annonce</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((a) => (
              <Link key={a.id} href={`/annonces/${a.id}`}>
                <div className="bg-white relative rounded-xl shadow-sm hover:shadow-md transitio
                                        {/* Bouton favoris */}
                      <button
                        onClick={(e) => toggleFavoris(a.id, e)}
                        className="absolute top-2 right-2 z-10 bg-white rounded-full p-2 shadow-md hover:bg-gray-50 transition-colors"
                        title={favoris.has(a.id) ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                      >
                        <Heart
                          size={20}
                          className={favoris.has(a.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}
                        />
                      </button>n overflow-hidden">
                  <div className="bg-gray-100 h-48 flex items-center justify-center">
                    {a.photos?.[0] ? <img src={a.photos[0]} alt={a.title} className="w-full h-full object-cover" /> : <span className="text-gray-400 text-sm">Pas de photo</span>}
                  </div>
                  <div className="p-4">
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">{a.categorie}</span>
                    <h3 className="font-semibold mt-2 truncate">{a.title}</h3>
                    <p className="text-blue-600 font-bold text-lg">{a.price ? `${Number(a.price).toLocaleString()} €` : 'Sur demande'}</p>
                    <div className="text-xs text-gray-500 mt-1 flex gap-2">
                      {a.ville && <span><MapPin size={10} className="inline" /> {a.ville}</span>}
                      {a.annee && <span>{a.annee}</span>}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
