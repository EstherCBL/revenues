"use client";

import dynamic from "next/dynamic";
import { motion } from "motion/react";
import { Card, CardHeader, CardBody } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import type { RevenuePoint } from "@/features/dashboard/types";

const RevenueChartInner = dynamic(() => import("./revenue-chart-inner"), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full" />,
});

export function RevenueChart({ data }: { data: RevenuePoint[] }) {
  const hasData = data.some((d) => d.total > 0);

  return (
    <Card delay={0.24}>
      <CardHeader title="Faturamento por dia" subtitle="Dentro do período selecionado" />
      <CardBody>
        {hasData ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="h-64 w-full"
          >
            <RevenueChartInner data={data} />
          </motion.div>
        ) : (
          <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
            Sem vendas registradas neste período.
          </div>
        )}
      </CardBody>
    </Card>
  );
}
