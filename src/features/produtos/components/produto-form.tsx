"use client";

import { useState, type FormEvent } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input, Label, Textarea } from "@/shared/components/ui/field";
import type { Produto } from "@/shared/lib/types";
import { validar } from "@/shared/lib/validacao";
import { produtoSchema } from "@/features/produtos/schemas/produto.schema";

export type ProdutoInput = Pick<Produto, "nome" | "descricao" | "preco_venda" | "receita">;

export function ProdutoForm({ onSubmit }: { onSubmit: (values: ProdutoInput) => Promise<string | null> }) {
  const empty: ProdutoInput = { nome: "", descricao: "", preco_venda: 0, receita: "" };
  const [values, setValues] = useState<ProdutoInput>(empty);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const validado = validar(produtoSchema, values);
    if (!validado.ok) {
      setError(validado.error);
      return;
    }
    setSaving(true);
    const errorMessage = await onSubmit(validado.data);
    setSaving(false);
    if (errorMessage) {
      setError(`Não foi possível salvar: ${errorMessage}`);
      return;
    }
    setValues(empty);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="p-nome">Nome do produto</Label>
          <Input
            id="p-nome"
            required
            placeholder="Ex: Brookie tradicional"
            value={values.nome}
            onChange={(e) => setValues((v) => ({ ...v, nome: e.target.value }))}
          />
        </div>
        <div>
          <Label htmlFor="p-preco">Preço de venda (R$)</Label>
          <Input
            id="p-preco"
            type="number"
            min={0}
            step="0.01"
            required
            value={values.preco_venda || ""}
            onChange={(e) => setValues((v) => ({ ...v, preco_venda: Number(e.target.value) }))}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="p-descricao">Descrição</Label>
        <Input
          id="p-descricao"
          placeholder="Descrição curta do produto"
          value={values.descricao ?? ""}
          onChange={(e) => setValues((v) => ({ ...v, descricao: e.target.value }))}
        />
      </div>

      <div>
        <Label htmlFor="p-receita">Receita / ficha técnica</Label>
        <Textarea
          id="p-receita"
          placeholder="Ingredientes, modo de preparo, rendimento... (só para consulta)"
          value={values.receita ?? ""}
          onChange={(e) => setValues((v) => ({ ...v, receita: e.target.value }))}
        />
      </div>

      <div>
        <Button type="submit" disabled={saving}>
          {saving ? "Salvando..." : (<><Plus className="size-4" /> Cadastrar produto</>)}
        </Button>
      </div>

      {error && (
        <p className="rounded-lg bg-danger-bg px-3 py-2 text-sm text-danger">
          {error}
        </p>
      )}
    </form>
  );
}
