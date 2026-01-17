/**
 * UX Integration System - نظام التكامل الموحد
 * يجمع جميع أنظمة تحسين تجربة المستخدم
 * 
 * @version 1.0.0
 */

// Re-export accessibility (excluding conflicts)
export { 
  ARIA_LABELS,
  FOCUSABLE_ELEMENTS,
  getFocusableElements,
  trapFocus,
  createFocusRestore,
  matchesShortcut,
  DEFAULT_SHORTCUTS,
  createLiveRegion,
  announce,
  getContrastRatio,
  meetsContrastRequirements,
  visuallyHiddenStyles,
  SR_ONLY_CLASS,
  prefersReducedMotion as a11yPrefersReducedMotion,
  onReducedMotionChange,
  prefersHighContrast,
  A11Y_CLASSES,
  ROLE_DESCRIPTIONS,
  type LiveRegionPriority,
  type KeyboardShortcut as A11yKeyboardShortcut,
} from './accessibility';

// Re-export mobile-ux
export * from './mobile-ux';

// Re-export motion-system
export * from './motion-system';

// Re-export network-utils (excluding conflicts)
export {
  getNetworkInfo,
  shouldDeferHeavyOperations,
  fetchWithRetry,
  offlineQueue,
  useNetworkStatus,
  useOptimisticMutation,
  useOfflineQueue,
  classifyNetworkError,
  getErrorMessage as getNetworkErrorMessage,
  isRetryableError,
  type NetworkStatus,
  type RetryOptions,
  type NetworkErrorType,
} from './network-utils';

// Re-export microcopy
export * from './microcopy';

// Re-export image optimization
export { 
  optimizeImageUrl, 
  supportsWebP,
  supportsAVIF,
  getBestSupportedFormat,
  generateSrcSet,
  generateSizes,
  calculateOptimalDimensions,
  preloadImage,
  preloadImages,
  compressImage,
  getImageDimensions,
  optimizeLCP,
  observeLCP,
  optimizePageImages,
  type ImageOptimizationOptions 
} from './imageOptimization';

// Re-export route prefetch
export { 
  prefetchRoute,
  prefetchRoutes,
  prefetchCommonRoutes,
  usePrefetchOnHover,
  useRolePrefetch,
  resetPrefetchState,
} from './routePrefetch';

// ==================== System Health Checker ====================

export interface UXSystemStatus {
  accessibility: boolean;
  mobileOptimization: boolean;
  motionSystem: boolean;
  networkResilience: boolean;
  performanceOptimization: boolean;
}

/**
 * فحص حالة أنظمة UX
 */
export function checkUXSystemsHealth(): UXSystemStatus {
  return {
    accessibility: typeof document !== 'undefined',
    mobileOptimization: typeof window !== 'undefined' && 'ontouchstart' in window,
    motionSystem: typeof window !== 'undefined',
    networkResilience: typeof navigator !== 'undefined' && 'onLine' in navigator,
    performanceOptimization: typeof performance !== 'undefined' && 'now' in performance,
  };
}

// ==================== UX Configuration ====================

export interface UXConfig {
  // Accessibility
  enableSkipLinks: boolean;
  enableKeyboardShortcuts: boolean;
  enableAnnouncements: boolean;
  
  // Mobile
  enableTouchOptimization: boolean;
  enableSwipeGestures: boolean;
  enablePullToRefresh: boolean;
  
  // Motion
  respectReducedMotion: boolean;
  enableAnimations: boolean;
  animationDuration: number;
  
  // Network
  enableOfflineSupport: boolean;
  enableOptimisticUpdates: boolean;
  retryAttempts: number;
  
  // Performance
  enableLazyLoading: boolean;
  enableImageOptimization: boolean;
  enableRoutePrefetch: boolean;
}

const defaultUXConfig: UXConfig = {
  enableSkipLinks: true,
  enableKeyboardShortcuts: true,
  enableAnnouncements: true,
  enableTouchOptimization: true,
  enableSwipeGestures: true,
  enablePullToRefresh: true,
  respectReducedMotion: true,
  enableAnimations: true,
  animationDuration: 200,
  enableOfflineSupport: true,
  enableOptimisticUpdates: true,
  retryAttempts: 3,
  enableLazyLoading: true,
  enableImageOptimization: true,
  enableRoutePrefetch: true,
};

