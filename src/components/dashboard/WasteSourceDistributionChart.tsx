"use client";

import { useState, useEffect } from "react";
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardService } from "@/lib/services/dashboard.service";
import { Loader2 } from "lucide-react";

interface WasteSourceDistributionChartProps {
  className?: string;
}

const chartColors = [
  "#e2231a", // Motul red
  "#22c55e", // Green
  "#f97316", // Orange
  "#3b82f6", // Blue
  "#a855f7", // Purple
  "#eab308", // Yellow
  "#6b7280", // Gray
  "#000000", // Black
];

export function WasteSourceDistributionChart({
  className,
}: WasteSourceDistributionChartProps) {
  const [distribution, setDistribution] = useState<
    Array<{
      wasteSourceId: string;
      wasteSourceName: string;
      volumeKg: number;
      percentage: number;
    }>
  >([]);
  const [totalVolumeKg, setTotalVolumeKg] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const data = await DashboardService.getWasteSourceDistribution({
          period: "all",
        });
        setDistribution(data.distribution);
        setTotalVolumeKg(data.totalVolumeKg);
      } catch (error) {
        console.error("Error fetching waste source distribution:", error);
        setDistribution([]);
        setTotalVolumeKg(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const chartData = distribution.map((item, index) => ({
    name: item.wasteSourceName,
    value: item.volumeKg,
    percentage: item.percentage,
    color: chartColors[index % chartColors.length],
  }));

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          Phân bố nguồn thải
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Tổng khối lượng: {totalVolumeKg.toLocaleString("vi-VN")} kg
        </p>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <RechartsBarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                type="number"
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                unit=" kg"
              />
              <YAxis
                type="category"
                dataKey="name"
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                width={90}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "0.5rem",
                  padding: "0.5rem",
                }}
                formatter={(value: number, payload: any) => [
                  `${value.toLocaleString("vi-VN")} kg (${payload.percentage}%)`,
                  "Khối lượng",
                ]}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </RechartsBarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-center text-muted-foreground py-12">
            Không có dữ liệu
          </p>
        )}
      </CardContent>
    </Card>
  );
}

