-- Assistant IA métier (Mistral) réservé aux pros sanitaire payants.
-- 4 tables : conversations, messages, mémoire longue durée, comptage d'usage mensuel.
-- RLS : chaque user ne voit/écrit que ses propres lignes. Le backend utilise le
-- service_role (bypass RLS) pour l'écriture des réponses assistant + le comptage.
-- Idempotent : safe à exécuter plusieurs fois.

-- ─────────────────────────────────────────────────────────────
-- 1. ia_conversations
-- ─────────────────────────────────────────────────────────────
create table if not exists public.ia_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  titre text not null default 'Nouvelle conversation',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  is_archived boolean not null default false
);

create index if not exists idx_ia_conversations_user_id
  on public.ia_conversations (user_id, updated_at desc);

alter table public.ia_conversations enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='ia_conversations' and policyname='ia_conversations_select_own') then
    create policy "ia_conversations_select_own" on public.ia_conversations
      for select using ((select auth.uid()) = user_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='ia_conversations' and policyname='ia_conversations_insert_own') then
    create policy "ia_conversations_insert_own" on public.ia_conversations
      for insert with check ((select auth.uid()) = user_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='ia_conversations' and policyname='ia_conversations_update_own') then
    create policy "ia_conversations_update_own" on public.ia_conversations
      for update using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='ia_conversations' and policyname='ia_conversations_delete_own') then
    create policy "ia_conversations_delete_own" on public.ia_conversations
      for delete using ((select auth.uid()) = user_id);
  end if;
end$$;

-- ─────────────────────────────────────────────────────────────
-- 2. ia_messages
-- ─────────────────────────────────────────────────────────────
create table if not exists public.ia_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.ia_conversations(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  contenu text not null,
  created_at timestamptz not null default now(),
  tokens_estimes integer
);

create index if not exists idx_ia_messages_conversation_id
  on public.ia_messages (conversation_id, created_at);

alter table public.ia_messages enable row level security;

-- Accès messages : l'utilisateur voit/écrit les messages des conversations qu'il possède.
do $$
begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='ia_messages' and policyname='ia_messages_select_own') then
    create policy "ia_messages_select_own" on public.ia_messages
      for select using (
        exists (
          select 1 from public.ia_conversations c
          where c.id = ia_messages.conversation_id
            and c.user_id = (select auth.uid())
        )
      );
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='ia_messages' and policyname='ia_messages_insert_own') then
    create policy "ia_messages_insert_own" on public.ia_messages
      for insert with check (
        exists (
          select 1 from public.ia_conversations c
          where c.id = ia_messages.conversation_id
            and c.user_id = (select auth.uid())
        )
      );
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='ia_messages' and policyname='ia_messages_delete_own') then
    create policy "ia_messages_delete_own" on public.ia_messages
      for delete using (
        exists (
          select 1 from public.ia_conversations c
          where c.id = ia_messages.conversation_id
            and c.user_id = (select auth.uid())
        )
      );
  end if;
end$$;

-- ─────────────────────────────────────────────────────────────
-- 3. ia_memoire : fiche mémoire longue durée par pro (1 ligne / user)
-- ─────────────────────────────────────────────────────────────
create table if not exists public.ia_memoire (
  user_id uuid primary key references auth.users(id) on delete cascade,
  contenu text not null default '',
  updated_at timestamptz not null default now()
);

alter table public.ia_memoire enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='ia_memoire' and policyname='ia_memoire_select_own') then
    create policy "ia_memoire_select_own" on public.ia_memoire
      for select using ((select auth.uid()) = user_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='ia_memoire' and policyname='ia_memoire_insert_own') then
    create policy "ia_memoire_insert_own" on public.ia_memoire
      for insert with check ((select auth.uid()) = user_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='ia_memoire' and policyname='ia_memoire_update_own') then
    create policy "ia_memoire_update_own" on public.ia_memoire
      for update using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
  end if;
end$$;

-- ─────────────────────────────────────────────────────────────
-- 4. ia_usage : comptage mensuel des messages (quota)
-- ─────────────────────────────────────────────────────────────
create table if not exists public.ia_usage (
  user_id uuid not null references auth.users(id) on delete cascade,
  mois date not null,
  nb_messages integer not null default 0,
  primary key (user_id, mois)
);

alter table public.ia_usage enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='ia_usage' and policyname='ia_usage_select_own') then
    create policy "ia_usage_select_own" on public.ia_usage
      for select using ((select auth.uid()) = user_id);
  end if;
end$$;

-- Incrément atomique du compteur mensuel (SECURITY DEFINER, appelé par le backend
-- service_role). Renvoie le nouveau total du mois courant.
create or replace function public.ia_incrementer_usage(p_user_id uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_mois date := date_trunc('month', now())::date;
  v_total integer;
begin
  insert into public.ia_usage (user_id, mois, nb_messages)
    values (p_user_id, v_mois, 1)
  on conflict (user_id, mois)
    do update set nb_messages = public.ia_usage.nb_messages + 1
  returning nb_messages into v_total;
  return v_total;
end;
$$;

-- ─────────────────────────────────────────────────────────────
-- Triggers updated_at
-- ─────────────────────────────────────────────────────────────
create or replace function public.touch_ia_conversations_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_ia_conversations_updated_at on public.ia_conversations;
create trigger trg_ia_conversations_updated_at
  before update on public.ia_conversations
  for each row execute function public.touch_ia_conversations_updated_at();
