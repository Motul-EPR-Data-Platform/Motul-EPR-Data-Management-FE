"use client";

import { useState, useEffect, useMemo } from "react";
import { BarChart, BarChartDataPoint } from "./BarChart";
import { CHART_COLORS } from "@/constants/colors";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardService } from "@/lib/services/dashboard.service";
import { WasteOwnerService } from "@/lib/services/waste-owner.service";
import { MonthlyCollectionData } from "@/types/dashboard";
import { Loader2 } from "lucide-react";

interface MonthlyCollectionChartProps {
  className?: string;
  initialData?: MonthlyCollectionData;
  selectedYear?: number;
  onYearChange?: (year: number) => void;
}

export function MonthlyCollectionChart({
  className,
  initialData,
  selectedYear: propSelectedYear,
  onYearChange: propOnYearChange,
}: MonthlyCollectionChartProps) {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(
    propSelectedYear || currentYear
  );
  const [selectedWasteOwnerId, setSelectedWasteOwnerId] =
    useState<string | null>(null);
  const [wasteOwners, setWasteOwners] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [monthlyData, setMonthlyData] = useState<number[]>(
    initialData?.monthlyData || []
  );
  const [isLoading, setIsLoading] = useState(!initialData);
  const [isLoadingWasteOwners, setIsLoadingWasteOwners] = useState(true);

  // Update selectedYear when prop changes
  useEffect(() => {
    if (propSelectedYear !== undefined) {
      setSelectedYear(propSelectedYear);
    }
  }, [propSelectedYear]);

  // Update monthlyData when initialData changes
  useEffect(() => {
    if (initialData) {
      setMonthlyData(initialData.monthlyData);
      setIsLoading(false);
    }
  }, [initialData]);

  // Fetch waste owners on mount
  useEffect(() => {
    const fetchWasteOwners = async () => {
      try {
        const response = await WasteOwnerService.getAllWasteOwners({
          isActive: true,
        });
        const allOption = { id: "all", name: "Tất cả" };
        const mappedWasteOwners = [
          allOption,
          ...(response.data || []).map((wo) => ({
            id: wo.id,
            name: wo.name,
          })),
        ];
        setWasteOwners(mappedWasteOwners);
      } catch (error) {
        console.error("Error fetching waste owners:", error);
      } finally {
        setIsLoadingWasteOwners(false);
      }
    };

    fetchWasteOwners();
  }, []);

  // Fetch monthly collection data (only if not provided via props or when filters change)
  useEffect(() => {
    // If we have initial data and no waste owner filter, use it
    if (initialData && !selectedWasteOwnerId) {
      setMonthlyData(initialData.monthlyData);
      setIsLoading(false);
      return;
    }

    // Otherwise, fetch with filters
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const data = await DashboardService.getMonthlyCollectionByOwner({
          year: selectedYear,
          wasteOwnerId: selectedWasteOwnerId === "all" ? null : selectedWasteOwnerId,
        });
        setMonthlyData(data.monthlyData);
      } catch (error) {
        console.error("Error fetching monthly collection data:", error);
        setMonthlyData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedYear, selectedWasteOwnerId, initialData]);

  // Generate years dropdown (current year and previous 4 years)
  const availableYears = useMemo(() => {
    const years: number[] = [];
    for (let i = 0; i < 5; i++) {
      years.push(currentYear - i);
    }
    return years;
  }, [currentYear]);

  // Transform monthly data to chart format
  const chartData: BarChartDataPoint[] = useMemo(() => {
    const monthNames = [
      "T1",
      "T2",
      "T3",
      "T4",
      "T5",
      "T6",
      "T7",
      "T8",
      "T9",
      "T10",
      "T11",
      "T12",
    ];
    return monthlyData.map((value, index) => ({
      month: monthNames[index],
      value: value,
    }));
  }, [monthlyData]);

  const selectedWasteOwnerName =
    wasteOwners.find((wo) => wo.id === selectedWasteOwnerId)?.name || "Tất cả";

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          Khối lượng theo Chủ nguồn thải
        </CardTitle>
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          {/* Year Filter */}
          <div className="flex-1 sm:flex-initial sm:w-[150px]">
            <Label htmlFor="year-filter">Năm</Label>
            <Select
              value={selectedYear.toString()}
              onValueChange={(value) => {
                const year = Number(value);
                setSelectedYear(year);
                propOnYearChange?.(year);
              }}
            >
              <SelectTrigger id="year-filter">
                <SelectValue placeholder="Chọn năm" />
              </SelectTrigger>
              <SelectContent>
                {availableYears.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Waste Owner Filter */}
          <div className="flex-1 sm:flex-initial sm:w-[200px]">
            <Label htmlFor="waste-owner-filter">Chủ nguồn thải</Label>
            <Select
              value={selectedWasteOwnerId || "all"}
              onValueChange={(value) =>
                setSelectedWasteOwnerId(value === "all" ? null : value)
              }
              disabled={isLoadingWasteOwners}
            >
              <SelectTrigger id="waste-owner-filter">
                <SelectValue placeholder="Chọn chủ nguồn thải" />
              </SelectTrigger>
              <SelectContent>
                {wasteOwners.map((wo) => (
                  <SelectItem key={wo.id} value={wo.id}>
                    {wo.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <div className="px-6 pb-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : chartData.length > 0 && chartData.some((d) => Number(d.value) > 0) ? (
          <>
            <p className="text-sm text-muted-foreground mb-4">
              {selectedWasteOwnerId === null || selectedWasteOwnerId === "all"
                ? "Tổng nguồn thải thu được theo tháng (kg)"
                : `Tổng nguồn thải thu được từ ${selectedWasteOwnerName} theo tháng (kg)`}
            </p>
            <BarChart
              data={chartData}
              dataKey="value"
              xAxisKey="month"
              color={CHART_COLORS.green}
              height={350}
              unit=" kg"
              hideCard={true}
            />
          </>
        ) : (
          <p className="text-center text-muted-foreground py-12">
            Không có dữ liệu cho năm {selectedYear}
          </p>
        )}
      </div>
    </Card>
  );
}

