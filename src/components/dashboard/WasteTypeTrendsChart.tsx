"use client";

import { useState, useEffect, useMemo } from "react";
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { DashboardService } from "@/lib/services/dashboard.service";
import { DefinitionService } from "@/lib/services/definition.service";
import { WasteTypeTrendData } from "@/types/dashboard";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface WasteTypeTrendsChartProps {
  className?: string;
  initialData?: WasteTypeTrendData;
  selectedYear?: number;
  onYearChange?: (year: number) => void;
}

import { LINE_CHART_COLORS } from "@/constants/colors";

const lineChartColors = LINE_CHART_COLORS;

export function WasteTypeTrendsChart({
  className,
  initialData,
  selectedYear: propSelectedYear,
  onYearChange: propOnYearChange,
}: WasteTypeTrendsChartProps) {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(
    propSelectedYear || currentYear
  );
  const [selectedWasteSourceIds, setSelectedWasteSourceIds] = useState<
    string[]
  >([]);
  // Persistent map of id -> human readable name to avoid showing raw IDs
  const [wasteSourceNameMap, setWasteSourceNameMap] = useState<
    Record<string, string>
  >({});
  const [availableWasteSources, setAvailableWasteSources] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [trendsData, setTrendsData] = useState<{
    [wasteSourceId: string]: {
      wasteSourceName: string;
      monthlyPrices: number[];
    };
  }>(initialData?.trends || {});
  const [isLoading, setIsLoading] = useState(!initialData);
  const [isLoadingSources, setIsLoadingSources] = useState(true);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  // Update selectedYear when prop changes
  useEffect(() => {
    if (propSelectedYear !== undefined) {
      setSelectedYear(propSelectedYear);
    }
  }, [propSelectedYear]);

  // Update trendsData when initialData changes
  useEffect(() => {
    if (initialData) {
      setTrendsData(initialData.trends);
      setIsLoading(false);
    }
  }, [initialData]);

  // Fetch all waste sources (definitions) and show all in dropdown
  useEffect(() => {
    const fetchWasteSources = async () => {
      setIsLoadingSources(true);
      try {
        // Always show ALL active waste types (definitions) in the dropdown
        const wasteTypes = await DefinitionService.getActiveWasteTypes();
        const nameMap: Record<string, string> = {};
        const sources =
          (wasteTypes || []).map((wt: any) => {
            // Handle nested structure: definition_waste_type.name or definition_waste_type.code
            const wasteTypeData = wt.definition_waste_type || wt;
            const name =
              wasteTypeData.name ||
              wasteTypeData.code ||
              `Waste Source ${String(wt.id || "").slice(0, 8)}`;
            return {
              id: wt.id,
              name: name,
            };
          }) || [];

        // Build base name map from definitions
        for (const wt of wasteTypes || []) {
          const id = wt.id as string;
          // Handle nested structure: definition_waste_type.name or definition_waste_type.code
          const wasteTypeData = wt.definition_waste_type || wt;
          const display =
            wasteTypeData.name ||
            wasteTypeData.code ||
            `Waste Source ${String(wt.id || "").slice(0, 8)}`;
          if (id) {
            nameMap[id] = display;
          }
        }

        // Also enrich from distribution names when available
        try {
          const distributionData =
            await DashboardService.getWasteSourceDistribution({
              period: "all",
            });
          for (const item of distributionData.distribution || []) {
            const id = item.wasteSourceId as string;
            const name = item.wasteSourceName as string;
            if (id && name && name !== id) {
              nameMap[id] = nameMap[id] || name;
            }
          }
        } catch {
          // ignore, not critical for dropdown listing
        }

        // Sort alphabetically for easier scan
        sources.sort((a: any, b: any) => a.name.localeCompare(b.name, "vi"));

        setAvailableWasteSources(sources);
        setWasteSourceNameMap(nameMap);

        // Auto-select up to 4 items on first load if nothing selected yet
        if (sources.length > 0 && selectedWasteSourceIds.length === 0) {
          setSelectedWasteSourceIds(sources.slice(0, 4).map((s: any) => s.id));
        }
      } catch (error) {
        console.error("Error fetching waste sources:", error);
        setAvailableWasteSources([]);
      } finally {
        setIsLoadingSources(false);
      }
    };

    fetchWasteSources();
  }, []);

  // Helper: detect if a string looks like a raw ID/UUID/hex
  const looksLikeId = (value?: string) => {
    if (!value) return false;
    if (value.includes("-") && value.length >= 8) return true;
    return /^[0-9a-f]{8,}$/i.test(value);
  };

  // Helper: get display name from map, with sensible fallbacks
  const getDisplayName = (id: string, fallback?: string) => {
    return (
      wasteSourceNameMap[id] ||
      (!looksLikeId(fallback) && fallback) ||
      `Waste Source ${id.slice(0, 8)}`
    );
  };

  // Fetch trends data (only if not provided via props or when filters change)
  useEffect(() => {
    // If we have initial data and no waste source filters, use it
    if (initialData && selectedWasteSourceIds.length === 0) {
      setTrendsData(initialData.trends);
      setIsLoading(false);
      return;
    }

    // If no waste sources selected, clear data
    if (selectedWasteSourceIds.length === 0) {
      setTrendsData({});
      setIsLoading(false);
      return;
    }

    // Otherwise, fetch with filters
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const data = await DashboardService.getWasteTypeTrends({
          year: selectedYear,
          wasteSourceIds: selectedWasteSourceIds,
        });
        // Merge returned names into our map (but don't overwrite existing pretty names)
        const mergedMap: Record<string, string> = { ...wasteSourceNameMap };
        for (const [id, trend] of Object.entries(data.trends || {})) {
          if (trend.wasteSourceName && !looksLikeId(trend.wasteSourceName)) {
            if (!mergedMap[id]) mergedMap[id] = trend.wasteSourceName;
          }
        }
        setWasteSourceNameMap(mergedMap);
        setTrendsData(data.trends);
      } catch (error) {
        console.error("Error fetching waste type trends:", error);
        setTrendsData({});
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedYear, selectedWasteSourceIds, initialData]);

  // Generate years dropdown
  const availableYears = useMemo(() => {
    const years: number[] = [];
    for (let i = 0; i < 5; i++) {
      years.push(currentYear - i);
    }
    return years;
  }, [currentYear]);

  // Transform trends data to chart format
  const chartData = useMemo(() => {
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

    const data: Array<{ [key: string]: string | number }> = [];

    for (let i = 0; i < 12; i++) {
      const dataPoint: { [key: string]: string | number } = {
        month: monthNames[i],
      };

      selectedWasteSourceIds.forEach((sourceId) => {
        const trend = trendsData[sourceId];
        if (trend) {
          const display = getDisplayName(sourceId, trend.wasteSourceName);
          dataPoint[display] = trend.monthlyPrices[i] || 0;
        }
      });

      data.push(dataPoint);
    }

    return data;
  }, [trendsData, selectedWasteSourceIds]);

  // Prepare line series for chart
  const lineSeries = useMemo(() => {
    return selectedWasteSourceIds.map((sourceId, index) => {
      const trend = trendsData[sourceId];
      return {
        dataKey: getDisplayName(sourceId, trend?.wasteSourceName),
        name: getDisplayName(sourceId, trend?.wasteSourceName),
        color: lineChartColors[index % lineChartColors.length],
      };
    });
  }, [trendsData, selectedWasteSourceIds, wasteSourceNameMap]);

  const handleWasteSourceToggle = (sourceId: string) => {
    setSelectedWasteSourceIds((prev) => {
      if (prev.includes(sourceId)) {
        return prev.filter((id) => id !== sourceId);
      } else {
        if (prev.length >= 4) {
          // Max 4 selected
          return prev;
        }
        return [...prev, sourceId];
      }
    });
  };

  const selectedCount = selectedWasteSourceIds.length;
  const selectedNames = selectedWasteSourceIds
    .map((id) => {
      const source = availableWasteSources.find((s) => s.id === id);
      return getDisplayName(id, source?.name || id);
    })
    .filter(Boolean);

  const displayText =
    selectedCount === 0
      ? "Chọn loại chất thải"
      : selectedCount === 1
        ? selectedNames[0] || `Đã chọn ${selectedCount} loại`
        : `Đã chọn ${selectedCount} loại`;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          Xu hướng theo loại chất thải
        </CardTitle>
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          {/* Waste Source Filter */}
          <div className="flex-1 sm:flex-initial sm:w-[250px]">
            <Label htmlFor="waste-source-filter">
              LOẠI CHẤT THẢI (TỐI ĐA 4)
            </Label>
            <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between"
                  id="waste-source-filter"
                >
                  <span>{displayText}</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[300px] p-0" align="start">
                <div className="max-h-[300px] overflow-y-auto">
                  {isLoadingSources ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    </div>
                  ) : availableWasteSources.length > 0 ? (
                    <div className="p-2">
                      {availableWasteSources.map((source) => {
                        const isSelected = selectedWasteSourceIds.includes(
                          source.id,
                        );
                        const isDisabled =
                          !isSelected && selectedWasteSourceIds.length >= 4;
                        return (
                          <div
                            key={source.id}
                            className={cn(
                              "flex items-center space-x-2 p-2 rounded hover:bg-accent cursor-pointer",
                              isDisabled && "opacity-50 cursor-not-allowed",
                              isSelected && "bg-primary/10",
                            )}
                            onClick={() => {
                              if (!isDisabled) {
                                handleWasteSourceToggle(source.id);
                              }
                            }}
                          >
                            <div
                              className={cn(
                                "w-4 h-4 border-2 rounded flex items-center justify-center",
                                isSelected
                                  ? "bg-primary border-primary"
                                  : "border-border",
                                isDisabled && "opacity-50",
                              )}
                            >
                              {isSelected && (
                                <svg
                                  className="w-3 h-3 text-white"
                                  fill="none"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                            <Label
                              className={cn(
                                "flex-1 cursor-pointer",
                                isDisabled && "cursor-not-allowed",
                              )}
                            >
                              {source.name}
                            </Label>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      Không có dữ liệu
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Year Filter */}
          <div className="flex-1 sm:flex-initial sm:w-[150px]">
            <Label htmlFor="year-filter">NĂM</Label>
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
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : chartData.length > 0 && lineSeries.length > 0 ? (
          <>
            {/* Legend */}
            <div className="flex flex-wrap gap-4 mb-4">
              {lineSeries.map((series) => (
                <div key={series.dataKey} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: series.color }}
                  />
                  <span className="text-sm">{series.name}</span>
                </div>
              ))}
            </div>

            <ResponsiveContainer width="100%" height={400}>
              <RechartsLineChart
                data={chartData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                  dataKey="month"
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
                  unit=" VNĐ/kg"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: "0.5rem",
                    padding: "0.5rem",
                  }}
                />
                {lineSeries.map((series) => (
                  <Line
                    key={series.dataKey}
                    type="monotone"
                    dataKey={series.dataKey}
                    name={series.name}
                    stroke={series.color}
                    strokeWidth={2}
                    dot={{ fill: series.color, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                ))}
              </RechartsLineChart>
            </ResponsiveContainer>
          </>
        ) : (
          <p className="text-center text-muted-foreground py-12">
            {selectedWasteSourceIds.length === 0
              ? "Vui lòng chọn ít nhất một loại chất thải"
              : "Không có dữ liệu cho năm " + selectedYear}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