let currentConfig: UXConfig = { ...defaultUXConfig };

/**
 * تكوين نظام UX
 */
export function configureUX(config: Partial<UXConfig>): UXConfig {
  currentConfig = { ...currentConfig, ...config };
  return currentConfig;
}

/**
 * الحصول على تكوين UX الحالي
 */
export function getUXConfig(): UXConfig {
  return { ...currentConfig };
}

/**
 * إعادة تعيين تكوين UX
 */
export function resetUXConfig(): void {
  currentConfig = { ...defaultUXConfig };
}

// ==================== Performance Metrics ====================

export interface UXPerformanceMetrics {
  // Core Web Vitals approximations
  timeToInteractive: number | null;
  firstContentfulPaint: number | null;
  largestContentfulPaint: number | null;
  
  // Custom metrics
  networkLatency: number | null;
  renderTime: number | null;
  interactionDelay: number | null;
}

/**
 * جمع مقاييس أداء UX
 */
export function collectUXMetrics(): UXPerformanceMetrics {
  const metrics: UXPerformanceMetrics = {
    timeToInteractive: null,
    firstContentfulPaint: null,
    largestContentfulPaint: null,
    networkLatency: null,
    renderTime: null,
    interactionDelay: null,
  };
  
  if (typeof performance !== 'undefined') {
    const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
    const paintEntries = performance.getEntriesByType('paint');
    
    if (navigationEntry) {
      metrics.timeToInteractive = navigationEntry.domInteractive - navigationEntry.startTime;
      metrics.networkLatency = navigationEntry.responseEnd - navigationEntry.requestStart;
    }
    
    const fcpEntry = paintEntries.find(e => e.name === 'first-contentful-paint');
    if (fcpEntry) {
      metrics.firstContentfulPaint = fcpEntry.startTime;
    }
  }
  
  return metrics;
}

// ==================== Device Capabilities ====================

export interface DeviceCapabilities {
  // Display
  isHighResolution: boolean;
  supportsHDR: boolean;
  colorGamut: 'srgb' | 'p3' | 'rec2020';
  
  // Input
  hasTouchScreen: boolean;
  hasPointer: boolean;
  hasKeyboard: boolean;
  
  // Features
  supportsVibration: boolean;
  supportsNotifications: boolean;
  supportsWebGL: boolean;
  
  // Network
  connectionType: string;
  saveData: boolean;
  
  // Preferences
  prefersReducedMotion: boolean;
  prefersHighContrast: boolean;
  prefersDarkMode: boolean;
}

/**
 * اكتشاف قدرات الجهاز
 */
export function detectDeviceCapabilities(): DeviceCapabilities {
  const capabilities: DeviceCapabilities = {
    isHighResolution: false,
    supportsHDR: false,
    colorGamut: 'srgb',
    hasTouchScreen: false,
    hasPointer: true,
    hasKeyboard: true,
    supportsVibration: false,
    supportsNotifications: false,
    supportsWebGL: false,
    connectionType: 'unknown',
    saveData: false,
    prefersReducedMotion: false,
    prefersHighContrast: false,
    prefersDarkMode: false,
  };
  
  if (typeof window === 'undefined') return capabilities;
  
  // Display
  capabilities.isHighResolution = window.devicePixelRatio >= 2;
  capabilities.supportsHDR = window.matchMedia('(dynamic-range: high)').matches;
  
  if (window.matchMedia('(color-gamut: rec2020)').matches) {
    capabilities.colorGamut = 'rec2020';
  } else if (window.matchMedia('(color-gamut: p3)').matches) {
    capabilities.colorGamut = 'p3';
  }
  
  // Input
  capabilities.hasTouchScreen = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  capabilities.hasPointer = window.matchMedia('(pointer: fine)').matches;
  
  // Features
  capabilities.supportsVibration = 'vibrate' in navigator;
  capabilities.supportsNotifications = 'Notification' in window;
  capabilities.supportsWebGL = (() => {
    try {
      const canvas = document.createElement('canvas');
      return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
    } catch {
      return false;
    }
  })();
  
  // Network
  const connection = (navigator as Navigator & { connection?: { effectiveType?: string; saveData?: boolean } }).connection;
  if (connection) {
    capabilities.connectionType = connection.effectiveType || 'unknown';
    capabilities.saveData = connection.saveData || false;
  }
  
  // Preferences
  capabilities.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  capabilities.prefersHighContrast = window.matchMedia('(prefers-contrast: more)').matches;
  capabilities.prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  return capabilities;
}

