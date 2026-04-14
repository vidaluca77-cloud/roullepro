'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Truck, Menu, X, User, LogOut, LayoutDashboard } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const navLinks = [
    { href: '/', label: 'Accueil' },
    { href: '/annonces', label: 'Annonces' },
    { href: '/deposer-annonce', label: 'Deposer une annonce' },
  ];

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Truck className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-blue-600">RoullePro</span>
            </Link>
          </div>
          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="flex items-center space-x-2">
              <Link
                href="/auth/login"
                className="text-sm text-gray-600 hover:text-blue-600"
              >
                Connexion
              </Link>
              <Link
                href="/auth/register"
                className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Inscription
              </Link>
            </div>
          </div>
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-600">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>
      {isOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="px-4 py-3 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="block text-sm font-medium text-gray-700 hover:text-blue-600 py-1"
              >
                {link.label}
              </Link>
            ))}
            <div className="border-t pt-2 space-y-2">
              <Link href="/auth/login" className="block text-sm text-gray-600 hover:text-blue-600 py-1">Connexion</Link>
              <Link href="/auth/register" className="block bg-blue-600 text-white text-sm px-4 py-2 rounded-lg text-center">Inscription</Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
