import type { RenderEditCellProps } from "react-data-grid";
import type { Produto } from "@/lib/types";
import type { VendaRow } from "@/components/vendas/vendas-page";

const FORMAS_PAGAMENTO = [
  { value: "pix", label: "Pix" },
  { value: "dinheiro", label: "Dinheiro" },
  { value: "cartao", label: "Cartão" },
  { value: "outro", label: "Outro" },
];

export function makeProdutoEditor(produtos: Produto[]) {
  return function ProdutoEditor({ row, onRowChange, onClose }: RenderEditCellProps<VendaRow>) {
    return (
      <select
        autoFocus
        className="h-full w-full border-0 bg-surface px-2 text-sm text-foreground outline-none"
        value={row.produto_id ?? ""}
        onChange={(e) => {
          const produto = produtos.find((p) => p.id === e.target.value);
          onRowChange(
            {
              ...row,
              produto_id: e.target.value || null,
              preco_unitario: produto ? Number(produto.preco_venda) : row.preco_unitario,
            },
            true
          );
        }}
        onBlur={() => onClose(false)}
      >
        <option value="">Selecione...</option>
        {produtos.map((p) => (
          <option key={p.id} value={p.id}>
            {p.nome}
          </option>
        ))}
      </select>
    );
  };
}

export function FormaPagamentoEditor({ row, onRowChange, onClose }: RenderEditCellProps<VendaRow>) {
  return (
    <select
      autoFocus
      className="h-full w-full border-0 bg-surface px-2 text-sm text-foreground outline-none"
      value={row.forma_pagamento ?? ""}
      onChange={(e) => onRowChange({ ...row, forma_pagamento: e.target.value || null }, true)}
      onBlur={() => onClose(false)}
    >
      <option value="">—</option>
      {FORMAS_PAGAMENTO.map((f) => (
        <option key={f.value} value={f.value}>
          {f.label}
        </option>
      ))}
    </select>
  );
}

export function makeNumberEditor(field: "quantidade" | "preco_unitario") {
  return function NumberEditor({ row, onRowChange, onClose }: RenderEditCellProps<VendaRow>) {
    return (
      <input
        type="number"
        min={0}
        step={field === "quantidade" ? 1 : 0.01}
        autoFocus
        className="h-full w-full border-0 bg-surface px-2 text-sm tabular text-foreground outline-none"
        value={row[field]}
        onChange={(e) => onRowChange({ ...row, [field]: Number(e.target.value) })}
        onBlur={() => onClose(true)}
      />
    );
  };
}

export function DataVendaEditor({ row, onRowChange, onClose }: RenderEditCellProps<VendaRow>) {
  return (
    <input
      type="date"
      autoFocus
      className="h-full w-full border-0 bg-surface px-2 text-sm text-foreground outline-none"
      value={row.data_venda}
      onChange={(e) => onRowChange({ ...row, data_venda: e.target.value })}
      onBlur={() => onClose(true)}
    />
  );
}

export function formaPagamentoLabel(value: string | null): string {
  return FORMAS_PAGAMENTO.find((f) => f.value === value)?.label ?? "—";
}
