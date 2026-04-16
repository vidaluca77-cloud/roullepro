'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Plus, Trash2, Eye, LogOut, User, Heart, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();
  const [profile, setProfile] = useState<any>(null);
  const [annonces, setAnnonces] = useState<any[]>([]);
  const [favoris, setFavoris] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedMessages, setExpandedMessages] = useState<string[]>([]);

  const loadFavoris = useCallback(async () => {
    try {
      const response = await fetch('/api/favoris');
      if (response.ok) {
        const favData = await response.json();
        setFavoris(favData.filter((f: any) => f.annonces && (f.annonces as any)?.status === 'active'));
      }
    } catch (error) {
      console.error('Erreur chargement favoris:', error);
    }
  }, []);

  const loadMessages = useCallback(async () => {
    try {
      const response = await fetch('/api/messages');
      if (response.ok) {
        const data = await response.json();
        setMessages(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Erreur chargement messages:', error);
    }
  }, []);

  useEffect(() => { init(); }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      loadFavoris();
      loadMessages();
    }, 5000);
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadFavoris();
        loadMessages();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [loadFavoris, loadMessages]);

  const init = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push('/auth/login'); return; }
    const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    setProfile(p);
    const { data: a } = await supabase.from('annonces').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    setAnnonces(a || []);
    await loadFavoris();
    await loadMessages();
    setLoading(false);
  };

  const del = async (id: string) => {
    if (!confirm('Supprimer ?')) return;
    await supabase.from('annonces').delete().eq('id', id);
    setAnnonces(prev => prev.filter(a => a.id !== id));
  };

  const signOut = async () => { await supabase.auth.signOut(); router.push('/'); };

  const toggleMessage = (id: string) => {
    setExpandedMessages(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

    const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/messages/${id}`, { method: 'PATCH' });
      loadMessages();
    } catch (error) {
      console.error('Erreur marquage lu:', error);
    }
  };

  const deleteMessage = async (id: string) => {
    if (!confirm('Supprimer ce message ?')) return;
    try {
      await fetch(`/api/messages/${id}`, { method: 'DELETE' });
      setMessages(prev => prev.filter(m => m.id !== id));
    } catch (error) {
      console.error('Erreur suppression:', error);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin h-10 w-10 border-b-2 border-blue-600 rounded-full"></div></div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-blue-600 text-white py-8 px-4">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div><h1 className="text-2xl font-bold">Mon espace</h1><p className="text-blue-100">{profile?.prenom} {profile?.nom}</p></div>
          <div className="flex gap-2">
            <Link href="/profil" className="flex items-center gap-2 bg-blue-500 px-4 py-2 rounded-lg hover:bg-blue-600"><User size={18} />Profil</Link>
            <button onClick={signOut} className="flex items-center gap-2 bg-blue-700 px-4 py-2 rounded-lg hover:bg-blue-800"><LogOut size={18}/>Déconnexion</button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm"><p className="text-3xl font-bold text-blue-600">{annonces.length}</p><p className="text-gray-500">Annonces</p></div>
          <div className="bg-white rounded-xl p-6 shadow-sm"><p className="text-3xl font-bold text-green-600">{annonces.filter(a=>a.status==='active').length}</p><p className="text-gray-500">Actives</p></div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <p className="text-3xl font-bold text-purple-600">{messages.length}</p>
            <p className="text-gray-500">Messages</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm flex items-center"><Link href="/deposer-annonce" className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 font-medium"><Plus size={20}/>Nouvelle annonce</Link></div>
        </div>

        {/* Section Messages reçus */}
        {messages.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm mb-8">
            <div className="p-6 border-b flex items-center gap-2">
              <MessageSquare size={20} className="text-blue-600" />
              <h2 className="text-lg font-semibold">Messages reçus</h2>
              <span className="ml-auto text-sm text-gray-500">{messages.length} message{messages.length > 1 ? 's' : ''}</span>
            </div>
            <div className="divide-y">
              {messages.map((msg: any) => (
                <div key={msg.id} className="p-4">
                  <button
                    onClick={() => toggleMessage(msg.id)}
                    className="w-full flex items-start justify-between gap-4 text-left"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-gray-900 truncate">{msg.sender_name}</span>
                        <span className="text-gray-400 text-sm">·</span>
                        <a
                          href={`mailto:${msg.sender_email}`}
                          className="text-blue-600 text-sm hover:underline"
                                            {!msg.is_read && (
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">Non lu</span>
                  )}
                  {msg.is_read && (
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">Lu</span>
                  )}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {msg.sender_email}
                        </a>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Pour : <Link href={`/annonces/${msg.annonce_id}`} className="hover:underline text-gray-500" onClick={(e) => e.stopPropagation()}>{msg.annonces?.title || 'Annonce'}</Link>
                        &nbsp;· {formatDate(msg.created_at)}
                      </p>
                      {!expandedMessages.includes(msg.id) && (
                        <p className="text-gray-600 text-sm mt-1 truncate">{msg.message}</p>
                      )}
                    </div>
                    <div className="flex-shrink-0 text-gray-400 mt-1">
                      {expandedMessages.includes(msg.id) ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </div>
                  </button>
                  {expandedMessages.includes(msg.id) && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-gray-700 whitespace-pre-line text-sm">{msg.message}</p>
                      <a
                        href={`mailto:${msg.sender_email}?subject=Re: ${msg.annonces?.title || 'Votre annonce'}`}
                        className="mt-3 inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                      >
                        <M
                                          <div className="flex gap-2 mt-2">
                  {!msg.is_read && (
                    <button
                      onClick={() => markAsRead(msg.id)}
                      className="px-3 py-1.5 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition font-medium"
                    >
                      Marquer comme lu
                    </button>
                  )}
                  <button
                    onClick={() => deleteMessage(msg.id)}
                    className="px-3 py-1.5 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition font-medium flex items-center gap-1"
                  >
                    <Trash2 size={14} /> Supprimer
                  </button>
                </div>essageSquare size={14} /> Répondre par email
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section Favoris */}
        {favoris.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm mb-8">
            <div className="p-6 border-b flex items-center gap-2"><Heart size={20} className="text-red-500" fill="currentColor" /><h2 className="text-lg font-semibold">Mes favoris</h2></div>
            <div className="divide-y">
              {favoris.map(f => {
                const annonce = f.annonces;
                if (!annonce) return null;
                return (
                  <div key={f.id} className="p-4 flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{annonce.title}</h3>
                      <div className="flex gap-3 text-sm text-gray-500 mt-1">
                        <span className="px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700">{annonce.status}</span>
                        {annonce.prix && <span className="text-blue-600 font-medium">{Number(annonce.prix).toLocaleString()} EUR</span>}
                        {annonce.categorie && <span>{annonce.categorie}</span>}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/annonces/${annonce.id}`} className="p-2 text-gray-400 hover:text-blue-600"><Eye size={18}/></Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Section Mes Annonces */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b"><h2 className="text-lg font-semibold">Mes annonces</h2></div>
          {annonces.length === 0 ? (
            <div className="text-center py-12"><p className="text-gray-500">Aucune annonce</p><Link href="/deposer-annonce" className="mt-4 inline-block bg-blue-600 text-white px-6 py-2 rounded-lg">Déposer une annonce</Link></div>
          ) : (
            <div className="divide-y">
              {annonces.map(a => (
                <div key={a.id} className="p-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{a.title}</h3>
                    <div className="flex gap-3 text-sm text-gray-500 mt-1">
                      <span className={`px-2 py-0.5 rounded-full text-xs ${a.status==='active'?'bg-green-100 text-green-700':'bg-gray-100 text-gray-600'}`}>{a.status}</span>
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
