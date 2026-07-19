import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { Car, ChevronRight, Shield, Search, MapPin } from "lucide-react";
import { buildFaqJsonLd, buildBreadcrumbJsonLd } from "@/lib/sanitaire-seo";
import { getProStats } from "@/lib/stats";
import { REGLES_VSL, REGLES_AMBULANCE } from "@/lib/tarif-transport-sanitaire";
import { ArticlesLiesPilier } from "@/components/blog/ArticlesLiesPilier";

export const revalidate = 3600;

// Montants tarifaires : lus depuis les libs (aucun chiffre en dur), formatés en euros.
const euro = (n: number) =>
  n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";

const TITLE = "VSL Véhicule Sanitaire Léger 2026 — Remboursement, prescription, tarifs";
const DESCRIPTION =
  "Tout sur le VSL : définition, prescription médicale, remboursement CPAM, différence avec ambulance et taxi conventionné. Annuaire France entière.";
const H1 = "VSL — Véhicule Sanitaire Léger : guide complet 2026 et annuaire France";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://roullepro.com";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/vsl" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    type: "website",
    locale: "fr_FR",
  },
  twitter: {
    card: "summary",
    title: TITLE,
    description: DESCRIPTION,
  },
};

// 10 plus grandes villes : fallback de maillage interne vers les hubs ville,
// utilise aussi pour proposer un acces rapide a l'annuaire VSL local.
const VILLES_PRINCIPALES: { nom: string; slug: string }[] = [
  { nom: "Paris", slug: "paris" },
  { nom: "Marseille", slug: "marseille" },
  { nom: "Lyon", slug: "lyon" },
  { nom: "Toulouse", slug: "toulouse" },
  { nom: "Nice", slug: "nice" },
  { nom: "Nantes", slug: "nantes" },
  { nom: "Montpellier", slug: "montpellier" },
  { nom: "Strasbourg", slug: "strasbourg" },
  { nom: "Bordeaux", slug: "bordeaux" },
  { nom: "Lille", slug: "lille" },
];

// Maillage cible "VSL [ville]" : villes prioritaires vers les hubs ville + categorie VSL.
const VILLES_VSL_PRIORITAIRES: { nom: string; slug: string }[] = [
  { nom: "Nice", slug: "nice" },
  { nom: "Marseille", slug: "marseille" },
  { nom: "Lille", slug: "lille" },
  { nom: "Caen", slug: "caen" },
  { nom: "Rouen", slug: "rouen" },
  { nom: "Valence", slug: "valence" },
  { nom: "Saint-Étienne", slug: "saint-etienne" },
  { nom: "Nancy", slug: "nancy" },
  { nom: "Metz", slug: "metz" },
  { nom: "Reims", slug: "reims" },
];

// Reutilise la logique d'annuaire existante (table pros_sanitaire_public + filtre
// categorie="vsl") pour lister les villes ayant le plus de VSL referencés.
async function getTopVillesVsl(): Promise<{ ville: string; ville_slug: string; departement: string; count: number }[]> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const rows: { ville: string; ville_slug: string; departement: string }[] = [];
  let from = 0;
  const size = 1000;
  for (let i = 0; i < 10; i += 1) {
    const { data } = await supabase
      .from("pros_sanitaire_public")
      .select("ville, ville_slug, departement")
      .eq("actif", true)
      .eq("categorie", "vsl")
      .range(from, from + size - 1);
    if (!data || data.length === 0) break;
    rows.push(...data);
    if (data.length < size) break;
    from += size;
  }
  const map = new Map<string, { ville: string; ville_slug: string; departement: string; count: number }>();
  for (const row of rows) {
    if (!row.ville_slug) continue;
    const cur = map.get(row.ville_slug);
    if (cur) cur.count += 1;
    else map.set(row.ville_slug, { ...row, count: 1 });
  }
  return Array.from(map.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 24);
}

