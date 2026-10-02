"use client";

import { DataGrid, type Column, type RowsChangeData } from "react-data-grid";
import "react-data-grid/lib/styles.css";
import type { VendaRow } from "@/features/vendas/types";

export default function VendasGridInner({
  columns,
  rows,
  onRowsChange,
}: {
  columns: Column<VendaRow>[];
  rows: VendaRow[];
  onRowsChange: (rows: VendaRow[], data: RowsChangeData<VendaRow>) => void;
}) {
  return (
    <DataGrid
      columns={columns}
      rows={rows}
      onRowsChange={onRowsChange}
      rowKeyGetter={(row: VendaRow) => row.id}
      style={{ minHeight: 420, height: "calc(100vh - 380px)" }}
      rowHeight={40}
    />
  );
}
