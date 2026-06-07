import { Navigation } from "lucide-react";

// Bouton "Itineraire" visible sur la fiche pro.
// Ouvre Google Maps en mode itineraire vers la destination (lat/lng si dispo,
// sinon recherche textuelle). Sur mobile, l'URL universelle Google Maps ouvre
// l'app native si elle est installee. Cible un nouvel onglet.

export default function ItineraireButton({
  latitude,
  longitude,
  raisonSociale,
  ville,
  codePostal,
  adresse,
}: {
  latitude: number | null;
  longitude: number | null;
  raisonSociale: string;
  ville: string;
  codePostal?: string | null;
  adresse?: string | null;
}) {
  const hasGeo = typeof latitude === "number" && typeof longitude === "number";
  const destination = hasGeo
    ? `${latitude},${longitude}`
    : encodeURIComponent(
        [adresse, codePostal, ville].filter(Boolean).join(" ") || `${raisonSociale} ${ville}`
      );
  const href = `https://www.google.com/maps/dir/?api=1&destination=${destination}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Obtenir l'itinéraire vers cette adresse"
      className="inline-flex items-center gap-2 mt-2 rounded-xl bg-[#0066CC] hover:bg-[#0052a3] text-white text-sm font-semibold px-4 py-2 transition"
    >
      <Navigation className="w-4 h-4" />
      Itinéraire
    </a>
  );
}
