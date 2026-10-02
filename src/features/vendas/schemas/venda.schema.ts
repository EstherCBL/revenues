import { z } from "zod";
import { dataISO, dinheiro, textoOpcional } from "@/shared/lib/validacao";

export const FORMAS_PAGAMENTO = ["pix", "dinheiro", "cartao", "outro"] as const;

/** Campos editáveis de uma venda (valor_total é coluna gerada pelo banco). */
export const vendaSchema = z.object({
  produto_id: z.uuid({ error: "Escolha um produto válido." }).nullable(),
  quantidade: z
    .number({ error: "Informe a quantidade." })
    .int("A quantidade deve ser um número inteiro.")
    .min(1, "A quantidade mínima é 1.")
    .max(100_000, "Quantidade alta demais: confira se digitou certo."),
  preco_unitario: dinheiro("O preço unitário não pode ser negativo."),
  data_venda: dataISO,
  forma_pagamento: z.enum(FORMAS_PAGAMENTO, { error: "Forma de pagamento inválida." }).nullable(),
  notas: textoOpcional(500),
});
