'use client';

import { useState } from 'react';
import { Star, PenLine } from 'lucide-react';
import NotationModal from '@/components/NotationModal';

interface ProfilVendeurClientProps {
  vendeurId: string;
  vendeurNom: string;
  notationExistante: Record<string, unknown> | null;
  currentUserId: string | null;
  isOwn: boolean;
  /** Called after a successful notation so the parent can refresh */
  onNotationSuccess?: () => void;
}

export default function ProfilVendeurClient({
  vendeurId,
  vendeurNom,
  notationExistante,
  currentUserId,
  isOwn,
}: ProfilVendeurClientProps) {
  const [showModal, setShowModal] = useState(false);
  const [successKey, setSuccessKey] = useState(0);

  const canRate = !!currentUserId && !isOwn;

  if (!canRate) return null;

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="mt-3 flex items-center gap-2 px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-lg text-sm font-medium transition"
      >
        {notationExistante ? <PenLine size={14} /> : <Star size={14} />}
        {notationExistante ? 'Modifier mon avis' : 'Laisser un avis'}
      </button>

      {showModal && (
        <NotationModal
          vendeurId={vendeurId}
          vendeurNom={vendeurNom}
          notationExistante={notationExistante as any}
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
            setSuccessKey((k) => k + 1);
          }}
        />
      )}
    </>
  );
}
