'use client';
import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Truck, AlertCircle } from 'lucide-react';

export default function RegisterPage() {
  const supabase = createClient();
  const [form, setForm] = useState({ email:'', password:'', nom:'', prenom:'', telephone:'', entreprise:'' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const set = (e: React.ChangeEvent<HTMLInputElement>) => setForm({...form, [e.target.name]: e.target.value});

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true);
    const { data, error: authErr } = await supabase.auth.signUp({ email: form.email, password: form.password });
    if (authErr) { setError(authErr.message); setLoading(false); return; }
    if (data.user) {
      await supabase.from('profiles').upsert({ id: data.user.id, email: form.email, nom: form.nom, prenom: form.prenom, telephone: form.telephone, entreprise: form.entreprise });
    }
    setSuccess(true); setLoading(false);
  };

  if (success) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-green-600">Inscription reussie !</h2>
        <p className="text-gray-500 mt-2">Verifiez votre email pour confirmer votre compte.</p>
        <Link href="/auth/login" className="mt-4 inline-block text-blue-600">Se connecter</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="flex justify-center gap-2 mb-2"><Truck className="text-blue-600" size={32}/><span className="text-2xl font-bold text-blue-600">RoullePro</span></div>
          <h1 className="text-2xl font-bold">Inscription</h1>
        </div>
        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 flex gap-2"><AlertCircle size={18}/>{error}</div>}
        <form onSubmit={handleRegister} className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Prenom</label><input name="prenom" value={form.prenom} onChange={set} required className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Nom</label><input name="nom" value={form.nom} onChange={set} required className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
          </div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Email *</label><input name="email" type="email" value={form.email} onChange={set} required placeholder="votre@email.fr" className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe *</label><input name="password" type="password" value={form.password} onChange={set} required minLength={6} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Telephone</label><input name="telephone" value={form.telephone} onChange={set} placeholder="06 00 00 00 00" className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Entreprise</label><input name="entreprise" value={form.entreprise} onChange={set} placeholder="Nom de votre societe" className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50">{loading ? 'Inscription...' : 'Creer mon compte'}</button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-4">Deja un compte ? <Link href="/auth/login" className="text-blue-600 font-medium">Se connecter</Link></p>
      </div>
    </div>
  );
}