const FAQ: { question: string; answer: string }[] = [
  {
    question: "Qu'est-ce qu'un VSL ?",
    answer:
      "Le VSL (Véhicule Sanitaire Léger) est un véhicule agréé par l'ARS et conventionné CPAM, dédié au transport de patients en position assise ne nécessitant pas une surveillance médicale constante. Il est conduit par un personnel formé aux gestes de premiers secours et équipé d'un siège avant pivotant facilitant l'accès.",
  },
  {
    question: "Quelle différence entre VSL et taxi conventionné ?",
    answer:
      "Le taxi conventionné est un taxi traditionnel ayant signé une convention avec la CPAM, mais sans personnel sanitaire formé. Le VSL appartient à une entreprise de transport sanitaire, son chauffeur a suivi une formation de premiers secours et l'entreprise dispose d'un agrément ARS spécifique. Le médecin choisit selon l'état du patient.",
  },
  {
    question: "Le VSL est-il remboursé par la CPAM ?",
    answer:
      "Oui. Le remboursement est de 55 % du tarif conventionnel pour les motifs courants, le complément étant pris en charge par votre mutuelle complémentaire santé. Il passe à 100 % en cas d'affection de longue durée (ALD) en lien avec le transport, d'accident du travail ou de maladie professionnelle, de maternité à partir du 1er jour du 6e mois, ou pour les bénéficiaires de la complémentaire santé solidaire (CSS) et de l'AME.",
  },
  {
    question: "Quel est le tarif d'un VSL en 2026 ?",
    answer: `Le tarif VSL est fixé par la convention nationale des transporteurs sanitaires (avenant 11, tarif majoré) : forfait départemental de ${euro(REGLES_VSL.forfait)} incluant les trois premiers kilomètres, puis ${euro(REGLES_VSL.tauxKm)}/km au-delà, avec majorations de nuit, dimanche et jours fériés. Le tarif global d'une course est encadré et la dispense d'avance des frais (tiers payant) s'applique.`,
  },
  {
    question: "Combien de temps faut-il pour réserver un VSL ?",
    answer:
      "Pour un transport programmé (consultation, dialyse, chimiothérapie, sortie d'hospitalisation), il est recommandé de réserver le VSL au moins 24 à 48 heures à l'avance afin de garantir la disponibilité d'un véhicule. Les sociétés disposant d'un standard dédié peuvent traiter certaines demandes le jour même selon leur planning.",
  },
  {
    question: "Le VSL transporte-t-il en urgence ?",
    answer:
      "Non. Le VSL est réservé aux patients en état stable transportés en position assise, sans surveillance médicale durant le trajet. Pour une urgence ou un patient devant être allongé, c'est une ambulance qui est requise. En cas d'urgence vitale, composez le 15 (SAMU).",
  },
  {
    question: "Comment trouver un VSL agréé près de chez moi ?",
    answer:
      "Utilisez l'annuaire RoullePro pour localiser les sociétés de VSL agréées et conventionnées CPAM dans votre ville ou votre département. Chaque fiche indique le téléphone direct, la zone d'intervention et le statut de conventionnement, vérifié auprès des données publiques.",
  },
  {
    question: "Quels sont les motifs médicaux justifiant un VSL ?",
    answer:
      "Le VSL est indiqué pour les patients devant être transportés assis et dont l'état nécessite l'aide d'un tiers : séances de dialyse, chimiothérapie, radiothérapie, consultations de suivi, examens d'imagerie, retours d'hospitalisation. Le médecin coche le mode de transport adapté sur la prescription médicale (bon de transport).",
  },
];

