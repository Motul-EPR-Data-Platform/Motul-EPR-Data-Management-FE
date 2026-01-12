"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BatchAnalysis } from "./BatchAnalysis";
import { PriceFsAnalysis } from "./PriceFsAnalysis";
import { PriceZoneAnalysis } from "./PriceZoneAnalysis";

export function AnalyticsPageContent() {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="batch" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="batch">Phân tích Lô hàng</TabsTrigger>
          <TabsTrigger value="price-fs">Phân tích Giá FS/DO</TabsTrigger>
          <TabsTrigger value="price-zones">Phân tích Vùng Giá</TabsTrigger>
        </TabsList>

        <TabsContent value="batch" className="mt-6">
          <BatchAnalysis />
        </TabsContent>

        <TabsContent value="price-fs" className="mt-6">
          <PriceFsAnalysis />
        </TabsContent>

        <TabsContent value="price-zones" className="mt-6">
          <PriceZoneAnalysis />
        </TabsContent>
      </Tabs>
    </div>
  );
}
