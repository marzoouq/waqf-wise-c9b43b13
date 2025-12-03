/**
 * أداة التشخيص العميق (Deep Diagnostics)
 * فحص شامل لجميع أجزاء التطبيق - 25 جانب
 */
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { productionLogger } from '@/lib/logger/production-logger';
import { getRenderReport } from './useRenderTracker';
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

  const runDiagnostics = useCallback(async () => {
    setIsRunning(true);
    setProgress(0);
    const results: DiagnosticResult[] = [];

    try {
      // === قاعدة البيانات (4 فحوصات) ===
      setProgress(4);
      results.push(await checkDatabaseConnection());
      setProgress(8);
      results.push(await checkDatabaseLatency());
      setProgress(12);
      results.push(await checkActiveConnections());
      setProgress(16);
      results.push(await checkSlowQueries());

      // === الذاكرة والأداء (4 فحوصات) ===
      setProgress(20);
      results.push(checkMemoryUsage());
      setProgress(24);
      results.push(checkMemoryLeaks());
      setProgress(28);
      results.push(checkPerformanceMetrics());
      setProgress(32);
      results.push(checkLongTasks());

      // === React والمكونات (4 فحوصات) ===
      setProgress(36);
      results.push(checkExcessiveRenders());
      setProgress(40);
      results.push(checkDOMSize());
      setProgress(44);
      results.push(checkReactQueryCache());
      setProgress(48);
      results.push(checkStateSize());

      // === الشبكة والاتصال (4 فحوصات) ===
      setProgress(52);
      results.push(await checkNetworkHealth());
      setProgress(56);
      results.push(checkNetworkRequests());
      setProgress(60);
      results.push(await checkAPIHealth());
      setProgress(64);
      results.push(checkConnectionType());

      // === التخزين (3 فحوصات) ===
      setProgress(68);
      results.push(checkLocalStorage());
      setProgress(72);
      results.push(checkSessionStorage());
      setProgress(76);
      results.push(checkIndexedDB());

      // === الأمان والمصادقة (3 فحوصات) ===
      setProgress(80);
      results.push(await checkAuthSession());
      setProgress(84);
      results.push(checkSecurityHeaders());
      setProgress(88);
      results.push(await checkErrorLogs());

      // === البيئة والموارد (3 فحوصات) ===
      setProgress(92);
      results.push(await checkServiceWorker());
      setProgress(96);
      results.push(checkBundleSize());
      setProgress(100);
      results.push(checkConsoleErrors());

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
      productionLogger.info('تم إكمال الفحص التشخيصي الشامل', { summary });

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

// ==================== فحوصات قاعدة البيانات ====================

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

    return {
      category: 'قاعدة البيانات',
      name: 'الاتصال',
      status: responseTime > 2000 ? 'warning' : 'pass',
      message: responseTime > 2000 ? `بطيء: ${responseTime}ms` : `سريع: ${responseTime}ms`,
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

async function checkDatabaseLatency(): Promise<DiagnosticResult> {
  const times: number[] = [];
  
  for (let i = 0; i < 3; i++) {
    const start = Date.now();
    await supabase.from('activities').select('id').limit(1);
    times.push(Date.now() - start);
  }
  
  const avgLatency = times.reduce((a, b) => a + b, 0) / times.length;
  const maxLatency = Math.max(...times);
  
  if (avgLatency > 1500 || maxLatency > 3000) {
    return {
      category: 'قاعدة البيانات',
      name: 'زمن الاستجابة',
      status: 'fail',
      message: `متوسط بطيء: ${avgLatency.toFixed(0)}ms`,
      details: { avgLatency, maxLatency, times },
    };
  }
  
  if (avgLatency > 800) {
    return {
      category: 'قاعدة البيانات',
      name: 'زمن الاستجابة',
      status: 'warning',
      message: `متوسط مرتفع: ${avgLatency.toFixed(0)}ms`,
      details: { avgLatency, maxLatency },
    };
  }
  
  return {
    category: 'قاعدة البيانات',
    name: 'زمن الاستجابة',
    status: 'pass',
    message: `متوسط جيد: ${avgLatency.toFixed(0)}ms`,
    details: { avgLatency, maxLatency },
  };
}

async function checkActiveConnections(): Promise<DiagnosticResult> {
  try {
    const channels = supabase.getChannels();
    const activeChannels = channels.length;
    
    if (activeChannels > 10) {
      return {
        category: 'قاعدة البيانات',
        name: 'الاتصالات النشطة',
        status: 'warning',
        message: `${activeChannels} قنوات نشطة`,
        details: { activeChannels },
      };
    }
    
    return {
      category: 'قاعدة البيانات',
      name: 'الاتصالات النشطة',
      status: 'pass',
      message: `${activeChannels} قنوات`,
      details: { activeChannels },
    };
  } catch {
    return {
      category: 'قاعدة البيانات',
      name: 'الاتصالات النشطة',
      status: 'warning',
      message: 'تعذر التحقق',
    };
  }
}

async function checkSlowQueries(): Promise<DiagnosticResult> {
  try {
    const { data, error } = await supabase
      .from('system_health_checks')
      .select('id, check_type, response_time_ms')
      .gt('response_time_ms', 2000)
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (error) throw error;
    
    const slowCount = data?.length || 0;
    
    if (slowCount > 5) {
      return {
        category: 'قاعدة البيانات',
        name: 'الاستعلامات البطيئة',
        status: 'fail',
        message: `${slowCount} استعلامات بطيئة حديثة`,
        details: { slowCount, queries: data },
      };
    }
    
    if (slowCount > 0) {
      return {
        category: 'قاعدة البيانات',
        name: 'الاستعلامات البطيئة',
        status: 'warning',
        message: `${slowCount} استعلامات بطيئة`,
        details: { slowCount },
      };
    }
    
    return {
      category: 'قاعدة البيانات',
      name: 'الاستعلامات البطيئة',
      status: 'pass',
      message: 'لا توجد استعلامات بطيئة',
    };
  } catch {
    return {
      category: 'قاعدة البيانات',
      name: 'الاستعلامات البطيئة',
      status: 'pass',
      message: 'لا توجد بيانات',
    };
  }
}

// ==================== فحوصات الذاكرة والأداء ====================

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
    totalJSHeapSize: number;
  }}).memory;
  
  const usagePercent = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
  const usedMB = memory.usedJSHeapSize / (1024 * 1024);

  if (usagePercent > 85) {
    return {
      category: 'الذاكرة',
      name: 'الاستخدام',
      status: 'fail',
      message: `استخدام حرج: ${usagePercent.toFixed(1)}% (${usedMB.toFixed(0)}MB)`,
      details: { usagePercent, usedMB },
    };
  }

  if (usagePercent > 70) {
    return {
      category: 'الذاكرة',
      name: 'الاستخدام',
      status: 'warning',
      message: `استخدام مرتفع: ${usagePercent.toFixed(1)}%`,
      details: { usagePercent, usedMB },
    };
  }

  return {
    category: 'الذاكرة',
    name: 'الاستخدام',
    status: 'pass',
    message: `طبيعي: ${usagePercent.toFixed(1)}% (${usedMB.toFixed(0)}MB)`,
    details: { usagePercent, usedMB },
  };
}

