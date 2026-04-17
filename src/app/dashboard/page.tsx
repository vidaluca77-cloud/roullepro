'use client';
import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import StarRating from '@/components/StarRating';
import AlertesCategoriesToggle from '@/components/AlertesCategoriesToggle';
import ConversationThread from '@/components/ConversationThread';
import {
  Plus, Trash2, Eye, LogOut, User, Heart, MessageSquare,
  Clock, TrendingUp, Bell,
  BadgeCheck, BarChart2, Mail, Users,
} from 'lucide-react';

type Category = { id: string; name: string; slug: string };

function DashboardPageInner() {
  const router = useRouter();
  const supabase = createClient();
  const [profile, setProfile] = useState<any>(null);
  const [annonces, setAnnonces] = useState<any[]>([]);
  const [favoris, setFavoris] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [vendeurStats, setVendeurStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview'|'annonces'|'messages'|'favoris'|'alertes'>('overview');

  const loadFavoris = useCallback(async () => {
    try {
      const res = await fetch('/api/favoris');
      if (res.ok) {
        const data = await res.json();
        setFavoris(data.filter((f: any) => f.annonces?.status === 'active'));
      }
    } catch {}
  }, []);

  const loadMessages = useCallback(async () => {
    try {
      const res = await fetch('/api/messages');
      if (res.ok) {
        const data = await res.json();
        setMessages(Array.isArray(data) ? data : []);
      }
    } catch {}
  }, []);

  useEffect(() => { init(); }, []);

  useEffect(() => {
    const interval = setInterval(() => { loadFavoris(); loadMessages(); }, 5000);
    const onVisibility = () => { if (!document.hidden) { loadFavoris(); loadMessages(); } };
    document.addEventListener('visibilitychange', onVisibility);
    return () => { clearInterval(interval); document.removeEventListener('visibilitychange', onVisibility); };
  }, [loadFavoris, loadMessages]);

  const init = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push('/auth/login'); return; }

    const [{ data: p }, { data: a }, { data: cats }] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('annonces').select('*, categories(name, slug)').eq('user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('categories').select('id, name, slug').order('sort_order'),
    ]);

    setProfile(p);
    setAnnonces(a || []);
    setCategories(cats || []);

    // Stats vendeur : vues totales + notations
    const [notationsRes] = await Promise.all([
      fetch(`/api/notations?vendeur_id=${user.id}`),
    ]);
    if (notationsRes.ok) {
      const nd = await notationsRes.json();
      setVendeurStats(nd.stats);
    }

    await loadFavoris();
    await loadMessages();
    setLoading(false);
  };

  const del = async (id: string) => {
    if (!confirm('Supprimer cette annonce ?')) return;
    await supabase.from('annonces').delete().eq('id', id);
    setAnnonces(prev => prev.filter(a => a.id !== id));
  };
  const signOut = async () => { await supabase.auth.signOut(); router.push('/'); };

  const deleteMessage = async (id: string) => {
    if (!confirm('Supprimer cette conversation ?')) return;
    await fetch(`/api/messages/${id}`, { method: 'DELETE' });
    setMessages(prev => prev.filter(m => m.id !== id));
    if (selectedThreadId === id) setSelectedThreadId(null);
  };

  // Grouper les messages par thread (root message uniquement pour la liste)
  const rootMessages = messages.filter((m: any) => !m.thread_id);

  const searchParams = useSearchParams();
  const showPendingBanner = searchParams.get('annonce') === 'pending';

  // Agrégats
  const totalVues = annonces.reduce((s, a) => s + (a.views_count || 0), 0);
  const annoncesActives = annonces.filter(a => a.status === 'active');
  const annoncesPending = annonces.filter(a => a.status === 'pending');
  const messagesNonLus = messages.filter((m: any) => !m.is_read && !m.thread_id && !m.is_seller_reply).length;

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="animate-spin h-10 w-10 border-b-2 border-blue-600 rounded-full" />
    </div>
  );

  const tabCls = (t: string) =>
    `px-4 py-2.5 text-sm font-medium rounded-lg transition ${
      activeTab === t ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
    }`;

  return (
    <div className="min-h-screen bg-gray-50">
      {showPendingBanner && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-3">
          <div className="max-w-5xl mx-auto flex items-center gap-3">
            <Clock size={18} className="text-amber-600 flex-shrink-0" />
            <p className="text-amber-800 text-sm font-medium">
              Annonce soumise — elle sera publiée après validation sous 24h.
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-blue-900 text-white py-8 px-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Mon espace</h1>
            <p className="text-blue-200 text-sm mt-0.5">
              {profile?.company_name || profile?.full_name || profile?.email}
              {profile?.is_verified && (
                <span className="ml-2 inline-flex items-center gap-1 bg-blue-500/30 text-blue-200 text-xs px-2 py-0.5 rounded-full">
                  <BadgeCheck size={11} /> Vérifié
                </span>
              )}
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Link href="/deposer-annonce"
              className="flex items-center gap-1.5 bg-blue-500 hover:bg-blue-400 px-4 py-2 rounded-lg text-sm font-medium transition">
              <Plus size={16} /> Nouvelle annonce
            </Link>
            <Link href="/profil"
              className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-sm transition">
              <User size={16} /> Profil
            </Link>
            <button onClick={signOut}
              className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-sm transition">
              <LogOut size={16} /> Déconnexion
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* ── KPI Cards ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">Annonces actives</span>
              <BarChart2 size={16} className="text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{annoncesActives.length}</p>
            {annoncesPending.length > 0 && (
              <p className="text-xs text-amber-600 mt-1">{annoncesPending.length} en attente</p>
            )}
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">Vues totales</span>
              <Eye size={16} className="text-green-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{totalVues.toLocaleString('fr-FR')}</p>
            {annoncesActives.length > 0 && (
              <p className="text-xs text-gray-400 mt-1">
                ~{Math.round(totalVues / Math.max(annoncesActives.length, 1))} vues/annonce
              </p>
            )}
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">Messages</span>
              <Mail size={16} className="text-violet-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{messages.length}</p>
            {messagesNonLus > 0 && (
              <p className="text-xs text-blue-600 mt-1 font-medium">{messagesNonLus} non lu{messagesNonLus > 1 ? 's' : ''}</p>
            )}
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">Note vendeur</span>
              <TrendingUp size={16} className="text-amber-500" />
            </div>
            {vendeurStats && vendeurStats.nb_notations > 0 ? (
              <>
                <p className="text-3xl font-bold text-gray-900">{vendeurStats.note_moyenne}</p>
                <div className="flex items-center gap-1 mt-1">
                  <StarRating note={parseFloat(vendeurStats.note_moyenne)} size={11} />
                  <span className="text-xs text-gray-400">({vendeurStats.nb_notations} avis)</span>
                </div>
              </>
            ) : (
              <>
                <p className="text-3xl font-bold text-gray-300">—</p>
                <p className="text-xs text-gray-400 mt-1">Aucun avis</p>
              </>
            )}
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="flex gap-1 mb-6 bg-white rounded-xl p-1.5 shadow-sm border border-gray-100 flex-wrap">
          <button className={tabCls('overview')} onClick={() => setActiveTab('overview')}>Vue d'ensemble</button>
          <button className={tabCls('annonces')} onClick={() => setActiveTab('annonces')}>
            Mes annonces {annonces.length > 0 && <span className="ml-1 opacity-70">({annonces.length})</span>}
          </button>
          <button className={tabCls('messages')} onClick={() => setActiveTab('messages')}>
            Messages
            {messagesNonLus > 0 && (
              <span className="ml-1.5 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{messagesNonLus}</span>
            )}
          </button>
          <button className={tabCls('favoris')} onClick={() => setActiveTab('favoris')}>
            Favoris {favoris.length > 0 && <span className="ml-1 opacity-70">({favoris.length})</span>}
          </button>
          <button className={tabCls('alertes')} onClick={() => setActiveTab('alertes')}>
            <span className="flex items-center gap-1.5"><Bell size={13} /> Alertes</span>
          </button>
        </div>

        {/* ── Onglet Vue d'ensemble ── */}
        {activeTab === 'overview' && (
          <div className="space-y-6">

            {/* Annonces récentes */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="p-5 border-b flex items-center justify-between">
                <h2 className="font-semibold text-gray-900">Mes annonces récentes</h2>
                <button onClick={() => setActiveTab('annonces')} className="text-sm text-blue-600 hover:underline">Tout voir</button>
              </div>
              {annonces.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-gray-400 mb-3">Aucune annonce pour le moment</p>
                  <Link href="/deposer-annonce" className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium">
                    <Plus size={16} /> Déposer ma première annonce
                  </Link>
                </div>
              ) : (
                <div className="divide-y">
                  {annonces.slice(0, 3).map(a => {
                    const statusMap: Record<string, { label: string; cls: string }> = {
                      active:   { label: 'Active',     cls: 'bg-green-100 text-green-700' },
                      pending:  { label: 'En attente', cls: 'bg-amber-100 text-amber-700' },
                      rejected: { label: 'Refusée',    cls: 'bg-red-100 text-red-700' },
                      suspended:{ label: 'Suspendue',  cls: 'bg-gray-100 text-gray-600' },
                    };
                    const st = statusMap[a.status] || statusMap.suspended;
                    return (
                      <div key={a.id} className="p-4 flex items-center gap-4">
                        {a.images?.[0] ? (
                          <img src={a.images[0]} alt="" className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                        ) : (
                          <div className="w-14 h-14 rounded-xl bg-gray-100 flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{a.title}</p>
                          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${st.cls}`}>{st.label}</span>
                            {a.price && <span className="text-sm text-blue-600 font-semibold">{Number(a.price).toLocaleString('fr-FR')} €</span>}
                            <span className="text-xs text-gray-400 flex items-center gap-0.5">
                              <Eye size={11} /> {a.views_count || 0}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          {a.status === 'active' && (
                            <Link href={`/annonces/${a.id}`} className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition">
                              <Eye size={16} />
                            </Link>
                          )}
                          <button onClick={() => del(a.id)} className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Détail vues par annonce */}
            {annoncesActives.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Eye size={16} className="text-blue-600" /> Vues par annonce
                </h2>
                <div className="space-y-3">
                  {[...annoncesActives]
                    .sort((a, b) => (b.views_count || 0) - (a.views_count || 0))
                    .map(a => {
                      const maxViews = Math.max(...annoncesActives.map(x => x.views_count || 0), 1);
                      const pct = Math.round(((a.views_count || 0) / maxViews) * 100);
                      return (
                        <div key={a.id}>
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-gray-700 truncate max-w-xs">{a.title}</span>
                            <span className="font-semibold text-gray-900 ml-2 flex-shrink-0">{a.views_count || 0}</span>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* Note vendeur détail */}
            {vendeurStats && vendeurStats.nb_notations > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <TrendingUp size={16} className="text-amber-500" /> Ma réputation vendeur
                </h2>
                <div className="flex items-center gap-8">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-gray-900">{vendeurStats.note_moyenne}</div>
                    <StarRating note={parseFloat(vendeurStats.note_moyenne)} size={16} className="justify-center mt-1" />
                    <p className="text-xs text-gray-400 mt-1">{vendeurStats.nb_notations} avis</p>
                  </div>
                  <div className="flex-1 space-y-1.5">
                    {[5,4,3,2,1].map(n => {
                      const count = vendeurStats[`nb_${n}_etoile${n>1?'s':''}`] || 0;
                      const pct = vendeurStats.nb_notations > 0 ? Math.round((count / vendeurStats.nb_notations) * 100) : 0;
                      return (
                        <div key={n} className="flex items-center gap-2 text-xs">
                          <span className="w-3 text-gray-500">{n}</span>
                          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="w-6 text-gray-400 text-right">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <Link href={`/profil/${profile?.id}`} className="mt-4 text-sm text-blue-600 hover:underline inline-block">
                  Voir mon profil public →
                </Link>
              </div>
            )}
          </div>
        )}

        {/* ── Onglet Mes annonces ── */}
        {activeTab === 'annonces' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y">
            {annonces.length === 0 ? (
              <div className="p-10 text-center">
                <p className="text-gray-400 mb-4">Aucune annonce</p>
                <Link href="/deposer-annonce" className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium">
                  <Plus size={16} /> Déposer une annonce
                </Link>
              </div>
            ) : annonces.map(a => {
              const statusMap: Record<string, { label: string; cls: string }> = {
                active:   { label: 'Active',     cls: 'bg-green-100 text-green-700' },
                pending:  { label: 'En attente', cls: 'bg-amber-100 text-amber-700' },
                rejected: { label: 'Refusée',    cls: 'bg-red-100 text-red-700' },
                suspended:{ label: 'Suspendue',  cls: 'bg-gray-100 text-gray-600' },
              };
              const st = statusMap[a.status] || statusMap.suspended;
              return (
                <div key={a.id} className="p-4 flex items-center gap-4">
                  {a.images?.[0] ? (
                    <img src={a.images[0]} alt="" className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-gray-100 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{a.title}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${st.cls}`}>{st.label}</span>
                      {a.categories?.name && <span className="text-xs text-gray-400">{a.categories.name}</span>}
                      {a.price && <span className="text-sm font-semibold text-blue-600">{Number(a.price).toLocaleString('fr-FR')} €</span>}
                      <span className="text-xs text-gray-400 flex items-center gap-0.5"><Eye size={11} /> {a.views_count || 0} vue{(a.views_count || 0) > 1 ? 's' : ''}</span>
                    </div>
                    <p className="text-xs text-gray-300 mt-0.5">{new Date(a.created_at).toLocaleDateString('fr-FR')}</p>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    {a.status === 'active' && (
                      <Link href={`/annonces/${a.id}`} className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition" title="Voir">
                        <Eye size={16} />
                      </Link>
                    )}
                    <button onClick={() => del(a.id)} className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition" title="Supprimer">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Onglet Messages ── */}
        {activeTab === 'messages' && (
          <div className="flex gap-4" style={{ minHeight: '520px' }}>
            {/* Liste des conversations */}
            <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col ${
              selectedThreadId ? 'hidden lg:flex lg:w-80 flex-shrink-0' : 'flex-1'
            }`}>
              <div className="px-5 py-4 border-b flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Users size={16} className="text-blue-600" />
                  Conversations
                </h3>
                <span className="text-sm text-gray-400">{rootMessages.length}</span>
              </div>

              {rootMessages.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-10 text-center">
                  <Mail size={32} className="text-gray-200 mb-3" />
                  <p className="text-gray-400 text-sm">Aucun message reçu</p>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto divide-y">
                  {rootMessages.map((msg: any) => {
                    const isSelected = selectedThreadId === msg.id;
                    const isUnread = !msg.is_read;
                    return (
                      <button
                        key={msg.id}
                        onClick={() => setSelectedThreadId(msg.id)}
                        className={`w-full text-left px-4 py-3.5 transition flex items-start gap-3 ${
                          isSelected
                            ? 'bg-blue-50 border-l-2 border-l-blue-600'
                            : 'hover:bg-gray-50 border-l-2 border-l-transparent'
                        }`}
                      >
                        {/* Avatar */}
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center flex-shrink-0 text-white text-sm font-bold">
                          {msg.sender_name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className={`text-sm truncate ${isUnread ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                              {msg.sender_name}
                            </span>
                            <span className="text-[10px] text-gray-400 flex-shrink-0">
                              {new Date(msg.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 truncate mt-0.5">{msg.annonces?.title || 'Annonce'}</p>
                          <p className={`text-xs truncate mt-0.5 ${isUnread ? 'text-gray-700 font-medium' : 'text-gray-400'}`}>
                            {msg.content}
                          </p>
                          {isUnread && (
                            <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mt-1" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Thread de conversation */}
            {selectedThreadId ? (
              <div className="flex-1 min-w-0">
                {(() => {
                  const msg = rootMessages.find((m: any) => m.id === selectedThreadId);
                  if (!msg) return null;
                  return (
                    <ConversationThread
                      threadId={selectedThreadId}
                      buyerName={msg.sender_name}
                      buyerEmail={msg.sender_email}
                      annonceTitle={msg.annonces?.title || 'Annonce'}
                      annonceId={msg.annonce_id}
                      onClose={() => setSelectedThreadId(null)}
                      onReplySent={loadMessages}
                    />
                  );
                })()}
                {/* Bouton supprimer en bas du thread */}
                <div className="mt-3 flex justify-end">
                  <button
                    onClick={() => {
                      const msg = rootMessages.find((m: any) => m.id === selectedThreadId);
                      if (msg) deleteMessage(msg.id);
                    }}
                    className="text-xs text-red-500 hover:text-red-700 hover:underline"
                  >
                    Supprimer cette conversation
                  </button>
                </div>
              </div>
            ) : (
              rootMessages.length > 0 && (
                <div className="hidden lg:flex flex-1 items-center justify-center text-gray-300 bg-white rounded-2xl border border-gray-100">
                  <div className="text-center">
                    <MessageSquare size={40} className="mx-auto mb-3 opacity-30" />
                    <p className="text-sm">Sélectionnez une conversation</p>
                  </div>
                </div>
              )
            )}
          </div>
        )}

        {/* ── Onglet Favoris ── */}
        {activeTab === 'favoris' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y">
            {favoris.length === 0 ? (
              <div className="p-10 text-center">
                <Heart size={32} className="mx-auto text-gray-200 mb-3" />
                <p className="text-gray-400 mb-3">Aucun favori</p>
                <Link href="/annonces" className="text-blue-600 hover:underline text-sm">Parcourir les annonces</Link>
              </div>
            ) : favoris.map((f: any) => f.annonces && (
              <Link key={f.id} href={`/annonces/${f.annonce_id}`} className="p-4 flex items-center gap-4 hover:bg-gray-50 transition">
                {f.annonces.images?.[0] ? (
                  <img src={f.annonces.images[0]} alt="" className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-gray-100 flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{f.annonces.title}</p>
                  {f.annonces.price && <p className="text-blue-600 font-semibold text-sm">{Number(f.annonces.price).toLocaleString('fr-FR')} €</p>}
                </div>
                <Eye size={16} className="text-gray-400 flex-shrink-0" />
              </Link>
            ))}
          </div>
        )}

        {/* ── Onglet Alertes ── */}
        {activeTab === 'alertes' && (
          <div className="space-y-5">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-start gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <Bell size={18} className="text-blue-600" />
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900">Alertes email par catégorie</h2>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Recevez un email dès qu'une nouvelle annonce est publiée dans les catégories sélectionnées.
                  </p>
                </div>
              </div>
              <AlertesCategoriesToggle categories={categories} />
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 text-sm text-blue-700">
              <p className="font-medium mb-1">Comment ça marche ?</p>
              <ul className="space-y-1 text-blue-600 list-disc list-inside">
                <li>Activez une catégorie pour être alerté dès qu'une annonce y est publiée</li>
                <li>Un email vous est envoyé avec les détails de l'annonce</li>
                <li>Désactivez à tout moment en cliquant à nouveau sur la catégorie</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20"><div className="animate-spin h-10 w-10 border-b-2 border-blue-600 rounded-full" /></div>}>
      <DashboardPageInner />
    </Suspense>
  );
}
