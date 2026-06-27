-- Pre-requis pour la migration 20260627140002_acceptation_sync_triggers.sql
-- 
-- Les triggers d'acceptation (RoullePro et TCP) doivent pouvoir basculer les
-- tcp.reservations concurrentes du meme groupe a 'annulee_autre_pro' pour
-- preserver la tracabilite (distinction entre annulation client et annulation
-- "un autre pro a accepte avant moi").
-- 
-- Sans cet ALTER, la contrainte CHECK existante refuse la valeur et tout
-- l'enchainement d'acceptation echoue.

ALTER TABLE tcp.reservations DROP CONSTRAINT IF EXISTS reservations_statut_check;

ALTER TABLE tcp.reservations
  ADD CONSTRAINT reservations_statut_check
  CHECK (statut = ANY (ARRAY[
    'en_attente'::text,
    'acceptee'::text,
    'refusee'::text,
    'annulee'::text,
    'annulee_autre_pro'::text
  ]));

COMMENT ON CONSTRAINT reservations_statut_check ON tcp.reservations IS
  'Statuts autorises. annulee_autre_pro est pose par les triggers RoullePro/TCP quand un autre pro accepte la course en premier (course de meme groupe_id).';
