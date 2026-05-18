/**
 * Phase 6 : architecture en sources pluggables pour l'ingestion automatique
 * de la veille reglementaire.
 *
 * V1 : DILA JORF (RSS public, pas d'auth).
 * V2 : Legifrance PISTE (souscription en attente, stub pour l'instant).
 */

export type SourceKey = "dila_jorf" | "legifrance_piste" | "legifrss";

export interface RawCandidate {
  source_url: string;
  source_identifier?: string;
  title: string;
  summary?: string;
  publication_date?: string; // YYYY-MM-DD
  raw_content: Record<string, unknown>;
}

export interface IngestionSource {
  key: SourceKey;
  fetch(): Promise<RawCandidate[]>;
}
