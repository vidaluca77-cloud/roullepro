'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Phone, Mail, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function AnnonceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [annonce, setAnnonce] = useState<any>(null);
  const [vendeur, setVendeur] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImg, setSelectedImg] = useState(0);
  const [contactOpen, setContactOpen] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    if (params.id) fetchAnnonce(params.id as string);
  }, [params.id]);

  const fetchAnnonce = async (id: string) => {
    const { data } = await supabase.from('annonces').select('*, profiles(*)').eq('id', id).single();
    if (data) { setAnnonce(data); setVendeur(data.profiles); }
    setLoading(false);
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin h-10 w-10 border-b-2 border-blue-600 rounded-full"></div></div>;
  if (!annonce) return <div className="text-center py-20"><p className="text-gray-500">Annonce introuvable</p><Link href="/annonces" className="mt-4 inline-block bg-blue-600 text-white px-6 py-2 rounded-lg">Retour</Link></div>;

  const images = annonce.photos || [];

  const nextImage = () => {
    setSelectedImg((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setSelectedImg((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 hover:text-blue-600 mb-4">
          <ArrowLeft size={20} />Retour
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Carrousel de photos amélioré */}
          <div className="space-y-4">
            {/* Image principale */}
            <div className="relative bg-gray-100 rounded-xl overflow-hidden" style={{ height: '500px' }}>
              {images.length > 0 ? (
                <>
                  <img 
                    src={images[selectedImg]} 
                    alt={annonce.title} 
                    className="w-full h-full object-contain"
                  />
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition"
                      >
                        <ChevronLeft size={24} className="text-gray-800" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition"
                      >
                        <ChevronRight size={24} className="text-gray-800" />
                      </button>
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 px-3 py-1 rounded-full text-white text-sm">
                        {selectedImg + 1} / {images.length}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <span>Pas de photo</span>
                </div>
              )}
            </div>

            {/* Miniatures */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {images.map((img: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImg(idx)}
                    className={`flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden border-2 transition ${
                      selectedImg === idx ? 'border-blue-600 shadow-lg' : 'border-gray-300 hover:border-blue-400'
                    }`}
                  >
                    <img src={img} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Détails de l'annonce */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full mb-2">
                    {annonce.categorie}
                  </span>
                  <h1 className="text-3xl font-bold text-gray-900">{annonce.title}</h1>
                </div>
              </div>

              <div className="text-4xl font-bold text-blue-600 mb-6">
                {annonce.price ? `${Number(annonce.price).toLocaleString()} €` : 'Sur demande'}
              </div>

              <div className="space-y-3 border-t pt-4">
                {annonce.marque && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Marque</span>
                    <span className="font-semibold">{annonce.marque}</span>
                  </div>
                )}
                {annonce.modele && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Modèle</span>
                    <span className="font-semibold">{annonce.modele}</span>
                  </div>
                )}
                {annonce.annee && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Année</span>
                    <span className="font-semibold">{annonce.annee}</span>
                  </div>
                )}
                {annonce.kilometrage && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Kilométrage</span>
                    <span className="font-semibold">{Number(annonce.kilometrage).toLocaleString()} km</span>
                  </div>
                )}
                {annonce.ville && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Localisation</span>
                    <span className="font-semibold">{annonce.ville}</span>
                  </div>
                )}
              </div>
            </div>

            {annonce.description && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-bold mb-3">Description</h2>
                <p className="text-gray-700 whitespace-pre-line">{annonce.description}</p>
              </div>
            )}

            {vendeur && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-bold mb-4">Vendeur</h2>
                <div className="space-y-3">
                  {vendeur.nom_entreprise && (
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-lg">{vendeur.nom_entreprise}</span>
                    </div>
                  )}
                  <button
                    onClick={() => setContactOpen(!contactOpen)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition"
                  >
                    Afficher le contact
                  </button>
                  {contactOpen && (
                    <div className="space-y-2 pt-3 border-t">
                      {vendeur.telephone && (
                        <a href={`tel:${vendeur.telephone}`} className="flex items-center gap-2 text-gray-700 hover:text-blue-600">
                          <Phone size={18} />
                          <span>{vendeur.telephone}</span>
                        </a>
                      )}
                      {vendeur.email && (
                        <a href={`mailto:${vendeur.email}`} className="flex items-center gap-2 text-gray-700 hover:text-blue-600">
                          <Mail size={18} />
                          <span>{vendeur.email}</span>
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
            
              {/* Bouton Signaler cette annonce */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <button
                  onClick={() => {
                    if (confirm('Voulez-vous vraiment signaler cette annonce?')) {
                      alert('Merci pour votre signalement. Notre équipe va examiner cette annonce.');
                    }
                  }}
                  className="w-full border-2 border-red-500 text-red-600 hover:bg-red-50 py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/>
                    <line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                  Signaler cette annonce
                </button>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
}
