-- Fase 0 — endurecimento de seguranca e defaults de data.
-- Idempotente.

-- 1) O app so acessa o banco com usuario autenticado (login por e-mail/senha).
--    O papel `anon` nao precisa de privilegio nenhum nas tabelas de negocio:
--    se uma policy for criada errada no futuro, ela nao expoe dados sem login.
revoke all on table
  ingredientes_comprados,
  precos_pesquisados_v2,
  produtos,
  vendas,
  config_financeira
from anon;

-- `authenticated` mantem select/insert/update/delete (concedido no baseline);
-- a RLS ("authenticated full access") continua decidindo o acesso por linha.

-- 2) Datas de negocio no fuso do Brasil. `current_date` usa o fuso do servidor
--    (UTC no Supabase) e viraria o dia seguinte a partir das 21h em Sao Paulo.
--    O app ja envia a data explicitamente; isto protege inserts feitos direto
--    no SQL Editor ou por integracoes futuras.
alter table ingredientes_comprados
  alter column data_compra set default ((now() at time zone 'America/Sao_Paulo')::date);

alter table precos_pesquisados_v2
  alter column data_pesquisa set default ((now() at time zone 'America/Sao_Paulo')::date);

alter table vendas
  alter column data_venda set default ((now() at time zone 'America/Sao_Paulo')::date);

-- Nota sobre `precos_pesquisados_v2`: o sufixo _v2 existe porque a tabela original
-- ficou presa no cache do PostgREST (PGRST205). Renomear de volta pode reintroduzir
-- o problema; mantenha o nome ate a migracao multi-tenant (Fase 0.9), que recria
-- a tabela em um unico passo controlado.
