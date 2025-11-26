import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface UnifiedStatsGridProps {
  children: ReactNode;
  columns?: 1 | 2 | 3 | 4 | { sm?: number; md?: number; lg?: number; xl?: number };
  className?: string;
}

/**
 * UnifiedStatsGrid - شبكة إحصائيات موحدة
 * تستخدم لعرض بطاقات KPI بشكل متناسق مع دعم responsive
 */
export function UnifiedStatsGrid({
  children,
  columns = 4,
  className,
}: UnifiedStatsGridProps) {
  // Handle responsive columns object or simple number
  const getGridClasses = () => {
    if (typeof columns === 'object') {
      const classes = ['grid-cols-1'];
      if (columns.sm) classes.push(`sm:grid-cols-${columns.sm}`);
      if (columns.md) classes.push(`md:grid-cols-${columns.md}`);
      if (columns.lg) classes.push(`lg:grid-cols-${columns.lg}`);
      if (columns.xl) classes.push(`xl:grid-cols-${columns.xl}`);
      return classes.join(' ');
    }
    
    const gridColumns = {
      1: "grid-cols-1",
      2: "grid-cols-1 md:grid-cols-2",
      3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
      4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
    };
    return gridColumns[columns];
  };

  return (
    <div
      className={cn(
        "grid gap-4 sm:gap-6",
        getGridClasses(),
        className
      )}
    >
      {children}
    </div>
  );
}
