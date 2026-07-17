-- Refonte formulaires + estimateur CPAM — Chantier P0 : fin du pont degrade.
--
-- Avant : un message envoye via le formulaire fiche pro (sanitaire_messages)
-- declenchait bridge_roulepro_to_tcp() qui creait une demandes_transport
-- appauvrie (sans date, sans lieux, sans geo — cf. 20260627140003 lignes 133-149).
--
-- Desormais ContactProForm poste directement sur /api/demande-transport avec
-- pro_id_cible : la demande est creee complete (date, trajet, coordonnees,
-- distance, estimation) et le dispatch se fait via dispatch_demande_transport().
-- Laisser le bridge creer une seconde demande produirait un doublon degrade.
--
-- On neutralise donc le bridge : il ne cree plus aucune demandes_transport.
-- Le trigger reste attache (RETURN NEW) pour ne pas casser d'eventuelles
-- dependances, mais il n'a plus d'effet.
--
-- Migration idempotente (CREATE OR REPLACE). NON appliquee ici :
-- elle sera jouee cote Supabase.

CREATE OR REPLACE FUNCTION public.bridge_roulepro_to_tcp()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, tcp AS $$
BEGIN
  -- Neutralise : les demandes de transport passent maintenant exclusivement par
  -- /api/demande-transport (source unique). Voir dispatch_demande_transport().
  RETURN NEW;
END;
$$;
