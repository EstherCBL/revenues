"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { periodoParaIntervalo } from "@/shared/lib/period";
import { assertOk, mensagemDeErro, unwrap } from "@/shared/lib/errors";
import type { ConfigFinanceira, PeriodoFiltro } from "@/shared/lib/types";
import { PeriodFilter } from "@/shared/components/period-filter";
import { StatCards } from "@/features/dashboard/components/stat-cards";
import { ProfitSplit } from "@/features/dashboard/components/profit-split";
import { RevenueChart } from "@/features/dashboard/components/revenue-chart";
import { calcularResumo } from "@/features/dashboard/domain/resumo";
import type { RevenuePoint } from "@/features/dashboard/types";
import { Card } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";

const DEFAULT_CONFIG: ConfigFinanceira = {
  id: 1,
  pct_investimento: 30,
  pct_ingredientes: 35,
  pct_pessoal: 35,
};

type ResumoRow = { faturamento: number | string; custo_ingredientes: number | string };
type SerieRow = { data: string; total: number | string };

export function Dashboard() {
  const [periodo, setPeriodo] = useState<PeriodoFiltro>("mes");
  const [loading, setLoading] = useState(true);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [faturamento, setFaturamento] = useState(0);
  const [custoIngredientes, setCustoIngredientes] = useState(0);
  const [chartData, setChartData] = useState<RevenuePoint[]>([]);
  const [config, setConfig] = useState<ConfigFinanceira>(DEFAULT_CONFIG);
  const requisicaoAtual = useRef(0);

  const load = useCallback(async () => {
    const requisicao = ++requisicaoAtual.current;
    setLoading(true);
    const supabase = createClient();
    const intervalo = periodoParaIntervalo(periodo);
    const params = { p_inicio: intervalo?.inicio ?? null, p_fim: intervalo?.fim ?? null };

    try {
      // Os totais são somados no Postgres (funções resumo_periodo e faturamento_por_dia).
      const [resumoRes, serieRes, configRes] = await Promise.all([
        supabase.rpc("resumo_periodo", params),
        supabase.rpc("faturamento_por_dia", params),
        supabase.from("config_financeira").select("*").eq("id", 1).maybeSingle(),
      ]);
      const [resumo] = unwrap(resumoRes) as ResumoRow[];
      const serie = unwrap(serieRes) as SerieRow[];
      assertOk(configRes);

      if (requisicao !== requisicaoAtual.current) return; // resposta de um período que já foi trocado

      setFaturamento(Number(resumo?.faturamento ?? 0));
      setCustoIngredientes(Number(resumo?.custo_ingredientes ?? 0));
      setChartData(serie.map((linha) => ({ data: linha.data, total: Number(linha.total) })));
      if (configRes.data) setConfig(configRes.data);
      setLoadError(null);
      setHasLoadedOnce(true);
    } catch (e) {
      if (requisicao !== requisicaoAtual.current) return;
      setLoadError(mensagemDeErro(e, "Não foi possível carregar o dashboard."));
    } finally {
      if (requisicao === requisicaoAtual.current) setLoading(false);
    }
  }, [periodo]);

  useEffect(() => {
    load();
  }, [load]);

  const { lucroBruto, margem } = calcularResumo(faturamento, custoIngredientes);
  const showSkeleton = loading && !hasLoadedOnce;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Visão geral da sua produção de doces</p>
        </div>
        <PeriodFilter value={periodo} onChange={setPeriodo} groupId="dashboard-period-pill" />
      </div>

      {loadError && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-danger-bg px-3 py-2 text-sm text-danger">
          <span>Não foi possível carregar o dashboard: {loadError}</span>
          <Button variant="secondary" size="sm" onClick={load}>
            Tentar de novo
          </Button>
        </div>
      )}

      {showSkeleton ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} delay={i * 0.06} className="p-5">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="mt-3 h-7 w-28" />
            </Card>
          ))}
        </div>
      ) : (
        hasLoadedOnce && (
          <>
            <div className={loading ? "opacity-60 transition-opacity" : "transition-opacity"}>
              <StatCards
                faturamento={faturamento}
                custoIngredientes={custoIngredientes}
                lucroBruto={lucroBruto}
                margem={margem}
              />
            </div>

            <ProfitSplit config={config} faturamento={faturamento} onSaved={setConfig} />

            <RevenueChart data={chartData} />
          </>
        )
      )}
    </div>
  );
}
