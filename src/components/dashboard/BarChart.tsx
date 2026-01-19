"use client";

import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { CHART_COLORS } from "@/constants/colors";

export interface BarChartDataPoint {
  [key: string]: string | number;
}

interface BarChartProps {
  title?: string;
  subtitle?: string;
  data: BarChartDataPoint[];
  dataKey: string;
  xAxisKey: string;
  color?: string;
  className?: string;
  height?: number;
  unit?: string;
  hideCard?: boolean; // If true, don't render Card wrapper
}

export function BarChart({
  title,
  subtitle,
  data,
  dataKey,
  xAxisKey,
  color = CHART_COLORS.red,
  className,
  height = 300,
  unit,
  hideCard = false,
}: BarChartProps) {
  const chart = (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsBarChart
        data={data}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis
          dataKey={xAxisKey}
          stroke="var(--muted-foreground)"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="var(--muted-foreground)"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          unit={unit}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "var(--popover)",
            border: "1px solid var(--border)",
            borderRadius: "0.5rem",
            padding: "0.5rem",
          }}
          formatter={(value: number) => [`${value}${unit || ""}`, dataKey]}
        />
        <Legend wrapperStyle={{ paddingTop: "1rem" }} iconType="square" />
        <Bar
          dataKey={dataKey}
          fill={color}
          radius={[4, 4, 0, 0]}
          name={dataKey}
        />
      </RechartsBarChart>
    </ResponsiveContainer>
  );

  if (hideCard) {
    return <div className={cn(className)}>{chart}</div>;
  }

  return (
    <Card className={cn("border bg-white", className)}>
      {title && (
        <CardHeader>
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
        </CardHeader>
      )}
      <CardContent>{chart}</CardContent>
    </Card>
  );
}
