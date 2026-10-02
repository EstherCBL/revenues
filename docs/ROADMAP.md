# Roadmap — Doce Controle (SaaS para microconfeiteiras)

Objetivo: sair de ferramenta pessoal para produto que **mostra quanto cada doce
realmente lucra**, com landing de captação. Detalhes técnicos em
[ARQUITETURA.md](ARQUITETURA.md).

## Fases

| Fase | Foco | Resultado |
| --- | --- | --- |
| 0 | Fundação: bugs, segurança, estrutura | Base estável e pronta para multi-tenant |
| 1 | Valor: ficha técnica, custo real, estoque, dashboard v2 | Diferencial do produto |
| 2 | UI: design system, mobile-first, PWA | App moderno e rápido de usar no celular |
| 3 | Landing + cadastro + onboarding | Captação e primeiro uso guiado |
| 4 | Qualidade contínua: testes, CI, observabilidade | Releases seguras |
| 5 | Monetização: plano grátis/pago, Pix/cartão, LGPD | Receita |

Qualidade (testes e CI) começa já na Fase 0 e continua nas seguintes.

## Fase 0 — tarefas (ordem sugerida)

Cada item tem critério de pronto. Itens 1–8 concluídos (marcados com ✅); antes de publicar, aplicar no Supabase as
migrations `20261002000200` e `20261002000300`.

1. ✅ **Ler os docs do Next 16** em `node_modules/next/dist/docs/` e registrar em ADR
   as mudanças que afetam o projeto (ex.: `proxy.ts`).
   *Pronto:* `docs/adr/0001-next16.md`.
2. ✅ **Corrigir fuso horário.** Helper único `shared/lib/datas.ts` (`hojeSP()`,
   `intervaloDoPeriodo()`), substituir `todayISO` e `periodoParaIntervalo`.
   *Pronto:* testes Vitest cobrindo 21h–23h59 e virada de mês.
3. ✅ (parcial) **Segurança imediata.** Desligar signup no Supabase; `revoke` de `anon`;
   `.env.example`; headers em `next.config.ts`; sanitizar export.
   *Pronto:* checklist da seção 5 da arquitetura marcado.
   *Feito:* `.env.example`, headers, CSP em enforcement, sanitização do export,
   `revoke` de `anon`. *Pendente (manual):* desativar "Allow new users to sign up"
   no painel do Supabase; CSP já validada e em enforcement;
   decidir a troca do pacote `xlsx` (0.18.5 sem manutenção; hoje só exporta).
4. ✅ **Migrations versionadas.** Converter `schema.sql` em `supabase/migrations/`;
   resolver a tabela `precos_pesquisados_v2` (renomear de volta ou documentar).
   *Pronto:* banco novo sobe só com `supabase db reset`.
   *Feito:* `supabase/migrations/` (baseline + hardening). `precos_pesquisados_v2`
   mantida; será recriada na migração multi-tenant (item 9).
5. ✅ **Tratamento de erros.** `DomainError`, resultado das actions, toasts e
   rollback em vendas, ingredientes, produtos, preços e config financeira.
   *Pronto:* nenhuma chamada ao Supabase sem checagem de erro.
6. ✅ **Validação com Zod** em todos os formulários e na grade de vendas
   (quantidade ≥ 1, preços ≥ 0, percentuais somando 100).
   *Pronto:* schemas em `features/*/schemas`, reaproveitados no servidor.
7. ✅ **Agregações no banco.** Views/RPC para faturamento, custo, série por dia;
   dashboard deixa de baixar todas as linhas.
   *Pronto:* dashboard com 1 chamada por bloco, filtrada por período.
8. ✅ **Reorganizar em features** conforme a estrutura alvo (sem mudar
   comportamento). *Pronto:* sem imports entre features, `madge` limpo.
9. **Multi-tenant.** Migration de `workspaces` + `workspace_members`,
   backfill do seu usuário como `owner`, RLS por `workspace_id`.
   *Pronto:* teste com dois usuários provando isolamento.
10. **Qualidade mínima.** Vitest no `domain/`, CI no GitHub Actions
    (lint, typecheck, test, build), preview na Vercel.
    *Pronto:* PR só mescla com CI verde.

## Fase 1 — valor (esboço)

- Ficha técnica estruturada: produto → ingredientes com quantidade → custo
  unitário e margem real (usa `custo_estimado`, hoje sem uso).
- Lucro real por produto e por período (custo dos itens vendidos, não das
  compras do mês); renomear "Divisão do lucro" para refletir a base de cálculo.
- Estoque de ingredientes com alerta de reposição.
- Sugestão de preço de venda a partir do custo e da margem desejada.
- Pesquisa de preços indicando onde comprar mais barato cada ingrediente.
- Dashboard v2: mais vendidos, ticket médio, mix de pagamento, comparação com o
  período anterior, metas.

## Decisões em aberto

- Nome e marca do produto (hoje "Doce Controle").
- Modelo de preço do plano pago e meio de cobrança.
- Se "ajudante" terá acesso a valores financeiros ou só ao lançamento.
