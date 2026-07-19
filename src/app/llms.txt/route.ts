import { NextResponse } from "next/server";

export const revalidate = 3600;

const BASE_URL = "https://roullepro.com";

// Format llms.txt (https://llmstxt.org/) : index concis et citable du site.
// Version détaillée (contenu complet, stats, glossaire, veille) : /llms-full.txt
const CONTENT = `# RoullePro

> RoullePro est l'annuaire national français du transport sanitaire conventionné : ambulances, VSL (véhicules sanitaires légers) et taxis conventionnés CPAM, avec tarifs officiels, simulateurs de prix et mise en relation patient-transporteur gratuite partout en France.

## Piliers du transport sanitaire

- [VSL — Véhicule Sanitaire Léger](${BASE_URL}/vsl): définition, prescription, remboursement CPAM et annuaire des VSL agréés.
- [Taxi conventionné CPAM](${BASE_URL}/taxi-conventionne): fonctionnement, prescription, prise en charge et annuaire des taxis conventionnés.
- [Bon de transport (CERFA 11574)](${BASE_URL}/bon-de-transport): prescription médicale de transport, entente préalable et remboursement.

## Simulateurs de prix

- [Simulateur transport sanitaire](${BASE_URL}/simulateur-transport-sanitaire): comparer et estimer le prix d'une course en taxi conventionné, VSL ou ambulance.
- [Tarif ambulance](${BASE_URL}/tarif-ambulance): estimer le prix et le remboursement d'un transport en ambulance.
- [Prix VSL](${BASE_URL}/tarif-vsl): estimer le tarif et le remboursement d'un transport en VSL.

## Trouver un transport autour de moi

- [Transport médical autour de moi](${BASE_URL}/transport-medical/autour-de-moi): géolocalisation du transporteur conventionné le plus proche.
- [Ambulance autour de moi](${BASE_URL}/ambulance-autour-de-moi): trouver une ambulance agréée proche.
- [Taxi conventionné et VSL autour de moi](${BASE_URL}/taxi-vsl-autour-de-moi): trouver un taxi conventionné ou un VSL proche.

## Annuaire et données

- [Annuaire transport médical](${BASE_URL}/transport-medical): hub national des ambulances, VSL et taxis conventionnés par ville et département.
- [Établissements de santé](${BASE_URL}/etablissements): hôpitaux, cliniques, EHPAD et transporteurs associés (référentiel FINESS).
- [Observatoire du transport sanitaire](${BASE_URL}/observatoire): données ouvertes, rapports trimestriels, exports CSV et JSON.
- [SEFi & géolocalisation 2027](${BASE_URL}/transport-medical/sefi-2027): dossier sur la facturation électronique et la géolocalisation obligatoire.

## Référence

- [Guides pratiques](${BASE_URL}/guides): réglementation, conventionnement CPAM, remboursement.
- [Glossaire du transport sanitaire](${BASE_URL}/glossaire): termes officiels définis et sources.
- [Veille réglementaire](${BASE_URL}/veille-reglementaire): alertes réglementaires quotidiennes (Légifrance / Journal officiel).
- [Citer RoullePro](${BASE_URL}/citer-roullepro): kit médias, sources et données citables.
- [Version détaillée llms-full.txt](${BASE_URL}/llms-full.txt): index complet avec statistiques, glossaire et veille.
`;

export function GET() {
  return new NextResponse(CONTENT, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
