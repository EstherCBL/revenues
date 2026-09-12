import clsx from "clsx";
import type { PeriodoFiltro } from "@/lib/types";
import { PERIODO_LABELS } from "@/lib/period";

const OPTIONS: PeriodoFiltro[] = ["hoje", "7dias", "mes", "tudo"];

export function PeriodFilter({
  value,
  onChange,
}: {
  value: PeriodoFiltro;
  onChange: (v: PeriodoFiltro) => void;
}) {
  return (
    <div className="inline-flex rounded-lg border border-border bg-surface p-1">
      {OPTIONS.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={clsx(
            "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
            value === opt
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {PERIODO_LABELS[opt]}
        </button>
      ))}
    </div>
  );
}
