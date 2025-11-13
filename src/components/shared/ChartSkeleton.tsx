import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface ChartSkeletonProps {
  title?: string;
  height?: string;
}

/**
 * Unified loading skeleton for chart components
 * Provides consistent loading experience across dashboard charts
 */
export function ChartSkeleton({ title, height = "h-[350px]" }: ChartSkeletonProps) {
  return (
    <Card className="shadow-soft">
      <CardHeader>
        {title ? (
          <Skeleton className="h-6 w-48" />
        ) : (
          <Skeleton className="h-6 w-32" />
        )}
      </CardHeader>
      <CardContent>
        <Skeleton className={`${height} w-full`} />
      </CardContent>
    </Card>
  );
}
