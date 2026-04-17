'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Truck, AlertCircle } from 'lucide-react';

export default function RegisterPage() {
  const supabase = createClient();
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '', full_name: '', phone: '', company_name: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const set = (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { data, error: authErr } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    });

    if (authErr) {
      setError(authErr.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        email: form.email,
        full_name: form.full_name,
        phone: form.phone,
        company_name: form.company_name,
      });
    }

    setSuccess(true);
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-xl shadow-sm p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Compte créé !</h2>
          <p className="text-gray-600 mb-6">
            Vérifiez votre email <strong>{form.email}</strong> pour confirmer votre inscription.
          </p>
          <Link href="/auth/login" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium">
            Se connecter
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-xl shadow-sm p-8 max-w-md w-full">
        <div className="flex items-center gap-3 mb-8">
          <Truck className="h-8 w-8 text-blue-600" />
          <span className="text-xl font-bold text-blue-600">RoullePro</span>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Créer un compte</h1>
        <p className="text-gray-600 mb-6">Rejoignez la marketplace des pros du transport</p>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex gap-2 items-start">
            <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={18} />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet *</label>
            <input
              type="text"
              name="full_name"
              value={form.full_name}
              onChange={set}
              required
              placeholder="Jean Dupont"
              className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={set}
              required
              placeholder="jean@exemple.fr"
              className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe *</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={set}
              required
              minLength={6}
              placeholder="Minimum 6 caractères"
              className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={set}
              placeholder="06 12 34 56 78"
              className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Entreprise</label>
            <input
              type="text"
              name="company_name"
              value={form.company_name}
              onChange={set}
              placeholder="Nom de votre société"
              className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition disabled:opacity-50 mt-2"
          >
            {loading ? 'Création du compte...' : "S'inscrire gratuitement"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          Déjà un compte ?{' '}
          <Link href="/auth/login" className="text-blue-600 hover:underline font-medium">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
