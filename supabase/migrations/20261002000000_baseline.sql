-- Doce Controle: baseline do schema Supabase (Postgres)
-- Estado original do projeto (antigo supabase/schema.sql). Idempotente: seguro
-- rodar em banco novo ou em um projeto que ja tem estas tabelas.
-- Migrations seguintes ajustam seguranca e defaults; aplique TODAS em ordem
-- (`supabase db push`, ou colando cada arquivo no SQL Editor).

create extension if not exists "pgcrypto";

-- ============================================================
-- Ingredientes comprados
-- ============================================================
create table if not exists ingredientes_comprados (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  local_compra text,           -- ex: "Assai Anapolis", "Hiper Festa Centro"
  quantidade numeric not null, -- quantidade comprada
  unidade text not null,       -- g, kg, ml, un, etc.
  preco_pago numeric not null, -- valor total pago na compra
  data_compra date not null default current_date,
  notas text,
  created_at timestamptz default now()
);

create index if not exists idx_ingredientes_data on ingredientes_comprados (data_compra desc);

-- ============================================================
-- Precos pesquisados (comparacao de precos antes de comprar)
--
-- Nota: a tabela e "_v2" porque a "precos_pesquisados" original
-- ficou presa no cache do PostgREST (bug conhecido do Supabase,
-- retorna PGRST205 mesmo apos reload/restart) apos o projeto ser
-- pausado e a tabela recriada. Renomear contornou o problema.
-- ============================================================
create table if not exists precos_pesquisados_v2 (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  local_pesquisa text,         -- ex: "Assai Anapolis", "site X"
  quantidade numeric not null, -- quantidade correspondente ao preco pesquisado
  unidade text not null,       -- g, kg, ml, un, etc.
  preco numeric not null,      -- valor visto/pesquisado (nao necessariamente pago)
  data_pesquisa date not null default current_date,
  notas text,
  created_at timestamptz default now()
);

create index if not exists idx_precos_pesquisados_v2_nome on precos_pesquisados_v2 (nome, preco);

-- ============================================================
-- Produtos cadastrados
-- ============================================================
create table if not exists produtos (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  descricao text,
  preco_venda numeric not null,
  custo_estimado numeric,       -- opcional, calculado a partir da ficha tecnica
  receita text,                 -- texto livre com a ficha tecnica/modo de preparo
  ativo boolean default true,
  created_at timestamptz default now()
);

-- ============================================================
-- Vendas
-- ============================================================
create table if not exists vendas (
  id uuid primary key default gen_random_uuid(),
  produto_id uuid references produtos(id) on delete set null,
  quantidade integer not null,
  preco_unitario numeric not null,  -- puxa o preco_venda do produto, mas pode editar
  valor_total numeric generated always as (quantidade * preco_unitario) stored,
  data_venda date not null default current_date,
  forma_pagamento text,              -- opcional: pix, dinheiro, cartao
  notas text,
  created_at timestamptz default now()
);

create index if not exists idx_vendas_data on vendas (data_venda desc);

-- ============================================================
-- Configuracao da divisao financeira (percentuais editaveis)
-- ============================================================
create table if not exists config_financeira (
  id int primary key default 1,
  pct_investimento numeric not null default 30,
  pct_ingredientes numeric not null default 35,
  pct_pessoal numeric not null default 35,
  check (id = 1),
  check (pct_investimento + pct_ingredientes + pct_pessoal = 100)
);

insert into config_financeira (id, pct_investimento, pct_ingredientes, pct_pessoal)
values (1, 30, 35, 35)
on conflict (id) do nothing;

-- ============================================================
-- Row Level Security
-- Uso pessoal / single-user: qualquer usuario autenticado no seu
-- projeto Supabase (voce) tem acesso total. Nao ha suporte a
-- multiplos usuarios/paapeis nesta versao.
-- ============================================================
alter table ingredientes_comprados enable row level security;
alter table precos_pesquisados_v2 enable row level security;
alter table produtos enable row level security;
alter table vendas enable row level security;
alter table config_financeira enable row level security;

drop policy if exists "authenticated full access" on ingredientes_comprados;
create policy "authenticated full access" on ingredientes_comprados
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

drop policy if exists "authenticated full access" on precos_pesquisados_v2;
create policy "authenticated full access" on precos_pesquisados_v2
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

drop policy if exists "authenticated full access" on produtos;
create policy "authenticated full access" on produtos
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

drop policy if exists "authenticated full access" on vendas;
create policy "authenticated full access" on vendas
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

drop policy if exists "authenticated full access" on config_financeira;
create policy "authenticated full access" on config_financeira
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- ============================================================
-- Grants
-- RLS restringe o acesso, mas o PostgREST tambem exige privilegio
-- de tabela: sem o grant, ele esconde a tabela (erro PGRST205,
-- "table not found") em vez de negar o acesso.
-- ============================================================
grant usage on schema public to anon, authenticated;

grant select, insert, update, delete on
  ingredientes_comprados,
  precos_pesquisados_v2,
  produtos,
  vendas,
  config_financeira
to anon, authenticated;
