import Link from 'next/link';
import { Search, Shield, Users, TrendingUp } from 'lucide-react';

const categories = [
  { name: 'VTC', slug: 'vtc', icon: '🚗', color: 'bg-blue-50 border-blue-200 text-blue-700' },
  { name: 'Taxi', slug: 'taxi', icon: '🚕', color: 'bg-yellow-50 border-yellow-200 text-yellow-700' },
  { name: 'Ambulance / VSL', slug: 'ambulance', icon: '🚑', color: 'bg-red-50 border-red-200 text-red-700' },
  { name: 'TPMR / PMR', slug: 'tpmr', icon: '♿', color: 'bg-green-50 border-green-200 text-green-700' },
  { name: 'Navette / Minibus', slug: 'navette', icon: '🚌', color: 'bg-purple-50 border-purple-200 text-purple-700' },
  { name: 'Matériel', slug: 'materiel', icon: '🔧', color: 'bg-gray-50 border-gray-200 text-gray-700' },
];

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-20 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            La plateforme des pros du transport
          </h1>
          <p className="text-xl text-blue-100 mb-8">
            Achetez et vendez vos véhicules VTC, Taxi, Ambulance, TPMR gratuitement
          </p>

          {/* Formulaire de recherche — passe ?q= dans l'URL sans JS */}
          <form
            action="/annonces"
            method="get"
            className="flex gap-4 max-w-2xl mx-auto"
          >
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3.5 text-gray-400" size={20} />
              <input
                type="text"
                name="q"
                placeholder="Rechercher un véhicule..."
                className="w-full pl-10 pr-4 py-3 rounded-lg text-gray-900 text-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
            <button
              type="submit"
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold whitespace-nowrap transition"
            >
              Rechercher
            </button>
          </form>

          <div className="mt-6">
            <Link
              href="/deposer-annonce"
              className="bg-white text-blue-700 hover:bg-blue-50 px-8 py-3 rounded-lg font-bold text-lg inline-block transition"
            >
              Déposer une annonce gratuite
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-b">
        <div className="max-w-5xl mx-auto py-8 px-4 grid grid-cols-3 gap-6 text-center">
          <div>
            <div className="text-3xl font-bold text-blue-600">100%</div>
            <div className="text-gray-600 text-sm">Dépôt gratuit</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-blue-600">6</div>
            <div className="text-gray-600 text-sm">Catégories métier</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-blue-600">Pro</div>
            <div className="text-gray-600 text-sm">Vendeurs vérifiés</div>
          </div>
        </div>
      </section>

      {/* Catégories */}
      <section className="max-w-5xl mx-auto py-12 px-4">
        <h2 className="text-2xl font-bold mb-6 text-center">Parcourir par catégorie</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/annonces?categorie=${cat.slug}`}
              className={`border-2 rounded-xl p-4 text-center hover:shadow-md transition-all ${cat.color}`}
            >
              <div className="text-3xl mb-2">{cat.icon}</div>
              <div className="font-semibold text-sm">{cat.name}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* Avantages */}
      <section className="bg-gray-50 py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold mb-8 text-center">Pourquoi RoullePro ?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm text-center">
              <Shield className="mx-auto mb-3 text-blue-600" size={32} />
              <h3 className="font-bold mb-2">Vendeurs vérifiés</h3>
              <p className="text-gray-600 text-sm">Chaque vendeur est vérifié avec SIRET / KBIS</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm text-center">
              <TrendingUp className="mx-auto mb-3 text-green-600" size={32} />
              <h3 className="font-bold mb-2">Dépôt 100% gratuit</h3>
              <p className="text-gray-600 text-sm">Publiez vos annonces sans frais</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm text-center">
              <Users className="mx-auto mb-3 text-purple-600" size={32} />
              <h3 className="font-bold mb-2">Communauté pro</h3>
              <p className="text-gray-600 text-sm">Uniquement des professionnels du transport</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-blue-600 text-white py-12 px-4 text-center">
        <h2 className="text-2xl font-bold mb-4">Vous avez un véhicule à vendre ?</h2>
        <p className="text-blue-100 mb-6">Déposez votre annonce gratuitement en 5 minutes</p>
        <Link
          href="/deposer-annonce"
          className="bg-white text-blue-700 hover:bg-blue-50 px-8 py-3 rounded-lg font-bold text-lg inline-block transition"
        >
          Déposer une annonce
        </Link>
      </section>
    </div>
  );
}
