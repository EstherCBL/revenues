# Arquitetura — Doce Controle (SaaS)

Decisão: manter **Next.js 16 + Supabase** e portar para cá os padrões de arquitetura
do Allervia (monolito modular por domínio, multi-tenant com raiz na organização,
rotas fechadas por padrão, auditoria, validação com Zod, testes focados na regra
de negócio). O Allervia é referência de **padrões**; o domínio é outro.

> Aviso do `AGENTS.md`: esta versão do Next tem mudanças de API. Antes de
> implementar qualquer coisa nova, ler o guia correspondente em
> `node_modules/next/dist/docs/`.

## 1. Padrões herdados do Allervia

| Allervia (NestJS/Prisma) | Aqui (Next/Supabase) |
| --- | --- |
| Módulos por domínio, não por camada | `src/features/<dominio>/` autocontido |
| Um caso de uso por arquivo | Uma server action por arquivo: `criar-venda.action.ts` |
| Controller só devolve DTO | Actions/queries só devolvem tipos de view, nunca a linha crua do banco |
| `Organization` na raiz do isolamento | `workspaces` na raiz; `workspace_id` em toda tabela |
| CASL filtrado por `organizationId` | RLS no Postgres filtrada por `workspace_id` + papel |
| Guard global "fechado por padrão" | `proxy.ts` nega tudo exceto rotas públicas listadas; RLS nega tudo sem policy |
| Papéis (`ADMINISTRATOR`, `PHYSICIAN`...) | `owner` (dona) e `helper` (ajudante) |
| `AuditLog` (old/new values) | `audit_log` alimentado por trigger |
| Arquivamento lógico + autoria | `archived_at`, `created_by`, `updated_by` |
| `DomainException` + filtro global | `DomainError` + mapeamento único para toast/mensagem |
| Zod por formulário (front) | `schemas/` na feature, usado no form **e** na action |
| Rigor de teste na regra cara | Vitest nas contas de custo, margem e divisão |
| `madge` contra ciclos | `madge --circular` no CI |
| Tokens + primitives (`showcase`) | Tokens em `globals.css` + primitives em `shared/components/ui` (shadcn) |

## 2. Estrutura de pastas alvo

```
src/
├── app/
│   ├── (marketing)/        landing pública (/, /precos, /termos, /privacidade)
│   ├── (auth)/             login, cadastro, recuperar senha
│   └── (app)/app/          produto autenticado (dashboard, vendas, produtos...)
├── features/
│   ├── dashboard/  vendas/  produtos/  ingredientes/  precos/  financeiro/  workspace/
│   │   ├── components/     UI da feature
│   │   ├── schemas/        Zod (*.schema.ts)
│   │   ├── actions/        server actions (*.action.ts), uma por operação
│   │   ├── queries/        leituras no servidor (*.query.ts)
│   │   ├── domain/         regras puras, sem React nem Supabase (testáveis)
│   │   └── constants/
├── shared/
│   ├── components/ui/      primitives (shadcn) e barrel index.ts
│   ├── lib/                format, datas (fuso), dinheiro, export, errors
│   └── hooks/
└── lib/supabase/           client, server, proxy (sessão)
supabase/
└── migrations/             SQL versionado (substitui o schema.sql único)
docs/                       este arquivo, ROADMAP.md, ADRs
```

Regras: imports por alias `@/`; nomes em kebab-case com sufixo de papel
(`.action.ts`, `.query.ts`, `.schema.ts`); uma feature não importa de outra,
só de `shared`; `domain/` não importa nada de framework.

## 3. Multi-tenant (workspace) com RLS

Toda tabela de negócio ganha `workspace_id`. O acesso é decidido pelo banco, não
pela UI. Esboço da migration:

