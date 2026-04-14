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
  if (!annonce) return <div className="text-center py-20"><p className="text-gray-500">Annonce introuvable</p><Link href="/annonces" className="mt-4 inline-block bg-blue-600 text-white px-6 py-2 rounded-lg">Retour</Link></div>;

  const images = annonce.photos || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 hover:text-blue-600 mb-4"><ArrowLeft size={20} />Retour</button>
        <div className="grid grid-cols-1 lg:col-span-2 gap-6">
          <div className="bg-white rounded-xl overflow-hidden shadow-sm">
            {images[selectedImg] ? <img src={images[selectedImg]} alt={annonce.titre} className="w-full h-96 object-cover" /> : <div className="bg-gray-100 h-96 flex items-center justify-center"><span className="text-gray-400 text-sm">Pas de photo</span></div>}
            {images.length > 1 && (
              <div className="p-4 flex gap-2 overflow-x-auto">
                {images.map((img: string, i: number) => (
                  <img key={i} src={img} alt={`${i+1}`} onClick={() => setSelectedImg(i)} className={`h-16 w-20 object-cover rounded cursor-pointer border-2 ${selectedImg === i ? 'border-blue-500' : 'border-gray-200'}`} />
                ))}
              </div>
            )}
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">{annonce.categorie}</span>
            <h1 className="text-3xl font-bold mt-2">{annonce.titre}</h1>
            <p className="text-blue-600 font-bold text-3xl mt-4">{annonce.prix ? `${Number(annonce.prix).toLocaleString()} EUR` : 'Prix sur demande'}</p>
            <div className="grid md:grid-cols-2 gap-4 mt-6">
              {annonce.marque && <div><p className="text-sm text-gray-500">Marque</p><p className="font-semibold">{annonce.marque}</p></div>}
              {annonce.modele && <div><p className="text-sm text-gray-500">Modèle</p><p className="font-semibold">{annonce.modele}</p></div>}
              {annonce.annee && <div><p className="text-sm text-gray-500">Année</p><p className="font-semibold">{annonce.annee}</p></div>}
              {annonce.kilometrage && <div><p className="text-sm text-gray-500">KM</p><p className="font-semibold">{Number(annonce.kilometrage).toLocaleString()}</p></div>}
              {annonce.carburant && <div><p className="text-sm text-gray-500">Énergie</p><p className="font-semibold">{annonce.carburant}</p></div>}
              {annonce.boite && <div><p className="text-sm text-gray-500">Boîte</p><p className="font-semibold">{annonce.boite}</p></div>}
              {annonce.couleur && <div><p className="text-sm text-gray-500">Couleur</p><p className="font-semibold">{annonce.couleur}</p></div>}
              {annonce.ville && <div><p className="text-sm text-gray-500">Ville</p><p className="font-semibold">{annonce.ville}</p></div>}
            </div>
            {annonce.description && <div className="mt-6"><h3 className="font-semibold mb-2">Description</h3><p className="text-gray-700 whitespace-pre-line">{annonce.description}</p></div>}
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="font-semibold mb-4">Contacter le vendeur</h3>
            {vendeur && <div className="mb-4"><p className="font-semibold">{vendeur.prenom} {vendeur.nom}</p>{vendeur.entreprise && <p className="text-sm text-gray-500">{vendeur.entreprise}</p>}</div>}
            {contactOpen ? (
              <div className="space-y-3">
                {vendeur?.telephone && <a href={`tel:${vendeur.telephone}`} className="flex items-center gap-2 text-blue-600 hover:underline"><Phone size={18} />{vendeur.telephone}</a>}
                {vendeur?.email && <a href={`mailto:${vendeur.email}`} className="flex items-center gap-2 text-blue-600 hover:underline"><Mail size={18} />{vendeur.email}</a>}
              </div>
            ) : (
              <button onClick={() => setContactOpen(true)} className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition">Voir les coordonnées</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
