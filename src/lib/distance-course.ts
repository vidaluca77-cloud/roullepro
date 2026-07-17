/**
 * Calcul de la distance d'une course entre deux points geolocalises.
 *
 * v1 : Haversine (distance a vol d'oiseau) x 1,3 (facteur routier moyen), ce qui
 * approche la distance reelle par la route pour une estimation CPAM indicative.
 *
 * L'interface est pensee pour brancher plus tard un fournisseur de distance
 * routiere reelle (Google Distance Matrix, OSRM...) sans changer les appelants :
 * il suffira de remplacer l'implementation de calculerDistanceCourse.
 *
 * Zero dependance : importable cote front comme cote serveur.
 */

export type PointGeo = {
  lat: number;
  lng: number;
};

export type DistanceCourse = {
  /** Distance routiere estimee, en km, arrondie a 0,1 km. */
  distanceKm: number;
};

/** Facteur de correction Haversine -> route (empirique). */
export const FACTEUR_ROUTIER = 1.3;

const RAYON_TERRE_KM = 6371;

function versRadians(deg: number): number {
  return (deg * Math.PI) / 180;
}

/** Distance orthodromique (a vol d'oiseau) en km entre deux points. */
export function distanceHaversineKm(a: PointGeo, b: PointGeo): number {
  const dLat = versRadians(b.lat - a.lat);
  const dLng = versRadians(b.lng - a.lng);
  const lat1 = versRadians(a.lat);
  const lat2 = versRadians(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * RAYON_TERRE_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

function estPointValide(p: PointGeo | null | undefined): p is PointGeo {
  return (
    !!p &&
    Number.isFinite(p.lat) &&
    Number.isFinite(p.lng) &&
    Math.abs(p.lat) <= 90 &&
    Math.abs(p.lng) <= 180
  );
}

/**
 * Distance de la course entre depart et arrivee. Renvoie null si l'un des deux
 * points n'est pas geolocalisable (on ne veut pas d'estimation approximative
 * ni de 0 km trompeur).
 */
export function calculerDistanceCourse(
  depart: PointGeo | null | undefined,
  arrivee: PointGeo | null | undefined
): DistanceCourse | null {
  if (!estPointValide(depart) || !estPointValide(arrivee)) return null;
  const brute = distanceHaversineKm(depart, arrivee) * FACTEUR_ROUTIER;
  const distanceKm = Math.round(brute * 10) / 10;
  return { distanceKm };
}
