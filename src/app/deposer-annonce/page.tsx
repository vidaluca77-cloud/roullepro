'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { AlertCircle, Image as ImageIcon, X, Truck, Car } from 'lucide-react';
import { getPlan, canCreateAnnonce } from '@/lib/plans';
import { compressImage } from '@/lib/image-compress';
import { trackDepotAnnonce } from '@/lib/google-ads-conversions';

const ENERGIES = ['Essence','Diesel','Hybride','Electrique','GPL','Hydrogène'];
const BOITES = ['Manuelle','Automatique'];
const TYPES_CARROSSERIE_UTILITAIRE = [
  'Fourgon', 'Fourgonnette', 'Camionnette bâchée', 'Plateau',
  'Benne', 'Frigorifique', 'Ampliroll', 'Autre'
];

const MAX_PHOTOS = 10;
const MAX_INPUT_SIZE = 50 * 1024 * 1024; // on accepte grand en entree, on compresse ensuite

// Slugs des catégories utilitaires (véhicules de charge)
const SLUGS_UTILITAIRES = ['utilitaire'];
// Slugs des catégories véhicules de transport de personnes
const SLUGS_TRANSPORT = ['vtc','taxi','ambulance','tpmr','navette'];

type Category = { id: string; name: string; slug: string };

export default function DeposerAnnoncePage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<{file: File, preview: string}[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCatSlug, setSelectedCatSlug] = useState('');

  const [form, setForm] = useState({
    title: '',
    category_id: '',
    marque: '',
    modele: '',
    annee: '',
    kilometrage: '',
    price: '',
    carburant: '',
    boite: '',
    couleur: '',
    description: '',
    ville: '',
    histovec_url: '',
    // Champs utilitaires
    ptac: '',
    charge_utile: '',
    volume_utile: '',
    longueur_plateau: '',
    type_carrosserie: '',
    nb_essieux: '',
    // Champs transport personnes
    nb_places: '',
    // Champs communs avancés
    puissance_cv: '',
    norme_euro: '',
  });

  useEffect(() => { loadCategories(); }, []);

  const loadCategories = async () => {
    const { data } = await supabase.from('categories').select('id, name, slug').order('sort_order');
    if (data) setCategories(data);
  };

  const isUtilitaire = SLUGS_UTILITAIRES.includes(selectedCatSlug);
  const isTransport = SLUGS_TRANSPORT.includes(selectedCatSlug);

  const set = (e: React.ChangeEvent<any>) => {
    const { name, value } = e.target;
    setForm(prev => ({...prev, [name]: value}));
    if (name === 'category_id') {
      const cat = categories.find(c => c.id === value);
      setSelectedCatSlug(cat?.slug || '');
    }
  };

  const handlePhotosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setError('');
    if (photoPreview.length + files.length > MAX_PHOTOS) {
      setError(`Maximum ${MAX_PHOTOS} photos`);
      return;
    }
    // Filtre tres permissif : accepte tout ce qui ressemble a une image
    const validFiles = files.filter((f) => {
      const isImg =
        (f.type || '').startsWith('image/') ||
        /\.(jpg|jpeg|png|webp|heic|heif|avif|gif|bmp)$/i.test(f.name);
      return isImg && f.size <= MAX_INPUT_SIZE;
    });
    if (validFiles.length === 0) {
      setError('Aucune image valide. Choisissez des photos (max 50 Mo chacune).');
      return;
    }
    setPhotoPreview((prev) => [
      ...prev,
      ...validFiles.map((file) => ({ file, preview: URL.createObjectURL(file) })),
    ]);
    // Reinitialise l'input pour pouvoir re-selectionner le meme fichier
    if (e.target) e.target.value = '';
  };

  const removePhoto = (index: number) => {
    setPhotoPreview(prev => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const uploadPhotos = async (userId: string): Promise<string[]> => {
    setUploadingPhotos(true);
    const urls: string[] = [];
    try {
      for (let i = 0; i < photoPreview.length; i++) {
        const raw = photoPreview[i].file;

        // Compression / conversion en JPEG (gere PNG, HEIC, gros fichiers)
        let file: File;
        try {
          file = await compressImage(raw, { targetSizeKB: 2500, maxDim: 2560 });
        } catch {
          file = raw;
        }
        if (file.size > 8 * 1024 * 1024) {
          try {
            file = await compressImage(file, { targetSizeKB: 2000, maxDim: 1600 });
          } catch {
            // ok, on garde
          }
        }

        const finalType = file.type || 'image/jpeg';
        const ext =
          finalType === 'image/jpeg' ? 'jpg' :
          finalType === 'image/png' ? 'png' :
          finalType === 'image/webp' ? 'webp' : 'jpg';

        const path = `${userId}/${Date.now()}_${i}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
        const { data, error: upErr } = await supabase.storage
          .from('annonces-photos')
          .upload(path, file, { upsert: false, contentType: finalType, cacheControl: '3600' });
        if (upErr) {
          // eslint-disable-next-line no-console
          console.error('[deposer-annonce] upload error:', upErr);
          throw new Error(`Echec upload photo ${i + 1}: ${upErr.message}`);
        }
        const { data: { publicUrl } } = supabase.storage.from('annonces-photos').getPublicUrl(data.path);
        urls.push(publicUrl);
      }
    } finally {
      setUploadingPhotos(false);
    }
    return urls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (photoPreview.length === 0) { setError('Ajoutez au moins une photo'); return; }
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setError('Connectez-vous pour déposer une annonce'); setLoading(false); return; }

      // Vérifier le quota selon le plan
      const [{ data: profileRow }, { count: activeCount }] = await Promise.all([
        supabase.from('profiles').select('plan').eq('id', user.id).single(),
        supabase.from('annonces').select('id', { count: 'exact', head: true })
          .eq('user_id', user.id).in('status', ['active', 'pending']),
      ]);
      const userPlan = getPlan(profileRow?.plan);
      if (!canCreateAnnonce(userPlan, activeCount || 0)) {
        setError(`Vous avez atteint la limite de ${userPlan.limits.maxActiveAnnonces} annonce(s) active(s) pour le plan ${userPlan.name}. Passez Pro ou Premium pour en publier davantage.`);
        setLoading(false);
        return;
      }

      const photoUrls = await uploadPhotos(user.id);

      // Construire l'objet annonce — champs spécifiques selon catégorie
      const annonceData: any = {
        title: form.title,
        category_id: form.category_id,
        marque: form.marque,
        modele: form.modele,
        annee: form.annee ? +form.annee : null,
        kilometrage: form.kilometrage ? +form.kilometrage : null,
        price: form.price ? +form.price : null,
        carburant: form.carburant || null,
        boite: form.boite || null,
        couleur: form.couleur || null,
        description: form.description,
        city: form.ville,
        images: photoUrls,
        histovec_url: form.histovec_url?.trim() || null,
        user_id: user.id,
        status: 'pending',
      };

      // Champs utilitaires
      if (isUtilitaire) {
        if (form.ptac) annonceData.ptac = +form.ptac;
        if (form.charge_utile) annonceData.charge_utile = +form.charge_utile;
        if (form.volume_utile) annonceData.volume_utile = +form.volume_utile;
        if (form.longueur_plateau) annonceData.longueur_plateau = +form.longueur_plateau;
        if (form.type_carrosserie) annonceData.type_carrosserie = form.type_carrosserie;
        if (form.nb_essieux) annonceData.nb_essieux = +form.nb_essieux;
      }

      // Champs transport personnes
      if (isTransport && form.nb_places) annonceData.nb_places = +form.nb_places;

      // Champs communs avancés
      if (form.puissance_cv) annonceData.puissance_cv = +form.puissance_cv;
      if (form.norme_euro) annonceData.norme_euro = form.norme_euro;

      const { error: err } = await supabase.from('annonces').insert(annonceData);
      if (err) { setError(err.message); return; }

      // Tracking GA4 : dépôt d'annonce réussi
      if (typeof window !== "undefined" && typeof window.gtag === "function") {
        window.gtag("event", "depot_annonce", {
          categorie: annonceData.categorie,
          ville: annonceData.ville,
          prix: annonceData.prix,
        });
      }

      // Notif admin (non bloquant)
      const { data: inserted } = await supabase
        .from('annonces').select('id').eq('user_id', user.id).eq('status', 'pending')
        .order('created_at', { ascending: false }).limit(1).single();
      if (inserted?.id) {
        fetch('/api/annonces', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ annonce_id: inserted.id }),
        }).catch(() => {});
      }
      trackDepotAnnonce(form.price ? Number(form.price) : undefined);
      router.push('/dashboard?annonce=pending');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputCls = 'w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100 transition';
  const labelCls = 'block text-sm font-medium text-gray-700 mb-1';

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-3xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Déposer une annonce</h1>
          <p className="text-gray-500">Gratuit · Modéré sous 24h · Visible par tous les pros</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex gap-2.5 items-start">
            <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={18} />
            <div className="flex-1">
              <p className="text-sm text-red-800">{error}</p>
              {error.includes('limite') && (
                <Link href="/pricing" className="inline-block mt-2 text-sm font-semibold text-blue-600 hover:underline">
                  Voir les abonnements →
                </Link>
              )}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* ── Infos générales ── */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Car size={18} className="text-blue-600" /> Informations générales
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className={labelCls}>Titre de l'annonce *</label>
                <input name="title" value={form.title} onChange={set} required placeholder="Ex : Mercedes Sprinter 314 CDI frigorifique 2021" className={inputCls} />
              </div>
              <div className="md:col-span-2">
                <label className={labelCls}>Catégorie *</label>
                <select name="category_id" value={form.category_id} onChange={set} required className={inputCls}>
                  <option value="">Choisir une catégorie</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Marque *</label>
                <input name="marque" value={form.marque} onChange={set} required placeholder="Mercedes, Renault..." className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Modèle *</label>
                <input name="modele" value={form.modele} onChange={set} required placeholder="Sprinter, Master..." className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Année *</label>
                <input name="annee" value={form.annee} onChange={set} required type="number" min="1990" max="2030" placeholder="2021" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Kilométrage (km) *</label>
                <input name="kilometrage" value={form.kilometrage} onChange={set} required type="number" min="0" placeholder="150 000" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Prix de vente (€)</label>
                <input name="price" value={form.price} onChange={set} type="number" min="0" placeholder="Laisser vide = Sur demande" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Ville *</label>
                <input name="ville" value={form.ville} onChange={set} required placeholder="Paris, Lyon..." className={inputCls} />
              </div>
            </div>
          </div>

          {/* ── Caractéristiques techniques ── */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Truck size={18} className="text-blue-600" /> Caractéristiques techniques
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Énergie</label>
                <select name="carburant" value={form.carburant} onChange={set} className={inputCls}>
                  <option value="">Choisir</option>
                  {ENERGIES.map(e => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Boîte de vitesse</label>
                <select name="boite" value={form.boite} onChange={set} className={inputCls}>
                  <option value="">Choisir</option>
                  {BOITES.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Puissance (CV)</label>
                <input name="puissance_cv" value={form.puissance_cv} onChange={set} type="number" min="0" placeholder="150" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Norme Euro</label>
                <select name="norme_euro" value={form.norme_euro} onChange={set} className={inputCls}>
                  <option value="">Choisir</option>
                  {['Euro 3','Euro 4','Euro 5','Euro 6','Euro 6c','Euro 6d'].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Couleur</label>
                <input name="couleur" value={form.couleur} onChange={set} placeholder="Blanc, Gris..." className={inputCls} />
              </div>
              {isTransport && (
                <div>
                  <label className={labelCls}>Nombre de places</label>
                  <input name="nb_places" value={form.nb_places} onChange={set} type="number" min="1" max="100" placeholder="5" className={inputCls} />
                </div>
              )}
            </div>

            {/* Champs spécifiques utilitaires */}
            {isUtilitaire && (
              <div className="mt-4 pt-4 border-t border-orange-100">
                <p className="text-sm font-semibold text-orange-700 mb-3 flex items-center gap-1.5">
                  <Truck size={15} /> Caractéristiques utilitaires
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>PTAC (kg)</label>
                    <input name="ptac" value={form.ptac} onChange={set} type="number" min="0" placeholder="3 500" className={inputCls} />
                    <p className="text-xs text-gray-400 mt-1">Poids Total Autorisé en Charge</p>
                  </div>
                  <div>
                    <label className={labelCls}>Charge utile (kg)</label>
                    <input name="charge_utile" value={form.charge_utile} onChange={set} type="number" min="0" placeholder="1 200" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Volume utile (m³)</label>
                    <input name="volume_utile" value={form.volume_utile} onChange={set} type="number" min="0" step="0.1" placeholder="10.8" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Longueur plateau/caisse (m)</label>
                    <input name="longueur_plateau" value={form.longueur_plateau} onChange={set} type="number" min="0" step="0.01" placeholder="4.30" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Type de carrosserie</label>
                    <select name="type_carrosserie" value={form.type_carrosserie} onChange={set} className={inputCls}>
                      <option value="">Choisir</option>
                      {TYPES_CARROSSERIE_UTILITAIRE.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Nombre d'essieux</label>
                    <select name="nb_essieux" value={form.nb_essieux} onChange={set} className={inputCls}>
                      <option value="">Choisir</option>
                      {['2','3','4'].map(n => <option key={n} value={n}>{n} essieux</option>)}
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── Description ── */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Description</h2>
            <textarea
              name="description"
              value={form.description}
              onChange={set}
              rows={5}
              placeholder={isUtilitaire
                ? "Décrivez l'état général, l'historique d'entretien, les équipements (hayon, attelage, GPS...), l'usage professionnel..."
                : "Décrivez l'état général, l'historique d'entretien, les équipements (GPS, caméra...), l'usage professionnel..."}
              className={inputCls + ' resize-none'}
            />
          </div>

          {/* ── HistoVec ── */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-900 mb-1">Rapport HistoVec <span className="text-xs font-normal text-gray-400">(recommandé)</span></h2>
            <p className="text-xs text-gray-500 mb-3">
              Affichez le rapport officiel gratuit pour rassurer l'acheteur : antécédents, sinistres, nombre de titulaires.{" "}
              <a href="https://histovec.interieur.gouv.fr" target="_blank" rel="noopener" className="text-blue-600 underline">Générer mon rapport</a>
            </p>
            <input
              type="url"
              name="histovec_url"
              value={form.histovec_url}
              onChange={set}
              placeholder="https://histovec.interieur.gouv.fr/rapport/..."
              className={inputCls}
            />
          </div>

          {/* ── Photos ── */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
              <ImageIcon size={18} className="text-blue-600" />
              Photos du véhicule
              <span className="text-sm font-normal text-gray-400">({photoPreview.length}/{MAX_PHOTOS})</span>
            </h2>
            <p className="text-xs text-gray-400 mb-4">JPG, PNG, WEBP · Max 5 MB par photo · Au moins 1 photo obligatoire</p>

            {photoPreview.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-4">
                {photoPreview.map((photo, i) => (
                  <div key={i} className="relative group aspect-square">
                    <img src={photo.preview} alt="" className="w-full h-full object-cover rounded-xl border border-gray-100" />
                    {i === 0 && <span className="absolute bottom-1 left-1 bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded font-medium">Principale</span>}
                    <button type="button" onClick={() => removePhoto(i)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition shadow">
                      <X size={10} />
                    </button>
                  </div>
                ))}
                {photoPreview.length < MAX_PHOTOS && (
                  <label className="aspect-square border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition">
                    <span className="text-2xl text-gray-300 hover:text-blue-400">+</span>
                    <input type="file" accept="image/*" multiple onChange={handlePhotosChange} className="hidden" />
                  </label>
                )}
              </div>
            )}

            {photoPreview.length === 0 && (
              <label className="block w-full border-2 border-dashed border-gray-200 rounded-xl p-10 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition">
                <ImageIcon size={32} className="mx-auto text-gray-300 mb-2" />
                <p className="text-sm text-gray-500 font-medium">Cliquez pour ajouter des photos</p>
                <p className="text-xs text-gray-400 mt-1">ou glissez-déposez vos fichiers ici</p>
                <input type="file" accept="image/*" multiple onChange={handlePhotosChange} className="hidden" />
              </label>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || uploadingPhotos}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 px-6 rounded-xl font-semibold transition disabled:opacity-50 text-base"
          >
            {loading ? (uploadingPhotos ? 'Upload des photos...' : 'Publication en cours...') : 'Publier gratuitement'}
          </button>
          <p className="text-center text-xs text-gray-400">Votre annonce sera visible après modération (sous 24h)</p>
        </form>
      </div>
    </div>
  );
}
