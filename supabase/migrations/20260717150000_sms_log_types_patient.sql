-- SMS patient (phase 2) : confirmation au depot et a l'acceptation d'une course.
-- On etend la contrainte CHECK de sms_log.type pour accepter les nouveaux types
-- 'patient_depot' et 'patient_acceptation' (pro_id NULL, demande_id renseigne).
--
-- A APPLIQUER MANUELLEMENT sur Supabase apres merge (non executee par le code).
-- Le code applicatif tolere l'absence de la table/colonnes (try/catch) : il
-- ecrira simplement dans sms_log une fois cette migration jouee.
--
-- Rappel : dans 20260717_sms_phase1.sql, sms_log.pro_id est deja nullable et
-- sms_log.demande_id deja nullable — aucune modification de colonne necessaire.

alter table sms_log drop constraint if exists sms_log_type_check;

alter table sms_log
  add constraint sms_log_type_check
  check (type in ('transactionnel','prospection','patient_depot','patient_acceptation'));
