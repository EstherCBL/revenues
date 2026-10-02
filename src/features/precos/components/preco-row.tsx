"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Pencil, Trash2, X, Check, PackagePlus, Award } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/field";
import { formatBRL, formatDateBR } from "@/shared/lib/format";
import type { PrecoPesquisado } from "@/shared/lib/types";

export function PrecoRow({
  item,
  isMelhorPreco,
  onSave,
  onDelete,
  onAddToCompras,
}: {
  item: PrecoPesquisado;
  isMelhorPreco: boolean;
  onSave: (id: string, values: Partial<PrecoPesquisado>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onAddToCompras: (item: PrecoPesquisado) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(item);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setBusy(true);
    setError(null);
    try {
      await onSave(item.id, draft);
      setEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível salvar.");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`Excluir a pesquisa de "${item.nome}"?`)) return;
    setBusy(true);
    setError(null);
    try {
      await onDelete(item.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível excluir.");
    } finally {
      setBusy(false);
    }
  }

  const rowMotionProps = {
    layout: true,
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0, x: -12 },
    transition: { duration: 0.2 },
  } as const;

  const errorRow = error && (
    <tr>
      <td colSpan={7} className="bg-danger-bg px-4 py-2 text-xs text-danger">
        {error}
      </td>
    </tr>
  );

  if (!editing) {
    return (
      <>
        <motion.tr {...rowMotionProps} className="border-b border-border last:border-0 hover:bg-surface-hover/60">
          <td className="whitespace-nowrap px-4 py-3 text-sm text-muted-foreground">
            {formatDateBR(item.data_pesquisa)}
          </td>
          <td className="px-4 py-3 text-sm font-medium text-foreground">{item.nome}</td>
          <td className="px-4 py-3 text-sm text-muted-foreground">{item.local_pesquisa || "—"}</td>
          <td className="tabular px-4 py-3 text-sm text-foreground">
            {item.quantidade} {item.unidade}
          </td>
          <td className="px-4 py-3 text-sm font-medium">
            <span className="tabular inline-flex items-center gap-1.5 text-foreground">
              {formatBRL(item.preco)}
              {isMelhorPreco && (
                <span
                  title="Menor preço encontrado para este ingrediente"
                  className="inline-flex items-center gap-1 rounded-full bg-success-bg px-1.5 py-0.5 text-[11px] font-medium text-success"
                >
                  <Award className="size-3" />
                  melhor
                </span>
              )}
            </span>
          </td>
          <td className="px-4 py-3 text-sm text-muted-foreground">{item.notas || "—"}</td>
          <td className="whitespace-nowrap px-4 py-3 text-right">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onAddToCompras(item)}
              className="text-primary"
              aria-label="Adicionar aos ingredientes comprados"
              title="Adicionar aos ingredientes comprados"
            >
              <PackagePlus className="size-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setEditing(true)} aria-label="Editar">
              <Pencil className="size-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleDelete} disabled={busy} className="text-danger" aria-label="Excluir">
              <Trash2 className="size-4" />
            </Button>
          </td>
        </motion.tr>
        {errorRow}
      </>
    );
  }

  return (
    <>
      <motion.tr {...rowMotionProps} className="border-b border-border bg-surface-hover/40 last:border-0">
      <td className="px-2 py-2">
        <Input
          type="date"
          value={draft.data_pesquisa}
          onChange={(e) => setDraft((d) => ({ ...d, data_pesquisa: e.target.value }))}
        />
      </td>
      <td className="px-2 py-2">
        <Input value={draft.nome} onChange={(e) => setDraft((d) => ({ ...d, nome: e.target.value }))} />
      </td>
      <td className="px-2 py-2">
        <Input
          value={draft.local_pesquisa ?? ""}
          onChange={(e) => setDraft((d) => ({ ...d, local_pesquisa: e.target.value }))}
        />
      </td>
      <td className="px-2 py-2">
        <div className="flex gap-1">
          <Input
            type="number"
            step="any"
            value={draft.quantidade}
            onChange={(e) => setDraft((d) => ({ ...d, quantidade: Number(e.target.value) }))}
            className="w-20"
          />
          <Input
            value={draft.unidade}
            onChange={(e) => setDraft((d) => ({ ...d, unidade: e.target.value }))}
            className="w-16"
          />
        </div>
      </td>
      <td className="px-2 py-2">
        <Input
          type="number"
          step="0.01"
          value={draft.preco}
          onChange={(e) => setDraft((d) => ({ ...d, preco: Number(e.target.value) }))}
          className="w-28"
        />
      </td>
      <td className="px-2 py-2">
        <Input
          value={draft.notas ?? ""}
          onChange={(e) => setDraft((d) => ({ ...d, notas: e.target.value }))}
        />
      </td>
      <td className="whitespace-nowrap px-2 py-2 text-right">
        <Button variant="ghost" size="sm" onClick={() => { setDraft(item); setEditing(false); }} aria-label="Cancelar">
          <X className="size-4" />
        </Button>
        <Button size="sm" onClick={handleSave} disabled={busy} aria-label="Salvar">
          <Check className="size-4" />
        </Button>
      </td>
      </motion.tr>
      {errorRow}
    </>
  );
}
