"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Rocket, ShoppingBasket, Home, Check, AlertCircle } from "lucide-react";
import { Card, CardHeader, CardBody } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input, Label } from "@/shared/components/ui/field";
import { formatBRL } from "@/shared/lib/format";
import { createClient } from "@/lib/supabase/client";
import { traduzirErroSupabase } from "@/shared/lib/errors";
import { validar } from "@/shared/lib/validacao";
import { configFinanceiraSchema } from "@/features/dashboard/schemas/config-financeira.schema";
import { dividirFaturamento } from "@/features/dashboard/domain/resumo";
import type { ConfigFinanceira } from "@/shared/lib/types";

type Split = { pct_investimento: number; pct_ingredientes: number; pct_pessoal: number };

const ROWS: { key: keyof Split; label: string; Icon: typeof Rocket; hint?: string }[] = [
  { key: "pct_investimento", label: "Investimento", Icon: Rocket },
  { key: "pct_ingredientes", label: "Reposição de ingredientes", Icon: ShoppingBasket, hint: "recomendado 30–40%" },
  { key: "pct_pessoal", label: "Uso pessoal", Icon: Home },
];

export function ProfitSplit({
  config,
  faturamento,
  onSaved,
}: {
  config: ConfigFinanceira;
  faturamento: number;
  onSaved: (config: ConfigFinanceira) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Split>(config);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setDraft(config);
  }, [config]);

  const partes = dividirFaturamento(faturamento, config);
  const total = draft.pct_investimento + draft.pct_ingredientes + draft.pct_pessoal;
  const totalValid = Math.abs(total - 100) < 0.001;

  async function handleSave() {
    const validado = validar(configFinanceiraSchema, draft);
    if (!validado.ok) {
      setError(validado.error);
      return;
    }
    setSaving(true);
    setError(null);

    const supabase = createClient();
    const { error: dbError } = await supabase
      .from("config_financeira")
      .update(validado.data)
      .eq("id", 1);

    setSaving(false);

    if (dbError) {
      setError(`Não foi possível salvar: ${traduzirErroSupabase(dbError)}`);
      return;
    }

    onSaved({ id: 1, ...validado.data });
    setEditing(false);
  }

  return (
    <Card>
      <CardHeader
        title="Divisão do lucro"
        subtitle="Aplicada sobre o faturamento do período selecionado"
        action={
          editing ? (
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setDraft(config);
                  setEditing(false);
                  setError(null);
                }}
              >
                Cancelar
              </Button>
              <Button size="sm" onClick={handleSave} disabled={saving}>
                {saving ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          ) : (
            <Button variant="secondary" size="sm" onClick={() => setEditing(true)}>
              Editar percentuais
            </Button>
          )
        }
      />
      <CardBody>
        <AnimatePresence mode="wait" initial={false}>
          {editing ? (
            <motion.div
              key="editing"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-4"
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {ROWS.map((row) => (
                  <div key={row.key}>
                    <Label htmlFor={row.key}>
                      <row.Icon className="mr-1 inline size-3.5 -translate-y-px text-muted-foreground" />
                      {row.label}
                    </Label>
                    <div className="relative">
                      <Input
                        id={row.key}
                        type="number"
                        min={0}
                        max={100}
                        step={1}
                        value={draft[row.key]}
                        onChange={(e) =>
                          setDraft((d) => ({ ...d, [row.key]: Number(e.target.value) }))
                        }
                        className="pr-8"
                      />
                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                        %
                      </span>
                    </div>
                    {row.hint && <p className="mt-1 text-xs text-muted-foreground">{row.hint}</p>}
                  </div>
                ))}
              </div>
              <p
                className={`flex items-center gap-1.5 text-sm ${totalValid ? "text-success" : "text-danger"}`}
              >
                {totalValid ? <Check className="size-4" /> : <AlertCircle className="size-4" />}
                Total: {total}% {totalValid ? "" : "— precisa somar 100%"}
              </p>
              {error && <p className="text-sm text-danger">{error}</p>}
            </motion.div>
          ) : (
            <motion.div
              key="view"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 gap-4 sm:grid-cols-3"
            >
              {ROWS.map((row) => {
                const pct = config[row.key];
                const valor = partes[row.key];
                return (
                  <div
                    key={row.key}
                    className="rounded-xl border border-border bg-surface-hover/60 p-4"
                  >
                    <p className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
                      <row.Icon className="size-3.5" />
                      {row.label}
                    </p>
                    <p className="tabular mt-1 font-display text-xl font-semibold text-foreground">
                      {formatBRL(valor)}
                    </p>
                    <p className="tabular text-sm text-muted-foreground">{pct}%</p>
                  </div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </CardBody>
    </Card>
  );
}
