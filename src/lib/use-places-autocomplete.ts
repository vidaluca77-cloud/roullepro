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
import { codePostalToDepartement, normaliserDepartement } from "@/lib/departement";

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
  // Champs derives pour transmission directe a l'API (departement, ville, CP).
  departement: string | null;
  ville: string | null;
  codePostal: string | null;
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

/** Delai max d'attente du script Google avant bascule sur le fallback BAN (ms). */
const GOOGLE_LOAD_TIMEOUT_MS = 3000;

/** Id unique du <script> Google Maps injecte dans le <head>. */
const GOOGLE_SCRIPT_ID = "google-maps-places-script";

/**
 * Loader singleton du script Google Maps + libraries=places, PARTAGE au niveau
 * module. C'est le coeur du fix P0 : auparavant chaque instance du hook faisait
 * `window.initGooglePlaces = () => attach()`, si bien que la derniere instance
 * montee ecrasait le callback des precedentes. Comme deux formulaires sont
 * montes simultanement (DemandeTransportForm + FloatingReserveTaxi global via
 * layout.tsx), seul le callback du dernier survivait — celui du widget flottant,
 * dont les inputs n'existent pas tant que la modale est fermee — et l'autocomplete
 * ne s'attachait jamais aux formulaires visibles.
 *
 * Ici, le script est injecte UNE seule fois, le callback global est defini UNE
 * seule fois, et une promesse partagee est renvoyee a tous les consommateurs :
 *  - `true`  : `google.maps.places` est disponible -> chaque instance appelle attach()
 *  - `false` : cle absente, erreur de chargement (CSP/reseau) ou timeout
 *              -> chaque instance bascule sur le fallback BAN
 */
let googleLoadPromise: Promise<boolean> | null = null;

