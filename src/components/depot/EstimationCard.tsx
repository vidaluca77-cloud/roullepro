'use client';

interface Props {
  min: number;
  max: number;
  centrale?: number;
  marque?: string;
  modele?: string;
  annee?: number;
  categorie?: string;
  confiance?: 'haute' | 'moyenne' | 'basse';
}

function formatEuro(val: number): string {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val);
}

const CATEGORIE_LABEL: Record<string, string> = {
  utilitaire_leger: 'Utilitaire léger',
  utilitaire_compact: 'Utilitaire compact',
  utilitaire_grand: 'Utilitaire grand volume',
  citadine: 'Citadine',
  compacte: 'Compacte',
  berline: 'Berline',
  suv_compact: 'SUV compact',
  suv: 'SUV',
  suv_premium: 'SUV premium',
  premium: 'Premium',
};

const CONFIANCE_LABEL: Record<string, { label: string; bg: string }> = {
  haute: { label: 'Confiance haute', bg: 'bg-emerald-500/30 border-emerald-300/40' },
  moyenne: { label: 'Confiance moyenne', bg: 'bg-amber-500/30 border-amber-300/40' },
  basse: { label: 'Confiance basse', bg: 'bg-slate-500/30 border-slate-300/40' },
};

export default function EstimationCard({ min, max, centrale, marque, modele, annee, categorie, confiance }: Props) {
  const conf = confiance ? CONFIANCE_LABEL[confiance] : null;

  return (
    <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
      <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-white/10 pointer-events-none" />
      <div className="absolute -bottom-8 -left-8 w-28 h-28 rounded-full bg-white/5 pointer-events-none" />

      <div className="relative">
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <span className="inline-flex items-center bg-white/20 border border-white/30 text-white text-xs font-semibold px-3 py-1 rounded-full">
            Estimation indicative (Argus)
          </span>
          {conf && (
            <span className={`inline-flex items-center border text-white text-xs font-semibold px-3 py-1 rounded-full ${conf.bg}`}>
              {conf.label}
            </span>
          )}
        </div>

        {(marque || modele || annee || categorie) && (
          <p className="text-blue-100 text-sm mb-2">
            {[marque, modele, annee, categorie ? CATEGORIE_LABEL[categorie] ?? categorie : null]
              .filter(Boolean)
              .join(' · ')}
          </p>
        )}

        <h2 className="text-2xl font-bold mb-1">Fourchette estimée</h2>

        {centrale !== undefined && (
          <p className="text-blue-100 text-sm mb-4">Valeur centrale : <span className="font-bold text-white">{formatEuro(centrale)}</span></p>
        )}

        <div className="flex items-end gap-3 mt-2 mb-6">
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

        <div className="text-blue-100 text-xs leading-relaxed border-t border-white/20 pt-4 space-y-2">
          <p>
            Cette estimation s&apos;appuie sur les cotes de marché (Argus, La Centrale) pour votre catégorie de véhicule,
            ajustée selon l&apos;âge, le kilométrage et l&apos;état déclaré.
          </p>
          <p>
            Elle est fournie à titre informatif. Le prix de vente final est librement négocié entre vous
            et le garage partenaire lors de la signature du contrat — cette fourchette ne sera pas
            inscrite sur le contrat.
          </p>
        </div>
      </div>
    </div>
  );
}
