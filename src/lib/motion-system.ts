/**
 * Motion System - نظام الحركة الموحد
 * يوفر ثوابت وأدوات للحركة والانتقالات
 */

// ==================== Duration Constants ====================
export const DURATIONS = {
  instant: 50,
  fast: 100,
  normal: 200,
  medium: 300,
  slow: 400,
  slower: 500,
  glacial: 1000,
} as const;

// ==================== Easing Curves ====================
export const EASING = {
  // Standard easings
  linear: 'linear',
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  
  // Material Design easings
  standard: 'cubic-bezier(0.2, 0, 0, 1)',
  decelerate: 'cubic-bezier(0, 0, 0, 1)',
  accelerate: 'cubic-bezier(0.3, 0, 1, 1)',
  
  // Spring-like easings
  spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  elastic: 'cubic-bezier(0.68, -0.6, 0.32, 1.6)',
  
  // Custom
  snappy: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
  smooth: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
} as const;

// ==================== Transition Presets ====================
export const TRANSITIONS = {
  // Page transitions
  page: {
    duration: DURATIONS.medium,
    easing: EASING.standard,
  },
  
  // Dialog/Modal
  dialog: {
    duration: DURATIONS.normal,
    easing: EASING.spring,
  },
  
  // Dropdown/Popover
  dropdown: {
    duration: DURATIONS.fast,
    easing: EASING.easeOut,
  },
  
  // Card hover/press
  card: {
    duration: DURATIONS.fast,
    easing: EASING.easeOut,
  },
  
  // Button press
  button: {
    duration: DURATIONS.instant,
    easing: EASING.easeOut,
  },
  
  // Fade
  fade: {
    duration: DURATIONS.normal,
    easing: EASING.easeInOut,
  },
  
  // Slide
  slide: {
    duration: DURATIONS.medium,
    easing: EASING.decelerate,
  },
  
  // Scale
  scale: {
    duration: DURATIONS.fast,
    easing: EASING.spring,
  },
  
  // Skeleton shimmer
  skeleton: {
    duration: 1500,
    easing: EASING.linear,
  },
} as const;

// ==================== CSS Transition Strings ====================
export const CSS_TRANSITIONS = {
  all: `all ${DURATIONS.normal}ms ${EASING.easeOut}`,
  transform: `transform ${DURATIONS.fast}ms ${EASING.easeOut}`,
  opacity: `opacity ${DURATIONS.normal}ms ${EASING.easeInOut}`,
  colors: `background-color ${DURATIONS.normal}ms ${EASING.easeOut}, border-color ${DURATIONS.normal}ms ${EASING.easeOut}, color ${DURATIONS.normal}ms ${EASING.easeOut}`,
  shadow: `box-shadow ${DURATIONS.normal}ms ${EASING.easeOut}`,
} as const;

// ==================== Keyframe Animations ====================
export const KEYFRAMES = {
  fadeIn: {
    from: { opacity: 0 },
    to: { opacity: 1 },
  },
  fadeOut: {
    from: { opacity: 1 },
    to: { opacity: 0 },
  },
  slideInUp: {
    from: { transform: 'translateY(10px)', opacity: 0 },
    to: { transform: 'translateY(0)', opacity: 1 },
  },
  slideInDown: {
    from: { transform: 'translateY(-10px)', opacity: 0 },
    to: { transform: 'translateY(0)', opacity: 1 },
  },
  slideInLeft: {
    from: { transform: 'translateX(-10px)', opacity: 0 },
    to: { transform: 'translateX(0)', opacity: 1 },
  },
  slideInRight: {
    from: { transform: 'translateX(10px)', opacity: 0 },
    to: { transform: 'translateX(0)', opacity: 1 },
  },
  scaleIn: {
    from: { transform: 'scale(0.95)', opacity: 0 },
    to: { transform: 'scale(1)', opacity: 1 },
  },
  scaleOut: {
    from: { transform: 'scale(1)', opacity: 1 },
    to: { transform: 'scale(0.95)', opacity: 0 },
  },
  pulse: {
    '0%, 100%': { opacity: 1 },
    '50%': { opacity: 0.5 },
  },
  shimmer: {
    '0%': { transform: 'translateX(-100%)' },
    '100%': { transform: 'translateX(100%)' },
  },
  spin: {
    from: { transform: 'rotate(0deg)' },
    to: { transform: 'rotate(360deg)' },
  },
  bounce: {
    '0%, 100%': { transform: 'translateY(-25%)', animationTimingFunction: 'cubic-bezier(0.8, 0, 1, 1)' },
    '50%': { transform: 'translateY(0)', animationTimingFunction: 'cubic-bezier(0, 0, 0.2, 1)' },
  },
  shake: {
    '0%, 100%': { transform: 'translateX(0)' },
    '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-4px)' },
    '20%, 40%, 60%, 80%': { transform: 'translateX(4px)' },
  },
} as const;

