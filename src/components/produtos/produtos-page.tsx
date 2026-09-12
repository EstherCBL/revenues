"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence } from "motion/react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Produto } from "@/lib/types";
import { ProdutoForm, type ProdutoInput } from "@/components/produtos/produto-form";
import { ProdutoCard } from "@/components/produtos/produto-card";

export function ProdutosPage() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("produtos")
      .select("*")
      .order("ativo", { ascending: false })
      .order("nome", { ascending: true });
    setProdutos(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleAdd(values: ProdutoInput) {
    const supabase = createClient();
    await supabase.from("produtos").insert(values);
    await load();
  }

  async function handleSave(id: string, values: Partial<Produto>) {
    const supabase = createClient();
    await supabase.from("produtos").update(values).eq("id", id);
    await load();
  }

  async function handleToggleAtivo(id: string, ativo: boolean) {
    await handleSave(id, { ativo });
  }

  async function handleDelete(id: string) {
    const supabase = createClient();
    await supabase.from("produtos").delete().eq("id", id);
    await load();
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-foreground">Produtos</h1>
        <p className="text-sm text-muted-foreground">
          Cadastre seus doces com preço de venda e receita para consulta rápida.
        </p>
      </div>

      <Card>
        <CardHeader title="Novo produto" />
        <CardBody>
          <ProdutoForm onSubmit={handleAdd} />
        </CardBody>
      </Card>

      <div>
        <h2 className="mb-3 text-base font-semibold text-foreground">
          Cadastrados {produtos.length > 0 && `(${produtos.length})`}
        </h2>
        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} delay={i * 0.06} className="p-5">
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="mt-2 h-4 w-full" />
                <Skeleton className="mt-4 h-7 w-24" />
              </Card>
            ))}
          </div>
        ) : produtos.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum produto cadastrado ainda.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence initial={false} mode="popLayout">
              {produtos.map((produto) => (
                <ProdutoCard
                  key={produto.id}
                  produto={produto}
                  onSave={handleSave}
                  onToggleAtivo={handleToggleAtivo}
                  onDelete={handleDelete}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
