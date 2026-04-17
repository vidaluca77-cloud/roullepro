'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Shield, Check, X, Eye, Clock, AlertCircle } from 'lucide-react';
import Link from 'next/link';

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  active:    { label: 'Active',      className: 'bg-green-100 text-green-700' },
  pending:   { label: 'En attente',  className: 'bg-amber-100 text-amber-700' },
  rejected:  { label: 'Refusée',     className: 'bg-red-100 text-red-700' },
  suspended: { label: 'Suspendue',   className: 'bg-gray-100 text-gray-600' },
};

export default function AdminPage() {
  const router = useRouter();
  const supabase = createClient();
  const [annonces, setAnnonces] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('pending');

  useEffect(() => { init(); }, []);

  const init = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push('/auth/login'); return; }
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (!profile || profile.role !== 'admin') { router.push('/'); return; }
    const { data: a } = await supabase
      .from('annonces')
      .select('*, profiles(full_name, email, company_name), categories(name)')
      .order('created_at', { ascending: false });
    setAnnonces(a || []);
    const { data: p } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    setUsers(p || []);
    setLoading(false);
  };

  const updateStatut = async (id: string, status: string) => {
    // Pour approve/reject : passer par l'API route qui déclenche les emails
    if (status === 'active' || status === 'rejected') {
      const action = status === 'active' ? 'approve' : 'reject';
      const res = await fetch('/api/admin/moderation', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ annonce_id: id, action }),
      });
      if (!res.ok) {
        console.error('Erreur moderation API:', await res.text());
      }
    } else {
      // Pour suspended / autres statuts : Supabase direct
      await supabase.from('annonces').update({ status }).eq('id', id);
    }
    setAnnonces(prev => prev.map(a => a.id === id ? { ...a, status } : a));
  };

  const deleteAnnonce = async (id: string) => {
    if (!confirm('Supprimer cette annonce définitivement ?')) return;
    await supabase.from('annonces').delete().eq('id', id);
    setAnnonces(prev => prev.filter(a => a.id !== id));
  };

  const pendingAnnonces = annonces.filter(a => a.status === 'pending');
  const allAnnonces = annonces;

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="animate-spin h-10 w-10 border-b-2 border-blue-600 rounded-full"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gray-900 text-white py-8 px-4">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <Shield size={28} />
          <div>
            <h1 className="text-2xl font-bold">Administration</h1>
            <p className="text-gray-400 text-sm">RoullePro</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <p className="text-3xl font-bold">{annonces.length}</p>
            <p className="text-gray-500">Annonces total</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <p className="text-3xl font-bold text-amber-600">{pendingAnnonces.length}</p>
            <p className="text-gray-500">En attente</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <p className="text-3xl font-bold text-green-600">{annonces.filter(a => a.status === 'active').length}</p>
            <p className="text-gray-500">Actives</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <p className="text-3xl font-bold text-blue-600">{users.length}</p>
            <p className="text-gray-500">Utilisateurs</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4 flex-wrap">
          <button
            onClick={() => setTab('pending')}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 ${tab === 'pending' ? 'bg-amber-500 text-white' : 'bg-white text-gray-600'}`}
          >
            <Clock size={16} />
            Modération
            {pendingAnnonces.length > 0 && (
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${tab === 'pending' ? 'bg-white text-amber-600' : 'bg-amber-100 text-amber-700'}`}>
                {pendingAnnonces.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setTab('annonces')}
            className={`px-4 py-2 rounded-lg ${tab === 'annonces' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600'}`}
          >
            Toutes les annonces
          </button>
          <button
            onClick={() => setTab('users')}
            className={`px-4 py-2 rounded-lg ${tab === 'users' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600'}`}
          >
            Utilisateurs
          </button>
          <Link
            href="/admin/verification"
            className="px-4 py-2 rounded-lg bg-white text-gray-600 hover:bg-blue-50 hover:text-blue-600"
          >
            Vérifications
          </Link>
        </div>

        {/* Onglet Modération */}
        {tab === 'pending' && (
          <div className="bg-white rounded-xl shadow-sm">
            {pendingAnnonces.length === 0 ? (
              <div className="text-center py-16">
                <Check size={40} className="mx-auto text-green-400 mb-3" />
                <p className="text-gray-500 font-medium">Aucune annonce en attente</p>
                <p className="text-gray-400 text-sm mt-1">Toutes les annonces ont été traitées.</p>
              </div>
            ) : (
              <div className="divide-y">
                {pendingAnnonces.map(a => (
                  <div key={a.id} className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="font-semibold text-gray-900">{a.title}</h3>
                          <span className="px-2 py-0.5 rounded-full text-xs bg-amber-100 text-amber-700">En attente</span>
                        </div>
                        <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                          <span className="font-medium text-gray-700">
                            {a.profiles?.company_name || a.profiles?.full_name}
                          </span>
                          {a.profiles?.email && <span>{a.profiles.email}</span>}
                          {a.categories?.name && <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded">{a.categories.name}</span>}
                          {a.price && <span className="text-blue-600 font-medium">{Number(a.price).toLocaleString()} €</span>}
                          {a.city && <span>{a.city}</span>}
                        </div>
                        {a.description && (
                          <p className="text-sm text-gray-400 mt-2 line-clamp-2">{a.description}</p>
                        )}
                        <p className="text-xs text-gray-300 mt-1">
                          Soumis le {new Date(a.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <Link href={`/annonces/${a.id}`} className="p-2 text-gray-400 hover:text-blue-600 border rounded-lg hover:border-blue-300 transition" title="Voir l'annonce">
                          <Eye size={16} />
                        </Link>
                        <button
                          onClick={() => updateStatut(a.id, 'active')}
                          className="px-3 py-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-1 transition"
                          title="Approuver"
                        >
                          <Check size={15} /> Approuver
                        </button>
                        <button
                          onClick={() => updateStatut(a.id, 'rejected')}
                          className="px-3 py-2 text-sm bg-red-100 hover:bg-red-200 text-red-700 rounded-lg flex items-center gap-1 transition"
                          title="Refuser"
                        >
                          <X size={15} /> Refuser
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Onglet Toutes les annonces */}
        {tab === 'annonces' && (
          <div className="bg-white rounded-xl shadow-sm divide-y">
            {allAnnonces.length === 0 && (
              <div className="text-center py-12 text-gray-400">Aucune annonce</div>
            )}
            {allAnnonces.map(a => {
              const st = STATUS_LABELS[a.status] || { label: a.status, className: 'bg-gray-100 text-gray-600' };
              return (
                <div key={a.id} className="p-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{a.title}</h3>
                    <div className="flex gap-2 text-sm text-gray-500 mt-1 flex-wrap">
                      <span>{a.profiles?.full_name || a.profiles?.email}</span>
                      <span>{a.categories?.name}</span>
                      {a.price && <span className="text-blue-600">{Number(a.price).toLocaleString()} €</span>}
                      <span className={`px-2 py-0.5 rounded-full text-xs ${st.className}`}>{st.label}</span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Link href={`/annonces/${a.id}`} className="p-2 text-gray-400 hover:text-blue-600"><Eye size={16} /></Link>
                    {a.status === 'pending' && (
                      <button onClick={() => updateStatut(a.id, 'active')} className="p-2 text-gray-400 hover:text-green-600" title="Approuver">
                        <Check size={16} />
                      </button>
                    )}
                    {a.status !== 'active' && a.status !== 'pending' && (
                      <button onClick={() => updateStatut(a.id, 'active')} className="p-2 text-gray-400 hover:text-green-600" title="Réactiver">
                        <Check size={16} />
                      </button>
                    )}
                    {a.status === 'active' && (
                      <button onClick={() => updateStatut(a.id, 'suspended')} className="p-2 text-gray-400 hover:text-orange-600" title="Suspendre">
                        <AlertCircle size={16} />
                      </button>
                    )}
                    {a.status === 'pending' && (
                      <button onClick={() => updateStatut(a.id, 'rejected')} className="p-2 text-gray-400 hover:text-red-600" title="Refuser">
                        <X size={16} />
                      </button>
                    )}
                    <button onClick={() => deleteAnnonce(a.id)} className="p-2 text-gray-400 hover:text-red-600" title="Supprimer">
                      <X size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Onglet Utilisateurs */}
        {tab === 'users' && (
          <div className="bg-white rounded-xl shadow-sm divide-y">
            {users.length === 0 && (
              <div className="text-center py-12 text-gray-400">Aucun utilisateur</div>
            )}
            {users.map(u => (
              <div key={u.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">{u.full_name || u.email}</p>
                  <p className="text-sm text-gray-500">{u.email}</p>
                  {u.company_name && <p className="text-sm text-gray-400">{u.company_name}</p>}
                </div>
                <div className="flex items-center gap-2">
                  {u.role === 'admin' && (
                    <span className="px-2 py-0.5 bg-gray-900 text-white text-xs rounded-full">Admin</span>
                  )}
                  {u.is_verified && (
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">Vérifié</span>
                  )}
                  {u.statut_verification === 'en_attente' && (
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full">Vérif. en attente</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
