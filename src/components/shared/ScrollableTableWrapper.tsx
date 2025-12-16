import { ReactNode, useEffect, useRef, useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ScrollableTableWrapperProps {
  children: ReactNode;
  className?: string;
  showScrollIndicator?: boolean;
}

// ✅ Throttle utility لتحسين الأداء
function throttle<T extends (...args: unknown[]) => void>(fn: T, ms: number): T {
  let lastCall = 0;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  
  return ((...args: Parameters<T>) => {
    const now = Date.now();
    const remaining = ms - (now - lastCall);
    
    if (remaining <= 0) {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      lastCall = now;
      fn(...args);
    } else if (!timeoutId) {
      timeoutId = setTimeout(() => {
        lastCall = Date.now();
        timeoutId = null;
        fn(...args);
      }, remaining);
    }
  }) as T;
}

/**
 * مكون لتغليف الجداول بإمكانيات التمرير الأفقي
 * مع مؤشرات بصرية ودعم كامل للجوال
 * ✅ محسّن للأداء مع throttling و requestAnimationFrame
 */
export function ScrollableTableWrapper({
  children,
  className,
  showScrollIndicator = true,
}: ScrollableTableWrapperProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftIndicator, setShowLeftIndicator] = useState(false);
  const [showRightIndicator, setShowRightIndicator] = useState(false);
  const rafRef = useRef<number | null>(null);

  // ✅ استخدام requestAnimationFrame لتجنب forced reflow
  const checkScrollPosition = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
    
    rafRef.current = requestAnimationFrame(() => {
      const el = scrollRef.current;
      if (!el) return;

      const { scrollLeft, scrollWidth, clientWidth } = el;
      
      // تحقق من إمكانية التمرير لليسار
      setShowLeftIndicator(scrollLeft > 10);
      
      // تحقق من إمكانية التمرير لليمين
      setShowRightIndicator(scrollLeft < scrollWidth - clientWidth - 10);
    });
  }, []);

  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (!scrollElement) return;

    // ✅ Throttled check للأداء الأمثل (100ms)
    const throttledCheck = throttle(checkScrollPosition, 100);

    // فحص أولي
    checkScrollPosition();

    // ✅ إضافة مستمع للتمرير مع passive: true
    scrollElement.addEventListener('scroll', throttledCheck, { passive: true });
    
    // إضافة مستمع لتغيير حجم النافذة
    window.addEventListener('resize', throttledCheck);

    return () => {
      scrollElement.removeEventListener('scroll', throttledCheck);
      window.removeEventListener('resize', throttledCheck);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [checkScrollPosition]);

  const scroll = useCallback((direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    
    const scrollAmount = 300;
    const newScrollLeft = scrollRef.current.scrollLeft + (direction === 'right' ? scrollAmount : -scrollAmount);
    
    scrollRef.current.scrollTo({
      left: newScrollLeft,
      behavior: 'smooth'
    });
  }, []);

  return (
    <div className="relative group">
      {/* مؤشر التمرير الأيسر */}
      {showScrollIndicator && showLeftIndicator && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-background/95 backdrop-blur-sm border border-border rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-muted"
          aria-label="التمرير لليسار"
        >
          <ChevronLeft className="h-4 w-4 text-foreground" />
        </button>
      )}

      {/* مؤشر التمرير الأيمن */}
      {showScrollIndicator && showRightIndicator && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-background/95 backdrop-blur-sm border border-border rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-muted"
          aria-label="التمرير لليمين"
        >
          <ChevronRight className="h-4 w-4 text-foreground" />
        </button>
      )}

      {/* منطقة التمرير */}
      <div
        ref={scrollRef}
        className={cn(
          "overflow-x-auto overflow-y-visible",
          "scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent",
          "hover:scrollbar-thumb-primary/40",
          // دعم Touch على الجوال
          "touch-pan-x",
          // Snap للتمرير السلس
          "snap-x snap-mandatory",
          className
        )}
        style={{
          WebkitOverflowScrolling: 'touch', // تمرير سلس على iOS
        }}
      >
        {/* مؤشر بصري للتمرير على الجوال */}
        {showScrollIndicator && (showLeftIndicator || showRightIndicator) && (
          <div className="md:hidden sticky top-0 z-10 flex justify-center py-2 bg-gradient-to-b from-background to-transparent pointer-events-none">
            <div className="flex items-center gap-2 px-3 py-1 bg-muted/80 backdrop-blur-sm rounded-full text-xs text-muted-foreground">
              <ChevronRight className="h-3 w-3 animate-pulse" />
              <span>اسحب لليمين لرؤية المزيد</span>
              <ChevronLeft className="h-3 w-3 animate-pulse" />
            </div>
          </div>
        )}
        
        {children}
      </div>

      {/* خط تدرج على الحواف للإشارة للمحتوى المخفي */}
      {showScrollIndicator && showRightIndicator && (
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none" />
      )}
      {showScrollIndicator && showLeftIndicator && (
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background to-transparent pointer-events-none" />
      )}
    </div>
  );
}
