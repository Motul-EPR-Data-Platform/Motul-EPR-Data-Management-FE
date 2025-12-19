"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { PageLayout } from "@/components/layout/PageLayout";
import { DefinitionTable } from "@/components/definitions/DefinitionTable";
import { CreateDefinitionDialog } from "@/components/definitions/CreateDefinitionDialog";
import { DefinitionService } from "@/lib/services/definition.service";
import { getDefinitionsByCategory } from "@/lib/utils/definitionUtils/definitionHelpers";
import { transformCategory } from "@/lib/utils/definitionUtils/definitionTransformers";
import { Category, Definition, FieldSchema } from "@/types/definition";
import { useAuth } from "@/contexts/AuthContext";
import { usePermission } from "@/hooks/usePermission";
import { toast } from "sonner";
import { DashboardSkeleton } from "@/components/skeleton/DashboardSkeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { CATEGORY_KEYS, CATEGORY_ROUTE_KEYS, routeKeyToBackendKey, isStandardCategory } from "@/constants/categoryKeys";

export function CategoryDetailPageClient() {
  const params = useParams();
  const { organization } = useAuth();
  const categoryKey = params.categoryKey as string;

  const [category, setCategory] = useState<Category | null>(null);
  const [definitions, setDefinitions] = useState<Definition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Use permission checks
  const canCreate = usePermission("definitions.create");
  const canDelete = usePermission("definitions.delete");

  useEffect(() => {
    loadData();
  }, [categoryKey]);

  /**
   * Get default schema for standard categories that don't have a registry entry
   */
  const getDefaultCategorySchema = (key: string): Category | null => {
    const backendKey = routeKeyToBackendKey(key);
    
    if (backendKey === CATEGORY_KEYS.HAZ_TYPE || key === CATEGORY_ROUTE_KEYS.HAZ_TYPES) {
      return {
        id: "haz_type_default",
        key: CATEGORY_KEYS.HAZ_TYPE,
        name: "Mã HAZ",
        description: "Quản lý các mã HAZ (Hazardous)",
        isActive: true,
        schemaDefinition: [
          {
            name: "code",
            type: "string",
            label: "Mã",
            required: true,
            placeholder: "Nhập mã HAZ",
          },
          {
            name: "haz_code",
            type: "string",
            label: "Mã HAZ",
            required: true,
            placeholder: "Nhập mã HAZ (ví dụ: H01, H02)",
          },
          {
            name: "description",
            type: "textarea",
            label: "Mô tả",
            required: false,
            placeholder: "Nhập mô tả (tùy chọn)",
          },
        ] as FieldSchema[],
      };
    }
    
    return null;
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const backendKey = routeKeyToBackendKey(categoryKey);
      let categoryData: any = null;
      
      // Try to fetch category from registry
      try {
        categoryData = await DefinitionService.getCategoryByKey(backendKey);
      } catch (error: any) {
        // If category not found and it's a standard category, use default schema
        if (isStandardCategory(categoryKey) || isStandardCategory(backendKey)) {
          const defaultCategory = getDefaultCategorySchema(categoryKey);
          if (defaultCategory) {
            categoryData = defaultCategory;
          }
        } else {
          throw error; // Re-throw if it's not a standard category
        }
      }

      const definitionsData = await getDefinitionsByCategory(categoryKey);

      // Transform backend snake_case to frontend camelCase
      const transformedCategory = categoryData.id === "haz_type_default" 
        ? categoryData 
        : transformCategory(categoryData);
      setCategory(transformedCategory);
      setDefinitions(definitionsData);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Không thể tải dữ liệu");
    } finally {
      setIsLoading(false);
    }
  };

  const handleArchive = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn lưu trữ định nghĩa này?")) {
      return;
    }

    try {
      await toast.promise(DefinitionService.archive(id), {
        loading: "Đang lưu trữ...",
        success: "Lưu trữ định nghĩa thành công",
        error: (err) =>
          err?.response?.data?.message || "Không thể lưu trữ định nghĩa",
      });
      loadData();
    } catch (error) {
      // Error handled by toast
    }
  };

  const handleCreateSuccess = () => {
    loadData();
  };

  // Filter definitions based on search query
  const filteredDefinitions = definitions.filter((def) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const data = def.data as any;
    return (
      data?.code?.toLowerCase().includes(query) ||
      data?.name?.toLowerCase().includes(query) ||
      data?.description?.toLowerCase().includes(query)
    );
  });

  if (isLoading) {
    return (
      <PageLayout
        breadcrumbs={[
          { label: "Định nghĩa", href: `/${organization}/definitions` },
          { label: categoryKey },
        ]}
        title={categoryKey}
        subtitle="Chi tiết danh mục"
      >
        <DashboardSkeleton />
      </PageLayout>
    );
  }

  if (!category) {
    return (
      <PageLayout
        breadcrumbs={[
          { label: "Định nghĩa", href: `/${organization}/definitions` },
          { label: categoryKey },
        ]}
        title="Không tìm thấy"
        subtitle="Danh mục không tồn tại"
      >
        <div className="rounded-lg border bg-card p-6">
          <p className="text-center text-muted-foreground py-12">
            Danh mục không tồn tại
          </p>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      breadcrumbs={[
        { label: "Định nghĩa", href: `/${organization}/definitions` },
        { label: category.name },
      ]}
      title={category.name}
      subtitle={category.description || "Chi tiết danh mục"}
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Danh sách định nghĩa</h3>
            <p className="text-sm text-muted-foreground">
              {definitions.length} định nghĩa trong danh mục này
            </p>
          </div>
          {canCreate && (
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Thêm định nghĩa
            </Button>
          )}
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm định nghĩa..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <DefinitionTable
          definitions={filteredDefinitions}
          categoryKey={categoryKey}
          onArchive={canDelete ? handleArchive : undefined}
          showActions={canDelete}
        />
      </div>

      {category && (
        <CreateDefinitionDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          category={category}
          categoryKey={categoryKey}
          onSuccess={handleCreateSuccess}
        />
      )}
    </PageLayout>
  );
}
