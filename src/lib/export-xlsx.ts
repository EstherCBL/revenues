/**
 * Exporta uma lista de objetos simples para um arquivo .xlsx baixado no navegador.
 * `rows` deve conter apenas dados ja formatados para exibicao (chaves = cabecalhos das colunas).
 * A biblioteca xlsx (~700KB) so e carregada quando esta funcao e chamada.
 */
export async function exportRowsToXlsx(
  rows: Record<string, string | number>[],
  filename: string,
  sheetName = "Dados"
) {
  const XLSX = await import("xlsx");
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, filename.endsWith(".xlsx") ? filename : `${filename}.xlsx`);
}
