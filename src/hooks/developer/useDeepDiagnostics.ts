/**
 * أداة التشخيص العميق (Deep Diagnostics)
 * فحص شامل لجميع أجزاء التطبيق
 */
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { productionLogger } from '@/lib/logger/production-logger';
import { getRenderReport } from './useRenderTracker';
import { getMemorySnapshots } from './useMemoryMonitor';
import { getAllPerformanceIssues } from './usePerformanceGuard';

interface DiagnosticResult {
  category: string;
  name: string;
  status: 'pass' | 'warning' | 'fail';
  message: string;
  details?: Record<string, unknown>;
}

interface DiagnosticReport {
  timestamp: number;
  results: DiagnosticResult[];
  summary: {
    total: number;
    passed: number;
    warnings: number;
    failed: number;
    score: number;
  };
}

export function useDeepDiagnostics() {
  const [isRunning, setIsRunning] = useState(false);
  const [report, setReport] = useState<DiagnosticReport | null>(null);
  const [progress, setProgress] = useState(0);

  // تشغيل الفحص الشامل
  const runDiagnostics = useCallback(async () => {
    setIsRunning(true);
    setProgress(0);
    const results: DiagnosticResult[] = [];

    try {
      // 1. فحص الاتصال بقاعدة البيانات
      setProgress(10);
      const dbCheck = await checkDatabaseConnection();
      results.push(dbCheck);

      // 2. فحص الذاكرة
      setProgress(20);
      const memoryCheck = checkMemoryUsage();
      results.push(memoryCheck);

      // 3. فحص إعادة الرسم المفرطة
      setProgress(30);
      const renderCheck = checkExcessiveRenders();
      results.push(renderCheck);

      // 4. فحص أداء Web Vitals
      setProgress(40);
      const performanceCheck = checkPerformanceMetrics();
      results.push(performanceCheck);

      // 5. فحص الطلبات المعلقة
      setProgress(50);
      const networkCheck = await checkNetworkHealth();
      results.push(networkCheck);

      // 6. فحص التخزين المحلي
      setProgress(60);
      const storageCheck = checkLocalStorage();
      results.push(storageCheck);

      // 7. فحص Service Worker
      setProgress(70);
      const swCheck = await checkServiceWorker();
      results.push(swCheck);

      // 8. فحص الأخطاء المسجلة
      setProgress(80);
      const errorCheck = await checkErrorLogs();
      results.push(errorCheck);

      // 9. فحص حجم Bundle
      setProgress(90);
      const bundleCheck = checkBundleSize();
      results.push(bundleCheck);

      // 10. فحص React Query Cache
      setProgress(95);
      const cacheCheck = checkQueryCache();
      results.push(cacheCheck);

      setProgress(100);

      // إنشاء التقرير النهائي
      const summary = {
        total: results.length,
        passed: results.filter(r => r.status === 'pass').length,
        warnings: results.filter(r => r.status === 'warning').length,
        failed: results.filter(r => r.status === 'fail').length,
        score: calculateDiagnosticScore(results),
      };

      const finalReport: DiagnosticReport = {
        timestamp: Date.now(),
        results,
        summary,
      };

      setReport(finalReport);
      productionLogger.info('تم إكمال الفحص التشخيصي', { summary });

      return finalReport;
    } catch (error) {
      productionLogger.error('خطأ في الفحص التشخيصي', { error });
      throw error;
    } finally {
      setIsRunning(false);
    }
  }, []);

  return { runDiagnostics, isRunning, report, progress };
}

// فحص الاتصال بقاعدة البيانات
async function checkDatabaseConnection(): Promise<DiagnosticResult> {
  const start = Date.now();
  try {
    const { error } = await supabase.from('activities').select('id').limit(1);
    const responseTime = Date.now() - start;

    if (error) {
      return {
        category: 'قاعدة البيانات',
        name: 'الاتصال',
        status: 'fail',
        message: `فشل الاتصال: ${error.message}`,
        details: { error },
      };
    }

    if (responseTime > 2000) {
      return {
        category: 'قاعدة البيانات',
        name: 'الاتصال',
        status: 'warning',
        message: `الاتصال بطيء: ${responseTime}ms`,
        details: { responseTime },
      };
    }

    return {
      category: 'قاعدة البيانات',
      name: 'الاتصال',
      status: 'pass',
      message: `الاتصال سريع: ${responseTime}ms`,
      details: { responseTime },
    };
  } catch (error) {
    return {
      category: 'قاعدة البيانات',
      name: 'الاتصال',
      status: 'fail',
      message: 'خطأ في الاتصال',
      details: { error },
    };
  }
}

