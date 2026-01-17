import { ReactNode, memo } from 'react';
import { cn } from '@/lib/utils';
import { useDeviceType, ResponsiveGrid, AdaptiveStack } from '@/components/shared/AdaptiveLayout';

interface MobileOptimizedLayoutProps {
  children: ReactNode;
  className?: string;
  /** تفعيل Safe Area padding */
  useSafeArea?: boolean;
  /** الحد الأقصى للعرض */
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

const maxWidthClasses = {
  sm: 'max-w-screen-sm',
  md: 'max-w-screen-md',
  lg: 'max-w-screen-lg',
  xl: 'max-w-screen-xl',
  '2xl': 'max-w-7xl',
  full: 'max-w-full',
};

/**
 * Layout محسّن للجوال والتابلت والديسكتوب
 * يتكيف تلقائياً مع حجم الشاشة
 */
export const MobileOptimizedLayout = memo(function MobileOptimizedLayout({ 
  children, 
  className,
  useSafeArea = true,
  maxWidth = '2xl',
}: MobileOptimizedLayoutProps) {
  const deviceType = useDeviceType();
  
  return (
    <div className={cn(
      "min-h-screen bg-background w-full max-w-full overflow-x-hidden",
      // Padding متجاوب
      "px-3 py-4 sm:px-4 sm:py-5 md:px-6 md:py-6 lg:px-8 lg:py-8",
      // Safe Area للأجهزة الحديثة
      useSafeArea && [
        "pt-[max(1rem,env(safe-area-inset-top))]",
        "pb-[max(1rem,env(safe-area-inset-bottom))]",
        "ps-[max(0.75rem,env(safe-area-inset-left))]",
        "pe-[max(0.75rem,env(safe-area-inset-right))]",
      ],
      className
    )}>
      <div className={cn(
        "container mx-auto space-y-4 sm:space-y-5 md:space-y-6 w-full",
        maxWidthClasses[maxWidth]
      )}>
        {children}
      </div>
    </div>
  );
});

/**
 * Header محسّن للجوال مع دعم Adaptive
 */
interface MobileOptimizedHeaderProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  actions?: ReactNode;
  /** عنوان مختصر للجوال */
  mobileTitle?: string;
  /** وصف مختصر للجوال */
  mobileDescription?: string;
}

export const MobileOptimizedHeader = memo(function MobileOptimizedHeader({ 
  title, 
  description, 
  icon, 
  actions,
  mobileTitle,
  mobileDescription,
}: MobileOptimizedHeaderProps) {
  const deviceType = useDeviceType();
  const isMobile = deviceType === 'mobile';
  
  const displayTitle = isMobile && mobileTitle ? mobileTitle : title;
  const displayDescription = isMobile && mobileDescription ? mobileDescription : description;
  
  return (
    <header className="space-y-2 sm:space-y-3">
      <AdaptiveStack 
        mobileDirection="vertical" 
        desktopDirection="horizontal"
        gap="md"
        className="items-start sm:items-center sm:justify-between"
      >
        <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
          {icon && (
            <div className="flex-shrink-0 mt-0.5 sm:mt-1">
              {icon}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h1 className={cn(
              "font-bold text-foreground break-words",
              // أحجام متجاوبة
              "text-xl sm:text-2xl md:text-3xl lg:text-4xl",
              // Line height محسّن
              "leading-tight"
            )}>
              {displayTitle}
            </h1>
            {displayDescription && (
              <p className={cn(
                "text-muted-foreground mt-1",
                "text-sm sm:text-base",
                "line-clamp-2 sm:line-clamp-none"
              )}>
                {displayDescription}
              </p>
            )}
          </div>
        </div>
        
        {actions && (
          <div className={cn(
            "flex-shrink-0",
            // على الجوال: عرض كامل
            "w-full sm:w-auto",
            // الإجراءات تأخذ العرض الكامل على الجوال
            "[&>*]:w-full [&>*]:sm:w-auto"
          )}>
            {actions}
          </div>
        )}
      </AdaptiveStack>
    </header>
  );
});

/**
 * Grid محسّن للجوال مع تحكم دقيق
 */
interface MobileOptimizedGridProps {
  children: ReactNode;
  cols?: 1 | 2 | 3 | 4;
  className?: string;
  /** gap مخصص */
  gap?: 'sm' | 'md' | 'lg' | 'xl';
}

export const MobileOptimizedGrid = memo(function MobileOptimizedGrid({ 
  children, 
  cols = 2, 
  className,
  gap = 'md',
}: MobileOptimizedGridProps) {
  // تحويل cols إلى إعدادات ResponsiveGrid
  const gridConfig = {
    1: { mobile: 1 as const, tablet: 1 as const, desktop: 1 as const },
    2: { mobile: 1 as const, tablet: 2 as const, desktop: 2 as const },
    3: { mobile: 1 as const, tablet: 2 as const, desktop: 3 as const },
    4: { mobile: 1 as const, tablet: 2 as const, desktop: 4 as const },
  };
  
  const config = gridConfig[cols];
  
  return (
    <ResponsiveGrid
      mobile={config.mobile}
      tablet={config.tablet}
      desktop={config.desktop}
      gap={gap}
      className={className}
    >
      {children}
    </ResponsiveGrid>
  );
});

/**
 * Section محسّنة للجوال
 */
interface MobileOptimizedSectionProps {
  children: ReactNode;
  title?: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
}

export const MobileOptimizedSection = memo(function MobileOptimizedSection({
  children,
  title,
  description,
  actions,
  className,
}: MobileOptimizedSectionProps) {
  return (
    <section className={cn("space-y-3 sm:space-y-4", className)}>
      {(title || actions) && (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {title && (
              <h2 className="text-lg sm:text-xl font-semibold text-foreground">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-sm text-muted-foreground mt-0.5">
                {description}
              </p>
            )}
          </div>
          {actions && (
            <div className="flex-shrink-0">
              {actions}
            </div>
          )}
        </div>
      )}
      {children}
    </section>
  );
});

/**
 * Card Container محسّن للجوال
 */
interface MobileOptimizedCardProps {
  children: ReactNode;
  className?: string;
  /** padding داخلي */
  padding?: 'sm' | 'md' | 'lg';
  /** hover effect */
  hoverable?: boolean;
}

export const MobileOptimizedCard = memo(function MobileOptimizedCard({
  children,
  className,
  padding = 'md',
  hoverable = false,
}: MobileOptimizedCardProps) {
  const paddingClasses = {
    sm: 'p-3 sm:p-4',
    md: 'p-4 sm:p-5 md:p-6',
    lg: 'p-5 sm:p-6 md:p-8',
  };
  
  return (
    <div className={cn(
      "bg-card rounded-lg border border-border",
      paddingClasses[padding],
      hoverable && "transition-shadow hover:shadow-md",
      className
    )}>
      {children}
    </div>
  );
});