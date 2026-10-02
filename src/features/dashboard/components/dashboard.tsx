"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { periodoParaIntervalo } from "@/shared/lib/period";
import type { ConfigFinanceira, PeriodoFiltro } from "@/shared/lib/types";
import { PeriodFilter } from "@/shared/components/period-filter";
import { StatCards } from "@/features/dashboard/components/stat-cards";
import { ProfitSplit } from "@/features/dashboard/components/profit-split";
import { RevenueChart } from "@/features/dashboard/components/revenue-chart";
import type { RevenuePoint } from "@/features/dashboard/types";
import { Card } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";

const DEFAULT_CONFIG: ConfigFinanceira = {
  id: 1,
  pct_investimento: 30,
  pct_ingredientes: 35,
  pct_pessoal: 35,
};

export function Dashboard() {
  const [periodo, setPeriodo] = useState<PeriodoFiltro>("mes");
  const [loading, setLoading] = useState(true);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [faturamento, setFaturamento] = useState(0);
  const [custoIngredientes, setCustoIngredientes] = useState(0);
  const [chartData, setChartData] = useState<RevenuePoint[]>([]);
  const [config, setConfig] = useState<ConfigFinanceira>(DEFAULT_CONFIG);

  const load = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const intervalo = periodoParaIntervalo(periodo);

    let vendasQuery = supabase.from("vendas").select("data_venda, valor_total");
    let ingredientesQuery = supabase.from("ingredientes_comprados").select("preco_pago, data_compra");

    if (intervalo) {
      vendasQuery = vendasQuery.gte("data_venda", intervalo.inicio).lte("data_venda", intervalo.fim);
      ingredientesQuery = ingredientesQuery
        .gte("data_compra", intervalo.inicio)
        .lte("data_compra", intervalo.fim);
    }

    const [{ data: vendas }, { data: ingredientes }, { data: configRows }] = await Promise.all([
      vendasQuery,
      ingredientesQuery,
      supabase.from("config_financeira").select("*").eq("id", 1).maybeSingle(),
    ]);

    const totalFaturamento = (vendas ?? []).reduce((acc, v) => acc + Number(v.valor_total), 0);
    const totalIngredientes = (ingredientes ?? []).reduce((acc, i) => acc + Number(i.preco_pago), 0);

    const porDia = new Map<string, number>();
    for (const v of vendas ?? []) {
      const key = v.data_venda;
      porDia.set(key, (porDia.get(key) ?? 0) + Number(v.valor_total));
    }
    const serie = Array.from(porDia.entries())
      .map(([data, total]) => ({ data, total }))
      .sort((a, b) => a.data.localeCompare(b.data));

    setFaturamento(totalFaturamento);
    setCustoIngredientes(totalIngredientes);
    setChartData(serie);
    if (configRows) setConfig(configRows);
    setLoading(false);
    setHasLoadedOnce(true);
  }, [periodo]);

  useEffect(() => {
    load();
  }, [load]);

  const lucroBruto = faturamento - custoIngredientes;
  const margem = faturamento > 0 ? (lucroBruto / faturamento) * 100 : 0;
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
        <div className={loading ? "opacity-60 transition-opacity" : "transition-opacity"}>
          <StatCards
            faturamento={faturamento}
            custoIngredientes={custoIngredientes}
            lucroBruto={lucroBruto}
            margem={margem}
          />
        </div>
      )}

      <ProfitSplit config={config} faturamento={faturamento} onSaved={setConfig} />

      <RevenueChart data={chartData} />
    </div>
  );
}
