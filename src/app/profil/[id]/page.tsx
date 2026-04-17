'use client';
import { useState, useEffect, Suspense } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import AnnonceCard from '@/components/AnnonceCard';
import { BadgeCheck, MapPin, Building, ArrowLeft, Package } from 'lucide-react';

function ProfilVendeurInner() {
  const params = useParams();
  const [profile, setProfile] = useState<any>(null);
  const [annonces, setAnnonces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const supabase = createClient();

  useEffect(() => {
    if (params.id) {
      fetchProfile(params.id as string);
      fetchAnnonces(params.id as string);
      loadFavorites();
    }
  }, [params.id]);

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

  const loadFavorites = async () => {
    try {
      const res = await fetch('/api/favoris');
      if (res.ok) {
        const data = await res.json();
        setFavoriteIds(data.favoriteIds || []);
      }
    } catch {}
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin h-10 w-10 border-b-2 border-blue-600 rounded-full" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Vendeur introuvable</p>
        <Link href="/annonces" className="mt-4 inline-block bg-blue-600 text-white px-6 py-2 rounded-lg">
          Voir les annonces
        </Link>
      </div>
    );
  }

  const memberSince = new Date(profile.created_at).toLocaleDateString('fr-FR', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header profil */}
      <div className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <Link href="/annonces" className="flex items-center gap-2 text-gray-500 hover:text-blue-600 mb-6 text-sm">
            <ArrowLeft size={16} /> Retour aux annonces
          </Link>

          <div className="flex items-start gap-6">
            {/* Avatar initiales */}
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
                    <BadgeCheck size={16} />
                    Compte vérifié
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500">
                {profile.company_name && profile.full_name && (
                  <span className="flex items-center gap-1">
                    <Building size={14} />
                    {profile.full_name}
                  </span>
                )}
                {profile.city && (
                  <span className="flex items-center gap-1">
                    <MapPin size={14} />
                    {profile.city}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Package size={14} />
                  {annonces.length} annonce{annonces.length > 1 ? 's' : ''} active{annonces.length > 1 ? 's' : ''}
                </span>
                <span>Membre depuis {memberSince}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Annonces du vendeur */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Annonces de {profile.company_name || profile.full_name}
        </h2>

        {annonces.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm">
            <Package size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">Ce vendeur n'a pas d'annonces actives pour le moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {annonces.map((a) => (
              <AnnonceCard
                key={a.id}
                annonce={a}
                isFavorite={favoriteIds.includes(a.id)}
                onFavoriteToggle={loadFavorites}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProfilVendeurPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center py-20">
        <div className="animate-spin h-10 w-10 border-b-2 border-blue-600 rounded-full" />
      </div>
    }>
      <ProfilVendeurInner />
    </Suspense>
  );
}
