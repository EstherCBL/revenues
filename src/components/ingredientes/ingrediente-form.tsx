"use client";

import { useState, type FormEvent } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/field";
import { todayISO } from "@/lib/format";
import type { IngredienteComprado } from "@/lib/types";

export type IngredienteInput = Omit<IngredienteComprado, "id" | "created_at">;

const UNIDADES = ["g", "kg", "ml", "l", "un"];

export function IngredienteForm({
  locaisSugeridos,
  onSubmit,
}: {
  locaisSugeridos: string[];
  onSubmit: (values: IngredienteInput) => Promise<string | null>;
}) {
  const empty: IngredienteInput = {
    nome: "",
    local_compra: "",
    quantidade: 0,
    unidade: "g",
    preco_pago: 0,
    data_compra: todayISO(),
    notas: "",
  };
  const [values, setValues] = useState<IngredienteInput>(empty);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const errorMessage = await onSubmit(values);
    setSaving(false);
    if (errorMessage) {
      setError(errorMessage);
      return;
    }
    setValues({ ...empty, data_compra: todayISO() });
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
      <div className="lg:col-span-2">
        <Label htmlFor="nome">Ingrediente</Label>
        <Input
          id="nome"
          required
          placeholder="Ex: Chocolate 70%"
          value={values.nome}
          onChange={(e) => setValues((v) => ({ ...v, nome: e.target.value }))}
        />
      </div>

      <div className="lg:col-span-2">
        <Label htmlFor="local">Local de compra</Label>
        <Input
          id="local"
          list="locais-sugeridos"
          placeholder="Ex: Assai Anápolis"
          value={values.local_compra ?? ""}
          onChange={(e) => setValues((v) => ({ ...v, local_compra: e.target.value }))}
        />
        <datalist id="locais-sugeridos">
          {locaisSugeridos.map((l) => (
            <option key={l} value={l} />
          ))}
        </datalist>
      </div>

      <div>
        <Label htmlFor="quantidade">Quantidade</Label>
        <Input
          id="quantidade"
          type="number"
          min={0}
          step="any"
          required
          value={values.quantidade || ""}
          onChange={(e) => setValues((v) => ({ ...v, quantidade: Number(e.target.value) }))}
        />
      </div>

      <div>
        <Label htmlFor="unidade">Unidade</Label>
        <Input id="unidade" list="unidades-sugeridas" required value={values.unidade}
          onChange={(e) => setValues((v) => ({ ...v, unidade: e.target.value }))}
        />
        <datalist id="unidades-sugeridas">
          {UNIDADES.map((u) => (
            <option key={u} value={u} />
          ))}
        </datalist>
      </div>

      <div>
        <Label htmlFor="preco">Valor pago (R$)</Label>
        <Input
          id="preco"
          type="number"
          min={0}
          step="0.01"
          required
          value={values.preco_pago || ""}
          onChange={(e) => setValues((v) => ({ ...v, preco_pago: Number(e.target.value) }))}
        />
      </div>

      <div>
        <Label htmlFor="data">Data da compra</Label>
        <Input
          id="data"
          type="date"
          required
          value={values.data_compra}
          onChange={(e) => setValues((v) => ({ ...v, data_compra: e.target.value }))}
        />
      </div>

      <div className="lg:col-span-3">
        <Label htmlFor="notas">Notas (opcional)</Label>
        <Input
          id="notas"
          placeholder="Observações"
          value={values.notas ?? ""}
          onChange={(e) => setValues((v) => ({ ...v, notas: e.target.value }))}
        />
      </div>

      <div className="flex items-end lg:col-span-1">
        <Button type="submit" disabled={saving} className="w-full">
          {saving ? "Salvando..." : (<><Plus className="size-4" /> Adicionar</>)}
        </Button>
      </div>

      {error && (
        <p className="rounded-lg bg-danger-bg px-3 py-2 text-sm text-danger lg:col-span-6">
          Não foi possível salvar: {error}
        </p>
      )}
    </form>
  );
}
