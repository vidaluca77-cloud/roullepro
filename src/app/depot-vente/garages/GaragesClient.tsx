'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MapPin, Star, ArrowRight, Search, ShieldCheck } from 'lucide-react';

interface Garage {
  id: string;
  raison_sociale: string;
  adresse?: string | null;
  code_postal?: string | null;
  ville?: string | null;
  contact_telephone?: string | null;
  specialites?: string[] | null;
  note_moyenne?: number | null;
  nb_ventes_total?: number | null;
  site_web?: string | null;
}

interface Props {
  garages: Garage[];
  estimationId: string | null;
}

export default function GaragesClient({ garages, estimationId }: Props) {
  const [search, setSearch] = useState('');

  const filtered = garages.filter((g) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (g.code_postal ?? '').includes(q) ||
      (g.ville ?? '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Nos garages partenaires</h1>
          <p className="text-slate-500 text-lg">
            {garages.length} partenaire{garages.length > 1 ? 's' : ''} vérifié{garages.length > 1 ? 's' : ''} par RoullePro — réservez un créneau près de chez vous.
          </p>
          <p className="text-slate-400 text-sm mt-2">
            L&apos;identité complète du garage vous est communiquée après confirmation de votre demande de dépôt.
          </p>
        </div>

        {/* Barre de filtrage */}
        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filtrer par ville ou code postal..."
            aria-label="Filtrer les garages"
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
          />
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-slate-400 text-lg mb-2">Aucun garage trouvé pour cette recherche.</p>
            {search && (
              <button
                onClick={() => setSearch('')}
                className="text-blue-600 text-sm hover:underline"
              >
                Effacer le filtre
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-4">
            {filtered.map((g) => (
              <div
                key={g.id}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all p-6 flex flex-col sm:flex-row sm:items-center gap-6"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="min-w-0">
                      <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-100 rounded-full px-2.5 py-0.5 mb-2">
                        <ShieldCheck size={12} /> Garage vérifié
                      </div>
                      <h2 className="font-bold text-slate-900 text-lg truncate">
                        Partenaire RoullePro — {g.ville ?? "France"}
                      </h2>
                    </div>
                    {g.note_moyenne !== null && g.note_moyenne !== undefined && (
                      <div className="flex items-center gap-1 flex-shrink-0 bg-amber-50 border border-amber-100 rounded-lg px-2.5 py-1">
                        <Star size={13} className="text-amber-500 fill-amber-500" />
                        <span className="font-bold text-amber-700 text-sm">
                          {Number(g.note_moyenne).toFixed(1)}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 text-slate-400 text-sm mb-3">
                    <MapPin size={14} />
                    <span>
                      {[g.code_postal, g.ville].filter(Boolean).join(" ")}
                    </span>
                  </div>

                  {g.specialites && g.specialites.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {g.specialites.map((s) => (
                        <span
                          key={s}
                          className="inline-flex items-center bg-blue-50 text-blue-700 text-xs font-medium px-2.5 py-0.5 rounded-full border border-blue-100"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  )}

                  {g.nb_ventes_total !== null && g.nb_ventes_total !== undefined && g.nb_ventes_total > 0 && (
                    <p className="text-xs text-slate-400">{g.nb_ventes_total} vente{g.nb_ventes_total > 1 ? 's' : ''} réalisée{g.nb_ventes_total > 1 ? 's' : ''}</p>
                  )}
                </div>

                <div className="flex flex-col gap-2 sm:w-44">
                  {estimationId ? (
                    <Link
                      href={`/depot-vente/garages/${g.id}/reserver?estimation=${estimationId}`}
                      className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl py-2.5 text-sm font-semibold transition"
                    >
                      Choisir ce garage
                      <ArrowRight size={14} />
                    </Link>
                  ) : (
                    <Link
                      href={`/depot-vente/garages/${g.id}`}
                      className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl py-2.5 text-sm font-semibold transition"
                    >
                      Voir la fiche
                      <ArrowRight size={14} />
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
