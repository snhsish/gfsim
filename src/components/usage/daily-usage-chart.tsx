"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { DailyUsagePoint } from "@/lib/chat/usage";
import { formatCompactNumber, formatNumber } from "@/lib/format";

type DailyUsageChartProps = {
  data: DailyUsagePoint[];
};

function formatDateLabel(iso: string): string {
  const [, month, day] = iso.split("-");
  return `${Number(month)}/${Number(day)}`;
}

function ChartTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: DailyUsagePoint }>;
}) {
  if (!active || !payload || payload.length === 0) return null;

  const point = payload[0]?.payload;
  if (!point) return null;

  return (
    <div className="rounded-lg border bg-background px-3 py-2 text-xs shadow-md">
      <p className="font-medium">{point.date}</p>
      <p className="text-muted-foreground">
        {formatNumber(point.messageCount)} message
        {point.messageCount === 1 ? "" : "s"}
      </p>
      <p className="mt-1">
        <span className="text-muted-foreground">Total tokens: </span>
        <span className="font-medium">{formatNumber(point.totalTokens)}</span>
      </p>
      <p>
        <span className="text-muted-foreground">In: </span>
        <span className="font-medium">{formatNumber(point.inputTokens)}</span>
        <span className="text-muted-foreground"> · Out: </span>
        <span className="font-medium">{formatNumber(point.outputTokens)}</span>
      </p>
    </div>
  );
}

export function DailyUsageChart({ data }: DailyUsageChartProps) {
  const chartData = data.map((point) => ({
    ...point,
    label: formatDateLabel(point.date),
  }));

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="var(--border)"
          />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            stroke="var(--muted-foreground)"
            fontSize={12}
            interval="preserveStartEnd"
            minTickGap={16}
          />
          <YAxis
            tickFormatter={formatCompactNumber}
            tickLine={false}
            axisLine={false}
            stroke="var(--muted-foreground)"
            fontSize={12}
            width={48}
          />
          <Tooltip
            cursor={{ fill: "var(--muted)", opacity: 0.4 }}
            content={<ChartTooltip />}
          />
          <Bar
            dataKey="totalTokens"
            radius={[6, 6, 0, 0]}
            fill="var(--primary)"
            maxBarSize={32}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