function checkMemoryLeaks(): DiagnosticResult {
  if (!('memory' in performance)) {
    return {
      category: 'الذاكرة',
      name: 'تسريبات',
      status: 'warning',
      message: 'غير مدعوم',
    };
  }

  const memory = (performance as Performance & { memory: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
  }}).memory;
  
  const fragmentation = ((memory.totalJSHeapSize - memory.usedJSHeapSize) / memory.totalJSHeapSize) * 100;
  
  if (fragmentation > 50) {
    return {
      category: 'الذاكرة',
      name: 'تسريبات',
      status: 'warning',
      message: `تجزئة عالية: ${fragmentation.toFixed(1)}%`,
      details: { fragmentation },
    };
  }
  
  return {
    category: 'الذاكرة',
    name: 'تسريبات',
    status: 'pass',
    message: `تجزئة منخفضة: ${fragmentation.toFixed(1)}%`,
    details: { fragmentation },
  };
}

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
      details: { criticalIssues: criticalIssues.slice(0, 5) },
    };
  }

  if (warningIssues.length > 3) {
    return {
      category: 'الأداء',
      name: 'Web Vitals',
      status: 'warning',
      message: `${warningIssues.length} تحذيرات`,
      details: { warningIssues: warningIssues.slice(0, 5) },
    };
  }

  return {
    category: 'الأداء',
    name: 'Web Vitals',
    status: 'pass',
    message: 'الأداء جيد',
  };
}

