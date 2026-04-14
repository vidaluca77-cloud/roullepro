'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Phone, Mail, ArrowLeft } from 'lucide-react';
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
  if (!annonce) return <div className="text-center py-20"><p>Annonce introuvable</p><Link href="/annonces" className="text-blue-600">Retour</Link></div>;

  const images = annonce.images || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 hover:text-blue-600 mb-4"><ArrowLeft size={18} /> Retour</button>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl overflow-hidden shadow-sm">
              <div className="bg-gray-100 h-80 flex items-center justify-center">
                {images[selectedImg] ? <img src={images[selectedImg]} alt={annonce.titre} className="w-full h-full object-cover" /> : <span className="text-gray-400">Pas de photo</span>}
              </div>
              {images.length > 1 && (
                <div className="flex gap-2 p-3 overflow-x-auto">
                  {images.map((img: string, i: number) => (
                    <img key={i} src={img} onClick={() => setSelectedImg(i)} className={`h-16 w-20 object-cover rounded cursor-pointer border-2 ${selectedImg === i ? 'border-blue-500' : 'border-gray-200'}`} />
                  ))}
                </div>
              )}
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6 mt-4">
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">{annonce.categorie}</span>
              <h1 className="text-2xl font-bold mt-2">{annonce.titre}</h1>
              <p className="text-3xl font-bold text-blue-600 mt-2">{annonce.prix ? `${Number(annonce.prix).toLocaleString()} EUR` : 'Prix sur demande'}</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
                {annonce.marque && <div className="bg-gray-50 rounded-lg p-3 text-center"><p className="text-xs text-gray-500">Marque</p><p className="font-semibold">{annonce.marque}</p></div>}
                {annonce.modele && <div className="bg-gray-50 rounded-lg p-3 text-center"><p className="text-xs text-gray-500">Modele</p><p className="font-semibold">{annonce.modele}</p></div>}
                {annonce.annee && <div className="bg-gray-50 rounded-lg p-3 text-center"><p className="text-xs text-gray-500">Annee</p><p className="font-semibold">{annonce.annee}</p></div>}
                {annonce.kilometrage && <div className="bg-gray-50 rounded-lg p-3 text-center"><p className="text-xs text-gray-500">KM</p><p className="font-semibold">{Number(annonce.kilometrage).toLocaleString()}</p></div>}
                {annonce.energie && <div className="bg-gray-50 rounded-lg p-3 text-center"><p className="text-xs text-gray-500">Energie</p><p className="font-semibold">{annonce.energie}</p></div>}
                {annonce.boite_vitesse && <div className="bg-gray-50 rounded-lg p-3 text-center"><p className="text-xs text-gray-500">Boite</p><p className="font-semibold">{annonce.boite_vitesse}</p></div>}
                {annonce.couleur && <div className="bg-gray-50 rounded-lg p-3 text-center"><p className="text-xs text-gray-500">Couleur</p><p className="font-semibold">{annonce.couleur}</p></div>}
                {annonce.ville && <div className="bg-gray-50 rounded-lg p-3 text-center"><p className="text-xs text-gray-500">Ville</p><p className="font-semibold">{annonce.ville}</p></div>}
              </div>
              {annonce.description && <div className="mt-6"><h2 className="font-semibold text-lg mb-2">Description</h2><p className="text-gray-600 whitespace-pre-wrap">{annonce.description}</p></div>}
            </div>
          </div>
          <div>
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-20">
              <h3 className="font-semibold text-lg mb-4">Contacter le vendeur</h3>
              {vendeur && <div className="mb-4"><p className="font-medium">{vendeur.prenom} {vendeur.nom}</p>{vendeur.entreprise && <p className="text-sm text-gray-500">{vendeur.entreprise}</p>}</div>}
              {contactOpen ? (
                <div className="space-y-3 text-sm">
                  {vendeur?.telephone && <div className="flex items-center gap-2"><Phone size={16} className="text-blue-600" /><span>{vendeur.telephone}</span></div>}
                  {vendeur?.email && <div className="flex items-center gap-2"><Mail size={16} className="text-blue-600" /><span>{vendeur.email}</span></div>}
                </div>
              ) : (
                <button onClick={() => setContactOpen(true)} className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition">Voir les coordonnees</button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
