-- v2 de ia_rechercher_documents : ajoute un repli en OR (recall) quand la
-- requête stricte (websearch/plainto, sémantique AND) ne renvoie rien.
create or replace function public.ia_rechercher_documents(
  p_agent_slug text,
  p_query text,
  p_limite integer default 5
)
returns table (
  titre text,
  contenu text,
  source_nom text,
  source_url text,
  rang real
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_query tsquery;
  v_or_query tsquery;
begin
  v_query := websearch_to_tsquery('french', coalesce(p_query, ''));
  if v_query is null or numnode(v_query) = 0 then
    v_query := plainto_tsquery('french', coalesce(p_query, ''));
  end if;
  if v_query is null or numnode(v_query) = 0 then
    return;
  end if;

  return query
    select d.titre, d.contenu, d.source_nom, d.source_url,
           ts_rank(d.recherche, v_query) as rang
    from public.ia_documents d
    where d.recherche @@ v_query
      and (p_agent_slug = 'general' or d.agent_slug = p_agent_slug)
    order by rang desc
    limit greatest(1, coalesce(p_limite, 5));

  if not found then
    -- Repli : mêmes lexèmes reliés par OR pour maximiser le rappel.
    begin
      v_or_query := replace(plainto_tsquery('french', coalesce(p_query, ''))::text, ' & ', ' | ')::tsquery;
    exception when others then
      return;
    end;
    if v_or_query is null or numnode(v_or_query) = 0 then
      return;
    end if;
    return query
      select d.titre, d.contenu, d.source_nom, d.source_url,
             ts_rank(d.recherche, v_or_query) as rang
      from public.ia_documents d
      where d.recherche @@ v_or_query
        and (p_agent_slug = 'general' or d.agent_slug = p_agent_slug)
      order by rang desc
      limit greatest(1, coalesce(p_limite, 5));
  end if;
end;
$$;
