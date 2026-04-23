/**
 * Helpers pour declencher les conversions Google Ads depuis n'importe quel composant client.
 * La balise gtag.js (AW-18107104211) est deja chargee via src/components/analytics/GoogleAnalytics.tsx
 *
 * Chaque fonction declenche une conversion distincte definie dans le compte Google Ads 300-710-8719.
 */

const GOOGLE_ADS_ID = "AW-18107104211";

/**
 * Wrapper defensif : certains navigateurs (adblock, cookie-banner) bloquent gtag.
 * Rien ne casse si gtag n'est pas dispo.
 */
function trackConversion(label: string, value?: number): void {
  if (typeof window === "undefined") return;
  if (typeof window.gtag !== "function") return;

  const send_to = `${GOOGLE_ADS_ID}/${label}`;
  if (value !== undefined) {
    window.gtag("event", "conversion", { send_to, value, currency: "EUR" });
  } else {
    window.gtag("event", "conversion", { send_to });
  }
}

// Conversion 1 : clic sur le numero de telephone depuis le site
export function trackClickToCall(): void {
  trackConversion("4ignCKgro6EcENP3kbpD");
}

// Conversion 2 : soumission du formulaire d'estimation depot-vente
export function trackDemandeEstimation(): void {
  trackConversion("QPX2CK2ro6EcENP3kbpD");
}

// Conversion 3 : inscription d'un garage partenaire
export function trackInscriptionGarage(): void {
  trackConversion("xNueCLCro6EcENP3kbpD");
}

// Conversion 4 : depot d'une nouvelle annonce validee
export function trackDepotAnnonce(valeur?: number): void {
  trackConversion("PcfoCLOro6EcENP3kbpD", valeur);
}
