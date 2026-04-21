'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const TRANSITIONS: Record<string, string[]> = {
  candidature: ['pre_valide', 'actif', 'refuse'],
  pre_valide: ['actif', 'refuse'],
  actif: ['suspendu'],
  suspendu: ['actif', 'refuse'],
  refuse: [],
};

interface Props {
  garageId: string;
  currentStatut: string;
}

export default function AdminGarageActions({ garageId, currentStatut }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const transitions = TRANSITIONS[currentStatut] ?? [];

  if (transitions.length === 0) return null;

  const handleAction = async (statut: string) => {
    if (!confirm(`Passer ce garage en statut "${statut}" ?`)) return;
    setLoading(true);
    try {
      await fetch(`/api/admin/garages/${garageId}/statut`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ statut }),
      });
      router.refresh();
    } catch {
      // silencieux
    } finally {
      setLoading(false);
    }
  };

  const LABELS: Record<string, { label: string; className: string }> = {
    actif: { label: 'Valider', className: 'bg-emerald-600 hover:bg-emerald-700 text-white' },
    pre_valide: { label: 'Pré-valider', className: 'bg-blue-600 hover:bg-blue-700 text-white' },
    refuse: { label: 'Refuser', className: 'bg-red-100 hover:bg-red-200 text-red-700' },
    suspendu: { label: 'Suspendre', className: 'bg-orange-100 hover:bg-orange-200 text-orange-700' },
  };

  return (
    <div className="flex gap-1.5 flex-wrap">
      {transitions.map((s) => {
        const cfg = LABELS[s] ?? { label: s, className: 'bg-slate-100 text-slate-700' };
        return (
          <button
            key={s}
            onClick={() => handleAction(s)}
            disabled={loading}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition disabled:opacity-60 ${cfg.className}`}
          >
            {cfg.label}
          </button>
        );
      })}
    </div>
  );
}
