"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Truck,
  CalendarDays,
  Sparkles,
  MessageCircle,
  Users,
  ShieldCheck,
  CreditCard,
  Lock,
  MoreHorizontal,
  X,
} from "lucide-react";

const BASE = "/transport-medical/pro";

type NavItem = {
  key: string;
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  /** Préfixe de pathname qui marque l'entrée comme active. */
  matchPrefix?: string;
  /** Réservé aux plans payants : affiche un cadenas si non-payant. */
  lockable?: boolean;
};

// Sidebar desktop : toutes les fonctionnalités du dashboard pro.
const SIDEBAR_ITEMS: NavItem[] = [
  {
    key: "fiche",
    label: "Ma fiche",
    href: `${BASE}/dashboard`,
    icon: LayoutDashboard,
    matchPrefix: `${BASE}/dashboard`,
  },
  {
    key: "demandes",
    label: "Demandes de transport",
    href: `${BASE}/dashboard#demandes-transport`,
    icon: Truck,
  },
  {
    key: "planning",
    label: "Planning des courses",
    href: `${BASE}/planning`,
    icon: CalendarDays,
    matchPrefix: `${BASE}/planning`,
  },
  {
    key: "assistant",
    label: "Assistant IA",
    href: `${BASE}/assistant`,
    icon: Sparkles,
    matchPrefix: `${BASE}/assistant`,
    lockable: true,
  },
  {
    key: "messages",
    label: "Messagerie",
    href: `${BASE}/messages`,
    icon: MessageCircle,
    matchPrefix: `${BASE}/messages`,
  },
  {
    key: "forum",
    label: "Forum",
    href: "/forum",
    icon: Users,
    matchPrefix: "/forum",
  },
  {
    key: "ameli",
    label: "Badge Ameli",
    href: `${BASE}/ameli-demande`,
    icon: ShieldCheck,
    matchPrefix: `${BASE}/ameli-demande`,
  },
  {
    key: "abonnement",
    label: "Abonnement",
    href: "/transport-medical/tarifs",
    icon: CreditCard,
    matchPrefix: "/transport-medical/tarifs",
  },
];

const byKey = (key: string): NavItem =>
  SIDEBAR_ITEMS.find((it) => it.key === key) as NavItem;

// Barre d'onglets mobile : 4 entrées principales + « Plus ».
const MOBILE_PRIMARY: NavItem[] = [
  byKey("fiche"),
  byKey("demandes"),
  byKey("assistant"),
  byKey("forum"),
];

// Reste des entrées, présentées dans le menu « Plus ».
const MOBILE_MORE: NavItem[] = [
  byKey("planning"),
  byKey("messages"),
  byKey("ameli"),
  byKey("abonnement"),
];

function isActive(pathname: string, item: NavItem): boolean {
  if (!item.matchPrefix) return false;
  return pathname === item.matchPrefix || pathname.startsWith(item.matchPrefix + "/");
}

export default function DashboardNav({
  isPaid,
  planKnown,
}: {
  isPaid: boolean;
  planKnown: boolean;
}) {
  const pathname = usePathname() || "";
  const [moreOpen, setMoreOpen] = useState(false);

  const showLock = planKnown && !isPaid;
  const moreActive = MOBILE_MORE.some((it) => isActive(pathname, it));

  return (
    <>
      {/* Sidebar desktop (≥ lg) */}
      <aside className="hidden lg:flex fixed top-16 bottom-0 left-0 w-64 z-40 flex-col border-r border-gray-200 bg-white">
        <div className="px-4 py-5 border-b border-gray-100">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            Espace pro
          </p>
          <p className="mt-0.5 text-sm font-bold text-gray-900">Tableau de bord</p>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {SIDEBAR_ITEMS.map((item) => {
            const active = isActive(pathname, item);
            const Icon = item.icon;
            const locked = item.lockable && showLock;
            return (
              <Link
                key={item.key}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  active
                    ? "bg-blue-50 text-[#0066CC]"
                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <Icon
                  className={`w-5 h-5 flex-shrink-0 ${
                    active ? "text-[#0066CC]" : "text-gray-400 group-hover:text-gray-600"
                  }`}
                />
                <span className="flex-1">{item.label}</span>
                {locked && (
                  <span
                    className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700"
                    title="Réservé aux abonnés Pro"
                  >
                    <Lock className="w-3 h-3" />
                    Pro
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Barre d'onglets mobile (< lg) */}
      <nav
        className="lg:hidden fixed bottom-0 inset-x-0 z-40 border-t border-gray-200 bg-white/95 backdrop-blur"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="grid grid-cols-5">
          {MOBILE_PRIMARY.map((item) => {
            const active = isActive(pathname, item);
            const Icon = item.icon;
            const locked = item.lockable && showLock;
            return (
              <Link
                key={item.key}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`relative flex min-h-[44px] flex-col items-center justify-center gap-0.5 px-1 py-2 text-[11px] font-medium transition ${
                  active ? "text-[#0066CC]" : "text-gray-500"
                }`}
              >
                <span className="relative">
                  <Icon className="w-6 h-6" />
                  {locked && (
                    <Lock className="absolute -right-2 -top-1 w-3 h-3 rounded-full bg-white text-amber-600" />
                  )}
                </span>
                <span className="truncate max-w-full">{item.label}</span>
                {active && (
                  <span className="absolute top-0 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-[#0066CC]" />
                )}
              </Link>
            );
          })}
          <button
            type="button"
            onClick={() => setMoreOpen(true)}
            aria-haspopup="dialog"
            aria-expanded={moreOpen}
            className={`relative flex min-h-[44px] flex-col items-center justify-center gap-0.5 px-1 py-2 text-[11px] font-medium transition ${
              moreActive ? "text-[#0066CC]" : "text-gray-500"
            }`}
          >
            <MoreHorizontal className="w-6 h-6" />
            <span>Plus</span>
            {moreActive && (
              <span className="absolute top-0 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-[#0066CC]" />
            )}
          </button>
        </div>
      </nav>

      {/* Menu « Plus » (mobile) */}
      {moreOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 flex items-end"
          role="dialog"
          aria-modal="true"
          aria-label="Plus d'options"
        >
          <button
            type="button"
            aria-label="Fermer le menu"
            className="absolute inset-0 bg-black/40"
            onClick={() => setMoreOpen(false)}
          />
          <div
            className="relative w-full rounded-t-2xl bg-white p-4 shadow-2xl"
            style={{ paddingBottom: "calc(1rem + env(safe-area-inset-bottom))" }}
          >
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-bold text-gray-900">Plus d&apos;options</h2>
              <button
                type="button"
                onClick={() => setMoreOpen(false)}
                aria-label="Fermer"
                className="flex h-9 w-9 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-1">
              {MOBILE_MORE.map((item) => {
                const active = isActive(pathname, item);
                const Icon = item.icon;
                const locked = item.lockable && showLock;
                return (
                  <Link
                    key={item.key}
                    href={item.href}
                    onClick={() => setMoreOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className={`flex min-h-[44px] items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                      active ? "bg-blue-50 text-[#0066CC]" : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <Icon
                      className={`w-5 h-5 flex-shrink-0 ${active ? "text-[#0066CC]" : "text-gray-400"}`}
                    />
                    <span className="flex-1">{item.label}</span>
                    {locked && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700">
                        <Lock className="w-3 h-3" />
                        Pro
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