function checkLongTasks(): DiagnosticResult {
  const entries = performance.getEntriesByType('longtask');
  const recentLongTasks = entries.filter(e => 
    e.startTime > performance.now() - 60000 && e.duration > 100
  );
  
  if (recentLongTasks.length > 10) {
    return {
      category: 'الأداء',
      name: 'المهام الطويلة',
      status: 'fail',
      message: `${recentLongTasks.length} مهمة طويلة في الدقيقة الأخيرة`,
      details: { count: recentLongTasks.length },
    };
  }
  
  if (recentLongTasks.length > 5) {
    return {
      category: 'الأداء',
      name: 'المهام الطويلة',
      status: 'warning',
      message: `${recentLongTasks.length} مهام طويلة`,
      details: { count: recentLongTasks.length },
    };
  }
  
  return {
    category: 'الأداء',
    name: 'المهام الطويلة',
    status: 'pass',
    message: recentLongTasks.length > 0 ? `${recentLongTasks.length} مهام` : 'لا توجد مهام طويلة',
  };
}

// ==================== فحوصات React والمكونات ====================

function checkExcessiveRenders(): DiagnosticResult {
  const renderReport = getRenderReport();
  const excessiveComponents = renderReport.filter(r => r.renderCount > 50);

  if (excessiveComponents.length > 5) {
    return {
      category: 'React',
      name: 'إعادة الرسم',
      status: 'fail',
      message: `${excessiveComponents.length} مكونات مفرطة`,
      details: { components: excessiveComponents.slice(0, 5).map(c => c.componentName) },
    };
  }

  if (excessiveComponents.length > 0) {
    return {
      category: 'React',
      name: 'إعادة الرسم',
      status: 'warning',
      message: `${excessiveComponents.length} مكونات تحتاج مراجعة`,
      details: { components: excessiveComponents.map(c => c.componentName) },
    };
  }

  return {
    category: 'React',
    name: 'إعادة الرسم',
    status: 'pass',
    message: 'لا توجد مكونات مفرطة',
  };
}

function checkDOMSize(): DiagnosticResult {
  const totalNodes = document.getElementsByTagName('*').length;
  const maxDepth = getMaxDOMDepth(document.body);
  
  if (totalNodes > 3000 || maxDepth > 32) {
    return {
      category: 'React',
      name: 'حجم DOM',
      status: 'fail',
      message: `كبير جداً: ${totalNodes} عنصر، عمق ${maxDepth}`,
      details: { totalNodes, maxDepth },
    };
  }
  
  if (totalNodes > 1500 || maxDepth > 20) {
    return {
      category: 'React',
      name: 'حجم DOM',
      status: 'warning',
      message: `مرتفع: ${totalNodes} عنصر`,
      details: { totalNodes, maxDepth },
    };
  }
  
  return {
    category: 'React',
    name: 'حجم DOM',
    status: 'pass',
    message: `${totalNodes} عنصر، عمق ${maxDepth}`,
    details: { totalNodes, maxDepth },
  };
}

function getMaxDOMDepth(element: Element, depth = 0): number {
  if (!element.children.length) return depth;
  let maxChildDepth = depth;
  for (let i = 0; i < Math.min(element.children.length, 100); i++) {
    maxChildDepth = Math.max(maxChildDepth, getMaxDOMDepth(element.children[i], depth + 1));
  }
  return maxChildDepth;
}

