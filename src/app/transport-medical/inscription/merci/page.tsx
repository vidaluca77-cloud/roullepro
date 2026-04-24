import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, Mail, Clock, FileText } from "lucide-react";

export const metadata: Metadata = {
  title: "Inscription reçue — RoullePro",
  description: "Votre demande d'inscription a bien été reçue. Validation sous 24-48h.",
  robots: { index: false, follow: false },
};

type Props = {
  searchParams: Promise<{ email?: string }>;
};

export default async function MerciPage({ searchParams }: Props) {
  const { email } = await searchParams;
  const displayEmail = email ? decodeURIComponent(email) : null;

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-blue-50/40">
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        {/* Icône succès */}
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-6">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          Votre inscription est reçue&nbsp;!
        </h1>

        {displayEmail && (
          <p className="text-gray-600 mb-8">
            Un email de confirmation a été envoyé à{" "}
            <strong className="text-gray-900">{displayEmail}</strong>.
          </p>
        )}
        {!displayEmail && (
          <p className="text-gray-600 mb-8">
            Vérifiez votre boîte email pour la confirmation.
          </p>
        )}

        {/* 3 étapes */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 text-left space-y-5 mb-8">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Prochaines étapes</h2>

          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center">
              <Mail className="w-4 h-4 text-[#0066CC]" />
            </div>
            <div>
              <div className="font-medium text-gray-900 text-sm">1. Vérifiez votre email</div>
              <p className="text-gray-500 text-sm mt-0.5">
                Cliquez sur le lien de confirmation pour activer votre compte RoullePro.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center">
              <Clock className="w-4 h-4 text-[#0066CC]" />
            </div>
            <div>
              <div className="font-medium text-gray-900 text-sm">
                2. Attendez la validation (24–48 h)
              </div>
              <p className="text-gray-500 text-sm mt-0.5">
                Notre équipe vérifie votre dossier manuellement avant de rendre votre fiche
                visible aux patients.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center">
              <FileText className="w-4 h-4 text-[#0066CC]" />
            </div>
            <div>
              <div className="font-medium text-gray-900 text-sm">3. Complétez votre fiche</div>
              <p className="text-gray-500 text-sm mt-0.5">
                Une fois validée, connectez-vous pour ajouter photos, horaires détaillés et
                description. Votre fiche de base est <strong>gratuite</strong>, sans carte
                bancaire.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/auth/login"
            className="inline-flex items-center justify-center gap-2 bg-[#0066CC] hover:bg-[#0052a3] text-white font-semibold px-6 py-3 rounded-xl transition"
          >
            Se connecter à mon espace
          </Link>
          <Link
            href="/transport-medical"
            className="inline-flex items-center justify-center gap-2 border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold px-6 py-3 rounded-xl transition"
          >
            Retour à l'annuaire
          </Link>
        </div>

        <p className="mt-8 text-sm text-gray-400">
          Une question ?{" "}
          <a
            href="mailto:contact@roullepro.com"
            className="text-[#0066CC] hover:underline"
          >
            contact@roullepro.com
          </a>
        </p>
      </div>
    </main>
  );
}