// فحص استخدام الذاكرة
function checkMemoryUsage(): DiagnosticResult {
  if (!('memory' in performance)) {
    return {
      category: 'الذاكرة',
      name: 'الاستخدام',
      status: 'warning',
      message: 'غير مدعوم في هذا المتصفح',
    };
  }

  const memory = (performance as Performance & { memory: {
    usedJSHeapSize: number;
    jsHeapSizeLimit: number;
  }}).memory;
  const usagePercent = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;

  if (usagePercent > 85) {
    return {
      category: 'الذاكرة',
      name: 'الاستخدام',
      status: 'fail',
      message: `استخدام حرج: ${usagePercent.toFixed(1)}%`,
      details: { usagePercent, usedMB: memory.usedJSHeapSize / (1024 * 1024) },
    };
  }

  if (usagePercent > 70) {
    return {
      category: 'الذاكرة',
      name: 'الاستخدام',
      status: 'warning',
      message: `استخدام مرتفع: ${usagePercent.toFixed(1)}%`,
      details: { usagePercent },
    };
  }

  return {
    category: 'الذاكرة',
    name: 'الاستخدام',
    status: 'pass',
    message: `استخدام طبيعي: ${usagePercent.toFixed(1)}%`,
    details: { usagePercent },
  };
}

// فحص إعادة الرسم المفرطة
function checkExcessiveRenders(): DiagnosticResult {
  const renderReport = getRenderReport();
  const excessiveComponents = renderReport.filter(r => r.renderCount > 50);

  if (excessiveComponents.length > 5) {
    return {
      category: 'React',
      name: 'إعادة الرسم',
      status: 'fail',
      message: `${excessiveComponents.length} مكونات تعاد رسمها بشكل مفرط`,
      details: { components: excessiveComponents.slice(0, 5) },
    };
  }

  if (excessiveComponents.length > 0) {
    return {
      category: 'React',
      name: 'إعادة الرسم',
      status: 'warning',
      message: `${excessiveComponents.length} مكونات تحتاج مراجعة`,
      details: { components: excessiveComponents },
    };
  }

  return {
    category: 'React',
    name: 'إعادة الرسم',
    status: 'pass',
    message: 'لا توجد مكونات مفرطة',
  };
}

// فحص أداء Web Vitals
function checkPerformanceMetrics(): DiagnosticResult {
  const issues = getAllPerformanceIssues();
  const criticalIssues = issues.filter(i => i.severity === 'critical');
  const warningIssues = issues.filter(i => i.severity === 'warning');

  if (criticalIssues.length > 0) {
    return {
      category: 'الأداء',
      name: 'Web Vitals',
      status: 'fail',
      message: `${criticalIssues.length} مشاكل حرجة`,
      details: { criticalIssues },
    };
  }

  if (warningIssues.length > 3) {
    return {
      category: 'الأداء',
      name: 'Web Vitals',
      status: 'warning',
      message: `${warningIssues.length} تحذيرات`,
      details: { warningIssues },
    };
  }

  return {
    category: 'الأداء',
    name: 'Web Vitals',
    status: 'pass',
    message: 'الأداء جيد',
  };
}

// فحص صحة الشبكة
async function checkNetworkHealth(): Promise<DiagnosticResult> {
  if (!navigator.onLine) {
    return {
      category: 'الشبكة',
      name: 'الاتصال',
      status: 'fail',
      message: 'لا يوجد اتصال بالإنترنت',
    };
  }

  try {
    const start = Date.now();
    await fetch('/favicon.ico', { cache: 'no-store' });
    const latency = Date.now() - start;

    if (latency > 1000) {
      return {
        category: 'الشبكة',
        name: 'الاتصال',
        status: 'warning',
        message: `زمن استجابة مرتفع: ${latency}ms`,
        details: { latency },
      };
    }

    return {
      category: 'الشبكة',
      name: 'الاتصال',
      status: 'pass',
      message: `الاتصال جيد: ${latency}ms`,
      details: { latency },
    };
  } catch {
    return {
      category: 'الشبكة',
      name: 'الاتصال',
      status: 'warning',
      message: 'تعذر قياس زمن الاستجابة',
    };
  }
}

// فحص التخزين المحلي
function checkLocalStorage(): DiagnosticResult {
  try {
    const keys = Object.keys(localStorage);
    let totalSize = 0;

    keys.forEach(key => {
      totalSize += (localStorage.getItem(key)?.length || 0) * 2; // UTF-16
    });

    const sizeMB = totalSize / (1024 * 1024);
    const maxSize = 5; // 5MB typical limit

    if (sizeMB > maxSize * 0.9) {
      return {
        category: 'التخزين',
        name: 'LocalStorage',
        status: 'fail',
        message: `التخزين ممتلئ تقريباً: ${sizeMB.toFixed(2)}MB`,
        details: { sizeMB, keys: keys.length },
      };
    }

    if (sizeMB > maxSize * 0.7) {
      return {
        category: 'التخزين',
        name: 'LocalStorage',
        status: 'warning',
        message: `استخدام مرتفع: ${sizeMB.toFixed(2)}MB`,
        details: { sizeMB, keys: keys.length },
      };
    }

    return {
      category: 'التخزين',
      name: 'LocalStorage',
      status: 'pass',
      message: `${keys.length} عناصر (${sizeMB.toFixed(2)}MB)`,
      details: { sizeMB, keys: keys.length },
    };
  } catch {
    return {
      category: 'التخزين',
      name: 'LocalStorage',
      status: 'fail',
      message: 'تعذر الوصول للتخزين المحلي',
    };
  }
}

