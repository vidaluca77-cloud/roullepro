import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  ChevronRight,
  Clock,
  ExternalLink,
  FileText,
  Phone,
  ShieldCheck,
} from "lucide-react";

export const revalidate = 86400;

const GIVA_URL = "https://go.giva.fr/?src=LucasH";
const TITLE = "Économisez sur vos assurances avec Giva — Partenaire RoullePro";
const DESCRIPTION =
  "Giva aide à faire le point sur vos contrats d'assurance personnels (auto, habitation, emprunteur, deux-roues, PNO) avec un parcours annoncé en 2 minutes et des économies moyennes affichées de 720 €/an.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/partenaires/assurance-pro" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    type: "article",
    images: ["/logo-roullepro-horizontal.png"],
  },
};

const FAQ: { q: string; a: string }[] = [
  {
    q: "Cette page concerne-t-elle l'assurance professionnelle de mon entreprise ?",
    a: "Non. Cette page conserve son URL historique, mais le contenu concerne Giva comme service de regroupement d'assurances pour particuliers. Elle ne décrit pas une assurance professionnelle pour votre activité de transport sanitaire.",
  },
  {
    q: "Quels contrats personnels peuvent être concernés ?",
    a: "Selon votre situation, Giva met en avant le regroupement de contrats comme l'auto, le deux-roues, l'habitation, l'emprunteur et le propriétaire non occupant. L'objectif est de faire le point sur vos assurances du quotidien avec un seul interlocuteur.",
  },
  {
    q: "Comment se passe le parcours ?",
    a: "Giva présente un premier audit en ligne très court, puis une mise en relation avec des agents généraux partenaires pour étudier les contrats à regrouper et les économies possibles.",
  },
  {
    q: "Le lien Giva est-il un lien d'affiliation ?",
    a: "Oui. RoullePro peut percevoir une commission si vous souscrivez via ce lien. Cela ne modifie ni le prix payé ni les conditions proposées par Giva ou ses partenaires.",
  },
];