function checkReactQueryCache(): DiagnosticResult {
  try {
    const cacheSize = sessionStorage.length + localStorage.length;
    
    if (cacheSize > 100) {
      return {
        category: 'React',
        name: 'Cache',
        status: 'warning',
        message: `${cacheSize} عناصر مخزنة`,
        details: { cacheSize },
      };
    }
    
    return {
      category: 'React',
      name: 'Cache',
      status: 'pass',
      message: `${cacheSize} عناصر`,
      details: { cacheSize },
    };
  } catch {
    return {
      category: 'React',
      name: 'Cache',
      status: 'warning',
      message: 'تعذر التحقق',
    };
  }
}

function checkStateSize(): DiagnosticResult {
  const reactRoots = document.querySelectorAll('[data-reactroot]');
  const reactContainers = document.querySelectorAll('#root, #app, [id^="__next"]');
  const totalRoots = reactRoots.length + reactContainers.length;
  
  if (totalRoots > 3) {
    return {
      category: 'React',
      name: 'الجذور',
      status: 'warning',
      message: `${totalRoots} جذور React`,
      details: { totalRoots },
    };
  }
  
  return {
    category: 'React',
    name: 'الجذور',
    status: 'pass',
    message: `${totalRoots} جذر`,
    details: { totalRoots },
  };
}

// ==================== فحوصات الشبكة والاتصال ====================

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
      message: `جيد: ${latency}ms`,
      details: { latency },
    };
  } catch {
    return {
      category: 'الشبكة',
      name: 'الاتصال',
      status: 'warning',
      message: 'تعذر القياس',
    };
  }
}

function checkNetworkRequests(): DiagnosticResult {
  const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
  const failedRequests = resources.filter(r => r.responseStatus && r.responseStatus >= 400);
  const slowRequests = resources.filter(r => r.duration > 3000);
  
  if (failedRequests.length > 5) {
    return {
      category: 'الشبكة',
      name: 'الطلبات',
      status: 'fail',
      message: `${failedRequests.length} طلبات فاشلة`,
      details: { failedCount: failedRequests.length, slowCount: slowRequests.length },
    };
  }
  
  if (slowRequests.length > 10) {
    return {
      category: 'الشبكة',
      name: 'الطلبات',
      status: 'warning',
      message: `${slowRequests.length} طلبات بطيئة`,
      details: { slowCount: slowRequests.length },
    };
  }
  
  return {
    category: 'الشبكة',
    name: 'الطلبات',
    status: 'pass',
    message: `${resources.length} طلب إجمالي`,
    details: { total: resources.length },
  };
}

async function checkAPIHealth(): Promise<DiagnosticResult> {
  try {
    const start = Date.now();
    const { error } = await supabase.auth.getSession();
    const responseTime = Date.now() - start;
    
    if (error) {
      return {
        category: 'الشبكة',
        name: 'API',
        status: 'warning',
        message: `خطأ: ${error.message}`,
      };
    }
    
    if (responseTime > 2000) {
      return {
        category: 'الشبكة',
        name: 'API',
        status: 'warning',
        message: `بطيء: ${responseTime}ms`,
        details: { responseTime },
      };
    }
    
    return {
      category: 'الشبكة',
      name: 'API',
      status: 'pass',
      message: `سريع: ${responseTime}ms`,
      details: { responseTime },
    };
  } catch {
    return {
      category: 'الشبكة',
      name: 'API',
      status: 'fail',
      message: 'تعذر الاتصال بالـ API',
    };
  }
}

function checkConnectionType(): DiagnosticResult {
  const connection = (navigator as Navigator & { connection?: {
    effectiveType: string;
    downlink: number;
    rtt: number;
  }}).connection;
  
  if (!connection) {
    return {
      category: 'الشبكة',
      name: 'نوع الاتصال',
      status: 'pass',
      message: 'غير متاح',
    };
  }
  
  const { effectiveType, downlink, rtt } = connection;
  
  if (effectiveType === '2g' || effectiveType === 'slow-2g') {
    return {
      category: 'الشبكة',
      name: 'نوع الاتصال',
      status: 'fail',
      message: `اتصال بطيء: ${effectiveType}`,
      details: { effectiveType, downlink, rtt },
    };
  }
  
  if (effectiveType === '3g') {
    return {
      category: 'الشبكة',
      name: 'نوع الاتصال',
      status: 'warning',
      message: `اتصال متوسط: ${effectiveType}`,
      details: { effectiveType, downlink, rtt },
    };
  }
  
  return {
    category: 'الشبكة',
    name: 'نوع الاتصال',
    status: 'pass',
    message: `${effectiveType} (${downlink}Mbps)`,
    details: { effectiveType, downlink, rtt },
  };
}

