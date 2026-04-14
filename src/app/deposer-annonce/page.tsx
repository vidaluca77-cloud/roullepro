'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { AlertCircle, Upload, Image as ImageIcon, FileText, X } from 'lucide-react';

const ENERGIES = ['Essence','Diesel','Hybride','Electrique','GPL'];
const BOITES = ['Manuelle','Automatique'];

const MAX_PHOTOS = 10;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

type Category = { id: string; name: string; slug: string };

export default function DeposerAnnoncePage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<{file: File, preview: string}[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
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
    ville: ''
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    const { data } = await supabase.from('categories').select('id, name, slug').order('name');
    if (data) setCategories(data);
  };

  const set = (e: React.ChangeEvent<any>) => setForm({...form, [e.target.name]: e.target.value});

  const handlePhotosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setError('');

    // Validation nombre de fichiers
    if (photoPreview.length + files.length > MAX_PHOTOS) {
      setError(`Vous ne pouvez ajouter que ${MAX_PHOTOS} photos maximum`);
      return;
    }

    // Validation type et taille
    const invalidFiles = files.filter(
      f => !ALLOWED_IMAGE_TYPES.includes(f.type) || f.size > MAX_FILE_SIZE
    );

    if (invalidFiles.length > 0) {
      setError('Certains fichiers sont invalides (formats acceptés: JPG, PNG, WEBP; taille max: 5MB)');
      return;
    }

    // Créer previews
    const newPreviews = files.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));

    setPhotoPreview([...photoPreview, ...newPreviews]);
  };

  const removePhoto = (index: number) => {
    const newPreviews = [...photoPreview];
    URL.revokeObjectURL(newPreviews[index].preview);
    newPreviews.splice(index, 1);
    setPhotoPreview(newPreviews);
  };

  const uploadPhotos = async (userId: string): Promise<string[]> => {
    if (photoPreview.length === 0) return [];

    setUploadingPhotos(true);
    const uploadedUrls: string[] = [];

    try {
      for (const {file} of photoPreview) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${userId}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { data, error } = await supabase.storage
          .from('annonces-photos')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (error) throw error;

        // Récupérer l'URL publique
        const { data: { publicUrl } } = supabase.storage
          .from('annonces-photos')
          .getPublicUrl(data.path);

        uploadedUrls.push(publicUrl);
      }
    } catch (err: any) {
      console.error('Erreur upload photos:', err);
      throw new Error('Échec de l\'upload des photos: ' + err.message);
    } finally {
      setUploadingPhotos(false);
    }

    return uploadedUrls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('Connectez-vous pour déposer une annonce.');
        setLoading(false);
        return;
      }

      // Upload des photos
      let photoUrls: string[] = [];
      if (photoPreview.length > 0) {
        photoUrls = await uploadPhotos(user.id);
      }

      // Insertion de l'annonce avec les BONS noms de colonnes
      const { error: err } = await supabase.from('annonces').insert({
        titre: form.title, // DB: titre
        category_id: form.category_id,
        marque: form.marque,
        modele: form.modele,
        annee: form.annee ? +form.annee : null,
        kilometrage: form.kilometrage ? +form.kilometrage : null,
        prix: form.price ? +form.price : null, // DB: prix
        carburant: form.carburant || null,
        boite: form.boite || null,
        couleur: form.couleur,
        description: form.description,
        ville: form.ville,
        photos: photoUrls, // DB: photos (text[])
        user_id: user.id,
        statut: 'active'
      });

      if (err) {
        console.error('Erreur insertion:', err);
        setError(err.message);
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const field = (label: string, name: string, type = 'text', placeholder = '') => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        name={name}
        type={type}
        value={(form as any)[name]}
        onChange={set}
        placeholder={placeholder}
        className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-2">Déposer une annonce</h1>
        <p className="text-gray-600 mb-6">Gratuit - En 5 minutes</p>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex gap-2 items-start">
            <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Titre *</label>
              <input
                name="title"
                value={form.title}
                onChange={set}
                required
                placeholder="Ex: Mercedes Vito VTC 2020"
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie *</label>
              <select
                name="category_id"
                value={form.category_id}
                onChange={set}
                required
                className="w-full border rounded-lg px-3 py-2 text-sm"
              >
                <option value="">Choisir une catégorie</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            {field('Marque', 'marque', 'text', 'Mercedes...')}
            {field('Modèle', 'modele', 'text', 'Classe E...')}
            {field('Année', 'annee', 'number', '2020')}
            {field('Kilométrage', 'kilometrage', 'number', '150000')}
            {field('Prix (EUR)', 'price', 'number', '15000')}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Énergie</label>
              <select
                name="carburant"
                value={form.carburant}
                onChange={set}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              >
                <option value="">Choisir</option>
                {ENERGIES.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Boîte de vitesse</label>
              <select
                name="boite"
                value={form.boite}
                onChange={set}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              >
                <option value="">Choisir</option>
                {BOITES.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>

            {field('Couleur', 'couleur', 'text', 'Blanc...')}
            {field('Ville', 'ville', 'text', 'Paris')}

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={set}
                rows={5}
                placeholder="Décrivez votre véhicule..."
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <ImageIcon size={18} />
                Photos du véhicule ({photoPreview.length}/{MAX_PHOTOS})
              </label>

              {photoPreview.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-3">
                  {photoPreview.map((photo, i) => (
                    <div key={i} className="relative group">
                      <img
                        src={photo.preview}
                        alt={`Preview ${i+1}`}
                        className="w-full h-20 object-cover rounded border"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(i)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {photoPreview.length < MAX_PHOTOS && (
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotosChange}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
              )}
              <p className="text-xs text-gray-500 mt-1">
                Formats: JPG, PNG, WEBP • Taille max: 5MB par photo • Max {MAX_PHOTOS} photos
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || uploadingPhotos}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium transition disabled:opacity-50 mt-6"
          >
            {loading ? (uploadingPhotos ? 'Upload photos...' : 'Publication...') : 'Publier gratuitement'}
          </button>
        </form>
      </div>
    </div>
  );
}
