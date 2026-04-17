'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Shield, Check, X, Eye } from 'lucide-react';
import Link from 'next/link';

export default function AdminPage() {
  const router = useRouter();
  const supabase = createClient();
  const [annonces, setAnnonces] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('annonces');

  useEffect(() => { init(); }, []);

  const init = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push('/auth/login'); return; }
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (!profile || profile.role !== 'admin') { router.push('/'); return; }
    const { data: a } = await supabase.from('annonces').select('*, profiles(full_name, email), categories(name)').order('created_at', { ascending: false });
    setAnnonces(a || []);
    const { data: p } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    setUsers(p || []);
    setLoading(false);
  };

  const updateStatut = async (id: string, status: string) => {
    await supabase.from('annonces').update({ status }).eq('id', id);
    setAnnonces(prev => prev.map(a => a.id === id ? {...a, status} : a));
  };

  const deleteAnnonce = async (id: string) => {
    if (!confirm('Supprimer ?')) return;
    await supabase.from('annonces').delete().eq('id', id);
    setAnnonces(prev => prev.filter(a => a.id !== id));
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin h-10 w-10 border-b-2 border-blue-600 rounded-full"></div></div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gray-900 text-white py-8 px-4">
        <div className="max-w-6xl mx-auto flex items-center gap-3"><Shield size={28}/><div><h1 className="text-2xl font-bold">Administration</h1></div></div>
      </div>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm"><p className="text-3xl font-bold">{annonces.length}</p><p className="text-gray-500">Annonces</p></div>
          <div className="bg-white rounded-xl p-6 shadow-sm"><p className="text-3xl font-bold text-green-600">{annonces.filter(a=>a.status==='active').length}</p><p className="text-gray-500">Actives</p></div>
          <div className="bg-white rounded-xl p-6 shadow-sm"><p className="text-3xl font-bold text-blue-600">{users.length}</p><p className="text-gray-500">Utilisateurs</p></div>
        </div>
        <div className="flex gap-2 mb-4">
          <button onClick={()=>setTab('annonces')} className={`px-4 py-2 rounded-lg ${tab==='annonces'?'bg-blue-600 text-white':'bg-white text-gray-600'}`}>Annonces</button>
          <button onClick={()=>setTab('users')} className={`px-4 py-2 rounded-lg ${tab==='users'?'bg-blue-600 text-white':'bg-white text-gray-600'}`}>Utilisateurs</button>
        </div>
        {tab === 'annonces' ? (
          <div className="bg-white rounded-xl shadow-sm divide-y">
            {annonces.map(a => (
              <div key={a.id} className="p-4 flex items-center justify-between">
                <div>
                  <h3 className="font-medium">{a.title}</h3>
                  <div className="flex gap-2 text-sm text-gray-500 mt-1">
                    <span>{a.profiles?.full_name}</span>
                    <span>{a.categories?.name}</span>
                    {a.price && <span className="text-blue-600">{Number(a.price).toLocaleString()} EUR</span>}
                    <span className={`px-2 py-0.5 rounded-full text-xs ${a.status==='active'?'bg-green-100 text-green-700':'bg-red-100 text-red-700'}`}>{a.status}</span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Link href={`/annonces/${a.id}`} className="p-2 text-gray-400 hover:text-blue-600"><Eye size={16}/></Link>
                  {a.status !== 'active' && <button onClick={()=>updateStatut(a.id,'active')} className="p-2 text-gray-400 hover:text-green-600"><Check size={16}/></button>}
                  {a.status === 'active' && <button onClick={()=>updateStatut(a.id,'suspended')} className="p-2 text-gray-400 hover:text-orange-600"><X size={16}/></button>}
                  <button onClick={()=>deleteAnnonce(a.id)} className="p-2 text-gray-400 hover:text-red-600"><X size={16}/></button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm divide-y">
            {users.map(u => (
              <div key={u.id} className="p-4">
                <p className="font-medium">{u.full_name || u.email}</p>
                <p className="text-sm text-gray-500">{u.email}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
