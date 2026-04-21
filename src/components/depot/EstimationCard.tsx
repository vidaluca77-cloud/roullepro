'use client';

interface Props {
  min: number;
  max: number;
  marque?: string;
  modele?: string;
  annee?: number;
}

function formatEuro(val: number): string {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val);
}

export default function EstimationCard({ min, max, marque, modele, annee }: Props) {
  return (
    <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
      {/* Decorative circle */}
      <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-white/10 pointer-events-none" />
      <div className="absolute -bottom-8 -left-8 w-28 h-28 rounded-full bg-white/5 pointer-events-none" />

      <div className="relative">
        <span className="inline-flex items-center bg-white/20 border border-white/30 text-white text-xs font-semibold px-3 py-1 rounded-full mb-4">
          Estimation indicative
        </span>

        {(marque || modele || annee) && (
          <p className="text-blue-100 text-sm mb-2">
            {[marque, modele, annee].filter(Boolean).join(' · ')}
          </p>
        )}

        <h2 className="text-2xl font-bold mb-1">Fourchette estimée</h2>

        <div className="flex items-end gap-3 mt-4 mb-6">
          <div className="flex-1 bg-white/10 rounded-xl p-4 text-center">
            <p className="text-xs text-blue-200 mb-1">Minimum</p>
            <p className="text-2xl font-extrabold">{formatEuro(min)}</p>
          </div>
          <div className="text-2xl font-light text-blue-200 pb-2">—</div>
          <div className="flex-1 bg-white/10 rounded-xl p-4 text-center">
            <p className="text-xs text-blue-200 mb-1">Maximum</p>
            <p className="text-2xl font-extrabold">{formatEuro(max)}</p>
          </div>
        </div>

        <p className="text-blue-100 text-xs leading-relaxed border-t border-white/20 pt-4">
          Cette estimation est fournie à titre indicatif sur la base des informations saisies.
          Elle ne constitue pas une offre ferme et peut varier selon l'expertise physique du
          véhicule. Prix net vendeur avant déduction des commissions.
        </p>
      </div>
    </div>
  );
}
