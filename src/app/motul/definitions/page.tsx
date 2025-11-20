"use client";

import { useState, useEffect } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CategoryCard } from "@/components/definitions/CategoryCard";
import { PendingDefinitionTable } from "@/components/definitions/PendingDefinitionTable";
import { DefinitionService } from "@/lib/services/definition.service";
import { Category, Definition } from "@/types/definition";
import { useAuth } from "@/contexts/AuthContext";
import { usePermission } from "@/hooks/usePermission";
import { transformCategories, transformDefinitions } from "@/lib/utils/definitionUtils/definitionTransformers";
import { toast } from "sonner";
import { DashboardSkeleton } from "@/components/skeleton/DashboardSkeleton";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function DefinitionsPage() {
  const { userRole, organization, user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [pendingDefinitions, setPendingDefinitions] = useState<Definition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("categories");
  const [searchQuery, setSearchQuery] = useState("");

  // Use permission checks instead of role checks
  const canApprove = usePermission("definitions.approve");
  const canReject = usePermission("definitions.reject");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [categoriesResult, pendingResult] = await Promise.allSettled([
        DefinitionService.getAllCategories(),
        DefinitionService.getAllDefinitions({ status: "pending" }),
      ]);

      // Handle categories
      let categoriesData: any[] = [];
      if (categoriesResult.status === 'fulfilled') {
        categoriesData = categoriesResult.value;
      } else {
        toast.error("Không thể tải danh mục");
      }

      // Handle pending definitions
      let pendingData: any[] = [];
      if (pendingResult.status === 'fulfilled') {
        // Transform backend response to frontend format
        pendingData = transformDefinitions(pendingResult.value || []);
      }

      // Transform backend snake_case to frontend camelCase
      if (!categoriesData || !Array.isArray(categoriesData)) {
        setCategories([]);
      } else {
        try {
          const transformedCategories = transformCategories(categoriesData);
          setCategories(transformedCategories);
        } catch (error) {
          setCategories([]);
        }
      }

      // Filter pending definitions - Users with approve permission see all, others see only their own
      const filteredPending = canApprove
        ? (pendingData || [])
        : (pendingData || []).filter((def: Definition) => def.createdBy === user?.id);
      
      setPendingDefinitions(filteredPending);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Không thể tải dữ liệu");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await toast.promise(DefinitionService.approve(id), {
        loading: "Đang duyệt...",
        success: "Duyệt định nghĩa thành công",
        error: (err) => err?.response?.data?.message || "Không thể duyệt định nghĩa",
      });
      loadData();
    } catch (error) {
      // Error handled by toast
    }
  };

  const handleReject = async (id: string, reason: string) => {
    try {
      await toast.promise(DefinitionService.reject(id, { reason }), {
        loading: "Đang từ chối...",
        success: "Từ chối định nghĩa thành công",
        error: (err) => err?.response?.data?.message || "Không thể từ chối định nghĩa",
      });
      loadData();
    } catch (error) {
      // Error handled by toast
    }
  };

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cat.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <PageLayout
        breadcrumbs={[{ label: "Định nghĩa" }]}
        title="Định nghĩa"
        subtitle="Quản lý các định nghĩa và danh mục"
      >
        <DashboardSkeleton />
      </PageLayout>
    );
  }

  return (
    <PageLayout
      breadcrumbs={[{ label: "Định nghĩa" }]}
      title="Định nghĩa"
      subtitle="Quản lý các định nghĩa và danh mục"
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="rounded-lg border bg-card p-6 space-y-4">
          <TabsList>
            <TabsTrigger value="categories">Tất cả danh mục</TabsTrigger>
            <TabsTrigger value="pending">Yêu cầu chờ duyệt</TabsTrigger>
          </TabsList>

          <TabsContent value="categories" className="space-y-4 mt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm danh mục..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {filteredCategories.length === 0 ? (
              <div className="rounded-lg border bg-card p-6">
                <p className="text-center text-muted-foreground py-12">
                  {searchQuery ? "Không tìm thấy danh mục nào" : "Không có danh mục nào"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCategories.map((category) => (
                  <CategoryCard key={category.key} category={category} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="pending" className="space-y-4 mt-4">
            <PendingDefinitionTable
              definitions={pendingDefinitions}
              onApprove={canApprove ? handleApprove : undefined}
              onReject={canReject ? handleReject : undefined}
              isMotulAdmin={canApprove && canReject}
            />
          </TabsContent>
        </div>
      </Tabs>
    </PageLayout>
  );
}

