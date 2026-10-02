/**
 * Datas de negócio (venda, compra, pesquisa) são datas de calendário no fuso do
 * Brasil. Nunca use `new Date().toISOString().slice(0, 10)` para "hoje": isso é
 * UTC e, depois das 21h em São Paulo, já devolve o dia seguinte.
 */
export const FUSO_NEGOCIO = "America/Sao_Paulo";

const partesFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: FUSO_NEGOCIO,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** Data de hoje (YYYY-MM-DD) no fuso de São Paulo. `agora` existe para testes. */
export function hojeSP(agora: Date = new Date()): string {
  const partes = partesFormatter.formatToParts(agora);
  const get = (type: Intl.DateTimeFormatPartTypes) => partes.find((p) => p.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

/** Soma (ou subtrai) dias a uma data YYYY-MM-DD, só em aritmética de calendário. */
export function somarDias(dataISO: string, dias: number): string {
  const [ano, mes, dia] = dataISO.split("-").map(Number);
  return new Date(Date.UTC(ano, mes - 1, dia + dias)).toISOString().slice(0, 10);
}

/** Primeiro dia do mês de uma data YYYY-MM-DD. */
export function inicioDoMes(dataISO: string): string {
  return `${dataISO.slice(0, 7)}-01`;
}
