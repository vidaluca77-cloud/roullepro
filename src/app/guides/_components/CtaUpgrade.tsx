import Link from "next/link";
import { ShieldCheck, ArrowRight, Sparkles } from "lucide-react";

export default function CtaUpgrade({
  variant = "default",
}: {
  variant?: "default" | "compact";
}) {
  if (variant === "compact") {
    return (
      <div className="my-8 bg-blue-50 border border-blue-100 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-start gap-3">
          <Sparkles className="h-5 w-5 text-blue-700 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-slate-800">
            Recevez les alertes <strong>filtrées par métier, activités et région</strong> directement sur votre fiche.
          </p>
        </div>
        <Link
          href="/transport-medical/tarifs"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold rounded-lg transition whitespace-nowrap"
        >
          Activer Pro 19,90 €/mois
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    );
  }

  return (
    <div className="my-10 bg-gradient-to-br from-blue-700 to-blue-900 text-white rounded-2xl p-7">
      <div className="flex items-start gap-3 mb-4">
        <div className="bg-white/15 p-2 rounded-lg">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-xl font-bold mb-1">
            Recevez ces alertes ciblées sur votre fiche
          </h3>
          <p className="text-blue-100 text-sm">
            Profil de conformité, score, calendrier d&apos;échéances, plan d&apos;action par alerte, export PDF.
          </p>
        </div>
      </div>
      <ul className="text-sm text-blue-50 space-y-1.5 mb-5 ml-1">
        <li>· Alertes filtrées par métier, activité et région</li>
        <li>· Score de conformité 0-100 mis à jour automatiquement</li>
        <li>· Newsletter hebdomadaire segmentée par métier</li>
        <li>· Rapport PDF téléchargeable à tout moment</li>
      </ul>
      <Link
        href="/transport-medical/tarifs"
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-blue-800 rounded-lg font-semibold hover:bg-blue-50 transition"
      >
        Activer le plan Pro 19,90 €/mois
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
