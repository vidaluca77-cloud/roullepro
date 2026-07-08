import type { Metadata } from "next";
import SignalerForm from "./SignalerForm";

export const metadata: Metadata = {
  title: "Signaler un problème sur une fiche",
  description:
    "Signaler une erreur de numéro, une activité cessée, demander la suppression d'une fiche ou tout autre problème sur l'annuaire RoullePro du transport sanitaire.",
  robots: { index: true, follow: true },
};

export default function SignalerPage({
  searchParams,
}: {
  searchParams: { fiche?: string; nom?: string };
}) {
  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Signaler un problème
          </h1>
          <p className="text-gray-700">
            RoullePro est un annuaire opérationnel du transport sanitaire en France.
            Les fiches proviennent du registre public SIRENE et sont susceptibles d'erreurs.
            Utilisez ce formulaire pour signaler une fiche, demander une rectification
            ou la suppression.
          </p>
        </header>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <SignalerForm
            initialFicheId={searchParams.fiche}
            initialFicheNom={searchParams.nom}
          />
        </div>

        <aside className="bg-blue-50 border border-blue-100 rounded-2xl p-5 text-sm text-gray-700">
          <h2 className="font-semibold text-gray-900 mb-2">
            Vous êtes le professionnel concerné ?
          </h2>
          <p className="mb-3">
            Pour reprendre le contrôle de votre fiche, mettre à jour vos coordonnées
            ou la faire supprimer rapidement, le mieux est de la réclamer.
          </p>
          <a
            href="/transport-medical/pro/reclamer"
            className="inline-flex items-center gap-1 font-semibold text-[#0066CC] hover:underline"
          >
            Réclamer ma fiche professionnelle →
          </a>
        </aside>

        <p className="mt-6 text-xs text-gray-500 text-center">
          Délai de traitement : sous 72 heures ouvrées. Demandes de suppression RGPD
          traitées en priorité conformément à notre{" "}
          <a href="/rgpd" className="underline">
            politique RGPD
          </a>
          .
        </p>
      </div>
    </main>
  );
}
