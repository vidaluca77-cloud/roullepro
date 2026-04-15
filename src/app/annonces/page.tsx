'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, MapPin } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const CATEGORIES = [
  { value: '', label: 'Toutes categories' },
  { value: 'vtc', label: 'VTC' },
  { value: 'taxi', label: 'Taxi' },
  { value: 'ambulance', label: 'Ambulance' },
  { value: 'transport-scolaire', label: 'Transport scolaire' },
  { value: 'utilitaire', label: 'Utilitaire' },
  { value: 'autre', label: 'Autre' },
];

export default function AnnoncesPage() {
  const [annonces, setAnnonces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categorie, setCategorie] = useState('');
  const supabase = createClient();

  useEffect(() => { fetchAnnonces(); }, [categorie]);

  const fetchAnnonces = async () => {
    setLoading(true);
    let query = supabase.from('annonces').select('*').eq('statut', 'active').order('created_at', { ascending: false });
    if (categorie) query = query.eq('category_id', categorie);    const { data } = await query;
    setAnnonces(data || []);
    setLoading(false);
  };

  const filtered = annonces.filter((a) =>
    !search || a.title?.toLowerCase().includes(search.toLowerCase()) || a.marque?.toLowerCase().includes(search.toLowerCase())
  );

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
            <input type="text" placeholder="Rechercher..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm" />
          </div>
          <select value={categorie} onChange={(e) => setCategorie(e.target.value)} className="border rounded-lg px-3 py-2 text-sm">
            {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
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
                <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition overflow-hidden">
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
