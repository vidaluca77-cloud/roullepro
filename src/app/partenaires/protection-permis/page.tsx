import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  Scale,
  FileText,
  Percent,
  Car,
} from "lucide-react";
import { ALLOPOINTS_PROTECT_URL } from "@/components/partenaires/AllopointsProtectEncart";

export const revalidate = 86400;

const TITLE =
  "Protection du permis de conduire — Partenaire Allopoints Protect | RoullePro";
const DESCRIPTION =
  "Protégez votre permis, votre outil de travail. Allopoints Protect fait contester vos contraventions avec perte de points par des avocats spécialistes (95 % de réussite). −5 % avec RoullePro.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/partenaires/protection-permis" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    type: "article",
    images: ["/logo-roullepro-horizontal.png"],
  },
};

const FAQ: { q: string; a: string }[] = [
  {
    q: "Pourquoi RoullePro recommande Allopoints Protect ?",
    a: "Pour un taxi conventionné, un ambulancier ou un chauffeur de VSL, le permis de conduire est l'outil de travail. Une accumulation de pertes de points peut mettre en péril toute l'activité. Allopoints Protect s'appuie sur des avocats certifiés spécialistes en droit des infractions routières pour contester les contraventions et éviter la perte de points.",
  },
  {
    q: "Quelles infractions sont concernées ?",
    a: "Les contraventions entraînant une perte de points des 2e à 4e classe (excès de vitesse, non-respect de la signalisation, usage du téléphone au volant, etc.). Les avocats gèrent et contestent ces contraventions afin de préserver votre capital de points.",
  },
  {
    q: "Quel est le taux de réussite ?",
    a: "Allopoints Protect affiche un taux de réussite de 95 % sur les contestations menées par ses avocats certifiés (certification du Conseil National des Barreaux en droit des infractions routières).",
  },
  {
    q: "La contestation annule-t-elle l'amende ?",
    a: "Non. La contestation vise à éviter la perte de points, pas le paiement de l'amende. L'objectif est de préserver votre permis et donc votre capacité à exercer.",
  },
  {
    q: "Le contrat est-il rattaché à mon permis ?",
    a: "Oui. Le contrat est nominatif et rattaché au permis du conducteur. Il protège la personne titulaire du permis, où qu'elle conduise.",
  },
  {
    q: "Comment obtenir la remise RoullePro ?",
    a: "En passant par notre lien partenaire, vous bénéficiez de 5 % de remise. Il s'agit d'un lien d'affiliation : cela ne modifie ni les conditions ni la qualité du service.",
  },
];

