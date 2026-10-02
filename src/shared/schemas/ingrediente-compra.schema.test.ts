import { describe, expect, it } from "vitest";
import { ingredienteCompraSchema } from "@/shared/schemas/ingrediente-compra.schema";
import { validar } from "@/shared/lib/validacao";

const valido = {
  nome: "  Chocolate 70%  ",
  local_compra: "",
  quantidade: 500,
  unidade: " g ",
  preco_pago: 12.9,
  data_compra: "2026-10-02",
  notas: null,
};

describe("ingredienteCompraSchema", () => {
  it("aceita dados válidos, limpa espaços e converte vazio em null", () => {
    const r = validar(ingredienteCompraSchema, valido);
    expect(r).toEqual({
      ok: true,
      data: { ...valido, nome: "Chocolate 70%", unidade: "g", local_compra: null, notas: null },
    });
  });

  it.each([
    [{ quantidade: 0 }, /maior que zero/i],
    [{ quantidade: NaN }, /informe a quantidade/i],
    [{ preco_pago: -1 }, /não pode ser negativo/i],
    [{ nome: "   " }, /nome do ingrediente/i],
    [{ unidade: "" }, /unidade/i],
    [{ data_compra: "2026-02-30" }, /data válida/i],
    [{ preco_pago: 5_000_000 }, /alto demais/i],
  ])("rejeita %j", (parcial, mensagem) => {
    const r = validar(ingredienteCompraSchema, { ...valido, ...parcial });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(mensagem);
  });

  it("descarta campos extras como id e created_at", () => {
    const r = validar(ingredienteCompraSchema, { ...valido, id: "x", created_at: "y" });
    expect(r.ok && "id" in r.data).toBe(false);
  });
});
