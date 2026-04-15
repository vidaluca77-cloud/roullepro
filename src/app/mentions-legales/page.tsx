export default function MentionsLegalesPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8">Mentions légales</h1>
        
        <div className="bg-white rounded-xl shadow-sm p-8 space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-4">Éditeur du site</h2>
            <p className="text-gray-700">
              RoullePro<br/>
              Marketplace de véhicules professionnels<br/>
              France
            </p>
            <p className="text-gray-700 mt-2">
              Email : contact@roullepro.fr
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Hébergement</h2>
            <p className="text-gray-700">
              Ce site est hébergé par :<br/>
              Netlify, Inc.<br/>
              2325 3rd Street, Suite 296<br/>
              San Francisco, California 94107<br/>
              États-Unis
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Propriété intellectuelle</h2>
            <p className="text-gray-700">
              L'ensemble des contenus présents sur le site RoullePro (textes, images, logos, etc.) 
              est protégé par le droit d'auteur. Toute reproduction, distribution ou utilisation 
              sans autorisation préalable est interdite.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Données personnelles</h2>
            <p className="text-gray-700">
              Les données personnelles collectées sur ce site sont traitées conformément au 
              Règlement Général sur la Protection des Données (RGPD). Pour plus d'informations, 
              consultez notre politique de confidentialité.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Cookies</h2>
            <p className="text-gray-700">
              Ce site utilise des cookies techniques nécessaires à son bon fonctionnement. 
              Aucun cookie publicitaire ou de tracking n'est utilisé sans votre consentement.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Responsabilité</h2>
            <p className="text-gray-700">
              RoullePro met tout en œuvre pour offrir des informations fiables et à jour. 
              Toutefois, RoullePro ne peut garantir l'exactitude, la précision ou l'exhaustivité 
              des informations mises à disposition sur ce site.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
