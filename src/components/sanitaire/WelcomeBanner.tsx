"use client";

import { useState } from "react";
import { CheckCircle2, Circle, X, PartyPopper, Sparkles } from "lucide-react";

type Completude = {
  telephone: boolean;
  email: boolean;
  description: boolean;
  horaires: boolean;
  /** Optionnel : pas inclus dans la jauge pour les pros gratuits (photos = plan Pro) */
  photos?: boolean;
};

const LABELS: Record<keyof Completude, string> = {
  telephone: "Numéro de téléphone public",
  email: "Email professionnel",
  description: "À propos / présentation (50 caractères min.)",
  horaires: "Horaires d'ouverture",
  photos: "Au moins une photo",
};

export default function WelcomeBanner({
  upgraded,
  nomAffiche,
  completude,
}: {
  upgraded: boolean;
  nomAffiche: string;
  completude: Completude;
}) {
  const [closed, setClosed] = useState(false);
  if (closed) return null;

  const items = (
    Object.entries(completude).filter(([, v]) => v !== undefined) as [
      keyof Completude,
      boolean,
    ][]
  );
  const done = items.filter(([, v]) => v).length;
  const total = items.length;
  const pct = Math.round((done / total) * 100);

  if (upgraded) {
    return (
      <div className="bg-gradient-to-br from-indigo-600 via-[#0066CC] to-indigo-700 text-white rounded-2xl p-6 mb-8 relative overflow-hidden">
        <button
          onClick={() => setClosed(true)}
          className="absolute top-3 right-3 text-white/70 hover:text-white"
          aria-label="Fermer"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
            <PartyPopper className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold mb-1">Abonnement activé. Bienvenue en Premium.</h2>
            <p className="text-blue-100 text-sm">
              La messagerie patients est débloquée, votre fiche affiche le badge « Recommandé »
              et remontera dans les résultats de recherche.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border-2 border-[#0066CC]/20 rounded-2xl p-6 mb-8 relative shadow-sm">
      <button
        onClick={() => setClosed(true)}
        className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
        aria-label="Fermer"
      >
        <X className="w-5 h-5" />
      </button>
      <div className="flex items-start gap-4 mb-5">
        <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-6 h-6 text-[#0066CC]" />
        </div>
        <div className="flex-1">
          <div className="text-xs font-semibold uppercase tracking-wider text-[#0066CC] mb-1">
            Bienvenue sur RoullePro
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">
            {nomAffiche}, votre fiche est active
          </h2>
          <p className="text-sm text-gray-600">
            Complétez votre profil pour apparaître plus haut dans les résultats et rassurer les patients.
          </p>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="font-medium text-gray-700">
            Complétude du profil : <span className="text-[#0066CC]">{done}/{total}</span>
          </span>
          <span className="text-gray-500 text-xs">{pct}%</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#0066CC] to-indigo-500 transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-2">
        {items.map(([key, ok]) => (
          <div
            key={key}
            className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg ${
              ok ? "bg-green-50 text-green-900" : "bg-gray-50 text-gray-600"
            }`}
          >
            {ok ? (
              <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
            ) : (
              <Circle className="w-4 h-4 text-gray-400 flex-shrink-0" />
            )}
            <span>{LABELS[key]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
