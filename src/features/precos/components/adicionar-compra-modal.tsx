"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/shared/components/ui/modal";
import { Button } from "@/shared/components/ui/button";
import { Input, Label } from "@/shared/components/ui/field";
import { todayISO } from "@/shared/lib/format";
import { mensagemDeErro } from "@/shared/lib/errors";
import { validar } from "@/shared/lib/validacao";
import { ingredienteCompraSchema } from "@/shared/schemas/ingrediente-compra.schema";
import type { IngredienteInput, PrecoPesquisado } from "@/shared/lib/types";

export function AdicionarCompraModal({
  preco,
  onClose,
  onConfirm,
}: {
  preco: PrecoPesquisado | null;
  onClose: () => void;
  onConfirm: (values: IngredienteInput) => Promise<void>;
}) {
  const [draft, setDraft] = useState<IngredienteInput | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (preco) {
      setDraft({
        nome: preco.nome,
        local_compra: preco.local_pesquisa,
        quantidade: preco.quantidade,
        unidade: preco.unidade,
        preco_pago: preco.preco,
        data_compra: todayISO(),
        notas: preco.notas,
      });
      setError(null);
    } else {
      setDraft(null);
    }
  }, [preco]);

  async function handleConfirm() {
    if (!draft) return;
    setError(null);
    const validado = validar(ingredienteCompraSchema, draft);
    if (!validado.ok) {
      setError(validado.error);
      return;
    }
    setSaving(true);
    try {
      await onConfirm(validado.data);
    } catch (err) {
      setError(`Não foi possível adicionar: ${mensagemDeErro(err)}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={!!preco} onClose={onClose} title="Adicionar aos ingredientes comprados">
      {draft && (
        <div className="flex flex-col gap-4">
          <div>
            <Label>Ingrediente</Label>
            <p className="text-sm font-medium text-foreground">{draft.nome}</p>
          </div>

          <div>
            <Label htmlFor="ac-local">Local de compra</Label>
            <Input
              id="ac-local"
              value={draft.local_compra ?? ""}
              onChange={(e) => setDraft((d) => d && { ...d, local_compra: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="ac-quantidade">Quantidade</Label>
              <Input
                id="ac-quantidade"
                type="number"
                min={0}
                step="any"
                value={draft.quantidade}
                onChange={(e) =>
                  setDraft((d) => d && { ...d, quantidade: Number(e.target.value) })
                }
              />
            </div>
            <div>
              <Label htmlFor="ac-unidade">Unidade</Label>
              <Input
                id="ac-unidade"
                value={draft.unidade}
                onChange={(e) => setDraft((d) => d && { ...d, unidade: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="ac-preco">Valor pago (R$)</Label>
              <Input
                id="ac-preco"
                type="number"
                min={0}
                step="0.01"
                value={draft.preco_pago}
                onChange={(e) =>
                  setDraft((d) => d && { ...d, preco_pago: Number(e.target.value) })
                }
              />
            </div>
            <div>
              <Label htmlFor="ac-data">Data da compra</Label>
              <Input
                id="ac-data"
                type="date"
                value={draft.data_compra}
                onChange={(e) => setDraft((d) => d && { ...d, data_compra: e.target.value })}
              />
            </div>
          </div>

          {error && (
            <p className="rounded-lg bg-danger-bg px-3 py-2 text-sm text-danger">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <Button variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={handleConfirm} disabled={saving}>
              {saving ? "Adicionando..." : "Adicionar à compra"}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
