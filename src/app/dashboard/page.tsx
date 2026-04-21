'use client';
import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import StarRating from '@/components/StarRating';
import AlertesCategoriesToggle from '@/components/AlertesCategoriesToggle';
import ConversationThread from '@/components/ConversationThread';
import PlanBadge from '@/components/PlanBadge';
import {
  Plus, Trash2, Eye, LogOut, User, Heart, MessageSquare,
  Clock, TrendingUp, Bell, BadgeCheck, BarChart2, Mail, Users,
  CheckCircle, Pencil, X, Package, ArrowRight,
} from 'lucide-react';
import DepotStatusBadge from '@/components/depot/DepotStatusBadge';

type Category = { id: string; name: string; slug: string };

function DashboardPageInner() {
  const router = useRouter();
  const supabase = createClient();
  const [profile, setProfile] = useState<any>(null);
  const [annonces, setAnnonces] = useState<any[]>([]);
  const [favoris, setFavoris] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]); // liste unifiée enrichie
  const [categories, setCategories] = useState<Category[]>([]);
  const [vendeurStats, setVendeurStats] = useState<any>(null);
  const [depots, setDepots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview'|'annonces'|'depots'|'messages'|'favoris'|'alertes'>('overview');
  const [showOnboarding, setShowOnboarding] = useState(false);

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

  // Realtime : re-fetch messages/favoris à chaque changement Supabase
  // Remplace le polling 5s — seule la notification arrive en push, le fetch reste léger
  useEffect(() => {
    let userId: string | null = null;

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      userId = user.id;

      const channel = supabase
        .channel('dashboard-realtime')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'messages' },
          () => { loadMessages(); }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'favoris', filter: `user_id=eq.${userId}` },
          () => { loadFavoris(); }
        )
        .subscribe();

      return () => { supabase.removeChannel(channel); };
    });

    // Rafraîchir quand l'onglet redevient visible
    const onVisibility = () => { if (!document.hidden) { loadFavoris(); loadMessages(); } };
    document.addEventListener('visibilitychange', onVisibility);
    return () => { document.removeEventListener('visibilitychange', onVisibility); };
  }, [loadFavoris, loadMessages, supabase]);

  const init = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push('/auth/login'); return; }

    const [{ data: p }, { data: a }, { data: cats }, { data: dps }] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('annonces').select('*, categories(name, slug)').eq('user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('categories').select('id, name, slug').order('sort_order'),
      supabase
        .from('depots')
        .select('id, statut, marque, modele, annee, kilometrage, prix_affiche, prix_final_vente, created_at, date_vente, garages_partenaires(ville)')
        .eq('vendeur_id', user.id)
        .order('created_at', { ascending: false }),
    ]);

    setProfile(p);
    setAnnonces(a || []);
    setCategories(cats || []);
    setDepots(dps || []);

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

    // Bannière onboarding : nouveau compte (< 7j) sans annonce
    const isNew = p && new Date(p.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    setShowOnboarding(!!(isNew && (a || []).length === 0));

    setLoading(false);
  };

  const del = async (id: string) => {
    if (!confirm('Supprimer cette annonce ?')) return;
    await supabase.from('annonces').delete().eq('id', id);
    setAnnonces(prev => prev.filter(a => a.id !== id));
  };

  const fetchAnnonces = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from('annonces').select('*, categories(name, slug)').eq('user_id', user.id).order('created_at', { ascending: false });
    setAnnonces(data || []);
  };

  const markAsSold = async (id: string) => {
    if (!confirm('Marquer cette annonce comme vendue ?')) return;
    await supabase.from('annonces').update({ status: 'sold' }).eq('id', id).eq('user_id', profile.id);
    fetchAnnonces();
  };

  const renew = async (id: string) => {
    if (!confirm('Renouveler cette annonce pour 60 jours ?')) return;
    // Remet active + reset created_at pour repartir d'un nouveau cycle de 60 jours
    await supabase
      .from('annonces')
      .update({ status: 'active', created_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', profile.id);
    fetchAnnonces();
  };
  const signOut = async () => { await supabase.auth.signOut(); router.push('/'); };

  const openBillingPortal = async () => {
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else alert(data.error || "Impossible d'ouvrir le portail de facturation");
    } catch {
      alert('Erreur. Réessayez.');
    }
  };

  const deleteMessage = async (id: string) => {
    if (!confirm('Supprimer cette conversation ?')) return;
    await fetch(`/api/messages/${id}`, { method: 'DELETE' });
    setMessages(prev => prev.filter((m: any) => m.id !== id));
    if (selectedThreadId === id) setSelectedThreadId(null);
  };

  const searchParams = useSearchParams();
  const showPendingBanner = searchParams.get('annonce') === 'pending';

  // Agrégats
  const totalVues = annonces.reduce((s, a) => s + (a.views_count || 0), 0);
  const annoncesActives = annonces.filter(a => a.status === 'active');
  const annoncesPending = annonces.filter(a => a.status === 'pending');
  // has_unread est calculé côté API, on fait confiance à cette valeur
  const messagesNonLus = messages.filter((m: any) => m.has_unread).length;

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
              {(profile?.plan === 'pro' || profile?.plan === 'premium') && (
                <span className="ml-2 inline-block"><PlanBadge plan={profile.plan} size="sm" /></span>
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
            {profile?.stripe_customer_id ? (
              <button onClick={openBillingPortal}
                className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-sm transition">
                <TrendingUp size={16} /> Mon abonnement
              </button>
            ) : (
              <Link href="/pricing"
                className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-sm transition">
                <TrendingUp size={16} /> Passer Pro
              </Link>
            )}
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
              <p className="text-xs text-red-600 mt-1 font-medium">{messagesNonLus} non lu{messagesNonLus > 1 ? 's' : ''}</p>
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
            <span className="flex items-center gap-1.5">
              Messages
              {messagesNonLus > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{messagesNonLus}</span>
              )}
            </span>
          </button>
          <button className={tabCls('favoris')} onClick={() => setActiveTab('favoris')}>
            Favoris {favoris.length > 0 && <span className="ml-1 opacity-70">({favoris.length})</span>}
          </button>
          <button className={tabCls('depots')} onClick={() => setActiveTab('depots')}>
            <span className="flex items-center gap-1.5">
              <Package size={13} /> Dépôts-vente
              {depots.length > 0 && <span className="ml-1 opacity-70">({depots.length})</span>}
            </span>
          </button>
          <button className={tabCls('alertes')} onClick={() => setActiveTab('alertes')}>
            <span className="flex items-center gap-1.5"><Bell size={13} /> Alertes</span>
          </button>
        </div>

        {/* ── Onglet Vue d'ensemble ── */}
        {activeTab === 'overview' && (
          <div className="space-y-6">

            {/* Bannière onboarding */}
            {showOnboarding && (
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white mb-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-bold mb-1">Bienvenue sur RoullePro !</h2>
                    <p className="text-blue-100 text-sm mb-4">Voici vos premières étapes pour bien démarrer :</p>
                    <div className="space-y-2">
                      {[
                        { done: !!profile?.full_name, label: 'Compléter votre profil professionnel' },
                        { done: annonces.length > 0, label: 'Déposer votre première annonce' },
                        { done: false, label: 'Activer les alertes pour être notifié des nouvelles annonces' },
                      ].map((step, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm">
                          {step.done
                            ? <CheckCircle size={16} className="text-green-300 flex-shrink-0" />
                            : <div className="w-4 h-4 rounded-full border-2 border-blue-300 flex-shrink-0" />}
                          <span className={step.done ? 'line-through text-blue-200' : 'text-white'}>{step.label}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-3 mt-5">
                      <Link href="/deposer-annonce" className="bg-white text-blue-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-50 transition">
                        Déposer une annonce
                      </Link>
                      <Link href="/profil" className="border border-blue-400 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition">
                        Compléter mon profil
                      </Link>
                    </div>
                  </div>
                  <button onClick={() => setShowOnboarding(false)} className="text-blue-200 hover:text-white ml-4 flex-shrink-0">
                    <X size={20} />
                  </button>
                </div>
              </div>
            )}

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

            {/* Synthèse Dépôts-vente */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="p-5 border-b flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package size={16} className="text-blue-600" />
                  <h2 className="font-semibold text-gray-900">Mes dépôts-vente</h2>
                  {depots.length > 0 && (
                    <span className="text-xs text-gray-400">({depots.length})</span>
                  )}
                </div>
                {depots.length > 0 ? (
                  <button onClick={() => setActiveTab('depots')} className="text-sm text-blue-600 hover:underline">
                    Tout voir
                  </button>
                ) : (
                  <Link href="/depot-vente" className="text-sm text-blue-600 hover:underline">
                    Découvrir
                  </Link>
                )}
              </div>
              {depots.length === 0 ? (
                <div className="p-6 text-center">
                  <p className="text-sm text-gray-500 mb-2">
                    Vous n'avez pas encore confié de véhicule en dépôt-vente.
                  </p>
                  <p className="text-xs text-gray-400 mb-3">
                    Confiez votre véhicule à un partenaire RoullePro et touchez jusqu'à 88% du prix de vente.
                  </p>
                  <Link
                    href="/depot-vente/estimer"
                    className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-500 transition"
                  >
                    <Plus size={14} /> Estimer mon véhicule
                  </Link>
                </div>
              ) : (
                <div className="divide-y">
                  {depots.slice(0, 3).map((d: any) => {
                    const garage = d.garages_partenaires as { ville?: string } | null;
                    const prix = d.statut === 'vendu' && d.prix_final_vente
                      ? Number(d.prix_final_vente)
                      : d.prix_affiche
                      ? Number(d.prix_affiche)
                      : null;
                    return (
                      <Link
                        key={d.id}
                        href={`/dashboard/depots/${d.id}`}
                        className="p-4 flex items-center gap-4 hover:bg-gray-50 transition"
                      >
                        <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                          <Package size={18} className="text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate text-sm">
                            {[d.marque, d.modele].filter(Boolean).join(' ') || 'Véhicule'}
                            {d.annee ? ` (${d.annee})` : ''}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                            <DepotStatusBadge statut={d.statut} />
                            {prix != null && (
                              <span className="text-sm text-blue-600 font-semibold">
                                {prix.toLocaleString('fr-FR')} €
                              </span>
                            )}
                            {garage?.ville && (
                              <span className="text-xs text-gray-400">Partenaire — {garage.ville}</span>
                            )}
                          </div>
                        </div>
                        <ArrowRight size={14} className="text-gray-400 flex-shrink-0" />
                      </Link>
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
                sold:     { label: 'Vendue',     cls: 'bg-purple-100 text-purple-700' },
                expired:  { label: 'Expirée',    cls: 'bg-orange-100 text-orange-700' },
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
                    {(a.status === 'active' || a.status === 'pending' || a.status === 'rejected') && (
                      <Link href={`/dashboard/annonces/${a.id}/edit`} className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition" title="Modifier">
                        <Pencil size={16} />
                      </Link>
                    )}
                    {(a.status === 'active' || a.status === 'pending') && (
                      <button
                        onClick={() => markAsSold(a.id)}
                        className="p-2 text-gray-400 hover:text-green-600 rounded-lg hover:bg-green-50 transition"
                        title="Marquer comme vendu"
                      >
                        <CheckCircle size={16} />
                      </button>
                    )}
                    {a.status === 'expired' && (
                      <button
                        onClick={() => renew(a.id)}
                        className="px-3 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        title="Renouveler pour 60 jours"
                      >
                        Renouveler
                      </button>
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
          <div className="flex gap-4" style={{ minHeight: '560px' }}>

            {/* Colonne gauche : liste de toutes les conversations */}
            <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col ${
              selectedThreadId ? 'hidden lg:flex lg:w-80 flex-shrink-0' : 'flex-1'
            }`}>
              <div className="px-5 py-4 border-b flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Users size={16} className="text-blue-600" />
                  Conversations
                </h3>
                <span className="text-sm text-gray-400">{messages.length}</span>
              </div>

              {messages.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-10 text-center">
                  <Mail size={32} className="text-gray-200 mb-3" />
                  <p className="text-gray-400 text-sm">Aucune conversation</p>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto divide-y">
                  {messages.map((msg: any) => {
                    const isSelected = selectedThreadId === msg.id;
                    const isBuyer = msg.role === 'buyer';
                    // Interlocuteur : vendeur si acheteur, acheteur si vendeur
                    const displayName = isBuyer
                      ? (msg.annonces?.profiles?.company_name || msg.annonces?.profiles?.full_name || 'Vendeur')
                      : msg.sender_name;
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
                        <div className="relative flex-shrink-0">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-sm font-bold">
                            {displayName?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          {msg.has_unread && !isSelected && (
                            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className={`text-sm truncate ${
                              msg.has_unread && !isSelected ? 'font-bold text-gray-900' : 'font-medium text-gray-700'
                            }`}>
                              {displayName}
                            </span>
                            <span className="text-[10px] text-gray-400 flex-shrink-0">
                              {new Date(msg.last_message_at || msg.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 truncate mt-0.5">
                            {msg.annonces?.title || 'Annonce'}
                          </p>
                          <p className={`text-xs truncate mt-0.5 ${
                            msg.has_unread && !isSelected ? 'text-gray-700 font-medium' : 'text-gray-400'
                          }`}>
                            {msg.last_message || msg.content}
                          </p>
                          {/* Pill rôle */}
                          <span className={`inline-block mt-1 text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                            isBuyer ? 'bg-purple-50 text-purple-600' : 'bg-green-50 text-green-600'
                          }`}>
                            {isBuyer ? 'Envoyé' : 'Reçu'}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Colonne droite : thread */}
            {selectedThreadId ? (
              <div className="flex-1 min-w-0 flex flex-col gap-3">
                {(() => {
                  const msg = messages.find((m: any) => m.id === selectedThreadId);
                  if (!msg) return null;
                  const isBuyer = msg.role === 'buyer';
                  const displayName = isBuyer
                    ? (msg.annonces?.profiles?.company_name || msg.annonces?.profiles?.full_name || 'Vendeur')
                    : msg.sender_name;
                  const displayEmail = isBuyer
                    ? (msg.annonces?.profiles?.email || '')
                    : msg.sender_email;
                  return (
                    <>
                      <ConversationThread
                        threadId={selectedThreadId}
                        buyerName={displayName}
                        buyerEmail={displayEmail}
                        annonceTitle={msg.annonces?.title || 'Annonce'}
                        annonceId={msg.annonce_id}
                        isBuyerView={isBuyer}
                        onClose={() => setSelectedThreadId(null)}
                        onReplySent={loadMessages}
                      />
                      <div className="flex justify-end">
                        <button
                          onClick={() => deleteMessage(msg.id)}
                          className="text-xs text-red-400 hover:text-red-600 hover:underline"
                        >
                          Supprimer cette conversation
                        </button>
                      </div>
                    </>
                  );
                })()}
              </div>
            ) : (
              messages.length > 0 && (
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

        {/* ── Onglet Dépôts-vente ── */}
        {activeTab === 'depots' && (
          <div className="space-y-5">
            {/* Stats dépôts */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {(() => {
                const enVente = depots.filter((d: any) => ['en_vente', 'offre_en_cours'].includes(d.statut)).length;
                const vendus = depots.filter((d: any) => d.statut === 'vendu').length;
                const caGenere = depots
                  .filter((d: any) => d.statut === 'vendu' && d.prix_final_vente)
                  .reduce((s: number, d: any) => s + (Number(d.prix_final_vente) || 0), 0);
                const netVendeur = Math.round(caGenere * 0.88);
                return [
                  { label: 'Total dépôts', value: depots.length },
                  { label: 'En vente', value: enVente },
                  { label: 'Vendus', value: vendus },
                  {
                    label: 'Vous avez touché',
                    value: netVendeur > 0
                      ? `${netVendeur.toLocaleString('fr-FR')} €`
                      : '—',
                  },
                ].map((s) => (
                  <div key={s.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
                    <div className="text-2xl font-extrabold text-gray-900">{s.value}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
                  </div>
                ));
              })()}
            </div>

            {/* Liste dépôts */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="p-5 border-b flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-gray-900">Mes dépôts-vente</h2>
                  <p className="text-xs text-gray-500 mt-0.5">Suivez l'avancement de la vente de vos véhicules confiés à un partenaire RoullePro</p>
                </div>
                <Link
                  href="/depot-vente/estimer"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold px-4 py-2 rounded-lg transition text-sm"
                >
                  <Plus size={14} /> Nouveau dépôt
                </Link>
              </div>

              {depots.length === 0 ? (
                <div className="p-10 text-center">
                  <Package size={36} className="mx-auto text-gray-200 mb-3" />
                  <p className="text-gray-500 mb-1 font-medium">Aucun dépôt-vente pour le moment</p>
                  <p className="text-gray-400 text-sm mb-4">
                    Confiez votre véhicule à un partenaire RoullePro et touchez jusqu'à 88% du prix de vente.
                  </p>
                  <Link
                    href="/depot-vente"
                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold text-sm"
                  >
                    Découvrir le dépôt-vente <ArrowRight size={14} />
                  </Link>
                </div>
              ) : (
                <div className="divide-y">
                  {depots.map((d: any) => {
                    const garage = d.garages_partenaires as { ville?: string } | null;
                    const prix = d.statut === 'vendu' && d.prix_final_vente
                      ? Number(d.prix_final_vente)
                      : d.prix_affiche
                      ? Number(d.prix_affiche)
                      : null;
                    return (
                      <Link
                        key={d.id}
                        href={`/dashboard/depots/${d.id}`}
                        className="p-4 flex items-center gap-4 hover:bg-gray-50 transition"
                      >
                        <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                          <Package size={20} className="text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">
                            {[d.marque, d.modele].filter(Boolean).join(' ') || 'Véhicule'}
                            {d.annee ? ` (${d.annee})` : ''}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                            <DepotStatusBadge statut={d.statut} />
                            {prix != null && (
                              <span className="text-sm text-blue-600 font-semibold">
                                {prix.toLocaleString('fr-FR')} €
                              </span>
                            )}
                            {garage?.ville && (
                              <span className="text-xs text-gray-400">Partenaire — {garage.ville}</span>
                            )}
                          </div>
                        </div>
                        <ArrowRight size={16} className="text-gray-400 flex-shrink-0" />
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Bloc pédagogique */}
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 text-sm text-blue-700">
              <p className="font-medium mb-1">Comment fonctionne le dépôt-vente RoullePro ?</p>
              <ul className="space-y-1 text-blue-600 list-disc list-inside">
                <li>Vous confiez votre véhicule à un partenaire RoullePro certifié</li>
                <li>Le partenaire réalise l'expertise, les photos HD et gère la vente</li>
                <li>Vous recevez 88% du prix de vente net (mandat 90 jours, reprise garantie si non vendu)</li>
              </ul>
            </div>
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
