import type { PeriodoFiltro } from "@/lib/types";

/** Retorna [inicioISO, fimISO] (inclusive) em UTC para o periodo selecionado, ou null para "tudo". */
export function periodoParaIntervalo(periodo: PeriodoFiltro): { inicio: string; fim: string } | null {
  const hoje = new Date();
  const fimISO = hoje.toISOString().slice(0, 10);

  if (periodo === "tudo") return null;

  if (periodo === "hoje") {
    return { inicio: fimISO, fim: fimISO };
  }

  if (periodo === "7dias") {
    const inicio = new Date(hoje);
    inicio.setUTCDate(inicio.getUTCDate() - 6);
    return { inicio: inicio.toISOString().slice(0, 10), fim: fimISO };
  }

  // mes atual
  const inicioMes = new Date(Date.UTC(hoje.getUTCFullYear(), hoje.getUTCMonth(), 1));
  return { inicio: inicioMes.toISOString().slice(0, 10), fim: fimISO };
}

export const PERIODO_LABELS: Record<PeriodoFiltro, string> = {
  hoje: "Hoje",
  "7dias": "Últimos 7 dias",
  mes: "Mês atual",
  tudo: "Tudo",
};