export default function ProtectionPermisPage() {
  return (
    <main className="bg-slate-50 min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-amber-700 to-amber-900 text-white">
        <div className="max-w-5xl mx-auto px-4 py-14">
          <nav aria-label="Fil d'Ariane" className="text-sm text-amber-100 mb-5">
            <ol className="flex flex-wrap items-center gap-1">
              <li>
                <Link href="/" className="hover:text-white">
                  Accueil
                </Link>
              </li>
              <li>
                <ChevronRight className="inline h-3.5 w-3.5 mx-0.5" />
              </li>
              <li>
                <Link href="/partenaires" className="hover:text-white">
                  Partenaires
                </Link>
              </li>
              <li>
                <ChevronRight className="inline h-3.5 w-3.5 mx-0.5" />
              </li>
              <li className="text-white">Protection du permis</li>
            </ol>
          </nav>
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-3 py-1 rounded-full text-xs font-medium mb-4">
            <ShieldCheck className="h-3.5 w-3.5" />
            Partenaire RoullePro
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
            Protégez votre permis, c&apos;est votre outil de travail
          </h1>
          <p className="text-lg text-amber-50 max-w-3xl mb-6">
            Taxi conventionné, ambulancier, VSL : sans permis, pas d&apos;activité.
            Allopoints Protect fait contester vos contraventions avec perte de
            points par des avocats spécialistes du droit routier, avec un taux de
            réussite de 95 %.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <a
              href={ALLOPOINTS_PROTECT_URL}
              target="_blank"
              rel="sponsored noopener"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-amber-800 rounded-xl font-bold hover:bg-amber-50 transition shadow-lg"
            >
              Découvrir Allopoints Protect
              <ExternalLink className="h-4 w-4" />
            </a>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 border border-white/25 px-3 py-1.5 text-sm font-semibold">
              <Percent className="h-4 w-4" />
              −5 % avec RoullePro
            </span>
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          <article className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 md:p-10 prose prose-slate max-w-none prose-headings:scroll-mt-24 prose-h2:text-2xl prose-h2:font-bold prose-h2:mt-8 prose-h2:mb-4 prose-h3:text-lg prose-h3:font-semibold prose-h3:mt-6 prose-h3:mb-3 prose-p:leading-relaxed prose-li:my-0 prose-a:text-amber-700 hover:prose-a:text-amber-800 prose-strong:text-slate-900">
            <h2 id="pourquoi">Pourquoi protéger votre permis</h2>
            <p>
              Dans le transport sanitaire, le permis de conduire n&apos;est pas un
              simple document : c&apos;est l&apos;outil de travail. Un taxi
              conventionné, un ambulancier ou un chauffeur de VSL passe ses
              journées sur la route, avec une exposition mécaniquement plus forte
              aux contrôles et aux petites infractions. Une accumulation de pertes
              de points peut conduire à une suspension, voire à une invalidation du
              permis — et donc à l&apos;arrêt de l&apos;activité.
            </p>
            <p>
              <strong>Allopoints Protect</strong> est un service de protection du
              permis de conduire. Il s&apos;appuie sur des{" "}
              <strong>
                avocats certifiés spécialistes en droit des infractions routières
              </strong>{" "}
              (certification du Conseil National des Barreaux) qui gèrent et
              contestent les contraventions entraînant une perte de points, de la
              2e à la 4e classe. L&apos;objectif est clair : préserver votre
              capital de points, et donc votre capacité à exercer.
            </p>
            <p>
              La contestation vise à <strong>éviter la perte de points</strong>,
              pas le paiement de l&apos;amende. Le contrat est nominatif et
              rattaché au permis du conducteur. Le service affiche un{" "}
              <strong>taux de réussite de 95 %</strong> sur les contestations
              menées par ses avocats.
            </p>

            <h2 id="comment-ca-marche">Comment ça marche</h2>
            <ol>
              <li>
                <strong>Vous souscrivez un contrat nominatif</strong> rattaché à
                votre permis de conduire.
              </li>
              <li>
                <strong>En cas de contravention avec perte de points</strong> (2e
                à 4e classe), vous transmettez l&apos;avis.
              </li>
              <li>
                <strong>Un avocat spécialiste prend en charge le dossier</strong>{" "}
                et engage la contestation adaptée.
              </li>
              <li>
                <strong>La procédure vise à éviter le retrait de points</strong>{" "}
                pour préserver votre permis et votre activité.
              </li>
            </ol>

            <h2 id="pour-qui">À qui s&apos;adresse cette offre</h2>
            <ul>
              <li>
                <strong>Taxis conventionnés</strong> : le permis conditionne
                l&apos;agrément et la convention CPAM.
              </li>
              <li>
                <strong>Ambulanciers et sociétés d&apos;ambulance</strong> : la
                mobilité des équipages est vitale pour la continuité des
                transports.
              </li>
              <li>
                <strong>Chauffeurs de VSL</strong> : l&apos;activité repose
                entièrement sur la validité du permis.
              </li>
              <li>
                <strong>Dirigeants et salariés roulants</strong> : chaque permis
                protégé, c&apos;est un véhicule qui continue de tourner.
              </li>
            </ul>

            <div className="not-prose my-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                <Scale className="h-5 w-5 text-amber-700 mb-2" />
                <p className="text-sm font-semibold text-slate-900">
                  Avocats spécialistes
                </p>
                <p className="text-xs text-slate-600 mt-0.5">
                  Certifiés en droit des infractions routières (CNB).
                </p>
              </div>
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                <CheckCircle2 className="h-5 w-5 text-amber-700 mb-2" />
                <p className="text-sm font-semibold text-slate-900">
                  95 % de réussite
                </p>
                <p className="text-xs text-slate-600 mt-0.5">
                  Sur les contestations de perte de points.
                </p>
              </div>
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                <Percent className="h-5 w-5 text-amber-700 mb-2" />
                <p className="text-sm font-semibold text-slate-900">
                  −5 % avec RoullePro
                </p>
                <p className="text-xs text-slate-600 mt-0.5">
                  Remise via notre lien partenaire.
                </p>
              </div>
            </div>

            <h2 id="faq">Questions fréquentes</h2>
            <div className="not-prose space-y-3">
              {FAQ.map((it, idx) => (
                <details
                  key={idx}
                  className="group border border-slate-200 rounded-xl bg-white open:border-amber-200"
                >
                  <summary className="cursor-pointer p-4 text-sm font-semibold text-slate-900 list-none flex items-center justify-between gap-3">
                    <span>{it.q}</span>
                    <span className="text-slate-400 group-open:rotate-45 transition">
                      +
                    </span>
                  </summary>
                  <div className="px-4 pb-4 text-sm text-slate-700 leading-relaxed">
                    {it.a}
                  </div>
                </details>
              ))}
            </div>

            <h2 id="affilie">Transparence sur le lien partenaire</h2>
            <p className="text-sm text-slate-600">
              Lien partenaire. RoullePro peut percevoir une commission si vous
              souscrivez via ce lien, et vous bénéficiez de 5 % de remise. Cela ne
              modifie ni la qualité ni les conditions du service Allopoints
              Protect. Cette mention est rendue visible sur la page conformément à
              la réglementation. Pour plus d&apos;informations, consultez nos{" "}
              <Link href="/mentions-legales">mentions légales</Link>.
            </p>

            <div className="not-prose mt-10 pt-6 border-t border-slate-200 text-center">
              <a
                href={ALLOPOINTS_PROTECT_URL}
                target="_blank"
                rel="sponsored noopener"
                className="inline-flex items-center gap-2 px-6 py-3 bg-amber-700 hover:bg-amber-800 text-white rounded-xl font-bold transition shadow-md"
              >
                Protéger mon permis avec Allopoints Protect
                <ArrowRight className="h-4 w-4" />
              </a>
              <p className="text-xs text-slate-500 mt-3">
                Vous quittez RoullePro et accédez à allopoints.fr (ouverture dans
                un nouvel onglet).
              </p>
            </div>
          </article>

          {/* Sidebar */}
          <aside className="space-y-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Percent className="h-5 w-5 text-amber-700" />
                <h3 className="font-semibold text-slate-900">
                  −5 % avec RoullePro
                </h3>
              </div>
              <p className="text-sm text-slate-600 mb-4">
                Bénéficiez de 5 % de remise en souscrivant via notre lien
                partenaire.
              </p>
              <a
                href={ALLOPOINTS_PROTECT_URL}
                target="_blank"
                rel="sponsored noopener"
                className="block text-center px-4 py-2.5 bg-amber-700 hover:bg-amber-800 text-white rounded-lg font-semibold transition text-sm"
              >
                Découvrir l&apos;offre
              </a>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-3">
                Concerné
              </p>
              <ul className="space-y-2 text-sm text-slate-700">
                <li className="flex items-start gap-2">
                  <Car className="h-4 w-4 text-amber-700 mt-0.5 flex-shrink-0" />
                  Taxis conventionnés CPAM
                </li>
                <li className="flex items-start gap-2">
                  <Car className="h-4 w-4 text-amber-700 mt-0.5 flex-shrink-0" />
                  Ambulanciers
                </li>
                <li className="flex items-start gap-2">
                  <Car className="h-4 w-4 text-amber-700 mt-0.5 flex-shrink-0" />
                  Chauffeurs de VSL
                </li>
              </ul>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-3">
                Points clés
              </p>
              <ul className="space-y-2 text-sm text-slate-700">
                <li className="flex items-start gap-2">
                  <Scale className="h-4 w-4 text-amber-700 mt-0.5 flex-shrink-0" />
                  Avocats certifiés CNB
                </li>
                <li className="flex items-start gap-2">
                  <FileText className="h-4 w-4 text-amber-700 mt-0.5 flex-shrink-0" />
                  Contraventions 2e à 4e classe
                </li>
                <li className="flex items-start gap-2">
                  <ShieldCheck className="h-4 w-4 text-amber-700 mt-0.5 flex-shrink-0" />
                  Contrat nominatif, rattaché au permis
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
