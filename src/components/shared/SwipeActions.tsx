import React, { useRef, useState, useCallback, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { hapticFeedback, TOUCH_CONSTANTS } from '@/lib/mobile-ux';

interface SwipeState {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  deltaX: number;
  deltaY: number;
  velocity: number;
  timestamp: number;
}

function createSwipeState(clientX: number, clientY: number): SwipeState {
  return {
    startX: clientX,
    startY: clientY,
    currentX: clientX,
    currentY: clientY,
    deltaX: 0,
    deltaY: 0,
    velocity: 0,
    timestamp: Date.now(),
  };
}

function updateSwipeState(state: SwipeState, clientX: number, clientY: number): SwipeState {
  const now = Date.now();
  const timeDelta = now - state.timestamp;
  
  const deltaX = clientX - state.startX;
  const deltaY = clientY - state.startY;
  
  const distance = Math.sqrt(deltaX ** 2 + deltaY ** 2);
  const velocity = timeDelta > 0 ? distance / timeDelta : 0;
  
  return {
    ...state,
    currentX: clientX,
    currentY: clientY,
    deltaX,
    deltaY,
    velocity,
    timestamp: now,
  };
}
export interface SwipeAction {
  icon: ReactNode;
  label: string;
  color: 'destructive' | 'warning' | 'success' | 'primary' | 'secondary';
  onAction: () => void;
}

interface SwipeActionsProps {
  children: ReactNode;
  leftAction?: SwipeAction;
  rightAction?: SwipeAction;
  threshold?: number;
  disabled?: boolean;
  className?: string;
  onSwipeStart?: () => void;
  onSwipeEnd?: () => void;
}

const ACTION_WIDTH = 80;
const VELOCITY_THRESHOLD = 0.5;

const colorClasses: Record<SwipeAction['color'], string> = {
  destructive: 'bg-destructive text-destructive-foreground',
  warning: 'bg-warning text-warning-foreground',
  success: 'bg-success text-success-foreground',
  primary: 'bg-primary text-primary-foreground',
  secondary: 'bg-secondary text-secondary-foreground',
};

/**
 * مكون SwipeActions - إجراءات السحب للصفوف
 * يدعم RTL والسحب من الجهتين
 */
export function SwipeActions({
  children,
  leftAction,
  rightAction,
  threshold = TOUCH_CONSTANTS.swipe.threshold,
  disabled = false,
  className,
  onSwipeStart,
  onSwipeEnd,
}: SwipeActionsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  
  const [swipeState, setSwipeState] = useState<SwipeState | null>(null);
  const [translateX, setTranslateX] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [activeAction, setActiveAction] = useState<'left' | 'right' | null>(null);
  
  const hasLeftAction = !!leftAction;
  const hasRightAction = !!rightAction;
  
  // حساب الحد الأقصى للسحب
  const maxSwipeLeft = hasRightAction ? ACTION_WIDTH : 0;
  const maxSwipeRight = hasLeftAction ? ACTION_WIDTH : 0;
  
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (disabled || isAnimating) return;
    
    const touch = e.touches[0];
    if (!touch) return;
    
    const state = createSwipeState(touch.clientX, touch.clientY);
    setSwipeState(state);
    onSwipeStart?.();
  }, [disabled, isAnimating, onSwipeStart]);
  
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!swipeState || disabled || isAnimating) return;
    
    const touch = e.touches[0];
    if (!touch) return;
    
    const newState = updateSwipeState(swipeState, touch.clientX, touch.clientY);
    setSwipeState(newState);
    
    // التحقق من اتجاه السحب الأفقي
    if (Math.abs(newState.deltaY) > Math.abs(newState.deltaX) * 0.5) {
      return; // السحب عمودي - تجاهل
    }
    
    e.preventDefault();
    
    // حساب الإزاحة مع الحدود (RTL support)
    const isRTL = document.dir === 'rtl';
    let newTranslateX = newState.deltaX;
    
    if (isRTL) {
      newTranslateX = -newTranslateX;
    }
    
    // تطبيق الحدود
    if (newTranslateX < 0) {
      // سحب لليسار (يظهر الإجراء الأيمن)
      newTranslateX = hasRightAction 
        ? Math.max(newTranslateX, -maxSwipeLeft - 20) 
        : 0;
    } else {
      // سحب لليمين (يظهر الإجراء الأيسر)
      newTranslateX = hasLeftAction 
        ? Math.min(newTranslateX, maxSwipeRight + 20) 
        : 0;
    }
    
    setTranslateX(newTranslateX);
    
    // Haptic feedback عند تجاوز الحد
    if (Math.abs(newTranslateX) >= threshold && !activeAction) {
      hapticFeedback('selection');
      setActiveAction(newTranslateX < 0 ? 'right' : 'left');
    } else if (Math.abs(newTranslateX) < threshold && activeAction) {
      setActiveAction(null);
    }
  }, [swipeState, disabled, isAnimating, hasLeftAction, hasRightAction, maxSwipeLeft, maxSwipeRight, threshold, activeAction]);
  
  const handleTouchEnd = useCallback(() => {
    if (!swipeState || disabled) return;
    
    setIsAnimating(true);
    
    const shouldTriggerAction = Math.abs(translateX) >= threshold || swipeState.velocity >= VELOCITY_THRESHOLD;
    
    if (shouldTriggerAction) {
      if (translateX < -threshold && rightAction) {
        // تشغيل الإجراء الأيمن
        hapticFeedback('success');
        setTranslateX(-ACTION_WIDTH);
        setTimeout(() => {
          rightAction.onAction();
          resetSwipe();
        }, 200);
      } else if (translateX > threshold && leftAction) {
        // تشغيل الإجراء الأيسر
        hapticFeedback('success');
        setTranslateX(ACTION_WIDTH);
        setTimeout(() => {
          leftAction.onAction();
          resetSwipe();
        }, 200);
      } else {
        resetSwipe();
      }
    } else {
      resetSwipe();
    }
    
    onSwipeEnd?.();
  }, [swipeState, disabled, translateX, threshold, leftAction, rightAction, onSwipeEnd]);
  
  const resetSwipe = useCallback(() => {
    setIsAnimating(true);
    setTranslateX(0);
    setActiveAction(null);
    setSwipeState(null);
    
    setTimeout(() => {
      setIsAnimating(false);
    }, 200);
  }, []);
  
  // إغلاق عند النقر على الإجراء
  const handleActionClick = useCallback((action: SwipeAction, side: 'left' | 'right') => {
    hapticFeedback('success');
    action.onAction();
    resetSwipe();
  }, [resetSwipe]);
  
  if (disabled || (!hasLeftAction && !hasRightAction)) {
    return <div className={className}>{children}</div>;
  }
  
  return (
    <div 
      ref={containerRef}
      className={cn(
        'relative overflow-hidden touch-pan-y',
        className
      )}
    >
      {/* الإجراء الأيسر */}
      {hasLeftAction && (
        <div 
          className={cn(
            'absolute inset-y-0 left-0 flex items-center justify-center',
            'transition-opacity duration-200',
            colorClasses[leftAction.color],
            activeAction === 'left' ? 'opacity-100' : 'opacity-90'
          )}
          style={{ width: ACTION_WIDTH }}
          onClick={() => handleActionClick(leftAction, 'left')}
        >
          <div className="flex flex-col items-center gap-1">
            <span className="text-lg">{leftAction.icon}</span>
            <span className="text-xs font-medium">{leftAction.label}</span>
          </div>
        </div>
      )}
      
      {/* الإجراء الأيمن */}
      {hasRightAction && (
        <div 
          className={cn(
            'absolute inset-y-0 right-0 flex items-center justify-center',
            'transition-opacity duration-200',
            colorClasses[rightAction.color],
            activeAction === 'right' ? 'opacity-100' : 'opacity-90'
          )}
          style={{ width: ACTION_WIDTH }}
          onClick={() => handleActionClick(rightAction, 'right')}
        >
          <div className="flex flex-col items-center gap-1">
            <span className="text-lg">{rightAction.icon}</span>
            <span className="text-xs font-medium">{rightAction.label}</span>
          </div>
        </div>
      )}
      
      {/* المحتوى الرئيسي */}
      <div
        ref={contentRef}
        className={cn(
          'relative bg-background',
          isAnimating && 'transition-transform duration-200 ease-out'
        )}
        style={{ transform: `translateX(${translateX}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={resetSwipe}
      >
        {children}
      </div>
    </div>
  );
}

export default SwipeActions;
