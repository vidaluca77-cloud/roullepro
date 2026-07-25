import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description:
    "Politique de confidentialité de RoullePro : responsable de traitement, données collectées, finalités, base légale, durée de conservation, sous-traitants, droits RGPD, suppression des données et cookies.",
  robots: { index: true, follow: true },
};

export default function ConfidentialitePage() {
  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* En-tête */}
        <div className="bg-white rounded-xl shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Politique de confidentialité
          </h1>
          <p className="text-sm text-gray-500">
            Dernière mise à jour : 24 juillet 2026
          </p>
          <p className="mt-4 text-gray-700">
            La présente politique de confidentialité décrit la manière dont les
            données à caractère personnel des utilisateurs du site{" "}
            <a
              href="https://roullepro.com"
              className="text-blue-600 hover:underline font-medium"
              target="_blank"
              rel="noopener noreferrer"
            >
              roullepro.com
            </a>{" "}
            sont collectées, utilisées et protégées, conformément au Règlement
            (UE) 2016/679 (RGPD) et à la loi Informatique et Libertés modifiée.
          </p>
        </div>

        {/* 1. Responsable du traitement */}
        <div className="bg-white rounded-xl shadow-sm p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 border-b border-gray-100 pb-3">
            1. Responsable du traitement
          </h2>
          <dl className="space-y-3 text-gray-700">
            <div className="flex flex-col sm:flex-row sm:gap-2">
              <dt className="font-medium text-gray-900 sm:w-52 shrink-0">
                Raison sociale :
              </dt>
              <dd>LVL IA SAS</dd>
            </div>
            <div className="flex flex-col sm:flex-row sm:gap-2">
              <dt className="font-medium text-gray-900 sm:w-52 shrink-0">
                SIRET :
              </dt>
              <dd>991 803 594 00019</dd>
            </div>
            <div className="flex flex-col sm:flex-row sm:gap-2">
              <dt className="font-medium text-gray-900 sm:w-52 shrink-0">
                Siège social :
              </dt>
              <dd>
                15 rue de Lébisey
                <br />
                14000 Caen
                <br />
                France
              </dd>
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
                Téléphone :
              </dt>
              <dd>06 15 47 28 13</dd>
            </div>
          </dl>
        </div>

        {/* 2. Données collectées */}
        <div className="bg-white rounded-xl shadow-sm p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 border-b border-gray-100 pb-3">
            2. Données collectées
          </h2>
          <div className="space-y-4 text-gray-700">
            <p>
              Selon votre usage du service, RoullePro collecte et traite les
              catégories de données suivantes :
            </p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>
                <span className="font-medium">Compte professionnel</span> : nom,
                prénom, adresse e-mail, numéro de téléphone et données
                d'entreprise nécessaires à la création et à l'administration du
                compte.
              </li>
              <li>
                <span className="font-medium">Fiche annuaire</span> : raison
                sociale, nom commercial, SIRET, adresse, coordonnées, catégorie
                d'activité (ambulance, VSL, taxi conventionné), agrément et zone
                géographique, en partie issus du registre SIRENE de l'INSEE.
              </li>
              <li>
                <span className="font-medium">Demandes de transport</span> :
                informations transmises lors d'une mise en relation (coordonnées
                du demandeur, lieux de prise en charge et de destination, date et
                besoins de transport).
              </li>
              <li>
                <span className="font-medium">
                  Données de connexion aux réseaux sociaux
                </span>{" "}
                : dans le cadre du Studio réseaux sociaux, les jetons d'accès
                (<em>access tokens</em> et, le cas échéant, <em>refresh tokens</em>)
                de vos Pages Facebook, comptes Instagram professionnels et fiches
                Google Business Profile.{" "}
                <span className="font-medium">
                  Ces jetons sont stockés côté serveur de façon sécurisée, ne sont
                  jamais partagés avec des tiers ni exposés dans votre navigateur.
                </span>
              </li>
              <li>
                <span className="font-medium">Données techniques</span> : données
                de connexion strictement nécessaires au fonctionnement et à la
                sécurité du service (cf. section « Cookies »).
              </li>
            </ul>
          </div>
        </div>

        {/* 3. Finalités */}
        <div className="bg-white rounded-xl shadow-sm p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 border-b border-gray-100 pb-3">
            3. Finalités du traitement
          </h2>
          <ul className="list-disc list-inside space-y-2 ml-2 text-gray-700">
            <li>
              <span className="font-medium">Annuaire</span> : publier et tenir à
              jour les fiches des professionnels du transport sanitaire.
            </li>
            <li>
              <span className="font-medium">Mise en relation</span> : mettre en
              relation les patients, prescripteurs et assurances avec les
              professionnels référencés.
            </li>
            <li>
              <span className="font-medium">
                Publication sur les réseaux sociaux
              </span>{" "}
              : générer et publier, à la demande du professionnel et via le Studio
              réseaux sociaux, des contenus sur ses propres Pages Facebook,
              comptes Instagram et fiches Google Business Profile.
            </li>
            <li>
              <span className="font-medium">Gestion des abonnements</span> :
              traitement des paiements et émission des factures pour les services
              payants.
            </li>
            <li>
              <span className="font-medium">Communication</span> : envoi d'e-mails
              transactionnels et d'informations liées au compte et au service.
            </li>
          </ul>
        </div>

        {/* 4. Base légale */}
        <div className="bg-white rounded-xl shadow-sm p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 border-b border-gray-100 pb-3">
            4. Base légale des traitements
          </h2>
          <ul className="list-disc list-inside space-y-2 ml-2 text-gray-700">
            <li>
              <span className="font-medium">Exécution du contrat</span>{" "}
              (art. 6.1.b RGPD) : gestion du compte, publication des fiches,
              mise en relation, facturation et publication de contenus sur les
              réseaux sociaux à la demande du professionnel.
            </li>
            <li>
              <span className="font-medium">Consentement</span>{" "}
              (art. 6.1.a RGPD) : connexion de vos comptes de réseaux sociaux au
              Studio, révocable à tout moment par déconnexion.
            </li>
            <li>
              <span className="font-medium">Intérêt légitime</span>{" "}
              (art. 6.1.f RGPD) : sécurité de la plateforme, prévention des
              fraudes et amélioration du service.
            </li>
            <li>
              <span className="font-medium">Obligation légale</span>{" "}
              (art. 6.1.c RGPD) : conservation des documents comptables et
              fiscaux.
            </li>
          </ul>
        </div>

        {/* 5. Durée de conservation */}
        <div className="bg-white rounded-xl shadow-sm p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 border-b border-gray-100 pb-3">
            5. Durée de conservation
          </h2>
          <div className="space-y-3 text-gray-700">
            <p>
              Les données de compte et de fiche annuaire sont conservées pendant
              toute la durée de la relation contractuelle, puis pendant{" "}
              <span className="font-medium">3 ans à compter de la dernière
              activité</span>{" "}
              de l'utilisateur, sauf obligation légale de conservation plus
              longue (notamment comptable et fiscale).
            </p>
            <p>
              Les jetons d'accès aux réseaux sociaux sont conservés{" "}
              <span className="font-medium">
                tant que la connexion correspondante reste active
              </span>{" "}
              et sont supprimés dès la déconnexion du réseau concerné ou la
              suppression du compte.
            </p>
            <p>
              Les données relatives aux demandes de transport sont conservées le
              temps nécessaire à la mise en relation, puis archivées ou
              supprimées conformément aux durées ci-dessus.
            </p>
          </div>
        </div>

        {/* 6. Sous-traitants */}
        <div className="bg-white rounded-xl shadow-sm p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 border-b border-gray-100 pb-3">
            6. Sous-traitants et destinataires
          </h2>
          <div className="space-y-4 text-gray-700">
            <p>
              Pour fournir le service, RoullePro fait appel à des prestataires
              techniques agissant en qualité de sous-traitants au sens de
              l'article 28 du RGPD. Chacun n'accède qu'aux données strictement
              nécessaires à sa mission :
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold text-gray-900 border-b border-gray-200">
                      Prestataire
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-900 border-b border-gray-200">
                      Finalité
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr>
                    <td className="px-4 py-3 font-medium text-gray-800">Supabase</td>
                    <td className="px-4 py-3">Base de données et authentification</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium text-gray-800">Netlify</td>
                    <td className="px-4 py-3">Hébergement du site et des fonctions serveur</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium text-gray-800">Stripe</td>
                    <td className="px-4 py-3">Traitement des paiements et abonnements</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium text-gray-800">Resend</td>
                    <td className="px-4 py-3">Envoi des e-mails transactionnels</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium text-gray-800">Brevo</td>
                    <td className="px-4 py-3">Envoi d'e-mails et communications</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium text-gray-800">Mistral AI</td>
                    <td className="px-4 py-3">
                      Génération de contenus par intelligence artificielle (Studio
                      réseaux sociaux, experts IA)
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium text-gray-800">Meta (Facebook / Instagram)</td>
                    <td className="px-4 py-3">
                      Publication de contenus sur vos Pages Facebook et comptes
                      Instagram professionnels
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium text-gray-800">Google (Business Profile)</td>
                    <td className="px-4 py-3">
                      Publication de contenus sur vos fiches Google Business
                      Profile
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p>
              Certains de ces prestataires peuvent être établis hors de l'Union
              européenne. Dans ce cas, les transferts sont encadrés par des
              garanties appropriées (clauses contractuelles types de la
              Commission européenne notamment).
            </p>
          </div>
        </div>

        {/* 7. Vos droits */}
        <div className="bg-white rounded-xl shadow-sm p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 border-b border-gray-100 pb-3">
            7. Vos droits
          </h2>
          <div className="space-y-3 text-gray-700">
            <p>
              Conformément au RGPD et à la loi Informatique et Libertés modifiée,
              vous disposez des droits suivants :
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>
                <span className="font-medium">Droit d'accès</span> : obtenir une
                copie des données vous concernant.
              </li>
              <li>
                <span className="font-medium">Droit de rectification</span> :
                faire corriger des données inexactes ou incomplètes.
              </li>
              <li>
                <span className="font-medium">Droit à l'effacement</span>{" "}
                (« droit à l'oubli ») : demander la suppression de vos données.
              </li>
              <li>
                <span className="font-medium">Droit à la portabilité</span> :
                recevoir vos données dans un format structuré et lisible par
                machine.
              </li>
              <li>
                <span className="font-medium">Droit d'opposition et de limitation</span>{" "}
                : vous opposer à un traitement ou en demander la limitation.
              </li>
              <li>
                <span className="font-medium">Retrait du consentement</span> :
                retirer à tout moment votre consentement, notamment en
                déconnectant vos réseaux sociaux.
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
              . Vous pouvez également introduire une réclamation auprès de la
              Commission Nationale de l'Informatique et des Libertés (CNIL) via
              son site{" "}
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

        {/* 8. Suppression de vos données */}
        <div id="suppression" className="bg-white rounded-xl shadow-sm p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 border-b border-gray-100 pb-3">
            8. Suppression de vos données
          </h2>
          <div className="space-y-4 text-gray-700">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">
                Déconnecter un réseau social (suppression des jetons d'accès)
              </h3>
              <p>
                La déconnexion d'un réseau entraîne la{" "}
                <span className="font-medium">
                  suppression immédiate et définitive des jetons d'accès
                </span>{" "}
                correspondants (Page Facebook, compte Instagram Business, fiche
                Google Business Profile) stockés sur nos serveurs. Aucune nouvelle
                publication n'est alors possible sur ce réseau tant qu'il n'est pas
                reconnecté.
              </p>
              <ol className="mt-2 ml-5 list-decimal space-y-1">
                <li>Connectez-vous à votre compte RoullePro.</li>
                <li>
                  Ouvrez{" "}
                  <span className="font-medium">
                    Espace professionnel → Studio réseaux sociaux
                  </span>
                  .
                </li>
                <li>
                  Allez dans l'onglet <span className="font-medium">Connexions</span>.
                </li>
                <li>
                  Cliquez sur <span className="font-medium">Déconnecter</span> en face
                  du réseau concerné.
                </li>
              </ol>
              <p className="mt-2">
                Vous pouvez également retirer l'accès de l'application directement
                depuis les paramètres de votre compte Facebook, Instagram ou Google.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">
                Supprimer votre compte et l'ensemble de vos données
              </h3>
              <p>
                Adressez votre demande par e-mail à{" "}
                <a
                  href="mailto:contact@roullepro.com"
                  className="text-blue-600 hover:underline font-medium"
                >
                  contact@roullepro.com
                </a>{" "}
                depuis l'adresse associée à votre compte, avec pour objet
                « Suppression de mes données ». Nous procédons à l'effacement dans un{" "}
                <span className="font-medium">délai maximum de 30 jours</span> et vous
                confirmons la suppression par e-mail.
              </p>
              <p className="mt-2">
                Sont alors effacés : votre compte, la fiche annuaire que vous gérez,
                vos connexions et jetons de réseaux sociaux, ainsi que les
                publications créées dans le Studio réseaux sociaux. Les publications
                déjà diffusées sur vos propres pages Facebook, Instagram ou Google
                Business Profile restent votre propriété : elles doivent être
                supprimées depuis ces plateformes. Les données que la loi impose de
                conserver (documents comptables et fiscaux) sont conservées jusqu'au
                terme du délai légal.
              </p>
            </div>
          </div>
        </div>

        {/* 9. Cookies */}
        <div className="bg-white rounded-xl shadow-sm p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 border-b border-gray-100 pb-3">
            9. Cookies
          </h2>
          <div className="space-y-4 text-gray-700">
            <p>
              Le site roullepro.com utilise uniquement des cookies strictement
              nécessaires à son fonctionnement (notamment le cookie de session
              Supabase{" "}
              <span className="font-mono text-sm">sb-*-auth-token</span> qui
              maintient l'état d'authentification de l'utilisateur connecté).
            </p>
            <p>
              RoullePro n'utilise{" "}
              <span className="font-medium">aucun cookie publicitaire</span> et
              n'intègre{" "}
              <span className="font-medium">
                aucun tracker ou outil d'analyse tiers
              </span>{" "}
              (pas de Google Analytics, Meta Pixel ou équivalent). Ces cookies
              étant strictement nécessaires au service, ils ne requièrent pas de
              consentement préalable conformément aux lignes directrices de la
              CNIL.
            </p>
          </div>
        </div>

        {/* Pied de page */}
        <div className="bg-white rounded-xl shadow-sm p-6 text-center text-sm text-gray-500">
          <p>
            Pour toute question relative à cette politique de confidentialité,
            contactez-nous à{" "}
            <a
              href="mailto:contact@roullepro.com"
              className="text-blue-600 hover:underline font-medium"
            >
              contact@roullepro.com
            </a>
            .
          </p>
          <p className="mt-1">
            © RoullePro 2026 — Édité par LVL IA SAS, 15 rue de Lébisey, 14000
            Caen.
          </p>
        </div>

      </div>
    </main>
  );
}
