"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Category } from "@/types/definition";
import { ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

interface CategoryCardProps {
  category: Category;
  definitionCount?: number;
}

export function CategoryCard({
  category,
  definitionCount = 0,
}: CategoryCardProps) {
  const router = useRouter();
  const { organization } = useAuth();

  const handleClick = () => {
    router.push(`/${organization}/definitions/${category.key}`);
  };

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={handleClick}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{category.name}</CardTitle>
            {category.description && (
              <CardDescription className="mt-2">
                {category.description}
              </CardDescription>
            )}
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant={category.isActive ? "default" : "secondary"}>
              {category.isActive ? "Hoạt động" : "Không hoạt động"}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {definitionCount} định nghĩa
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
