import { describe, expect, it } from "vitest";
import { arredondar2, calcularResumo, dividirFaturamento } from "@/features/dashboard/domain/resumo";

describe("calcularResumo", () => {
  it("calcula lucro bruto e margem", () => {
    expect(calcularResumo(200, 50)).toEqual({
      faturamento: 200,
      custoIngredientes: 50,
      lucroBruto: 150,
      margem: 75,
    });
  });

  it("margem é zero quando não há faturamento (sem dividir por zero)", () => {
    const r = calcularResumo(0, 30);
    expect(r.lucroBruto).toBe(-30);
    expect(r.margem).toBe(0);
  });

  it("mostra margem negativa quando o custo supera o faturamento", () => {
    expect(calcularResumo(100, 150).margem).toBe(-50);
  });

  it("não deixa erro de ponto flutuante no lucro", () => {
    expect(calcularResumo(0.3, 0.1).lucroBruto).toBe(0.2);
    expect(arredondar2(0.1 + 0.2)).toBe(0.3);
  });
});

describe("dividirFaturamento", () => {
  const padrao = { pct_investimento: 30, pct_ingredientes: 35, pct_pessoal: 35 };

  it("divide 200 em 60 / 70 / 70 com 30/35/35", () => {
    expect(dividirFaturamento(200, padrao)).toEqual({
      pct_investimento: 60,
      pct_ingredientes: 70,
      pct_pessoal: 70,
    });
  });

  it("a soma das partes é sempre o faturamento, centavo a centavo", () => {
    const casos = [100.01, 0.01, 33.33, 1234.56, 99.99];
    for (const faturamento of casos) {
      const d = dividirFaturamento(faturamento, { pct_investimento: 33.3, pct_ingredientes: 33.3, pct_pessoal: 33.4 });
      const soma = Math.round((d.pct_investimento + d.pct_ingredientes + d.pct_pessoal) * 100);
      expect(soma).toBe(Math.round(faturamento * 100));
    }
  });

  it("faturamento zero devolve tudo zero", () => {
    expect(dividirFaturamento(0, padrao)).toEqual({
      pct_investimento: 0,
      pct_ingredientes: 0,
      pct_pessoal: 0,
    });
  });
});
