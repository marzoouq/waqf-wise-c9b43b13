/**
 * فحوصات الأداء والأمان
 */

import { registerIssue } from './registry';

/**
 * فحص React
 */
export function checkReactIssues(): void {
  // فحص React DevTools
  const reactRoot = document.getElementById('root');
  if (reactRoot) {
    const fiberKey = Object.keys(reactRoot).find(key => key.startsWith('__reactFiber'));
    if (fiberKey) {
      // التحقق من وجود مكونات معطلة
      const errorBoundaries = document.querySelectorAll('[data-error-boundary="true"]');
      if (errorBoundaries.length > 0) {
        registerIssue({
          type: 'error',
          category: 'React',
          message: `${errorBoundaries.length} Error Boundary نشط`,
          details: 'هناك أخطاء في بعض المكونات',
        });
      }
    }
  }

  // فحص التحذيرات في DEV mode
  if (process.env.NODE_ENV === 'development') {
    registerIssue({
      type: 'info',
      category: 'React',
      message: 'التطبيق في وضع التطوير',
      details: 'الأداء أبطأ من الإنتاج',
    });
  }
}

/**
 * فحص الأداء
 */
export function checkPerformanceIssues(): void {
  // فحص Web Vitals
  const entries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
  if (entries.length > 0) {
    const nav = entries[0];
    
    // Time to First Byte
    const ttfb = nav.responseStart - nav.requestStart;
    if (ttfb > 600) {
      registerIssue({
        type: 'warning',
        category: 'Performance',
        message: `TTFB بطيء: ${ttfb.toFixed(0)}ms`,
        details: 'يُنصح بتحسين استجابة الخادم',
      });
    }

    // DOM Content Loaded
    const dcl = nav.domContentLoadedEventEnd - nav.fetchStart;
    if (dcl > 3000) {
      registerIssue({
        type: 'warning',
        category: 'Performance',
        message: `DOM Content Loaded بطيء: ${(dcl/1000).toFixed(1)}s`,
      });
    }

    // Page Load
    const loadTime = nav.loadEventEnd - nav.fetchStart;
    if (loadTime > 5000) {
      registerIssue({
        type: 'warning',
        category: 'Performance',
        message: `وقت تحميل الصفحة طويل: ${(loadTime/1000).toFixed(1)}s`,
      });
    }
  }

  // فحص Long Tasks
  const longTasks = performance.getEntriesByType('longtask');
  if (longTasks.length > 5) {
    registerIssue({
      type: 'warning',
      category: 'Performance',
      message: `${longTasks.length} مهمة طويلة (>50ms)`,
      details: 'تؤثر على استجابة الواجهة',
    });
  }

  // فحص Layout Shifts
  const layoutShifts = performance.getEntriesByType('layout-shift');
  const totalCLS = layoutShifts.reduce((sum, entry) => {
    const layoutShiftEntry = entry as PerformanceEntry & { value?: number };
    return sum + (layoutShiftEntry.value || 0);
  }, 0);
  if (totalCLS > 0.25) {
    registerIssue({
      type: 'warning',
      category: 'Performance',
      message: `CLS مرتفع: ${totalCLS.toFixed(3)}`,
      details: 'هناك تحركات غير متوقعة في الصفحة',
    });
  }
}

/**
 * فحص الأمان
 */
export function checkSecurityIssues(): void {
  // فحص HTTPS
  if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
    registerIssue({
      type: 'critical',
      category: 'Security',
      message: 'الاتصال غير آمن (HTTP)',
      details: 'يجب استخدام HTTPS',
    });
  }

  // فحص Mixed Content
  const mixedContent = document.querySelectorAll('[src^="http:"], [href^="http:"]');
  if (mixedContent.length > 0 && location.protocol === 'https:') {
    registerIssue({
      type: 'warning',
      category: 'Security',
      message: `${mixedContent.length} محتوى مختلط (HTTP في HTTPS)`,
    });
  }

  // فحص localStorage للبيانات الحساسة
  const sensitiveKeys = ['password', 'token', 'secret', 'key', 'auth'];
  Object.keys(localStorage).forEach(key => {
    if (sensitiveKeys.some(s => key.toLowerCase().includes(s))) {
      registerIssue({
        type: 'warning',
        category: 'Security',
        message: `مفتاح localStorage حساس: ${key}`,
        details: 'يُنصح بعدم تخزين البيانات الحساسة في localStorage',
      });
    }
  });

  // فحص CSP
  const cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
  if (!cspMeta) {
    registerIssue({
      type: 'info',
      category: 'Security',
      message: 'لا يوجد Content Security Policy',
    });
  }
}
