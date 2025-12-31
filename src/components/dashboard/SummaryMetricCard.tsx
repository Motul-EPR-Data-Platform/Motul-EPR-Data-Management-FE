"use client";

import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Clock, CheckCircle2, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface SummaryMetricCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    label: string;
    isPositive?: boolean;
  };
  icon?: React.ReactNode;
  className?: string;
}

export function SummaryMetricCard({
  title,
  value,
  change,
  icon,
  className,
}: SummaryMetricCardProps) {
  return (
    <Card className={cn("border bg-white", className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground mb-2">
              {title}
            </p>
            <p className="text-3xl font-bold text-foreground">{value}</p>
            {change && (
              <div
                className={cn(
                  "flex items-center gap-1 mt-2 text-sm",
                  change.isPositive !== false
                    ? "text-green-600"
                    : "text-red-600",
                )}
              >
                {change.isPositive !== false ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                <span>{change.label}</span>
              </div>
            )}
          </div>
          {icon && (
            <div className="text-muted-foreground opacity-50">{icon}</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

