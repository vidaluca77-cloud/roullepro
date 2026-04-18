import Link from 'next/link';
import type { Metadata } from 'next';
import {
  Search, MessageSquare, ShieldCheck, Users,
  UserPlus, FileText, Bell, LayoutDashboard,
} from 'lucide-react';
import FaqAccordion from './FaqAccordion';

export const metadata: Metadata = {
  title: 'Comment ca marche — RoullePro',
  description: 'Decouvrez comment fonctionne RoullePro, la marketplace B2B pour les professionnels du transport routier.',
};

const BUYER_STEPS = [
  {
    icon: Search,
    title: 'Parcourez les annonces',
    description: "Naviguez par categorie (VTC, Taxi, Ambulance, TPMR, Navette...) et utilisez les filtres avances pour trouver le vehicule ideal.",
  },
  {
    icon: MessageSquare,
    title: 'Contactez le vendeur',
    description: "Envoyez un message via la messagerie integree, sans partager votre email. La conversation est conservee dans votre dashboard.",
  },
  {
    icon: ShieldCheck,
    title: 'Verifiez le profil vendeur',
    description: "Consultez le badge Vendeur verifie KBIS et les avis laisses par d'autres professionnels pour acheter en toute confiance.",
  },
  {
    icon: Users,
    title: 'Finalisez la transaction',
    description: "Convenez des modalites directement avec le vendeur. La transaction se conclut en dehors de la plateforme, entre professionnels.",
  },
];

const SELLER_STEPS = [
  {
    icon: UserPlus,
    title: 'Creez votre compte professionnel',
    description: "L'inscription est rapide. Un KBIS valide est obligatoire pour garantir un environnement 100% professionnel.",
  },
  {
    icon: FileText,
    title: 'Deposez votre annonce gratuitement',
    description: "Ajoutez jusqu'a 10 photos, une description detaillee, le prix et les caracteristiques techniques. Entierement gratuit.",
  },
  {
    icon: Bell,
    title: 'Recevez des messages qualifies',
    description: "Soyez notifie par email a chaque nouveau message d'un acheteur professionnel. Repondez directement depuis le dashboard.",
  },
  {
    icon: LayoutDashboard,
    title: 'Gerez vos annonces',
    description: "Modifiez, suspendez ou marquez vos annonces comme vendues depuis votre dashboard. Consultez les vues en temps reel.",
  },
];

const ADVANTAGES = [
  { value: '100%', label: 'Gratuit pour les vendeurs', desc: "Aucun frais de depot, aucune commission sur la vente." },
  { value: 'B2B', label: 'Professionnels uniquement', desc: "Chaque compte est verifie via le registre national des entreprises." },
  { value: '24h', label: 'Moderation rapide', desc: "Vos annonces sont verifiees et publiees sous 24 heures." },
];

export default function CommentCaMarchePage() {
  return (
    <div className="min-h-screen bg-white">

      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-900 via-blue-950 to-blue-900 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-extrabold mb-4">Comment ca marche ?</h1>
          <p className="text-blue-200 text-xl max-w-2xl mx-auto">
            RoullePro est la premiere marketplace B2B dediee aux professionnels du transport routier.
            Simple, gratuit, securise.
          </p>
        </div>
      </section>

      {/* Acheteurs */}
      <section className="py-20 max-w-5xl mx-auto px-4">
        <div className="text-center mb-12">
          <span className="inline-block bg-blue-100 text-blue-700 text-sm font-semibold px-4 py-1.5 rounded-full mb-3">Pour les acheteurs</span>
          <h2 className="text-3xl font-bold text-gray-900">Trouvez votre vehicule professionnel</h2>
        </div>
        <div className="grid md:grid-cols-4 gap-6">
          {BUYER_STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={i} className="text-center">
                <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Icon size={24} className="text-blue-600" />
                </div>
                <div className="text-xs font-bold text-blue-600 mb-1">Etape {i + 1}</div>
                <h3 className="font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-sm text-gray-500">{step.description}</p>
              </div>
            );
          })}
        </div>
        <div className="text-center mt-10">
          <Link href="/annonces" className="inline-block bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 transition">
            Parcourir les annonces
          </Link>
        </div>
      </section>

      {/* Vendeurs */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <span className="inline-block bg-green-100 text-green-700 text-sm font-semibold px-4 py-1.5 rounded-full mb-3">Pour les vendeurs</span>
            <h2 className="text-3xl font-bold text-gray-900">Vendez rapidement entre pros</h2>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {SELLER_STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={i} className="text-center">
                  <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Icon size={24} className="text-green-600" />
                  </div>
                  <div className="text-xs font-bold text-green-600 mb-1">Etape {i + 1}</div>
                  <h3 className="font-bold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-500">{step.description}</p>
                </div>
              );
            })}
          </div>
          <div className="text-center mt-10">
            <Link href="/deposer-annonce" className="inline-block bg-green-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-green-700 transition">
              Deposer une annonce
            </Link>
          </div>
        </div>
      </section>

      {/* Avantages */}
      <section className="py-20 max-w-5xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">Pourquoi choisir RoullePro ?</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {ADVANTAGES.map((adv, i) => (
            <div key={i} className="bg-white border border-gray-100 rounded-2xl p-8 text-center shadow-sm">
              <div className="text-4xl font-extrabold text-blue-600 mb-2">{adv.value}</div>
              <h3 className="font-bold text-gray-900 mb-2">{adv.label}</h3>
              <p className="text-sm text-gray-500">{adv.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Questions frequentes</h2>
          </div>
          <FaqAccordion />
        </div>
      </section>

      {/* CTA final */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Pret a commencer ?</h2>
          <p className="text-gray-500 mb-8">Rejoignez les professionnels du transport routier sur RoullePro.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register" className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 transition">
              Creer mon compte
            </Link>
            <Link href="/annonces" className="border-2 border-blue-600 text-blue-600 px-8 py-3 rounded-xl font-semibold hover:bg-blue-50 transition">
              Voir les annonces
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
