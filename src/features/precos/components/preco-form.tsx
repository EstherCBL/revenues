"use client";

import { useState, type FormEvent } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input, Label } from "@/shared/components/ui/field";
import { todayISO } from "@/shared/lib/format";
import type { PrecoPesquisado } from "@/shared/lib/types";

export type PrecoInput = Omit<PrecoPesquisado, "id" | "created_at">;

const UNIDADES = ["g", "kg", "ml", "l", "un"];

export function PrecoForm({
  locaisSugeridos,
  onSubmit,
}: {
  locaisSugeridos: string[];
  onSubmit: (values: PrecoInput) => Promise<void>;
}) {
  const empty: PrecoInput = {
    nome: "",
    local_pesquisa: "",
    quantidade: 0,
    unidade: "g",
    preco: 0,
    data_pesquisa: todayISO(),
    notas: "",
  };
  const [values, setValues] = useState<PrecoInput>(empty);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await onSubmit(values);
      setValues({ ...empty, data_pesquisa: todayISO() });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível salvar.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
      <div className="lg:col-span-2">
        <Label htmlFor="pq-nome">Ingrediente</Label>
        <Input
          id="pq-nome"
          required
          placeholder="Ex: Chocolate 70%"
          value={values.nome}
          onChange={(e) => setValues((v) => ({ ...v, nome: e.target.value }))}
        />
      </div>

      <div className="lg:col-span-2">
        <Label htmlFor="pq-local">Onde viu</Label>
        <Input
          id="pq-local"
          list="pq-locais-sugeridos"
          placeholder="Ex: Assai Anápolis"
          value={values.local_pesquisa ?? ""}
          onChange={(e) => setValues((v) => ({ ...v, local_pesquisa: e.target.value }))}
        />
        <datalist id="pq-locais-sugeridos">
          {locaisSugeridos.map((l) => (
            <option key={l} value={l} />
          ))}
        </datalist>
      </div>

      <div>
        <Label htmlFor="pq-quantidade">Quantidade</Label>
        <Input
          id="pq-quantidade"
          type="number"
          min={0}
          step="any"
          required
          value={values.quantidade || ""}
          onChange={(e) => setValues((v) => ({ ...v, quantidade: Number(e.target.value) }))}
        />
      </div>

      <div>
        <Label htmlFor="pq-unidade">Unidade</Label>
        <Input
          id="pq-unidade"
          list="pq-unidades-sugeridas"
          required
          value={values.unidade}
          onChange={(e) => setValues((v) => ({ ...v, unidade: e.target.value }))}
        />
        <datalist id="pq-unidades-sugeridas">
          {UNIDADES.map((u) => (
            <option key={u} value={u} />
          ))}
        </datalist>
      </div>

      <div>
        <Label htmlFor="pq-preco">Preço visto (R$)</Label>
        <Input
          id="pq-preco"
          type="number"
          min={0}
          step="0.01"
          required
          value={values.preco || ""}
          onChange={(e) => setValues((v) => ({ ...v, preco: Number(e.target.value) }))}
        />
      </div>

      <div>
        <Label htmlFor="pq-data">Data da pesquisa</Label>
        <Input
          id="pq-data"
          type="date"
          required
          value={values.data_pesquisa}
          onChange={(e) => setValues((v) => ({ ...v, data_pesquisa: e.target.value }))}
        />
      </div>

      <div className="lg:col-span-3">
        <Label htmlFor="pq-notas">Notas (opcional)</Label>
        <Input
          id="pq-notas"
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
