/**
 * PullToRefresh - مكون السحب للتحديث
 * يوفر تجربة سحب طبيعية للتحديث على الجوال
 * 
 * @version 1.0.0
 */

import React, { 
  ReactNode, 
  useRef, 
  useState, 
  useCallback, 
  useEffect,
  memo 
} from 'react';
import { cn } from '@/lib/utils';
import { RefreshCw, ArrowDown, Check } from 'lucide-react';
import { hapticFeedback } from '@/lib/mobile-ux';
import { DURATIONS, EASING } from '@/lib/motion-system';

// ==================== Types ====================
type RefreshState = 'idle' | 'pulling' | 'ready' | 'refreshing' | 'success';

interface PullToRefreshProps {
  /** دالة التحديث - يجب أن ترجع Promise */
  onRefresh: () => Promise<void>;
  /** المحتوى */
  children: ReactNode;
  /** المسافة المطلوبة للتفعيل (بالبكسل) */
  threshold?: number;
  /** تعطيل السحب */
  disabled?: boolean;
  /** نص التحديث */
  refreshingText?: string;
  /** نص السحب */
  pullText?: string;
  /** نص الجاهزية */
  readyText?: string;
  /** نص النجاح */
  successText?: string;
  /** الفئات الإضافية */
  className?: string;
}

// ==================== Constants ====================
const DEFAULT_THRESHOLD = 80;
const MAX_PULL_DISTANCE = 150;
const RESISTANCE_FACTOR = 0.5;

// ==================== Component ====================

