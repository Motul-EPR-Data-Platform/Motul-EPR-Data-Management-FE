import { Skeleton } from "@/components/ui/skeleton";

export function DashboardSkeleton() {
  return (
    <div className="grid grid-cols-3 gap-6 mt-6">
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-40 rounded-md" />
      ))}
    </div>
  );
}
