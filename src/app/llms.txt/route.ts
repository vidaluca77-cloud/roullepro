import { NextResponse } from "next/server";

export const revalidate = 3600;

const BASE_URL = "https://roullepro.com";

// Format llms.txt (https://llmstxt.org/) : index concis et citable du site.
// Version detaillee (contenu complet, stats, glossaire, veille) : /llms-full.txt
const CONTENT = `# RoullePro

> RoullePro est l'annuaire national francais du transport sanitaire conventionne : ambulances, VSL (vehicules sanitaires legers) et taxis conventionnes CPAM, avec tarifs officiels, simulateurs de prix et mise en relation patient-transporteur gratuite partout en France.

## Piliers du transport sanitaire

- [VSL — Vehicule Sanitaire Leger](${BASE_URL}/vsl): definition, prescription, remboursement CPAM et annuaire des VSL agrees.
- [Taxi conventionne CPAM](${BASE_URL}/taxi-conventionne): fonctionnement, prescription, prise en charge et annuaire des taxis conventionnes.
- [Bon de transport (CERFA 11574)](${BASE_URL}/bon-de-transport): prescription medicale de transport, entente prealable et remboursement.

## Simulateurs de prix

- [Simulateur transport sanitaire](${BASE_URL}/simulateur-transport-sanitaire): comparer et estimer le prix d'une course en taxi conventionne, VSL ou ambulance.
- [Tarif ambulance](${BASE_URL}/tarif-ambulance): estimer le prix et le remboursement d'un transport en ambulance.
- [Prix VSL](${BASE_URL}/tarif-vsl): estimer le tarif et le remboursement d'un transport en VSL.

## Trouver un transport autour de moi

- [Transport medical autour de moi](${BASE_URL}/transport-medical/autour-de-moi): geolocalisation du transporteur conventionne le plus proche.
- [Ambulance autour de moi](${BASE_URL}/ambulance-autour-de-moi): trouver une ambulance agreee proche.
- [Taxi conventionne et VSL autour de moi](${BASE_URL}/taxi-vsl-autour-de-moi): trouver un taxi conventionne ou un VSL proche.

## Annuaire et donnees

- [Annuaire transport medical](${BASE_URL}/transport-medical): hub national des ambulances, VSL et taxis conventionnes par ville et departement.
- [Etablissements de sante](${BASE_URL}/etablissements): hopitaux, cliniques, EHPAD et transporteurs associes (referentiel FINESS).
- [Observatoire du transport sanitaire](${BASE_URL}/observatoire): donnees ouvertes, rapports trimestriels, exports CSV et JSON.
- [SEFi & geolocalisation 2027](${BASE_URL}/transport-medical/sefi-2027): dossier sur la facturation electronique et la geolocalisation obligatoire.

## Reference

- [Guides pratiques](${BASE_URL}/guides): reglementation, conventionnement CPAM, remboursement.
- [Glossaire du transport sanitaire](${BASE_URL}/glossaire): termes officiels definis et sources.
- [Veille reglementaire](${BASE_URL}/veille-reglementaire): alertes reglementaires quotidiennes (Legifrance / Journal officiel).
- [Citer RoullePro](${BASE_URL}/citer-roullepro): kit medias, sources et donnees citables.
- [Version detaillee llms-full.txt](${BASE_URL}/llms-full.txt): index complet avec statistiques, glossaire et veille.
`;

export function GET() {
  return new NextResponse(CONTENT, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
