import Link from 'next/link';
import Image from 'next/image';
import { Mail, MapPin, Phone } from 'lucide-react';
import PhoneLink from './PhoneLink';

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
              La marketplace des professionnels du transport.
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
            <h3 className="font-semibold mb-4">Navigation</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/" className="hover:text-white transition">Accueil</Link></li>
              <li><Link href="/annonces" className="hover:text-white transition">Annonces</Link></li>
              <li><Link href="/deposer-annonce" className="hover:text-white transition">Déposer une annonce</Link></li>
              <li><Link href="/depot-vente" className="hover:text-white transition">Dépôt-vente</Link></li>
              <li><Link href="/garage/inscription" className="hover:text-white transition">Devenir garage partenaire</Link></li>
              <li><Link href="/blog" className="hover:text-white transition">Blog</Link></li>
              <li><Link href="/dashboard" className="hover:text-white transition">Mon espace</Link></li>
              <li><Link href="/contact" className="hover:text-white transition">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Catégories véhicules</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/annonces/categorie/vtc" className="hover:text-white transition">VTC</Link></li>
              <li><Link href="/annonces/categorie/taxi" className="hover:text-white transition">Taxi</Link></li>
              <li><Link href="/annonces/categorie/ambulance" className="hover:text-white transition">Ambulance / VSL</Link></li>
              <li><Link href="/annonces/categorie/tpmr" className="hover:text-white transition">TPMR / PMR</Link></li>
              <li><Link href="/annonces/categorie/navette" className="hover:text-white transition">Navette / Minibus</Link></li>
              <li><Link href="/annonces/categorie/materiel" className="hover:text-white transition">Matériel & Équipement</Link></li>
              <li><Link href="/annonces/categorie/utilitaire" className="hover:text-white transition">Véhicules utilitaires</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Transport sanitaire</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/transport-medical" className="hover:text-white transition">Annuaire patients</Link></li>
              <li><Link href="/transport-medical/recherche" className="hover:text-white transition">Rechercher par ville</Link></li>
              <li><Link href="/transport-medical/caen" className="hover:text-white transition">Caen</Link></li>
              <li><Link href="/transport-medical/rouen" className="hover:text-white transition">Rouen</Link></li>
              <li><Link href="/transport-medical/rennes" className="hover:text-white transition">Rennes</Link></li>
              <li><Link href="/transport-medical/brest" className="hover:text-white transition">Brest</Link></li>
              <li><Link href="/transport-medical/pro" className="hover:text-white transition">Espace professionnel</Link></li>
              <li><Link href="/transport-medical/tarifs" className="hover:text-white transition">Abonnements pro</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} RoullePro. Tous droits réservés.
          </p>
          <div className="flex space-x-4 text-sm text-gray-500">
            <Link href="/mentions-legales" className="hover:text-white transition">Mentions légales</Link>
            <Link href="/cgu" className="hover:text-white transition">CGU</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
