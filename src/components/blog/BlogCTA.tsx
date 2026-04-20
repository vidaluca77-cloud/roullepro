/**
 * CTA de bas d'article — adapté selon la catégorie.
 */

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export function BlogCTA({ category }: { category: string }) {
  // Mapping catégorie → CTA pertinent
  const map: Record<
    string,
    {
      title: string;
      description: string;
      primary: { label: string; href: string };
      secondary: { label: string; href: string };
    }
  > = {
    "Guide vendeur": {
      title: "Prêt à publier votre annonce ?",
      description:
        "Des milliers d'acheteurs professionnels consultent RoullePro chaque semaine. Publiez en 3 minutes, gratuitement.",
      primary: { label: "Déposer une annonce", href: "/deposer-annonce" },
      secondary: { label: "Voir les offres Pro", href: "/pricing" },
    },
    "Guide acheteur": {
      title: "Trouvez le véhicule qu'il vous faut",
      description:
        "Parcourez les annonces certifiées entre professionnels : utilitaires, camions, taxis, VTC, ambulances.",
      primary: { label: "Voir les annonces", href: "/annonces" },
      secondary: { label: "Créer une alerte", href: "/auth/signup" },
    },
    "Fiscalité": {
      title: "Optimisez votre flotte, vendez l'ancien",
      description:
        "RoullePro vous permet de revendre rapidement vos véhicules amortis à d'autres pros sans commission.",
      primary: { label: "Déposer une annonce", href: "/deposer-annonce" },
      secondary: { label: "Nos abonnements", href: "/pricing" },
    },
    "Financement": {
      title: "Comparez, achetez, revendez : tout sur RoullePro",
      description:
        "Une fois votre financement choisi, trouvez le bon véhicule pro ou revendez l'ancien en restant entre professionnels.",
      primary: { label: "Voir les annonces", href: "/annonces" },
      secondary: { label: "Déposer une annonce", href: "/deposer-annonce" },
    },
    "Métier": {
      title: "Votre marketplace métier",
      description:
        "Taxis, VTC, ambulanciers, transporteurs : RoullePro regroupe les professionnels du transport routier.",
      primary: { label: "Voir les annonces", href: "/annonces" },
      secondary: { label: "Déposer une annonce", href: "/deposer-annonce" },
    },
    "Écologie": {
      title: "Passez à l'électrique, valorisez votre thermique",
      description:
        "Revendez votre ancien véhicule à d'autres pros et financez votre transition énergétique.",
      primary: { label: "Déposer une annonce", href: "/deposer-annonce" },
      secondary: { label: "Voir les véhicules élec.", href: "/annonces" },
    },
    "Actualités": {
      title: "Restez connecté au marché pro",
      description:
        "La marketplace B2B dédiée aux professionnels du transport routier.",
      primary: { label: "Voir les annonces", href: "/annonces" },
      secondary: { label: "Créer un compte", href: "/auth/signup" },
    },
  };

  const cta = map[category] || map["Guide acheteur"];

  return (
    <div className="mt-14 relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 p-8 md:p-10 text-white">
      <div className="absolute -right-20 -top-20 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl" />
      <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl" />
      <div className="relative">
        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-3 py-1 mb-4">
          <Sparkles size={14} className="text-amber-300" />
          <span className="text-xs font-semibold tracking-wide">
            RoullePro · 100 % entre pros
          </span>
        </div>
        <h3 className="text-2xl md:text-3xl font-bold mb-3 leading-tight">
          {cta.title}
        </h3>
        <p className="text-white/80 mb-6 max-w-xl leading-relaxed">
          {cta.description}
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href={cta.primary.href}
            className="inline-flex items-center gap-2 bg-white text-gray-900 hover:bg-gray-100 px-5 py-3 rounded-xl text-sm font-semibold transition"
          >
            {cta.primary.label}
            <ArrowRight size={15} />
          </Link>
          <Link
            href={cta.secondary.href}
            className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white px-5 py-3 rounded-xl text-sm font-semibold transition"
          >
            {cta.secondary.label}
          </Link>
        </div>
      </div>
    </div>
  );
}
