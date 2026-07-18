-- Disponibilite des pros : un pro peut se declarer indisponible (conges, semaine
-- off) pour ne plus recevoir de nouvelles demandes de course pendant la periode.
-- Objectif produit : eviter les demandes qui restent sans reponse.
--
-- Migration idempotente. NON appliquee ici : jouee cote Supabase par Lucas
-- (Netlify n'applique pas les migrations).

-- 1. Colonnes de periode d'indisponibilite -----------------------------------

ALTER TABLE public.pros_sanitaire
  ADD COLUMN IF NOT EXISTS indispo_debut timestamptz NULL,
  ADD COLUMN IF NOT EXISTS indispo_fin   timestamptz NULL;

-- 2. Dispatch : exclure les pros indisponibles a la date de la course ---------
-- Reprise a l'identique de la definition de 20260627140003_dispatch_demande_transport.sql,
-- avec pour SEUL ajout la condition d'indisponibilite dans le fan-out
-- departemental (voir le bloc marque "-- INDISPONIBILITE"). Aucun autre
-- changement de logique. On ne filtre JAMAIS selon le plan/abonnement : les pros
-- gratuits continuent de tout recevoir.
--
-- Regle d'exclusion (miroir de src/lib/disponibilite.ts estIndisponible) :
-- un pro est exclu si au moins une borne est definie ET que
-- COALESCE(date_souhaitee, now()) tombe dans [indispo_debut, indispo_fin]
-- (bornes incluses, null = pas de borne de ce cote).

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
      -- INDISPONIBILITE : exclure les pros dont la periode couvre la date de la course.
      AND NOT (
        (p.indispo_debut IS NOT NULL OR p.indispo_fin IS NOT NULL)
        AND COALESCE(NEW.date_souhaitee, now()) >= COALESCE(p.indispo_debut, '-infinity'::timestamptz)
        AND COALESCE(NEW.date_souhaitee, now()) <= COALESCE(p.indispo_fin, 'infinity'::timestamptz)
      )
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
