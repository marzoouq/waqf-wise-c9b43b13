/**
 * UX Verification System - نظام التحقق من تكامل UX
 * يوفر أدوات للتحقق من أن جميع أنظمة UX تعمل بشكل صحيح
 * 
 * @version 1.0.0
 */

import { checkUXSystemsHealth, detectDeviceCapabilities, collectUXMetrics, FEATURES } from './ux-integration';

// ==================== Verification Types ====================

export interface VerificationResult {
  category: string;
  name: string;
  status: 'pass' | 'warn' | 'fail';
  message: string;
  details?: Record<string, unknown>;
}

export interface VerificationReport {
  timestamp: string;
  overallStatus: 'healthy' | 'degraded' | 'critical';
  results: VerificationResult[];
  summary: {
    total: number;
    passed: number;
    warnings: number;
    failed: number;
  };
}

// ==================== Verification Functions ====================

/**
 * التحقق من نظام الوصولية
 */
export function verifyAccessibility(): VerificationResult[] {
  const results: VerificationResult[] = [];
  
  // التحقق من وجود Skip Links
  const skipLinks = document.querySelector('[aria-label="روابط التخطي"]');
  results.push({
    category: 'accessibility',
    name: 'Skip Links',
    status: skipLinks ? 'pass' : 'warn',
    message: skipLinks ? 'روابط التخطي موجودة' : 'روابط التخطي غير موجودة',
  });
  
  // التحقق من Main Content
  const mainContent = document.querySelector('#main-content');
  results.push({
    category: 'accessibility',
    name: 'Main Content',
    status: mainContent ? 'pass' : 'warn',
    message: mainContent ? 'المحتوى الرئيسي معرّف' : 'المحتوى الرئيسي غير معرّف',
  });
  
  // التحقق من اللغة
  const htmlLang = document.documentElement.lang;
  results.push({
    category: 'accessibility',
    name: 'Language Attribute',
    status: htmlLang ? 'pass' : 'warn',
    message: htmlLang ? `اللغة محددة: ${htmlLang}` : 'اللغة غير محددة',
  });
  
  // التحقق من اتجاه الصفحة
  const htmlDir = document.documentElement.dir;
  results.push({
    category: 'accessibility',
    name: 'Direction Attribute',
    status: htmlDir === 'rtl' ? 'pass' : 'warn',
    message: htmlDir === 'rtl' ? 'الاتجاه RTL' : 'الاتجاه غير محدد أو LTR',
  });
  
  return results;
}

/**
 * التحقق من نظام الشبكة
 */
export function verifyNetworkResilience(): VerificationResult[] {
  const results: VerificationResult[] = [];
  
  // التحقق من حالة الاتصال
  results.push({
    category: 'network',
    name: 'Online Status',
    status: navigator.onLine ? 'pass' : 'fail',
    message: navigator.onLine ? 'متصل بالإنترنت' : 'غير متصل بالإنترنت',
  });
  
  // التحقق من Network Information API
  const connection = (navigator as Navigator & { connection?: { effectiveType?: string } }).connection;
  results.push({
    category: 'network',
    name: 'Network Info API',
    status: connection ? 'pass' : 'warn',
    message: connection ? `نوع الاتصال: ${connection.effectiveType || 'unknown'}` : 'Network Information API غير مدعوم',
  });
  
  // التحقق من Service Worker
  results.push({
    category: 'network',
    name: 'Service Worker',
    status: 'serviceWorker' in navigator ? 'pass' : 'warn',
    message: 'serviceWorker' in navigator ? 'Service Worker مدعوم' : 'Service Worker غير مدعوم',
  });
  
  return results;
}

/**
 * التحقق من نظام الأداء
 */
