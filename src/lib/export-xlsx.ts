import * as XLSX from "xlsx";

/**
 * Exporta uma lista de objetos simples para um arquivo .xlsx baixado no navegador.
 * `rows` deve conter apenas dados ja formatados para exibicao (chaves = cabecalhos das colunas).
 */
export function exportRowsToXlsx(
  rows: Record<string, string | number>[],
  filename: string,
  sheetName = "Dados"
) {
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, filename.endsWith(".xlsx") ? filename : `${filename}.xlsx`);
}
