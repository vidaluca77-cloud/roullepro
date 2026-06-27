-- PR #29 — Chantier 3 : dispatch unifie depuis demandes_transport
-- Une seule source de verite (demandes_transport + demandes_transport_pros).
-- Un seul groupe_id_tcp partage entre fan-out RoullePro et TCP.
-- Le bridge sanitaire_messages devient un simple createur de demande_transport ;
-- le trigger sur callback_requests est retire (plus de fan-out).
--
-- Migration idempotente. NON appliquee ici : jouee cote Supabase par Lucas.

-- Placeholders affiches cote TCP tant que la course n'est pas acceptee
-- (les vraies coordonnees ne sont revelees qu'a l'acceptation, cf. chantier 2/7).
-- public.demandes_transport reste la seule detentrice des vraies valeurs.

-- 1. Fonction de dispatch ------------------------------------------------------

CREATE OR REPLACE FUNCTION public.dispatch_demande_transport()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, tcp AS $$
DECLARE
  v_categories text[];
  v_groupe uuid := gen_random_uuid();
  v_pros int := 0;
  v_tcp int := 0;
  v_cible_claimed boolean := false;
  v_fan_out_tcp boolean;
BEGIN
  -- Categories pros eligibles selon le type de transport demande.
  v_categories := CASE NEW.type_transport
    WHEN 'taxi' THEN ARRAY['taxi_conventionne']
    WHEN 'vsl' THEN ARRAY['vsl','taxi_conventionne']
    WHEN 'ambulance' THEN ARRAY['ambulance']
    ELSE ARRAY[]::text[]
  END;

  IF array_length(v_categories, 1) IS NULL THEN
    RETURN NEW;
  END IF;

  -- Fan-out TCP uniquement pour les taxis (les chauffeurs TCP sont des taxis).
  v_fan_out_tcp := (NEW.type_transport = 'taxi');

  -- Cas demande ciblee sur une fiche pro claimed : exclusivite, 1 seule ligne, pas de TCP.
  IF NEW.pro_id_cible IS NOT NULL THEN
    SELECT COALESCE(claimed, false) INTO v_cible_claimed
    FROM public.pros_sanitaire WHERE id = NEW.pro_id_cible;
  END IF;

  IF NEW.pro_id_cible IS NOT NULL AND v_cible_claimed THEN
    INSERT INTO public.demandes_transport_pros (demande_id, pro_id, statut)
    VALUES (NEW.id, NEW.pro_id_cible, 'proposee')
    ON CONFLICT (demande_id, pro_id) DO NOTHING;
    v_pros := 1;
    v_fan_out_tcp := false;  -- exclusivite commerciale du claim
  ELSE
    -- Fan-out departemental vers tous les pros claimed actifs de la categorie matchee.
    -- Un pro_id_cible non claimed n'a pas de back-office : il n'est pas insere ici.
    INSERT INTO public.demandes_transport_pros (demande_id, pro_id, statut)
    SELECT NEW.id, p.id, 'proposee'
    FROM public.pros_sanitaire p
    WHERE p.claimed = true
      AND COALESCE(p.actif, true) = true
      AND COALESCE(p.suspendu, false) = false
      AND p.categorie = ANY (v_categories)
      AND p.departement = NEW.departement_cible
    ON CONFLICT (demande_id, pro_id) DO NOTHING;
    GET DIAGNOSTICS v_pros = ROW_COUNT;
  END IF;

  -- Fan-out TCP : chauffeurs CPAM du departement cible. Coordonnees masquees.
  IF v_fan_out_tcp AND NEW.departement_cible IS NOT NULL THEN
    INSERT INTO tcp.reservations (
      chauffeur_id, nom_passager, telephone_passager, email_passager,
      adresse_depart, adresse_arrivee, date_souhaitee, nb_passagers,
      message, statut, source, groupe_id, demande_transport_id
    )
    SELECT
      c.id, 'Demande en attente', 'A reveler', NULL,
      COALESCE(NEW.lieu_depart, 'A preciser'),
      COALESCE(NEW.lieu_arrivee, 'A preciser'),
      COALESCE(NEW.date_souhaitee, now() + INTERVAL '2 hours'), 1,
      'Demande RoullePro ' || COALESCE('(taux ' || NEW.taux_prise_en_charge || '%)', '')
        || CASE WHEN NEW.bon_transport_medical THEN ' [bon de transport: oui]' ELSE ' [bon de transport: manquant]' END,
      'en_attente', 'roulepro', v_groupe, NEW.id
    FROM tcp.chauffeurs c
    WHERE c.departement = NEW.departement_cible
      AND c.is_conventionne_cpam = true
      AND c.page_publique_active = true;
    GET DIAGNOSTICS v_tcp = ROW_COUNT;
  END IF;

  UPDATE public.demandes_transport
  SET pros_notifies = v_pros,
      tcp_notifies = v_tcp,
      groupe_id_tcp = CASE WHEN v_tcp > 0 THEN v_groupe ELSE groupe_id_tcp END
  WHERE id = NEW.id;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_dispatch_demande_transport ON public.demandes_transport;
CREATE TRIGGER trg_dispatch_demande_transport
  AFTER INSERT ON public.demandes_transport
  FOR EACH ROW EXECUTE FUNCTION public.dispatch_demande_transport();

-- 2. Bridge sanitaire_messages -> demandes_transport --------------------------
-- Un message envoye via le formulaire fiche pro cree desormais une
-- demandes_transport mere ; le dispatch ci-dessus fait le fan-out.
-- Plus aucun INSERT direct dans tcp.reservations ici (source unique).

CREATE OR REPLACE FUNCTION public.bridge_roulepro_to_tcp()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, tcp AS $$
DECLARE
  v_pro RECORD;
  v_type text;
BEGIN
  SELECT departement, ville, claimed, raison_sociale, nom_commercial, categorie
  INTO v_pro
  FROM public.pros_sanitaire
  WHERE id = NEW.pro_id;

  -- Categorie hors transport : aucune demande creee.
  v_type := CASE v_pro.categorie
    WHEN 'taxi_conventionne' THEN 'taxi'
    WHEN 'vsl' THEN 'vsl'
    WHEN 'ambulance' THEN 'ambulance'
    ELSE NULL
  END;
  IF v_type IS NULL THEN
    RETURN NEW;
  END IF;

  INSERT INTO public.demandes_transport (
    type_transport, nom, telephone, email,
    precisions, departement_cible, ville_cible,
    pro_id_cible, source_page, source_form, statut
  ) VALUES (
    v_type,
    NEW.sender_name,
    COALESCE(NEW.sender_phone, ''),
    NEW.sender_email,
    NEW.content,
    v_pro.departement,
    v_pro.ville,
    NEW.pro_id,
    'fiche-pro',
    'fiche_pro',
    'envoyee'
  );

  RETURN NEW;
END;
$$;

-- 3. Retrait du fan-out callback_requests -------------------------------------
-- callback ne declenche plus aucun fan-out vers TCP/RoullePro.
DROP TRIGGER IF EXISTS trg_bridge_callback_requests ON public.callback_requests;
DROP TRIGGER IF EXISTS bridge_callback_requests ON public.callback_requests;
DROP TRIGGER IF EXISTS trg_bridge_roulepro_callback ON public.callback_requests;
