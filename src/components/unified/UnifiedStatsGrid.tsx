import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface UnifiedStatsGridProps {
  children: ReactNode;
  columns?: 1 | 2 | 3 | 4;
  className?: string;
}

const gridColumns = {
  1: "grid-cols-1",
  2: "grid-cols-1 md:grid-cols-2",
  3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
};

/**
 * UnifiedStatsGrid - شبكة إحصائيات موحدة
 * تستخدم لعرض بطاقات KPI بشكل متناسق
 */
export function UnifiedStatsGrid({
  children,
  columns = 4,
  className,
}: UnifiedStatsGridProps) {
  return (
    <div
      className={cn(
        "grid gap-4 sm:gap-6",
        gridColumns[columns],
        className
      )}
    >
      {children}
    </div>
  );
}
