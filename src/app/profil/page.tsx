'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { User, Mail, Phone, MapPin, Building, AlertCircle } from 'lucide-react';

export default function ProfilPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState({
    full_name: '',
    phone: '',
    ville: '',
    entreprise: '',
    siret: ''
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/auth/login');
      return;
    }
    setUser(user);

    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (data) {
      setProfile({
        full_name: data.full_name || '',
        phone: data.phone || '',
        ville: data.ville || '',
        entreprise: data.entreprise || '',
        siret: data.siret || ''
      });
    }
    setLoading(false);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setUpdating(true);

    const { error: err } = await supabase
      .from('profiles')
      .update(profile)
      .eq('id', user.id);

    if (err) {
      setError(err.message);
    } else {
      setSuccess('Profil mis a jour avec succes !');
      setTimeout(() => setSuccess(''), 3000);
    }
    setUpdating(false);
  };

  const set = (e: React.ChangeEvent<HTMLInputElement>) => 
    setProfile({...profile, [e.target.name]: e.target.value});

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Mon profil</h1>
          <p className="text-gray-600 mb-8">{user?.email}</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex gap-2">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
              {success}
            </div>
          )}

          <form onSubmit={handleUpdate} className="space-y-6">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <User size={16} /> Nom complet
              </label>
              <input
                type="text"
                name="full_name"
                value={profile.full_name}
                onChange={set}
                placeholder="Votre nom et prenom"
                className="w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Phone size={16} /> Telephone
              </label>
              <input
                type="tel"
                name="phone"
                value={profile.phone}
                onChange={set}
                placeholder="06 12 34 56 78"
                className="w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <MapPin size={16} /> Ville
              </label>
              <input
                type="text"
                name="ville"
                value={profile.ville}
                onChange={set}
                placeholder="Paris"
                className="w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Building size={16} /> Entreprise
              </label>
              <input
                type="text"
                name="entreprise"
                value={profile.entreprise}
                onChange={set}
                placeholder="Nom de votre entreprise"
                className="w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Building size={16} /> SIRET
              </label>
              <input
                type="text"
                name="siret"
                value={profile.siret}
                onChange={set}
                placeholder="123 456 789 00012"
                className="w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={updating}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium transition disabled:opacity-50"
              >
                {updating ? 'Enregistrement...' : 'Enregistrer les modifications'}
              </button>
              <button
                type="button"
                onClick={() => router.push('/dashboard')}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
