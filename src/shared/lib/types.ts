export type IngredienteComprado = {
  id: string;
  nome: string;
  local_compra: string | null;
  quantidade: number;
  unidade: string;
  preco_pago: number;
  data_compra: string; // YYYY-MM-DD
  notas: string | null;
  created_at: string;
};

/** Dados para registrar uma compra de ingrediente (usado por ingredientes e por pesquisa de preços). */
export type IngredienteInput = Omit<IngredienteComprado, "id" | "created_at">;

export type PrecoPesquisado = {
  id: string;
  nome: string;
  local_pesquisa: string | null;
  quantidade: number;
  unidade: string;
  preco: number;
  data_pesquisa: string; // YYYY-MM-DD
  notas: string | null;
  created_at: string;
};

export type Produto = {
  id: string;
  nome: string;
  descricao: string | null;
  preco_venda: number;
  custo_estimado: number | null;
  receita: string | null;
  ativo: boolean;
  created_at: string;
};

export type FormaPagamento = "pix" | "dinheiro" | "cartao" | "outro";

export type Venda = {
  id: string;
  produto_id: string | null;
  quantidade: number;
  preco_unitario: number;
  valor_total: number;
  data_venda: string; // YYYY-MM-DD
  forma_pagamento: string | null;
  notas: string | null;
  created_at: string;
};

export type ConfigFinanceira = {
  id: number;
  pct_investimento: number;
  pct_ingredientes: number;
  pct_pessoal: number;
};

export type PeriodoFiltro = "hoje" | "7dias" | "mes" | "tudo";
