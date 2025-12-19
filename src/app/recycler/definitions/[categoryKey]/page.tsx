import { CategoryDetailPageClient } from "./CategoryDetailPageClient";
import { CATEGORY_KEYS } from "@/constants/categoryKeys";

// Required for static export with dynamic routes
export function generateStaticParams() {
  // Return all known category keys (backend format) for static generation
  // The CategoryCard uses category.key which is in backend format (waste_type)
  // Custom categories will need to be added here or handled differently
  return [
    { categoryKey: CATEGORY_KEYS.WASTE_TYPE },
    { categoryKey: CATEGORY_KEYS.CONTRACT_TYPE },
    { categoryKey: CATEGORY_KEYS.EPR_ENTITY },
    { categoryKey: CATEGORY_KEYS.HAZ_TYPE },
  ];
}

export default function CategoryDetailPage() {
  return <CategoryDetailPageClient />;
}