export default function AssuranceProPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <section className="bg-gradient-to-br from-blue-800 to-blue-900 text-white">
        <div className="max-w-5xl mx-auto px-4 py-14">
          <nav aria-label="Fil d'Ariane" className="mb-5 text-sm text-blue-100">
            <ol className="flex flex-wrap items-center gap-1">
              <li>
                <Link href="/" className="hover:text-white">
                  Accueil
                </Link>
              </li>
              <li>
                <ChevronRight className="mx-0.5 inline h-3.5 w-3.5" />
              </li>
              <li>
                <Link href="/partenaires" className="hover:text-white">
                  Partenaires
                </Link>
              </li>
              <li>
                <ChevronRight className="mx-0.5 inline h-3.5 w-3.5" />
              </li>
              <li className="text-white">Assurances</li>
            </ol>
          </nav>

          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium">
            <ShieldCheck className="h-3.5 w-3.5" />
            Partenaire RoullePro
          </div>

          <h1 className="mb-4 text-3xl font-bold leading-tight md:text-4xl">
            Faites le point sur vos assurances personnelles avec Giva
          </h1>
          <p className="mb-6 max-w-3xl text-lg text-blue-50">
            Quand on conduit toute la journée ou qu&apos;on dirige une structure,
            on cumule souvent de nombreux contrats perso : auto, habitation,
            emprunteur, deux-roues, parfois PNO. Giva propose de les regrouper
            avec un parcours annoncé en 2 minutes, un accompagnement par des
            agents généraux et des économies affichées de 720 €/an en moyenne.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href={GIVA_URL}
              target="_blank"
              rel="noopener sponsored"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-bold text-blue-800 shadow-lg transition hover:bg-blue-50"
            >
              Faire le point avec Giva
              <ExternalLink className="h-4 w-4" />
            </a>
            <Link
              href="/partenaires"
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
            >
              Voir tous nos partenaires
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 py-12">
        <div className="grid gap-8 lg:grid-cols-3">
          <article className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 md:p-10">
            <div className="space-y-6 text-slate-700">
              <section>
                <h2 className="text-2xl font-bold text-slate-900">
                  Pourquoi cette page existe sur RoullePro
                </h2>
                <p className="mt-4 leading-relaxed">
                  La plupart des chauffeurs, dirigeants et indépendants du
                  transport sanitaire gèrent d&apos;un côté leur activité
                  professionnelle, et de l&apos;autre leur budget personnel.
                  C&apos;est souvent là que s&apos;empilent les contrats :
                  assurance auto perso, habitation, prêt immobilier,
                  deux-roues ou propriétaire non occupant.
                </p>
                <p className="mt-4 leading-relaxed">
                  Cette page ne parle donc pas d&apos;une assurance métier pour
                  ambulance, VSL ou taxi conventionné. Elle présente Giva comme
                  un service de regroupement d&apos;assurances pour particuliers,
                  utile pour ceux qui veulent remettre à plat leurs contrats
                  personnels et gagner en lisibilité.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900">
                  Ce que Giva met en avant
                </h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                    <Clock className="mb-2 h-5 w-5 text-blue-700" />
                    <p className="text-sm font-semibold text-slate-900">
                      Parcours rapide
                    </p>
                    <p className="mt-1 text-xs text-slate-600">
                      Une situation à renseigner en 2 minutes selon Giva.
                    </p>
                  </div>
                  <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                    <FileText className="mb-2 h-5 w-5 text-blue-700" />
                    <p className="text-sm font-semibold text-slate-900">
                      Vision globale
                    </p>
                    <p className="mt-1 text-xs text-slate-600">
                      Un audit pour faire le point sur plusieurs contrats du
                      quotidien.
                    </p>
                  </div>
                  <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                    <Phone className="mb-2 h-5 w-5 text-blue-700" />
                    <p className="text-sm font-semibold text-slate-900">
                      Accompagnement humain
                    </p>
                    <p className="mt-1 text-xs text-slate-600">
                      Des échanges avec des agents généraux partenaires.
                    </p>
                  </div>
                </div>
                <p className="mt-4 leading-relaxed">
                  Giva communique sur un regroupement de contrats qui permet de
                  simplifier la gestion, d&apos;éviter les doublons de garanties
                  et de rechercher des économies. Le site met en avant jusqu&apos;à
                  30 % d&apos;économies et 720 €/an en moyenne selon les dossiers.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900">
                  Contrats personnels souvent concernés
                </h2>
                <ul className="mt-4 space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-600" />
                    <span>
                      <strong className="text-slate-900">Auto</strong> :
                      particulièrement pertinent quand plusieurs véhicules ou
                      conducteurs coexistent dans le foyer.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-600" />
                    <span>
                      <strong className="text-slate-900">Deux-roues</strong> :
                      scooter ou moto, souvent oubliés alors qu&apos;ils pèsent
                      vite dans le budget annuel.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-600" />
                    <span>
                      <strong className="text-slate-900">Habitation / MRH</strong> :
                      résidence principale, secondaire ou logement étudiant selon
                      les situations.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-600" />
                    <span>
                      <strong className="text-slate-900">Emprunteur</strong> :
                      un poste de dépense important dès qu&apos;un crédit immobilier
                      est en cours.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-600" />
                    <span>
                      <strong className="text-slate-900">PNO</strong> :
                      propriétaire non occupant pour les profils qui possèdent
                      un bien locatif.
                    </span>
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900">
                  Comment se passe la démarche
                </h2>
                <ol className="mt-4 space-y-4">
                  <li className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <strong className="text-slate-900">1. Vous renseignez votre situation.</strong>
                    <p className="mt-1 text-sm leading-6">
                      Giva annonce un premier parcours très court pour lister les
                      contrats que vous avez déjà.
                    </p>
                  </li>
                  <li className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <strong className="text-slate-900">2. Vos contrats sont étudiés.</strong>
                    <p className="mt-1 text-sm leading-6">
                      L&apos;objectif est d&apos;identifier les regroupements
                      possibles et les économies potentielles.
                    </p>
                  </li>
                  <li className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <strong className="text-slate-900">3. Un agent vous recontacte.</strong>
                    <p className="mt-1 text-sm leading-6">
                      Vous échangez avec un interlocuteur humain pour affiner la
                      solution proposée.
                    </p>
                  </li>
                  <li className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <strong className="text-slate-900">4. Vous décidez librement.</strong>
                    <p className="mt-1 text-sm leading-6">
                      Vous choisissez ensuite de poursuivre ou non selon les
                      conditions obtenues.
                    </p>
                  </li>
                </ol>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900">
                  Questions fréquentes
                </h2>
                <div className="mt-4 space-y-3">
                  {FAQ.map((item) => (
                    <details
                      key={item.q}
                      className="group rounded-xl border border-slate-200 bg-white open:border-blue-200"
                    >
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4 text-sm font-semibold text-slate-900">
                        <span>{item.q}</span>
                        <span className="text-slate-400 transition group-open:rotate-45">
                          +
                        </span>
                      </summary>
                      <div className="px-4 pb-4 text-sm leading-relaxed text-slate-700">
                        {item.a}
                      </div>
                    </details>
                  ))}
                </div>
              </section>

              <section className="border-t border-slate-200 pt-6">
                <h2 className="text-xl font-bold text-slate-900">
                  Transparence sur le lien partenaire
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Lien partenaire. RoullePro peut percevoir une commission si
                  vous utilisez ce lien. Cela ne modifie ni le prix ni les
                  conditions proposées par Giva. Pour plus d&apos;informations,
                  consultez nos{" "}
                  <Link href="/mentions-legales" className="text-blue-700 hover:text-blue-800">
                    mentions légales
                  </Link>
                  .
                </p>
              </section>

              <div className="border-t border-slate-200 pt-6 text-center">
                <a
                  href={GIVA_URL}
                  target="_blank"
                  rel="noopener sponsored"
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-6 py-3 font-bold text-white shadow-md transition hover:bg-blue-800"
                >
                  Découvrir Giva
                  <ArrowRight className="h-4 w-4" />
                </a>
                <p className="mt-3 text-xs text-slate-500">
                  Vous quittez RoullePro et ouvrez go.giva.fr dans un nouvel
                  onglet.
                </p>
              </div>
            </div>
          </article>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="mb-3 flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-blue-700" />
                <h3 className="font-semibold text-slate-900">En bref</h3>
              </div>
              <ul className="space-y-2 text-sm text-slate-700">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-600" />
                  Regroupement d&apos;assurances personnelles
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-600" />
                  Parcours annoncé en 2 minutes
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-600" />
                  Agents généraux partenaires
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-600" />
                  Économies affichées de 720 €/an en moyenne
                </li>
              </ul>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
              <div className="mb-3 flex items-center gap-2">
                <FileText className="h-5 w-5 text-amber-700" />
                <h3 className="font-semibold text-slate-900">Point important</h3>
              </div>
              <p className="text-sm leading-6 text-slate-700">
                Cette page ne décrit pas une assurance professionnelle pour le
                transport sanitaire. Le slug historique est conservé uniquement
                pour ne pas casser les liens existants.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="mb-3 flex items-center gap-2">
                <Building2 className="h-5 w-5 text-blue-700" />
                <h3 className="font-semibold text-slate-900">
                  Profils souvent concernés
                </h3>
              </div>
              <ul className="space-y-2 text-sm text-slate-700">
                <li>Dirigeants qui veulent simplifier leurs contrats perso</li>
                <li>Chauffeurs avec auto + habitation + deux-roues</li>
                <li>Foyers avec crédit immobilier et assurance emprunteur</li>
                <li>Propriétaires bailleurs avec contrat PNO</li>
              </ul>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
