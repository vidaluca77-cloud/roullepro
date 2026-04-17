import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Conditions Générales d'Utilisation – RoullePro",
  description:
    "Consultez les Conditions Générales d'Utilisation de RoullePro, la marketplace B2B dédiée aux professionnels du transport routier (VTC, taxi, ambulance, TPMR, navette, utilitaires). Accès réservé aux entreprises immatriculées.",
};

export default function CGUPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* En-tête */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-3">
            Conditions Générales d&apos;Utilisation
          </h1>
          <p className="text-sm text-gray-500">
            Version en vigueur au{" "}
            <time dateTime="2026-04-17">17 avril 2026</time>
          </p>
          <p className="mt-4 text-base text-gray-600 max-w-2xl mx-auto">
            Les présentes Conditions Générales d&apos;Utilisation (ci-après «{" "}
            <strong>CGU</strong> ») régissent l&apos;accès et l&apos;utilisation
            de la plateforme RoullePro accessible à l&apos;adresse{" "}
            <a
              href="https://www.roullepro.com"
              className="text-blue-600 underline hover:text-blue-800"
            >
              www.roullepro.com
            </a>
            . Toute utilisation de la plateforme implique l&apos;acceptation
            pleine et entière des présentes CGU.
          </p>
        </div>

        <div className="space-y-8">
          {/* Article 1 */}
          <section className="bg-white rounded-xl shadow-sm p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-100 pb-3">
              Article 1 – Objet et champ d&apos;application
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                La plateforme <strong>RoullePro</strong> (ci-après « la
                Plateforme ») est un service de mise en relation exclusivement
                destiné aux professionnels du secteur du transport routier. Elle
                permet la publication et la consultation d&apos;annonces
                relatives à des véhicules professionnels, notamment des voitures
                de transport avec chauffeur (VTC), des taxis, des ambulances,
                des véhicules de transport de personnes à mobilité réduite
                (TPMR), des navettes de transport collectif et des véhicules
                utilitaires légers ou lourds.
              </p>
              <p>
                La Plateforme est exploitée par la société RoullePro SAS,
                société par actions simplifiée au capital social de [montant] €,
                immatriculée au Registre du Commerce et des Sociétés sous le
                numéro [numéro RCS], dont le siège social est situé [adresse
                complète], France (ci-après « RoullePro » ou « l&apos;Éditeur
                »).
              </p>
              <p>
                Les présentes CGU s&apos;appliquent à toute personne accédant à
                la Plateforme ou l&apos;utilisant, qu&apos;elle agisse en
                qualité de Vendeur ou d&apos;Acheteur. Elles constituent un
                contrat juridiquement contraignant entre l&apos;Utilisateur et
                RoullePro.
              </p>
              <p>
                L&apos;accès à la Plateforme est strictement réservé aux
                professionnels, c&apos;est-à-dire aux personnes physiques agissant
                dans le cadre de leur activité commerciale, industrielle,
                artisanale, libérale ou agricole, ainsi qu&apos;aux personnes
                morales de droit privé. L&apos;accès aux particuliers est
                expressément exclu.
              </p>
              <p>
                RoullePro se réserve le droit de modifier les présentes CGU à
                tout moment. Les modifications prennent effet dès leur
                publication sur la Plateforme. L&apos;Utilisateur est invité à
                consulter régulièrement cette page. La poursuite de
                l&apos;utilisation de la Plateforme après notification des
                modifications vaut acceptation des nouvelles CGU.
              </p>
            </div>
          </section>

          {/* Article 2 */}
          <section className="bg-white rounded-xl shadow-sm p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-100 pb-3">
              Article 2 – Définitions
            </h2>
            <p className="text-gray-700 mb-4 leading-relaxed">
              Au sens des présentes CGU, les termes ci-dessous ont les
              définitions suivantes :
            </p>
            <ul className="space-y-4 text-gray-700 leading-relaxed">
              <li>
                <span className="font-semibold text-gray-900">
                  « Plateforme »
                </span>{" "}
                : désigne le site internet accessible à l&apos;adresse
                www.roullepro.com, ainsi que l&apos;ensemble des services
                associés (API, applications mobiles le cas échéant, back-office
                professionnel).
              </li>
              <li>
                <span className="font-semibold text-gray-900">
                  « Utilisateur »
                </span>{" "}
                : désigne toute personne physique ou morale titulaire d&apos;un
                compte actif sur la Plateforme, qu&apos;elle soit Vendeur,
                Acheteur ou les deux à la fois.
              </li>
              <li>
                <span className="font-semibold text-gray-900">
                  « Vendeur »
                </span>{" "}
                : désigne tout Utilisateur qui publie une ou plusieurs Annonces
                sur la Plateforme en vue de céder un ou plusieurs Véhicules.
              </li>
              <li>
                <span className="font-semibold text-gray-900">
                  « Acheteur »
                </span>{" "}
                : désigne tout Utilisateur qui consulte les Annonces et peut
                entrer en contact avec un Vendeur en vue de l&apos;acquisition
                d&apos;un Véhicule.
              </li>
              <li>
                <span className="font-semibold text-gray-900">
                  « Annonce »
                </span>{" "}
                : désigne toute offre de cession d&apos;un Véhicule publiée sur
                la Plateforme par un Vendeur, comprenant notamment les
                photographies, la description technique, le prix de vente et les
                informations de contact.
              </li>
              <li>
                <span className="font-semibold text-gray-900">
                  « Véhicule »
                </span>{" "}
                : désigne tout véhicule à moteur à usage professionnel dont la
                cession est proposée via une Annonce, incluant notamment les VTC,
                taxis, ambulances, TPMR, navettes et utilitaires.
              </li>
              <li>
                <span className="font-semibold text-gray-900">
                  « Compte Professionnel »
                </span>{" "}
                : désigne l&apos;espace personnel et sécurisé créé par un
                Utilisateur sur la Plateforme après vérification de sa qualité
                de professionnel.
              </li>
              <li>
                <span className="font-semibold text-gray-900">
                  « Contenu »
                </span>{" "}
                : désigne l&apos;ensemble des informations, textes, images,
                données et éléments de toute nature déposés par un Utilisateur
                sur la Plateforme.
              </li>
              <li>
                <span className="font-semibold text-gray-900">
                  « RGPD »
                </span>{" "}
                : désigne le Règlement (UE) 2016/679 du Parlement européen et du
                Conseil du 27 avril 2016 relatif à la protection des personnes
                physiques à l&apos;égard du traitement des données à caractère
                personnel.
              </li>
            </ul>
          </section>

          {/* Article 3 */}
          <section className="bg-white rounded-xl shadow-sm p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-100 pb-3">
              Article 3 – Accès à la plateforme et création de compte
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <h3 className="text-lg font-semibold text-gray-800 mt-2">
                3.1 Conditions d&apos;accès
              </h3>
              <p>
                L&apos;accès à la Plateforme et la création d&apos;un Compte
                Professionnel sont exclusivement réservés aux professionnels au
                sens de l&apos;article L. 212-2 du Code de la consommation.
                Toute personne souhaitant créer un compte doit justifier de sa
                qualité de professionnel immatriculé en France.
              </p>
              <h3 className="text-lg font-semibold text-gray-800 mt-4">
                3.2 Informations requises lors de l&apos;inscription
              </h3>
              <p>
                Lors de la création d&apos;un Compte Professionnel, les
                informations suivantes sont obligatoirement requises :
              </p>
              <ul className="list-disc list-inside space-y-2 pl-4">
                <li>
                  Le numéro SIRET valide et actif de l&apos;entreprise ou de
                  l&apos;établissement ;
                </li>
                <li>
                  La dénomination sociale ou le nom commercial de
                  l&apos;entreprise ;
                </li>
                <li>
                  L&apos;adresse du siège social ou de l&apos;établissement
                  principal ;
                </li>
                <li>
                  Le nom, prénom et la fonction du représentant légal ou du
                  mandataire autorisé ;
                </li>
                <li>
                  Une adresse de courrier électronique professionnelle valide ;
                </li>
                <li>Un numéro de téléphone professionnel joignable.</li>
              </ul>
              <h3 className="text-lg font-semibold text-gray-800 mt-4">
                3.3 Vérification de l&apos;identité professionnelle
              </h3>
              <p>
                RoullePro procède à la vérification du numéro SIRET fourni auprès
                des registres officiels (INSEE, Infogreffe) afin de s&apos;assurer
                de l&apos;existence légale et de l&apos;activité de
                l&apos;entreprise. RoullePro se réserve le droit de demander à
                tout Utilisateur la transmission d&apos;un extrait Kbis de moins
                de trois mois, d&apos;un avis de situation SIRENE, ou de tout
                autre document officiel permettant d&apos;établir la qualité de
                professionnel et l&apos;identité du représentant légal.
              </p>
              <p>
                La vérification peut être effectuée lors de l&apos;inscription ou
                à tout moment ultérieur, notamment en cas de doute sur
                l&apos;exactitude des informations fournies. Le défaut de
                production des documents requis dans un délai de sept (7) jours
                ouvrés suivant la demande de RoullePro entraîne la suspension
                immédiate du compte.
              </p>
              <h3 className="text-lg font-semibold text-gray-800 mt-4">
                3.4 Sécurité du compte
              </h3>
              <p>
                Chaque Utilisateur est seul responsable de la confidentialité de
                ses identifiants de connexion. Tout accès à la Plateforme au moyen
                de ces identifiants est présumé effectué par l&apos;Utilisateur
                lui-même. En cas de perte, de vol ou d&apos;utilisation non
                autorisée, l&apos;Utilisateur doit notifier RoullePro sans délai à
                l&apos;adresse{" "}
                <a
                  href="mailto:contact@roullepro.com"
                  className="text-blue-600 underline hover:text-blue-800"
                >
                  contact@roullepro.com
                </a>
                .
              </p>
              <p>
                Un même Utilisateur ne peut créer qu&apos;un seul Compte
                Professionnel par numéro SIRET. La création de comptes multiples
                avec le même SIRET ou avec des informations fictives est
                strictement interdite et constitue un motif de résiliation
                immédiate de l&apos;ensemble des comptes concernés.
              </p>
            </div>
          </section>

          {/* Article 4 */}
          <section className="bg-white rounded-xl shadow-sm p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-100 pb-3">
              Article 4 – Publication d&apos;annonces
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <h3 className="text-lg font-semibold text-gray-800 mt-2">
                4.1 Règles générales de publication
              </h3>
              <p>
                Seuls les Vendeurs disposant d&apos;un Compte Professionnel actif
                et vérifié sont autorisés à publier des Annonces. Chaque Annonce
                doit décrire de façon exacte, sincère et complète le Véhicule
                proposé à la vente. Le Vendeur s&apos;engage à fournir, pour
                chaque Annonce, les informations suivantes :
              </p>
              <ul className="list-disc list-inside space-y-2 pl-4">
                <li>
                  La marque, le modèle, la version et l&apos;année de première
                  immatriculation du Véhicule ;
                </li>
                <li>
                  Le kilométrage réel et certifié au moment de la publication ;
                </li>
                <li>
                  L&apos;état général et la description détaillée des éventuelles
                  réparations, accidents ou sinistres connus ;
                </li>
                <li>
                  Au moins trois (3) photographies récentes et non modifiées du
                  Véhicule sous différents angles ;
                </li>
                <li>
                  Le prix de vente demandé, exprimé en euros toutes taxes
                  comprises (TTC) ou hors taxes (HT) avec mention explicite du
                  régime fiscal applicable ;
                </li>
                <li>
                  La mention du titre de propriété (carte grise) et
                  l&apos;indication de toute éventuelle servitude (gage,
                  nantissement, crédit-bail en cours) ;
                </li>
                <li>
                  Les équipements spécifiques liés à l&apos;usage professionnel
                  (taximètre homologué, équipement TPMR, etc.).
                </li>
              </ul>
              <h3 className="text-lg font-semibold text-gray-800 mt-4">
                4.2 Modération avant publication
              </h3>
              <p>
                Toute Annonce soumise par un Vendeur fait l&apos;objet d&apos;un
                processus de modération préalable à sa mise en ligne sur la
                Plateforme. RoullePro se réserve le droit de :
              </p>
              <ul className="list-disc list-inside space-y-2 pl-4">
                <li>
                  Valider ou refuser toute Annonce sans avoir à en justifier le
                  motif ;
                </li>
                <li>
                  Demander des informations ou documents complémentaires au
                  Vendeur avant validation ;
                </li>
                <li>
                  Modifier la présentation ou la catégorisation d&apos;une Annonce
                  pour assurer la cohérence du catalogue, sans en altérer le
                  contenu substantiel ;
                </li>
                <li>
                  Retirer à tout moment une Annonce déjà publiée en cas de
                  violation des présentes CGU.
                </li>
              </ul>
              <p>
                Le délai de modération est indicativement de quarante-huit (48)
                heures ouvrées. Ce délai peut être prolongé si des vérifications
                complémentaires sont nécessaires.
              </p>
              <h3 className="text-lg font-semibold text-gray-800 mt-4">
                4.3 Contenu interdit dans les annonces
              </h3>
              <p>
                Sont expressément interdits dans toute Annonce publiée sur la
                Plateforme :
              </p>
              <ul className="list-disc list-inside space-y-2 pl-4">
                <li>
                  Toute information inexacte, trompeuse ou de nature à induire
                  l&apos;Acheteur en erreur sur les caractéristiques essentielles
                  du Véhicule ;
                </li>
                <li>
                  La publication d&apos;un Véhicule dont le Vendeur n&apos;est pas
                  le propriétaire légitime ou le mandataire dûment habilité ;
                </li>
                <li>
                  Toute photographie ne correspondant pas au Véhicule réellement
                  proposé à la vente ;
                </li>
                <li>
                  La dissimulation d&apos;un sinistre, d&apos;un compteur
                  kilométrique falsifié ou de tout vice caché connu du Vendeur ;
                </li>
                <li>
                  Tout contenu à caractère discriminatoire, offensant, illicite ou
                  contraire aux bonnes mœurs ;
                </li>
                <li>
                  Toute mention renvoyant vers des plateformes concurrentes ou
                  invitant l&apos;Acheteur à contourner la Plateforme pour
                  finaliser la transaction.
                </li>
              </ul>
            </div>
          </section>

          {/* Article 5 */}
          <section className="bg-white rounded-xl shadow-sm p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-100 pb-3">
              Article 5 – Responsabilité de la plateforme
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                RoullePro agit en qualité d&apos;
                <strong>intermédiaire technique</strong> au sens de la loi n°
                2004-575 du 21 juin 2004 pour la confiance dans l&apos;économie
                numérique (LCEN) et du Règlement (UE) 2022/2065 sur les services
                numériques (DSA). À ce titre, RoullePro n&apos;est pas partie aux
                transactions conclues entre les Vendeurs et les Acheteurs et
                n&apos;intervient pas dans la négociation, la fixation du prix, ni
                dans l&apos;exécution des contrats de vente.
              </p>
              <p>
                RoullePro ne garantit pas :
              </p>
              <ul className="list-disc list-inside space-y-2 pl-4">
                <li>
                  L&apos;exactitude, la complétude ou la sincérité des informations
                  communiquées par les Utilisateurs dans leurs Annonces ;
                </li>
                <li>
                  La qualité, la conformité ou l&apos;état réel des Véhicules
                  présentés sur la Plateforme ;
                </li>
                <li>
                  La solvabilité ou la bonne foi de tout Utilisateur, qu&apos;il
                  soit Vendeur ou Acheteur ;
                </li>
                <li>
                  La disponibilité permanente et ininterrompue de la Plateforme,
                  des interventions de maintenance pouvant être nécessaires.
                </li>
              </ul>
              <p>
                La responsabilité de RoullePro ne peut être engagée qu&apos;en
                cas de faute lourde ou dolosive directement imputable à ses
                équipes dans le cadre de son activité d&apos;hébergement et de mise
                en relation. En dehors de ces cas, RoullePro est exonérée de toute
                responsabilité au titre des dommages directs ou indirects découlant
                de l&apos;utilisation de la Plateforme ou des relations
                contractuelles entre Utilisateurs.
              </p>
              <p>
                RoullePro met en place des procédures de modération et de
                signalement destinées à lutter contre les contenus illicites
                conformément aux obligations légales applicables. Tout Utilisateur
                peut signaler un contenu litigieux via le formulaire de signalement
                disponible sur la Plateforme ou par courrier électronique à
                l&apos;adresse{" "}
                <a
                  href="mailto:contact@roullepro.com"
                  className="text-blue-600 underline hover:text-blue-800"
                >
                  contact@roullepro.com
                </a>
                .
              </p>
            </div>
          </section>

          {/* Article 6 */}
          <section className="bg-white rounded-xl shadow-sm p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-100 pb-3">
              Article 6 – Obligations des utilisateurs
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <h3 className="text-lg font-semibold text-gray-800 mt-2">
                6.1 Obligations générales
              </h3>
              <p>
                Chaque Utilisateur s&apos;engage à utiliser la Plateforme de bonne
                foi, dans le strict respect des présentes CGU, de la
                réglementation applicable et des droits des tiers. À ce titre,
                l&apos;Utilisateur s&apos;engage notamment à :
              </p>
              <ul className="list-disc list-inside space-y-2 pl-4">
                <li>
                  Fournir des informations exactes, à jour et complètes lors de
                  l&apos;inscription et lors de la publication d&apos;Annonces, et
                  à les mettre à jour sans délai en cas de modification ;
                </li>
                <li>
                  Ne pas usurper l&apos;identité d&apos;un tiers ni se prévaloir
                  faussement d&apos;une qualité ou d&apos;une habilitation
                  professionnelle qu&apos;il ne détient pas ;
                </li>
                <li>
                  Respecter les droits de propriété intellectuelle de
                  RoullePro et des tiers dans l&apos;utilisation de la Plateforme.
                </li>
              </ul>
              <h3 className="text-lg font-semibold text-gray-800 mt-4">
                6.2 Obligations spécifiques du Vendeur
              </h3>
              <p>
                Le Vendeur s&apos;engage spécifiquement à :
              </p>
              <ul className="list-disc list-inside space-y-2 pl-4">
                <li>
                  Être propriétaire du Véhicule proposé à la vente ou disposer
                  d&apos;un mandat écrit et valable émanant du propriétaire
                  légitime ;
                </li>
                <li>
                  S&apos;assurer que le Véhicule est libre de tout gage,
                  nantissement ou opposition susceptible d&apos;en empêcher la
                  cession, ou à en informer expressément l&apos;Acheteur dans
                  l&apos;Annonce ;
                </li>
                <li>
                  Garantir que le Véhicule n&apos;est pas volé, qu&apos;il
                  n&apos;est pas sous le coup d&apos;une procédure judiciaire ou
                  administrative d&apos;immobilisation et que le numéro
                  d&apos;identification du véhicule (VIN/NIV) n&apos;a pas été
                  altéré ;
                </li>
                <li>
                  Remettre à l&apos;Acheteur, lors de la transaction, le
                  certificat d&apos;immatriculation (carte grise) dûment barré et
                  signé, le contrôle technique valide le cas échéant, ainsi que
                  tout document lié aux équipements professionnels spécifiques ;
                </li>
                <li>
                  Retirer ou mettre à jour sans délai toute Annonce dès que le
                  Véhicule correspondant n&apos;est plus disponible à la vente.
                </li>
              </ul>
              <h3 className="text-lg font-semibold text-gray-800 mt-4">
                6.3 Obligations spécifiques de l&apos;Acheteur
              </h3>
              <p>
                L&apos;Acheteur s&apos;engage à ne contacter les Vendeurs que dans
                un but sérieux d&apos;acquisition professionnelle et à ne pas
                utiliser les coordonnées obtenues via la Plateforme à des fins de
                démarchage commercial non sollicité, de concurrence déloyale ou à
                toute autre fin étrangère à la transaction envisagée.
              </p>
            </div>
          </section>

          {/* Article 7 */}
          <section className="bg-white rounded-xl shadow-sm p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-100 pb-3">
              Article 7 – Contenu interdit
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                Sont strictement interdits sur la Plateforme, sous peine de
                suspension ou résiliation immédiate du compte et de poursuites
                judiciaires, les comportements et contenus suivants :
              </p>
              <ul className="list-disc list-inside space-y-3 pl-4">
                <li>
                  <span className="font-semibold">Véhicules volés :</span>{" "}
                  la mise en vente, la tentative de mise en vente ou la
                  facilitation de la vente de tout Véhicule faisant l&apos;objet
                  d&apos;un signalement pour vol, ou dont le titre de propriété est
                  frauduleux ou falsifié ;
                </li>
                <li>
                  <span className="font-semibold">
                    Annonces frauduleuses :
                  </span>{" "}
                  la publication d&apos;Annonces fictives, de prix
                  manifestement anormaux destinés à attirer frauduleusement des
                  Acheteurs, ou la collecte de fonds sans intention réelle de céder
                  un Véhicule (escroquerie) ;
                </li>
                <li>
                  <span className="font-semibold">
                    Falsification de kilométrage :
                  </span>{" "}
                  toute manipulation du compteur kilométrique ou déclaration
                  sciemment inexacte du kilométrage réel du Véhicule ;
                </li>
                <li>
                  <span className="font-semibold">Concurrence déloyale :</span>{" "}
                  tout acte de dénigrement d&apos;un concurrent, de
                  détournement de clientèle, d&apos;utilisation abusive de
                  données extraites de la Plateforme, ou de création de comptes
                  multiples à des fins de manipulation du classement des Annonces ;
                </li>
                <li>
                  <span className="font-semibold">Contournement de la Plateforme :</span>{" "}
                  toute tentative délibérée d&apos;inciter un autre Utilisateur à
                  finaliser une transaction en dehors de la Plateforme dans le but
                  d&apos;éviter les conditions d&apos;utilisation ou les frais de
                  service applicables ;
                </li>
                <li>
                  <span className="font-semibold">Contenus illicites :</span>{" "}
                  tout Contenu portant atteinte à la dignité humaine, à
                  caractère discriminatoire, faisant l&apos;apologie du crime ou
                  violant les dispositions de la loi n° 2004-575 du 21 juin 2004 ;
                </li>
                <li>
                  <span className="font-semibold">
                    Attaques informatiques :
                  </span>{" "}
                  tout accès non autorisé aux systèmes de la Plateforme,
                  tout déni de service, injection de code malveillant, extraction
                  automatisée de données (scraping) non autorisée, ou tentative de
                  déchiffrement des mécanismes de sécurité.
                </li>
              </ul>
              <p>
                RoullePro se réserve le droit de signaler tout comportement
                frauduleux aux autorités compétentes, notamment à la Direction
                Générale de la Concurrence, de la Consommation et de la Répression
                des Fraudes (DGCCRF), aux services de police judiciaire ou au
                Parquet compétent.
              </p>
            </div>
          </section>

          {/* Article 8 */}
          <section className="bg-white rounded-xl shadow-sm p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-100 pb-3">
              Article 8 – Suspension et résiliation de compte
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <h3 className="text-lg font-semibold text-gray-800 mt-2">
                8.1 Résiliation à l&apos;initiative de l&apos;Utilisateur
              </h3>
              <p>
                Tout Utilisateur peut résilier son Compte Professionnel à tout
                moment en adressant une demande écrite à{" "}
                <a
                  href="mailto:contact@roullepro.com"
                  className="text-blue-600 underline hover:text-blue-800"
                >
                  contact@roullepro.com
                </a>{" "}
                ou en utilisant la fonctionnalité de fermeture de compte
                disponible dans les paramètres du compte. La fermeture prend effet
                dans un délai de sept (7) jours ouvrés suivant la réception de la
                demande, sous réserve qu&apos;aucune transaction en cours ne
                nécessite le maintien temporaire du compte.
              </p>
              <h3 className="text-lg font-semibold text-gray-800 mt-4">
                8.2 Suspension à l&apos;initiative de RoullePro
              </h3>
              <p>
                RoullePro peut procéder à la suspension temporaire d&apos;un
                Compte Professionnel, avec ou sans préavis selon la gravité des
                faits, dans les cas suivants :
              </p>
              <ul className="list-disc list-inside space-y-2 pl-4">
                <li>
                  Non-production des documents de vérification demandés dans les
                  délais impartis ;
                </li>
                <li>
                  Suspicion fondée de violation des présentes CGU en attente de
                  vérification ;
                </li>
                <li>
                  Signalement d&apos;un comportement frauduleux par un ou plusieurs
                  autres Utilisateurs ;
                </li>
                <li>
                  Inactivité du compte pendant une période supérieure à vingt-quatre
                  (24) mois consécutifs, après notification préalable.
                </li>
              </ul>
              <p>
                Durant la période de suspension, l&apos;Utilisateur ne peut plus
                accéder à son compte ni publier d&apos;Annonces. Ses Annonces
                actives sont automatiquement retirées de la Plateforme.
              </p>
              <h3 className="text-lg font-semibold text-gray-800 mt-4">
                8.3 Résiliation à l&apos;initiative de RoullePro
              </h3>
              <p>
                RoullePro peut procéder à la résiliation définitive d&apos;un
                Compte Professionnel, sans préavis ni indemnité, en cas de :
              </p>
              <ul className="list-disc list-inside space-y-2 pl-4">
                <li>Violation grave ou répétée des présentes CGU ;</li>
                <li>
                  Publication d&apos;Annonces relatives à des Véhicules volés ou
                  faisant l&apos;objet d&apos;une mesure judiciaire
                  d&apos;immobilisation ;
                </li>
                <li>
                  Fraude avérée, usurpation d&apos;identité ou fourniture de
                  documents falsifiés ;
                </li>
                <li>
                  Condamnation pénale définitive de l&apos;Utilisateur pour des
                  faits en lien avec son activité sur la Plateforme ;
                </li>
                <li>
                  Non-respect d&apos;une décision de justice opposable à
                  l&apos;Utilisateur.
                </li>
              </ul>
              <p>
                En cas de résiliation pour manquement, les données de
                l&apos;Utilisateur sont conservées pendant la durée légale
                applicable et peuvent être transmises aux autorités compétentes.
                L&apos;Utilisateur résilié ne pourra créer un nouveau compte sans
                autorisation expresse de RoullePro.
              </p>
            </div>
          </section>

          {/* Article 9 */}
          <section className="bg-white rounded-xl shadow-sm p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-100 pb-3">
              Article 9 – Données personnelles et RGPD
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <h3 className="text-lg font-semibold text-gray-800 mt-2">
                9.1 Responsable de traitement
              </h3>
              <p>
                RoullePro SAS est responsable du traitement des données à
                caractère personnel collectées dans le cadre de l&apos;utilisation
                de la Plateforme, au sens de l&apos;article 4(7) du RGPD. Pour
                toute question relative à la protection des données personnelles,
                l&apos;Utilisateur peut contacter RoullePro à l&apos;adresse{" "}
                <a
                  href="mailto:contact@roullepro.com"
                  className="text-blue-600 underline hover:text-blue-800"
                >
                  contact@roullepro.com
                </a>{" "}
                ou à l&apos;adresse postale du siège social.
              </p>
              <h3 className="text-lg font-semibold text-gray-800 mt-4">
                9.2 Données collectées et finalités
              </h3>
              <p>
                RoullePro collecte et traite les données suivantes pour les
                finalités indiquées :
              </p>
              <ul className="list-disc list-inside space-y-2 pl-4">
                <li>
                  <span className="font-semibold">Données d&apos;identification professionnelle</span>{" "}
                  (nom, prénom, SIRET, KBIS, adresse, téléphone, e-mail) : gestion
                  des comptes, vérification de la qualité de professionnel, lutte
                  contre la fraude — base légale : exécution du contrat (art. 6(1)
                  b RGPD) et obligation légale (art. 6(1) c RGPD) ;
                </li>
                <li>
                  <span className="font-semibold">Données des Annonces</span>{" "}
                  (description des Véhicules, photos, prix) : publication et
                  référencement des Annonces — base légale : exécution du contrat ;
                </li>
                <li>
                  <span className="font-semibold">Données de navigation</span>{" "}
                  (adresse IP, logs de connexion, pages consultées) : sécurité de la
                  Plateforme, détection des comportements frauduleux — base légale :
                  intérêt légitime (art. 6(1) f RGPD) ;
                </li>
                <li>
                  <span className="font-semibold">Données de communication</span>{" "}
                  (échanges de messages entre Utilisateurs) : facilitation de la
                  mise en relation et archivage à des fins de preuve — base légale :
                  exécution du contrat et intérêt légitime ;
                </li>
                <li>
                  <span className="font-semibold">Données de facturation</span>{" "}
                  (coordonnées bancaires, factures) : gestion des paiements et
                  obligations comptables — base légale : exécution du contrat et
                  obligation légale.
                </li>
              </ul>
              <h3 className="text-lg font-semibold text-gray-800 mt-4">
                9.3 Durées de conservation
              </h3>
              <ul className="list-disc list-inside space-y-2 pl-4">
                <li>
                  Données de compte : durée de vie du compte + 3 ans après
                  résiliation (prescription de droit commun) ;
                </li>
                <li>
                  Données de transaction et factures : 10 ans (obligation comptable
                  légale — art. L. 123-22 Code de commerce) ;
                </li>
                <li>
                  Logs de connexion et données de navigation : 12 mois maximum
                  (conformément à la loi n° 2004-575 du 21 juin 2004 et au décret
                  n° 2021-1362 du 20 octobre 2021) ;
                </li>
                <li>
                  Documents de vérification d&apos;identité professionnelle (KBIS,
                  SIRET) : durée de vie du compte + 5 ans.
                </li>
              </ul>
              <h3 className="text-lg font-semibold text-gray-800 mt-4">
                9.4 Destinataires des données
              </h3>
              <p>
                Les données personnelles des Utilisateurs sont destinées aux équipes
                internes de RoullePro habilitées, à ses sous-traitants techniques
                (hébergement, messagerie, outils CRM) liés par des clauses
                contractuelles de protection conformes au RGPD, et aux autorités
                publiques en cas d&apos;obligation légale. RoullePro ne vend pas et
                ne loue pas les données personnelles de ses Utilisateurs à des tiers
                à des fins commerciales.
              </p>
              <h3 className="text-lg font-semibold text-gray-800 mt-4">
                9.5 Droits des personnes concernées
              </h3>
              <p>
                Conformément aux articles 15 à 22 du RGPD, tout Utilisateur dispose
                des droits suivants sur ses données personnelles :
              </p>
              <ul className="list-disc list-inside space-y-2 pl-4">
                <li>
                  <span className="font-semibold">Droit d&apos;accès</span> : obtenir
                  confirmation que des données le concernant sont traitées et en
                  obtenir une copie ;
                </li>
                <li>
                  <span className="font-semibold">Droit de rectification</span> :
                  corriger des données inexactes ou incomplètes ;
                </li>
                <li>
                  <span className="font-semibold">Droit à l&apos;effacement</span> :
                  demander la suppression de ses données, sous réserve des
                  obligations légales de conservation ;
                </li>
                <li>
                  <span className="font-semibold">
                    Droit à la limitation du traitement
                  </span>{" "}
                  : s&apos;opposer temporairement au traitement de ses données ;
                </li>
                <li>
                  <span className="font-semibold">
                    Droit à la portabilité
                  </span>{" "}
                  : recevoir ses données dans un format structuré et lisible par
                  machine ;
                </li>
                <li>
                  <span className="font-semibold">Droit d&apos;opposition</span> :
                  s&apos;opposer au traitement fondé sur l&apos;intérêt légitime.
                </li>
              </ul>
              <p>
                Ces droits s&apos;exercent par courrier électronique à{" "}
                <a
                  href="mailto:contact@roullepro.com"
                  className="text-blue-600 underline hover:text-blue-800"
                >
                  contact@roullepro.com
                </a>
                , accompagné d&apos;une copie d&apos;un document d&apos;identité en
                cours de validité. RoullePro dispose d&apos;un délai d&apos;un mois
                pour répondre, prolongeable de deux mois en cas de demandes
                complexes. En cas de désaccord, l&apos;Utilisateur peut saisir la
                Commission Nationale de l&apos;Informatique et des Libertés (CNIL)
                à l&apos;adresse :{" "}
                <a
                  href="https://www.cnil.fr"
                  className="text-blue-600 underline hover:text-blue-800"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  www.cnil.fr
                </a>
                .
              </p>
            </div>
          </section>

          {/* Article 10 */}
          <section className="bg-white rounded-xl shadow-sm p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-100 pb-3">
              Article 10 – Cookies
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                La Plateforme utilise des cookies et technologies traceurs
                strictement limités aux finalités techniques indispensables au bon
                fonctionnement du service.
              </p>
              <h3 className="text-lg font-semibold text-gray-800 mt-4">
                10.1 Cookies techniques strictement nécessaires
              </h3>
              <p>
                Les cookies techniques sont déposés sans consentement préalable de
                l&apos;Utilisateur, conformément aux recommandations de la CNIL et à
                l&apos;article 82 de la loi Informatique et Libertés. Ils comprennent
                notamment :
              </p>
              <ul className="list-disc list-inside space-y-2 pl-4">
                <li>
                  Les cookies de session d&apos;authentification permettant de
                  maintenir la connexion de l&apos;Utilisateur ;
                </li>
                <li>
                  Les cookies de sécurité (CSRF tokens) destinés à protéger les
                  formulaires contre les attaques de type Cross-Site Request Forgery
                  ;
                </li>
                <li>
                  Les cookies de mémorisation des préférences d&apos;affichage
                  (langue, filtres de recherche) pour la durée de la session.
                </li>
              </ul>
              <h3 className="text-lg font-semibold text-gray-800 mt-4">
                10.2 Absence de tracking publicitaire
              </h3>
              <p>
                RoullePro n&apos;utilise aucun cookie à des fins de suivi publicitaire,
                de profilage comportemental, de ciblage commercial ou de revente
                de données à des régies publicitaires tierces. Aucun pixel de
                suivi publicitaire (de type Facebook Pixel, Google Ads, etc.)
                n&apos;est déployé sur la Plateforme dans le cadre de la navigation
                des Utilisateurs identifiés.
              </p>
              <h3 className="text-lg font-semibold text-gray-800 mt-4">
                10.3 Gestion des cookies
              </h3>
              <p>
                L&apos;Utilisateur peut paramétrer son navigateur pour refuser
                l&apos;ensemble des cookies. Toutefois, le refus des cookies
                techniques est susceptible de perturber le fonctionnement de la
                Plateforme, notamment les fonctions de connexion et de sécurité.
                Les modalités de paramétrage des cookies varient selon les
                navigateurs ; l&apos;Utilisateur est invité à se référer à la
                documentation de son navigateur pour en savoir plus.
              </p>
            </div>
          </section>

          {/* Article 11 */}
          <section className="bg-white rounded-xl shadow-sm p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-100 pb-3">
              Article 11 – Propriété intellectuelle
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <h3 className="text-lg font-semibold text-gray-800 mt-2">
                11.1 Propriété de RoullePro
              </h3>
              <p>
                La Plateforme RoullePro, dans sa conception, son architecture, son
                design, ses fonctionnalités, son code source, ses bases de données,
                ses marques, logos, dénominations sociales et tout autre élément
                la composant, constitue une œuvre protégée par le droit français de
                la propriété intellectuelle, notamment par le Code de la propriété
                intellectuelle.
              </p>
              <p>
                RoullePro est titulaire de l&apos;ensemble des droits de propriété
                intellectuelle afférents à la Plateforme. Toute reproduction,
                représentation, modification, adaptation, traduction, extraction
                substantielle ou non d&apos;une base de données, exploitation
                commerciale ou non, de tout ou partie de la Plateforme, sans
                autorisation écrite préalable de RoullePro, est strictement
                interdite et constitue une contrefaçon sanctionnée par les articles
                L. 335-2 et suivants du Code de la propriété intellectuelle.
              </p>
              <h3 className="text-lg font-semibold text-gray-800 mt-4">
                11.2 Contenu des Utilisateurs
              </h3>
              <p>
                L&apos;Utilisateur conserve l&apos;intégralité des droits de
                propriété intellectuelle sur les Contenus qu&apos;il publie sur la
                Plateforme. En publiant un Contenu, l&apos;Utilisateur accorde à
                RoullePro une licence non exclusive, mondiale, gratuite et pour la
                durée légale de protection des droits d&apos;auteur applicable,
                d&apos;utiliser, reproduire, représenter, adapter et diffuser ledit
                Contenu aux fins exclusives d&apos;exploitation de la Plateforme et
                de promotion non commerciale de celle-ci.
              </p>
              <p>
                L&apos;Utilisateur garantit à RoullePro qu&apos;il détient tous les
                droits nécessaires sur les Contenus publiés (photographies, textes,
                données) et que ceux-ci ne portent pas atteinte aux droits de tiers.
                Il garantit RoullePro contre tout recours de tiers fondé sur une
                violation de droits de propriété intellectuelle imputable aux
                Contenus qu&apos;il a publiés.
              </p>
            </div>
          </section>

          {/* Article 12 */}
          <section className="bg-white rounded-xl shadow-sm p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-100 pb-3">
              Article 12 – Limitation de responsabilité
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                Dans les limites autorisées par la réglementation applicable,
                RoullePro exclut ou limite sa responsabilité dans les cas suivants :
              </p>
              <ul className="list-disc list-inside space-y-3 pl-4">
                <li>
                  <span className="font-semibold">Interruptions de service :</span>{" "}
                  RoullePro ne saurait être tenue responsable des interruptions,
                  ralentissements ou indisponibilités de la Plateforme résultant
                  d&apos;opérations de maintenance, de dysfonctionnements techniques,
                  d&apos;attaques informatiques ou de tout événement de force majeure
                  au sens de l&apos;article 1218 du Code civil ;
                </li>
                <li>
                  <span className="font-semibold">
                    Inexécution des transactions entre Utilisateurs :
                  </span>{" "}
                  RoullePro n&apos;est pas partie aux contrats de vente conclus entre
                  Vendeurs et Acheteurs et ne saurait être tenue responsable de leur
                  inexécution, de la non-conformité des Véhicules, des vices cachés
                  ou de tout litige post-transaction ;
                </li>
                <li>
                  <span className="font-semibold">Fraude des Utilisateurs :</span>{" "}
                  malgré les mesures de vérification mises en place, RoullePro ne
                  peut garantir l&apos;absence totale de comportements frauduleux de
                  la part d&apos;Utilisateurs malveillants et décline toute
                  responsabilité à ce titre ;
                </li>
                <li>
                  <span className="font-semibold">Dommages indirects :</span>{" "}
                  la responsabilité de RoullePro ne pourra en aucun cas inclure le
                  remboursement de pertes d&apos;exploitation, de manque à gagner,
                  de préjudice commercial ou de toute autre forme de dommage
                  indirect, quand bien même RoullePro aurait été informée de la
                  possibilité de tels dommages.
                </li>
              </ul>
              <p>
                Dans les cas où la responsabilité de RoullePro serait retenue par
                une juridiction compétente, l&apos;indemnisation due à
                l&apos;Utilisateur est plafonnée au montant des sommes versées par
                l&apos;Utilisateur à RoullePro au cours des douze (12) derniers mois
                précédant le fait générateur de responsabilité, ou, à défaut, à la
                somme de cinq cents euros (500 €).
              </p>
            </div>
          </section>

          {/* Article 13 */}
          <section className="bg-white rounded-xl shadow-sm p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-100 pb-3">
              Article 13 – Droit applicable et juridiction compétente
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <h3 className="text-lg font-semibold text-gray-800 mt-2">
                13.1 Droit applicable
              </h3>
              <p>
                Les présentes CGU sont régies, interprétées et exécutées
                conformément au droit français, et notamment :
              </p>
              <ul className="list-disc list-inside space-y-2 pl-4">
                <li>
                  Le Code civil, notamment ses dispositions relatives aux contrats
                  et à la responsabilité délictuelle ;
                </li>
                <li>
                  Le Code de commerce, notamment en matière d&apos;obligations des
                  professionnels ;
                </li>
                <li>
                  La loi n° 2004-575 du 21 juin 2004 pour la confiance dans
                  l&apos;économie numérique (LCEN) ;
                </li>
                <li>
                  Le Règlement (UE) 2016/679 (RGPD) et la loi n° 78-17 du 6 janvier
                  1978 modifiée (loi Informatique et Libertés) ;
                </li>
                <li>
                  Le Règlement (UE) 2022/2065 relatif à un marché intérieur des
                  services numériques (DSA).
                </li>
              </ul>
              <h3 className="text-lg font-semibold text-gray-800 mt-4">
                13.2 Règlement amiable
              </h3>
              <p>
                En cas de litige entre RoullePro et un Utilisateur relatif aux
                présentes CGU, les parties s&apos;engagent à tenter de résoudre le
                différend amiablement dans un délai de trente (30) jours suivant la
                notification du litige par lettre recommandée avec accusé de
                réception ou par courrier électronique à{" "}
                <a
                  href="mailto:contact@roullepro.com"
                  className="text-blue-600 underline hover:text-blue-800"
                >
                  contact@roullepro.com
                </a>
                .
              </p>
              <h3 className="text-lg font-semibold text-gray-800 mt-4">
                13.3 Juridiction compétente
              </h3>
              <p>
                À défaut de résolution amiable, tout litige relatif à la validité,
                l&apos;interprétation, l&apos;exécution ou la résiliation des
                présentes CGU sera soumis à la compétence exclusive des tribunaux
                français. Conformément à l&apos;article R. 517-1 du Code du travail
                et aux règles générales de compétence territoriale du Code de
                procédure civile, le tribunal compétent sera celui du lieu du siège
                social de RoullePro, sauf disposition légale impérative contraire.
              </p>
              <p>
                La langue de la procédure est le français. Toute traduction éventuelle
                des présentes CGU dans une autre langue est fournie à titre indicatif
                uniquement ; en cas de contradiction, la version française prévaut.
              </p>
            </div>
          </section>

          {/* Article 14 */}
          <section className="bg-white rounded-xl shadow-sm p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-100 pb-3">
              Article 14 – Contact et médiation
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <h3 className="text-lg font-semibold text-gray-800 mt-2">
                14.1 Contact
              </h3>
              <p>
                Pour toute question, réclamation ou signalement relatif à
                l&apos;utilisation de la Plateforme, à une Annonce litigieuse ou à
                la protection des données personnelles, l&apos;Utilisateur peut
                contacter RoullePro :
              </p>
              <ul className="list-disc list-inside space-y-2 pl-4">
                <li>
                  Par courrier électronique :{" "}
                  <a
                    href="mailto:contact@roullepro.com"
                    className="text-blue-600 underline hover:text-blue-800"
                  >
                    contact@roullepro.com
                  </a>
                </li>
                <li>
                  Par voie postale : RoullePro SAS, [adresse du siège social],
                  France
                </li>
                <li>
                  Via le formulaire de contact disponible sur la Plateforme à
                  l&apos;adresse :{" "}
                  <a
                    href="https://www.roullepro.com/contact"
                    className="text-blue-600 underline hover:text-blue-800"
                  >
                    www.roullepro.com/contact
                  </a>
                </li>
              </ul>
              <p>
                RoullePro s&apos;engage à accuser réception de toute réclamation
                dans un délai de cinq (5) jours ouvrés et à y apporter une réponse
                de fond dans un délai de trente (30) jours ouvrés.
              </p>
              <h3 className="text-lg font-semibold text-gray-800 mt-4">
                14.2 Médiation de la consommation
              </h3>
              <p>
                Conformément aux articles L. 611-1 et suivants du Code de la
                consommation, et dans l&apos;hypothèse où la Plateforme serait
                accessible à des Utilisateurs ayant la qualité de consommateur (cas
                exceptionnel au regard de la vocation B2B exclusive de la
                Plateforme), RoullePro adhère au dispositif de médiation de la
                consommation. L&apos;Utilisateur consommateur peut, en cas de litige
                non résolu, saisir gratuitement le médiateur compétent dont les
                coordonnées sont disponibles sur demande à l&apos;adresse{" "}
                <a
                  href="mailto:contact@roullepro.com"
                  className="text-blue-600 underline hover:text-blue-800"
                >
                  contact@roullepro.com
                </a>
                .
              </p>
              <p>
                La Plateforme de règlement en ligne des litiges de la Commission
                européenne, accessible à l&apos;adresse{" "}
                <a
                  href="https://ec.europa.eu/consumers/odr"
                  className="text-blue-600 underline hover:text-blue-800"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  https://ec.europa.eu/consumers/odr
                </a>
                , peut également être utilisée en cas de litige transfrontalier.
              </p>
              <h3 className="text-lg font-semibold text-gray-800 mt-4">
                14.3 Signalement de contenus illicites
              </h3>
              <p>
                Conformément à l&apos;article 6 I 7° de la LCEN et aux obligations
                issues du DSA, tout Utilisateur ou tiers peut signaler à RoullePro
                tout Contenu manifestement illicite (annonce de Véhicule volé,
                annonce frauduleuse, contenu portant atteinte à la dignité humaine,
                etc.) en adressant une notification à{" "}
                <a
                  href="mailto:contact@roullepro.com"
                  className="text-blue-600 underline hover:text-blue-800"
                >
                  contact@roullepro.com
                </a>{" "}
                avec la mention « SIGNALEMENT CONTENU ILLICITE » en objet, en
                précisant l&apos;URL de l&apos;Annonce concernée et la nature de
                l&apos;infraction alléguée. RoullePro s&apos;engage à traiter tout
                signalement dans les meilleurs délais.
              </p>
            </div>
          </section>
        </div>

        {/* Pied de page CGU */}
        <div className="mt-10 text-center text-sm text-gray-400">
          <p>
            RoullePro SAS &mdash; Marketplace B2B de véhicules professionnels
          </p>
          <p className="mt-1">
            <a
              href="https://www.roullepro.com"
              className="hover:text-gray-600 underline"
            >
              www.roullepro.com
            </a>{" "}
            &mdash;{" "}
            <a
              href="mailto:contact@roullepro.com"
              className="hover:text-gray-600 underline"
            >
              contact@roullepro.com
            </a>
          </p>
          <p className="mt-2">
            Dernière mise à jour :{" "}
            <time dateTime="2026-04-17">17 avril 2026</time>
          </p>
        </div>
      </div>
    </div>
  );
}
