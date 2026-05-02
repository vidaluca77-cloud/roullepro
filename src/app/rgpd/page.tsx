import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, Mail, FileText, Trash2, Edit, Eye } from "lucide-react";

export const metadata: Metadata = {
  title: "Politique RGPD et droits des personnes | RoullePro",
  description:
    "Comment exercer vos droits RGPD sur RoullePro : accès, rectification, suppression de fiche, opposition. Procédure et délais.",
  robots: { index: true, follow: true },
};

const DPO_EMAIL = "contact@roullepro.com";

export default function RGPDPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* En-tête */}
        <header className="bg-white rounded-2xl border border-gray-200 p-8">
          <div className="flex items-center gap-3 mb-3">
            <ShieldCheck className="w-8 h-8 text-[#0066CC]" />
            <h1 className="text-3xl font-bold text-gray-900">
              Politique RGPD
            </h1>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            Dernière mise à jour : 2 mai 2026
          </p>
          <p className="text-gray-700 leading-relaxed">
            RoullePro publie un annuaire opérationnel du transport sanitaire en France
            (taxis conventionnés, ambulances, VSL). Les fiches sont alimentées à partir
            du registre public SIRENE/INSEE et enrichies par les professionnels qui les
            réclament. La présente politique décrit comment exercer vos droits sur les
            données qui vous concernent.
          </p>
        </header>

        {/* Quelle base légale */}
        <section className="bg-white rounded-2xl border border-gray-200 p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Quelle base légale ?
          </h2>
          <p className="text-gray-700 mb-3">
            Les données utilisées pour publier les fiches professionnelles (raison sociale,
            adresse, SIRET, catégorie d'activité) proviennent de la base SIRENE de l'INSEE,
            publiée en open data. Leur diffusion repose sur l'<strong>intérêt légitime</strong>{" "}
            (RGPD article 6.1.f) : faciliter l'accès du public à un service de transport sanitaire.
          </p>
          <p className="text-gray-700">
            Les coordonnées de contact (téléphone, email, site web) ne sont publiées que si
            elles ont été ajoutées par le professionnel lui-même après réclamation de sa fiche,
            ou si elles sont déjà publiquement diffusées (consentement implicite).
          </p>
        </section>

        {/* Vos droits */}
        <section className="bg-white rounded-2xl border border-gray-200 p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Vos droits</h2>
          <ul className="space-y-4">
            <li className="flex gap-3">
              <Eye className="w-5 h-5 text-[#0066CC] flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-gray-900">Droit d'accès</strong>
                <p className="text-sm text-gray-700">
                  Vous pouvez consulter les données vous concernant : votre fiche est publique,
                  toutes les informations affichées vous sont accessibles.
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <Edit className="w-5 h-5 text-[#0066CC] flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-gray-900">Droit de rectification</strong>
                <p className="text-sm text-gray-700">
                  Pour corriger une information erronée :{" "}
                  <Link
                    href="/transport-medical/pro/reclamer"
                    className="text-[#0066CC] underline hover:no-underline"
                  >
                    réclamez votre fiche
                  </Link>{" "}
                  pour la modifier directement, ou{" "}
                  <Link
                    href="/signaler"
                    className="text-[#0066CC] underline hover:no-underline"
                  >
                    signalez le problème
                  </Link>
                  .
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <Trash2 className="w-5 h-5 text-[#0066CC] flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-gray-900">Droit à l'effacement (suppression)</strong>
                <p className="text-sm text-gray-700">
                  Pour demander la suppression de votre fiche : utilisez la{" "}
                  <Link
                    href="/signaler"
                    className="text-[#0066CC] underline hover:no-underline"
                  >
                    page signalement
                  </Link>{" "}
                  en sélectionnant le motif « Demande de suppression (RGPD) ». Indiquez votre
                  qualité (gérant, ayant-droit) pour traitement prioritaire.
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <FileText className="w-5 h-5 text-[#0066CC] flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-gray-900">
                  Droit d'opposition et de portabilité
                </strong>
                <p className="text-sm text-gray-700">
                  Pour toute autre demande (opposition, portabilité, limitation), écrivez à{" "}
                  <a
                    href={`mailto:${DPO_EMAIL}`}
                    className="text-[#0066CC] underline hover:no-underline"
                  >
                    {DPO_EMAIL}
                  </a>{" "}
                  en précisant l'objet.
                </p>
              </div>
            </li>
          </ul>
        </section>

        {/* Délais */}
        <section className="bg-white rounded-2xl border border-gray-200 p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Délais de traitement
          </h2>
          <ul className="space-y-2 text-gray-700">
            <li>
              <strong>Signalement standard :</strong> sous 72 heures ouvrées.
            </li>
            <li>
              <strong>Demande de suppression RGPD :</strong> sous 30 jours maximum
              (article 12 RGPD), souvent sous 72 heures.
            </li>
            <li>
              <strong>Réclamation de fiche :</strong> validation sous 24 heures ouvrées
              après réception du justificatif (extrait Kbis ou attestation).
            </li>
          </ul>
        </section>

        {/* Recours */}
        <section className="bg-white rounded-2xl border border-gray-200 p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Recours et autorité de contrôle
          </h2>
          <p className="text-gray-700 mb-3">
            Si vous estimez que votre demande n'a pas été correctement traitée, vous pouvez
            saisir la Commission Nationale de l'Informatique et des Libertés (CNIL) :
          </p>
          <p className="text-sm text-gray-700">
            <a
              href="https://www.cnil.fr/fr/plaintes"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#0066CC] underline hover:no-underline"
            >
              cnil.fr/plaintes
            </a>{" "}
            — 3 place de Fontenoy, TSA 80715, 75334 PARIS CEDEX 07.
          </p>
        </section>

        {/* CTA */}
        <div className="grid sm:grid-cols-2 gap-4">
          <Link
            href="/signaler"
            className="bg-white rounded-2xl border-2 border-[#0066CC] p-5 hover:bg-blue-50 transition flex items-start gap-3"
          >
            <Trash2 className="w-5 h-5 text-[#0066CC] flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-gray-900 mb-1">
                Demander la suppression
              </div>
              <div className="text-xs text-gray-600">
                Formulaire en ligne, traité sous 72 h
              </div>
            </div>
          </Link>
          <a
            href={`mailto:${DPO_EMAIL}?subject=Demande RGPD`}
            className="bg-white rounded-2xl border-2 border-gray-200 p-5 hover:border-gray-300 transition flex items-start gap-3"
          >
            <Mail className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-gray-900 mb-1">
                Nous écrire directement
              </div>
              <div className="text-xs text-gray-600">{DPO_EMAIL}</div>
            </div>
          </a>
        </div>
      </div>
    </main>
  );
}
