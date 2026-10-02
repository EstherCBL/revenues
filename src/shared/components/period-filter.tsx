import { motion } from "motion/react";
import clsx from "clsx";
import type { PeriodoFiltro } from "@/shared/lib/types";
import { PERIODO_LABELS } from "@/shared/lib/period";

const OPTIONS: PeriodoFiltro[] = ["hoje", "7dias", "mes", "tudo"];

export function PeriodFilter({
  value,
  onChange,
  groupId = "period-pill",
}: {
  value: PeriodoFiltro;
  onChange: (v: PeriodoFiltro) => void;
  /** Namespaces the shared layout animation so unrelated filters on the same page don't fight over it. */
  groupId?: string;
}) {
  return (
    <div className="inline-flex rounded-lg border border-border bg-surface p-1">
      {OPTIONS.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={clsx(
            "relative rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
            value === opt ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
          )}
        >
          {value === opt && (
            <motion.span
              layoutId={groupId}
              className="absolute inset-0 rounded-md bg-primary"
              transition={{ type: "spring", stiffness: 450, damping: 34 }}
            />
          )}
          <span className="relative">{PERIODO_LABELS[opt]}</span>
        </button>
      ))}
    </div>
  );
}
