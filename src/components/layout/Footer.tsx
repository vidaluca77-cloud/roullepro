import Link from 'next/link';
import { Truck, Mail, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Truck className="h-8 w-8 text-blue-400" />
              <span className="text-xl font-bold">RoullePro</span>
            </div>
            <p className="text-gray-400 text-sm mb-4">La marketplace des professionnels du transport.</p>
            <div className="space-y-2 text-sm text-gray-400">
              <div className="flex items-center space-x-2"><Mail size={16} /><span>contact@roullepro.fr</span></div>
              <div className="flex items-center space-x-2"><MapPin size={16} /><span>France</span></div>
            </div>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Navigation</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/" className="hover:text-white">Accueil</Link></li>
              <li><Link href="/annonces" className="hover:text-white">Annonces</Link></li>
              <li><Link href="/deposer-annonce" className="hover:text-white">Deposer une annonce</Link></li>
              <li><Link href="/dashboard" className="hover:text-white">Mon espace</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Categories</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/annonces?categorie=vtc" className="hover:text-white">VTC</Link></li>
              <li><Link href="/annonces?categorie=taxi" className="hover:text-white">Taxi</Link></li>
              <li><Link href="/annonces?categorie=ambulance" className="hover:text-white">Ambulance</Link></li>
              <li><Link href="/annonces?categorie=utilitaire" className="hover:text-white">Utilitaire</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between">
          <p className="text-sm text-gray-500">&copy; {new Date().getFullYear()} RoullePro.</p>
          <div className="flex space-x-4 text-sm text-gray-500">
            <Link href="/mentions-legales" className="hover:text-white">Mentions legales</Link>
            <Link href="/cgu" className="hover:text-white">CGU</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
