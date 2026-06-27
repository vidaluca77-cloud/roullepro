-- PR #29 — Chantier 2 : logique d'acceptation + sync bidirectionnelle TCP/RoullePro
-- Quand un pro accepte cote RoullePro, on ferme cote TCP, et inversement.
-- Garde-fou anti double-acceptation : UPDATE ... WHERE statut='envoyee' RETURNING.
--
-- Migration idempotente. NON appliquee ici : jouee cote Supabase par Lucas.

-- 1. Acceptation cote RoullePro -----------------------------------------------
-- Trigger AFTER UPDATE sur demandes_transport_pros : quand une ligne passe a
-- 'acceptee', on cascade sur la demande mere, les autres pros et TCP.

CREATE OR REPLACE FUNCTION public.on_demande_pro_acceptee()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, tcp AS $$
DECLARE
  v_updated int;
  v_groupe uuid;
BEGIN
  IF NEW.statut <> 'acceptee' OR OLD.statut = 'acceptee' THEN
    RETURN NEW;
  END IF;

  -- Verrou applicatif sur la demande pour serialiser les acceptations concurrentes.
  PERFORM pg_advisory_xact_lock(hashtext(NEW.demande_id::text));

  -- On ne marque la demande acceptee que si elle est encore ouverte.
  UPDATE public.demandes_transport
  SET statut = 'acceptee',
      accepte_par_pro_id = NEW.pro_id,
      accepte_at = now()
  WHERE id = NEW.demande_id
    AND statut <> 'acceptee'
  RETURNING groupe_id_tcp INTO v_groupe;

  GET DIAGNOSTICS v_updated = ROW_COUNT;
  IF v_updated = 0 THEN
    -- Deja acceptee par ailleurs : on retombe la ligne en autre_acceptee.
    UPDATE public.demandes_transport_pros
    SET statut = 'autre_acceptee'
    WHERE id = NEW.id;
    RETURN NEW;
  END IF;

  -- Ferme les autres propositions RoullePro de la meme demande.
  UPDATE public.demandes_transport_pros
  SET statut = 'autre_acceptee'
  WHERE demande_id = NEW.demande_id
    AND id <> NEW.id
    AND statut = 'proposee';

  -- Ferme les reservations TCP du meme groupe (un taxi TCP aurait pu accepter,
  -- mais ici c'est un pro RoullePro qui a pris la course).
  IF v_groupe IS NOT NULL THEN
    UPDATE tcp.reservations
    SET statut = 'annulee_autre_pro'
    WHERE groupe_id = v_groupe
      AND statut NOT IN ('annulee_autre_pro','annulee');
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_demande_pro_acceptee ON public.demandes_transport_pros;
CREATE TRIGGER trg_demande_pro_acceptee
  AFTER UPDATE OF statut ON public.demandes_transport_pros
  FOR EACH ROW EXECUTE FUNCTION public.on_demande_pro_acceptee();

-- 2. Acceptation cote TCP -----------------------------------------------------
-- Trigger AFTER UPDATE sur tcp.reservations : quand un chauffeur TCP confirme,
-- on ferme la demande RoullePro et les autres reservations du groupe, et on
-- revele les vraies coordonnees dans la reservation acceptee.

CREATE OR REPLACE FUNCTION tcp.on_reservation_acceptee()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, tcp AS $$
DECLARE
  v_demande RECORD;
  v_updated int;
BEGIN
  IF NEW.statut NOT IN ('acceptee','confirmee')
     OR OLD.statut IN ('acceptee','confirmee')
     OR NEW.demande_transport_id IS NULL THEN
    RETURN NEW;
  END IF;

  PERFORM pg_advisory_xact_lock(hashtext(NEW.demande_transport_id::text));

  UPDATE public.demandes_transport
  SET statut = 'acceptee',
      accepte_par_chauffeur_tcp_id = NEW.chauffeur_id,
      accepte_at = now()
  WHERE id = NEW.demande_transport_id
    AND statut <> 'acceptee'
  RETURNING nom, telephone, email, lieu_depart, lieu_arrivee, groupe_id_tcp
  INTO v_demande;

  GET DIAGNOSTICS v_updated = ROW_COUNT;
  IF v_updated = 0 THEN
    RETURN NEW;
  END IF;

  -- Ferme les propositions RoullePro de la meme demande.
  UPDATE public.demandes_transport_pros
  SET statut = 'autre_acceptee'
  WHERE demande_id = NEW.demande_transport_id
    AND statut = 'proposee';

  -- Ferme les autres reservations TCP du meme groupe.
  IF v_demande.groupe_id_tcp IS NOT NULL THEN
    UPDATE tcp.reservations
    SET statut = 'annulee_autre_pro'
    WHERE groupe_id = v_demande.groupe_id_tcp
      AND id <> NEW.id
      AND statut NOT IN ('annulee_autre_pro','annulee');
  END IF;

  -- Revele les vraies coordonnees au chauffeur qui a accepte (placeholders avant).
  UPDATE tcp.reservations
  SET nom_passager = COALESCE(v_demande.nom, nom_passager),
      telephone_passager = COALESCE(v_demande.telephone, telephone_passager),
      email_passager = COALESCE(v_demande.email, email_passager),
      adresse_depart = COALESCE(v_demande.lieu_depart, adresse_depart),
      adresse_arrivee = COALESCE(v_demande.lieu_arrivee, adresse_arrivee)
  WHERE id = NEW.id;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_tcp_reservation_acceptee ON tcp.reservations;
CREATE TRIGGER trg_tcp_reservation_acceptee
  AFTER UPDATE OF statut ON tcp.reservations
  FOR EACH ROW EXECUTE FUNCTION tcp.on_reservation_acceptee();
