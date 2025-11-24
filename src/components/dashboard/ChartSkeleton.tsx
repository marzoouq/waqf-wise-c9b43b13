import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface ChartSkeletonProps {
  title?: string;
  height?: string;
  showLegend?: boolean;
}

export function ChartSkeleton({ 
  title, 
  height = "h-[350px]",
  showLegend = true 
}: ChartSkeletonProps) {
  return (
    <Card>
      <CardHeader className="space-y-2">
        {title && (
          <Skeleton className="h-5 w-32" />
        )}
        <Skeleton className="h-3 w-48" />
      </CardHeader>
      <CardContent>
        <div className={cn("flex items-end justify-between gap-2", height)}>
          {[...Array(8)].map((_, i) => (
            <Skeleton 
              key={i}
              className="w-full animate-pulse"
              style={{ 
                height: `${Math.random() * 60 + 40}%`,
                animationDelay: `${i * 100}ms`
              }}
            />
          ))}
        </div>
        {showLegend && (
          <div className="mt-4 flex justify-center gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <Skeleton className="h-3 w-3 rounded-full" />
                <Skeleton className="h-3 w-16" />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