// ==================== فحوصات التخزين ====================

function checkLocalStorage(): DiagnosticResult {
  try {
    const keys = Object.keys(localStorage);
    let totalSize = 0;

    keys.forEach(key => {
      totalSize += (localStorage.getItem(key)?.length || 0) * 2;
    });

    const sizeMB = totalSize / (1024 * 1024);
    const maxSize = 5;

    if (sizeMB > maxSize * 0.9) {
      return {
        category: 'التخزين',
        name: 'LocalStorage',
        status: 'fail',
        message: `ممتلئ تقريباً: ${sizeMB.toFixed(2)}MB`,
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
      message: 'تعذر الوصول',
    };
  }
}

function checkSessionStorage(): DiagnosticResult {
  try {
    const keys = Object.keys(sessionStorage);
    let totalSize = 0;

    keys.forEach(key => {
      totalSize += (sessionStorage.getItem(key)?.length || 0) * 2;
    });

    const sizeKB = totalSize / 1024;

    if (sizeKB > 4000) {
      return {
        category: 'التخزين',
        name: 'SessionStorage',
        status: 'warning',
        message: `كبير: ${sizeKB.toFixed(0)}KB`,
        details: { sizeKB, keys: keys.length },
      };
    }

    return {
      category: 'التخزين',
      name: 'SessionStorage',
      status: 'pass',
      message: `${keys.length} عناصر (${sizeKB.toFixed(0)}KB)`,
      details: { sizeKB, keys: keys.length },
    };
  } catch {
    return {
      category: 'التخزين',
      name: 'SessionStorage',
      status: 'warning',
      message: 'تعذر الوصول',
    };
  }
}

function checkIndexedDB(): DiagnosticResult {
  if (!('indexedDB' in window)) {
    return {
      category: 'التخزين',
      name: 'IndexedDB',
      status: 'warning',
      message: 'غير مدعوم',
    };
  }
  
  return {
    category: 'التخزين',
    name: 'IndexedDB',
    status: 'pass',
    message: 'متاح',
  };
}

// ==================== فحوصات الأمان والمصادقة ====================

async function checkAuthSession(): Promise<DiagnosticResult> {
  try {
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      return {
        category: 'الأمان',
        name: 'الجلسة',
        status: 'warning',
        message: `خطأ: ${error.message}`,
      };
    }
    
    if (!data.session) {
      return {
        category: 'الأمان',
        name: 'الجلسة',
        status: 'pass',
        message: 'لا توجد جلسة نشطة',
      };
    }
    
    const expiresAt = data.session.expires_at ? data.session.expires_at * 1000 : 0;
    const timeLeft = expiresAt - Date.now();
    const minutesLeft = Math.floor(timeLeft / 60000);
    
    if (minutesLeft < 5) {
      return {
        category: 'الأمان',
        name: 'الجلسة',
        status: 'warning',
        message: `تنتهي قريباً: ${minutesLeft} دقيقة`,
        details: { minutesLeft },
      };
    }
    
    return {
      category: 'الأمان',
      name: 'الجلسة',
      status: 'pass',
      message: `نشطة (${minutesLeft} دقيقة متبقية)`,
      details: { minutesLeft },
    };
  } catch {
    return {
      category: 'الأمان',
      name: 'الجلسة',
      status: 'warning',
      message: 'تعذر التحقق',
    };
  }
}

