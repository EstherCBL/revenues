import type { ConfigFinanceira } from "@/shared/lib/types";

/** Arredonda para centavos (evita 0,1 + 0,2 = 0,30000000000000004 na tela). */
export function arredondar2(valor: number): number {
  return Math.round(valor * 100) / 100;
}

export type Resumo = {
  faturamento: number;
  custoIngredientes: number;
  lucroBruto: number;
  /** (faturamento - custo) / faturamento, em %. Zero quando não há faturamento. */
  margem: number;
};

export function calcularResumo(faturamento: number, custoIngredientes: number): Resumo {
  const lucroBruto = arredondar2(faturamento - custoIngredientes);
  const margem = faturamento > 0 ? (lucroBruto / faturamento) * 100 : 0;
  return { faturamento, custoIngredientes, lucroBruto, margem };
}

export type Divisao = Record<"pct_investimento" | "pct_ingredientes" | "pct_pessoal", number>;

/**
 * Divide o faturamento do período pelos percentuais configurados. A conta é feita
 * em centavos e o "uso pessoal" fica com o resto, então a soma das três partes é
 * sempre exatamente o faturamento (sem sobrar nem faltar centavo).
 */
export function dividirFaturamento(
  faturamento: number,
  config: Pick<ConfigFinanceira, "pct_investimento" | "pct_ingredientes" | "pct_pessoal">
): Divisao {
  const totalCentavos = Math.round(faturamento * 100);
  const investimento = Math.round((totalCentavos * config.pct_investimento) / 100);
  const ingredientes = Math.round((totalCentavos * config.pct_ingredientes) / 100);
  const pessoal = totalCentavos - investimento - ingredientes;
  return {
    pct_investimento: investimento / 100,
    pct_ingredientes: ingredientes / 100,
    pct_pessoal: pessoal / 100,
  };
}
