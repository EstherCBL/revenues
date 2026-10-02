import { z } from "zod";
import { dataISO, dinheiro, textoOpcional } from "@/shared/lib/validacao";

/**
 * Compra de ingrediente. Fica em shared porque é usado por duas features:
 * ingredientes (registrar/editar) e precos (lançar uma pesquisa como compra).
 */
export const ingredienteCompraSchema = z.object({
  nome: z.string().trim().min(1, "Informe o nome do ingrediente.").max(120, "Nome muito longo."),
  local_compra: textoOpcional(120),
  quantidade: z
    .number({ error: "Informe a quantidade." })
    .positive("A quantidade deve ser maior que zero.")
    .max(1_000_000, "Quantidade alta demais: confira se digitou certo."),
  unidade: z.string().trim().min(1, "Informe a unidade.").max(10, "Unidade muito longa."),
  preco_pago: dinheiro("O valor pago não pode ser negativo."),
  data_compra: dataISO,
  notas: textoOpcional(500),
});
