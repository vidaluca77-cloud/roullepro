'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Plus, Trash2, Eye, LogOut, User } from 'lucide-react';
export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();
  const [profile, setProfile] = useState<any>(null);
  const [annonces, setAnnonces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { init(); }, []);

  const init = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push('/auth/login'); return; }
    const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    setProfile(p);
    const { data: a } = await supabase.from('annonces').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    setAnnonces(a || []);
    setLoading(false);
  };

  const del = async (id: string) => {
    if (!confirm('Supprimer ?')) return;
    await supabase.from('annonces').delete().eq('id', id);
    setAnnonces(prev => prev.filter(a => a.id !== id));
  };

  const signOut = async () => { await supabase.auth.signOut(); router.push('/'); };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin h-10 w-10 border-b-2 border-blue-600 rounded-full"></div></div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-blue-600 text-white py-8 px-4">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div><h1 className="text-2xl font-bold">Mon es
                        <Link href="/profil" className="flex items-center gap-2 bg-blue-500 px-4 py-2 rounded-lg hover:bg-blue-600"><User size={18} />Profil</Link>pace</h1><p className="text-blue-100">{profile?.prenom} {profile?.nom}</p></div>
          <button onClick={signOut} className="flex items-center gap-2 bg-blue-700 px-4 py-2 rounded-lg hover:bg-blue-800"><LogOut size={18}/>Deconnexion</button>
        </div>
      </div>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm"><p className="text-3xl font-bold text-blue-600">{annonces.length}</p><p className="text-gray-500">Annonces</p></div>
          <div className="bg-white rounded-xl p-6 shadow-sm"><p className="text-3xl font-bold text-green-600">{annonces.filter(a=>a.statut==='active').length}</p><p className="text-gray-500">Actives</p></div>
          <div className="bg-white rounded-xl p-6 shadow-sm flex items-center"><Link href="/deposer-annonce" className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 font-medium"><Plus size={20}/>Nouvelle annonce</Link></div>
        </div>
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b"><h2 className="text-lg font-semibold">Mes annonces</h2></div>
          {annonces.length === 0 ? (
            <div className="text-center py-12"><p className="text-gray-500">Aucune annonce</p><Link href="/deposer-annonce" className="mt-4 inline-block bg-blue-600 text-white px-6 py-2 rounded-lg">Deposer une annonce</Link></div>
          ) : (
            <div className="divide-y">
              {annonces.map(a => (
                <div key={a.id} className="p-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{a.titre}</h3>
                    <div className="flex gap-3 text-sm text-gray-500 mt-1">
                      <span className={`px-2 py-0.5 rounded-full text-xs ${a.statut==='active'?'bg-green-100 text-green-700':'bg-gray-100 text-gray-600'}`}>{a.statut}</span>
                      {a.prix && <span className="text-blue-600 font-medium">{Number(a.prix).toLocaleString()} EUR</span>}
                      {a.categorie && <span>{a.categorie}</span>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/annonces/${a.id}`} className="p-2 text-gray-400 hover:text-blue-600"><Eye size={18}/></Link>
                    <button onClick={()=>del(a.id)} className="p-2 text-gray-400 hover:text-red-600"><Trash2 size={18}/></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
