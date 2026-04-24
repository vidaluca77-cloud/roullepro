import type { ReactNode } from "react";
import Link from "next/link";

export default function InscriptionLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header minimal */}
      <header className="border-b border-gray-100 bg-white sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="font-bold text-gray-900 text-lg">
            Roulle<span className="text-[#0066CC]">Pro</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link
              href="/transport-medical"
              className="text-sm text-gray-600 hover:text-gray-900 transition"
            >
              Annuaire
            </Link>
            <Link
              href="/auth/login"
              className="text-sm font-medium text-[#0066CC] hover:underline"
            >
              Se connecter
            </Link>
          </nav>
        </div>
      </header>

      {/* Contenu */}
      <div className="flex-1">{children}</div>

      {/* Footer minimal */}
      <footer className="border-t border-gray-100 py-6 bg-white">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-400">
          <p>© {new Date().getFullYear()} RoullePro — Transport Médical</p>
          <div className="flex gap-4">
            <Link href="/cgu" className="hover:text-gray-600 transition">
              CGU
            </Link>
            <Link href="/confidentialite" className="hover:text-gray-600 transition">
              Confidentialité
            </Link>
            <Link href="mailto:contact@roullepro.com" className="hover:text-gray-600 transition">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
