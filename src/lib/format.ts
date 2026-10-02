import { hojeSP } from "@/lib/datas";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const numberFormatter = new Intl.NumberFormat("pt-BR");

export function formatBRL(value: number | null | undefined): string {
  return currencyFormatter.format(value ?? 0);
}

export function formatNumber(value: number | null | undefined): string {
  return numberFormatter.format(value ?? 0);
}

export function formatPercent(value: number | null | undefined, digits = 1): string {
  const v = value ?? 0;
  return `${v.toLocaleString("pt-BR", { minimumFractionDigits: digits, maximumFractionDigits: digits })}%`;
}

/** Formata uma data no formato YYYY-MM-DD (vinda do banco) para dd/mm/aaaa sem deslocamento de fuso. */
export function formatDateBR(isoDate: string | null | undefined): string {
  if (!isoDate) return "";
  const datePart = isoDate.slice(0, 10);
  const [year, month, day] = datePart.split("-");
  if (!year || !month || !day) return isoDate;
  return `${day}/${month}/${year}`;
}

/** Data de hoje (YYYY-MM-DD) no fuso de São Paulo. */
export function todayISO(): string {
  return hojeSP();
}
