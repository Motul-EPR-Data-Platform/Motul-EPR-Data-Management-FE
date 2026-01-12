"use client";

import { useState } from "react";
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
import { PriceFsAnalysisData } from "@/types/analytics";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export function PriceFsAnalysis() {
  const [data, setData] = useState<PriceFsAnalysisData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fsValue, setFsValue] = useState<string>("");
  const [doValue, setDoValue] = useState<string>("");
  const [year, setYear] = useState<number | undefined>(new Date().getFullYear());
  const [month, setMonth] = useState<number | undefined>(undefined);

  const handleAnalyze = async () => {
    if (!fsValue || !doValue) {
      return;
    }

    setIsLoading(true);
    try {
      const result = await AnalyticsService.getPriceFsAnalysis({
        fsValue: parseFloat(fsValue),
        doValue: parseFloat(doValue),
        year,
        month,
      });
      setData(result);
    } catch (error) {
      console.error("Error fetching price FS analysis:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("vi-VN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  const getCorrelationStrengthColor = (strength: string) => {
    switch (strength) {
      case "strong":
        return "bg-green-100 text-green-800";
      case "moderate":
        return "bg-yellow-100 text-yellow-800";
      case "weak":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Phân tích Giá với FS và DO</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Input Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="fsValue">
              Giá trị FS (Functional Specification) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="fsValue"
              type="number"
              value={fsValue}
              onChange={(e) => setFsValue(e.target.value)}
              placeholder="4200"
              step="0.01"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="doValue">
              Giá trị DO (Dissolved Oxygen) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="doValue"
              type="number"
              value={doValue}
              onChange={(e) => setDoValue(e.target.value)}
              placeholder="7.5"
              step="0.1"
            />
          </div>
        </div>

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

        <Button
          onClick={handleAnalyze}
          disabled={!fsValue || !doValue || isLoading}
          className="w-full md:w-auto"
        >
          {isLoading ? "Đang phân tích..." : "Phân tích"}
        </Button>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : data ? (
          <>
            <div className="text-sm text-muted-foreground">
              Kỳ: <span className="font-semibold">{data.period}</span>
            </div>

            {/* FS Comparison */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">So sánh với FS</h3>
              <div className="rounded-lg border p-4 space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Giá trị FS nhập vào:{" "}
                    <span className="font-semibold text-foreground">
                      {formatNumber(data.fsComparison.inputFsValue)} VND/kg
                    </span>
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="rounded-lg border p-4 bg-red-50">
                    <p className="text-sm font-medium mb-2">Dưới FS</p>
                    <p className="text-2xl font-bold">
                      {data.fsComparison.comparison.belowFs.count}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {data.fsComparison.comparison.belowFs.percentage.toFixed(
                        1,
                      )}%
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Giá TB: {formatNumber(data.fsComparison.comparison.belowFs.avgPrice)} VND/kg
                    </p>
                  </div>

                  <div className="rounded-lg border p-4 bg-yellow-50">
                    <p className="text-sm font-medium mb-2">Bằng FS</p>
                    <p className="text-2xl font-bold">
                      {data.fsComparison.comparison.atFs.count}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {data.fsComparison.comparison.atFs.percentage.toFixed(1)}%
                    </p>
                  </div>

                  <div className="rounded-lg border p-4 bg-green-50">
                    <p className="text-sm font-medium mb-2">Trên FS</p>
                    <p className="text-2xl font-bold">
                      {data.fsComparison.comparison.aboveFs.count}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {data.fsComparison.comparison.aboveFs.percentage.toFixed(
                        1,
                      )}%
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Giá TB: {formatNumber(data.fsComparison.comparison.aboveFs.avgPrice)} VND/kg
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* DO Correlation */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Tương quan với DO</h3>
              <div className="rounded-lg border p-4 space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Giá trị DO nhập vào:{" "}
                    <span className="font-semibold text-foreground">
                      {data.doCorrelation.inputDoValue}
                    </span>
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Hệ số tương quan
                    </p>
                    <p className="text-2xl font-bold">
                      {data.doCorrelation.correlation.coefficient.toFixed(3)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Độ mạnh
                    </p>
                    <Badge
                      className={getCorrelationStrengthColor(
                        data.doCorrelation.correlation.strength,
                      )}
                    >
                      {data.doCorrelation.correlation.strength === "strong"
                        ? "Mạnh"
                        : data.doCorrelation.correlation.strength === "moderate"
                        ? "Trung bình"
                        : data.doCorrelation.correlation.strength === "weak"
                        ? "Yếu"
                        : "Không"}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Hướng
                    </p>
                    <Badge
                      variant={
                        data.doCorrelation.correlation.direction ===
                        "positive"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {data.doCorrelation.correlation.direction === "positive"
                        ? "Dương"
                        : data.doCorrelation.correlation.direction === "negative"
                        ? "Âm"
                        : "Không"}
                    </Badge>
                  </div>
                </div>

                {/* DO Fluctuations */}
                {data.doCorrelation.fluctuations.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium mb-2">
                      Biến động theo khoảng DO
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {data.doCorrelation.fluctuations.map((fluctuation, idx) => (
                        <div key={idx} className="rounded-lg border p-3">
                          <p className="text-xs font-medium mb-1">
                            {fluctuation.doRange}
                          </p>
                          <p className="text-sm">
                            Giá TB: {formatNumber(fluctuation.avgPrice)} VND/kg
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {fluctuation.recordCount} bản ghi
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Overall Statistics */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Thống kê tổng quan</h3>
              <div className="rounded-lg border p-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Min</p>
                    <p className="text-lg font-semibold">
                      {formatNumber(data.overallStats.min)} VND/kg
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Max</p>
                    <p className="text-lg font-semibold">
                      {formatNumber(data.overallStats.max)} VND/kg
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Trung bình</p>
                    <p className="text-lg font-semibold">
                      {formatNumber(data.overallStats.mean)} VND/kg
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Trung vị</p>
                    <p className="text-lg font-semibold">
                      {formatNumber(data.overallStats.median)} VND/kg
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Độ lệch chuẩn</p>
                    <p className="text-lg font-semibold">
                      {formatNumber(data.overallStats.stdDev)} VND/kg
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Số lượng</p>
                    <p className="text-lg font-semibold">
                      {data.overallStats.count}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            Nhập giá trị FS và DO để phân tích
          </div>
        )}
      </CardContent>
    </Card>
  );
}