export function loadGoogleMaps(): Promise<boolean> {
  if (typeof window === "undefined") return Promise.resolve(false);
  if (window.google?.maps?.places) return Promise.resolve(true);
  if (!GOOGLE_MAPS_API_KEY) return Promise.resolve(false);
  if (googleLoadPromise) return googleLoadPromise;

  googleLoadPromise = new Promise<boolean>((resolve) => {
    let settled = false;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    const finish = (ok: boolean) => {
      if (settled) return;
      settled = true;
      if (timeoutId) clearTimeout(timeoutId);
      resolve(ok);
    };

    // Callback global defini UNE seule fois (plus d'ecrasement entre instances).
    window.initGooglePlaces = () => finish(true);

    const existing = document.getElementById(GOOGLE_SCRIPT_ID);
    if (!existing) {
      const script = document.createElement("script");
      script.id = GOOGLE_SCRIPT_ID;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places&callback=initGooglePlaces`;
      script.async = true;
      script.defer = true;
      // Erreur de chargement (CSP, reseau, cle invalide) -> fallback BAN.
      script.addEventListener("error", () => finish(false));
      document.head.appendChild(script);
    } else if (window.google?.maps?.places) {
      // Script deja present et Google deja pret (ex. navigation client).
      finish(true);
    }

    // Filet de securite : si le script ne se charge pas dans le delai imparti
    // (ex. bloque par la CSP), on bascule sur le fallback. Si le script finit
    // par charger apres coup, le garde `settled` conserve l'etat fallback : les
    // consommateurs restent sur BAN, ce qui est acceptable.
    timeoutId = setTimeout(
      () => finish(!!window.google?.maps?.places),
      GOOGLE_LOAD_TIMEOUT_MS
    );
  });

  return googleLoadPromise;
}

/**
 * Structure minimale d'une feature renvoyee par l'API Adresse nationale (BAN).
 * Doc : https://adresse.data.gouv.fr/api-doc/adresse
 */
type BanFeature = {
  properties: {
    label: string;
    city?: string;
    postcode?: string;
    context?: string;
  };
  geometry: { coordinates: [number, number] }; // [lng, lat]
};

/**
 * Fallback resilient : autocomplete d'adresse via l'API Adresse nationale
 * (api-adresse.data.gouv.fr, gratuite, sans cle). Active uniquement si le script
 * Google Places ne se charge pas (cle absente, timeout, erreur reseau/CSP).
 *
 * Cree un menu deroulant vanilla sous chaque input et alimente le MEME
 * `onSelect(PlaceSelection)` que Google, afin que le calcul de distance et le
 * dispatch departemental cote consommateur continuent de fonctionner a
 * l'identique. Aucune difference visuelle notable pour l'utilisateur.
 *
 * Renvoie une fonction de nettoyage (listeners + noeuds DOM).
 */
function attachBanFallback(inputs: RefsInput[]): () => void {
  const cleanups: Array<() => void> = [];

  for (const { ref, onSelect } of inputs) {
    const el = ref.current;
    if (!el || el.dataset.banAttached === "1") continue;
    el.dataset.banAttached = "1";
    el.setAttribute("autocomplete", "off");

    const dropdown = document.createElement("ul");
    dropdown.setAttribute("role", "listbox");
    dropdown.style.cssText =
      "position:fixed;z-index:9999;margin:0;padding:4px;list-style:none;background:#fff;border:1px solid #e5e7eb;border-radius:12px;box-shadow:0 8px 24px rgba(0,0,0,.12);max-height:260px;overflow:auto;display:none;font-size:14px;color:#111827;";
    document.body.appendChild(dropdown);

    let features: BanFeature[] = [];
    let debounceId: ReturnType<typeof setTimeout> | undefined;
    let controller: AbortController | null = null;

    const positionner = () => {
      const r = el.getBoundingClientRect();
      dropdown.style.left = `${r.left}px`;
      dropdown.style.top = `${r.bottom + 2}px`;
      dropdown.style.width = `${r.width}px`;
    };

    const masquer = () => {
      dropdown.style.display = "none";
    };

    const choisir = (f: BanFeature) => {
      const [lng, lat] = f.geometry.coordinates;
      const cp = f.properties.postcode?.trim() || null;
      // Departement : d'abord derive du code postal (helper partage), sinon on
      // tente le premier segment du contexte BAN ("14, Calvados, Normandie").
      const departement =
        codePostalToDepartement(cp) ||
        normaliserDepartement(f.properties.context?.split(",")[0]);
      el.value = f.properties.label;
      onSelect({
        formattedAddress: f.properties.label,
        components: [],
        lat: typeof lat === "number" ? lat : null,
        lng: typeof lng === "number" ? lng : null,
        departement,
        ville: f.properties.city || null,
        codePostal: cp && /^\d{5}$/.test(cp) ? cp : null,
      });
      masquer();
    };

    const rendre = () => {
      dropdown.innerHTML = "";
      if (features.length === 0) {
        masquer();
        return;
      }
      for (const f of features) {
        const li = document.createElement("li");
        li.textContent = f.properties.label;
        li.setAttribute("role", "option");
        li.style.cssText = "padding:8px 10px;cursor:pointer;border-radius:8px;";
        // mousedown (avant blur) pour ne pas fermer le menu avant la selection.
        li.addEventListener("mousedown", (ev) => {
          ev.preventDefault();
          choisir(f);
        });
        li.addEventListener("mouseenter", () => {
          li.style.background = "#f3f4f6";
        });
        li.addEventListener("mouseleave", () => {
          li.style.background = "transparent";
        });
        dropdown.appendChild(li);
      }
      positionner();
      dropdown.style.display = "block";
    };

    const onInput = () => {
      const q = el.value.trim();
      if (debounceId) clearTimeout(debounceId);
      if (q.length < 3) {
        features = [];
        masquer();
        return;
      }
      debounceId = setTimeout(async () => {
        controller?.abort();
        controller = new AbortController();
        try {
          const res = await fetch(
            `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(q)}&limit=5&autocomplete=1`,
            { signal: controller.signal }
          );
          if (!res.ok) return;
          const data = await res.json();
          features = Array.isArray(data?.features) ? (data.features as BanFeature[]) : [];
          rendre();
        } catch {
          // Reseau KO ou requete annulee : on ignore silencieusement.
        }
      }, 250);
    };

    const onBlur = () => setTimeout(masquer, 150);

    el.addEventListener("input", onInput);
    el.addEventListener("blur", onBlur);
    window.addEventListener("scroll", positionner, true);
    window.addEventListener("resize", positionner);

    cleanups.push(() => {
      if (debounceId) clearTimeout(debounceId);
      controller?.abort();
      el.removeEventListener("input", onInput);
      el.removeEventListener("blur", onBlur);
      window.removeEventListener("scroll", positionner, true);
      window.removeEventListener("resize", positionner);
      dropdown.remove();
      delete el.dataset.banAttached;
    });
  }

  return () => cleanups.forEach((fn) => fn());
}

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
  const depuisCp = codePostalToDepartement(postal?.long_name);
  if (depuisCp) return depuisCp;

  const adminLvl2 = byType("administrative_area_level_2");
  return normaliserDepartement(adminLvl2?.short_name);
}

/** Extrait le code postal a 5 chiffres des address_components, sinon null. */
export function extractCodePostalFromComponents(
  components: AddressComponent[] | null | undefined
): string | null {
  if (!components || components.length === 0) return null;
  const postal = components.find((c) => c.types.includes("postal_code"));
  const cp = postal?.long_name?.trim();
  return cp && /^\d{5}$/.test(cp) ? cp : null;
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
 *
 * Option `actif` (defaut `true`) : quand les inputs n'existent qu'a certains
 * moments (ex. modale du widget flottant montee a l'ouverture), passer l'etat
 * d'ouverture. L'effet se rejoue lorsque `actif` passe a `true` et attache alors
 * l'autocomplete sur les inputs fraichement montes (le loader Google, deja
 * resolu, renvoie immediatement).
 */
export function usePlacesAutocomplete(
  inputs: RefsInput[],
  options?: { actif?: boolean }
) {
  const actif = options?.actif ?? true;
  const autocompletesRef = useRef<GooglePlacesAutocomplete[]>([]);
  const cleanupFallbackRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!actif) return;

    let cancelled = false;
    let fallbackActive = false;

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
            departement: extractDepartementFromComponents(components),
            ville: extractVilleFromComponents(components),
            codePostal: extractCodePostalFromComponents(components),
          });
        });
        autocompletesRef.current.push(ac);
      }
    };

    // Bascule vers le fallback API Adresse nationale (une seule fois).
    const activerFallback = () => {
      if (cancelled || fallbackActive || window.google?.maps?.places) return;
      fallbackActive = true;
      cleanupFallbackRef.current = attachBanFallback(inputs);
    };

    // Loader singleton partage : plus aucune ecriture de window.initGooglePlaces
    // par instance, donc plus d'ecrasement entre formulaires montes simultanement.
    loadGoogleMaps().then((ok) => {
      if (cancelled) return;
      if (ok) attach();
      else activerFallback();
    });

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
      cleanupFallbackRef.current?.();
      cleanupFallbackRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actif]);
}
