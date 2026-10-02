-- Fase 0.7 — agregacoes do dashboard no banco.
-- Antes o app baixava TODAS as linhas de vendas e ingredientes e somava no navegador.
-- Agora o Postgres soma e devolve so os totais (e a serie por dia).
--
-- security invoker: as funcoes rodam com as permissoes de quem chama, entao a RLS
-- continua valendo (e continuara valendo quando entrar o multi-tenant).
-- Datas sao inclusivas; p_inicio/p_fim nulos significam "sem limite".
--
-- APLIQUE ESTA MIGRATION ANTES de publicar a versao do app que usa estas funcoes.

create or replace function public.resumo_periodo(
  p_inicio date default null,
  p_fim date default null
)
returns table (faturamento numeric, custo_ingredientes numeric)
language sql
stable
security invoker
set search_path = ''
as $$
  select
    coalesce((
      select sum(v.valor_total)
      from public.vendas v
      where (p_inicio is null or v.data_venda >= p_inicio)
        and (p_fim is null or v.data_venda <= p_fim)
    ), 0) as faturamento,
    coalesce((
      select sum(i.preco_pago)
      from public.ingredientes_comprados i
      where (p_inicio is null or i.data_compra >= p_inicio)
        and (p_fim is null or i.data_compra <= p_fim)
    ), 0) as custo_ingredientes;
$$;

create or replace function public.faturamento_por_dia(
  p_inicio date default null,
  p_fim date default null
)
returns table (data date, total numeric)
language sql
stable
security invoker
set search_path = ''
as $$
  select v.data_venda as data, sum(v.valor_total) as total
  from public.vendas v
  where (p_inicio is null or v.data_venda >= p_inicio)
    and (p_fim is null or v.data_venda <= p_fim)
  group by v.data_venda
  order by v.data_venda;
$$;

revoke all on function public.resumo_periodo(date, date) from public, anon;
revoke all on function public.faturamento_por_dia(date, date) from public, anon;
grant execute on function public.resumo_periodo(date, date) to authenticated;
grant execute on function public.faturamento_por_dia(date, date) to authenticated;
