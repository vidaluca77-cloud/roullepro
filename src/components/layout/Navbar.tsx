'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, X, User, LogOut, LayoutDashboard, Wrench, Shield, Cross } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [hasGarage, setHasGarage] = useState(false);
  const [garageDemandes, setGarageDemandes] = useState(0);
  const [hasSanitaire, setHasSanitaire] = useState(false);
  const [sanitaireUnread, setSanitaireUnread] = useState(0);
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const navLinks = [
    { href: '/', label: 'Accueil' },
    { href: '/transport-medical', label: 'Annuaire' },
    { href: '/pro', label: 'Espace pro' },
    { href: '/annonces', label: 'Marketplace' },
    { href: '/blog', label: 'Blog' },
  ];

  useEffect(() => {
    loadUser();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      loadUser();
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await fetch('/api/messages?role=seller');
        if (!res.ok) return;
        const data = await res.json();
        const count = (data || []).filter((m: any) => m.has_unread).length;
        setUnreadCount(count);
      } catch {}
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000); // toutes les 30s
    return () => clearInterval(interval);
  }, []);

  const loadUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    if (user) {
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setProfile(data);
      // Détecter si l'utilisateur a un garage partenaire
      const { data: garage } = await supabase
        .from('garages_partenaires')
        .select('id, statut')
        .eq('user_id', user.id)
        .maybeSingle();
      if (garage) {
        setHasGarage(true);
        // Compter les demandes en attente de ce garage
        if (garage.statut === 'actif') {
          const { count } = await supabase
            .from('depots')
            .select('id', { count: 'exact', head: true })
            .eq('garage_id', garage.id)
            .eq('statut', 'demande_en_attente');
          setGarageDemandes(count ?? 0);
        }
      } else {
        setHasGarage(false);
        setGarageDemandes(0);
      }
      // Détecter si l'utilisateur possède une fiche transport sanitaire
      const { data: sanitaireFiche } = await supabase
        .from('pros_sanitaire')
        .select('id')
        .eq('claimed_by', user.id)
        .limit(1)
        .maybeSingle();
      if (sanitaireFiche) {
        setHasSanitaire(true);
        const { count: snUnread } = await supabase
          .from('sanitaire_messages')
          .select('id', { count: 'exact', head: true })
          .eq('pro_id', sanitaireFiche.id)
          .eq('read_by_pro', false);
        setSanitaireUnread(snUnread ?? 0);
      } else {
        setHasSanitaire(false);
        setSanitaireUnread(0);
      }
    } else {
      setProfile(null);
      setHasGarage(false);
      setGarageDemandes(0);
      setHasSanitaire(false);
      setSanitaireUnread(0);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    router.push('/');
    router.refresh();
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center" aria-label="RoullePro - Accueil">
              <Image
                src="/logo-roullepro-horizontal.png"
                alt="RoullePro"
                width="180"
                height="48"
                priority
                className="h-10 w-auto"
              />
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

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-blue-600"
                >
                  <User className="h-5 w-5" />
                  <span>{profile?.full_name || user.email}</span>
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 z-10">
                    <Link
                      href="/dashboard"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <LayoutDashboard className="h-4 w-4 mr-2" />
                      Mon espace vendeur
                      {unreadCount > 0 && (
                        <span className="ml-1.5 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </Link>
                    {hasGarage && (
                      <Link
                        href="/garage/dashboard"
                        className="flex items-center px-4 py-2 text-sm text-purple-700 hover:bg-purple-50 font-semibold border-t border-slate-100"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Wrench className="h-4 w-4 mr-2" />
                        Espace garage
                        {garageDemandes > 0 && (
                          <span className="ml-auto bg-purple-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                            {garageDemandes > 9 ? '9+' : garageDemandes}
                          </span>
                        )}
                      </Link>
                    )}
                    {hasSanitaire && (
                      <Link
                        href="/transport-medical/pro/dashboard"
                        className="flex items-center px-4 py-2 text-sm text-[#0066CC] hover:bg-blue-50 font-semibold border-t border-slate-100"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Cross className="h-4 w-4 mr-2" />
                        Espace transport sanitaire
                        {sanitaireUnread > 0 && (
                          <span className="ml-auto bg-[#0066CC] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                            {sanitaireUnread > 9 ? '9+' : sanitaireUnread}
                          </span>
                        )}
                      </Link>
                    )}
                    {profile?.role === "admin" && (
                      <>
                        <Link
                          href="/admin/garages"
                          className="flex items-center px-4 py-2 text-sm text-amber-700 hover:bg-amber-50 font-semibold border-t border-slate-100"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <Shield className="h-4 w-4 mr-2" />
                          Admin garages
                        </Link>
                        <Link
                          href="/admin/depots"
                          className="flex items-center px-4 py-2 text-sm text-amber-700 hover:bg-amber-50 font-semibold"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <Shield className="h-4 w-4 mr-2" />
                          Admin dépôts
                        </Link>
                        <Link
                          href="/admin/sanitaire/reclamations"
                          className="flex items-center px-4 py-2 text-sm text-amber-700 hover:bg-amber-50 font-semibold"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <Shield className="h-4 w-4 mr-2" />
                          Admin réclamations sanitaire
                        </Link>
                      </>
                    )}
                    <Link
                      href="/profil"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 border-t border-slate-100"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <User className="h-4 w-4 mr-2" />
                      Mon profil
                    </Link>
                    <button
                      onClick={() => { handleSignOut(); setUserMenuOpen(false); }}
                      className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Deconnexion
                    </button>
                  </div>
                )}
              </div>
            ) : (
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
            )}
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
            {user ? (
              <div className="border-t pt-2 space-y-2">
                <Link href="/dashboard" className="flex items-center text-sm text-gray-600 hover:text-blue-600 py-1" onClick={() => setIsOpen(false)}>
                  Mon espace vendeur
                  {unreadCount > 0 && (
                    <span className="ml-1.5 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>
                {hasGarage && (
                  <Link href="/garage/dashboard" className="flex items-center text-sm text-purple-700 hover:text-purple-800 font-semibold py-1" onClick={() => setIsOpen(false)}>
                    Espace garage
                    {garageDemandes > 0 && (
                      <span className="ml-1.5 bg-purple-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                        {garageDemandes > 9 ? '9+' : garageDemandes}
                      </span>
                    )}
                  </Link>
                )}
                {hasSanitaire && (
                  <Link href="/transport-medical/pro/dashboard" className="flex items-center text-sm text-[#0066CC] hover:text-blue-800 font-semibold py-1" onClick={() => setIsOpen(false)}>
                    Espace transport sanitaire
                    {sanitaireUnread > 0 && (
                      <span className="ml-1.5 bg-[#0066CC] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                        {sanitaireUnread > 9 ? '9+' : sanitaireUnread}
                      </span>
                    )}
                  </Link>
                )}
                {profile?.role === "admin" && (
                  <>
                    <Link href="/admin/garages" className="flex items-center gap-1.5 text-sm text-amber-700 hover:text-amber-800 font-semibold py-1" onClick={() => setIsOpen(false)}>
                      <Shield className="h-4 w-4" /> Admin garages
                    </Link>
                    <Link href="/admin/depots" className="flex items-center gap-1.5 text-sm text-amber-700 hover:text-amber-800 font-semibold py-1" onClick={() => setIsOpen(false)}>
                      <Shield className="h-4 w-4" /> Admin dépôts
                    </Link>
                    <Link href="/admin/sanitaire/reclamations" className="flex items-center gap-1.5 text-sm text-amber-700 hover:text-amber-800 font-semibold py-1" onClick={() => setIsOpen(false)}>
                      <Shield className="h-4 w-4" /> Admin réclamations sanitaire
                    </Link>
                  </>
                )}
                <Link href="/profil" className="block text-sm text-gray-600 hover:text-blue-600 py-1" onClick={() => setIsOpen(false)}>Mon profil</Link>
                <button onClick={() => { handleSignOut(); setIsOpen(false); }} className="block w-full text-left text-sm text-red-600 hover:text-red-700 py-1">Deconnexion</button>
              </div>
            ) : (
              <div className="border-t pt-2 space-y-2">
                <Link href="/auth/login" className="block text-sm text-gray-600 hover:text-blue-600 py-1" onClick={() => setIsOpen(false)}>Connexion</Link>
                <Link href="/auth/register" className="block bg-blue-600 text-white text-sm px-4 py-2 rounded-lg text-center" onClick={() => setIsOpen(false)}>Inscription</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
