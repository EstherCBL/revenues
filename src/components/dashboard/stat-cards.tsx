import clsx from "clsx";
import { Card } from "@/components/ui/card";
import { formatBRL, formatPercent } from "@/lib/format";

type Stat = {
  label: string;
  value: string;
  tone?: "default" | "success" | "danger";
  icon: string;
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
    { label: "Faturamento", value: formatBRL(faturamento), icon: "💰" },
    { label: "Custo em ingredientes", value: formatBRL(custoIngredientes), icon: "🧺" },
    {
      label: "Lucro bruto",
      value: formatBRL(lucroBruto),
      tone: lucroBruto >= 0 ? "success" : "danger",
      icon: "📈",
    },
    {
      label: "Margem de lucro",
      value: formatPercent(margem),
      tone: margem >= 0 ? "success" : "danger",
      icon: "🎯",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">{stat.label}</span>
            <span className="text-lg">{stat.icon}</span>
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
