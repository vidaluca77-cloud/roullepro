'use client';
import { useState, useEffect, Suspense } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import AnnonceCard from '@/components/AnnonceCard';
import StarRating from '@/components/StarRating';
import NotationModal from '@/components/NotationModal';
import { BadgeCheck, MapPin, Building, ArrowLeft, Package, Star, MessageSquare, PenLine } from 'lucide-react';

function ProfilVendeurInner() {
  const params = useParams();
  const [profile, setProfile] = useState<any>(null);
  const [annonces, setAnnonces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [notationsData, setNotationsData] = useState<any>(null);
  const [showNotationModal, setShowNotationModal] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    if (params.id) {
      fetchProfile(params.id as string);
      fetchAnnonces(params.id as string);
      fetchNotations(params.id as string);
      loadFavorites();
      loadCurrentUser();
    }
  }, [params.id]);

  const loadCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUserId(user?.id || null);
  };

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('full_name, company_name, city, is_verified, statut_verification, created_at')
      .eq('id', userId)
      .single();
    if (data) setProfile(data);
    setLoading(false);
  };

  const fetchAnnonces = async (userId: string) => {
    const { data } = await supabase
      .from('annonces')
      .select('*, categories(id, name, slug)')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false });
    setAnnonces(data || []);
  };

  const fetchNotations = async (userId: string) => {
    try {
      const res = await fetch(`/api/notations?vendeur_id=${userId}`);
      if (res.ok) setNotationsData(await res.json());
    } catch {}
  };

  const loadFavorites = async () => {
    try {
      const res = await fetch('/api/favoris');
      if (res.ok) {
        const data = await res.json();
        setFavoriteIds(data.favoriteIds || []);
      }
    } catch {}
  };

  const handleNotationSuccess = () => fetchNotations(params.id as string);

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="animate-spin h-10 w-10 border-b-2 border-blue-600 rounded-full" />
    </div>
  );

  if (!profile) return (
    <div className="text-center py-20">
      <p className="text-gray-500">Vendeur introuvable</p>
      <Link href="/annonces" className="mt-4 inline-block bg-blue-600 text-white px-6 py-2 rounded-lg">
        Voir les annonces
      </Link>
    </div>
  );

  const memberSince = new Date(profile.created_at).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  const stats = notationsData?.stats;
  const notations = notationsData?.notations || [];
  const maNotation = notationsData?.maNotation;
  const isOwn = currentUserId === params.id;
  const canRate = currentUserId && !isOwn;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <Link href="/annonces" className="flex items-center gap-2 text-gray-500 hover:text-blue-600 mb-6 text-sm">
            <ArrowLeft size={16} /> Retour aux annonces
          </Link>

          <div className="flex items-start gap-6">
            <div className="w-20 h-20 rounded-2xl bg-blue-600 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
              {(profile.company_name || profile.full_name || '?')[0].toUpperCase()}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold text-gray-900">
                  {profile.company_name || profile.full_name || 'Vendeur professionnel'}
                </h1>
                {profile.is_verified && (
                  <span className="flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                    <BadgeCheck size={16} /> Compte vérifié
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500">
                {profile.company_name && profile.full_name && (
                  <span className="flex items-center gap-1"><Building size={14} />{profile.full_name}</span>
                )}
                {profile.city && (
                  <span className="flex items-center gap-1"><MapPin size={14} />{profile.city}</span>
                )}
                <span className="flex items-center gap-1">
                  <Package size={14} /> {annonces.length} annonce{annonces.length > 1 ? 's' : ''} active{annonces.length > 1 ? 's' : ''}
                </span>
                <span>Membre depuis {memberSince}</span>
              </div>

              {/* Note moyenne */}
              {stats && stats.nb_notations > 0 ? (
                <div className="flex items-center gap-3 mt-3">
                  <StarRating note={parseFloat(stats.note_moyenne)} size={18} />
                  <span className="font-semibold text-gray-900">{stats.note_moyenne}</span>
                  <span className="text-sm text-gray-500">({stats.nb_notations} avis)</span>
                </div>
              ) : (
                <p className="text-sm text-gray-400 mt-2 flex items-center gap-1.5">
                  <Star size={14} /> Aucun avis pour le moment
                </p>
              )}

              {/* Bouton laisser un avis */}
              {canRate && (
                <button
                  onClick={() => setShowNotationModal(true)}
                  className="mt-3 flex items-center gap-2 px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-lg text-sm font-medium transition"
                >
                  {maNotation ? <PenLine size={14} /> : <Star size={14} />}
                  {maNotation ? 'Modifier mon avis' : 'Laisser un avis'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-10">

        {/* Annonces */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Annonces de {profile.company_name || profile.full_name}
          </h2>
          {annonces.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl shadow-sm">
              <Package size={40} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">Ce vendeur n'a pas d'annonces actives.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {annonces.map((a) => (
                <AnnonceCard key={a.id} annonce={a} isFavorite={favoriteIds.includes(a.id)} onFavoriteToggle={loadFavorites} />
              ))}
            </div>
          )}
        </div>

        {/* Avis */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <MessageSquare size={18} className="text-blue-600" />
              Avis clients
              {stats?.nb_notations > 0 && (
                <span className="text-sm font-normal text-gray-400">({stats.nb_notations})</span>
              )}
            </h2>
          </div>

          {/* Répartition étoiles */}
          {stats && stats.nb_notations > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-5">
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="text-5xl font-bold text-gray-900">{stats.note_moyenne}</div>
                  <StarRating note={parseFloat(stats.note_moyenne)} size={16} className="justify-center mt-1" />
                  <p className="text-xs text-gray-400 mt-1">{stats.nb_notations} avis</p>
                </div>
                <div className="flex-1 space-y-1.5">
                  {[5,4,3,2,1].map(n => {
                    const count = stats[`nb_${n}_etoile${n>1?'s':''}`] || 0;
                    const pct = stats.nb_notations > 0 ? Math.round((count / stats.nb_notations) * 100) : 0;
                    return (
                      <div key={n} className="flex items-center gap-2 text-xs">
                        <span className="w-4 text-gray-500 text-right">{n}</span>
                        <Star size={11} className="text-amber-400 fill-amber-400 flex-shrink-0" />
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="w-8 text-gray-400 text-right">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Liste avis */}
          {notations.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
              <Star size={32} className="mx-auto text-gray-200 mb-3" />
              <p className="text-gray-400 text-sm">Aucun avis pour le moment.</p>
              {canRate && (
                <button
                  onClick={() => setShowNotationModal(true)}
                  className="mt-4 px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                >
                  Soyez le premier à laisser un avis
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {notations.map((n: any) => {
                const auteur = (n.profiles as any)?.company_name || (n.profiles as any)?.full_name || 'Professionnel vérifié';
                return (
                  <div key={n.id} className="bg-white rounded-2xl border border-gray-100 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-gray-900 text-sm">{auteur}</span>
                          {n.acheteur_id === currentUserId && (
                            <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">Votre avis</span>
                          )}
                        </div>
                        <StarRating note={n.note} size={14} />
                        {n.commentaire && (
                          <p className="text-sm text-gray-600 mt-2 leading-relaxed">{n.commentaire}</p>
                        )}
                      </div>
                      <span className="text-xs text-gray-400 flex-shrink-0">
                        {new Date(n.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal notation */}
      {showNotationModal && (
        <NotationModal
          vendeurId={params.id as string}
          vendeurNom={profile.company_name || profile.full_name || 'ce vendeur'}
          notationExistante={maNotation}
          onClose={() => setShowNotationModal(false)}
          onSuccess={handleNotationSuccess}
        />
      )}
    </div>
  );
}

export default function ProfilVendeurPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20"><div className="animate-spin h-10 w-10 border-b-2 border-blue-600 rounded-full" /></div>}>
      <ProfilVendeurInner />
    </Suspense>
  );
}
