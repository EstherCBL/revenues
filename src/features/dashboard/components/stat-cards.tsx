import clsx from "clsx";
import { Wallet, ShoppingBasket, TrendingUp, Target } from "lucide-react";
import { Card } from "@/shared/components/ui/card";
import { formatBRL, formatPercent } from "@/shared/lib/format";

type Stat = {
  label: string;
  value: string;
  tone?: "default" | "success" | "danger";
  Icon: typeof Wallet;
};

export function StatCards({
  faturamento,
  custoIngredientes,
  lucroBruto,
  margem,
}: {
  faturamento: number;
  custoIngredientes: number;
  lucroBruto: number;
  margem: number;
}) {
  const stats: Stat[] = [
    { label: "Faturamento", value: formatBRL(faturamento), Icon: Wallet },
    { label: "Custo em ingredientes", value: formatBRL(custoIngredientes), Icon: ShoppingBasket },
    {
      label: "Lucro bruto",
      value: formatBRL(lucroBruto),
      tone: lucroBruto >= 0 ? "success" : "danger",
      Icon: TrendingUp,
    },
    {
      label: "Margem de lucro",
      value: formatPercent(margem),
      tone: margem >= 0 ? "success" : "danger",
      Icon: Target,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, i) => (
        <Card key={stat.label} delay={i * 0.06} className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">{stat.label}</span>
            <stat.Icon className="size-4 text-muted-foreground" />
          </div>
          <p
            className={clsx(
              "tabular mt-2 font-display text-2xl font-semibold",
              stat.tone === "success" && "text-success",
              stat.tone === "danger" && "text-danger",
              !stat.tone && "text-foreground"
            )}
          >
            {stat.value}
          </p>
        </Card>
      ))}
    </div>
  );
}
