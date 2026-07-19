import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  Phone,
  FileText,
  Clock,
  Building2,
  HeartPulse,
  Wrench,
} from "lucide-react";

export const revalidate = 86400;

const GIVA_URL = "https://go.giva.fr/?src=LucasH";
const TITLE = "Assurance pro transport sanitaire — Partenaire Giva";
const DESCRIPTION =
  "Devis en ligne d'assurance professionnelle pour ambulances, VSL et taxis conventionnés via notre partenaire Giva. Garanties métier, accompagnement, tarifs négociés.";

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
    q: "Pourquoi RoullePro recommande Giva ?",
    a: "Giva est un courtier en assurance qui dispose d'une vraie expertise du transport sanitaire et de la mobilité professionnelle. Les devis intègrent des garanties adaptées à votre activité réelle (ambulance, VSL, taxi conventionné). Le formulaire en ligne renvoie un devis sans engagement.",
  },
  {
    q: "Le lien Giva est-il un lien d'affiliation ?",
    a: "Oui. RoullePro perçoit une commission si vous souscrivez via ce lien. Cela ne modifie ni le prix payé ni les conditions de votre contrat. Cette mention est rendue visible sur la page conformément à la réglementation.",
  },
  {
    q: "Quelles garanties sont couvertes ?",
    a: "Responsabilité civile professionnelle, garantie corporelle du conducteur, dommages au véhicule, vol/incendie, assistance, défense recours, garantie matériel sanitaire embarqué. Le détail exact dépend de la formule choisie et de votre flotte.",
  },
  {
    q: "Combien de temps prend la souscription ?",
    a: "Le devis en ligne prend en général 5 à 10 minutes. Après acceptation du devis, la souscription effective se fait par signature électronique et l'attestation provisoire est envoyée le jour même dans la plupart des cas.",
  },
  {
    q: "Puis-je changer d'assurance en cours d'année ?",
    a: "Depuis la loi Hamon, vous pouvez résilier votre contrat d'assurance auto pro à tout moment après la première année. Giva accompagne la procédure et peut prendre en charge la résiliation du contrat précédent.",
  },
];

