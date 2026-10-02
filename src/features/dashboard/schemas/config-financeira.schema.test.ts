import { describe, expect, it } from "vitest";
import { configFinanceiraSchema } from "@/features/dashboard/schemas/config-financeira.schema";
import { validar } from "@/shared/lib/validacao";

describe("configFinanceiraSchema", () => {
  it("aceita percentuais que somam 100", () => {
    expect(validar(configFinanceiraSchema, { pct_investimento: 30, pct_ingredientes: 35, pct_pessoal: 35 }).ok).toBe(true);
    expect(validar(configFinanceiraSchema, { pct_investimento: 33.3, pct_ingredientes: 33.3, pct_pessoal: 33.4 }).ok).toBe(true);
  });

  it("rejeita soma diferente de 100, negativos e acima de 100", () => {
    const soma = validar(configFinanceiraSchema, { pct_investimento: 30, pct_ingredientes: 30, pct_pessoal: 30 });
    expect(!soma.ok && soma.error).toMatch(/somar exatamente 100/i);

    const negativo = validar(configFinanceiraSchema, { pct_investimento: -10, pct_ingredientes: 60, pct_pessoal: 50 });
    expect(!negativo.ok && negativo.error).toMatch(/negativo/i);

    const alto = validar(configFinanceiraSchema, { pct_investimento: 120, pct_ingredientes: 0, pct_pessoal: -20 });
    expect(alto.ok).toBe(false);
  });
});
