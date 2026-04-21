'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, XCircle } from 'lucide-react';

interface Props {
  offre_id: string;
  depot_id: string;
}

export default function DepotDetailActions({ offre_id, depot_id }: Props) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAction = async (action: 'accepter' | 'refuser') => {
    setLoading(true);
    try {
      await fetch('/api/depot-vente/offre-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ offre_id, depot_id, action }),
      });
      router.refresh();
    } catch {
      // silencieux
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={() => handleAction('accepter')}
        disabled={loading}
        aria-label="Accepter cette offre"
        className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition disabled:opacity-60"
      >
        <CheckCircle size={14} />
        Accepter
      </button>
      <button
        onClick={() => handleAction('refuser')}
        disabled={loading}
        aria-label="Refuser cette offre"
        className="flex items-center gap-1.5 bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-700 text-xs font-semibold px-3 py-1.5 rounded-lg transition disabled:opacity-60"
      >
        <XCircle size={14} />
        Refuser
      </button>
    </div>
  );
}
