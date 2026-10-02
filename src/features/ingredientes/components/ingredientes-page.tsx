"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence } from "motion/react";
import { Download } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardHeader, CardBody } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { exportRowsToXlsx } from "@/shared/lib/export-xlsx";
import { formatBRL, formatDateBR } from "@/shared/lib/format";
import type { IngredienteComprado, IngredienteInput } from "@/shared/lib/types";
import { IngredienteForm } from "@/features/ingredientes/components/ingrediente-form";
import { IngredienteRow } from "@/features/ingredientes/components/ingrediente-row";

export function IngredientesPage() {
  const [items, setItems] = useState<IngredienteComprado[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("ingredientes_comprados")
      .select("*")
      .order("data_compra", { ascending: false })
      .order("created_at", { ascending: false });
    setItems(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const locaisSugeridos = useMemo(() => {
    const set = new Set<string>();
    items.forEach((i) => i.local_compra && set.add(i.local_compra));
    return Array.from(set).sort();
  }, [items]);

  const totalGasto = useMemo(() => items.reduce((acc, i) => acc + Number(i.preco_pago), 0), [items]);

  async function handleAdd(values: IngredienteInput): Promise<string | null> {
    const supabase = createClient();
    const { error } = await supabase.from("ingredientes_comprados").insert(values);
    if (error) return error.message;
    await load();
    return null;
  }

  async function handleSave(id: string, values: Partial<IngredienteComprado>) {
    const supabase = createClient();
    await supabase.from("ingredientes_comprados").update(values).eq("id", id);
    await load();
  }

  async function handleDelete(id: string) {
    const supabase = createClient();
    await supabase.from("ingredientes_comprados").delete().eq("id", id);
    await load();
  }

  async function handleExport() {
    const rows = items.map((i) => ({
      Data: formatDateBR(i.data_compra),
      Ingrediente: i.nome,
      "Local de compra": i.local_compra ?? "",
      Quantidade: i.quantidade,
      Unidade: i.unidade,
      "Valor pago (R$)": Number(i.preco_pago),
      Notas: i.notas ?? "",
    }));
    await exportRowsToXlsx(rows, "ingredientes-comprados.xlsx", "Ingredientes");
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-foreground">Ingredientes comprados</h1>
          <p className="text-sm text-muted-foreground">
            {items.length} compra{items.length === 1 ? "" : "s"} registrada{items.length === 1 ? "" : "s"} · Total gasto: {formatBRL(totalGasto)}
          </p>
        </div>
        <Button variant="secondary" onClick={handleExport} disabled={items.length === 0}>
          <Download className="size-4" />
          Exportar .xlsx
        </Button>
      </div>

      <Card>
        <CardHeader title="Registrar nova compra" />
        <CardBody>
          <IngredienteForm locaisSugeridos={locaisSugeridos} onSubmit={handleAdd} />
        </CardBody>
      </Card>

      <Card delay={0.1} className="overflow-hidden">
        <CardHeader title="Histórico" subtitle="Mais recentes primeiro" />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] border-collapse text-left">
            <thead>
              <tr className="border-b border-border-strong bg-surface-hover/60 text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3 font-medium">Data</th>
                <th className="px-4 py-3 font-medium">Ingrediente</th>
                <th className="px-4 py-3 font-medium">Local</th>
                <th className="px-4 py-3 font-medium">Quantidade</th>
                <th className="px-4 py-3 font-medium">Valor pago</th>
                <th className="px-4 py-3 font-medium">Notas</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i} className="border-b border-border last:border-0">
                      {Array.from({ length: 7 }).map((_, j) => (
                        <td key={j} className="px-4 py-3">
                          <Skeleton className="h-4 w-full max-w-24" />
                        </td>
                      ))}
                    </tr>
                  ))
                : (
                  <AnimatePresence initial={false} mode="popLayout">
                    {items.map((item) => (
                      <IngredienteRow key={item.id} item={item} onSave={handleSave} onDelete={handleDelete} />
                    ))}
                  </AnimatePresence>
                )}
            </tbody>
          </table>
          {!loading && items.length === 0 && (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground">
              Nenhuma compra registrada ainda.
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}
