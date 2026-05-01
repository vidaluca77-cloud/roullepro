'use client';
import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Truck, AlertCircle } from 'lucide-react';

export default function RegisterPage() {
  const supabase = createClient();
  const [form, setForm] = useState({
    email: '',
    password: '',
    full_name: '',
    phone: '',
    company_name: '',
    // Champs pro (optionnels, visibles uniquement si is_pro=true)
    is_pro: false,
    categorie: '' as '' | 'taxi_conventionne' | 'ambulance' | 'vsl',
    siret: '',
    ville: '',
    code_postal: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const set = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation cote client si pro
    if (form.is_pro) {
      if (!form.categorie) { setError('Veuillez choisir votre catégorie professionnelle.'); return; }
      if (!form.siret || form.siret.replace(/\s/g, '').length !== 14) {
        setError('Le SIRET doit comporter 14 chiffres.');
        return;
      }
      if (!form.ville.trim()) { setError('Veuillez indiquer la ville d\'exercice.'); return; }
    }

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
        company_name: form.company_name || (form.is_pro ? form.company_name : null),
      });

      // Si pro, on enregistre la pre-inscription pour traitement admin
      if (form.is_pro) {
        await supabase.from('pros_pre_inscription').insert({
          user_id: data.user.id,
          email: form.email,
          full_name: form.full_name,
          telephone: form.phone || null,
          raison_sociale: form.company_name || null,
          siret: form.siret.replace(/\s/g, ''),
          ville: form.ville.trim().toUpperCase(),
          code_postal: form.code_postal.trim() || null,
          categorie: form.categorie,
          statut: 'en_attente',
        });
      }

      // Email de bienvenue (non-bloquant : fire-and-forget)
      fetch('/api/welcome-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email,
          full_name: form.full_name,
          is_pro: form.is_pro,
        }),
      }).catch((err) => {
        console.error('[register] welcome email failed:', err);
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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Compte créé</h2>
          {form.is_pro ? (
            <p className="text-gray-600 mb-6">
              Vérifiez votre email <strong>{form.email}</strong> pour confirmer votre inscription.
              Notre équipe va créer votre fiche professionnelle sous 24 h ouvrées et vous recevrez un email de confirmation.
            </p>
          ) : (
            <p className="text-gray-600 mb-6">
              Vérifiez votre email <strong>{form.email}</strong> pour confirmer votre inscription.
            </p>
          )}
          <Link href="/auth/login" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium">
            Se connecter
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
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
          {/* Toggle pro/particulier */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_pro}
                onChange={(e) => setForm({ ...form, is_pro: e.target.checked })}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Je suis un professionnel du transport
                </p>
                <p className="text-xs text-gray-600 mt-0.5">
                  Taxi conventionné, ambulance ou VSL — votre fiche sera créée par notre équipe.
                </p>
              </div>
            </label>
          </div>

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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Téléphone {form.is_pro && '*'}
            </label>
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={set}
              required={form.is_pro}
              placeholder="06 12 34 56 78"
              className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {form.is_pro ? 'Raison sociale / Nom de l\'entreprise *' : 'Entreprise'}
            </label>
            <input
              type="text"
              name="company_name"
              value={form.company_name}
              onChange={set}
              required={form.is_pro}
              placeholder={form.is_pro ? 'TAXI MULOT, AMBULANCES DUPONT…' : 'Nom de votre société'}
              className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Champs pro conditionnels */}
          {form.is_pro && (
            <div className="space-y-4 bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-xs text-amber-900 font-medium">
                Informations professionnelles
              </p>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Catégorie *
                </label>
                <select
                  name="categorie"
                  value={form.categorie}
                  onChange={set}
                  required
                  className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500 bg-white"
                >
                  <option value="">Sélectionnez votre activité</option>
                  <option value="taxi_conventionne">Taxi conventionné CPAM</option>
                  <option value="ambulance">Ambulance</option>
                  <option value="vsl">VSL (Véhicule Sanitaire Léger)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">SIRET *</label>
                <input
                  type="text"
                  name="siret"
                  value={form.siret}
                  onChange={set}
                  required
                  placeholder="14 chiffres (ex. 93005282400024)"
                  pattern="[0-9\s]{14,17}"
                  className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ville *</label>
                  <input
                    type="text"
                    name="ville"
                    value={form.ville}
                    onChange={set}
                    required
                    placeholder="Massangis"
                    className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CP</label>
                  <input
                    type="text"
                    name="code_postal"
                    value={form.code_postal}
                    onChange={set}
                    placeholder="89440"
                    pattern="[0-9]{5}"
                    className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <p className="text-xs text-amber-800">
                Notre équipe créera votre fiche sous 24 h ouvrées et vous enverra un email de confirmation.
              </p>
            </div>
          )}

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
