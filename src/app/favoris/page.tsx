'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import AnnonceCard from '@/components/AnnonceCard';
import Link from 'next/link';
import { Heart, ArrowLeft, LogIn } from 'lucide-react';

const LS_KEY = 'roullepro_favoris';

function getLSFavoris(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || '[]');
  } catch {
    return [];
  }
}

function removeLSFavori(id: string) {
  const current = getLSFavoris();
  localStorage.setItem(LS_KEY, JSON.stringify(current.filter((f) => f !== id)));
}

export default function FavorisPage() {
  const [favoris, setFavoris] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setIsConnected(true);
      await loadFavorisConnecte(user.id);
    } else {
      setIsConnected(false);
      await loadFavorisLocalStorage();
    }
  };

  // --- Utilisateur connecte : favoris depuis Supabase ---
  const loadFavorisConnecte = async (userId: string) => {
    setLoading(true);
    try {
      const { data: favorisData, error } = await supabase
        .from('favoris')
        .select(`
          id,
          created_at,
          annonce_id,
          annonces (
            id,
            title,
            price,
            images,
            city,
            annee,
            categories(name),
            status
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur chargement favoris:', error);
        setFavoris([]);
      } else {
        const valid = (favorisData || []).filter(
          (f) => f.annonces && (f.annonces as any).status === 'active'
        );
        setFavoris(valid.map((f) => f.annonces));
      }
    } catch (error) {
      console.error('Erreur:', error);
      setFavoris([]);
    } finally {
      setLoading(false);
    }
  };

  // --- Visiteur non connecte : favoris depuis localStorage ---
  const loadFavorisLocalStorage = async () => {
    setLoading(true);
    try {
      const ids = getLSFavoris();
      if (ids.length === 0) {
        setFavoris([]);
        setLoading(false);
        return;
      }
      // Charger les donnees des annonces via Supabase public (sans auth)
      const { data, error } = await supabase
        .from('annonces')
        .select('id, title, price, images, city, annee, categories(name), status')
        .in('id', ids)
        .eq('status', 'active');

      if (error) {
        console.error('Erreur chargement annonces localStorage favoris:', error);
        setFavoris([]);
      } else {
        // Conserver l'ordre des favoris (plus recent en premier)
        const ordered = ids
          .map((id) => (data || []).find((a) => a.id === id))
          .filter(Boolean);
        setFavoris(ordered);
      }
    } catch (err) {
      console.error('Erreur localStorage favoris:', err);
      setFavoris([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFavoriteToggle = async (annonceId: string, isFavorite: boolean) => {
    if (!isFavorite) {
      // Retire de la liste affichee
      setFavoris((prev) => prev.filter((a: any) => a.id !== annonceId));
      if (!isConnected) {
        removeLSFavori(annonceId);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-b-2 border-blue-600 rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-600 text-white py-10 px-4">
        <div className="max-w-7xl mx-auto">
          <Link
            href="/annonces"
            className="inline-flex items-center gap-2 text-blue-100 hover:text-white mb-4 transition"
          >
            <ArrowLeft size={20} />
            Retour aux annonces
          </Link>
          <div className="flex items-center gap-3">
            <Heart size={32} fill="currentColor" />
            <div>
              <h1 className="text-3xl font-bold">Mes Favoris</h1>
              <p className="text-blue-100">
                {favoris.length} annonce{favoris.length !== 1 ? 's' : ''} dans vos favoris
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Banniere visiteur non connecte */}
        {!isConnected && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-blue-800">
                Vos favoris sont sauvegardes sur cet appareil
              </p>
              <p className="text-xs text-blue-600 mt-0.5">
                Connectez-vous pour les retrouver sur tous vos appareils et ne jamais les perdre.
              </p>
            </div>
            <Link
              href="/auth"
              className="flex-shrink-0 inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
            >
              <LogIn size={16} />
              Se connecter
            </Link>
          </div>
        )}

        {favoris.length === 0 ? (
          <div className="text-center py-20">
            <Heart size={64} className="mx-auto text-gray-300 mb-4" />
            <h2 className="text-2xl font-bold text-gray-700 mb-2">
              Aucun favori pour le moment
            </h2>
            <p className="text-gray-500 mb-6">
              Cliquez sur le coeur sur une annonce pour la retrouver ici facilement.
            </p>
            <Link
              href="/annonces"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
            >
              Parcourir les annonces
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {favoris.map((annonce: any) => (
              <AnnonceCard
                key={annonce.id}
                annonce={annonce}
                isFavorite={true}
                onFavoriteToggle={handleFavoriteToggle}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
