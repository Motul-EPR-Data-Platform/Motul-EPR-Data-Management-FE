"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AnalyticsService } from "@/lib/services/analytics.service";
import { BatchAnalysisData } from "@/types/analytics";
import { BatchType } from "@/types/batch";
import { SummaryMetricCard } from "@/components/dashboard/SummaryMetricCard";
import { Package, Factory, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function BatchAnalysis() {
  const [data, setData] = useState<BatchAnalysisData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [year, setYear] = useState<number | undefined>(new Date().getFullYear());
  const [month, setMonth] = useState<number | undefined>(undefined);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const result = await AnalyticsService.getBatchAnalysis({ year, month });
      setData(result);
    } catch (error) {
      console.error("Error fetching batch analysis:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [year, month]);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("vi-VN", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(num);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Phân tích Lô hàng (Port vs Factory)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="year">Năm</Label>
            <Input
              id="year"
              type="number"
              value={year || ""}
              onChange={(e) =>
                setYear(e.target.value ? parseInt(e.target.value) : undefined)
              }
              placeholder="2025"
              min="2020"
              max="2100"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="month">Tháng (tùy chọn)</Label>
            <Select
              value={month?.toString() || "all"}
              onValueChange={(value) =>
                setMonth(value === "all" ? undefined : parseInt(value))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Tất cả" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <SelectItem key={m} value={m.toString()}>
                    Tháng {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Period Display */}
        {data && (
          <div className="text-sm text-muted-foreground">
            Kỳ: <span className="font-semibold">{data.period}</span>
          </div>
        )}

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : data ? (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <SummaryMetricCard
                title="Port"
                value={`${formatNumber(data.port.collectedVolumeKg)} kg`}
                icon={<Package className="w-5 h-5" />}
              />
              <SummaryMetricCard
                title="Factory"
                value={`${formatNumber(data.factory.collectedVolumeKg)} kg`}
                icon={<Factory className="w-5 h-5" />}
              />
              <SummaryMetricCard
                title="Tổng"
                value={`${formatNumber(data.total.collectedVolumeKg)} kg`}
                icon={<TrendingUp className="w-5 h-5" />}
              />
            </div>

            {/* Detailed Comparison Table */}
            <div className="rounded-lg border">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold">
                      Chỉ số
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-semibold">
                      Port
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-semibold">
                      Factory
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-semibold">
                      Tổng
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  <tr>
                    <td className="px-4 py-3 text-sm font-medium">
                      Khối lượng thu gom (kg)
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      {formatNumber(data.port.collectedVolumeKg)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      {formatNumber(data.factory.collectedVolumeKg)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-semibold">
                      {formatNumber(data.total.collectedVolumeKg)}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm font-medium">
                      Khối lượng tái chế (kg)
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      {formatNumber(data.port.totalRecycledVolumeKg)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      {formatNumber(data.factory.totalRecycledVolumeKg)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-semibold">
                      {formatNumber(data.total.totalRecycledVolumeKg)}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm font-medium">
                      Khối lượng tồn kho (kg)
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      {formatNumber(data.port.stockpileVolumeKg)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      {formatNumber(data.factory.stockpileVolumeKg)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-semibold">
                      {formatNumber(data.total.stockpileVolumeKg)}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm font-medium">
                      Số lô hàng
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      {data.port.batchCount}
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      {data.factory.batchCount}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-semibold">
                      {data.total.batchCount}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            Không có dữ liệu
          </div>
        )}
      </CardContent>
    </Card>
  );
}