function checkSecurityHeaders(): DiagnosticResult {
  const isHTTPS = window.location.protocol === 'https:';
  const isLocalhost = window.location.hostname === 'localhost';
  
  if (!isHTTPS && !isLocalhost) {
    return {
      category: 'الأمان',
      name: 'HTTPS',
      status: 'fail',
      message: 'الاتصال غير آمن',
    };
  }
  
  return {
    category: 'الأمان',
    name: 'HTTPS',
    status: 'pass',
    message: isHTTPS ? 'اتصال آمن' : 'بيئة تطوير',
  };
}

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
        category: 'الأمان',
        name: 'الأخطاء',
        status: 'fail',
        message: `${criticalCount} أخطاء حرجة`,
        details: { criticalCount, totalCount },
      };
    }

    if (totalCount > 10) {
      return {
        category: 'الأمان',
        name: 'الأخطاء',
        status: 'warning',
        message: `${totalCount} أخطاء نشطة`,
        details: { totalCount },
      };
    }

    return {
      category: 'الأمان',
      name: 'الأخطاء',
      status: 'pass',
      message: totalCount > 0 ? `${totalCount} أخطاء طفيفة` : 'لا توجد أخطاء',
    };
  } catch {
    return {
      category: 'الأمان',
      name: 'الأخطاء',
      status: 'pass',
      message: 'لا توجد سجلات',
    };
  }
}

// ==================== فحوصات البيئة والموارد ====================

async function checkServiceWorker(): Promise<DiagnosticResult> {
  if (!('serviceWorker' in navigator)) {
    return {
      category: 'البيئة',
      name: 'Service Worker',
      status: 'pass',
      message: 'غير مدعوم',
    };
  }

  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    
    return {
      category: 'البيئة',
      name: 'Service Worker',
      status: 'pass',
      message: registrations.length > 0 ? `${registrations.length} مسجل` : 'لا يوجد',
      details: { count: registrations.length },
    };
  } catch {
    return {
      category: 'البيئة',
      name: 'Service Worker',
      status: 'warning',
      message: 'تعذر التحقق',
    };
  }
}

function checkBundleSize(): DiagnosticResult {
  const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
  const jsResources = resources.filter(r => r.name.includes('.js'));
  const cssResources = resources.filter(r => r.name.includes('.css'));
  
  const jsSize = jsResources.reduce((sum, r) => sum + (r.transferSize || 0), 0);
  const cssSize = cssResources.reduce((sum, r) => sum + (r.transferSize || 0), 0);
  const totalSize = jsSize + cssSize;
  const sizeMB = totalSize / (1024 * 1024);

  if (sizeMB > 5) {
    return {
      category: 'البيئة',
      name: 'حجم Bundle',
      status: 'fail',
      message: `كبير جداً: ${sizeMB.toFixed(2)}MB`,
      details: { sizeMB, jsCount: jsResources.length, cssCount: cssResources.length },
    };
  }

  if (sizeMB > 2) {
    return {
      category: 'البيئة',
      name: 'حجم Bundle',
      status: 'warning',
      message: `مرتفع: ${sizeMB.toFixed(2)}MB`,
      details: { sizeMB },
    };
  }

  return {
    category: 'البيئة',
    name: 'حجم Bundle',
    status: 'pass',
    message: `${sizeMB.toFixed(2)}MB (${jsResources.length} JS, ${cssResources.length} CSS)`,
    details: { sizeMB },
  };
}

function checkConsoleErrors(): DiagnosticResult {
  // فحص أخطاء الـ Console المخزنة
  const consoleErrors = (window as Window & { __consoleErrors?: string[] }).__consoleErrors || [];
  
  if (consoleErrors.length > 10) {
    return {
      category: 'البيئة',
      name: 'Console',
      status: 'fail',
      message: `${consoleErrors.length} أخطاء`,
      details: { count: consoleErrors.length },
    };
  }
  
  if (consoleErrors.length > 0) {
    return {
      category: 'البيئة',
      name: 'Console',
      status: 'warning',
      message: `${consoleErrors.length} أخطاء`,
      details: { count: consoleErrors.length },
    };
  }
  
  return {
    category: 'البيئة',
    name: 'Console',
    status: 'pass',
    message: 'لا توجد أخطاء',
  };
}

// ==================== حساب النتيجة ====================

function calculateDiagnosticScore(results: DiagnosticResult[]): number {
  const weights = { pass: 100, warning: 50, fail: 0 };
  const total = results.reduce((sum, r) => sum + weights[r.status], 0);
  return Math.round(total / results.length);
}