// فحص Service Worker
async function checkServiceWorker(): Promise<DiagnosticResult> {
  if (!('serviceWorker' in navigator)) {
    return {
      category: 'Service Worker',
      name: 'الحالة',
      status: 'warning',
      message: 'غير مدعوم',
    };
  }

  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    
    if (registrations.length === 0) {
      return {
        category: 'Service Worker',
        name: 'الحالة',
        status: 'pass',
        message: 'لا يوجد SW نشط',
      };
    }

    return {
      category: 'Service Worker',
      name: 'الحالة',
      status: 'pass',
      message: `${registrations.length} SW نشط`,
      details: { count: registrations.length },
    };
  } catch {
    return {
      category: 'Service Worker',
      name: 'الحالة',
      status: 'warning',
      message: 'تعذر التحقق',
    };
  }
}

// فحص سجلات الأخطاء
async function checkErrorLogs(): Promise<DiagnosticResult> {
  try {
    const { data, error } = await supabase
      .from('system_error_logs')
      .select('id, severity')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    const criticalCount = data?.filter(e => e.severity === 'critical').length || 0;
    const totalCount = data?.length || 0;

    if (criticalCount > 0) {
      return {
        category: 'الأخطاء',
        name: 'السجلات',
        status: 'fail',
        message: `${criticalCount} أخطاء حرجة نشطة`,
        details: { criticalCount, totalCount },
      };
    }

    if (totalCount > 10) {
      return {
        category: 'الأخطاء',
        name: 'السجلات',
        status: 'warning',
        message: `${totalCount} أخطاء نشطة`,
        details: { totalCount },
      };
    }

    return {
      category: 'الأخطاء',
      name: 'السجلات',
      status: 'pass',
      message: totalCount > 0 ? `${totalCount} أخطاء طفيفة` : 'لا توجد أخطاء',
    };
  } catch {
    return {
      category: 'الأخطاء',
      name: 'السجلات',
      status: 'warning',
      message: 'تعذر فحص السجلات',
    };
  }
}

// فحص حجم Bundle
function checkBundleSize(): DiagnosticResult {
  const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
  const jsResources = resources.filter(r => r.name.includes('.js'));
  
  const totalSize = jsResources.reduce((sum, r) => sum + (r.transferSize || 0), 0);
  const sizeMB = totalSize / (1024 * 1024);

  if (sizeMB > 5) {
    return {
      category: 'Bundle',
      name: 'الحجم',
      status: 'fail',
      message: `حجم كبير جداً: ${sizeMB.toFixed(2)}MB`,
      details: { sizeMB, filesCount: jsResources.length },
    };
  }

  if (sizeMB > 2) {
    return {
      category: 'Bundle',
      name: 'الحجم',
      status: 'warning',
      message: `حجم مرتفع: ${sizeMB.toFixed(2)}MB`,
      details: { sizeMB, filesCount: jsResources.length },
    };
  }

  return {
    category: 'Bundle',
    name: 'الحجم',
    status: 'pass',
    message: `${sizeMB.toFixed(2)}MB (${jsResources.length} ملفات)`,
  };
}

// فحص React Query Cache
function checkQueryCache(): DiagnosticResult {
  // نفحص عدد الـ queries في الذاكرة من خلال localStorage أو patterns
  const queryKeys = Object.keys(sessionStorage).filter(k => k.includes('query'));
  
  if (queryKeys.length > 100) {
    return {
      category: 'React Query',
      name: 'Cache',
      status: 'warning',
      message: `cache كبير: ${queryKeys.length} استعلام`,
      details: { count: queryKeys.length },
    };
  }

  return {
    category: 'React Query',
    name: 'Cache',
    status: 'pass',
    message: 'Cache طبيعي',
  };
}

// حساب نقاط التشخيص
function calculateDiagnosticScore(results: DiagnosticResult[]): number {
  const weights = { pass: 10, warning: 5, fail: 0 };
  const total = results.length * 10;
  const score = results.reduce((sum, r) => sum + weights[r.status], 0);
  return Math.round((score / total) * 100);
}
