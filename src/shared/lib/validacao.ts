import { z } from "zod";

export type ResultadoValidacao<T> = { ok: true; data: T } | { ok: false; error: string };

/** Valida `valores` com o schema e devolve a primeira mensagem de erro, já em pt-BR. */
export function validar<T>(schema: z.ZodType<T>, valores: unknown): ResultadoValidacao<T> {
  const resultado = schema.safeParse(valores);
  if (resultado.success) return { ok: true, data: resultado.data };
  return { ok: false, error: resultado.error.issues[0]?.message ?? "Confira os dados informados." };
}

/** Texto opcional: remove espaços e converte vazio em null (formato do banco). */
export function textoOpcional(max: number) {
  return z
    .string()
    .trim()
    .max(max, `Use no máximo ${max} caracteres.`)
    .nullish()
    .transform((valor) => (valor ? valor : null));
}

/** Valor monetário em reais (≥ 0, com teto de sanidade). */
export function dinheiro(mensagemNegativo: string) {
  return z
    .number({ error: "Informe um valor válido." })
    .min(0, mensagemNegativo)
    .max(1_000_000, "Valor alto demais: confira se digitou certo.");
}

/** Data de calendário YYYY-MM-DD válida. */
export const dataISO = z.iso.date({ error: "Informe uma data válida." });
