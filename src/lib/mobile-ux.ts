/**
 * Mobile UX System - نظام موحد لتجربة المستخدم على الجوال
 * يشمل: Touch Targets, Haptic Feedback, Gestures, Safe Areas
 */

// ==================== Touch Constants ====================
export const TOUCH_CONSTANTS = {
  // Minimum touch target sizes (WCAG 2.5.5)
  targets: {
    minimum: 44,      // الحد الأدنى المطلوب
    comfortable: 48,  // الحجم المريح
    large: 56,        // للأزرار الرئيسية
  },
  
  // Touch timing
  timing: {
    tapDelay: 0,           // لا تأخير للنقرات
    longPressDelay: 500,   // وقت الضغط الطويل
    doubleTapDelay: 300,   // وقت بين النقرتين
  },
  
  // Swipe thresholds
  swipe: {
    threshold: 50,         // المسافة الدنيا للسحب
    velocity: 0.3,         // السرعة الدنيا
    maxTime: 300,          // الوقت الأقصى للسحب
  },
  
  // Scroll behavior
  scroll: {
    momentum: true,
    overscroll: 'contain',
    snapType: 'x mandatory',
  },
} as const;

// ==================== Haptic Feedback ====================
export type HapticType = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' | 'selection';

/**
 * تشغيل Haptic Feedback إذا كان مدعوماً
 */
export function hapticFeedback(type: HapticType = 'light'): void {
  // التحقق من دعم Vibration API
  if (!('vibrate' in navigator)) return;
  
  const patterns: Record<HapticType, number | number[]> = {
    light: 10,
    medium: 20,
    heavy: 30,
    success: [10, 50, 10],
    warning: [20, 30, 20],
    error: [30, 50, 30, 50, 30],
    selection: 5,
  };
  
  try {
    navigator.vibrate(patterns[type]);
  } catch {
    // Ignore errors - haptic feedback is optional enhancement
  }
}

/**
 * تشغيل Haptic Feedback عند التغيير (للقوائم والتبويبات)
 */
export function hapticSelection(): void {
  hapticFeedback('selection');
}

/**
 * تشغيل Haptic Feedback للنجاح
 */
export function hapticSuccess(): void {
  hapticFeedback('success');
}

/**
 * تشغيل Haptic Feedback للتحذير
 */
export function hapticWarning(): void {
  hapticFeedback('warning');
}

/**
 * تشغيل Haptic Feedback للخطأ
 */
export function hapticError(): void {
  hapticFeedback('error');
}

// ==================== Safe Area ====================
export const SAFE_AREA = {
  top: 'env(safe-area-inset-top, 0px)',
  bottom: 'env(safe-area-inset-bottom, 0px)',
  left: 'env(safe-area-inset-left, 0px)',
  right: 'env(safe-area-inset-right, 0px)',
} as const;

/**
 * الحصول على قيم Safe Area الفعلية
 */
export function getSafeAreaInsets(): { top: number; bottom: number; left: number; right: number } {
  if (typeof window === 'undefined') {
    return { top: 0, bottom: 0, left: 0, right: 0 };
  }
  
  const computedStyle = getComputedStyle(document.documentElement);
  
  return {
    top: parseInt(computedStyle.getPropertyValue('--sat') || '0', 10),
    bottom: parseInt(computedStyle.getPropertyValue('--sab') || '0', 10),
    left: parseInt(computedStyle.getPropertyValue('--sal') || '0', 10),
    right: parseInt(computedStyle.getPropertyValue('--sar') || '0', 10),
  };
}

/**
 * التحقق من وجود شاشة Edge-to-Edge
 */
export function isEdgeToEdge(): boolean {
  if (typeof window === 'undefined') return false;
  
  const insets = getSafeAreaInsets();
  return insets.top > 0 || insets.bottom > 0;
}

// ==================== Gesture Utilities ====================
export interface SwipeState {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  deltaX: number;
  deltaY: number;
  direction: 'left' | 'right' | 'up' | 'down' | null;
  velocity: number;
  timestamp: number;
}

/**
 * إنشاء حالة سحب جديدة
 */
export function createSwipeState(touch: Touch): SwipeState {
  return {
    startX: touch.clientX,
    startY: touch.clientY,
    currentX: touch.clientX,
    currentY: touch.clientY,
    deltaX: 0,
    deltaY: 0,
    direction: null,
    velocity: 0,
    timestamp: Date.now(),
  };
}

/**
 * تحديث حالة السحب
 */
