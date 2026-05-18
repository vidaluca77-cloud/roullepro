-- Veille reglementaire : colonnes pour double opt-in + desinscription 1 clic.
-- Idempotent : safe a executer plusieurs fois.

alter table public.newsletter_subscribers
  add column if not exists metiers_segments text[],
  add column if not exists confirmation_token text,
  add column if not exists confirmation_token_expires_at timestamptz,
  add column if not exists unsubscribe_token text,
  add column if not exists reg_newsletter_optin boolean default false,
  add column if not exists confirmed_at timestamptz,
  add column if not exists unsubscribed_at timestamptz;

-- Backfill unsubscribe_token pour les lignes existantes sans valeur.
update public.newsletter_subscribers
set unsubscribe_token = gen_random_uuid()::text
where unsubscribe_token is null;

-- Contrainte unicite sur unsubscribe_token (apres backfill).
do $$
begin
  if not exists (
    select 1 from pg_indexes
    where schemaname = 'public'
      and tablename = 'newsletter_subscribers'
      and indexname = 'newsletter_subscribers_unsubscribe_token_key'
  ) then
    alter table public.newsletter_subscribers
      add constraint newsletter_subscribers_unsubscribe_token_key unique (unsubscribe_token);
  end if;
end$$;

-- Default sur unsubscribe_token pour les futurs inserts.
alter table public.newsletter_subscribers
  alter column unsubscribe_token set default gen_random_uuid()::text;

create index if not exists idx_newsletter_confirmation_token
  on public.newsletter_subscribers (confirmation_token);

create index if not exists idx_newsletter_unsubscribe_token
  on public.newsletter_subscribers (unsubscribe_token);

create index if not exists idx_newsletter_reg_optin
  on public.newsletter_subscribers (reg_newsletter_optin)
  where reg_newsletter_optin = true;
