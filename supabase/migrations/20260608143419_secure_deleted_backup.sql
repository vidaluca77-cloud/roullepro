-- P0 sécurité #1 — Sécuriser la table de sauvegarde pros_sanitaire_deleted_backup
--
-- Problème : la table public.pros_sanitaire_deleted_backup contient ~448 lignes de
-- vraies données pros (sauvegarde de fiches supprimées) et était exposée sans RLS,
-- donc lisible par n'importe quel client anon/authenticated via l'API PostgREST.
--
-- Correctif : activer RLS et n'autoriser l'accès qu'aux administrateurs
-- (profiles.role = 'admin', le pattern admin utilisé partout dans ce projet).
-- Le rôle service_role contourne toujours la RLS : les jobs serveur restent fonctionnels.
--
-- Idempotent : safe à rejouer.

-- 1. Activer RLS (bloque par défaut tout accès anon/authenticated sans policy).
alter table public.pros_sanitaire_deleted_backup enable row level security;

-- 2. Forcer la RLS même pour le propriétaire de la table (défense en profondeur).
alter table public.pros_sanitaire_deleted_backup force row level security;

-- 3. Policy admin-only : seuls les comptes authentifiés ayant role = 'admin'
--    peuvent lire/écrire. Aucune policy permissive pour anon → accès refusé.
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'pros_sanitaire_deleted_backup'
      and policyname = 'deleted_backup_admin_only'
  ) then
    create policy "deleted_backup_admin_only"
      on public.pros_sanitaire_deleted_backup
      for all
      to authenticated
      using (
        exists (
          select 1 from public.profiles
          where profiles.id = (select auth.uid())
            and profiles.role = 'admin'
        )
      )
      with check (
        exists (
          select 1 from public.profiles
          where profiles.id = (select auth.uid())
            and profiles.role = 'admin'
        )
      );
  end if;
end$$;
