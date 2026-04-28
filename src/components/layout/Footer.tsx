import Link from 'next/link';
import Image from 'next/image';
import { Mail, MapPin, Phone } from 'lucide-react';
import PhoneLink from './PhoneLink';

// Top 20 villes par nombre de pros — sert de hub SEO global
const TOP_VILLES_SEO: { ville: string; slug: string }[] = [
  { ville: 'Marseille', slug: 'marseille' },
  { ville: 'Paris', slug: 'paris' },
  { ville: 'Nice', slug: 'nice' },
  { ville: 'Strasbourg', slug: 'strasbourg' },
  { ville: 'Lyon', slug: 'lyon' },
  { ville: 'Toulouse', slug: 'toulouse' },
  { ville: 'Montpellier', slug: 'montpellier' },
  { ville: 'Nantes', slug: 'nantes' },
  { ville: 'Bordeaux', slug: 'bordeaux' },
  { ville: 'Lille', slug: 'lille' },
  { ville: 'Reims', slug: 'reims' },
  { ville: 'Rennes', slug: 'rennes' },
  { ville: 'Caen', slug: 'caen' },
  { ville: 'Rouen', slug: 'rouen' },
  { ville: 'Brest', slug: 'brest' },
  { ville: 'Avignon', slug: 'avignon' },
  { ville: 'Nîmes', slug: 'nimes' },
  { ville: 'Clermont-Ferrand', slug: 'clermont-ferrand' },
  { ville: 'Amiens', slug: 'amiens' },
  { ville: 'Villeurbanne', slug: 'villeurbanne' },
];

// Départements clés (les plus peuplés + outre-mer)
const TOP_DEPARTEMENTS_SEO: { code: string; nom: string }[] = [
  { code: '75', nom: 'Paris' },
  { code: '13', nom: 'Bouches-du-Rhône' },
  { code: '69', nom: 'Rhône' },
  { code: '59', nom: 'Nord' },
  { code: '92', nom: 'Hauts-de-Seine' },
  { code: '93', nom: 'Seine-Saint-Denis' },
  { code: '94', nom: 'Val-de-Marne' },
  { code: '33', nom: 'Gironde' },
  { code: '31', nom: 'Haute-Garonne' },
  { code: '06', nom: 'Alpes-Maritimes' },
  { code: '34', nom: 'Hérault' },
  { code: '44', nom: 'Loire-Atlantique' },
];

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="mb-4">
              <Image
                src="/logo-roullepro-circle.png"
                alt="RoullePro"
                width="56"
                height="56"
                className="h-14 w-14 rounded-full bg-white p-1"
              />
              <span className="text-xl font-bold mt-3 block">RoullePro</span>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              L&apos;annuaire national des ambulances, VSL et taxis conventionnés en France.
              Plus de 26 000 fiches issues de la base SIRENE.
            </p>
            <div className="space-y-2 text-sm text-gray-400">
              <div className="flex items-center space-x-2">
                <Mail size={16} />
                <a href="mailto:contact@roullepro.com" className="hover:text-white transition">contact@roullepro.com</a>
              </div>
              <div className="flex items-center space-x-2">
                <Phone size={16} />
                <PhoneLink
                  telNumber="+33615472813"
                  displayNumber="06 15 47 28 13"
                  className="hover:text-white transition"
                />
              </div>
              <div className="flex items-center space-x-2">
                <MapPin size={16} />
                <span>France</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Annuaire transport sanitaire</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/transport-medical" className="hover:text-white transition">Annuaire complet</Link></li>
              <li><Link href="/transport-medical/recherche" className="hover:text-white transition">Rechercher par ville</Link></li>
              <li><Link href="/transport-medical/notre-engagement" className="hover:text-white transition">Notre engagement</Link></li>
              <li><Link href="/transport-medical/pro" className="hover:text-white transition">Espace professionnel</Link></li>
              <li><Link href="/transport-medical/inscription" className="hover:text-white transition">Inscrire mon entreprise</Link></li>
              <li><Link href="/transport-medical/tarifs" className="hover:text-white transition">Abonnements pro</Link></li>
              <li><Link href="/blog" className="hover:text-white transition">Blog & actualités</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Top villes</h3>
            <ul className="grid grid-cols-2 gap-x-3 gap-y-2 text-sm text-gray-400">
              {TOP_VILLES_SEO.map((v) => (
                <li key={v.slug}>
                  <Link href={`/transport-medical/${v.slug}`} className="hover:text-white transition">
                    {v.ville}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Départements</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              {TOP_DEPARTEMENTS_SEO.map((d) => (
                <li key={d.code}>
                  <Link href={`/transport-medical/departement/${d.code}`} className="hover:text-white transition">
                    {d.nom} ({d.code})
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8">
          <h3 className="font-semibold mb-4 text-sm text-gray-300">Marketplace véhicules pros (service complémentaire)</h3>
          <ul className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-gray-500">
            <li><Link href="/annonces" className="hover:text-white transition">Annonces</Link></li>
            <li><Link href="/deposer-annonce" className="hover:text-white transition">Déposer une annonce</Link></li>
            <li><Link href="/depot-vente" className="hover:text-white transition">Dépôt-vente</Link></li>
            <li><Link href="/garage/inscription" className="hover:text-white transition">Garage partenaire</Link></li>
            <li><Link href="/annonces/categorie/vtc" className="hover:text-white transition">VTC</Link></li>
            <li><Link href="/annonces/categorie/taxi" className="hover:text-white transition">Taxi</Link></li>
            <li><Link href="/annonces/categorie/ambulance" className="hover:text-white transition">Ambulance / VSL</Link></li>
            <li><Link href="/annonces/categorie/tpmr" className="hover:text-white transition">TPMR</Link></li>
            <li><Link href="/annonces/categorie/navette" className="hover:text-white transition">Navette</Link></li>
            <li><Link href="/annonces/categorie/utilitaire" className="hover:text-white transition">Utilitaire</Link></li>
          </ul>
        </div>

        <div className="border-t border-gray-800 mt-6 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} RoullePro. Tous droits réservés.
          </p>
          <div className="flex space-x-4 text-sm text-gray-500">
            <Link href="/contact" className="hover:text-white transition">Contact</Link>
            <Link href="/mentions-legales" className="hover:text-white transition">Mentions légales</Link>
            <Link href="/cgu" className="hover:text-white transition">CGU</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
