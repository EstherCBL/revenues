"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { formatBRL, formatDateBR } from "@/lib/format";
import type { RevenuePoint } from "@/components/dashboard/revenue-chart";

export default function RevenueChartInner({ data }: { data: RevenuePoint[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.35} />
            <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
        <XAxis
          dataKey="data"
          tickFormatter={formatDateBR}
          tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
          axisLine={{ stroke: "var(--color-border)" }}
          tickLine={false}
          minTickGap={24}
        />
        <YAxis
          tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          width={70}
          tickFormatter={(v) => formatBRL(v)}
        />
        <Tooltip
          formatter={(value) => [formatBRL(Number(value)), "Faturamento"]}
          labelFormatter={(label) => formatDateBR(String(label))}
          contentStyle={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: 8,
            color: "var(--color-foreground)",
            fontSize: 13,
          }}
        />
        <Area
          type="monotone"
          dataKey="total"
          stroke="var(--color-primary)"
          strokeWidth={2}
          fill="url(#revenueFill)"
          animationDuration={600}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
