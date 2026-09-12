"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import type { Column, RowsChangeData } from "react-data-grid";
import { Plus, Download, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { periodoParaIntervalo } from "@/lib/period";
import { exportRowsToXlsx } from "@/lib/export-xlsx";
import { formatBRL, formatDateBR, todayISO } from "@/lib/format";
import type { Produto, Venda, PeriodoFiltro } from "@/lib/types";
import { PeriodFilter } from "@/components/dashboard/period-filter";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  makeProdutoEditor,
  makeNumberEditor,
  FormaPagamentoEditor,
  DataVendaEditor,
  formaPagamentoLabel,
} from "@/components/vendas/editors";

const VendasGridInner = dynamic(() => import("./vendas-grid-inner"), {
  ssr: false,
  loading: () => <Skeleton className="h-[420px] w-full" />,
});

export type VendaRow = Venda;

export function VendasPage() {
  const [rows, setRows] = useState<VendaRow[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [periodo, setPeriodo] = useState<PeriodoFiltro>("mes");
  const [loading, setLoading] = useState(true);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const intervalo = periodoParaIntervalo(periodo);

    let vendasQuery = supabase.from("vendas").select("*").order("data_venda", { ascending: false }).order("created_at", { ascending: false });
    if (intervalo) {
      vendasQuery = vendasQuery.gte("data_venda", intervalo.inicio).lte("data_venda", intervalo.fim);
    }

    const [{ data: vendas }, { data: produtosData }] = await Promise.all([
      vendasQuery,
      supabase.from("produtos").select("*").order("nome"),
    ]);

    setRows(vendas ?? []);
    setProdutos(produtosData ?? []);
    setLoading(false);
    setHasLoadedOnce(true);
  }, [periodo]);

  useEffect(() => {
    load();
  }, [load]);

  const produtosAtivos = useMemo(() => produtos.filter((p) => p.ativo), [produtos]);
  const produtoNomeById = useMemo(() => {
    const map = new Map<string, string>();
    produtos.forEach((p) => map.set(p.id, p.nome));
    return map;
  }, [produtos]);

  async function persistRow(row: VendaRow) {
    const supabase = createClient();
    const payload = {
      produto_id: row.produto_id,
      quantidade: row.quantidade,
      preco_unitario: row.preco_unitario,
      data_venda: row.data_venda,
      forma_pagamento: row.forma_pagamento,
      notas: row.notas,
    };
    await supabase.from("vendas").update(payload).eq("id", row.id);
  }

  function handleRowsChange(newRows: VendaRow[], data: RowsChangeData<VendaRow>) {
    const idx = data.indexes[0];
    const changed = newRows[idx];
    const withTotal = {
      ...changed,
      valor_total: Number(changed.quantidade) * Number(changed.preco_unitario),
    };
    const finalRows = newRows.map((r, i) => (i === idx ? withTotal : r));
    setRows(finalRows);
    persistRow(withTotal);
  }

  async function handleAddRow() {
    const supabase = createClient();
    const primeiro = produtosAtivos[0];
    const novaVenda = {
      produto_id: primeiro?.id ?? null,
      quantidade: 1,
      preco_unitario: primeiro ? Number(primeiro.preco_venda) : 0,
      data_venda: todayISO(),
      forma_pagamento: "pix",
      notas: "",
    };
    const { data, error } = await supabase.from("vendas").insert(novaVenda).select().single();
    if (!error && data) {
      setRows((prev) => [data, ...prev]);
    }
  }

  async function handleDeleteRow(id: string) {
    if (!confirm("Excluir esta venda?")) return;
    const supabase = createClient();
    await supabase.from("vendas").delete().eq("id", id);
    setRows((prev) => prev.filter((r) => r.id !== id));
  }

  const totalPeriodo = useMemo(() => rows.reduce((acc, r) => acc + Number(r.valor_total), 0), [rows]);

  const columns = useMemo<Column<VendaRow>[]>(
    () => [
      {
        key: "data_venda",
        name: "Data",
        width: 130,
        editable: true,
        renderEditCell: DataVendaEditor,
        renderCell: ({ row }) => formatDateBR(row.data_venda),
      },
      {
        key: "produto_id",
        name: "Produto",
        width: 200,
        editable: true,
        renderEditCell: makeProdutoEditor(produtosAtivos),
        renderCell: ({ row }) =>
          row.produto_id ? produtoNomeById.get(row.produto_id) ?? "Produto removido" : "—",
      },
      {
        key: "quantidade",
        name: "Qtd.",
        width: 80,
        editable: true,
        renderEditCell: makeNumberEditor("quantidade"),
        renderCell: ({ row }) => <span className="tabular">{row.quantidade}</span>,
      },
      {
        key: "preco_unitario",
        name: "Preço unit.",
        width: 120,
        editable: true,
        renderEditCell: makeNumberEditor("preco_unitario"),
        renderCell: ({ row }) => <span className="tabular">{formatBRL(row.preco_unitario)}</span>,
      },
      {
        key: "valor_total",
        name: "Valor total",
        width: 130,
        renderCell: ({ row }) => (
          <span className="tabular font-medium">{formatBRL(row.valor_total)}</span>
        ),
      },
      {
        key: "forma_pagamento",
        name: "Pagamento",
        width: 130,
        editable: true,
        renderEditCell: FormaPagamentoEditor,
        renderCell: ({ row }) => formaPagamentoLabel(row.forma_pagamento),
      },
      {
        key: "notas",
        name: "Notas",
        width: 200,
        editable: true,
        renderCell: ({ row }) => row.notas || "",
      },
      {
        key: "actions",
        name: "",
        width: 50,
        renderCell: ({ row }) => (
          <button
            onClick={() => handleDeleteRow(row.id)}
            className="flex h-full w-full items-center justify-center text-muted-foreground transition-colors hover:text-danger"
            title="Excluir venda"
          >
            <Trash2 className="size-4" />
          </button>
        ),
      },
    ],
    [produtosAtivos, produtoNomeById]
  );

  async function handleExport() {
    const exportRows = rows.map((r) => ({
      Data: formatDateBR(r.data_venda),
      Produto: r.produto_id ? produtoNomeById.get(r.produto_id) ?? "" : "",
      Quantidade: r.quantidade,
      "Preço unitário (R$)": Number(r.preco_unitario),
      "Valor total (R$)": Number(r.valor_total),
      Pagamento: formaPagamentoLabel(r.forma_pagamento),
      Notas: r.notas ?? "",
    }));
    await exportRowsToXlsx(exportRows, "vendas.xlsx", "Vendas");
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-foreground">Vendidos</h1>
          <p className="text-sm text-muted-foreground">
            {rows.length} venda{rows.length === 1 ? "" : "s"} · Total: {formatBRL(totalPeriodo)}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <PeriodFilter value={periodo} onChange={setPeriodo} groupId="vendas-period-pill" />
          <Button onClick={handleAddRow}>
            <Plus className="size-4" />
            Nova venda
          </Button>
          <Button variant="secondary" onClick={handleExport} disabled={rows.length === 0}>
            <Download className="size-4" />
            Exportar .xlsx
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden">
        <CardHeader
          title="Planilha de vendas"
          subtitle="Clique numa célula para editar direto na grade"
        />
        <div className="overflow-x-auto p-2">
          {produtos.length === 0 && !loading && (
            <p className="px-3 py-4 text-sm text-muted-foreground">
              Cadastre um produto antes de lançar vendas.
            </p>
          )}
          {loading && !hasLoadedOnce ? (
            <Skeleton className="h-[420px] w-full" />
          ) : (
            <VendasGridInner columns={columns} rows={rows} onRowsChange={handleRowsChange} />
          )}
        </div>
      </Card>
    </div>
  );
}
