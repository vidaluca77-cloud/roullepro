'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { AlertCircle, Image as ImageIcon, X, Truck, Car } from 'lucide-react';
import { compressImage } from '@/lib/image-compress';

const ENERGIES = ['Essence','Diesel','Hybride','Electrique','GPL','Hydrogène'];
const BOITES = ['Manuelle','Automatique'];
const TYPES_CARROSSERIE_UTILITAIRE = [
  'Fourgon', 'Fourgonnette', 'Camionnette bâchée', 'Plateau',
  'Benne', 'Frigorifique', 'Ampliroll', 'Autre'
];

const MAX_PHOTOS = 10;
const MAX_INPUT_SIZE = 50 * 1024 * 1024;

// Slugs des catégories utilitaires (véhicules de charge)
const SLUGS_UTILITAIRES = ['utilitaire'];
// Slugs des catégories véhicules de transport de personnes
const SLUGS_TRANSPORT = ['vtc','taxi','ambulance','tpmr','navette'];

type Category = { id: string; name: string; slug: string };

export default function EditAnnoncePage() {
  const router = useRouter();
  const params = useParams();
  const annonceId = params.id as string;
  const supabase = createClient();

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState('');
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCatSlug, setSelectedCatSlug] = useState('');
  const [originalStatus, setOriginalStatus] = useState('pending');

  // Photos existantes (URLs)
  const [existingPhotos, setExistingPhotos] = useState<string[]>([]);
  // Nouvelles photos (fichiers)
  const [newPhotos, setNewPhotos] = useState<{file: File, preview: string}[]>([]);

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

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = async () => {
    setLoadingData(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/auth/login'); return; }

      const [{ data: annonce }, { data: cats }] = await Promise.all([
        supabase.from('annonces').select('*').eq('id', annonceId).single(),
        supabase.from('categories').select('id, name, slug').order('sort_order'),
      ]);

      if (!annonce) { setError('Annonce introuvable'); setLoadingData(false); return; }
      if (annonce.user_id !== user.id) { setError('Accès refusé'); setLoadingData(false); return; }

      if (cats) setCategories(cats);

      setOriginalStatus(annonce.status || 'pending');
      setExistingPhotos(annonce.images || []);

      // Trouver le slug de la catégorie
      if (cats && annonce.category_id) {
        const cat = cats.find((c: Category) => c.id === annonce.category_id);
        setSelectedCatSlug(cat?.slug || '');
      }

      setForm({
        title: annonce.title || '',
        category_id: annonce.category_id || '',
        marque: annonce.marque || '',
        modele: annonce.modele || '',
        annee: annonce.annee != null ? String(annonce.annee) : '',
        kilometrage: annonce.kilometrage != null ? String(annonce.kilometrage) : '',
        price: annonce.price != null ? String(annonce.price) : '',
        carburant: annonce.carburant || '',
        boite: annonce.boite || '',
        couleur: annonce.couleur || '',
        description: annonce.description || '',
        ville: annonce.city || '',
        ptac: annonce.ptac != null ? String(annonce.ptac) : '',
        charge_utile: annonce.charge_utile != null ? String(annonce.charge_utile) : '',
        volume_utile: annonce.volume_utile != null ? String(annonce.volume_utile) : '',
        longueur_plateau: annonce.longueur_plateau != null ? String(annonce.longueur_plateau) : '',
        type_carrosserie: annonce.type_carrosserie || '',
        nb_essieux: annonce.nb_essieux != null ? String(annonce.nb_essieux) : '',
        nb_places: annonce.nb_places != null ? String(annonce.nb_places) : '',
        puissance_cv: annonce.puissance_cv != null ? String(annonce.puissance_cv) : '',
        norme_euro: annonce.norme_euro || '',
      });
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement');
    } finally {
      setLoadingData(false);
    }
  };

  const isUtilitaire = SLUGS_UTILITAIRES.includes(selectedCatSlug);
  const isTransport = SLUGS_TRANSPORT.includes(selectedCatSlug);

  const set = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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
    const totalPhotos = existingPhotos.length + newPhotos.length + files.length;
    if (totalPhotos > MAX_PHOTOS) {
      setError(`Maximum ${MAX_PHOTOS} photos au total`);
      return;
    }
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
    setNewPhotos((prev) => [
      ...prev,
      ...validFiles.map((file) => ({ file, preview: URL.createObjectURL(file) })),
    ]);
    if (e.target) e.target.value = '';
  };

  const removeExistingPhoto = (index: number) => {
    setExistingPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const removeNewPhoto = (index: number) => {
    setNewPhotos(prev => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const uploadNewPhotos = async (userId: string): Promise<string[]> => {
    setUploadingPhotos(true);
    const urls: string[] = [];
    try {
      for (let i = 0; i < newPhotos.length; i++) {
        const raw = newPhotos[i].file;

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
            // keep
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
          console.error('[edit-annonce] upload error:', upErr);
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
    const totalPhotos = existingPhotos.length + newPhotos.length;
    if (totalPhotos === 0) { setError('Ajoutez au moins une photo'); return; }
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setError('Connectez-vous pour modifier une annonce'); setLoading(false); return; }

      const newPhotoUrls = await uploadNewPhotos(user.id);
      const allPhotos = [...existingPhotos, ...newPhotoUrls];

      const annonceData: Record<string, unknown> = {
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
        images: allPhotos,
        // Conserver le statut d'origine — ne pas repasser en pending
        status: originalStatus,
      };

      // Champs utilitaires
      if (isUtilitaire) {
        annonceData.ptac = form.ptac ? +form.ptac : null;
        annonceData.charge_utile = form.charge_utile ? +form.charge_utile : null;
        annonceData.volume_utile = form.volume_utile ? +form.volume_utile : null;
        annonceData.longueur_plateau = form.longueur_plateau ? +form.longueur_plateau : null;
        annonceData.type_carrosserie = form.type_carrosserie || null;
        annonceData.nb_essieux = form.nb_essieux ? +form.nb_essieux : null;
      } else {
        // Effacer les champs utilitaires si la catégorie a changé
        annonceData.ptac = null;
        annonceData.charge_utile = null;
        annonceData.volume_utile = null;
        annonceData.longueur_plateau = null;
        annonceData.type_carrosserie = null;
        annonceData.nb_essieux = null;
      }

      // Champs transport personnes
      if (isTransport) {
        annonceData.nb_places = form.nb_places ? +form.nb_places : null;
      } else {
        annonceData.nb_places = null;
      }

      // Champs communs avancés
      annonceData.puissance_cv = form.puissance_cv ? +form.puissance_cv : null;
      annonceData.norme_euro = form.norme_euro || null;

      const { error: err } = await supabase
        .from('annonces')
        .update(annonceData)
        .eq('id', annonceId)
        .eq('user_id', user.id);

      if (err) { setError(err.message); return; }

      router.push('/dashboard?tab=annonces');
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = 'w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100 transition';
  const labelCls = 'block text-sm font-medium text-gray-700 mb-1';

  const totalPhotosCount = existingPhotos.length + newPhotos.length;

  if (loadingData) return (
    <div className="flex justify-center py-20">
      <div className="animate-spin h-10 w-10 border-b-2 border-blue-600 rounded-full" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-3xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Modifier l'annonce</h1>
          <p className="text-gray-500">Mettez à jour les informations de votre véhicule</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex gap-2.5 items-start">
            <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={18} />
            <p className="text-sm text-red-800">{error}</p>
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

          {/* ── Photos ── */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
              <ImageIcon size={18} className="text-blue-600" />
              Photos du véhicule
              <span className="text-sm font-normal text-gray-400">({totalPhotosCount}/{MAX_PHOTOS})</span>
            </h2>
            <p className="text-xs text-gray-400 mb-4">JPG, PNG, WEBP · Max 5 MB par photo · Au moins 1 photo obligatoire</p>

            {totalPhotosCount > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-4">
                {/* Photos existantes */}
                {existingPhotos.map((url, i) => (
                  <div key={`existing-${i}`} className="relative group aspect-square">
                    <img src={url} alt="" className="w-full h-full object-cover rounded-xl border border-gray-100" />
                    {i === 0 && newPhotos.length === 0 && (
                      <span className="absolute bottom-1 left-1 bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded font-medium">Principale</span>
                    )}
                    <button type="button" onClick={() => removeExistingPhoto(i)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition shadow">
                      <X size={10} />
                    </button>
                  </div>
                ))}
                {/* Nouvelles photos */}
                {newPhotos.map((photo, i) => (
                  <div key={`new-${i}`} className="relative group aspect-square">
                    <img src={photo.preview} alt="" className="w-full h-full object-cover rounded-xl border border-blue-200" />
                    {existingPhotos.length === 0 && i === 0 && (
                      <span className="absolute bottom-1 left-1 bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded font-medium">Principale</span>
                    )}
                    <span className="absolute bottom-1 right-1 bg-green-500 text-white text-[9px] px-1 py-0.5 rounded font-medium">Nouvelle</span>
                    <button type="button" onClick={() => removeNewPhoto(i)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition shadow">
                      <X size={10} />
                    </button>
                  </div>
                ))}
                {totalPhotosCount < MAX_PHOTOS && (
                  <label className="aspect-square border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition">
                    <span className="text-2xl text-gray-300 hover:text-blue-400">+</span>
                    <input type="file" accept="image/*" multiple onChange={handlePhotosChange} className="hidden" />
                  </label>
                )}
              </div>
            )}

            {totalPhotosCount === 0 && (
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
            {loading ? (uploadingPhotos ? 'Upload des photos...' : 'Mise à jour en cours...') : 'Mettre à jour l\'annonce'}
          </button>
        </form>
      </div>
    </div>
  );
}
