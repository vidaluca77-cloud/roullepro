/**
 * Types et mappings pour les nouveaux formulaires unifiés (taxi/VSL/ambulance).
 *
 * IMPORTANT : la valeur stockée en BDD pour les taxis est `taxi_conventionne`
 * (avec underscore, sans accent), confirmée sur 17 026 fiches en prod.
 * Ce module est l'unique source de vérité pour ce mapping — ne jamais
 * référencer ces strings en clair dans les composants ou routes.
 */

export type TypeTransport = 'taxi' | 'vsl' | 'ambulance';

export type CategoriePro = 'taxi_conventionne' | 'vsl' | 'ambulance';

export const TYPE_TRANSPORT_TO_CATEGORIE: Record<TypeTransport, CategoriePro> = {
  taxi: 'taxi_conventionne',
  vsl: 'vsl',
  ambulance: 'ambulance',
} as const;

export const CATEGORIE_TO_TYPE_TRANSPORT: Record<CategoriePro, TypeTransport> = {
  taxi_conventionne: 'taxi',
  vsl: 'vsl',
  ambulance: 'ambulance',
} as const;

export const LIBELLE_TYPE_TRANSPORT: Record<TypeTransport, string> = {
  taxi: 'Taxi conventionné',
  vsl: 'VSL',
  ambulance: 'Ambulance',
} as const;

export const TYPES_TRANSPORT_DISPONIBLES: TypeTransport[] = ['taxi', 'vsl', 'ambulance'];

/** Source-page du formulaire pour le tracking GA4 et analytics BDD. */
export type SourcePage = 'home' | 'etablissement' | 'fiche_etablissement' | 'transport-vers' | 'fiche-pro' | 'preview_test';
