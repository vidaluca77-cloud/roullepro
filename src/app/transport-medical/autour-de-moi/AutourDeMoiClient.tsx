"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { MapPin, Phone, LocateFixed, Loader2, AlertCircle, Cross, Car, Users } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

type ProProche = {
  id: string;
  raison_sociale: string;
  nom_commercial: string | null;
  slug: string;
  ville: string;
  ville_slug: string;
  code_postal: string;
  categorie: string;
  telephone_public: string | null;
  latitude: number | null;
  longitude: number | null;
  ameli_conventionne: boolean | null;
  distance: number;
};

const CAT_LABEL: Record<string, string> = {
  ambulance: "Ambulance",
  vsl: "VSL",
  taxi_conventionne: "Taxi conventionné",
};

const CAT_ICON: Record<string, typeof Cross> = {
  ambulance: Cross,
  vsl: Car,
  taxi_conventionne: Users,
};

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function AutourDeMoiClient() {
  const [status, setStatus] = useState<"idle" | "locating" | "loading" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [pros, setPros] = useState<ProProche[]>([]);
  const [filtreCat, setFiltreCat] = useState<string>("all");

  const chercher = useCallback(async (lat: number, lng: number) => {
    setStatus("loading");
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      // Bounding box ~30 km (1 deg lat ~= 111 km, 1 deg lng ~= 73 km a 45 deg N)
      const RAYON_KM = 30;
      const dLat = RAYON_KM / 111;
      const dLng = RAYON_KM / 73;
      const { data, error } = await supabase
        .from("pros_sanitaire_public")
        .select(
          "id, raison_sociale, nom_commercial, slug, ville, ville_slug, code_postal, categorie, telephone_public, latitude, longitude, ameli_conventionne"
        )
        .eq("actif", true)
        .eq("suspendu", false)
        .not("latitude", "is", null)
        .gte("latitude", lat - dLat)
        .lte("latitude", lat + dLat)
        .gte("longitude", lng - dLng)
        .lte("longitude", lng + dLng)
        .limit(500);

      if (error) throw error;

      const withDist = ((data || []) as Omit<ProProche, "distance">[])
        .filter((p) => p.latitude != null && p.longitude != null)
        .map((p) => ({ ...p, distance: haversineKm(lat, lng, p.latitude!, p.longitude!) }))
        .filter((p) => p.distance <= RAYON_KM)
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 60);

      setPros(withDist);
      setStatus("done");
    } catch {
      setErrorMsg("Une erreur est survenue lors de la recherche. Réessayez dans un instant.");
      setStatus("error");
    }
  }, []);

  const demanderPosition = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setErrorMsg("La géolocalisation n'est pas disponible sur votre appareil.");
      setStatus("error");
      return;
    }
    setStatus("locating");
    navigator.geolocation.getCurrentPosition(
      (pos) => chercher(pos.coords.latitude, pos.coords.longitude),
      () => {
        setErrorMsg(
          "Géolocalisation refusée. Autorisez l'accès à votre position, ou recherchez directement par ville."
        );
        setStatus("error");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, [chercher]);

  const prosFiltres = filtreCat === "all" ? pros : pros.filter((p) => p.categorie === filtreCat);

  return (
    <div>
      {/* Bouton géolocalisation */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6 text-center">
        <button
          onClick={demanderPosition}
          disabled={status === "locating" || status === "loading"}
          className="inline-flex items-center gap-2 bg-[#0066CC] hover:bg-[#0055AA] disabled:opacity-60 text-white font-semibold px-6 py-3 rounded-xl transition"
        >
          {status === "locating" || status === "loading" ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <LocateFixed className="w-5 h-5" />
          )}
          {status === "locating"
            ? "Localisation en cours…"
            : status === "loading"
            ? "Recherche des professionnels…"
            : "Trouver les transports autour de moi"}
        </button>
        <p className="text-xs text-gray-500 mt-3">
          Votre position n'est jamais enregistrée : elle sert uniquement à calculer les professionnels
          les plus proches, en direct dans votre navigateur.
        </p>
      </div>

      {status === "error" && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800">
            {errorMsg}{" "}
            <Link href="/transport-medical/recherche" className="underline font-medium">
              Rechercher par ville
            </Link>
          </div>
        </div>
      )}

      {status === "done" && (
        <>
          {/* Filtres catégorie */}
          <div className="flex flex-wrap gap-2 mb-4">
            {[
              { key: "all", label: `Tous (${pros.length})` },
              { key: "ambulance", label: `Ambulances (${pros.filter((p) => p.categorie === "ambulance").length})` },
              { key: "vsl", label: `VSL (${pros.filter((p) => p.categorie === "vsl").length})` },
              {
                key: "taxi_conventionne",
                label: `Taxis conventionnés (${pros.filter((p) => p.categorie === "taxi_conventionne").length})`,
              },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setFiltreCat(f.key)}
                className={`px-3 py-1.5 rounded-full text-sm border transition ${
                  filtreCat === f.key
                    ? "bg-[#0066CC] text-white border-[#0066CC]"
                    : "bg-white text-gray-700 border-gray-200 hover:border-[#0066CC]"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {prosFiltres.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-2xl p-6 text-center text-gray-600">
              Aucun professionnel trouvé dans un rayon de 30 km.{" "}
              <Link href="/transport-medical/recherche" className="text-[#0066CC] underline">
                Élargir la recherche
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {prosFiltres.map((p) => {
                const Icon = CAT_ICON[p.categorie] || MapPin;
                const nom = p.nom_commercial || p.raison_sociale;
                return (
                  <div
                    key={p.id}
                    className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 flex items-start justify-between gap-4"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className="w-4 h-4 text-[#0066CC] flex-shrink-0" />
                        <Link
                          href={`/transport-medical/${p.ville_slug}/${p.categorie}/${p.slug}`}
                          className="font-semibold text-gray-900 hover:text-[#0066CC] truncate"
                        >
                          {nom}
                        </Link>
                      </div>
                      <div className="text-sm text-gray-600 flex items-center gap-2 flex-wrap">
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-gray-400" />
                          {p.ville} ({p.code_postal})
                        </span>
                        <span className="text-gray-400">·</span>
                        <span>{CAT_LABEL[p.categorie] || p.categorie}</span>
                        {p.ameli_conventionne && (
                          <span className="text-[11px] bg-green-50 text-green-700 px-2 py-0.5 rounded-full">
                            Conventionné CPAM
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">à {p.distance.toFixed(1)} km</div>
                    </div>
                    {p.telephone_public && (
                      <a
                        href={`tel:${p.telephone_public}`}
                        className="inline-flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-3 py-2 rounded-lg flex-shrink-0"
                      >
                        <Phone className="w-4 h-4" />
                        <span className="hidden sm:inline">Appeler</span>
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
