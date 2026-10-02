import { describe, expect, it } from "vitest";
import { vendaSchema } from "@/features/vendas/schemas/venda.schema";
import { validar } from "@/shared/lib/validacao";

const valida = {
  produto_id: "3f2b6c1e-8d4a-4b7e-9c11-2a5d6e7f8091",
  quantidade: 2,
  preco_unitario: 9.5,
  data_venda: "2026-10-01",
  forma_pagamento: "pix",
  notas: "",
};

describe("vendaSchema", () => {
  it("aceita uma venda válida e converte notas vazias em null", () => {
    const r = validar(vendaSchema, valida);
    expect(r).toEqual({ ok: true, data: { ...valida, notas: null } });
  });

  it("aceita venda sem produto (produto removido) e sem forma de pagamento", () => {
    expect(validar(vendaSchema, { ...valida, produto_id: null, forma_pagamento: null }).ok).toBe(true);
  });

  it.each([
    [{ quantidade: 0 }, /mínima é 1/i],
    [{ quantidade: 1.5 }, /inteiro/i],
    [{ preco_unitario: -0.01 }, /negativo/i],
    [{ forma_pagamento: "boleto" }, /forma de pagamento/i],
    [{ data_venda: "01/10/2026" }, /data válida/i],
    [{ produto_id: "nao-e-uuid" }, /produto válido/i],
  ])("rejeita %j", (parcial, mensagem) => {
    const r = validar(vendaSchema, { ...valida, ...parcial });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(mensagem);
  });
});
