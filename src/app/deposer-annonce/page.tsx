'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { AlertCircle } from 'lucide-react';

const CATEGORIES = ['vtc','taxi','ambulance','transport-scolaire','utilitaire','autre'];
const ENERGIES = ['Essence','Diesel','Hybride','Electrique','GPL'];
const BOITES = ['Manuelle','Automatique'];

export default function DeposerAnnoncePage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ titre:'', categorie:'vtc', marque:'', modele:'', annee:'', kilometrage:'', prix:'', energie:'', boite_vitesse:'', couleur:'', description:'', ville:'' });

  const set = (e: React.ChangeEvent<any>) => setForm({...form, [e.target.name]: e.target.value});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setError('Connectez-vous pour deposer une annonce.'); setLoading(false); return; }
    const { error: err } = await supabase.from('annonces').insert({ ...form, annee: form.annee ? +form.annee : null, kilometrage: form.kilometrage ? +form.kilometrage : null, prix: form.prix ? +form.prix : null, user_id: user.id, statut: 'active' });
    if (err) setError(err.message); else router.push('/dashboard');
    setLoading(false);
  };

  const field = (label: string, name: string, type = 'text', placeholder = '') => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input name={name} type={type} value={(form as any)[name]} onChange={set} placeholder={placeholder} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-blue-600 text-white py-10 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold">Deposer une annonce</h1>
          <p className="text-blue-100 mt-1">Gratuit - En 5 minutes</p>
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-4 py-8">
        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 flex gap-2"><AlertCircle size={18}/>{error}</div>}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Titre *</label>
              <input name="titre" value={form.titre} onChange={set} required placeholder="Ex: Mercedes Vito VTC 2020" className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categorie *</label>
              <select name="categorie" value={form.categorie} onChange={set} className="w-full border rounded-lg px-3 py-2 text-sm">
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            {field('Marque','marque','text','Mercedes...')}
            {field('Modele','modele','text','Classe E...')}
            {field('Annee','annee','number','2020')}
            {field('Kilometrage','kilometrage','number','150000')}
            {field('Prix (EUR)','prix','number','15000')}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Energie</label>
              <select name="energie" value={form.energie} onChange={set} className="w-full border rounded-lg px-3 py-2 text-sm">
                <option value="">Choisir</option>
                {ENERGIES.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Boite de vitesse</label>
              <select name="boite_vitesse" value={form.boite_vitesse} onChange={set} className="w-full border rounded-lg px-3 py-2 text-sm">
                <option value="">Choisir</option>
                {BOITES.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            {field('Couleur','couleur','text','Blanc...')}
            {field('Ville','ville','text','Paris')}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea name="description" value={form.description} onChange={set} rows={4} placeholder="Decrivez votre vehicule..." className="w-full border rounded-lg px-3 py-2 text-sm"></textarea>
            </div>
          </div>
          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50">
            {loading ? 'Publication...' : 'Publier gratuitement'}
          </button>
        </form>
      </div>
    </div>
  );
}
