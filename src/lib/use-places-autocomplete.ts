"use client";

/**
 * Hook Google Places Autocomplete reutilisable pour les formulaires de demande
 * de transport (home, widget flottant, page etablissement, page pro, etc.).
 *
 * Charge dynamiquement le script Maps + libraries=places (une seule fois pour
 * toute la page), attache un Autocomplete sur chaque ref d'input fourni, et
 * remonte au consommateur :
 *  - le texte formate (formatted_address ou name)
 *  - les address_components (utilises pour extraire le departement)
 *
 * Restriction : France entiere (metropole + DROM).
 */

import { useEffect, useRef } from "react";

export type AddressComponent = {
  long_name: string;
  short_name: string;
  types: string[];
};

export type PlaceSelection = {
  formattedAddress: string;
  components: AddressComponent[];
  lat: number | null;
  lng: number | null;
};

interface GooglePlacesAutocomplete {
  addListener: (event: string, handler: () => void) => void;
  getPlace: () => {
    formatted_address?: string;
    name?: string;
    address_components?: AddressComponent[];
    geometry?: { location?: { lat: () => number; lng: () => number } };
  };
}
interface GoogleMapsGlobal {
  maps: {
    places: {
      Autocomplete: new (
        input: HTMLInputElement,
        opts?: {
          componentRestrictions?: { country: string | string[] };
          fields?: string[];
          types?: string[];
        }
      ) => GooglePlacesAutocomplete;
    };
    event: { clearInstanceListeners: (instance: object) => void };
  };
}
declare global {
  interface Window {
    google?: GoogleMapsGlobal;
    initGooglePlaces?: () => void;
  }
}

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

/**
 * Extrait un code departement (2 ou 3 caracteres) a partir des
 * address_components Google. Strategie en cascade :
 *  1) postal_code -> derive du code postal (gere Corse 2A/2B + DROM 97x/98x)
 *  2) administrative_area_level_2 short_name (parfois "76", "974"...)
 *
 * Cf. https://developers.google.com/maps/documentation/javascript/geocoding
 */
export function extractDepartementFromComponents(
  components: AddressComponent[] | null | undefined
): string | null {
  if (!components || components.length === 0) return null;
  const byType = (t: string) => components.find((c) => c.types.includes(t));

  const postal = byType("postal_code");
  if (postal?.long_name && /^\d{5}$/.test(postal.long_name)) {
    const cp = postal.long_name;
    if (cp.startsWith("97") || cp.startsWith("98")) return cp.slice(0, 3);
    if (cp.startsWith("20")) {
      const n = parseInt(cp, 10);
      return n >= 20200 ? "2B" : "2A";
    }
    return cp.slice(0, 2);
  }

  const adminLvl2 = byType("administrative_area_level_2");
  if (adminLvl2?.short_name) {
    const s = adminLvl2.short_name.trim();
    if (/^(2A|2B)$/i.test(s)) return s.toUpperCase();
    if (/^\d{2,3}$/.test(s)) return s;
  }

  return null;
}

/** Extrait la ville (locality, postal_town, ou administrative_area_level_2 long_name en fallback). */
export function extractVilleFromComponents(
  components: AddressComponent[] | null | undefined
): string | null {
  if (!components || components.length === 0) return null;
  const byType = (t: string) => components.find((c) => c.types.includes(t));
  return (
    byType("locality")?.long_name ||
    byType("postal_town")?.long_name ||
    byType("administrative_area_level_2")?.long_name ||
    null
  );
}

type RefsInput = {
  ref: React.RefObject<HTMLInputElement | null>;
  onSelect: (place: PlaceSelection) => void;
};

/**
 * Attache l'Autocomplete sur chaque input fourni. A appeler dans un useEffect
 * du composant consommateur (les refs ne doivent pas changer entre rendus).
 *
 * Exemple :
 *   const lieuDepartRef = useRef<HTMLInputElement>(null);
 *   usePlacesAutocomplete([
 *     { ref: lieuDepartRef, onSelect: (p) => { setLieuDepart(p.formattedAddress); setDepart(p); } },
 *   ]);
 */
export function usePlacesAutocomplete(inputs: RefsInput[]) {
  const autocompletesRef = useRef<GooglePlacesAutocomplete[]>([]);

  useEffect(() => {
    if (!GOOGLE_MAPS_API_KEY) return;
    let cancelled = false;

    const attach = () => {
      if (cancelled || !window.google?.maps?.places) return;
      const opts = {
        componentRestrictions: { country: "fr" },
        fields: ["formatted_address", "name", "address_components", "geometry"],
        // pas de "types" pour laisser tout passer : adresse, etablissement, ville
      };
      for (const { ref, onSelect } of inputs) {
        const el = ref.current;
        if (!el) continue;
        // Eviter double-attach : Google ajoute l'attribut data-attached
        if (el.dataset.placesAttached === "1") continue;
        const ac = new window.google.maps.places.Autocomplete(el, opts);
        el.dataset.placesAttached = "1";
        ac.addListener("place_changed", () => {
          const place = ac.getPlace();
          const formatted =
            place.formatted_address || place.name || el.value || "";
          const components = place.address_components || [];
          const loc = place.geometry?.location;
          const lat = loc && typeof loc.lat === "function" ? loc.lat() : null;
          const lng = loc && typeof loc.lng === "function" ? loc.lng() : null;
          onSelect({
            formattedAddress: formatted,
            components,
            lat,
            lng,
          });
        });
        autocompletesRef.current.push(ac);
      }
    };

    if (window.google?.maps?.places) {
      const raf = requestAnimationFrame(attach);
      return () => {
        cancelled = true;
        cancelAnimationFrame(raf);
      };
    }

    window.initGooglePlaces = attach;
    const scriptId = "google-maps-places-script";
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places&callback=initGooglePlaces`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }

    return () => {
      cancelled = true;
      if (window.google?.maps?.event) {
        for (const ac of autocompletesRef.current) {
          try {
            window.google.maps.event.clearInstanceListeners(ac);
          } catch {
            // noop
          }
        }
      }
      autocompletesRef.current = [];
      // Ne pas supprimer initGooglePlaces : d'autres composants montes peuvent en avoir besoin
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