export const PullToRefresh = memo(function PullToRefresh({
  onRefresh,
  children,
  threshold = DEFAULT_THRESHOLD,
  disabled = false,
  refreshingText = 'جارٍ التحديث...',
  pullText = 'اسحب للتحديث',
  readyText = 'أفلت للتحديث',
  successText = 'تم التحديث',
  className,
}: PullToRefreshProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const currentY = useRef(0);
  const [pullDistance, setPullDistance] = useState(0);
  const [state, setState] = useState<RefreshState>('idle');
  const [isAtTop, setIsAtTop] = useState(true);

  // التحقق من أن المحتوى في الأعلى
  const checkScrollPosition = useCallback(() => {
    if (containerRef.current) {
      setIsAtTop(containerRef.current.scrollTop <= 0);
    }
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollPosition);
      return () => container.removeEventListener('scroll', checkScrollPosition);
    }
  }, [checkScrollPosition]);

  // معالجة بداية اللمس
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (disabled || state === 'refreshing' || !isAtTop) return;
    
    startY.current = e.touches[0].clientY;
    currentY.current = startY.current;
  }, [disabled, state, isAtTop]);

  // معالجة حركة اللمس
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (disabled || state === 'refreshing' || !isAtTop) return;
    
    currentY.current = e.touches[0].clientY;
    const diff = currentY.current - startY.current;
    
    // لا نسحب إلا إذا كنا نسحب للأسفل
    if (diff <= 0) {
      setPullDistance(0);
      setState('idle');
      return;
    }
    
    // تطبيق المقاومة للحصول على تأثير طبيعي
    const resistance = 1 - Math.min(diff / MAX_PULL_DISTANCE, 1) * RESISTANCE_FACTOR;
    const adjustedDistance = Math.min(diff * resistance, MAX_PULL_DISTANCE);
    
    setPullDistance(adjustedDistance);
    
    // تغيير الحالة
    if (adjustedDistance >= threshold) {
      if (state !== 'ready') {
        setState('ready');
        hapticFeedback('medium');
      }
    } else {
      setState('pulling');
    }
    
    // منع التمرير الافتراضي عند السحب
    if (adjustedDistance > 0) {
      e.preventDefault();
    }
  }, [disabled, state, isAtTop, threshold]);

  // معالجة نهاية اللمس
  const handleTouchEnd = useCallback(async () => {
    if (disabled || state === 'refreshing') return;
    
    if (state === 'ready' && pullDistance >= threshold) {
      // بدء التحديث
      setState('refreshing');
      hapticFeedback('heavy');
      
      try {
        await onRefresh();
        setState('success');
        hapticFeedback('success');
        
        // إظهار رسالة النجاح لفترة قصيرة
        setTimeout(() => {
          setState('idle');
          setPullDistance(0);
        }, 1000);
      } catch (error) {
        console.error('Refresh failed:', error);
        setState('idle');
        setPullDistance(0);
        hapticFeedback('error');
      }
    } else {
      // إلغاء السحب
      setState('idle');
      setPullDistance(0);
    }
    
    startY.current = 0;
    currentY.current = 0;
  }, [disabled, state, pullDistance, threshold, onRefresh]);

  // حساب النسبة المئوية للسحب
  const pullProgress = Math.min(pullDistance / threshold, 1);
  
  // حساب دوران الأيقونة
  const iconRotation = pullProgress * 180;
  
  // حساب الشفافية
  const indicatorOpacity = Math.min(pullProgress * 1.5, 1);

  // اختيار الأيقونة والنص
  const getIndicatorContent = () => {
    switch (state) {
      case 'pulling':
        return {
          icon: <ArrowDown className="h-5 w-5" style={{ transform: `rotate(${iconRotation}deg)` }} />,
          text: pullText,
        };
      case 'ready':
        return {
          icon: <ArrowDown className="h-5 w-5 rotate-180" />,
          text: readyText,
        };
      case 'refreshing':
        return {
          icon: <RefreshCw className="h-5 w-5 animate-spin" />,
          text: refreshingText,
        };
      case 'success':
        return {
          icon: <Check className="h-5 w-5 text-green-500" />,
          text: successText,
        };
      default:
        return {
          icon: <ArrowDown className="h-5 w-5" />,
          text: pullText,
        };
    }
  };

  const { icon, text } = getIndicatorContent();

  return (
    <div className={cn('relative w-full h-full', className)}>
      {/* مؤشر السحب */}
      <div
        className={cn(
          'absolute top-0 left-0 right-0 flex flex-col items-center justify-center',
          'transition-opacity duration-200',
          'pointer-events-none z-10'
        )}
        style={{
          height: Math.max(pullDistance, state === 'refreshing' ? threshold : 0),
          opacity: indicatorOpacity,
        }}
        >
          <div
            className={cn(
              'flex flex-col items-center gap-2 py-2',
              'text-muted-foreground'
            )}
            style={{
              transition: state === 'idle' ? `all ${DURATIONS.fast}ms ${EASING.easeOut}` : 'none',
            }}
          >
          <div
            className={cn(
              'w-10 h-10 rounded-full flex items-center justify-center',
              'bg-muted/50 backdrop-blur-sm',
              state === 'ready' && 'bg-primary/20',
              state === 'success' && 'bg-green-500/20',
            )}
          >
            {icon}
          </div>
          <span className="text-xs font-medium">{text}</span>
        </div>
      </div>

      {/* المحتوى */}
      <div
        ref={containerRef}
        className="h-full overflow-y-auto overscroll-contain"
        style={{
          transform: `translateY(${state === 'refreshing' ? threshold : pullDistance}px)`,
          transition: state === 'idle' || state === 'success' 
            ? `transform ${DURATIONS.normal}ms ${EASING.spring}` 
            : 'none',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>
    </div>
  );
});

// ==================== Hook for React Query Integration ====================

import { useQueryClient } from '@tanstack/react-query';

interface UsePullToRefreshOptions {
  /** مفاتيح الاستعلامات للتحديث */
  queryKeys?: string[][];
  /** دالة تحديث مخصصة */
  customRefresh?: () => Promise<void>;
}

/**
 * Hook لتكامل Pull-to-Refresh مع React Query
 */
export function usePullToRefresh(options: UsePullToRefreshOptions = {}) {
  const { queryKeys = [], customRefresh } = options;
  const queryClient = useQueryClient();

  const handleRefresh = useCallback(async () => {
    // تنفيذ الدالة المخصصة إذا وُجدت
    if (customRefresh) {
      await customRefresh();
    }
    
    // تحديث جميع الاستعلامات المحددة
    if (queryKeys.length > 0) {
      await Promise.all(
        queryKeys.map(key => queryClient.invalidateQueries({ queryKey: key }))
      );
    }
    
    // إذا لم تُحدد استعلامات، نحدث جميع الاستعلامات النشطة
    if (queryKeys.length === 0 && !customRefresh) {
      await queryClient.invalidateQueries();
    }
  }, [queryClient, queryKeys, customRefresh]);

  return { handleRefresh };
}

export default PullToRefresh;
