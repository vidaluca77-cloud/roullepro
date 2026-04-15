'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, MapPin } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import AnnonceCard from '@/components/AnnonceCard';

type Category = { id: string; name: string; slug: string };

export default function AnnoncesPage() {
  const [annonces, setAnnonces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categorie, setCategorie] = useState('');
    const [marque, setMarque] = useState('');
    const [marques, setMarques] = useState<string[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const supabase = createClient();

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    fetchAnnonces();
  }, [categorie]);

    // Extract unique marques when annonces or categorie changes
  useEffect(() => {
    if (annonces.length > 0) {
      const filtered = categorie ? annonces.filter(a => a.category_id === categorie) : annonces;
      const uniqueMarques = Array.from(new Set(filtered.map(a => a.marque).filter(Boolean)));
      setMarques(uniqueMarques as string[]);
      setMarque(''); // Reset marque when category changes
    }
  }, [annonces, categorie]);

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

  const filtered = annonces.filter((a) => {
    // Filter by search (title and marque)
    const matchesSearch = !search || 
      a.title?.toLowerCase().includes(search.toLowerCase()) || 
      a.marque?.toLowerCase().includes(search.toLowerCase());
    
    // Filter by marque dropdown
    const matchesMarque = !marque || a.marque === marque;
    
    return matchesSearch && matchesMarque;
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
                  {marques.length > 0 && (
          <select
            value={marque}
            onChange={(e) => setMarque(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            <option value="">Toutes marques</option>
            {marques.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        )}
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
              <L              <AnnonceCard key={a.id} annonce={a} />