// ==================== Adaptive UX ====================

/**
 * تطبيق تحسينات UX التكيفية بناءً على قدرات الجهاز
 */
export function applyAdaptiveUX(): void {
  const capabilities = detectDeviceCapabilities();
  const config = getUXConfig();
  
  // تعديل التكوين بناءً على القدرات
  if (capabilities.prefersReducedMotion) {
    configureUX({ enableAnimations: false });
  }
  
  if (capabilities.saveData) {
    configureUX({ 
      enableImageOptimization: true,
      enableRoutePrefetch: false,
    });
  }
  
  if (!capabilities.hasTouchScreen) {
    configureUX({
      enableSwipeGestures: false,
      enablePullToRefresh: false,
    });
  }
  
  // تطبيق CSS classes على body
  if (typeof document !== 'undefined') {
    const body = document.body;
    
    if (capabilities.hasTouchScreen) {
      body.classList.add('touch-device');
    }
    
    if (capabilities.prefersReducedMotion) {
      body.classList.add('reduced-motion');
    }
    
    if (capabilities.prefersHighContrast) {
      body.classList.add('high-contrast');
    }
  }
}

// ==================== Error Recovery ====================

export interface UXError {
  type: 'network' | 'render' | 'interaction' | 'data';
  message: string;
  timestamp: number;
  context?: Record<string, unknown>;
}

const errorLog: UXError[] = [];

/**
 * تسجيل خطأ UX
 */
export function logUXError(error: Omit<UXError, 'timestamp'>): void {
  const uxError: UXError = {
    ...error,
    timestamp: Date.now(),
  };
  
  errorLog.push(uxError);
  
  // الاحتفاظ بآخر 50 خطأ فقط
  if (errorLog.length > 50) {
    errorLog.shift();
  }
}

/**
 * الحصول على سجل الأخطاء
 */
export function getUXErrorLog(): UXError[] {
  return [...errorLog];
}

/**
 * مسح سجل الأخطاء
 */
export function clearUXErrorLog(): void {
  errorLog.length = 0;
}

// ==================== Feature Detection ====================

export const FEATURES = {
  intersectionObserver: typeof IntersectionObserver !== 'undefined',
  resizeObserver: typeof ResizeObserver !== 'undefined',
  mutationObserver: typeof MutationObserver !== 'undefined',
  serviceWorker: 'serviceWorker' in navigator,
  webWorker: typeof Worker !== 'undefined',
  webSocket: typeof WebSocket !== 'undefined',
  indexedDB: typeof indexedDB !== 'undefined',
  localStorage: (() => {
    try {
      return typeof localStorage !== 'undefined';
    } catch {
      return false;
    }
  })(),
  sessionStorage: (() => {
    try {
      return typeof sessionStorage !== 'undefined';
    } catch {
      return false;
    }
  })(),
  requestIdleCallback: typeof requestIdleCallback !== 'undefined',
  requestAnimationFrame: typeof requestAnimationFrame !== 'undefined',
  cssVariables: typeof CSS !== 'undefined' && CSS.supports && CSS.supports('--test', '0'),
  cssGrid: typeof CSS !== 'undefined' && CSS.supports && CSS.supports('display', 'grid'),
  cssFlexbox: typeof CSS !== 'undefined' && CSS.supports && CSS.supports('display', 'flex'),
} as const;

/**
 * التحقق من دعم ميزة معينة
 */
export function supportsFeature(feature: keyof typeof FEATURES): boolean {
  return FEATURES[feature];
}
