-- Table des abonnés à la newsletter du blog RoullePro
create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  source text default 'blog_inline',
  ip_hash text,
  user_agent text,
  confirmed_at timestamptz,
  unsubscribed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_newsletter_email on public.newsletter_subscribers(email);
create index if not exists idx_newsletter_created_at on public.newsletter_subscribers(created_at desc);

-- RLS : seuls les inserts anonymes sont autorisés via service role côté API.
alter table public.newsletter_subscribers enable row level security;

-- Aucune policy publique : les lectures/écritures passent par le service role (API route).
-- Les utilisateurs authentifiés ne peuvent pas lire la liste.

comment on table public.newsletter_subscribers is 'Abonnés à la newsletter du blog, collectés via /api/newsletter/subscribe';
