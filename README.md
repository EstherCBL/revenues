# Doce Controle

Site pessoal (uso único) para controlar a produção e venda de doces artesanais:
compras de ingredientes, vendas (em formato de planilha editável), cadastro de
produtos e um dashboard com faturamento, lucro e divisão financeira.

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4** — tema claro/escuro via `next-themes` (paleta quente,
  tipografia [Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans) +
  [Fraunces](https://fonts.google.com/specimen/Fraunces))
- **Supabase** (Postgres + Auth por e-mail/senha, usuário único)
- **react-data-grid** — planilha editável na aba "Vendidos"
- **xlsx (SheetJS)** — exportação para `.xlsx` em cada aba
- **recharts** — gráfico de faturamento por dia

## 1. Configurar o Supabase

1. Crie um projeto em [supabase.com](https://supabase.com).
2. No **SQL Editor**, rode o conteúdo de [`supabase/schema.sql`](supabase/schema.sql).
   Isso cria as tabelas (`ingredientes_comprados`, `produtos`, `vendas`,
   `config_financeira`), as políticas de RLS (acesso liberado para qualquer
   usuário autenticado — pensado para uso individual) e a configuração
   financeira padrão (30% / 35% / 35%).
3. Em **Authentication > Providers**, deixe apenas **Email** habilitado.
4. Em **Authentication > Users**, crie o seu usuário (seu e-mail/senha) — não
   há fluxo de cadastro público no site, o login é feito com uma conta já
   existente.
5. Em **Project Settings > API**, copie a **Project URL** e a **anon public key**.

## 2. Rodar localmente

```bash
npm install
cp .env.example .env.local
# edite .env.local com a URL e a anon key do seu projeto Supabase
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) — você será redirecionado
para `/login`.

## 3. Publicar (Vercel)

1. Suba o repositório para o GitHub (ou GitLab/Bitbucket).
2. Importe o projeto na [Vercel](https://vercel.com/new).
3. Em **Environment Variables**, adicione `NEXT_PUBLIC_SUPABASE_URL` e
   `NEXT_PUBLIC_SUPABASE_ANON_KEY` com os mesmos valores do `.env.local`.
4. Deploy. O Supabase já funciona em produção sem configuração adicional.

## Estrutura das páginas

- **`/` — Dashboard**: cards de faturamento, custo em ingredientes, lucro
  bruto e margem; filtro de período (hoje / 7 dias / mês atual / tudo);
  bloco de divisão do lucro (investimento / ingredientes / uso pessoal, com
  percentuais editáveis que precisam somar 100%); gráfico de faturamento por
  dia.
- **`/ingredientes`**: formulário de compra + histórico editável e
  exportável.
- **`/vendas`**: planilha editável (react-data-grid) com Data, Produto,
  Quantidade, Preço unitário, Valor total (calculado), Forma de pagamento e
  Notas. Botão "+ Nova venda" insere uma linha imediatamente; qualquer edição
  de célula salva direto no Supabase.
- **`/produtos`**: cadastro de produtos com nome, descrição, preço de venda e
  receita/ficha técnica (texto livre, só para consulta); produtos podem ser
  ativados/desativados — apenas os ativos aparecem no dropdown de "Vendidos".

## Notas de segurança

- A tabela `vendas` usa uma coluna gerada (`valor_total`) — o app nunca tenta
  gravar esse campo diretamente.
- A biblioteca `xlsx` é usada apenas para **exportar** dados que já vieram do
  seu próprio Supabase (não há import/parsing de planilhas de terceiros), o
  que evita a superfície de risco das vulnerabilidades conhecidas do pacote
  (prototype pollution / ReDoS ao **ler** arquivos não confiáveis).

## Fora de escopo (primeira versão)

- Cálculo automático de custo por produto a partir da ficha técnica.
- Multiusuário, permissões ou papéis.
- Emissão de nota fiscal ou integração com meios de pagamento.
