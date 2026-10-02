/**
 * Neutraliza injeção de fórmula (CSV/Excel injection): textos que começam com
 * =, +, -, @, tab ou CR seriam interpretados como fórmula ao abrir a planilha.
 * O apóstrofo inicial força o Excel a tratar a célula como texto.
 */
export function sanitizarCelula(valor: string | number): string | number {
  if (typeof valor !== "string") return valor;
  return /^[=+\-@\t\r]/.test(valor) ? `'${valor}` : valor;
}

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
  const seguras = rows.map((row) =>
    Object.fromEntries(Object.entries(row).map(([chave, valor]) => [chave, sanitizarCelula(valor)]))
  );
  const XLSX = await import("xlsx");
  const worksheet = XLSX.utils.json_to_sheet(seguras);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, filename.endsWith(".xlsx") ? filename : `${filename}.xlsx`);
}
