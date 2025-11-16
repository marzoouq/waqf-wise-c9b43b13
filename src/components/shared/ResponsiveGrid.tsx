import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ResponsiveGridProps {
  children: ReactNode;
  cols?: {
    default?: 1 | 2 | 3 | 4 | 5 | 6;
    sm?: 1 | 2 | 3 | 4 | 5 | 6;
    md?: 1 | 2 | 3 | 4 | 5 | 6;
    lg?: 1 | 2 | 3 | 4 | 5 | 6;
    xl?: 1 | 2 | 3 | 4 | 5 | 6;
    "2xl"?: 1 | 2 | 3 | 4 | 5 | 6;
  };
  gap?: 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12;
  className?: string;
}

/**
 * مكون شبكة متجاوب موحد
 * يدعم تخصيص عدد الأعمدة لكل نقطة توقف
 * 
 * @example
 * <ResponsiveGrid 
 *   cols={{ default: 1, sm: 2, md: 3, lg: 4 }}
 *   gap={4}
 * >
 *   <Card>...</Card>
 *   <Card>...</Card>
 * </ResponsiveGrid>
 */
export const ResponsiveGrid = ({ 
  children, 
  cols = { default: 1, sm: 2, md: 3, lg: 4 },
  gap = 4,
  className 
}: ResponsiveGridProps) => {
  const colsMap: Record<number, string> = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5',
    6: 'grid-cols-6',
  };

  const gapMap: Record<number, string> = {
    1: 'gap-1',
    2: 'gap-2',
    3: 'gap-3',
    4: 'gap-4',
    5: 'gap-5',
    6: 'gap-6',
    8: 'gap-8',
    10: 'gap-10',
    12: 'gap-12',
  };

  const gridClasses = cn(
    'grid',
    cols.default && colsMap[cols.default],
    cols.sm && `sm:${colsMap[cols.sm]}`,
    cols.md && `md:${colsMap[cols.md]}`,
    cols.lg && `lg:${colsMap[cols.lg]}`,
    cols.xl && `xl:${colsMap[cols.xl]}`,
    cols['2xl'] && `2xl:${colsMap[cols['2xl']]}`,
    gapMap[gap],
    className
  );

  return (
    <div className={gridClasses}>
      {children}
    </div>
  );
};

/**
 * شبكة متجاوبة تلقائية بناءً على حجم العناصر
 * تستخدم auto-fit لملء المساحة المتاحة
 * 
 * @example
 * <AutoGrid minWidth="250px" gap={4}>
 *   <Card>...</Card>
 *   <Card>...</Card>
 * </AutoGrid>
 */
export const AutoGrid = ({ 
  children, 
  minWidth = "250px",
  maxWidth = "1fr",
  gap = 4,
  className 
}: {
  children: ReactNode;
  minWidth?: string;
  maxWidth?: string;
  gap?: 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12;
  className?: string;
}) => {
  const gapMap: Record<number, string> = {
    1: 'gap-1',
    2: 'gap-2',
    3: 'gap-3',
    4: 'gap-4',
    5: 'gap-5',
    6: 'gap-6',
    8: 'gap-8',
    10: 'gap-10',
    12: 'gap-12',
  };

  return (
    <div 
      className={cn('grid', gapMap[gap], className)}
      style={{
        gridTemplateColumns: `repeat(auto-fit, minmax(${minWidth}, ${maxWidth}))`
      }}
    >
      {children}
    </div>
  );
};

ResponsiveGrid.displayName = "ResponsiveGrid";
AutoGrid.displayName = "AutoGrid";
