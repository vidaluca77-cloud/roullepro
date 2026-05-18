/**
 * Source Legifrance PISTE (V2).
 *
 * TODO V2 : implementer le client OAuth2 PISTE + appel API Legifrance des que
 * la souscription DILA sera active (cf. ticket support en attente).
 *
 * En V1 : stub vide pour que l'architecture soit deja branchable.
 */

import type { IngestionSource, RawCandidate } from "./types";

export const legifrancePisteSource: IngestionSource = {
  key: "legifrance_piste",
  async fetch(): Promise<RawCandidate[]> {
    // TODO V2 : remplacer par un appel reel a l'API PISTE Legifrance
    // une fois la souscription DILA validee.
    return [];
  },
};
