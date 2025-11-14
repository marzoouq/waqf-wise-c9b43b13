import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface MobileOptimizedLayoutProps {
  children: ReactNode;
  className?: string;
}

/**
 * Layout محسّن للجوال
 * يوفر padding وspacing مناسب لجميع الأجهزة
 */
export function MobileOptimizedLayout({ children, className }: MobileOptimizedLayoutProps) {
  return (
    <div className={cn(
      "min-h-screen bg-background",
      "px-3 py-4 sm:px-4 sm:py-5 md:px-6 md:py-6 lg:px-8 lg:py-8",
      className
    )}>
      <div className="container mx-auto max-w-7xl space-y-4 sm:space-y-5 md:space-y-6">
        {children}
      </div>
    </div>
  );
}

/**
 * Header محسّن للجوال
 */
interface MobileOptimizedHeaderProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  actions?: ReactNode;
}

export function MobileOptimizedHeader({ 
  title, 
  description, 
  icon, 
  actions 
}: MobileOptimizedHeaderProps) {
  return (
    <header className="space-y-2 sm:space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-2 sm:gap-3">
          {icon && (
            <div className="flex-shrink-0 mt-1">
              {icon}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold sm:text-2xl md:text-3xl lg:text-4xl text-foreground break-words">
              {title}
            </h1>
            {description && (
              <p className="text-xs sm:text-sm md:text-base text-muted-foreground mt-1">
                {description}
              </p>
            )}
          </div>
        </div>
        {actions && (
          <div className="flex-shrink-0">
            {actions}
          </div>
        )}
      </div>
    </header>
  );
}

/**
 * Grid محسّن للجوال
 */
interface MobileOptimizedGridProps {
  children: ReactNode;
  cols?: 1 | 2 | 3 | 4;
  className?: string;
}

export function MobileOptimizedGrid({ children, cols = 2, className }: MobileOptimizedGridProps) {
  const gridClasses = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
  };

  return (
    <div className={cn(
      "grid gap-3 sm:gap-4 md:gap-5 lg:gap-6",
      gridClasses[cols],
      className
    )}>
      {children}
    </div>
  );
}