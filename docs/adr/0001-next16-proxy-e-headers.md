# ADR 0001 — Next.js 16: `proxy.ts` e headers de segurança

Status: aceito · Data: 2026-10-02

## Contexto

O `AGENTS.md` avisa que este Next (16.3.5) tem mudanças em relação ao que se
conhece. Foram lidos os guias em `node_modules/next/dist/docs/` sobre `proxy`,
`headers` e Content Security Policy antes de mexer em configuração.

## Decisões

1. **`src/proxy.ts` é a convenção correta.** No Next 16, `middleware` foi
   renomeado para `proxy` (mesma função). O projeto já usa `proxy.ts` e a função
   exportada `proxy`; nada a migrar. O proxy serve para checagens otimistas
   (sessão/redirect), não para dados lentos. A autorização real fica na RLS.
   *Pendência de nome:* `src/lib/supabase/middleware.ts` guarda a lógica de
   sessão e pode ser renomeado para `session.ts` na reorganização em features.
2. **Headers via `next.config.ts` (`headers()`).** Aplicados a todas as rotas:
   `X-Content-Type-Options`, `X-Frame-Options: DENY`, `Referrer-Policy`,
   `Permissions-Policy`, `Strict-Transport-Security`. `poweredByHeader` desligado.
3. **CSP sem nonce, em modo Report-Only.** Nonce exige renderização dinâmica em
   todas as páginas, o que custa performance e atrapalha a landing estática
   (Fase 3). Sem nonce a política usa `'unsafe-inline'` em script/style, mas ainda
   restringe origens, `frame-ancestors`, `object-src`, `base-uri` e `form-action`.
   Está em **Report-Only** porque não foi possível validar contra o Supabase real
   nesta etapa: abra o app em um deploy de preview, confira o console por
   violações e então troque a chave para `Content-Security-Policy`.
4. **Alternativa futura:** SRI experimental do Next (CSP por hash, mantém páginas
   estáticas) ou nonce se a landing virar dinâmica.

## Consequências

- Clickjacking e sniffing de MIME bloqueados já agora.
- CSP vira enforcement após uma validação manual (checklist na Fase 0.3).
