import type { Metadata } from "next";
import Link from "next/link";
import { Info, ExternalLink } from "lucide-react";
import { BASE_URL } from "@/lib/seo-schema";
import SefiLayout, { type SectionEntry } from "../_sefi/SefiLayout";
import SefiJsonLd from "../_sefi/SefiJsonLd";
import SefiCta from "../_sefi/SefiCta";
import SefiMaillage from "../_sefi/SefiMaillage";
import {
  SOLUTIONS,
  SOLUTIONS_PERIPHERIQUES,
  STATUT_LABEL,
  DATE_VERIFICATION,
  SOURCES,
  type Solution,
  type StatutCnda,
  type Source,
} from "@/lib/sefi-data";

const SLUG = "logiciels-sefi";
const TITLE = "Logiciels SEFi taxi conventionné : comparatif 2027";
const DESCRIPTION =
  "Comparatif neutre des logiciels de facturation SEFi et CNDA pour taxis conventionnés, VSL et ambulances : statut de certification, fonctions, prix et cible. Données vérifiées le 18 juillet 2026.";
const PUBLISHED_AT = "2026-07-18T08:00:00Z";
const UPDATED_AT = "2026-07-18T08:00:00Z";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${BASE_URL}/transport-medical/${SLUG}` },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: `${BASE_URL}/transport-medical/${SLUG}`,
    type: "article",
    publishedTime: PUBLISHED_AT,
    modifiedTime: UPDATED_AT,
    images: ["/logo-roullepro-horizontal.png"],
  },
};

const SECTIONS: SectionEntry[] = [
  { id: "methodologie", label: "Note méthodologique" },
  { id: "comparatif", label: "Tableau comparatif" },
  { id: "peripheriques", label: "Solutions périphériques" },
  { id: "disclaimer", label: "Avertissement" },
];

const STATUT_STYLE: Record<StatutCnda, string> = {
  certifie: "bg-emerald-50 text-emerald-700 border-emerald-200",
  revendique: "bg-amber-50 text-amber-700 border-amber-200",
  en_attente: "bg-slate-100 text-slate-600 border-slate-200",
};

function StatutBadge({ statut }: { statut: StatutCnda }) {
  return (
    <span
      className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full border ${STATUT_STYLE[statut]}`}
    >
      {STATUT_LABEL[statut]}
    </span>
  );
}

function EditeurLien({ solution }: { solution: Solution }) {
  if (!solution.siteUrl) {
    return <span className="text-slate-400">Site non communiqué</span>;
  }
  return (
    <a
      href={solution.siteUrl}
      target="_blank"
      rel="noopener"
      className="inline-flex items-center gap-1 text-blue-700 hover:underline"
    >
      Site éditeur
      <ExternalLink className="h-3 w-3" />
    </a>
  );
}

// Sources agrégées : note méthodologique + toutes les sources des solutions listées.
const PAGE_SOURCES: Source[] = [
  SOURCES.cndaActu,
  SOURCES.sesamSefi,
  SOURCES.cndaLogiciels,
  ...SOLUTIONS.flatMap((s) => s.sources),
  ...SOLUTIONS_PERIPHERIQUES.map((s) => s.source),
];

const ITEM_LIST = SOLUTIONS.map((s) => ({
  name: `${s.nom} (${s.editeur})`,
  url: s.siteUrl ?? undefined,
}));

