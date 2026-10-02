/**
 * Erros do app. Regra: nenhuma chamada ao Supabase pode terminar sem checar o
 * erro. Use `unwrap` (leituras/escritas que devolvem dados) ou `assertOk`
 * (escritas sem retorno) e mostre `mensagemDeErro(e)` ao usuário.
 */

/** Erro com mensagem já pronta para o usuário (pt-BR). */
export class DomainError extends Error {
  constructor(message: string, cause?: unknown) {
    super(message, { cause });
    this.name = "DomainError";
  }
}

export type ErroSupabase = { message: string; code?: string | null };

export const MENSAGEM_PADRAO = "Algo deu errado. Tente novamente.";

const MENSAGENS_POR_CODIGO: Record<string, string> = {
  "23505": "Já existe um registro igual a este.",
  "23503": "Este registro está ligado a outros dados e não pode ser alterado ou removido.",
  "23502": "Faltam campos obrigatórios.",
  "23514": "Algum valor está fora do permitido (por exemplo, quantidade ou preço inválido).",
  "42501": "Você não tem permissão para esta ação. Entre novamente e tente de novo.",
  PGRST205: "Tabela não encontrada no banco. Confira se as migrations foram aplicadas.",
  PGRST202: "Função não encontrada no banco. Confira se as migrations foram aplicadas.",
  PGRST301: "Sua sessão expirou. Entre novamente.",
};

/** Converte um erro do Supabase/PostgREST em mensagem amigável. */
export function traduzirErroSupabase(error: ErroSupabase): string {
  const porCodigo = error.code ? MENSAGENS_POR_CODIGO[error.code] : undefined;
  if (porCodigo) return porCodigo;

  const mensagem = error.message ?? "";
  if (/jwt expired|invalid jwt/i.test(mensagem)) return "Sua sessão expirou. Entre novamente.";
  if (/failed to fetch|networkerror|load failed/i.test(mensagem)) {
    return "Sem conexão com o servidor. Verifique sua internet e tente de novo.";
  }
  return mensagem || MENSAGEM_PADRAO;
}

/** Devolve `data` (sem null) ou lança `DomainError` com a mensagem traduzida. */
export function unwrap<T>(resultado: { data: T; error: ErroSupabase | null }): NonNullable<T> {
  if (resultado.error) throw new DomainError(traduzirErroSupabase(resultado.error), resultado.error);
  return resultado.data as NonNullable<T>;
}

/** Para escritas sem retorno: lança `DomainError` se houve erro. */
export function assertOk(resultado: { error: ErroSupabase | null }): void {
  if (resultado.error) throw new DomainError(traduzirErroSupabase(resultado.error), resultado.error);
}

/** Mensagem segura para mostrar ao usuário a partir de qualquer coisa lançada. */
export function mensagemDeErro(erro: unknown, fallback: string = MENSAGEM_PADRAO): string {
  if (erro instanceof DomainError) return erro.message;
  if (erro instanceof Error) return traduzirErroSupabase({ message: erro.message }) || fallback;
  return fallback;
}
