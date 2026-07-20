-- SMS de recrutement : notification aux pros NON inscrits (claimed=false) de la
-- commune de depart d'une demande, pour les inciter a activer leur fiche.
-- On etend la contrainte CHECK de sms_log.type pour accepter 'recrutement_course'
-- (pro_id renseigne = fiche non inscrite ciblee, demande_id renseigne).
--
-- A APPLIQUER MANUELLEMENT sur Supabase apres merge (non executee par le code).
-- Le code applicatif tolere l'absence de la table/colonnes (try/catch) : il
-- ecrira simplement dans sms_log une fois cette migration jouee.

alter table sms_log drop constraint if exists sms_log_type_check;

alter table sms_log
  add constraint sms_log_type_check
  check (type in ('transactionnel','prospection','patient_depot','patient_acceptation','recrutement_course'));
