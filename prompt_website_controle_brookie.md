## Contexto

Preciso de um site pessoal (uso único, sem necessidade de multiusuário) para controlar
minha pequena produção e venda de doces artesanais (começando por um "brookie", mas o
cadastro de produtos deve ser genérico para qualquer doce que eu vender no futuro).

O site tem três funções centrais:
1. Registrar cada compra de ingrediente (o que comprei, onde, quanto paguei).
2. Registrar cada venda realizada, em uma visão parecida com uma planilha.
3. Cadastrar produtos (nome, descrição, preço de venda e a receita/ficha técnica, só para consulta).

E um painel inicial (dashboard) que mostra, de forma simples e visual, quanto faturei,
quanto lucrei e como esse valor deve ser dividido entre investimento, reposição de
ingredientes e uso pessoal.

## Stack técnica

- **Backend/dados:** Supabase (Postgres + Auth simples, um único usuário/e-mail meu).
- **Frontend:** Next.js (React) + Tailwind, consumindo o Supabase via `@supabase/supabase-js`.
- **Views em formato de planilha:** usar um componente de grid editável (ex.:
  `react-data-grid` ou `handsontable`) na aba "Vendidos", para eu conseguir digitar
  linhas rapidamente como se fosse uma planilha.
- **Exportação para planilha real:** botão "Exportar .xlsx" em cada aba, gerando o arquivo
  no navegador com a biblioteca `sheetjs` (`xlsx`), a partir dos dados vindos do Supabase.
- **Responsivo:** preciso lançar vendas pelo celular, então o layout tem que funcionar bem
  em telas pequenas.
- **Autenticação:** simples, e-mail/senha (Supabase Auth), sem necessidade de convite de
  outros usuários nem papéis/permissões.

## Modelo de dados (Supabase)

```sql
-- Ingredientes comprados
create table ingredientes_comprados (
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

-- Produtos cadastrados
create table produtos (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  descricao text,
  preco_venda numeric not null,
  custo_estimado numeric,       -- opcional, calculado a partir da ficha tecnica
  receita text,                 -- texto livre com a ficha tecnica/modo de preparo
  ativo boolean default true,
  created_at timestamptz default now()
);

-- Vendas
create table vendas (
  id uuid primary key default gen_random_uuid(),
  produto_id uuid references produtos(id),
  quantidade integer not null,
  preco_unitario numeric not null,  -- puxa o preco_venda do produto, mas pode editar
  valor_total numeric generated always as (quantidade * preco_unitario) stored,
  data_venda date not null default current_date,
  forma_pagamento text,              -- opcional: pix, dinheiro, cartao
  notas text,
  created_at timestamptz default now()
);

-- Configuracao da divisao financeira (percentuais editaveis)
create table config_financeira (
  id int primary key default 1,
  pct_investimento numeric not null default 30,
  pct_ingredientes numeric not null default 35,
  pct_pessoal numeric not null default 35,
  check (pct_investimento + pct_ingredientes + pct_pessoal = 100)
);
```

## Páginas e funcionalidades

### 1. Dashboard (tela inicial)
- Cards com: faturamento total (soma de `valor_total` em `vendas`), custo total em
  ingredientes (soma de `preco_pago` em `ingredientes_comprados`), lucro bruto
  (faturamento - custo de ingredientes) e margem de lucro (%).
- Filtro de período (hoje, últimos 7 dias, mês atual, tudo).
- Bloco "Divisão do lucro" mostrando, com base na `config_financeira`, quanto do
  faturamento do período deve ir para: Investimento, Reposição de ingredientes e Uso
  pessoal — em R$ e em %. Os percentuais devem ser editáveis nessa mesma tela (afetam
  `config_financeira`), com o padrão inicial 30% / 35% / 35% (ajustável entre 30-40% na
  faixa de ingredientes).
- Gráfico simples de faturamento por dia/semana (opcional, mas desejável).

### 2. Registro de ingredientes comprados
- Formulário para adicionar uma compra: nome do ingrediente, local de compra
  (texto livre ou lista com sugestões dos locais já usados), quantidade + unidade,
  valor pago, data.
- Tabela abaixo com o histórico, ordenada por data (mais recente primeiro), com opção
  de editar/excluir cada linha e exportar para `.xlsx`.

### 3. Vendidos
- Tela em formato de **planilha editável** (grid), com colunas: Data, Produto (dropdown
  puxando de `produtos`), Quantidade, Preço unitário (pré-preenchido com o preço do
  produto, mas editável), Valor total (calculado), Forma de pagamento, Notas.
- Deve ser possível adicionar uma linha nova rapidamente (atalho de teclado ou botão
  "+ nova venda") e editar células direto na grid, sem abrir modal — pensando em
  velocidade no dia a dia.
- Botão para exportar a visão atual (com os filtros aplicados) para `.xlsx`.

### 4. Cadastro de novos produtos
- Formulário: nome, descrição, preço de venda, campo de texto longo para a receita/ficha
  técnica (só para consulta rápida, sem necessidade de cálculo automático de custo nesta
  primeira versão).
- Listagem dos produtos cadastrados, com opção de ativar/desativar (produtos inativos não
  aparecem no dropdown da aba "Vendidos").

## Regras de negócio

- A divisão 30% investimento / 30-40% ingredientes / restante uso pessoal é aplicada
  sobre o **faturamento do período filtrado no dashboard**, não sobre o lucro líquido —
  os três percentuais devem sempre somar 100% (validar isso no formulário de configuração).
- Margem de lucro = (faturamento - custo de ingredientes) / faturamento, exibida em %.
- Todos os valores monetários em Real (R$), formato brasileiro (vírgula decimal).

## Fora de escopo nesta primeira versão

- Cálculo automático de custo por produto a partir da ficha técnica (pode ser feito
  manualmente por enquanto, preenchendo `custo_estimado`).
- Multiusuário, permissões ou papéis.
- Emissão de nota fiscal ou integração com meios de pagamento.

## Entregável esperado

Repositório com o projeto Next.js configurado, migrations do Supabase (SQL acima),
variáveis de ambiente documentadas (`.env.example`) e instruções de como rodar
localmente e publicar (ex.: Vercel + Supabase).
