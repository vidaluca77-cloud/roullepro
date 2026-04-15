export default function CGUPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8">Conditions Générales d'Utilisation</h1>
        
        <div className="bg-white rounded-xl shadow-sm p-8 space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Objet</h2>
            <p className="text-gray-700">
              Les présentes Conditions Générales d'Utilisation (CGU) régissent l'utilisation de la plateforme RoullePro, 
              marketplace dédiée à la vente de véhicules professionnels entre professionnels.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Inscription et compte utilisateur</h2>
            <p className="text-gray-700 mb-2">
              Pour utiliser RoullePro, vous devez créer un compte en fournissant des informations exactes et à jour. 
              Vous êtes responsable de la confidentialité de vos identifiants de connexion.
            </p>
            <p className="text-gray-700">
              RoullePro est réservé aux professionnels du transport disposant d'un SIRET/KBIS valide.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. Publication d'annonces</h2>
            <p className="text-gray-700 mb-2">
              Les utilisateurs peuvent publier gratuitement des annonces de vente de véhicules professionnels.
            </p>
            <p className="text-gray-700">
              Vous vous engagez à fournir des informations exactes et complètes sur les véhicules mis en vente. 
              Toute annonce frauduleuse ou trompeuse sera supprimée et pourra entraîner la suspension de votre compte.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Transactions</h2>
            <p className="text-gray-700">
              RoullePro met en relation vendeurs et acheteurs. Les transactions s'effectuent directement entre les parties. 
              RoullePro n'est pas partie aux transactions et n'assume aucune responsabilité concernant les véhicules vendus, 
              leur qualité, leur conformité ou leur livraison.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Contenu interdit</h2>
            <p className="text-gray-700">
              Il est interdit de publier sur RoullePro :
            </p>
            <ul className="list-disc list-inside text-gray-700 mt-2 space-y-1">
              <li>Des contenus illégaux, frauduleux ou trompeurs</li>
              <li>Des contenus portant atteinte aux droits de tiers</li>
              <li>Des contenus inappropriés ou offensants</li>
              <li>Des véhicules volés ou dont la provenance est douteuse</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Propriété intellectuelle</h2>
            <p className="text-gray-700">
              Tous les éléments de la plateforme RoullePro (logo, design, code, etc.) sont protégés par le droit d'auteur. 
              Toute utilisation non autorisée est interdite.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Données personnelles</h2>
            <p className="text-gray-700">
              Vos données personnelles sont traitées conformément à notre politique de confidentialité et au RGPD.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Signalement</h2>
            <p className="text-gray-700">
              Vous pouvez signaler toute annonce inappropriée ou contrevenant aux CGU. RoullePro se réserve le droit de 
              supprimer toute annonce signalée après vérification.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. Modification des CGU</h2>
            <p className="text-gray-700">
              RoullePro se réserve le droit de modifier les présentes CGU à tout moment. Les utilisateurs seront informés 
              des modifications importantes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">10. Contact</h2>
            <p className="text-gray-700">
              Pour toute question concernant les CGU, contactez-nous à : contact@roullepro.fr
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
