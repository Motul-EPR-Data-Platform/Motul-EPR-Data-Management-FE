"use client";

import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { BAR_CHART_COLORS } from "@/constants/colors";

export interface PieChartDataPoint {
  name: string;
  value: number;
  color?: string;
}

interface PieChartProps {
  title: string;
  subtitle?: string;
  data: PieChartDataPoint[];
  className?: string;
  height?: number;
}

export function PieChart({
  title,
  subtitle,
  data,
  className,
  height = 300,
}: PieChartProps) {
  const defaultColors = BAR_CHART_COLORS;

  const colors = data.map(
    (item, index) => item.color || defaultColors[index % defaultColors.length],
  );

  return (
    <Card className={cn("border bg-white", className)}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        {subtitle && (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        )}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <RechartsPieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) =>
                `${name}: ${(percent * 100).toFixed(0)}%`
              }
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "0.5rem",
                padding: "0.5rem",
              }}
              formatter={(value: number) => [value, "Giá trị"]}
            />
            <Legend wrapperStyle={{ paddingTop: "1rem" }} iconType="circle" />
          </RechartsPieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
