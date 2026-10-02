import { describe, expect, it } from "vitest";
import { sanitizarCelula } from "@/lib/export-xlsx";

describe("sanitizarCelula", () => {
  it.each(["=1+1", "+cmd", "-2+3", "@SUM(A1)", "\tfoo", "\rfoo"])(
    "prefixa apóstrofo em texto que parece fórmula: %j",
    (valor) => {
      expect(sanitizarCelula(valor)).toBe(`'${valor}`);
    }
  );

  it("não altera texto comum, vazio ou números", () => {
    expect(sanitizarCelula("Brookie de chocolate")).toBe("Brookie de chocolate");
    expect(sanitizarCelula("")).toBe("");
    expect(sanitizarCelula(-12.5)).toBe(-12.5);
  });
});
