import type { PeriodoFiltro } from "@/shared/lib/types";
import { hojeSP, inicioDoMes, somarDias } from "@/shared/lib/datas";

/**
 * Retorna { inicio, fim } (YYYY-MM-DD, inclusivos, fuso de São Paulo) para o
 * período selecionado, ou null para "tudo". `agora` existe para testes.
 */
export function periodoParaIntervalo(
  periodo: PeriodoFiltro,
  agora: Date = new Date()
): { inicio: string; fim: string } | null {
  if (periodo === "tudo") return null;

  const fim = hojeSP(agora);

  if (periodo === "hoje") return { inicio: fim, fim };
  if (periodo === "7dias") return { inicio: somarDias(fim, -6), fim };

  // mês atual
  return { inicio: inicioDoMes(fim), fim };
}

export const PERIODO_LABELS: Record<PeriodoFiltro, string> = {
  hoje: "Hoje",
  "7dias": "Últimos 7 dias",
  mes: "Mês atual",
  tudo: "Tudo",
};
