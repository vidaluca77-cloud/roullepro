'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Calculator, AlertCircle } from 'lucide-react';
import EstimationCard from '@/components/depot/EstimationCard';

interface EstimationResult {
  estimation_min: number;
  estimation_max: number;
  estimation_centrale?: number;
  categorie?: string;
  confiance?: 'haute' | 'moyenne' | 'basse';
  depot_id: string | null;
}

export default function EstimerPage() {
  const [formData, setFormData] = useState({
    immatriculation: '',
    marque: '',
    modele: '',
    annee: '',
    kilometrage: '',
    etat_general: 'moyen',
    email: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<EstimationResult | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/depot-vente/estimer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          immatriculation: formData.immatriculation,
          marque: formData.marque,
          modele: formData.modele,
          annee: Number(formData.annee),
          kilometrage: Number(formData.kilometrage),
          etat_general: formData.etat_general,
          email: formData.email,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Une erreur est survenue. Réessayez.");
        return;
      }

      setResult(data);
    } catch {
      setError("Erreur de connexion. Vérifiez votre réseau et réessayez.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
            <Calculator size={14} /> Estimation gratuite
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-3">
            Estimez la valeur de votre véhicule
          </h1>
          <p className="text-slate-500 text-lg max-w-xl mx-auto">
            Renseignez les informations ci-dessous pour obtenir une fourchette de prix instantanée.
            Gratuit et sans engagement.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-start">
          {/* Formulaire */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-md p-8">
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="marque" className="block text-sm font-medium text-slate-700 mb-1">
                    Marque
                  </label>
                  <input
                    id="marque"
                    name="marque"
                    type="text"
                    placeholder="Ex : Mercedes"
                    value={formData.marque}
                    onChange={handleChange}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-slate-400"
                  />
                </div>
                <div>
                  <label htmlFor="modele" className="block text-sm font-medium text-slate-700 mb-1">
                    Modèle
                  </label>
                  <input
                    id="modele"
                    name="modele"
                    type="text"
                    placeholder="Ex : Sprinter"
                    value={formData.modele}
                    onChange={handleChange}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-slate-400"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="immatriculation" className="block text-sm font-medium text-slate-700 mb-1">
                  Immatriculation
                </label>
                <input
                  id="immatriculation"
                  name="immatriculation"
                  type="text"
                  placeholder="Ex : AB-123-CD"
                  value={formData.immatriculation}
                  onChange={handleChange}
                  pattern="[A-Za-z]{2}-?[0-9]{3}-?[A-Za-z]{2}"
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-slate-400 uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="annee" className="block text-sm font-medium text-slate-700 mb-1">
                    Année <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="annee"
                    name="annee"
                    type="number"
                    placeholder="2019"
                    min="1990"
                    max={new Date().getFullYear()}
                    required
                    value={formData.annee}
                    onChange={handleChange}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-slate-400"
                  />
                </div>
                <div>
                  <label htmlFor="kilometrage" className="block text-sm font-medium text-slate-700 mb-1">
                    Kilométrage <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="kilometrage"
                    name="kilometrage"
                    type="number"
                    placeholder="150000"
                    min="0"
                    required
                    value={formData.kilometrage}
                    onChange={handleChange}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-slate-400"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="etat_general" className="block text-sm font-medium text-slate-700 mb-1">
                  État général <span className="text-red-500">*</span>
                </label>
                <select
                  id="etat_general"
                  name="etat_general"
                  required
                  value={formData.etat_general}
                  onChange={handleChange}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  <option value="bon">Bon état</option>
                  <option value="moyen">État moyen</option>
                  <option value="a_revoir">À revoir</option>
                </select>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                  Email <span className="text-slate-400 text-xs">(pour recevoir l'estimation)</span>
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="vous@entreprise.fr"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-slate-400"
                />
              </div>

              {error && (
                <div className="flex items-start gap-2 text-red-600 bg-red-50 border border-red-100 rounded-xl p-3 text-sm">
                  <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3.5 rounded-xl transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Calcul en cours...
                  </span>
                ) : (
                  <>
                    Obtenir mon estimation
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Résultat / panneau droit */}
          <div className="space-y-6">
            {result ? (
              <>
                <EstimationCard
                  min={result.estimation_min}
                  max={result.estimation_max}
                  centrale={result.estimation_centrale}
                  categorie={result.categorie}
                  confiance={result.confiance}
                  marque={formData.marque}
                  modele={formData.modele}
                  annee={formData.annee ? Number(formData.annee) : undefined}
                />
                <Link
                  href={`/depot-vente/garages${result.depot_id ? '?estimation=' + result.depot_id : ''}`}
                  className="flex items-center justify-center gap-2 w-full bg-white border-2 border-blue-600 text-blue-700 hover:bg-blue-50 font-bold py-3.5 rounded-xl transition"
                >
                  Trouver un garage partenaire
                  <ArrowRight size={18} />
                </Link>
              </>
            ) : (
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-8 text-white">
                <h3 className="font-bold text-xl mb-6">Pourquoi choisir le dépôt-vente ?</h3>
                <ul className="space-y-4">
                  {[
                    "Économisez des semaines de visites et de négociations",
                    "Obtenez un meilleur prix grâce à notre réseau acheteurs B2B",
                    "Contrat tripartite sécurisé — aucun risque d'arnaque",
                    "Si pas vendu en 90j, vous reprenez votre véhicule sans frais",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm">
                      <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <div className="w-2 h-2 rounded-full bg-white" />
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
