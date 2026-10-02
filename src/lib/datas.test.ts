import { describe, expect, it } from "vitest";
import { hojeSP, inicioDoMes, somarDias } from "@/lib/datas";

describe("hojeSP", () => {
  it("às 22h30 em São Paulo ainda é o dia anterior ao UTC", () => {
    // 2026-10-02T01:30Z = 2026-10-01 22:30 em São Paulo (UTC-3)
    expect(hojeSP(new Date("2026-10-02T01:30:00Z"))).toBe("2026-10-01");
  });

  it("respeita a fronteira da meia-noite local (03:00 UTC)", () => {
    expect(hojeSP(new Date("2026-10-01T02:59:59Z"))).toBe("2026-09-30");
    expect(hojeSP(new Date("2026-10-01T03:00:00Z"))).toBe("2026-10-01");
  });

  it("na virada de mês e de ano usa a data local", () => {
    expect(hojeSP(new Date("2026-11-01T01:00:00Z"))).toBe("2026-10-31");
    expect(hojeSP(new Date("2027-01-01T01:00:00Z"))).toBe("2026-12-31");
  });

  it("durante o dia local coincide com o UTC", () => {
    expect(hojeSP(new Date("2026-10-02T15:00:00Z"))).toBe("2026-10-02");
  });
});

describe("somarDias", () => {
  it("atravessa mês, ano e fevereiro", () => {
    expect(somarDias("2026-03-03", -6)).toBe("2026-02-25");
    expect(somarDias("2027-01-02", -6)).toBe("2026-12-27");
    expect(somarDias("2028-03-01", -1)).toBe("2028-02-29");
  });
});

describe("inicioDoMes", () => {
  it("devolve o dia 1 do mesmo mês", () => {
    expect(inicioDoMes("2026-10-31")).toBe("2026-10-01");
  });
});