export default function LogicielsSefiPage() {
  return (
    <>
      <SefiJsonLd
        slug={SLUG}
        title={TITLE}
        description={DESCRIPTION}
        breadcrumbLabel="Logiciels SEFi"
        publishedAt={PUBLISHED_AT}
        updatedAt={UPDATED_AT}
        itemList={ITEM_LIST}
      />
      <SefiLayout
        title="Comparatif des logiciels SEFi pour taxis conventionnés"
        intro="Une vingtaine de solutions de facturation certifiées ou référencées auprès du CNDA, comparées de façon neutre : statut de certification, fonctions, prix et cible. Aucun classement « meilleur » : les solutions certifiées CNDA sont présentées en premier."
        breadcrumbLabel="Logiciels SEFi"
        sections={SECTIONS}
        publishedDate="Juillet 2026"
        updatedAt={UPDATED_AT}
        sources={PAGE_SOURCES}
      >
        <section id="methodologie">
          <h2>Note méthodologique</h2>
          <div className="not-prose my-4 rounded-xl border border-blue-200 bg-blue-50 p-5">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-700 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-slate-800 space-y-2">
                <p>
                  Le <strong>SEFi Taxis est fermé / en refonte</strong> au CNDA et reste
                  «&nbsp;en expérimentation&nbsp;» côté SESAM-Vitale. En conséquence,{" "}
                  <strong>
                    aucun produit ne peut aujourd&apos;hui revendiquer une certification
                    «&nbsp;SEFi Taxis&nbsp;» en production
                  </strong>
                  .
                </p>
                <p>
                  Les statuts affichés ci-dessous correspondent aux{" "}
                  <strong>
                    certifications CNDA (SESAM-Vitale / norme B2, PEC+, SCOR)
                  </strong>{" "}
                  vérifiées le {DATE_VERIFICATION}. La mention «&nbsp;Certifié CNDA&nbsp;»
                  signifie que le produit figure dans la liste officielle du CNDA
                  (catégories Taxi conventionné et/ou Transports sanitaires), sans
                  préjuger d&apos;une future autorisation «&nbsp;SEFi Taxis&nbsp;». Les
                  mentions «&nbsp;certification revendiquée&nbsp;» et «&nbsp;référencement
                  en attente&nbsp;» reflètent des informations non confirmées sur la liste
                  officielle à ce stade.
                </p>
              </div>
            </div>
          </div>
          <p>
            Sources de référence :{" "}
            <a href={SOURCES.cndaActu.url} target="_blank" rel="noopener noreferrer">
              actualités CNDA
            </a>
            ,{" "}
            <a href={SOURCES.sesamSefi.url} target="_blank" rel="noopener noreferrer">
              page SEFi du GIE SESAM-Vitale
            </a>{" "}
            et{" "}
            <a href={SOURCES.cndaLogiciels.url} target="_blank" rel="noopener noreferrer">
              liste des logiciels certifiés CNDA
            </a>
            . Les liens vers les éditeurs sont fournis à titre informatif, sans
            affiliation ni contrepartie commerciale.
          </p>
        </section>

        <section id="comparatif">
          <h2>Tableau comparatif</h2>
          <p>
            Ordre d&apos;affichage : solutions <strong>certifiées CNDA d&apos;abord</strong>,
            puis certifications revendiquées et référencements en attente. À
            l&apos;intérieur de chaque groupe, aucun tri qualitatif n&apos;est appliqué.
          </p>

          {/* Mobile : cartes */}
          <div className="not-prose md:hidden space-y-4 my-6">
            {SOLUTIONS.map((s) => (
              <div
                key={s.nom}
                className="rounded-xl border border-slate-200 bg-white p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-bold text-slate-900">{s.nom}</h3>
                  <StatutBadge statut={s.statutCnda} />
                </div>
                <p className="text-xs text-slate-500 mt-0.5">{s.editeur}</p>
                <dl className="mt-3 space-y-2 text-sm">
                  <div>
                    <dt className="font-semibold text-slate-700">Statut CNDA</dt>
                    <dd className="text-slate-600">{s.statutDetail}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-slate-700">Fonctions</dt>
                    <dd className="text-slate-600">{s.fonctions}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-slate-700">Prix</dt>
                    <dd className="text-slate-600">{s.prix}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-slate-700">Cible</dt>
                    <dd className="text-slate-600">{s.cible}</dd>
                  </div>
                </dl>
                <div className="mt-3 text-sm">
                  <EditeurLien solution={s} />
                </div>
              </div>
            ))}
          </div>

          {/* Desktop : tableau */}
          <div className="not-prose hidden md:block my-6 overflow-x-auto">
            <table className="w-full text-sm border border-slate-200 rounded-lg">
              <thead className="bg-slate-100 text-slate-700">
                <tr>
                  <th className="text-left px-3 py-2 font-semibold">Produit</th>
                  <th className="text-left px-3 py-2 font-semibold">Éditeur</th>
                  <th className="text-left px-3 py-2 font-semibold">Statut CNDA</th>
                  <th className="text-left px-3 py-2 font-semibold">Fonctions clés</th>
                  <th className="text-left px-3 py-2 font-semibold">Prix</th>
                  <th className="text-left px-3 py-2 font-semibold">Cible</th>
                  <th className="text-left px-3 py-2 font-semibold">Lien</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 align-top">
                {SOLUTIONS.map((s) => (
                  <tr key={s.nom}>
                    <td className="px-3 py-2 font-medium text-slate-900">{s.nom}</td>
                    <td className="px-3 py-2 text-slate-600">{s.editeur}</td>
                    <td className="px-3 py-2">
                      <StatutBadge statut={s.statutCnda} />
                      <p className="text-xs text-slate-500 mt-1">{s.statutDetail}</p>
                    </td>
                    <td className="px-3 py-2 text-slate-600">{s.fonctions}</td>
                    <td className="px-3 py-2 text-slate-600">{s.prix}</td>
                    <td className="px-3 py-2 text-slate-600">{s.cible}</td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <EditeurLien solution={s} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section id="peripheriques">
          <h2>Solutions périphériques</h2>
          <p>
            Ces services ne sont pas des logiciels de télétransmission certifiés CNDA
            mais peuvent compléter ou externaliser la gestion de la facturation. Ils
            sont mentionnés à titre indicatif, hors comparatif principal.
          </p>
          <div className="not-prose my-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {SOLUTIONS_PERIPHERIQUES.map((s) => (
              <div
                key={s.nom}
                className="rounded-xl border border-slate-200 bg-white p-5"
              >
                <h3 className="font-bold text-slate-900">{s.nom}</h3>
                <p className="text-sm text-slate-600 mt-1">{s.description}</p>
                <p className="text-sm font-medium text-slate-800 mt-2">{s.prix}</p>
                <a
                  href={s.source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-700 hover:underline mt-2 inline-block"
                >
                  Source : {s.source.nom}
                </a>
              </div>
            ))}
          </div>
        </section>

        <section id="disclaimer">
          <h2>Avertissement</h2>
          <div className="not-prose my-4 rounded-xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-700">
            <p>
              Informations vérifiées au {DATE_VERIFICATION} auprès des sources citées.
              Elles sont susceptibles d&apos;évoluer, notamment en fonction de la
              réouverture du service SEFi Taxis et de la publication des décrets
              d&apos;application. Les prix marqués «&nbsp;non communiqué&nbsp;» nécessitent
              un devis auprès de l&apos;éditeur. Avant tout engagement, vérifiez le statut
              exact de la solution auprès de l&apos;éditeur et de votre CPAM.
            </p>
          </div>
          <p>
            Pour comprendre l&apos;obligation, consultez notre page{" "}
            <Link href="/transport-medical/sefi-2027">SEFi 2027</Link> ; pour la partie
            matérielle, voir la{" "}
            <Link href="/transport-medical/geolocalisation-taxi-conventionne">
              géolocalisation du taxi conventionné
            </Link>
            .
          </p>
        </section>

        <SefiCta />

        <SefiMaillage current="logiciels-sefi" />
      </SefiLayout>
    </>
  );
}
