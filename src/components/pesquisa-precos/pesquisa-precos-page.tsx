"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence } from "motion/react";
import { Download } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { exportRowsToXlsx } from "@/lib/export-xlsx";
import { formatDateBR } from "@/lib/format";
import type { PrecoPesquisado } from "@/lib/types";
import type { IngredienteInput } from "@/components/ingredientes/ingrediente-form";
import { PrecoForm, type PrecoInput } from "@/components/pesquisa-precos/preco-form";
import { PrecoRow } from "@/components/pesquisa-precos/preco-row";
import { AdicionarCompraModal } from "@/components/pesquisa-precos/adicionar-compra-modal";

export function PesquisaPrecosPage() {
  const [items, setItems] = useState<PrecoPesquisado[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selecionado, setSelecionado] = useState<PrecoPesquisado | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("precos_pesquisados")
      .select("*")
      .order("nome", { ascending: true })
      .order("preco", { ascending: true });
    if (error) {
      setLoadError(error.message);
    } else {
      setLoadError(null);
      setItems(data ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const locaisSugeridos = useMemo(() => {
    const set = new Set<string>();
    items.forEach((i) => i.local_pesquisa && set.add(i.local_pesquisa));
    return Array.from(set).sort();
  }, [items]);

  const menorPrecoPorNome = useMemo(() => {
    const map = new Map<string, number>();
    for (const item of items) {
      const key = item.nome.trim().toLowerCase();
      const atual = map.get(key);
      if (atual === undefined || Number(item.preco) < atual) {
        map.set(key, Number(item.preco));
      }
    }
    return map;
  }, [items]);

  const contagemPorNome = useMemo(() => {
    const map = new Map<string, number>();
    for (const item of items) {
      const key = item.nome.trim().toLowerCase();
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    return map;
  }, [items]);

  async function handleAdd(values: PrecoInput) {
    const supabase = createClient();
    const { error } = await supabase.from("precos_pesquisados").insert(values);
    if (error) throw new Error(error.message);
    await load();
  }

  async function handleSave(id: string, values: Partial<PrecoPesquisado>) {
    const supabase = createClient();
    const { error } = await supabase.from("precos_pesquisados").update(values).eq("id", id);
    if (error) throw new Error(error.message);
    await load();
  }

  async function handleDelete(id: string) {
    const supabase = createClient();
    const { error } = await supabase.from("precos_pesquisados").delete().eq("id", id);
    if (error) throw new Error(error.message);
    await load();
  }

  async function handleConfirmAddToCompras(values: IngredienteInput) {
    const supabase = createClient();
    const { error } = await supabase.from("ingredientes_comprados").insert(values);
    if (error) throw new Error(error.message);
    setSelecionado(null);
  }

  async function handleExport() {
    const rows = items.map((i) => ({
      Data: formatDateBR(i.data_pesquisa),
      Ingrediente: i.nome,
      "Onde viu": i.local_pesquisa ?? "",
      Quantidade: i.quantidade,
      Unidade: i.unidade,
      "Preço visto (R$)": Number(i.preco),
      Notas: i.notas ?? "",
    }));
    await exportRowsToXlsx(rows, "pesquisa-de-precos.xlsx", "Pesquisa de preços");
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-foreground">Pesquisa de preços</h1>
          <p className="text-sm text-muted-foreground">
            Compare preços que você encontrou antes de comprar. {items.length} registro{items.length === 1 ? "" : "s"}.
          </p>
        </div>
        <Button variant="secondary" onClick={handleExport} disabled={items.length === 0}>
          <Download className="size-4" />
          Exportar .xlsx
        </Button>
      </div>

      {loadError && (
        <p className="rounded-lg bg-danger-bg px-3 py-2 text-sm text-danger">
          Não foi possível carregar o histórico: {loadError}
        </p>
      )}

      <Card>
        <CardHeader title="Registrar preço pesquisado" />
        <CardBody>
          <PrecoForm locaisSugeridos={locaisSugeridos} onSubmit={handleAdd} />
        </CardBody>
      </Card>

      <Card delay={0.1} className="overflow-hidden">
        <CardHeader
          title="Histórico"
          subtitle="Agrupado por ingrediente, do mais barato para o mais caro — use o botão de pacote para lançar direto como compra"
        />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-left">
            <thead>
              <tr className="border-b border-border-strong bg-surface-hover/60 text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3 font-medium">Data</th>
                <th className="px-4 py-3 font-medium">Ingrediente</th>
                <th className="px-4 py-3 font-medium">Onde viu</th>
                <th className="px-4 py-3 font-medium">Quantidade</th>
                <th className="px-4 py-3 font-medium">Preço</th>
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
                    {items.map((item) => {
                      const key = item.nome.trim().toLowerCase();
                      const isMelhorPreco =
                        (contagemPorNome.get(key) ?? 0) > 1 &&
                        Number(item.preco) === menorPrecoPorNome.get(key);
                      return (
                        <PrecoRow
                          key={item.id}
                          item={item}
                          isMelhorPreco={isMelhorPreco}
                          onSave={handleSave}
                          onDelete={handleDelete}
                          onAddToCompras={setSelecionado}
                        />
                      );
                    })}
                  </AnimatePresence>
                )}
            </tbody>
          </table>
          {!loading && items.length === 0 && (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground">
              Nenhuma pesquisa de preço registrada ainda.
            </p>
          )}
        </div>
      </Card>

      <AdicionarCompraModal
        preco={selecionado}
        onClose={() => setSelecionado(null)}
        onConfirm={handleConfirmAddToCompras}
      />
    </div>
  );
}
