'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Phone, Mail, ArrowLeft, ChevronLeft, ChevronRight,
  MessageSquare, BadgeCheck, Eye, Share2, Copy, Check,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import SignalementModal from '@/components/SignalementModal';
import ContactModal from '@/components/ContactModal';

interface AnnonceDetailProps {
  annonce: any;
  vendeur: any;
}

export default function AnnonceDetail({ annonce, vendeur }: AnnonceDetailProps) {
  const router = useRouter();
  const [selectedImg, setSelectedImg] = useState(0);
  const [contactOpen, setContactOpen] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [signalementOpen, setSignalementOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentProfile, setCurrentProfile] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    fetchCurrentUser();
    // Incrémenter le compteur de vues (silencieux)
    supabase.rpc('increment_views', { annonce_id: annonce.id }).then(() => {});
  }, [annonce.id]);

  const fetchCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setCurrentUser(user);
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      setCurrentProfile(profile);
    }
  };

  const images: string[] = annonce.images || annonce.photos || [];
  const isOwner = currentUser?.id === annonce.user_id;
  const currentUserName = currentProfile
    ? (currentProfile.full_name || `${currentProfile.prenom || ''} ${currentProfile.nom || ''}`.trim())
    : '';
  const currentUserEmail = currentUser?.email || '';

  const nextImage = () => setSelectedImg((prev) => (prev + 1) % images.length);
  const prevImage = () => setSelectedImg((prev) => (prev - 1 + images.length) % images.length);

  const annonceUrl = typeof window !== 'undefined'
    ? window.location.href
    : `https://roullepro.com/annonces/${annonce.id}`;

  const shareWhatsApp = () => {
    const text = encodeURIComponent(
      `${annonce.title}${annonce.price ? ' — ' + Number(annonce.price).toLocaleString('fr-FR') + ' €' : ''} | RoullePro\n${annonceUrl}`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(annonceUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback pour navigateurs anciens
      const el = document.createElement('input');
      el.value = annonceUrl;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-500 hover:text-blue-600 mb-4"
        >
          <ArrowLeft size={20} />Retour
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Carrousel de photos */}
          <div className="space-y-4">
            <div
              className="relative bg-gray-100 rounded-xl overflow-hidden"
              style={{ height: '500px' }}
            >
              {images.length > 0 ? (
                <>
                  <Image
                    src={images[selectedImg]}
                    alt={`${annonce.title} - photo ${selectedImg + 1}`}
                    width={800}
                    height={600}
                    className="w-full h-full object-contain"
                    priority={selectedImg === 0}
                  />
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition"
                        aria-label="Photo précédente"
                      >
                        <ChevronLeft size={24} className="text-gray-800" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition"
                        aria-label="Photo suivante"
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

            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {images.map((img: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImg(idx)}
                    className={`flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden border-2 transition relative ${
                      selectedImg === idx
                        ? 'border-blue-600 shadow-lg'
                        : 'border-gray-300 hover:border-blue-400'
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`${annonce.title} photo ${idx + 1}`}
                      width={96}
                      height={96}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Détails */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full mb-2">
                    {annonce.categories?.name || annonce.categorie}
                  </span>
                  <h1 className="text-3xl font-bold text-gray-900">{annonce.title}</h1>
                </div>
              </div>

              <div className="flex items-center justify-between mb-6">
                <div className="text-4xl font-bold text-blue-600">
                  {annonce.price
                    ? `${Number(annonce.price).toLocaleString('fr-FR')} €`
                    : 'Sur demande'}
                </div>
                {annonce.views_count > 0 && (
                  <span className="flex items-center gap-1 text-sm text-gray-400">
                    <Eye size={14} />
                    {annonce.views_count} vue{annonce.views_count > 1 ? 's' : ''}
                  </span>
                )}
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
                    <span className="font-semibold">
                      {Number(annonce.kilometrage).toLocaleString('fr-FR')} km
                    </span>
                  </div>
                )}
                {(annonce.city || annonce.ville) && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Localisation</span>
                    <span className="font-semibold">{annonce.city || annonce.ville}</span>
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
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link
                      href={`/profil/${annonce.user_id}`}
                      className="font-semibold text-lg text-gray-900 hover:text-blue-600 transition"
                    >
                      {vendeur.company_name ||
                        vendeur.entreprise ||
                        vendeur.full_name ||
                        'Vendeur professionnel'}
                    </Link>
                    {(vendeur.is_verified || vendeur.date_verification) && (
                      <span className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full text-xs font-medium">
                        <BadgeCheck size={14} />
                        Vérifié
                      </span>
                    )}
                  </div>
                  {(vendeur.city || vendeur.ville) && (
                    <p className="text-sm text-gray-500">{vendeur.city || vendeur.ville}</p>
                  )}

                  {!isOwner ? (
                    <button
                      onClick={() => setContactModalOpen(true)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2"
                    >
                      <MessageSquare size={18} />
                      Contacter le vendeur
                    </button>
                  ) : (
                    <div className="w-full bg-gray-100 text-gray-500 py-3 rounded-lg font-medium text-center text-sm">
                      Votre annonce
                    </div>
                  )}

                  <button
                    onClick={() => setContactOpen(!contactOpen)}
                    className="w-full border border-blue-600 text-blue-600 hover:bg-blue-50 py-2 rounded-lg font-medium transition text-sm"
                  >
                    {contactOpen ? 'Masquer le contact' : 'Afficher le contact direct'}
                  </button>

                  {contactOpen && (
                    <div className="space-y-2 pt-3 border-t">
                      {vendeur.telephone && (
                        <a
                          href={`tel:${vendeur.telephone}`}
                          className="flex items-center gap-2 text-gray-700 hover:text-blue-600"
                        >
                          <Phone size={18} />
                          <span>{vendeur.telephone}</span>
                        </a>
                      )}
                      {vendeur.email && (
                        <a
                          href={`mailto:${vendeur.email}`}
                          className="flex items-center gap-2 text-gray-700 hover:text-blue-600"
                        >
                          <Mail size={18} />
                          <span>{vendeur.email}</span>
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Partager l'annonce */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-base font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Share2 size={18} className="text-gray-400" />
                Partager cette annonce
              </h2>
              <div className="flex gap-3">
                <button
                  onClick={shareWhatsApp}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1fba58] text-white font-semibold py-2.5 px-4 rounded-xl transition text-sm"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  WhatsApp
                </button>
                <button
                  onClick={copyLink}
                  className={`flex-1 flex items-center justify-center gap-2 font-semibold py-2.5 px-4 rounded-xl transition text-sm border-2 ${
                    copied
                      ? 'bg-green-50 border-green-500 text-green-700'
                      : 'bg-white border-gray-200 text-gray-700 hover:border-blue-400 hover:text-blue-600'
                  }`}
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                  {copied ? 'Copie !' : 'Copier le lien'}
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <button
                onClick={() => setSignalementOpen(true)}
                className="w-full border-2 border-red-500 text-red-600 hover:bg-red-50 py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                Signaler cette annonce
              </button>
            </div>
          </div>
        </div>
      </div>

      <SignalementModal
        annonceId={annonce.id}
        isOpen={signalementOpen}
        onClose={() => setSignalementOpen(false)}
      />

      <ContactModal
        annonceId={annonce.id}
        annonceTitre={annonce.title || annonce.titre || ''}
        isOpen={contactModalOpen}
        onClose={() => setContactModalOpen(false)}
        currentUserName={currentUserName}
        currentUserEmail={currentUserEmail}
        isOwner={isOwner}
        annonceDetails={{
          price: annonce.price,
          marque: annonce.marque,
          modele: annonce.modele,
          categorie: annonce.categories?.name || annonce.categorie,
        }}
      />
    </div>
  );
}
