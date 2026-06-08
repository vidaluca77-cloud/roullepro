-- P0 sécurité #4 — Optimiser les policies RLS : auth.uid() -> (select auth.uid())
--
-- Problème : ~33 policies RLS appellent auth.uid() directement. Postgres réévalue alors
-- la fonction pour CHAQUE ligne (auth_rls_initplan), ce qui dégrade fortement les perfs
-- sur les grosses tables (pros_sanitaire ~18 000 lignes). En enveloppant l'appel dans un
-- sous-select — (select auth.uid()) — Postgres l'évalue une seule fois par requête
-- (InitPlan), sans changer la sémantique.
--
-- Méthode : on ne réécrit pas chaque expression à la main (risque d'erreur et de dérive
-- de sémantique). On lit la définition courante de chaque policy depuis le catalogue
-- (pg_policies), on remplace UNIQUEMENT les occurrences de `auth.uid()` non déjà
-- enveloppées par `(select auth.uid())`, puis on DROP/CREATE la policy à l'identique
-- (même commande, mêmes rôles, mêmes USING / WITH CHECK). 100 % idempotent : relancer la
-- migration ne touche pas aux policies déjà enveloppées.
--
-- Liste explicite des policies ciblées (schéma.table -> policyname), conforme à l'audit.

do $$
declare
  -- (schema, table, policyname) des policies à envelopper.
  targets text[][] := array[
    array['public','ameli_badge_requests','ameli_requests_insert_owner'],
    array['public','ameli_badge_requests','ameli_requests_select_owner'],
    array['public','callback_requests','callback_select_owner'],
    array['public','callback_requests','callback_update_owner'],
    array['public','callback_requests','callback_select_admin'],
    array['public','callback_requests','callback_update_admin'],
    array['public','email_send_log','email_send_log_admin_select'],
    array['public','partner_clicks','Admins can read partner clicks'],
    array['public','phone_enrichment_log','admin_all_log'],
    array['public','phone_enrichment_queue','admin_all_queue'],
    array['public','phone_enrichment_review','admin_all_review'],
    array['public','phone_reveals','phone_reveals_select_owner'],
    array['public','phone_reveals','phone_reveals_select_admin'],
    array['public','plan_expiration_log','plan_expiration_log_admin_select'],
    array['public','plan_offer_grants','plan_offer_grants_service_all'],
    array['public','plan_offer_grants','plan_offer_grants_owner_select'],
    array['public','prescripteur_demandes','Admins can read all prescripteur demandes'],
    array['public','prescripteur_demandes','Admins can update prescripteur demandes'],
    array['public','pro_checklist_progress','pro_checklist_progress_owner_select'],
    array['public','pro_checklist_progress','pro_checklist_progress_owner_insert'],
    array['public','pro_checklist_progress','pro_checklist_progress_owner_update'],
    array['public','pro_checklist_progress','pro_checklist_progress_owner_delete'],
    array['public','pro_compliance_profiles','pro_compliance_own_select'],
    array['public','pro_compliance_profiles','pro_compliance_own_modify'],
    array['public','pro_compliance_profiles','pro_compliance_profiles_select_own'],
    array['public','pro_compliance_profiles','pro_compliance_profiles_insert_own'],
    array['public','pro_compliance_profiles','pro_compliance_profiles_update_own'],
    array['public','pro_compliance_profiles','pro_compliance_profiles_delete_own'],
    array['public','pros_pre_inscription','users insert own pre-inscription'],
    array['public','pros_pre_inscription','users read own pre-inscription'],
    array['public','pros_pre_inscription','admin all'],
    array['public','reg_alerts_candidates','reg_alerts_candidates_service_all'],
    array['public','reg_ingestion_runs','reg_ingestion_runs_service_all']
  ];
  t text[];
  v_schema text;
  v_table text;
  v_policy text;
  rec record;
  v_cmd text;
  v_roles text;
  v_using text;
  v_check text;
  v_sql text;
  v_using_new text;
  v_check_new text;
begin
  foreach t slice 1 in array targets loop
    v_schema := t[1];
    v_table  := t[2];
    v_policy := t[3];

    -- Récupère la définition courante de la policy.
    select pol.cmd, pol.roles, pol.qual, pol.with_check
      into rec
    from pg_policies pol
    where pol.schemaname = v_schema
      and pol.tablename  = v_table
      and pol.policyname = v_policy;

    if not found then
      raise notice 'Policy introuvable, ignorée : %.% / %', v_schema, v_table, v_policy;
      continue;
    end if;

    v_cmd   := rec.cmd;          -- SELECT / INSERT / UPDATE / DELETE / ALL
    v_using := rec.qual;         -- expression USING (texte) ou NULL
    v_check := rec.with_check;   -- expression WITH CHECK (texte) ou NULL

    -- Rôles (text[]) -> liste CSV. {public} => PUBLIC ; sinon liste de rôles cités.
    if rec.roles is null or rec.roles = '{public}'::name[] then
      v_roles := 'public';
    else
      select string_agg(quote_ident(r), ', ')
        into v_roles
      from unnest(rec.roles) as r;
    end if;

    -- Remplace `auth.uid()` par `(select auth.uid())` SANS toucher aux occurrences déjà
    -- enveloppées. La regex en negative lookbehind n'existe pas en POSIX ; on procède en
    -- deux temps : on protège d'abord les formes déjà enveloppées via un marqueur, on
    -- remplace les auth.uid() restants, puis on restaure.
    v_using_new := v_using;
    v_check_new := v_check;

    if v_using_new is not null then
      v_using_new := replace(v_using_new, '( SELECT auth.uid()', '%%WRAPPED%%');
      v_using_new := replace(v_using_new, '(select auth.uid()', '%%WRAPPED%%');
      v_using_new := regexp_replace(v_using_new, 'auth\.uid\(\)', '(select auth.uid())', 'g');
      v_using_new := replace(v_using_new, '%%WRAPPED%%', '(select auth.uid()');
    end if;

    if v_check_new is not null then
      v_check_new := replace(v_check_new, '( SELECT auth.uid()', '%%WRAPPED%%');
      v_check_new := replace(v_check_new, '(select auth.uid()', '%%WRAPPED%%');
      v_check_new := regexp_replace(v_check_new, 'auth\.uid\(\)', '(select auth.uid())', 'g');
      v_check_new := replace(v_check_new, '%%WRAPPED%%', '(select auth.uid()');
    end if;

    -- Si rien à changer (déjà enveloppée), on n'altère pas la policy.
    if v_using_new is not distinct from v_using
       and v_check_new is not distinct from v_check then
      raise notice 'Déjà enveloppée, ignorée : %.% / %', v_schema, v_table, v_policy;
      continue;
    end if;

    -- DROP de l'ancienne policy.
    execute format('drop policy if exists %I on %I.%I', v_policy, v_schema, v_table);

    -- Recréation à l'identique (commande + rôles + USING + WITH CHECK).
    v_sql := format('create policy %I on %I.%I', v_policy, v_schema, v_table);

    if v_cmd is not null and v_cmd <> 'ALL' then
      v_sql := v_sql || ' for ' || lower(v_cmd);
    else
      v_sql := v_sql || ' for all';
    end if;

    v_sql := v_sql || ' to ' || v_roles;

    if v_using_new is not null then
      v_sql := v_sql || ' using (' || v_using_new || ')';
    end if;

    if v_check_new is not null then
      v_sql := v_sql || ' with check (' || v_check_new || ')';
    end if;

    execute v_sql;
    raise notice 'Policy enveloppée : %.% / %', v_schema, v_table, v_policy;
  end loop;
end$$;