export default function AssuranceProPage() {
  return (
    <main className="bg-slate-50 min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-800 to-blue-900 text-white">
        <div className="max-w-5xl mx-auto px-4 py-14">
          <nav aria-label="Fil d'Ariane" className="text-sm text-blue-100 mb-5">
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
              <li className="text-white">Assurance pro</li>
            </ol>
          </nav>
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-3 py-1 rounded-full text-xs font-medium mb-4">
            <ShieldCheck className="h-3.5 w-3.5" />
            Partenaire RoullePro
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
            Une assurance pro adaptée aux transporteurs sanitaires
          </h1>
          <p className="text-lg text-blue-50 max-w-3xl mb-6">
            Ambulances, VSL, taxis conventionnés : obtenez un devis en ligne en quelques minutes auprès de Giva, courtier spécialisé en assurance mobilité professionnelle.
          </p>
          <a
            href={GIVA_URL}
            target="_blank"
            rel="noopener sponsored"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-800 rounded-xl font-bold hover:bg-blue-50 transition shadow-lg"
          >
            Obtenir un devis Giva
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          <article className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 md:p-10 prose prose-slate max-w-none prose-headings:scroll-mt-24 prose-h2:text-2xl prose-h2:font-bold prose-h2:mt-8 prose-h2:mb-4 prose-h3:text-lg prose-h3:font-semibold prose-h3:mt-6 prose-h3:mb-3 prose-p:leading-relaxed prose-li:my-0 prose-a:text-blue-700 hover:prose-a:text-blue-800 prose-strong:text-slate-900">
            <h2 id="pourquoi-giva">Pourquoi un partenariat avec Giva</h2>
            <p>
              Le transport sanitaire est un métier où les risques s&apos;additionnent. Vous transportez des patients fragiles, votre flotte roule beaucoup, vos chauffeurs sont en garde de nuit, votre matériel embarqué (oxygène, défibrillateur, brancard, dispositifs médicaux) représente un investissement significatif. Une assurance générique pensée pour les artisans du bâtiment ne couvre pas correctement ces réalités.
            </p>
            <p>
              <strong>Giva</strong> est un courtier en assurance qui a structuré une offre dédiée à la mobilité professionnelle. Les contrats négociés intègrent les spécificités du transport sanitaire : <strong>responsabilité civile professionnelle adaptée au transport de patients</strong>, garantie du matériel médical embarqué, accompagnement en cas de sinistre par des interlocuteurs qui connaissent le secteur.
            </p>
            <p>
              RoullePro a sélectionné Giva après avoir comparé plusieurs courtiers généralistes et spécialistes. Le retour des transporteurs déjà clients met en avant trois points : la qualité du devis en ligne (rapide et précis), la disponibilité de l&apos;équipe support, et la compétitivité tarifaire sur les flottes de 1 à 20 véhicules.
            </p>

            <h2 id="ce-qui-est-couvert">Ce qui est couvert</h2>
            <p>
              Les contrats Giva pour le transport sanitaire incluent typiquement les garanties suivantes. Le détail précis dépend de la formule retenue et de votre situation (flotte, ancienneté du dirigeant, sinistralité, zone d&apos;exercice).
            </p>
            <ul>
              <li>
                <strong>Responsabilité civile professionnelle</strong> : indispensable pour tout transporteur sanitaire conventionné. Couvre les dommages causés à un tiers lors de l&apos;exécution de la prestation, y compris au patient transporté.
              </li>
              <li>
                <strong>Responsabilité civile exploitation</strong> : protège l&apos;entreprise pour les dommages causés en dehors de l&apos;activité de transport (locaux, matériels stockés, accueil de personnels externes).
              </li>
              <li>
                <strong>Dommages au véhicule</strong> : tous risques ou tiers étendu selon le profil de la flotte.
              </li>
              <li>
                <strong>Garantie du matériel sanitaire embarqué</strong> : oxygène, défibrillateur, brancard, matelas immobilisateur, dispositifs médicaux divers.
              </li>
              <li>
                <strong>Garantie corporelle du conducteur</strong> : indemnisation du chauffeur en cas d&apos;accident.
              </li>
              <li>
                <strong>Assistance 24/7</strong> : remorquage, véhicule de remplacement, rapatriement du patient si nécessaire.
              </li>
              <li>
                <strong>Vol, incendie, bris de glace</strong> : couvertures classiques en formule complète.
              </li>
              <li>
                <strong>Défense recours</strong> : assistance juridique en cas de litige avec un tiers.
              </li>
              <li>
                <strong>Garantie perte d&apos;exploitation</strong> : optionnelle, mais utile pour les flottes monolocales.
              </li>
            </ul>

            <h2 id="benefices">Les bénéfices concrets</h2>
            <h3>Devis en ligne en 5 à 10 minutes</h3>
            <p>
              Le formulaire Giva est conçu pour aller à l&apos;essentiel. Il vous demande votre numéro SIRET, votre catégorie d&apos;activité (ambulance, VSL, taxi conventionné), votre flotte actuelle (nombre de véhicules, modèles, ancienneté), votre sinistralité des trois dernières années, et la formule souhaitée. Le devis vous est envoyé par email dans la foulée et vous pouvez le partager avec votre comptable ou votre conjoint d&apos;exploitation.
            </p>

            <h3>Tarifs négociés pour le secteur</h3>
            <p>
              Giva travaille avec plusieurs assureurs partenaires et joue la concurrence pour vous proposer le meilleur tarif. Pour les flottes de plus de cinq véhicules, des conditions spécifiques peuvent être négociées (franchise réduite, étalement de la prime, prise en charge des frais de résiliation du précédent contrat).
            </p>

            <h3>Accompagnement humain en cas de sinistre</h3>
            <p>
              Quand un sinistre survient, vous ne tombez pas dans un centre d&apos;appels anonyme. Un interlocuteur dédié vous suit du déclaration à l&apos;indemnisation, et connaît les spécificités du transport sanitaire (urgence de remplacement du véhicule pour ne pas interrompre la prestation, gestion du matériel médical endommagé, déclaration ARS si nécessaire).
            </p>

            <h3>Souscription rapide après acceptation</h3>
            <p>
              Une fois le devis accepté, la souscription se fait par signature électronique. <strong>L&apos;attestation provisoire est envoyée le jour même</strong> dans la plupart des cas, ce qui permet une mise en route immédiate. La résiliation de votre ancien contrat (si applicable) est prise en charge par Giva avec la loi Hamon.
            </p>

            <h2 id="qui-est-concerne">À qui s&apos;adresse cette offre</h2>
            <p>
              L&apos;offre Giva est pertinente pour les profils suivants :
            </p>
            <ul>
              <li>
                <strong>Création d&apos;entreprise</strong> : vous lancez votre activité ambulancière, VSL ou taxi conventionné. Le devis Giva fournit une base solide pour bâtir votre business plan.
              </li>
              <li>
                <strong>Renouvellement annuel</strong> : votre contrat actuel arrive à échéance. C&apos;est le bon moment pour comparer et négocier.
              </li>
              <li>
                <strong>Sortie loi Hamon</strong> : vous êtes assuré depuis plus de douze mois et souhaitez résilier à tout moment. Giva accompagne la transition.
              </li>
              <li>
                <strong>Croissance de flotte</strong> : vous ajoutez un véhicule, vous passez de 3 à 6 ambulances. Renégocier l&apos;ensemble de la flotte permet souvent d&apos;améliorer les conditions.
              </li>
              <li>
                <strong>Reprise d&apos;entreprise</strong> : vous rachetez une société de transport sanitaire. Un nouveau contrat sur mesure est préférable au transfert du contrat existant.
              </li>
            </ul>

            <h2 id="comment-ca-marche">Comment ça marche</h2>
            <ol>
              <li>
                <strong>Cliquez sur le bouton de devis Giva</strong> ci-dessous. Vous arrivez sur le formulaire en ligne.
              </li>
              <li>
                <strong>Renseignez vos informations</strong> (SIRET, catégorie, flotte). Comptez 5 à 10 minutes.
              </li>
              <li>
                <strong>Recevez votre devis par email</strong> détaillé, avec plusieurs niveaux de formule.
              </li>
              <li>
                <strong>Échangez avec un conseiller Giva</strong> par téléphone ou email pour ajuster les garanties.
              </li>
              <li>
                <strong>Signez électroniquement</strong> et recevez votre attestation provisoire.
              </li>
              <li>
                <strong>Giva résilie l&apos;ancien contrat</strong> si vous le souhaitez (loi Hamon), sans démarche de votre part.
              </li>
            </ol>

            <div className="not-prose my-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                <Clock className="h-5 w-5 text-blue-700 mb-2" />
                <p className="text-sm font-semibold text-slate-900">Devis sous 10 min</p>
                <p className="text-xs text-slate-600 mt-0.5">
                  Formulaire en ligne, sans engagement.
                </p>
              </div>
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                <HeartPulse className="h-5 w-5 text-blue-700 mb-2" />
                <p className="text-sm font-semibold text-slate-900">Garanties métier</p>
                <p className="text-xs text-slate-600 mt-0.5">
                  Adaptées au transport sanitaire conventionné.
                </p>
              </div>
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                <Phone className="h-5 w-5 text-blue-700 mb-2" />
                <p className="text-sm font-semibold text-slate-900">Accompagnement</p>
                <p className="text-xs text-slate-600 mt-0.5">
                  Interlocuteur dédié, support sinistre 24/7.
                </p>
              </div>
            </div>

            <h2 id="faq">Questions fréquentes</h2>
            <div className="not-prose space-y-3">
              {FAQ.map((it, idx) => (
                <details
                  key={idx}
                  className="group border border-slate-200 rounded-xl bg-white open:border-blue-200"
                >
                  <summary className="cursor-pointer p-4 text-sm font-semibold text-slate-900 list-none flex items-center justify-between gap-3">
                    <span>{it.q}</span>
                    <span className="text-slate-400 group-open:rotate-45 transition">+</span>
                  </summary>
                  <div className="px-4 pb-4 text-sm text-slate-700 leading-relaxed">
                    {it.a}
                  </div>
                </details>
              ))}
            </div>

            <h2 id="affilie">Transparence sur le lien partenaire</h2>
            <p className="text-sm text-slate-600">
              Lien partenaire. RoullePro peut percevoir une commission si vous souscrivez via ce lien. Cela ne modifie ni le prix ni les conditions de votre contrat Giva. Cette mention est rendue visible sur la page conformément à la réglementation. Pour plus d&apos;informations, consultez nos <Link href="/mentions-legales">mentions légales</Link>.
            </p>

            <div className="not-prose mt-10 pt-6 border-t border-slate-200 text-center">
              <a
                href={GIVA_URL}
                target="_blank"
                rel="noopener sponsored"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-bold transition shadow-md"
              >
                Obtenir mon devis Giva maintenant
                <ArrowRight className="h-4 w-4" />
              </a>
              <p className="text-xs text-slate-500 mt-3">
                Vous quittez RoullePro et accédez à go.giva.fr (ouverture dans un nouvel onglet).
              </p>
            </div>
          </article>

          {/* Sidebar */}
          <aside className="space-y-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <ShieldCheck className="h-5 w-5 text-blue-700" />
                <h3 className="font-semibold text-slate-900">Devis express</h3>
              </div>
              <p className="text-sm text-slate-600 mb-4">
                Sans engagement, sans création de compte. Vous recevez le devis par email.
              </p>
              <a
                href={GIVA_URL}
                target="_blank"
                rel="noopener sponsored"
                className="block text-center px-4 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg font-semibold transition text-sm"
              >
                Démarrer mon devis
              </a>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-3">
                Cibles
              </p>
              <ul className="space-y-2 text-sm text-slate-700">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                  Sociétés ambulancières
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                  Entreprises de VSL
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                  Taxis conventionnés CPAM
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                  Flottes de 1 à 20 véhicules
                </li>
              </ul>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-3">
                Garanties clés
              </p>
              <ul className="space-y-2 text-sm text-slate-700">
                <li className="flex items-start gap-2">
                  <FileText className="h-4 w-4 text-blue-700 mt-0.5 flex-shrink-0" />
                  RC pro transport de patients
                </li>
                <li className="flex items-start gap-2">
                  <Wrench className="h-4 w-4 text-blue-700 mt-0.5 flex-shrink-0" />
                  Matériel sanitaire embarqué
                </li>
                <li className="flex items-start gap-2">
                  <Building2 className="h-4 w-4 text-blue-700 mt-0.5 flex-shrink-0" />
                  Locaux et exploitation
                </li>
                <li className="flex items-start gap-2">
                  <Phone className="h-4 w-4 text-blue-700 mt-0.5 flex-shrink-0" />
                  Assistance 24/7
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
