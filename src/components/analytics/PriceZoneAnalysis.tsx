"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AnalyticsService } from "@/lib/services/analytics.service";
import { PriceZoneAnalysisData } from "@/types/analytics";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Trophy, TrendingUp } from "lucide-react";

export function PriceZoneAnalysis() {
  const [data, setData] = useState<PriceZoneAnalysisData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [year, setYear] = useState<number | undefined>(new Date().getFullYear());
  const [month, setMonth] = useState<number | undefined>(undefined);
  const [zoneSize, setZoneSize] = useState<number>(500);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const result = await AnalyticsService.getPriceZoneAnalysis({
        year,
        month,
        zoneSize,
      });
      setData(result);
    } catch (error) {
      console.error("Error fetching price zone analysis:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [year, month, zoneSize]);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("vi-VN", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(num);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Phân tích Vùng Giá (Xếp hạng theo Khối lượng)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          <div className="space-y-2">
            <Label htmlFor="zoneSize">Kích thước vùng (VND)</Label>
            <Input
              id="zoneSize"
              type="number"
              value={zoneSize}
              onChange={(e) => setZoneSize(parseInt(e.target.value) || 500)}
              placeholder="500"
              min="100"
              step="100"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : data ? (
          <>
            {/* Period and Total Volume */}
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Kỳ: <span className="font-semibold">{data.period}</span>
              </div>
              <div className="text-sm text-muted-foreground">
                Tổng khối lượng:{" "}
                <span className="font-semibold">
                  {formatNumber(data.totalVolumeKg)} kg
                </span>
              </div>
            </div>

            {/* Top Zones */}
            {data.topZones.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  Top Vùng Giá
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {data.topZones.map((zone) => (
                    <div
                      key={zone.zoneId}
                      className="rounded-lg border p-4 bg-gradient-to-br from-yellow-50 to-orange-50"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="secondary">#{zone.rank}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {zone.percentage.toFixed(1)}%
                        </span>
                      </div>
                      <p className="text-sm font-medium mb-1">
                        {zone.priceRangeLabel}
                      </p>
                      <p className="text-2xl font-bold">
                        {formatNumber(zone.totalCollectedVolumeKg)} kg
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {zone.recordCount} bản ghi
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Insights */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Thông tin chi tiết</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-lg border p-4">
                  <p className="text-sm font-medium mb-2 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Vùng phổ biến nhất
                  </p>
                  <p className="text-lg font-semibold">
                    {data.insights.mostPopularZone.priceRangeLabel}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {formatNumber(
                      data.insights.mostPopularZone.totalCollectedVolumeKg,
                    )}{" "}
                    kg ({data.insights.mostPopularZone.percentage.toFixed(1)}%)
                  </p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Trophy className="w-4 h-4" />
                    Vùng khối lượng cao nhất
                  </p>
                  <p className="text-lg font-semibold">
                    {data.insights.highestVolumeZone.priceRangeLabel}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {formatNumber(
                      data.insights.highestVolumeZone.totalCollectedVolumeKg,
                    )}{" "}
                    kg
                  </p>
                </div>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-sm font-medium mb-2">Khoảng giá</p>
                <p className="text-lg font-semibold">
                  {formatNumber(data.insights.priceRange.min)} -{" "}
                  {formatNumber(data.insights.priceRange.max)} VND/kg
                </p>
              </div>
            </div>

            {/* All Zones Table */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Tất cả các vùng giá</h3>
              <div className="rounded-lg border overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-primary/5">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-primary">
                          Hạng
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-primary">
                          Khoảng giá
                        </th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-primary">
                          Khối lượng thu gom (kg)
                        </th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-primary">
                          Khối lượng tái chế (kg)
                        </th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-primary">
                          Tỷ lệ (%)
                        </th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-primary">
                          Số bản ghi
                        </th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-primary">
                          Giá TB (VND/kg)
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {data.zones.map((zone) => (
                        <tr
                          key={zone.zoneId}
                          className={
                            zone.rank <= 3
                              ? "bg-yellow-50 font-medium"
                              : ""
                          }
                        >
                          <td className="px-4 py-3 text-sm">
                            <Badge variant={zone.rank <= 3 ? "default" : "secondary"}>
                              #{zone.rank}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-sm font-medium">
                            {zone.priceRangeLabel}
                          </td>
                          <td className="px-4 py-3 text-sm text-right">
                            {formatNumber(zone.totalCollectedVolumeKg)}
                          </td>
                          <td className="px-4 py-3 text-sm text-right">
                            {formatNumber(zone.totalRecycledVolumeKg)}
                          </td>
                          <td className="px-4 py-3 text-sm text-right">
                            {zone.percentage.toFixed(2)}%
                          </td>
                          <td className="px-4 py-3 text-sm text-right">
                            {zone.recordCount}
                          </td>
                          <td className="px-4 py-3 text-sm text-right">
                            {formatNumber(zone.avgPrice)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
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
