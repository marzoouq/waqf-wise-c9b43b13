import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";
import { DURATIONS } from "@/lib/motion-system";

// ==================== Types ====================
interface TabsBadgeProps {
  count?: number;
  variant?: 'default' | 'destructive' | 'success';
}

// ==================== Main Tabs Component ====================
const Tabs = TabsPrimitive.Root;

// ==================== TabsList ====================
const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> & {
    /** إظهار مؤشر التمرير */
    showScrollIndicator?: boolean;
  }
>(({ className, showScrollIndicator = true, ...props }, ref) => {
  const listRef = React.useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(false);

  // فحص إمكانية التمرير
  const checkScroll = React.useCallback(() => {
    const el = listRef.current;
    if (el) {
      // RTL - الاتجاهات معكوسة
      const scrollLeft = Math.abs(el.scrollLeft);
      const maxScroll = el.scrollWidth - el.clientWidth;
      setCanScrollRight(scrollLeft > 1);
      setCanScrollLeft(scrollLeft < maxScroll - 1);
    }
  }, []);

  React.useEffect(() => {
    const el = listRef.current;
    if (el) {
      checkScroll();
      el.addEventListener('scroll', checkScroll);
      window.addEventListener('resize', checkScroll);
      return () => {
        el.removeEventListener('scroll', checkScroll);
        window.removeEventListener('resize', checkScroll);
      };
    }
  }, [checkScroll]);

  return (
    <div className="relative">
      {/* مؤشر التمرير الأيسر (في RTL يعني اليمين فعلياً) */}
      {showScrollIndicator && canScrollLeft && (
        <div 
          className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-muted to-transparent pointer-events-none z-10" 
          aria-hidden="true"
        />
      )}
      
      <TabsPrimitive.List
        ref={(node) => {
          // دمج refs
          (listRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
          if (typeof ref === 'function') ref(node);
          else if (ref) ref.current = node;
        }}
        className={cn(
          // الأساسيات
          "inline-flex h-11 items-center justify-start rounded-lg bg-muted p-1 text-muted-foreground",
          // التمرير الأفقي مع scroll-snap
          "w-full flex-nowrap overflow-x-auto scrollbar-hide",
          "scroll-smooth snap-x snap-mandatory",
          // دعم اللمس
          "touch-pan-x",
          // إخفاء شريط التمرير
          "[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]",
          className,
        )}
        style={{ 
          WebkitOverflowScrolling: 'touch',
        }}
        {...props}
      />
      
      {/* مؤشر التمرير الأيمن (في RTL يعني اليسار فعلياً) */}
      {showScrollIndicator && canScrollRight && (
        <div 
          className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-muted to-transparent pointer-events-none z-10" 
          aria-hidden="true"
        />
      )}
    </div>
  );
});
TabsList.displayName = TabsPrimitive.List.displayName;

// ==================== TabsTrigger ====================
const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> & {
    /** Badge للإشعارات */
    badge?: TabsBadgeProps;
    /** أيقونة */
    icon?: React.ReactNode;
  }
>(({ className, badge, icon, children, ...props }, ref) => {
  const badgeVariants = {
    default: 'bg-primary text-primary-foreground',
    destructive: 'bg-destructive text-destructive-foreground',
    success: 'bg-green-500 text-white',
  };

  return (
    <TabsPrimitive.Trigger
      ref={ref}
      className={cn(
        // الأساسيات
        "relative inline-flex items-center justify-center gap-2",
        "whitespace-nowrap rounded-md px-4 py-2",
        "text-sm font-medium",
        // الحجم الأدنى للمس
        "min-h-[44px] min-w-[44px]",
        // التمرير snap
        "snap-start flex-shrink-0",
        // الانتقالات
        "ring-offset-background transition-all",
        `duration-150`,
        // الحالة النشطة مع مؤشر متحرك
        "data-[state=active]:bg-background data-[state=active]:text-foreground",
        "data-[state=active]:shadow-sm data-[state=active]:scale-[1.02]",
        // التركيز
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        // التعطيل
        "disabled:pointer-events-none disabled:opacity-50",
        // Hover
        "hover:bg-background/50 hover:text-foreground/80",
        className,
      )}
      {...props}
    >
      {/* الأيقونة */}
      {icon && (
        <span className="flex-shrink-0" aria-hidden="true">
          {icon}
        </span>
      )}
      
      {/* النص */}
      <span>{children}</span>
      
      {/* Badge */}
      {badge && badge.count !== undefined && badge.count > 0 && (
        <span
          className={cn(
            "absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1",
            "flex items-center justify-center",
            "rounded-full text-[10px] font-bold",
            "animate-in zoom-in-50 duration-200",
            badgeVariants[badge.variant || 'default'],
          )}
          aria-label={`${badge.count} إشعارات`}
        >
          {badge.count > 99 ? '99+' : badge.count}
        </span>
      )}
    </TabsPrimitive.Trigger>
  );
});
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

// ==================== TabsContent ====================
const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content> & {
    /** تفعيل الحركة عند الظهور */
    animated?: boolean;
  }
>(({ className, animated = true, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-3 ring-offset-background",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      // الحركة
      animated && "data-[state=active]:animate-in data-[state=active]:fade-in-0 data-[state=active]:slide-in-from-bottom-2",
      animated && "data-[state=inactive]:animate-out data-[state=inactive]:fade-out-0",
      "duration-200",
      className,
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };
