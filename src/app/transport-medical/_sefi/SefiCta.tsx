import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";

/**
 * CTA final sobre vers l'inscription pro RoullePro, commun aux trois pages du
 * dossier SEFi. Aucune promesse tarifaire agressive : simple invitation à recevoir
 * les demandes de patients de son département.
 */
export default function SefiCta() {
  return (
    <div className="not-prose my-10 bg-gradient-to-br from-blue-700 to-blue-900 text-white rounded-2xl p-7">
      <div className="flex items-start gap-3 mb-4">
        <div className="bg-white/15 p-2 rounded-lg">
          <MapPin className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold mb-1">
            Recevez les demandes de patients de votre département
          </h2>
          <p className="text-blue-100 text-sm">
            Référencez votre entreprise de taxi conventionné, VSL ou ambulance sur
            l&apos;annuaire national RoullePro et recevez directement les demandes de
            transport de votre secteur.
          </p>
        </div>
      </div>
      <Link
        href="/transport-medical/inscription"
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-blue-800 rounded-lg font-semibold hover:bg-blue-50 transition"
      >
        Inscrire mon entreprise
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