```sql
create table workspaces (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  created_at timestamptz not null default now()
);

create table workspace_members (
  workspace_id uuid not null references workspaces on delete cascade,
  user_id uuid not null references auth.users on delete cascade,
  role text not null check (role in ('owner','helper')),
  primary key (workspace_id, user_id)
);

create schema if not exists private;

create function private.is_member(ws uuid) returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.workspace_members m
    where m.workspace_id = ws and m.user_id = (select auth.uid())
  )
$$;

-- por tabela de negócio (exemplo: vendas)
alter table vendas add column workspace_id uuid references workspaces;
-- backfill com o workspace da dona, depois: set not null
create index on vendas (workspace_id, data_venda desc);

drop policy if exists "authenticated full access" on vendas;
create policy "membros do workspace" on vendas
  for all to authenticated
  using (private.is_member(workspace_id))
  with check (private.is_member(workspace_id));

revoke all on vendas from anon;
```

Pontos de atenção: policies de escrita sensíveis (`config_financeira`, membros)
exigem `role = 'owner'`; `helper` só lança vendas e compras. Criar workspace e
membro `owner` no cadastro, numa função/transação única. Nunca confiar em
`workspace_id` vindo do cliente sem a policy conferir.

## 4. Dados e erros

- Leituras no **servidor** (RSC + `queries/`), não em `useEffect` no cliente.
- Agregações (faturamento, custo, série por dia, mais vendidos) em **view/RPC
  no Postgres**; a UI não soma linhas.
- Escritas via server action: valida com Zod → executa → devolve
  `{ ok: true, data } | { ok: false, error }`. Nunca engolir erro do Supabase.
- Cliente: atualização otimista só com rollback e toast de falha.
- Dinheiro: `numeric(12,2)` no banco; no domínio, trabalhar em centavos inteiros
  (helper em `shared/lib/dinheiro.ts`), nunca somar float solto.
- Datas de negócio (`data_venda` etc.) são `date` no fuso `America/Sao_Paulo`.
  Proibido `toISOString().slice(0,10)` para "hoje": usar helper único de fuso.

## 5. Segurança (checklist)

- Signup público desligado no Supabase até o fluxo de cadastro do SaaS existir;
  depois, cadastro cria workspace.
- RLS por `workspace_id` em todas as tabelas; `revoke` de `anon`.
- `audit_log` (tabela, entidade, id, ação, old/new, usuário, workspace, quando)
  por trigger nas tabelas financeiras.
- Arquivamento lógico em vez de `delete` físico para venda/compra/produto.
- Headers de segurança em `next.config.ts` (CSP, `X-Content-Type-Options`,
  `Referrer-Policy`, `frame-ancestors`); limite de tentativas de login (config do
  Supabase Auth + firewall da Vercel).
- Export `.xlsx`/CSV: neutralizar células que começam com `=`, `+`, `-`, `@`;
  trocar/atualizar o pacote `xlsx` (0.18.5 do npm está sem manutenção).
- Segredos só em variáveis de ambiente; `.env.example` versionado, `.env*`
  no `.gitignore`.
- LGPD: política de privacidade, exportação e exclusão de dados da conta.

## 6. UI

- Tokens atuais (paleta quente, Fraunces + Plus Jakarta, dark mode) ficam; viram
  base do design system em `shared/components/ui`.
- Mobile-first: lançar venda em bottom sheet (chips de produto, +/−, pagamento);
  a grade editável fica como visão avançada no desktop.
- Estados vazios, skeletons e erros padronizados; sem `confirm()` nativo.
- Acessibilidade: contraste AA conferido nos dois temas, foco visível, rótulos.

## 7. Qualidade

- **Vitest**: `domain/` (margem, custo por produto, divisão do lucro, períodos e
  fuso). É onde um bug custa dinheiro.
- **Playwright**: login, lançar venda, ver dashboard (fluxo crítico).
- **CI (GitHub Actions)**: lint, typecheck, vitest, build, `madge --circular`.
- Deploy: preview por PR na Vercel; migrations aplicadas por CLI do Supabase.
- ADRs curtos em `docs/adr/` para decisões que mudam a arquitetura.