export function verifyPerformance(): VerificationResult[] {
  const results: VerificationResult[] = [];
  const metrics = collectUXMetrics();
  
  // التحقق من FCP
  if (metrics.firstContentfulPaint) {
    const fcpStatus = metrics.firstContentfulPaint < 1800 ? 'pass' : 
                      metrics.firstContentfulPaint < 3000 ? 'warn' : 'fail';
    results.push({
      category: 'performance',
      name: 'First Contentful Paint',
      status: fcpStatus,
      message: `FCP: ${Math.round(metrics.firstContentfulPaint)}ms`,
      details: { value: metrics.firstContentfulPaint, threshold: 1800 },
    });
  }
  
  // التحقق من TTI
  if (metrics.timeToInteractive) {
    const ttiStatus = metrics.timeToInteractive < 3000 ? 'pass' :
                      metrics.timeToInteractive < 5000 ? 'warn' : 'fail';
    results.push({
      category: 'performance',
      name: 'Time to Interactive',
      status: ttiStatus,
      message: `TTI: ${Math.round(metrics.timeToInteractive)}ms`,
      details: { value: metrics.timeToInteractive, threshold: 3000 },
    });
  }
  
  // التحقق من Performance API
  results.push({
    category: 'performance',
    name: 'Performance API',
    status: typeof performance !== 'undefined' ? 'pass' : 'warn',
    message: typeof performance !== 'undefined' ? 'Performance API متاح' : 'Performance API غير متاح',
  });
  
  return results;
}

/**
 * التحقق من دعم الميزات
 */
export function verifyFeatureSupport(): VerificationResult[] {
  const results: VerificationResult[] = [];
  
  const criticalFeatures: (keyof typeof FEATURES)[] = [
    'intersectionObserver',
    'resizeObserver',
    'requestAnimationFrame',
    'cssVariables',
    'cssFlexbox',
  ];
  
  for (const feature of criticalFeatures) {
    results.push({
      category: 'features',
      name: feature,
      status: FEATURES[feature] ? 'pass' : 'warn',
      message: FEATURES[feature] ? `${feature} مدعوم` : `${feature} غير مدعوم`,
    });
  }
  
  return results;
}

/**
 * التحقق من قدرات الجهاز
 */
export function verifyDeviceCapabilities(): VerificationResult[] {
  const results: VerificationResult[] = [];
  const capabilities = detectDeviceCapabilities();
  
  results.push({
    category: 'device',
    name: 'Touch Support',
    status: 'pass',
    message: capabilities.hasTouchScreen ? 'جهاز لمسي' : 'جهاز غير لمسي',
    details: { hasTouchScreen: capabilities.hasTouchScreen },
  });
  
  results.push({
    category: 'device',
    name: 'High Resolution',
    status: 'pass',
    message: capabilities.isHighResolution ? 'شاشة عالية الدقة' : 'شاشة عادية',
    details: { devicePixelRatio: window.devicePixelRatio },
  });
  
  results.push({
    category: 'device',
    name: 'Motion Preference',
    status: 'pass',
    message: capabilities.prefersReducedMotion ? 'يفضل تقليل الحركة' : 'الحركة مفعلة',
    details: { prefersReducedMotion: capabilities.prefersReducedMotion },
  });
  
  return results;
}

// ==================== Main Verification Function ====================

/**
 * تشغيل التحقق الشامل
 */
export function runFullVerification(): VerificationReport {
  const allResults: VerificationResult[] = [
    ...verifyAccessibility(),
    ...verifyNetworkResilience(),
    ...verifyPerformance(),
    ...verifyFeatureSupport(),
    ...verifyDeviceCapabilities(),
  ];
  
  const summary = {
    total: allResults.length,
    passed: allResults.filter(r => r.status === 'pass').length,
    warnings: allResults.filter(r => r.status === 'warn').length,
    failed: allResults.filter(r => r.status === 'fail').length,
  };
  
  const overallStatus: VerificationReport['overallStatus'] = 
    summary.failed > 0 ? 'critical' :
    summary.warnings > 2 ? 'degraded' : 'healthy';
  
  return {
    timestamp: new Date().toISOString(),
    overallStatus,
    results: allResults,
    summary,
  };
}

/**
 * طباعة تقرير التحقق للـ Console
 */
