-- Chantier B du cahier des charges FINESS : demandes de transport ouvertes
-- (home, pages etablissement, pages "transport vers").
--
-- Contenu :
--   1. Table demandes_transport (audit + analytics) + index + RLS sans policy publique
--   2. Fonction pros_proches_etablissement (matching geo Haversine, sans PostGIS)
--   3. Modification du bridge bridge_roulepro_to_tcp (exclusion VSL/ambulance)
--
-- Aucun write public : tout passe par le service_role (endpoint /api/demande-transport).
-- La migration n'est PAS appliquee ici : elle sera jouee cote Supabase.

-- 1. Table des demandes de transport ------------------------------------------

CREATE TABLE IF NOT EXISTS public.demandes_transport (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  type_transport text NOT NULL CHECK (type_transport IN ('taxi','vsl','ambulance')),
  -- Identite demandeur
  nom text NOT NULL,
  telephone text NOT NULL,
  email text,
  -- Demande
  date_souhaitee timestamptz,
  lieu_depart text,
  lieu_arrivee text,
  aller_retour boolean DEFAULT false,
  mobilite text,
  precisions text,
  -- Contexte
  source_page text,
  etablissement_id uuid REFERENCES public.etablissements_sante(id) ON DELETE SET NULL,
  pro_id_cible uuid REFERENCES public.pros_sanitaire(id) ON DELETE SET NULL,
  departement_cible text,
  ville_cible text,
  -- Tracking
  ip_hash text,
  user_agent text,
  pros_notifies int DEFAULT 0,
  tcp_notifies int DEFAULT 0,
  groupe_id_tcp uuid,
  statut text DEFAULT 'envoyee' CHECK (statut IN ('envoyee','traitee','sans_suite'))
);

CREATE INDEX IF NOT EXISTS idx_demandes_created ON public.demandes_transport (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_demandes_type ON public.demandes_transport (type_transport);
CREATE INDEX IF NOT EXISTS idx_demandes_dept ON public.demandes_transport (departement_cible);
CREATE INDEX IF NOT EXISTS idx_demandes_etab ON public.demandes_transport (etablissement_id) WHERE etablissement_id IS NOT NULL;

ALTER TABLE public.demandes_transport ENABLE ROW LEVEL SECURITY;
-- Aucune policy publique : lecture/ecriture via service_role uniquement.

-- 2. Fonction de matching geo (Haversine SQL pur, PostGIS absent) --------------

CREATE OR REPLACE FUNCTION public.pros_proches_etablissement(
  p_lat double precision,
  p_lng double precision,
  p_categorie text,
  p_rayon_km int DEFAULT 30,
  p_limit int DEFAULT 5
)
RETURNS TABLE (
  id uuid,
  raison_sociale text,
  nom_commercial text,
  slug text,
  ville text,
  email_public text,
  claimed boolean,
  plan text,
  distance_km double precision
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    p.id, p.raison_sociale, p.nom_commercial, p.slug, p.ville,
    p.email_public, p.claimed, p.plan,
    (
      6371 * acos(
        LEAST(1, GREATEST(-1,
          cos(radians(p_lat)) * cos(radians(p.latitude)) *
          cos(radians(p.longitude) - radians(p_lng)) +
          sin(radians(p_lat)) * sin(radians(p.latitude))
        ))
      )
    ) AS distance_km
  FROM public.pros_sanitaire p
  WHERE p.actif = true
    AND COALESCE(p.suspendu, false) = false
    AND p.latitude IS NOT NULL
    AND p.longitude IS NOT NULL
    AND p.categorie = p_categorie
    AND (
      6371 * acos(
        LEAST(1, GREATEST(-1,
          cos(radians(p_lat)) * cos(radians(p.latitude)) *
          cos(radians(p.longitude) - radians(p_lng)) +
          sin(radians(p_lat)) * sin(radians(p.latitude))
        ))
      )
    ) < p_rayon_km
  ORDER BY
    CASE p.plan
      WHEN 'pro_plus' THEN 1
      WHEN 'premium' THEN 2
      WHEN 'essential' THEN 3
      ELSE 4
    END,
    p.claimed DESC NULLS LAST,
    distance_km ASC
  LIMIT p_limit;
$$;

-- 3. Modification du bridge TCP -----------------------------------------------
-- On ajoute UNIQUEMENT le filtre categorie='taxi_conventionne' : VSL et ambulance
-- ne declenchent plus jamais le bridge. Le filtre claimed reste en place pour
-- preserver l'exclusivite commerciale des taxis claimed.

CREATE OR REPLACE FUNCTION public.bridge_roulepro_to_tcp()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_pro RECORD;
  v_chauffeur RECORD;
  v_nom_passager TEXT;
  v_telephone TEXT;
  v_email TEXT;
  v_message TEXT;
  v_source TEXT;
  v_groupe_id UUID;
BEGIN
  SELECT departement, ville, claimed, raison_sociale, nom_commercial, categorie
  INTO v_pro
  FROM public.pros_sanitaire
  WHERE id = NEW.pro_id;

  -- Filtre 1 (NOUVEAU) : uniquement les taxis. VSL et ambulance ne declenchent jamais le bridge.
  IF v_pro.categorie != 'taxi_conventionne' THEN
    RETURN NEW;
  END IF;

  -- Filtre 2 (CONSERVE) : si fiche claimed, on respecte l'exclusivite, pas de fan-out TCP.
  IF v_pro.claimed IS TRUE THEN
    RETURN NEW;
  END IF;

  IF TG_TABLE_NAME = 'sanitaire_messages' THEN
    v_nom_passager := NEW.sender_name;
    v_telephone    := COALESCE(NEW.sender_phone, '');
    v_email        := NEW.sender_email;
    v_message      := NEW.content;
    v_source       := 'roulepro';
  ELSIF TG_TABLE_NAME = 'callback_requests' THEN
    v_nom_passager := NEW.visitor_name;
    v_telephone    := NEW.visitor_phone;
    v_email        := NULL;
    v_message      := NEW.visitor_message;
    v_source       := 'roulepro';
  END IF;

  v_groupe_id := gen_random_uuid();

  FOR v_chauffeur IN
    SELECT id FROM tcp.chauffeurs
    WHERE departement = v_pro.departement
      AND is_conventionne_cpam = true
      AND page_publique_active = true
  LOOP
    INSERT INTO tcp.reservations (
      chauffeur_id, nom_passager, telephone_passager, email_passager,
      adresse_depart, adresse_arrivee, date_souhaitee, nb_passagers,
      message, statut, source, groupe_id
    ) VALUES (
      v_chauffeur.id, v_nom_passager, v_telephone, v_email,
      COALESCE(v_pro.ville, 'Non precise'), 'A preciser',
      NOW() + INTERVAL '2 hours', 1,
      COALESCE(v_message, '') || E'\n[Fiche RoullePro : ' || COALESCE(v_pro.nom_commercial, v_pro.raison_sociale, 'Inconnu') || ']',
      'en_attente', v_source, v_groupe_id
    );
  END LOOP;

  RETURN NEW;
END;
$$;
