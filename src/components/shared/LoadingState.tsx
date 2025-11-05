import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingStateProps {
  message?: string;
  size?: "sm" | "md" | "lg";
  fullScreen?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-8 w-8",
  lg: "h-12 w-12",
};

export function LoadingState({ 
  message = "جاري التحميل...", 
  size = "md",
  fullScreen = false,
  className 
}: LoadingStateProps) {
  const content = (
    <div className={cn("text-center space-y-4", className)}>
      <div className="flex justify-center">
        <Loader2 className={cn("animate-spin text-primary", sizeClasses[size])} />
      </div>
      {message && (
        <p className="text-sm text-muted-foreground">{message}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        {content}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-12">
      {content}
    </div>
  );
}

// Skeleton loading states for different components
export function TableLoadingSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-12 bg-muted animate-pulse rounded" />
      ))}
    </div>
  );
}

export function CardLoadingSkeleton() {
  return (
    <div className="space-y-4 p-6 bg-card rounded-lg border">
      <div className="h-6 w-1/3 bg-muted animate-pulse rounded" />
      <div className="h-4 w-2/3 bg-muted animate-pulse rounded" />
      <div className="h-4 w-1/2 bg-muted animate-pulse rounded" />
    </div>
  );
}

export function StatsLoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="p-6 bg-card rounded-lg border space-y-3">
          <div className="h-4 w-1/2 bg-muted animate-pulse rounded" />
          <div className="h-8 w-3/4 bg-muted animate-pulse rounded" />
        </div>
      ))}
    </div>
  );
}
