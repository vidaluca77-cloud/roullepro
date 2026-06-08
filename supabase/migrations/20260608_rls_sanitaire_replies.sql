-- ============================================================================
-- RLS sanitaire_replies — politiques explicites (qualité données)
-- ============================================================================
-- La migration 20260423 créait une unique politique "for all" sur
-- sanitaire_replies. On la remplace par des politiques explicites et plus
-- lisibles, sans changer le comportement métier :
--   - SELECT : le pro propriétaire de la fiche liée au message + admin
--   - INSERT : le pro propriétaire de la fiche liée au message (WITH CHECK)
--
-- Les écritures applicatives passent par la route API en service role
-- (RLS bypass) ; ces politiques constituent une défense en profondeur pour
-- tout accès via la clé anon.
-- ============================================================================

alter table sanitaire_replies enable row level security;

-- Ancienne politique fourre-tout
drop policy if exists "sanitaire_replies_owner" on sanitaire_replies;

-- SELECT : propriétaire de la fiche pro liée au message, ou admin
drop policy if exists "sanitaire_replies_select" on sanitaire_replies;
create policy "sanitaire_replies_select" on sanitaire_replies
  for select using (
    exists (
      select 1
      from sanitaire_messages m
      join pros_sanitaire p on p.id = m.pro_id
      where m.id = message_id and p.claimed_by = auth.uid()
    )
    or exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- INSERT : uniquement le propriétaire de la fiche pro liée au message
drop policy if exists "sanitaire_replies_insert" on sanitaire_replies;
create policy "sanitaire_replies_insert" on sanitaire_replies
  for insert with check (
    exists (
      select 1
      from sanitaire_messages m
      join pros_sanitaire p on p.id = m.pro_id
      where m.id = message_id and p.claimed_by = auth.uid()
    )
  );
