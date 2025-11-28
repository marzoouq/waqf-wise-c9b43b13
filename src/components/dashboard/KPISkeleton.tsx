import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface KPISkeletonProps {
  count?: number;
}

export function KPISkeleton({ count = 8 }: KPISkeletonProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6 md:mb-8">
      {[...Array(count)].map((_, i) => (
        <Card key={`kpi-skeleton-${i}`} className="shadow-soft">
          <CardHeader className="pb-2 sm:pb-3">
            <Skeleton className="h-3 sm:h-4 w-24 sm:w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-6 sm:h-8 w-20 sm:w-24 mb-1 sm:mb-2" />
            <Skeleton className="h-2 sm:h-3 w-16 sm:w-20" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
