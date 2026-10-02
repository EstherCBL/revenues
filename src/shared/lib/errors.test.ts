import { describe, expect, it } from "vitest";
import {
  DomainError,
  assertOk,
  mensagemDeErro,
  traduzirErroSupabase,
  unwrap,
} from "@/shared/lib/errors";

describe("traduzirErroSupabase", () => {
  it("traduz códigos conhecidos do Postgres e do PostgREST", () => {
    expect(traduzirErroSupabase({ code: "23505", message: "duplicate key" })).toMatch(/já existe/i);
    expect(traduzirErroSupabase({ code: "23514", message: "check violation" })).toMatch(/fora do permitido/i);
    expect(traduzirErroSupabase({ code: "42501", message: "permission denied" })).toMatch(/permissão/i);
    expect(traduzirErroSupabase({ code: "PGRST205", message: "not found" })).toMatch(/migrations/i);
  });

  it("reconhece sessão expirada e falta de conexão pela mensagem", () => {
    expect(traduzirErroSupabase({ message: "JWT expired" })).toMatch(/sessão expirou/i);
    expect(traduzirErroSupabase({ message: "TypeError: Failed to fetch" })).toMatch(/sem conexão/i);
  });

  it("mantém a mensagem original quando não há tradução", () => {
    expect(traduzirErroSupabase({ code: "XX000", message: "algo específico" })).toBe("algo específico");
  });
});

describe("unwrap e assertOk", () => {
  it("unwrap devolve os dados quando não há erro", () => {
    expect(unwrap({ data: [1, 2], error: null })).toEqual([1, 2]);
  });

  it("unwrap lança DomainError com mensagem traduzida e guarda a causa", () => {
    const original = { code: "23503", message: "fk" };
    try {
      unwrap({ data: null, error: original });
      expect.unreachable();
    } catch (e) {
      expect(e).toBeInstanceOf(DomainError);
      expect((e as DomainError).message).toMatch(/ligado a outros dados/i);
      expect((e as DomainError).cause).toBe(original);
    }
  });

  it("assertOk só lança quando há erro", () => {
    expect(() => assertOk({ error: null })).not.toThrow();
    expect(() => assertOk({ error: { message: "x" } })).toThrow(DomainError);
  });
});

describe("mensagemDeErro", () => {
  it("usa a mensagem do DomainError, traduz Error comum e cai no fallback", () => {
    expect(mensagemDeErro(new DomainError("pronta"))).toBe("pronta");
    expect(mensagemDeErro(new Error("Failed to fetch"))).toMatch(/sem conexão/i);
    expect(mensagemDeErro("string solta", "fallback")).toBe("fallback");
  });
});
