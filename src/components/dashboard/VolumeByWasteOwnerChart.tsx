"use client";

import { useState, useEffect, useMemo } from "react";
import { BarChart, BarChartDataPoint } from "./BarChart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getVolumeByWasteOwnerData,
  mockWasteOwners,
  chartColors,
} from "@/lib/mock/dashboard.mock";
import { WasteOwnerService } from "@/lib/services/waste-owner.service";

interface VolumeByWasteOwnerChartProps {
  className?: string;
}

export function VolumeByWasteOwnerChart({
  className,
}: VolumeByWasteOwnerChartProps) {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedWasteOwnerId, setSelectedWasteOwnerId] = useState<string>("all");
  const [wasteOwners, setWasteOwners] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [isLoadingWasteOwners, setIsLoadingWasteOwners] = useState(true);

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
        // Fallback to mock data
        setWasteOwners(mockWasteOwners);
      } finally {
        setIsLoadingWasteOwners(false);
      }
    };

    fetchWasteOwners();
  }, []);

  // Generate years dropdown (current year and previous 4 years)
  const availableYears = useMemo(() => {
    const years: number[] = [];
    for (let i = 0; i < 5; i++) {
      years.push(currentYear - i);
    }
    return years;
  }, [currentYear]);

  // Get chart data based on selected filters
  const chartData: BarChartDataPoint[] = useMemo(() => {
    return getVolumeByWasteOwnerData(selectedYear, selectedWasteOwnerId);
  }, [selectedYear, selectedWasteOwnerId]);

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
              onValueChange={(value) => setSelectedYear(Number(value))}
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
              value={selectedWasteOwnerId}
              onValueChange={setSelectedWasteOwnerId}
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
        {chartData.length > 0 ? (
          <>
            <p className="text-sm text-muted-foreground mb-4">
              {selectedWasteOwnerId === "all"
                ? "Tổng nguồn thải thu được theo tháng (kg)"
                : `Tổng nguồn thải thu được từ ${selectedWasteOwnerName} theo tháng (kg)`}
            </p>
            <BarChart
              data={chartData}
              dataKey="value"
              xAxisKey="month"
              color={chartColors.primary}
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