// ==================== Framer Motion Variants ====================
export const framerVariants = {
  // Page transitions
  page: {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
    transition: { duration: TRANSITIONS.page.duration / 1000, ease: [0.2, 0, 0, 1] },
  },
  
  // Fade
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: TRANSITIONS.fade.duration / 1000 },
  },
  
  // Slide up
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
    transition: { duration: TRANSITIONS.slide.duration / 1000, ease: [0, 0, 0, 1] },
  },
  
  // Slide from right (for RTL: slide from left)
  slideRight: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
    transition: { duration: TRANSITIONS.slide.duration / 1000 },
  },
  
  // Scale
  scale: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
    transition: { duration: TRANSITIONS.scale.duration / 1000, ease: [0.175, 0.885, 0.32, 1.275] },
  },
  
  // Dialog
  dialog: {
    initial: { opacity: 0, scale: 0.95, y: 10 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.95, y: 10 },
    transition: { duration: TRANSITIONS.dialog.duration / 1000, ease: [0.175, 0.885, 0.32, 1.275] },
  },
  
  // Dropdown
  dropdown: {
    initial: { opacity: 0, y: -8, scale: 0.96 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -8, scale: 0.96 },
    transition: { duration: TRANSITIONS.dropdown.duration / 1000 },
  },
  
  // List items (staggered)
  listContainer: {
    initial: {},
    animate: {
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
  },
  listItem: {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.2 },
  },
  
  // Card hover
  card: {
    rest: { scale: 1 },
    hover: { scale: 1.02 },
    tap: { scale: 0.98 },
  },
  
  // Button press
  button: {
    rest: { scale: 1 },
    tap: { scale: 0.97 },
  },
};

// ==================== Tailwind Animation Classes ====================
export const ANIMATION_CLASSES = {
  // Fade
  fadeIn: 'animate-in fade-in',
  fadeOut: 'animate-out fade-out',
  
  // Slide
  slideInUp: 'animate-in slide-in-from-bottom-2',
  slideInDown: 'animate-in slide-in-from-top-2',
  slideInLeft: 'animate-in slide-in-from-left-2',
  slideInRight: 'animate-in slide-in-from-right-2',
  slideOutUp: 'animate-out slide-out-to-top-2',
  slideOutDown: 'animate-out slide-out-to-bottom-2',
  
  // Zoom
  zoomIn: 'animate-in zoom-in-95',
  zoomOut: 'animate-out zoom-out-95',
  
  // Combined
  fadeInSlideUp: 'animate-in fade-in slide-in-from-bottom-2',
  fadeInScale: 'animate-in fade-in zoom-in-95',
  
  // Duration modifiers
  durationFast: 'duration-100',
  durationNormal: 'duration-200',
  durationMedium: 'duration-300',
  durationSlow: 'duration-500',
  
  // Fill mode
  fillForwards: 'fill-mode-forwards',
  fillBackwards: 'fill-mode-backwards',
  fillBoth: 'fill-mode-both',
} as const;

// ==================== Utility Functions ====================

/**
 * إنشاء transition string
 */
export function createTransition(
  properties: string | string[],
  duration: number = DURATIONS.normal,
  easing: string = EASING.easeOut,
  delay: number = 0
): string {
  const props = Array.isArray(properties) ? properties : [properties];
  return props
    .map(prop => `${prop} ${duration}ms ${easing}${delay ? ` ${delay}ms` : ''}`)
    .join(', ');
}

/**
 * الحصول على مدة الحركة مع مراعاة prefers-reduced-motion
 */
export function getReducedMotionDuration(duration: number): number {
  if (typeof window === 'undefined') return duration;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : duration;
}

/**
 * الحصول على transition مع مراعاة prefers-reduced-motion
 */
export function getReducedMotionTransition<T extends { duration: number }>(transition: T): T {
  if (typeof window === 'undefined') return transition;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return { ...transition, duration: 1 as T['duration'] };
  }
  return transition;
}

// ==================== Stagger Utilities ====================

/**
 * إنشاء تأخير متدرج للقوائم
 */
export function getStaggerDelay(index: number, baseDelay: number = 50): number {
  return index * baseDelay;
}

/**
 * إنشاء animation-delay style
 */
export function getStaggerStyle(index: number, baseDelay: number = 50): React.CSSProperties {
  return {
    animationDelay: `${getStaggerDelay(index, baseDelay)}ms`,
  };
}
