'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MapPin, Heart } from 'lucide-react';

interface AnnonceCardProps {
  annonce: any;
  isFavorite?: boolean;
  onFavoriteToggle?: (annonceId: string, isFavorite: boolean) => void;
}

export default function AnnonceCard({ annonce, isFavorite: initialFavorite = false, onFavoriteToggle }: AnnonceCardProps) {
  const [isFavorite, setIsFavorite] = useState(initialFavorite);
  const [loading, setLoading] = useState(false);

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setLoading(true);
    try {
      if (isFavorite) {
        // Retirer des favoris
        const response = await fetch(`/api/favoris?annonce_id=${annonce.id}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          setIsFavorite(false);
          onFavoriteToggle?.(annonce.id, false);
        }
      } else {
        // Ajouter aux favoris
        const response = await fetch('/api/favoris', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ annonce_id: annonce.id }),
        });
        
        if (response.ok) {
          setIsFavorite(true);
          onFavoriteToggle?.(annonce.id, true);
        } else if (response.status === 401) {
          // Rediriger vers login si non authentifié
          window.location.href = '/auth';
        }
      }
    } catch (error) {
      console.error('Erreur favoris:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition overflow-hidden relative group">
      <Link href={`/annonces/${annonce.id}`}>
        <div className="bg-gray-100 h-48 flex items-center justify-center relative">
          {annonce.photos?.[0] ? (
            <img src={annonce.photos[0]} alt={annonce.title} className="w-full h-full object-cover" />
          ) : (
            <span className="text-gray-400 text-sm">Pas de photo</span>
          )}
        </div>
        <div className="p-4">
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">{annonce.categorie}</span>
          <h3 className="font-semibold mt-2 truncate">{annonce.title}</h3>
          <p className="text-blue-600 font-bold text-lg">
            {annonce.price ? `${Number(annonce.price).toLocaleString()} €` : 'Sur demande'}
          </p>
          <div className="text-xs text-gray-500 mt-1 flex gap-2">
            {annonce.ville && (
              <span>
                <MapPin size={10} className="inline" /> {annonce.ville}
              </span>
            )}
            {annonce.annee && <span>{annonce.annee}</span>}
          </div>
        </div>
      </Link>
      
      {/* Bouton Favoris */}
      <button
        onClick={toggleFavorite}
        disabled={loading}
        className={`absolute top-3 right-3 p-2 rounded-full transition-all ${
          isFavorite
            ? 'bg-red-500 text-white'
            : 'bg-white/90 text-gray-600 hover:bg-white'
        } shadow-md hover:scale-110 disabled:opacity-50`}
        title={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
      >
        <Heart size={18} fill={isFavorite ? 'currentColor' : 'none'} />
      </button>
    </div>
  );
}
