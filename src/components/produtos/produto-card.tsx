"use client";

import { useState } from "react";
import clsx from "clsx";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/field";
import { formatBRL } from "@/lib/format";
import type { Produto } from "@/lib/types";

export function ProdutoCard({
  produto,
  onSave,
  onToggleAtivo,
  onDelete,
}: {
  produto: Produto;
  onSave: (id: string, values: Partial<Produto>) => Promise<void>;
  onToggleAtivo: (id: string, ativo: boolean) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(produto);
  const [busy, setBusy] = useState(false);
  const [showReceita, setShowReceita] = useState(false);

  async function handleSave() {
    setBusy(true);
    await onSave(produto.id, draft);
    setBusy(false);
    setEditing(false);
  }

  async function handleDelete() {
    if (!confirm(`Excluir o produto "${produto.nome}"? Vendas já registradas não são apagadas.`)) return;
    setBusy(true);
    await onDelete(produto.id);
    setBusy(false);
  }

  return (
    <div
      className={clsx(
        "rounded-2xl border border-border bg-surface p-5 shadow-sm shadow-black/[0.03] transition-opacity",
        !produto.ativo && "opacity-60"
      )}
    >
      {editing ? (
        <div className="flex flex-col gap-3">
          <Input value={draft.nome} onChange={(e) => setDraft((d) => ({ ...d, nome: e.target.value }))} />
          <Input
            type="number"
            step="0.01"
            value={draft.preco_venda}
            onChange={(e) => setDraft((d) => ({ ...d, preco_venda: Number(e.target.value) }))}
          />
          <Input
            value={draft.descricao ?? ""}
            placeholder="Descrição"
            onChange={(e) => setDraft((d) => ({ ...d, descricao: e.target.value }))}
          />
          <Textarea
            value={draft.receita ?? ""}
            placeholder="Receita / ficha técnica"
            onChange={(e) => setDraft((d) => ({ ...d, receita: e.target.value }))}
          />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" size="sm" onClick={() => { setDraft(produto); setEditing(false); }}>
              Cancelar
            </Button>
            <Button size="sm" onClick={handleSave} disabled={busy}>
              Salvar
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-display text-lg font-semibold text-foreground">{produto.nome}</h3>
              {produto.descricao && (
                <p className="mt-0.5 text-sm text-muted-foreground">{produto.descricao}</p>
              )}
            </div>
            <span
              className={clsx(
                "shrink-0 rounded-full px-2.5 py-1 text-xs font-medium",
                produto.ativo ? "bg-success-bg text-success" : "bg-border text-muted-foreground"
              )}
            >
              {produto.ativo ? "Ativo" : "Inativo"}
            </span>
          </div>

          <p className="tabular mt-3 font-display text-2xl font-semibold text-primary">
            {formatBRL(produto.preco_venda)}
          </p>

          {produto.receita && (
            <div className="mt-3">
              <button
                onClick={() => setShowReceita((v) => !v)}
                className="text-sm font-medium text-primary hover:underline"
              >
                {showReceita ? "Ocultar receita" : "Ver receita / ficha técnica"}
              </button>
              {showReceita && (
                <p className="mt-2 whitespace-pre-wrap rounded-lg bg-surface-hover/60 p-3 text-sm text-foreground">
                  {produto.receita}
                </p>
              )}
            </div>
          )}

          <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-3">
            <Button variant="secondary" size="sm" onClick={() => setEditing(true)}>
              Editar
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onToggleAtivo(produto.id, !produto.ativo)}
            >
              {produto.ativo ? "Desativar" : "Ativar"}
            </Button>
            <Button variant="ghost" size="sm" onClick={handleDelete} disabled={busy} className="text-danger">
              Excluir
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
