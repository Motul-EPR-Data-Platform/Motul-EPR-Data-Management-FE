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
import { WasteSourceDistribution } from "@/types/dashboard";
import { Loader2 } from "lucide-react";

interface WasteSourceDistributionChartProps {
  className?: string;
  initialData?: WasteSourceDistribution;
}

import { WASTE_SOURCE_CHART_COLORS } from "@/constants/colors";

const chartColors = WASTE_SOURCE_CHART_COLORS;

export function WasteSourceDistributionChart({
  className,
  initialData,
}: WasteSourceDistributionChartProps) {
  const [distribution, setDistribution] = useState<
    Array<{
      wasteSourceId: string;
      wasteSourceName: string;
      volumeKg: number;
      percentage: number;
    }>
  >(initialData?.distribution || []);
  const [totalVolumeKg, setTotalVolumeKg] = useState<number>(
    initialData?.totalVolumeKg || 0
  );
  const [isLoading, setIsLoading] = useState(!initialData);

  // Update when initialData changes
  useEffect(() => {
    if (initialData) {
      setDistribution(initialData.distribution);
      setTotalVolumeKg(initialData.totalVolumeKg);
      setIsLoading(false);
    }
  }, [initialData]);

  // Fetch data if not provided via props
  useEffect(() => {
    if (initialData) {
      return; // Don't fetch if we have initial data
    }

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
  }, [initialData]);

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
              margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
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
                width={350}
                tickFormatter={(value: string) => {
                  // Allow more text to display - increased max length for longer labels
                  const maxLength = 100;
                  if (value && value.length > maxLength) {
                    return value.substring(0, maxLength) + "...";
                  }
                  return value || "";
                }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "0.5rem",
                  padding: "0.5rem",
                }}
                formatter={(value: number, payload: any) => {
                  const fullName = payload?.payload?.name || "";
                  const percentage = payload?.percentage || 0;
                  return [
                    <div key="tooltip">
                      <div className="font-semibold mb-1">{fullName}</div>
                      <div>
                        {value.toLocaleString("vi-VN")} kg ({percentage.toFixed(2)}%)
                      </div>
                    </div>,
                    "Khối lượng",
                  ];
                }}
                labelFormatter={() => ""}
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

