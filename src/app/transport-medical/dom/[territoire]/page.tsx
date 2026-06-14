import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Car, ChevronRight, Shield, MapPin, BadgeCheck, Building2, Cross } from "lucide-react";
import { buildFaqJsonLd, buildBreadcrumbJsonLd } from "@/lib/sanitaire-seo";
import { DOM_TERRITOIRES, getDomTerritoire, type DomTerritoire } from "@/data/dom-territoires";

export const revalidate = 86400;
export const dynamicParams = false;

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://roullepro.com";

type Props = { params: Promise<{ territoire: string }> };

export function generateStaticParams() {
  return DOM_TERRITOIRES.map((t) => ({ territoire: t.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { territoire } = await params;
  const t = getDomTerritoire(territoire);
  if (!t) return {};
  const title = `Transport médical ${t.nom} (${t.dept}) — VSL, taxi, ambulance`;
  const description = `Transport médical conventionné à ${t.nom} : VSL, taxi conventionné et ambulance pris en charge par la ${t.caisse}. Tarifs, prescription, communes desservies et annuaire.`;
  return {
    title,
    description,
    alternates: { canonical: `/transport-medical/dom/${t.slug}` },
    openGraph: { title, description, type: "website", locale: "fr_FR" },
    twitter: { card: "summary", title, description },
  };
}

function buildIntro(t: DomTerritoire): string {
  const communes = t.communes.slice(0, 4).join(", ");
  return `À ${t.nom} (${t.dept}), le transport médical conventionné permet de te rendre à tes rendez-vous de soins (dialyse, chimiothérapie, radiothérapie, consultations de suivi, retour d'hospitalisation) en étant pris en charge par l'Assurance Maladie locale. En outre-mer, ce n'est pas une CPAM qui gère tes remboursements mais la ${t.caisseLibelle}. Que tu habites à ${communes} ou ailleurs sur le territoire, RoullePro t'aide à comprendre tes droits et à trouver une entreprise de transport sanitaire agréée et conventionnée. Sur prescription médicale, tu peux bénéficier d'un véhicule sanitaire léger (VSL), d'un taxi conventionné ou d'une ambulance selon ton état de santé, avec une prise en charge pouvant aller jusqu'à 100 % en affection longue durée (ALD). ${t.prefecture} concentre une part importante de l'offre de soins du territoire, mais le transport conventionné dessert l'ensemble des communes pour garantir l'accès aux établissements comme ${t.hopitaux[0]}.`;
}

function buildFaq(t: DomTerritoire): { question: string; answer: string }[] {
  return [
    {
      question: `Qui rembourse le transport médical à ${t.nom} ?`,
      answer: `À ${t.nom}, l'Assurance Maladie est gérée par la ${t.caisseLibelle}, et non par une CPAM comme en métropole. C'est donc la ${t.caisse} qui prend en charge tes frais de transport sanitaire conventionné, sur prescription médicale, selon les mêmes règles nationales de remboursement.`,
    },
    {
      question: `Le transport médical est-il remboursé à 100 % à ${t.nom} ?`,
      answer: `La prise en charge par la ${t.caisse} est de 100 % en cas d'affection longue durée (ALD), d'accident du travail, de maternité ou d'hospitalisation, et de 65 % pour les autres motifs, le reste pouvant être couvert par ta complémentaire santé. La prescription médicale de transport reste obligatoire dans tous les cas.`,
    },
    {
      question: `Faut-il avancer les frais de transport en outre-mer ?`,
      answer: `Avec le tiers payant, tu présentes ta carte Vitale et ton bon de transport, et tu n'avances pas la part remboursée par la ${t.caisse}. Dans la pratique, certaines entreprises de ${t.nom} peuvent encore demander une avance des frais : privilégie un transporteur conventionné qui applique la dispense d'avance pour éviter d'avancer l'argent.`,
    },
    {
      question: `Quels modes de transport sont conventionnés à ${t.nom} ?`,
      answer: `Comme en métropole, trois modes sont conventionnés à ${t.nom} : le taxi conventionné (transport assis d'un patient autonome), le VSL ou véhicule sanitaire léger (transport assis avec auxiliaire ambulancier) et l'ambulance (transport allongé avec surveillance). Le médecin coche le mode adapté à ton état sur la prescription, ce qui conditionne le remboursement par la ${t.caisse}.`,
    },
    {
      question: `Comment trouver un transporteur conventionné à ${t.nom} ?`,
      answer: `Demande la prescription de transport à ton médecin traitant ou hospitalier, puis contacte une entreprise agréée par l'ARS et conventionnée par la ${t.caisse}, basée dans ta commune ou à proximité (${t.communes.slice(0, 3).join(", ")}…). RoullePro centralise les coordonnées du transport sanitaire pour t'aider à identifier rapidement un professionnel disponible sur le territoire.`,
    },
  ];
}

export default async function DomTerritoirePage({ params }: Props) {
  const { territoire } = await params;
  const t = getDomTerritoire(territoire);
  if (!t) notFound();

  const intro = buildIntro(t);
  const faq = buildFaq(t);

  const faqLd = buildFaqJsonLd(faq);
  const breadLd = buildBreadcrumbJsonLd([
    { name: "Accueil", url: "/" },
    { name: "Transport médical", url: "/transport-medical" },
    { name: `${t.nom} (${t.dept})`, url: `/transport-medical/dom/${t.slug}` },
  ]);
  const serviceLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: "Transport médical conventionné (VSL, taxi conventionné, ambulance)",
    name: `Transport médical conventionné à ${t.nom}`,
    description: `Annuaire et guide du transport sanitaire conventionné à ${t.nom} (${t.dept}) : VSL, taxi conventionné et ambulance pris en charge par la ${t.caisse} sur prescription médicale.`,
    provider: { "@type": "Organization", name: "RoullePro", url: BASE_URL },
    areaServed: { "@type": "AdministrativeArea", name: `${t.region} (${t.dept})` },
    audience: { "@type": "Patient" },
    url: `${BASE_URL}/transport-medical/dom/${t.slug}`,
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-blue-50/30 to-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceLd) }} />

      <section className="bg-gradient-to-br from-[#0B1120] via-[#0f1d3a] to-[#0066CC] text-white">
        <div className="max-w-5xl mx-auto px-4 py-12">
          <nav className="flex items-center gap-2 text-xs text-blue-200 mb-4">
            <Link href="/" className="hover:text-white">Accueil</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/transport-medical" className="hover:text-white">Transport médical</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white">{t.nom}</span>
          </nav>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-medium mb-5">
            <MapPin className="w-3.5 h-3.5" />
            Outre-mer · {t.region} ({t.dept}) · Régime {t.caisse}
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">
            Transport médical {t.nom} — VSL, taxi conventionné et ambulance ({t.dept})
          </h1>
          <p className="text-blue-100 max-w-2xl">
            Le guide du transport sanitaire conventionné à {t.nom} : modes de transport, prise en charge par la{" "}
            {t.caisse}, communes desservies et démarches.
          </p>
        </div>
      </section>

      <article className="max-w-3xl mx-auto px-4 py-10 prose prose-sm sm:prose-base max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-li:text-gray-700">
        <p className="lead">{intro}</p>

        <section id="contexte">
          <h2>Le transport médical conventionné à {t.nom}</h2>
          <p>
            {t.nom} compte {t.population} et son offre de soins s'organise autour de {t.prefecture} et des
            principaux établissements du territoire ({t.hopitaux.slice(0, 2).join(", ")}). Les distances, le relief
            et l'éloignement de certaines communes rendent le transport médical conventionné particulièrement
            important pour accéder aux soins : dialyse, oncologie, rééducation, consultations spécialisées ou retour
            à domicile après hospitalisation. Le principe est le même qu'en métropole — un transport prescrit par un
            médecin et pris en charge par l'Assurance Maladie — mais c'est la {t.caisseLibelle} qui gère les
            remboursements localement.
          </p>
        </section>

        <section id="modes">
          <h2>Les trois modes de transport conventionné</h2>
          <div className="not-prose grid sm:grid-cols-3 gap-4 my-6">
            <div className="bg-white rounded-2xl p-5 border border-gray-200">
              <Car className="w-6 h-6 text-[#0066CC] mb-2" />
              <h3 className="font-semibold text-gray-900 mb-1">Taxi conventionné</h3>
              <p className="text-sm text-gray-600">
                Transport assis d'un patient autonome. Le chauffeur est conventionné par la {t.caisse} ; tarif
                encadré et tiers payant possible.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-gray-200">
              <BadgeCheck className="w-6 h-6 text-[#0066CC] mb-2" />
              <h3 className="font-semibold text-gray-900 mb-1">VSL</h3>
              <p className="text-sm text-gray-600">
                Véhicule sanitaire léger agréé ARS, conduit par un auxiliaire ambulancier formé aux premiers
                secours, pour un transport assis médicalisé.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-gray-200">
              <Cross className="w-6 h-6 text-[#0066CC] mb-2" />
              <h3 className="font-semibold text-gray-900 mb-1">Ambulance</h3>
              <p className="text-sm text-gray-600">
                Transport allongé avec surveillance médicale, pour les patients dont l'état nécessite une prise en
                charge sanitaire pendant le trajet.
              </p>
            </div>
          </div>
          <p>
            C'est ton médecin qui détermine, sur la prescription médicale de transport (CERFA 11574*07), le mode
            adapté à ton état de santé. Ce choix conditionne le remboursement par la {t.caisse} : un mode non
            prescrit ou supérieur à ce qui est nécessaire ne sera pas pris en charge. Pour aller plus loin, consulte
            nos guides nationaux du <Link href="/vsl">VSL</Link>, du{" "}
            <Link href="/taxi-conventionne">taxi conventionné</Link> et du{" "}
            <Link href="/transport-sanitaire">transport sanitaire</Link>.
          </p>
        </section>

        <section id="specificites">
          <h2>Spécificités outre-mer : la {t.caisse} au lieu de la CPAM</h2>
          <p>
            La grande particularité du transport médical à {t.nom} tient à l'organisation de la Sécurité sociale.
            En métropole, c'est une CPAM (Caisse Primaire d'Assurance Maladie) qui gère les remboursements. À{" "}
            {t.nom}, c'est la {t.caisseLibelle} qui assure ce rôle. Concrètement, les règles de prise en charge
            (100 % en ALD, accident du travail, maternité ou hospitalisation ; 65 % sinon) et la prescription
            médicale obligatoire restent identiques à la réglementation nationale, mais ton interlocuteur et le
            circuit administratif passent par la {t.caisse}.
          </p>
          <p>
            Point de vigilance local : la dispense d'avance des frais (tiers payant) n'est pas toujours appliquée
            de la même façon en outre-mer. Certaines entreprises peuvent encore demander une avance des frais que tu
            te fais ensuite rembourser par la {t.caisse} sur présentation de la facture, du bon de transport et de
            la prescription. Pour éviter d'avancer l'argent, demande systématiquement à l'entreprise si elle
            pratique le tiers payant, et conserve tous tes justificatifs. Pense aussi à vérifier que le transporteur
            est bien conventionné par la {t.caisse} et agréé par l'ARS : c'est la condition du remboursement.
          </p>
        </section>

        <section id="communes">
          <h2>Communes principales desservies à {t.nom}</h2>
          <p>
            Le transport médical conventionné dessert l'ensemble du territoire. Les principales communes où l'offre
            de transporteurs et d'établissements de santé est la plus dense sont notamment :
          </p>
          <ul>
            {t.communes.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
          <p>
            Que tu résides dans l'une de ces communes ou dans une zone plus isolée, tu peux faire appel à un
            transporteur conventionné pour rejoindre {t.prefecture} ou l'établissement de soins indiqué sur ta
            prescription. L'éloignement géographique est précisément l'une des raisons pour lesquelles le transport
            sanitaire conventionné est essentiel à {t.nom}.
          </p>
        </section>

        <section id="trouver">
          <h2>Comment trouver un transporteur conventionné à {t.nom} ?</h2>
          <p>
            La démarche se déroule en quelques étapes simples. D'abord, demande à ton médecin traitant ou
            hospitalier la prescription médicale de transport adaptée à ton état (taxi conventionné, VSL ou
            ambulance). Ensuite, contacte une entreprise de transport sanitaire agréée et conventionnée par la{" "}
            {t.caisse}, de préférence basée dans ta commune ou une commune voisine pour limiter les délais. Au
            moment du transport, présente ta carte Vitale, le bon de transport et la prescription : si l'entreprise
            applique le tiers payant, tu n'avances pas la part prise en charge.
          </p>
          <p>
            RoullePro centralise les coordonnées des professionnels du transport médical pour t'aider à identifier
            rapidement une entreprise disponible. Tu peux lancer une recherche sur l'annuaire du transport sanitaire
            ou contacter directement les transporteurs référencés.
          </p>
          <div className="not-prose bg-blue-50 border border-blue-100 rounded-2xl p-6 my-6">
            <div className="flex items-start gap-3">
              <Building2 className="w-5 h-5 text-[#0066CC] flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-gray-700 mb-3">
                  Tu es une entreprise de transport sanitaire à {t.nom} ? Référence-toi gratuitement dans l'annuaire
                  RoullePro pour être trouvé par les patients et les prescripteurs du territoire.
                </p>
                <Link
                  href="/transport-medical/inscription"
                  className="inline-flex items-center gap-1 text-sm text-[#0066CC] font-semibold hover:underline"
                >
                  Inscrire mon entreprise
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </article>

      <section className="max-w-5xl mx-auto px-4 pb-12">
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Questions fréquentes — Transport médical à {t.nom}</h2>
          <div className="space-y-4">
            {faq.map((q, i) => (
              <div key={i}>
                <h3 className="font-semibold text-gray-900 mb-1">{q.question}</h3>
                <p className="text-sm text-gray-700 leading-relaxed">{q.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-r from-blue-600 to-blue-700 py-12">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-medium text-white mb-4">
            <Shield className="w-3.5 h-3.5" />
            Annuaire public, gratuit, sans inscription
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">Besoin d'un transport médical à {t.nom} ?</h2>
          <p className="text-blue-100 mb-6 leading-relaxed">
            Trouve une ambulance, un VSL ou un taxi conventionné près de chez toi et vérifie ta prise en charge par
            la {t.caisse}.
          </p>
          <Link
            href="/transport-medical/recherche"
            className="inline-flex items-center gap-2 bg-white text-[#0066CC] font-semibold px-6 py-3 rounded-xl hover:bg-blue-50 transition"
          >
            Rechercher un transporteur
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}