export default async function VslPage() {
  const stats = await getProStats();
  const topVillesVsl = await getTopVillesVsl();

  const faqLd = buildFaqJsonLd(FAQ);
  const breadLd = buildBreadcrumbJsonLd([
    { name: "Accueil", url: "/" },
    { name: "Transport médical", url: "/transport-medical" },
    { name: "VSL", url: "/vsl" },
  ]);
  const serviceLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: "Transport sanitaire en VSL (Véhicule Sanitaire Léger)",
    name: "Annuaire national VSL conventionné CPAM",
    description:
      "Annuaire France entière des sociétés de VSL agréées ARS et conventionnées CPAM. Transport assis sur prescription, remboursé par la Sécurité sociale.",
    provider: { "@type": "Organization", name: "RoullePro", url: BASE_URL },
    areaServed: { "@type": "Country", name: "France" },
    audience: { "@type": "Patient" },
    url: `${BASE_URL}/vsl`,
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-blue-50/30 to-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceLd) }} />

      <section className="bg-gradient-to-br from-[#0B1120] via-[#0f1d3a] to-[#0066CC] text-white">
        <div className="max-w-5xl mx-auto px-4 py-14">
          <nav className="flex items-center gap-2 text-xs text-blue-200 mb-4">
            <Link href="/" className="hover:text-white">Accueil</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/transport-medical" className="hover:text-white">Transport médical</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white">VSL</span>
          </nav>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-medium mb-5">
            <Car className="w-3.5 h-3.5" />
            Guide complet et annuaire France entière
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">{H1}</h1>
          <p className="text-blue-100 max-w-2xl">
            Définition, prescription, tarif convention CPAM 2025-2026, remboursement et annuaire des sociétés
            VSL agréées. Tout ce qu'il faut savoir pour organiser un transport assis remboursé par la Sécurité sociale.
          </p>
        </div>
      </section>

      <article className="max-w-3xl mx-auto px-4 py-12 prose prose-sm sm:prose-base max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-li:text-gray-700">

        <section id="definition">
          <h2>Qu'est-ce qu'un VSL ?</h2>
          <p>
            Le VSL, ou Véhicule Sanitaire Léger, est un véhicule de transport assis professionnalisé agréé par
            l'Agence Régionale de Santé (ARS) et conventionné avec la CPAM. Il est destiné aux patients dont l'état
            de santé est stable mais qui ne peuvent pas se déplacer seuls et doivent voyager en position assise,
            sans surveillance médicale constante. Concrètement, il s'agit le plus souvent d'une berline ou d'un
            monospace banalisé, identifié par une étoile bleue à six branches, pouvant transporter jusqu'à trois
            patients simultanément.
          </p>
          <p>
            Le conducteur d'un VSL est titulaire d'une attestation de formation aux gestes et soins d'urgence et,
            le plus souvent, du diplôme d'auxiliaire ambulancier. L'entreprise qui exploite le VSL relève du
            transport sanitaire et détient un agrément ARS spécifique, distinct de la simple convention CPAM des
            taxis. Le VSL se situe ainsi à mi-chemin entre le taxi conventionné, sans qualification sanitaire, et
            l'ambulance, réservée aux transports allongés ou médicalisés.
          </p>
        </section>

        <section id="differences">
          <h2>Différence entre VSL, ambulance et taxi conventionné</h2>
          <p>
            Trois modes de transport sanitaire coexistent et répondent chacun à un besoin précis indiqué par le
            médecin sur la prescription. Le tableau suivant les compare critère par critère.
          </p>
          <div className="overflow-x-auto not-prose my-6">
            <table className="w-full text-sm border border-gray-200 rounded-lg">
              <thead className="bg-gray-50 text-gray-900">
                <tr>
                  <th className="text-left font-semibold px-3 py-2 border-b border-gray-200">Critère</th>
                  <th className="text-left font-semibold px-3 py-2 border-b border-gray-200">VSL</th>
                  <th className="text-left font-semibold px-3 py-2 border-b border-gray-200">Ambulance</th>
                  <th className="text-left font-semibold px-3 py-2 border-b border-gray-200">Taxi conventionné</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                <tr className="border-b border-gray-100">
                  <td className="px-3 py-2 font-medium">Conducteur</td>
                  <td className="px-3 py-2">Auxiliaire ambulancier formé aux premiers secours</td>
                  <td className="px-3 py-2">Équipage de 2 dont un DEA (Diplôme d'État d'Ambulancier)</td>
                  <td className="px-3 py-2">Chauffeur de taxi sans qualification sanitaire</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="px-3 py-2 font-medium">Agrément requis</td>
                  <td className="px-3 py-2">Agrément ARS transport sanitaire</td>
                  <td className="px-3 py-2">Agrément ARS transport sanitaire</td>
                  <td className="px-3 py-2">Convention CPAM (pas d'agrément ARS)</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="px-3 py-2 font-medium">Position de transport</td>
                  <td className="px-3 py-2">Assise</td>
                  <td className="px-3 py-2">Allongée (brancard)</td>
                  <td className="px-3 py-2">Assise</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="px-3 py-2 font-medium">Équipement médical</td>
                  <td className="px-3 py-2">Léger (trousse de secours)</td>
                  <td className="px-3 py-2">Oxygène, brancard, défibrillateur, matériel de secours</td>
                  <td className="px-3 py-2">Aucun</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="px-3 py-2 font-medium">Indication patient</td>
                  <td className="px-3 py-2">État stable, déplacement assis avec aide</td>
                  <td className="px-3 py-2">Patient allongé, surveillance ou urgence</td>
                  <td className="px-3 py-2">Patient autonome assis</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="px-3 py-2 font-medium">Prescription</td>
                  <td className="px-3 py-2">Obligatoire (bon de transport)</td>
                  <td className="px-3 py-2">Obligatoire (bon de transport)</td>
                  <td className="px-3 py-2">Obligatoire (bon de transport)</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="px-3 py-2 font-medium">Tarif référence</td>
                  <td className="px-3 py-2">Forfait {euro(REGLES_VSL.forfait)} + {euro(REGLES_VSL.tauxKm)}/km au-delà des km inclus</td>
                  <td className="px-3 py-2">Forfait {euro(REGLES_AMBULANCE.forfait)} + {euro(REGLES_AMBULANCE.tauxKm)}/km au-delà des km inclus</td>
                  <td className="px-3 py-2">Prise en charge + tarif kilométrique départemental (grille CPAM)</td>
                </tr>
                <tr>
                  <td className="px-3 py-2 font-medium">Remboursement CPAM</td>
                  <td className="px-3 py-2">100 % ALD / AT-MP / maternité, 55 % autres motifs</td>
                  <td className="px-3 py-2">100 % ALD / AT-MP / maternité, 55 % autres motifs</td>
                  <td className="px-3 py-2">100 % ALD / AT-MP / maternité, 55 % autres motifs</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section id="quand">
          <h2>Quand utiliser un VSL ?</h2>
          <p>
            Le VSL est prescrit lorsque le patient peut voyager assis mais a besoin d'une aide pour se déplacer ou
            d'un transport adapté en raison de son état de santé. Les principales indications médicales sont :
          </p>
          <ul>
            <li>Séances itératives de dialyse, plusieurs fois par semaine ;</li>
            <li>Cures de chimiothérapie et séances de radiothérapie ;</li>
            <li>Consultations de suivi d'une affection longue durée (ALD) ;</li>
            <li>Examens d'imagerie médicale (IRM, scanner) sur prescription ;</li>
            <li>Retours d'hospitalisation pour un patient stable mais affaibli ;</li>
            <li>Soins de rééducation et de kinésithérapie programmés ;</li>
            <li>Transport d'une personne à mobilité réduite nécessitant un accompagnement.</li>
          </ul>
        </section>

        <section id="prescription">
          <h2>Prescription et démarches</h2>
          <p>
            Le recours au VSL nécessite une prescription médicale de transport, établie par le médecin traitant ou
            le médecin hospitalier sur le formulaire CERFA 11574*07 (référence S3138g). Le médecin coche le mode de
            transport adapté à l'état du patient : VSL, taxi conventionné ou ambulance. Ce choix est médical et
            conditionne le remboursement.
          </p>
          <p>
            Une fois la prescription obtenue, le patient contacte une société de VSL agréée pour réserver le
            transport. Le jour du trajet, il présente le bon de transport et sa carte Vitale. Grâce au tiers payant,
            il n'avance pas les frais : l'entreprise facture directement la CPAM. Pour les transports de longue
            distance (plus de 150 km) ou en série, un accord préalable de l'Assurance maladie peut être requis.
          </p>
        </section>

        <section id="tarif">
          <h2>Tarif convention des transporteurs sanitaires</h2>
          <p>
            Le tarif du VSL est encadré par la convention nationale des transporteurs sanitaires (avenant 11, grille
            « tarif majoré »). Il se compose d'un forfait départemental et d'un tarif kilométrique :
          </p>
          <ul>
            <li>Forfait départemental : {euro(REGLES_VSL.forfait)} (les trois premiers kilomètres sont inclus) ;</li>
            <li>Tarif kilométrique : {euro(REGLES_VSL.tauxKm)}/km au-delà des kilomètres inclus ;</li>
            <li>Majorations : nuit (+{Math.round(REGLES_VSL.tauxNuit * 100)} %), dimanche et jours fériés (+{Math.round(REGLES_VSL.tauxDimanche * 100)} %).</li>
          </ul>
          <p>
            Le transport partagé, lorsque plusieurs patients voyagent ensemble vers des soins itératifs, fait
            l'objet d'une tarification spécifique et reste à privilégier pour les trajets de dialyse, chimiothérapie
            et radiothérapie.
          </p>
          <p>
            Pour estimer le prix de votre course selon votre département et déposer une demande, utilisez notre{" "}
            <Link href="/tarif-vsl">simulateur de prix VSL</Link>.
          </p>
        </section>

        <section id="remboursement">
          <h2>Remboursement du VSL</h2>
          <p>
            Le transport en VSL prescrit par un médecin est pris en charge par la Sécurité sociale. Le taux de
            remboursement dépend du motif :
          </p>
          <ul>
            <li>
              <strong>100 %</strong> en cas d'affection longue durée (ALD) en lien avec le transport, d'accident du
              travail ou de maladie professionnelle, d'hospitalisation, de maternité à partir du 1er jour du 6e mois,
              ou pour les bénéficiaires de la CSS et de l'AME ;
            </li>
            <li>
              <strong>55 %</strong> du tarif conventionnel pour les autres motifs ; le complément est généralement
              pris en charge par la mutuelle complémentaire santé.
            </li>
          </ul>
          <p>
            La franchise médicale de 4 € par trajet (plafonnée à 8 € par jour et 50 € par an) reste à la charge du
            patient. Le tiers payant évite l'avance des frais sur la part remboursée.
          </p>
        </section>

        <section id="choisir">
          <h2>Comment choisir une société VSL agréée</h2>
          <p>
            Pour choisir une société de VSL fiable, vérifiez plusieurs points : l'agrément ARS de l'entreprise (gage
            du respect des normes de transport sanitaire), le conventionnement CPAM (qui permet le tiers payant), la
            zone d'intervention couverte et la disponibilité par rapport à vos besoins (transports programmés ou
            réguliers). Privilégiez une société joignable facilement, transparente sur ses tarifs et capable
            d'assurer la continuité de vos trajets pour des soins itératifs.
          </p>
          <p>
            L'annuaire RoullePro recense les sociétés de VSL à partir de données publiques officielles et indique,
            pour chaque fiche, le statut de conventionnement vérifié auprès de l'Assurance maladie.
          </p>
        </section>

        <section id="annuaire">
          <h2>Annuaire VSL par région et département</h2>
          <p>
            Consultez les sociétés de VSL agréées et conventionnées CPAM ville par ville. RoullePro référence
            actuellement {stats.byCategory.vsl.toLocaleString("fr-FR")} VSL en France, intégrés au même annuaire que
            les ambulances et taxis conventionnés. Pour une recherche géolocalisée immédiate, utilisez la page{" "}
            <Link href="/vsl-autour-de-moi">VSL autour de moi</Link>.
          </p>
        </section>

        <section id="villes-vsl">
          <h2>Trouver un VSL par ville</h2>
          <p>
            Accédez directement à l'annuaire des VSL conventionnés dans les principales villes où la demande est la
            plus forte :
          </p>
          <div className="not-prose grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 my-6">
            {VILLES_VSL_PRIORITAIRES.map((v) => (
              <Link
                key={v.slug}
                href={`/transport-medical/${v.slug}/vsl`}
                className="bg-blue-50 hover:bg-blue-100 border border-blue-100 rounded-xl px-3 py-2 text-sm font-semibold text-gray-900 transition"
              >
                VSL {v.nom}
              </Link>
            ))}
          </div>
        </section>

        <section id="guides-lies">
          <h2>Guides et simulateurs liés</h2>
          <p>
            Pour comparer les modes de transport et estimer le coût réel d'une course, consultez nos autres guides
            de référence : le <Link href="/taxi-conventionne">taxi conventionné CPAM</Link> et le{" "}
            <Link href="/bon-de-transport">bon de transport (CERFA 11574)</Link>. Estimez votre trajet avec le{" "}
            <Link href="/tarif-vsl">simulateur de prix VSL</Link>, le{" "}
            <Link href="/simulateur-taxi-conventionne">simulateur du taxi conventionné</Link> ou l'estimateur du{" "}
            <Link href="/tarif-ambulance">tarif ambulance</Link>.
          </p>
        </section>

        <section id="sources">
          <h2>Sources officielles</h2>
          <p>Les informations réglementaires de cette page sont vérifiables auprès des sources publiques suivantes :</p>
          <ul>
            <li>
              Assurance maladie —{" "}
              <a href="https://www.ameli.fr/assure/remboursements/rembourse/frais-transport" target="_blank" rel="noopener noreferrer nofollow">
                Frais de transport : prise en charge et remboursements (ameli.fr)
              </a>
            </li>
            <li>
              Assurance maladie —{" "}
              <a href="https://www.ameli.fr/medecin/exercice-liberal/regles-de-prescription-et-formalites/prescription-transports" target="_blank" rel="noopener noreferrer nofollow">
                Prescription des transports (ameli.fr)
              </a>
            </li>
            <li>
              Assurance maladie —{" "}
              <a href="https://www.ameli.fr/assure/droits-demarches/maladie-accident-hospitalisation/affection-longue-duree-ald/transports-maladie-chronique" target="_blank" rel="noopener noreferrer nofollow">
                Transport en affection de longue durée (ALD) (ameli.fr)
              </a>
            </li>
            <li>
              Service-public.fr —{" "}
              <a href="https://www.service-public.gouv.fr/particuliers/vosdroits/F2951" target="_blank" rel="noopener noreferrer nofollow">
                Prise en charge des frais de transport pour raison médicale (taux de 55 %)
              </a>
            </li>
          </ul>
        </section>
      </article>

      <section className="max-w-5xl mx-auto px-4 pb-12">
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-1">Trouver un VSL par ville</h3>
          <p className="text-sm text-gray-600 mb-4">
            Accédez directement à l'annuaire local. Chaque page ville liste les VSL aux côtés des ambulances et
            taxis conventionnés.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {(topVillesVsl.length > 0
              ? topVillesVsl.map((v) => ({ nom: v.ville, slug: v.ville_slug, count: v.count }))
              : VILLES_PRINCIPALES.map((v) => ({ nom: v.nom, slug: v.slug, count: 0 }))
            ).map((v) => (
              <Link
                key={v.slug}
                href={`/transport-medical/${v.slug}`}
                className="bg-blue-50 hover:bg-blue-100 border border-blue-100 rounded-xl px-3 py-2 transition"
              >
                <div className="text-sm font-semibold text-gray-900">{v.nom}</div>
                {v.count > 0 && (
                  <div className="text-xs text-gray-500">{v.count} VSL référencé{v.count > 1 ? "s" : ""}</div>
                )}
              </Link>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <Link
              href="/transport-medical"
              className="inline-flex items-center gap-1 text-sm text-[#0066CC] font-semibold hover:underline"
            >
              Voir tout l'annuaire du transport sanitaire
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 pb-12">
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Questions fréquentes sur le VSL</h2>
          <div className="space-y-4">
            {FAQ.map((q, i) => (
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
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">Trouver un VSL près de chez moi</h2>
          <p className="text-blue-100 mb-6 leading-relaxed">
            Recherchez par ville pour afficher les sociétés de VSL conventionnées CPAM autour de vous.
          </p>
          <form action="/transport-medical/recherche" className="bg-white rounded-2xl p-2 flex flex-col sm:flex-row gap-2 shadow-2xl max-w-xl mx-auto">
            <div className="flex-1 flex items-center gap-3 px-4">
              <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <input
                type="text"
                name="q"
                placeholder="Votre ville (ex : Lyon, Bordeaux, Nantes...)"
                className="w-full py-3 text-gray-900 bg-transparent outline-none placeholder:text-gray-400"
                required
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 bg-[#0066CC] hover:bg-[#0052a3] text-white font-semibold px-6 py-3 rounded-xl transition"
            >
              <Search className="w-4 h-4" />
              Rechercher
            </button>
          </form>
        </div>
      </section>

      <ArticlesLiesPilier needles={["vsl", "vehicule sanitaire leger"]} />
    </main>
  );
}
