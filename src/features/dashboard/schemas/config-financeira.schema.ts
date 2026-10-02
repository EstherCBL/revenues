import { z } from "zod";

const percentual = z
  .number({ error: "Informe um percentual." })
  .min(0, "Nenhum percentual pode ser negativo.")
  .max(100, "Nenhum percentual pode passar de 100%.");

export const configFinanceiraSchema = z
  .object({
    pct_investimento: percentual,
    pct_ingredientes: percentual,
    pct_pessoal: percentual,
  })
  .refine(
    (c) => Math.abs(c.pct_investimento + c.pct_ingredientes + c.pct_pessoal - 100) < 0.001,
    { error: "Os três percentuais precisam somar exatamente 100%." }
  );
