-- Veille reglementaire : assure que la table reg_newsletter_sends a un champ stats jsonb
-- pour logger les statistiques d'envoi hebdomadaire (sent_count, skipped_count, etc.).
-- Idempotent : safe a executer plusieurs fois.

create table if not exists public.reg_newsletter_sends (
  id uuid primary key default gen_random_uuid(),
  sent_at timestamptz not null default now(),
  mode text,
  stats jsonb,
  created_at timestamptz not null default now()
);

alter table public.reg_newsletter_sends
  add column if not exists mode text,
  add column if not exists stats jsonb,
  add column if not exists sent_at timestamptz default now();

create index if not exists idx_reg_newsletter_sends_sent_at
  on public.reg_newsletter_sends (sent_at desc);