export function updateSwipeState(state: SwipeState, touch: Touch): SwipeState {
  const now = Date.now();
  const timeDelta = now - state.timestamp;
  
  const deltaX = touch.clientX - state.startX;
  const deltaY = touch.clientY - state.startY;
  
  const absDeltaX = Math.abs(deltaX);
  const absDeltaY = Math.abs(deltaY);
  
  let direction: SwipeState['direction'] = null;
  if (absDeltaX > absDeltaY) {
    direction = deltaX > 0 ? 'right' : 'left';
  } else if (absDeltaY > absDeltaX) {
    direction = deltaY > 0 ? 'down' : 'up';
  }
  
  const distance = Math.sqrt(deltaX ** 2 + deltaY ** 2);
  const velocity = timeDelta > 0 ? distance / timeDelta : 0;
  
  return {
    ...state,
    currentX: touch.clientX,
    currentY: touch.clientY,
    deltaX,
    deltaY,
    direction,
    velocity,
    timestamp: now,
  };
}

/**
 * التحقق من اكتمال السحب
 */
export function isSwipeComplete(state: SwipeState, direction: 'horizontal' | 'vertical' = 'horizontal'): boolean {
  const { deltaX, deltaY, velocity } = state;
  const { threshold, velocity: minVelocity } = TOUCH_CONSTANTS.swipe;
  
  if (direction === 'horizontal') {
    return Math.abs(deltaX) >= threshold || velocity >= minVelocity;
  }
  
  return Math.abs(deltaY) >= threshold || velocity >= minVelocity;
}

// ==================== Touch Action Helpers ====================

/**
 * تعطيل السحب الأصلي للعنصر
 */
export const touchActionNone = {
  touchAction: 'none' as const,
  WebkitTouchCallout: 'none' as const,
  WebkitUserSelect: 'none' as const,
  userSelect: 'none' as const,
};

/**
 * السماح بالسحب الأفقي فقط
 */
export const touchActionPanX = {
  touchAction: 'pan-x' as const,
};

/**
 * السماح بالسحب العمودي فقط
 */
export const touchActionPanY = {
  touchAction: 'pan-y' as const,
};

/**
 * تحسين الأداء للعناصر التفاعلية
 */
export const touchManipulation = {
  touchAction: 'manipulation' as const,
};

// ==================== CSS Classes ====================
export const MOBILE_UX_CLASSES = {
  // Touch target sizes
  touchTarget: 'min-h-[44px] min-w-[44px]',
  touchTargetComfortable: 'min-h-[48px] min-w-[48px]',
  touchTargetLarge: 'min-h-[56px] min-w-[56px]',
  
  // Touch behavior
  touchManipulation: 'touch-manipulation',
  touchNone: 'touch-none',
  touchPanX: 'touch-pan-x',
  touchPanY: 'touch-pan-y',
  
  // Selection prevention
  noSelect: 'select-none',
  noCallout: '[-webkit-touch-callout:none]',
  
  // Safe areas
  safeAreaTop: 'pt-[env(safe-area-inset-top)]',
  safeAreaBottom: 'pb-[env(safe-area-inset-bottom)]',
  safeAreaLeft: 'pl-[env(safe-area-inset-left)]',
  safeAreaRight: 'pr-[env(safe-area-inset-right)]',
  safeAreaX: 'px-[env(safe-area-inset-left)] px-[env(safe-area-inset-right)]',
  safeAreaY: 'py-[env(safe-area-inset-top)] py-[env(safe-area-inset-bottom)]',
  
  // Active states
  activeScale: 'active:scale-[0.97] transition-transform duration-100',
  activeOpacity: 'active:opacity-80 transition-opacity duration-100',
  
  // Scroll behavior
  scrollSmooth: 'scroll-smooth',
  scrollSnap: 'snap-x snap-mandatory',
  scrollSnapItem: 'snap-center',
  overscrollContain: 'overscroll-contain',
  
  // Momentum scrolling (iOS)
  momentumScroll: '[-webkit-overflow-scrolling:touch]',
} as const;

// ==================== Hook Utilities ====================

/**
 * التحقق من كون الجهاز يدعم اللمس
 */
export function isTouchDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

/**
 * التحقق من كون الجهاز جوال
 */
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/**
 * التحقق من كون الجهاز iOS
 */
export function isIOS(): boolean {
  if (typeof window === 'undefined') return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

/**
 * التحقق من كون الجهاز Android
 */
export function isAndroid(): boolean {
  if (typeof window === 'undefined') return false;
  return /Android/.test(navigator.userAgent);
}

// ==================== Prefers Reduced Motion ====================

/**
 * التحقق من تفضيل المستخدم لتقليل الحركة
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * الحصول على مدة الحركة المناسبة
 */
export function getAnimationDuration(defaultDuration: number): number {
  return prefersReducedMotion() ? 0 : defaultDuration;
}
