/**
 * Helpers Google Analytics 4 pour RoullePro.
 * Événements clés configurés dans GA4 (Property 534110871) :
 *  - depot_annonce       : dépôt d'une annonce (ONCE_PER_SESSION)
 *  - demande_estimation  : formulaire d'estimation envoyé (ONCE_PER_SESSION)
 *  - clic_telephone      : clic sur lien tel: (ONCE_PER_EVENT)
 *  - contact_vendeur     : message envoyé à un vendeur (ONCE_PER_EVENT)
 *  - inscription_garage  : garage partenaire inscrit (ONCE_PER_SESSION)
 */

type GtagParams = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    gtag?: (command: string, eventName: string, params?: GtagParams) => void;
    dataLayer?: unknown[];
  }
}

function track(eventName: string, params: GtagParams = {}) {
  if (typeof window === "undefined") return;
  if (typeof window.gtag !== "function") return;
  window.gtag("event", eventName, params);
}

export const analytics = {
  depotAnnonce: (params: { categorie?: string; ville?: string; prix?: number } = {}) =>
    track("depot_annonce", params),

  demandeEstimation: (params: { type_vehicule?: string; modele?: string } = {}) =>
    track("demande_estimation", params),

  clicTelephone: (params: { source?: string } = {}) =>
    track("clic_telephone", { source: params.source ?? "header" }),

  contactVendeur: (params: { annonce_id?: string; categorie?: string } = {}) =>
    track("contact_vendeur", params),

  inscriptionGarage: (params: { ville?: string; plan?: string } = {}) =>
    track("inscription_garage", params),

  // Événement générique pour vues clés
  view: (itemName: string, itemCategory?: string) =>
    track("view_item", { item_name: itemName, item_category: itemCategory }),
};

export default analytics;
