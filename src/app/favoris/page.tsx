'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import AnnonceCard from '@/components/AnnonceCard';
import Link from 'next/link';
import { Heart, ArrowLeft } from 'lucide-react';

export default function FavorisPage() {
  const [favoris, setFavoris] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    checkAuthAndLoadFavoris();
  }, []);

  const checkAuthAndLoadFavoris = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      // Rediriger vers la page de connexion si non authentifié
      window.location.href = '/auth';
      return;
    }
    
    setUser(user);
    await loadFavoris(user.id);
  };

  const loadFavoris = async (userId: string) => {
    setLoading(true);
    
    try {
      // Récupérer les favoris de l'utilisateur avec les données des annonces
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
            photos,
            ville,
            annee,
            categorie,
            statut
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur chargement favoris:', error);
        setFavoris([]);
      } else {
        // Filtrer les favoris avec annonces valides et actives
        const validFavoris = (favorisData || []).filter(
          (f) => f.annonces && (f.annonces as any).statut === 'active'
        );
        setFavoris(validFavoris);
      }
    } catch (error) {
      console.error('Erreur:', error);
      setFavoris([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFavoriteToggle = async (annonceId: string, isFavorite: boolean) => {
    if (!isFavorite) {
      // L'annonce a été retirée des favoris, on recharge la liste
      if (user) {
        await loadFavoris(user.id);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-b-2 border-blue-600 rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
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
        {favoris.length === 0 ? (
          <div className="text-center py-20">
            <Heart size={64} className="mx-auto text-gray-300 mb-4" />
            <h2 className="text-2xl font-bold text-gray-700 mb-2">
              Aucun favori pour le moment
            </h2>
            <p className="text-gray-500 mb-6">
              Commencez à ajouter des annonces à vos favoris pour les retrouver facilement ici
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
            {favoris.map((favori) => (
              <AnnonceCard
                key={favori.id}
                annonce={favori.annonces}
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
