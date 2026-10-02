"use client";

import { useState } from "react";
import clsx from "clsx";
import { motion } from "motion/react";
import { Pencil, Power, Trash2, ChevronDown } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input, Textarea } from "@/shared/components/ui/field";
import { formatBRL } from "@/shared/lib/format";
import { mensagemDeErro } from "@/shared/lib/errors";
import { validar } from "@/shared/lib/validacao";
import { produtoSchema } from "@/features/produtos/schemas/produto.schema";
import type { Produto } from "@/shared/lib/types";

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
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setError(null);
    const validado = validar(produtoSchema, draft);
    if (!validado.ok) {
      setError(validado.error);
      return;
    }
    setBusy(true);
    try {
      await onSave(produto.id, validado.data);
      setEditing(false);
    } catch (err) {
      setError(mensagemDeErro(err, "Não foi possível salvar."));
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`Excluir o produto "${produto.nome}"? Vendas já registradas não são apagadas.`)) return;
    setBusy(true);
    setError(null);
    try {
      await onDelete(produto.id);
    } catch (err) {
      setError(mensagemDeErro(err, "Não foi possível excluir."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 14, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
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
                className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
              >
                {showReceita ? "Ocultar receita" : "Ver receita / ficha técnica"}
                <motion.span
                  animate={{ rotate: showReceita ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex"
                >
                  <ChevronDown className="size-3.5" />
                </motion.span>
              </button>
              <motion.div
                initial={false}
                animate={{ height: showReceita ? "auto" : 0, opacity: showReceita ? 1 : 0 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <p className="mt-2 whitespace-pre-wrap rounded-lg bg-surface-hover/60 p-3 text-sm text-foreground">
                  {produto.receita}
                </p>
              </motion.div>
            </div>
          )}

          <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-3">
            <Button variant="secondary" size="sm" onClick={() => setEditing(true)}>
              <Pencil className="size-4" />
              Editar
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onToggleAtivo(produto.id, !produto.ativo)}
            >
              <Power className="size-4" />
              {produto.ativo ? "Desativar" : "Ativar"}
            </Button>
            <Button variant="ghost" size="sm" onClick={handleDelete} disabled={busy} className="text-danger">
              <Trash2 className="size-4" />
              Excluir
            </Button>
          </div>
        </>
      )}

      {error && (
        <p className="mt-3 rounded-lg bg-danger-bg px-3 py-2 text-sm text-danger">{error}</p>
      )}
    </motion.div>
  );
}
