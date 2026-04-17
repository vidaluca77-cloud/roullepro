import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mentions légales | RoullePro",
  description:
    "Mentions légales de RoullePro, marketplace B2B de véhicules professionnels pour le transport routier. Informations éditeur, hébergement, RGPD et cookies.",
  robots: { index: true, follow: true },
};

export default function MentionsLegalesPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* En-tête */}
        <div className="bg-white rounded-xl shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Mentions légales
          </h1>
          <p className="text-sm text-gray-500">
            Dernière mise à jour : 17 avril 2026
          </p>
          <p className="mt-4 text-gray-700">
            Conformément aux dispositions de la loi n° 2004-575 du 21 juin 2004
            pour la Confiance dans l'Économie Numérique (LCEN), les présentes
            mentions légales sont portées à la connaissance des utilisateurs du
            site{" "}
            <a
              href="https://roullepro.com"
              className="text-blue-600 hover:underline font-medium"
              target="_blank"
              rel="noopener noreferrer"
            >
              roullepro.com
            </a>
            .
          </p>
        </div>

        {/* 1. Éditeur du site */}
        <div className="bg-white rounded-xl shadow-sm p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 border-b border-gray-100 pb-3">
            1. Éditeur du site
          </h2>
          <dl className="space-y-3 text-gray-700">
            <div className="flex flex-col sm:flex-row sm:gap-2">
              <dt className="font-medium text-gray-900 sm:w-52 shrink-0">
                Raison sociale :
              </dt>
              <dd>RoullePro</dd>
            </div>
            <div className="flex flex-col sm:flex-row sm:gap-2">
              <dt className="font-medium text-gray-900 sm:w-52 shrink-0">
                Statut :
              </dt>
              <dd>
                Société en cours d'immatriculation — SIRET à venir
              </dd>
            </div>
            <div className="flex flex-col sm:flex-row sm:gap-2">
              <dt className="font-medium text-gray-900 sm:w-52 shrink-0">
                Siège social :
              </dt>
              <dd>France</dd>
            </div>
            <div className="flex flex-col sm:flex-row sm:gap-2">
              <dt className="font-medium text-gray-900 sm:w-52 shrink-0">
                Email de contact :
              </dt>
              <dd>
                <a
                  href="mailto:contact@roullepro.com"
                  className="text-blue-600 hover:underline"
                >
                  contact@roullepro.com
                </a>
              </dd>
            </div>
            <div className="flex flex-col sm:flex-row sm:gap-2">
              <dt className="font-medium text-gray-900 sm:w-52 shrink-0">
                Directeur de publication :
              </dt>
              <dd>
                [À compléter — nom du représentant légal de RoullePro]
              </dd>
            </div>
          </dl>
        </div>

        {/* 2. Hébergement */}
        <div className="bg-white rounded-xl shadow-sm p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 border-b border-gray-100 pb-3">
            2. Hébergement
          </h2>
          <p className="text-gray-700 mb-4">
            Le site roullepro.com est hébergé par :
          </p>
          <dl className="space-y-3 text-gray-700">
            <div className="flex flex-col sm:flex-row sm:gap-2">
              <dt className="font-medium text-gray-900 sm:w-52 shrink-0">
                Hébergeur :
              </dt>
              <dd>Netlify, Inc.</dd>
            </div>
            <div className="flex flex-col sm:flex-row sm:gap-2">
              <dt className="font-medium text-gray-900 sm:w-52 shrink-0">
                Adresse :
              </dt>
              <dd>
                2325 3rd Street, Suite 296
                <br />
                San Francisco, CA 94107
                <br />
                États-Unis d'Amérique
              </dd>
            </div>
            <div className="flex flex-col sm:flex-row sm:gap-2">
              <dt className="font-medium text-gray-900 sm:w-52 shrink-0">
                Site web :
              </dt>
              <dd>
                <a
                  href="https://www.netlify.com"
                  className="text-blue-600 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  www.netlify.com
                </a>
              </dd>
            </div>
          </dl>
        </div>

        {/* 3. Données personnelles (RGPD) */}
        <div className="bg-white rounded-xl shadow-sm p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 border-b border-gray-100 pb-3">
            3. Protection des données personnelles (RGPD)
          </h2>

          <div className="space-y-6 text-gray-700">

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                3.1 Responsable du traitement
              </h3>
              <p>
                Le responsable du traitement des données à caractère personnel
                collectées sur le site roullepro.com est RoullePro (coordonnées
                indiquées à l'article 1 ci-dessus).
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                3.2 Données collectées et finalités
              </h3>
              <p className="mb-2">
                RoullePro collecte et traite des données personnelles pour les
                finalités suivantes :
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>
                  <span className="font-medium">Gestion du compte utilisateur</span> :
                  création, authentification et administration du compte professionnel
                  (nom, prénom, adresse e-mail, numéro de téléphone, données
                  d'entreprise).
                </li>
                <li>
                  <span className="font-medium">Modération des annonces</span> :
                  vérification de la conformité des annonces de véhicules publiées
                  sur la marketplace, prévention des fraudes et maintien de la
                  qualité du service.
                </li>
                <li>
                  <span className="font-medium">Facturation future</span> :
                  traitement des transactions commerciales et émission des
                  factures dans le cadre de l'utilisation des services payants de
                  la plateforme.
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                3.3 Base légale des traitements
              </h3>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>
                  <span className="font-medium">Exécution du contrat</span>{" "}
                  (art. 6.1.b RGPD) : traitements nécessaires à la fourniture
                  des services RoullePro (gestion du compte, publication
                  d'annonces, facturation).
                </li>
                <li>
                  <span className="font-medium">Intérêt légitime</span>{" "}
                  (art. 6.1.f RGPD) : modération des annonces, prévention des
                  fraudes et sécurité de la plateforme.
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                3.4 Durée de conservation
              </h3>
              <p>
                Les données personnelles sont conservées pendant une durée de{" "}
                <span className="font-medium">3 ans à compter de la dernière activité</span>{" "}
                de l'utilisateur sur la plateforme. Au-delà de cette période, les
                données sont supprimées ou anonymisées, sauf obligation légale de
                conservation plus longue (notamment à des fins comptables et
                fiscales).
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                3.5 Vos droits
              </h3>
              <p className="mb-2">
                Conformément au Règlement (UE) 2016/679 (RGPD) et à la loi
                Informatique et Libertés modifiée, vous disposez des droits
                suivants :
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>
                  <span className="font-medium">Droit d'accès</span> : obtenir
                  la confirmation que des données vous concernant sont traitées et
                  en obtenir une copie.
                </li>
                <li>
                  <span className="font-medium">Droit de rectification</span> :
                  faire corriger des données inexactes ou incomplètes.
                </li>
                <li>
                  <span className="font-medium">Droit à l'effacement</span>{" "}
                  (« droit à l'oubli ») : demander la suppression de vos données
                  dans les cas prévus par la réglementation.
                </li>
                <li>
                  <span className="font-medium">Droit à la portabilité</span> :
                  recevoir vos données dans un format structuré, couramment utilisé
                  et lisible par machine.
                </li>
                <li>
                  <span className="font-medium">Droit d'opposition</span> :
                  vous opposer à un traitement fondé sur l'intérêt légitime.
                </li>
              </ul>
              <p className="mt-3">
                Pour exercer ces droits, adressez votre demande par e-mail à{" "}
                <a
                  href="mailto:contact@roullepro.com"
                  className="text-blue-600 hover:underline font-medium"
                >
                  contact@roullepro.com
                </a>
                . Vous pouvez également introduire une réclamation auprès de
                la Commission Nationale de l'Informatique et des Libertés (CNIL),
                autorité de contrôle compétente, via son site{" "}
                <a
                  href="https://www.cnil.fr"
                  className="text-blue-600 hover:underline font-medium"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  www.cnil.fr
                </a>
                .
              </p>
            </div>

          </div>
        </div>

        {/* 4. Cookies */}
        <div className="bg-white rounded-xl shadow-sm p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 border-b border-gray-100 pb-3">
            4. Cookies
          </h2>
          <div className="space-y-4 text-gray-700">
            <p>
              Le site roullepro.com utilise des cookies strictement nécessaires à
              son fonctionnement. La liste ci-dessous détaille les cookies
              déposés :
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold text-gray-900 border-b border-gray-200">
                      Cookie
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-900 border-b border-gray-200">
                      Finalité
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-900 border-b border-gray-200">
                      Type
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-900 border-b border-gray-200">
                      Durée
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr>
                    <td className="px-4 py-3 font-mono text-gray-800">
                      sb-*-auth-token
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      Cookie de session Supabase — maintien de l'état
                      d'authentification de l'utilisateur connecté
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-block bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 rounded-full">
                        Strictement nécessaire
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-700">Session</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p>
              RoullePro n'utilise{" "}
              <span className="font-medium">aucun cookie publicitaire</span> et
              n'intègre{" "}
              <span className="font-medium">aucun tracker ou outil
              d'analyse tiers</span> (pas de Google Analytics, Meta Pixel, ou
              équivalent). Les cookies de session Supabase étant strictement
              nécessaires au fonctionnement du service, ils ne requièrent pas
              de consentement préalable conformément aux lignes directrices
              de la CNIL.
            </p>
          </div>
        </div>

        {/* 5. Propriété intellectuelle */}
        <div className="bg-white rounded-xl shadow-sm p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 border-b border-gray-100 pb-3">
            5. Propriété intellectuelle
          </h2>
          <div className="space-y-3 text-gray-700">
            <p>
              L'ensemble des éléments constituant le site roullepro.com
              (structure, design, textes, graphismes, logiciels, base de
              données, logo, marque) sont la propriété exclusive de
              RoullePro et sont protégés par les lois françaises et
              internationales relatives à la propriété intellectuelle.
            </p>
            <p>
              Toute reproduction, représentation, modification, publication,
              adaptation ou exploitation de tout ou partie des éléments du
              site, quel que soit le moyen ou le procédé utilisé, est
              interdite, sauf autorisation écrite préalable de RoullePro.
            </p>
            <p className="font-medium text-gray-800">
              © RoullePro 2026 — Tous droits réservés.
            </p>
          </div>
        </div>

        {/* 6. Limitation de responsabilité */}
        <div className="bg-white rounded-xl shadow-sm p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 border-b border-gray-100 pb-3">
            6. Limitation de responsabilité
          </h2>
          <div className="space-y-3 text-gray-700">
            <p>
              RoullePro met tout en œuvre pour assurer l'exactitude et la mise
              à jour des informations diffusées sur le site. Toutefois,
              RoullePro ne peut garantir l'exactitude, la complétude ou
              l'actualité des informations publiées.
            </p>
            <p>
              Les annonces de véhicules publiées sur la marketplace sont
              rédigées sous la seule responsabilité de leurs auteurs
              (professionnels du transport routier). RoullePro agit en qualité
              d'hébergeur au sens de la LCEN pour ces contenus et ne saurait
              être tenu responsable de leur exactitude, de leur légalité ou
              de toute inexactitude les concernant.
            </p>
            <p>
              RoullePro ne saurait être tenu responsable des dommages directs
              ou indirects résultant de l'accès ou de l'utilisation du site,
              notamment en cas d'interruption temporaire du service, de
              dysfonctionnements techniques ou de contamination virale.
            </p>
            <p>
              Le site peut contenir des liens hypertextes vers d'autres sites.
              RoullePro n'exerce aucun contrôle sur ces sites tiers et décline
              toute responsabilité quant à leur contenu ou aux pratiques en
              matière de protection des données qu'ils mettent en œuvre.
            </p>
          </div>
        </div>

        {/* 7. Médiation */}
        <div className="bg-white rounded-xl shadow-sm p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 border-b border-gray-100 pb-3">
            7. Médiation de la consommation
          </h2>
          <div className="space-y-3 text-gray-700">
            <p>
              Conformément à l'ordonnance n° 2015-1033 du 20 août 2015 relative
              au règlement extrajudiciaire des litiges de consommation et au
              décret n° 2015-1382 du 30 octobre 2015, tout consommateur
              résidant en France dispose du droit de recourir gratuitement à un
              médiateur de la consommation en vue de la résolution amiable d'un
              litige l'opposant à un professionnel.
            </p>
            <p>
              En cas de litige non résolu à l'issue d'une réclamation préalable
              adressée à RoullePro par e-mail à{" "}
              <a
                href="mailto:contact@roullepro.com"
                className="text-blue-600 hover:underline font-medium"
              >
                contact@roullepro.com
              </a>
              , l'utilisateur peut saisir le médiateur compétent via la
              plateforme européenne de règlement en ligne des litiges (RLL),
              accessible à l'adresse :{" "}
              <a
                href="https://ec.europa.eu/consumers/odr"
                className="text-blue-600 hover:underline font-medium"
                target="_blank"
                rel="noopener noreferrer"
              >
                ec.europa.eu/consumers/odr
              </a>
              .
            </p>
            <p className="text-sm text-gray-500 italic">
              Note : RoullePro étant une marketplace B2B à destination de
              professionnels du transport routier, les règles relatives à la
              médiation de la consommation s'appliquent exclusivement aux
              éventuels utilisateurs ayant la qualité de consommateur au sens
              de l'article préliminaire du Code de la consommation.
            </p>
          </div>
        </div>

        {/* Pied de page */}
        <div className="bg-white rounded-xl shadow-sm p-6 text-center text-sm text-gray-500">
          <p>
            Pour toute question relative à ces mentions légales, contactez-nous à{" "}
            <a
              href="mailto:contact@roullepro.com"
              className="text-blue-600 hover:underline font-medium"
            >
              contact@roullepro.com
            </a>
            .
          </p>
          <p className="mt-1">
            © RoullePro 2026 — Marketplace B2B de véhicules professionnels pour
            le transport routier.
          </p>
        </div>

      </div>
    </main>
  );
}
