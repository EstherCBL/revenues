import { z } from "zod";
import { dinheiro, textoOpcional } from "@/shared/lib/validacao";

export const produtoSchema = z.object({
  nome: z.string().trim().min(1, "Informe o nome do produto.").max(120, "Nome muito longo."),
  descricao: textoOpcional(300),
  preco_venda: dinheiro("O preço de venda não pode ser negativo."),
  receita: textoOpcional(5000),
});
