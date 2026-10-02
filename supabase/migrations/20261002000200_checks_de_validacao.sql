-- Fase 0.6 — validacao no servidor, espelhando os schemas Zod do app.
-- Idempotente. As constraints sao NOT VALID: valem para linhas novas e alteradas,
-- e NAO reprovam dados antigos. Atencao: uma linha antiga fora da regra nao
-- podera ser editada ate ser corrigida. Para achar essas linhas:
--   select id, quantidade, preco_unitario from vendas where quantidade < 1 or preco_unitario < 0;
--   select id, quantidade, preco_pago from ingredientes_comprados where quantidade <= 0 or preco_pago < 0;
--   select id, quantidade, preco from precos_pesquisados_v2 where quantidade <= 0 or preco < 0;
--   select id, preco_venda from produtos where preco_venda < 0;

do $$
begin
  -- ingredientes_comprados
  if not exists (select 1 from pg_constraint where conname = 'ingredientes_nome_nao_vazio') then
    alter table public.ingredientes_comprados
      add constraint ingredientes_nome_nao_vazio check (btrim(nome) <> '') not valid;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'ingredientes_quantidade_positiva') then
    alter table public.ingredientes_comprados
      add constraint ingredientes_quantidade_positiva check (quantidade > 0) not valid;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'ingredientes_preco_nao_negativo') then
    alter table public.ingredientes_comprados
      add constraint ingredientes_preco_nao_negativo check (preco_pago >= 0) not valid;
  end if;

  -- precos_pesquisados_v2
  if not exists (select 1 from pg_constraint where conname = 'precos_nome_nao_vazio') then
    alter table public.precos_pesquisados_v2
      add constraint precos_nome_nao_vazio check (btrim(nome) <> '') not valid;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'precos_quantidade_positiva') then
    alter table public.precos_pesquisados_v2
      add constraint precos_quantidade_positiva check (quantidade > 0) not valid;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'precos_preco_nao_negativo') then
    alter table public.precos_pesquisados_v2
      add constraint precos_preco_nao_negativo check (preco >= 0) not valid;
  end if;

  -- produtos
  if not exists (select 1 from pg_constraint where conname = 'produtos_nome_nao_vazio') then
    alter table public.produtos
      add constraint produtos_nome_nao_vazio check (btrim(nome) <> '') not valid;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'produtos_preco_nao_negativo') then
    alter table public.produtos
      add constraint produtos_preco_nao_negativo check (preco_venda >= 0) not valid;
  end if;

  -- vendas
  if not exists (select 1 from pg_constraint where conname = 'vendas_quantidade_minima') then
    alter table public.vendas
      add constraint vendas_quantidade_minima check (quantidade >= 1) not valid;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'vendas_preco_nao_negativo') then
    alter table public.vendas
      add constraint vendas_preco_nao_negativo check (preco_unitario >= 0) not valid;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'vendas_forma_pagamento_valida') then
    alter table public.vendas
      add constraint vendas_forma_pagamento_valida
      check (forma_pagamento is null or forma_pagamento in ('pix', 'dinheiro', 'cartao', 'outro')) not valid;
  end if;
end
$$;