export function logVerificationReport(): void {
  const report = runFullVerification();
  
  console.group('🔍 UX Verification Report');
  console.log(`📅 Timestamp: ${report.timestamp}`);
  console.log(`📊 Overall Status: ${report.overallStatus}`);
  console.log(`✅ Passed: ${report.summary.passed}/${report.summary.total}`);
  console.log(`⚠️ Warnings: ${report.summary.warnings}`);
  console.log(`❌ Failed: ${report.summary.failed}`);
  
  console.group('📋 Details');
  const categories = [...new Set(report.results.map(r => r.category))];
  
  for (const category of categories) {
    console.group(`📁 ${category}`);
    const categoryResults = report.results.filter(r => r.category === category);
    for (const result of categoryResults) {
      const icon = result.status === 'pass' ? '✅' : result.status === 'warn' ? '⚠️' : '❌';
      console.log(`${icon} ${result.name}: ${result.message}`);
    }
    console.groupEnd();
  }
  console.groupEnd();
  
  console.groupEnd();
}

// ==================== Phase Summary ====================

/**
 * ملخص المراحل المُنجزة
 */
export const PHASES_SUMMARY = {
  phase1: {
    name: 'المرحلة الأولى - التحليل والتمحيص',
    status: 'completed',
    deliverables: [
      'تحديد المشكلة بدقة وفهم المتطلبات',
      'فحص المتطلبات تقنياً',
      'وثيقة عمل واضحة',
    ],
  },
  phase2: {
    name: 'المرحلة الثانية - الهيكلة والتصميم',
    status: 'completed',
    deliverables: [
      'بناء هيكل الكود (Structure) والمنطق البرمجي',
      'فحص توافق الهيكل مع المشكلة',
      'مخطط أولي للكود',
    ],
  },
  phase3: {
    name: 'المرحلة الثالثة - التنفيذ والكتابة',
    status: 'completed',
    deliverables: [
      'src/lib/network-utils.ts - أدوات الشبكة والاتصال',
      'src/lib/microcopy.ts - نظام نصوص الواجهة الموحد',
      'src/lib/imageOptimization.ts - تحسين الصور',
      'src/lib/routePrefetch.ts - التحميل المسبق للمسارات',
      'src/components/shared/ErrorState.tsx - حالات الخطأ المحسنة',
    ],
  },
  phase4: {
    name: 'المرحلة الرابعة - Accessibility والتحسينات',
    status: 'completed',
    deliverables: [
      'src/lib/accessibility.ts - نظام الوصولية الشامل (WCAG 2.1 AA)',
      'src/hooks/ui/useKeyboardShortcuts.ts - إدارة اختصارات لوحة المفاتيح',
      'src/components/shared/SkipLinks.tsx - روابط التخطي',
      'src/components/shared/KeyboardShortcutsHelp.tsx - دليل الاختصارات',
      'src/hooks/ui/useAnnounce.ts - إعلان الرسائل لقارئات الشاشة',
      'src/hooks/ui/useFocusManagement.ts - إدارة التركيز',
      'src/hooks/ui/useReducedMotion.ts - تفضيلات الحركة',
    ],
  },
  phase5: {
    name: 'المرحلة الخامسة - التكامل النهائي',
    status: 'completed',
    deliverables: [
      'src/lib/ux-integration.ts - نظام التكامل الموحد',
      'src/hooks/ui/useUXIntegration.ts - خطاف التكامل الموحد',
      'src/components/providers/UXProvider.tsx - مزود سياق UX',
      'src/lib/mobile-ux.ts - نظام تجربة الجوال',
      'src/lib/motion-system.ts - نظام الحركة',
      'تحديث barrel exports في src/hooks/ui/index.ts',
      'تحديث barrel exports في src/components/shared/index.ts',
      'تحديث barrel exports في src/lib/index.ts',
    ],
  },
} as const;

/**
 * الحصول على ملخص المراحل
 */
export function getPhaseSummary() {
  return PHASES_SUMMARY;
}

export default runFullVerification;
