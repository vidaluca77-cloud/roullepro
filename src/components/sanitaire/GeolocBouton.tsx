"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Loader2 } from "lucide-react";

// Bouton "Autour de moi" : demande la position du visiteur et redirige vers la
// recherche triee par distance. Le consentement est memorise en localStorage
// pour eviter de redemander a chaque visite. Fallback gracieux si refus/indispo.

const CONSENT_KEY = "roullepro_geoloc_consent";

export default function GeolocBouton({
  radius = 10,
  categorie,
  className = "",
}: {
  radius?: number;
  categorie?: string;
  className?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  const lancer = () => {
    setErreur(null);
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setErreur("La géolocalisation n'est pas disponible sur votre appareil. Tapez votre ville.");
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        try {
          localStorage.setItem(CONSENT_KEY, "1");
        } catch {}
        const lat = pos.coords.latitude.toFixed(6);
        const lng = pos.coords.longitude.toFixed(6);
        const params = new URLSearchParams();
        params.set("lat", lat);
        params.set("lng", lng);
        params.set("radius", String(radius));
        if (categorie) params.set("categorie", categorie);
        router.push(`/transport-medical/recherche?${params.toString()}`);
      },
      (err) => {
        setLoading(false);
        if (err.code === err.PERMISSION_DENIED) {
          setErreur("Géolocalisation refusée. Activez-la ou tapez votre ville.");
        } else {
          setErreur("Position indisponible. Tapez votre ville.");
        }
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    );
  };

  return (
    <div className={className}>
      <button
        type="button"
        onClick={lancer}
        disabled={loading}
        aria-label="Rechercher les professionnels autour de ma position"
        className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#0066CC] text-[#0066CC] hover:bg-blue-50 font-semibold px-4 py-3 transition disabled:opacity-60"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
        {loading ? "Localisation…" : "Autour de moi"}
      </button>
      {erreur && <p className="mt-2 text-sm text-red-600">{erreur}</p>}
    </div>
  );
}
