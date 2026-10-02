import { describe, expect, it } from "vitest";
import { periodoParaIntervalo } from "@/lib/period";

// 2026-10-02T01:30Z = 2026-10-01 22:30 em São Paulo
const agoraNoite = new Date("2026-10-02T01:30:00Z");

describe("periodoParaIntervalo", () => {
  it("'tudo' não filtra", () => {
    expect(periodoParaIntervalo("tudo", agoraNoite)).toBeNull();
  });

  it("'hoje' à noite continua sendo o dia local, não o do UTC", () => {
    expect(periodoParaIntervalo("hoje", agoraNoite)).toEqual({
      inicio: "2026-10-01",
      fim: "2026-10-01",
    });
  });

  it("'7dias' inclui hoje e os 6 dias anteriores", () => {
    expect(periodoParaIntervalo("7dias", agoraNoite)).toEqual({
      inicio: "2026-09-25",
      fim: "2026-10-01",
    });
  });

  it("'mes' começa no dia 1 do mês local (virada de mês às 22h)", () => {
    // 2026-11-01T01:00Z ainda é 31/10 em São Paulo
    expect(periodoParaIntervalo("mes", new Date("2026-11-01T01:00:00Z"))).toEqual({
      inicio: "2026-10-01",
      fim: "2026-10-31",
    });
  });
});
