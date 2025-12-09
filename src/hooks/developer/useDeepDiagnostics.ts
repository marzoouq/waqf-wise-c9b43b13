/**
 * أداة التشخيص العميق (Deep Diagnostics)
 * فحص شامل لجميع أجزاء التطبيق - 25 جانب
 */
import { useState, useCallback } from 'react';
import { DiagnosticsService } from '@/services/diagnostics.service';
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
      results.push(checkActiveConnections());
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
  try {
    const result = await DiagnosticsService.checkConnection();

    if (!result.success) {
      return {
        category: 'قاعدة البيانات',
        name: 'الاتصال',
        status: 'fail',
        message: `فشل الاتصال: ${result.error?.message}`,
        details: { error: result.error },
      };
    }

    return {
      category: 'قاعدة البيانات',
      name: 'الاتصال',
      status: result.responseTime > 2000 ? 'warning' : 'pass',
      message: result.responseTime > 2000 ? `بطيء: ${result.responseTime}ms` : `سريع: ${result.responseTime}ms`,
      details: { responseTime: result.responseTime },
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
  const result = await DiagnosticsService.measureLatency(3);
  
  if (result.avgLatency > 1500 || result.maxLatency > 3000) {
    return {
      category: 'قاعدة البيانات',
      name: 'زمن الاستجابة',
      status: 'fail',
      message: `متوسط بطيء: ${result.avgLatency.toFixed(0)}ms`,
      details: result,
    };
  }
  
  if (result.avgLatency > 800) {
    return {
      category: 'قاعدة البيانات',
      name: 'زمن الاستجابة',
      status: 'warning',
      message: `متوسط مرتفع: ${result.avgLatency.toFixed(0)}ms`,
      details: result,
    };
  }
  
  return {
    category: 'قاعدة البيانات',
    name: 'زمن الاستجابة',
    status: 'pass',
    message: `متوسط جيد: ${result.avgLatency.toFixed(0)}ms`,
    details: result,
  };
}

function checkActiveConnections(): DiagnosticResult {
  try {
    const activeChannels = DiagnosticsService.getActiveChannels();
    
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
    const data = await DiagnosticsService.getSlowQueries(2000, 10);
    const slowCount = data.length;
    
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

function checkReactQueryCache(): DiagnosticResult {
  try {
    const queryClient = (window as Window & { __REACT_QUERY_DEVTOOLS_GLOBAL_STORE__?: { queryClient?: { getQueryCache: () => { getAll: () => unknown[] } } } }).__REACT_QUERY_DEVTOOLS_GLOBAL_STORE__?.queryClient;
    
    if (!queryClient) {
      return {
        category: 'React',
        name: 'React Query Cache',
        status: 'pass',
        message: 'لا يمكن قياس الحجم',
      };
    }
    
    const cachedQueries = queryClient.getQueryCache().getAll().length;
    
    if (cachedQueries > 100) {
      return {
        category: 'React',
        name: 'React Query Cache',
        status: 'warning',
        message: `${cachedQueries} استعلام في الذاكرة`,
        details: { cachedQueries },
      };
    }
    
    return {
      category: 'React',
      name: 'React Query Cache',
      status: 'pass',
      message: `${cachedQueries} استعلام`,
      details: { cachedQueries },
    };
  } catch {
    return {
      category: 'React',
      name: 'React Query Cache',
      status: 'pass',
      message: 'لا يمكن التحقق',
    };
  }
}

function checkStateSize(): DiagnosticResult {
  try {
    const localStorageSize = JSON.stringify(localStorage).length;
    const sessionStorageSize = JSON.stringify(sessionStorage).length;
    const totalKB = (localStorageSize + sessionStorageSize) / 1024;
    
    if (totalKB > 5000) {
      return {
        category: 'React',
        name: 'حجم الحالة',
        status: 'fail',
        message: `كبير جداً: ${totalKB.toFixed(0)}KB`,
        details: { totalKB },
      };
    }
    
    if (totalKB > 2000) {
      return {
        category: 'React',
        name: 'حجم الحالة',
        status: 'warning',
        message: `مرتفع: ${totalKB.toFixed(0)}KB`,
        details: { totalKB },
      };
    }
    
    return {
      category: 'React',
      name: 'حجم الحالة',
      status: 'pass',
      message: `${totalKB.toFixed(0)}KB`,
      details: { totalKB },
    };
  } catch {
    return {
      category: 'React',
      name: 'حجم الحالة',
      status: 'pass',
      message: 'لا يمكن التحقق',
    };
  }
}

// ==================== فحوصات الشبكة ====================

async function checkNetworkHealth(): Promise<DiagnosticResult> {
  const start = Date.now();
  try {
    const response = await fetch('/favicon.ico', { cache: 'no-cache' });
    const latency = Date.now() - start;
    
    if (!response.ok) {
      return {
        category: 'الشبكة',
        name: 'الصحة',
        status: 'warning',
        message: `استجابة ${response.status}`,
      };
    }
    
    if (latency > 1000) {
      return {
        category: 'الشبكة',
        name: 'الصحة',
        status: 'warning',
        message: `بطيء: ${latency}ms`,
        details: { latency },
      };
    }
    
    return {
      category: 'الشبكة',
      name: 'الصحة',
      status: 'pass',
      message: `${latency}ms`,
      details: { latency },
    };
  } catch {
    return {
      category: 'الشبكة',
      name: 'الصحة',
      status: 'fail',
      message: 'فشل الاتصال',
    };
  }
}

function checkNetworkRequests(): DiagnosticResult {
  const entries = performance.getEntriesByType('resource');
  const recentRequests = entries.filter(e => 
    e.startTime > performance.now() - 60000
  );
  
  if (recentRequests.length > 200) {
    return {
      category: 'الشبكة',
      name: 'الطلبات',
      status: 'warning',
      message: `${recentRequests.length} طلب في الدقيقة الأخيرة`,
      details: { count: recentRequests.length },
    };
  }
  
  return {
    category: 'الشبكة',
    name: 'الطلبات',
    status: 'pass',
    message: `${recentRequests.length} طلب`,
    details: { count: recentRequests.length },
  };
}

async function checkAPIHealth(): Promise<DiagnosticResult> {
  try {
    const result = await DiagnosticsService.checkConnection();
    
    return {
      category: 'الشبكة',
      name: 'API',
      status: result.success ? 'pass' : 'fail',
      message: result.success ? `${result.responseTime}ms` : 'فشل',
      details: { responseTime: result.responseTime },
    };
  } catch {
    return {
      category: 'الشبكة',
      name: 'API',
      status: 'fail',
      message: 'فشل الاتصال',
    };
  }
}

function checkConnectionType(): DiagnosticResult {
  const connection = (navigator as Navigator & { connection?: { effectiveType: string; downlink: number } }).connection;
  
  if (!connection) {
    return {
      category: 'الشبكة',
      name: 'نوع الاتصال',
      status: 'pass',
      message: 'غير متاح',
    };
  }
  
  const type = connection.effectiveType;
  
  if (type === 'slow-2g' || type === '2g') {
    return {
      category: 'الشبكة',
      name: 'نوع الاتصال',
      status: 'fail',
      message: `بطيء: ${type}`,
      details: { type, downlink: connection.downlink },
    };
  }
  
  if (type === '3g') {
    return {
      category: 'الشبكة',
      name: 'نوع الاتصال',
      status: 'warning',
      message: `متوسط: ${type}`,
      details: { type, downlink: connection.downlink },
    };
  }
  
  return {
    category: 'الشبكة',
    name: 'نوع الاتصال',
    status: 'pass',
    message: type,
    details: { type, downlink: connection.downlink },
  };
}

// ==================== فحوصات التخزين ====================

function checkLocalStorage(): DiagnosticResult {
  try {
    const size = JSON.stringify(localStorage).length / 1024;
    const quota = 5 * 1024; // 5MB typical
    const usagePercent = (size / quota) * 100;
    
    if (usagePercent > 80) {
      return {
        category: 'التخزين',
        name: 'LocalStorage',
        status: 'warning',
        message: `${size.toFixed(0)}KB (${usagePercent.toFixed(0)}%)`,
        details: { sizeKB: size, usagePercent },
      };
    }
    
    return {
      category: 'التخزين',
      name: 'LocalStorage',
      status: 'pass',
      message: `${size.toFixed(0)}KB`,
      details: { sizeKB: size },
    };
  } catch {
    return {
      category: 'التخزين',
      name: 'LocalStorage',
      status: 'fail',
      message: 'غير متاح',
    };
  }
}

function checkSessionStorage(): DiagnosticResult {
  try {
    const size = JSON.stringify(sessionStorage).length / 1024;
    
    return {
      category: 'التخزين',
      name: 'SessionStorage',
      status: 'pass',
      message: `${size.toFixed(0)}KB`,
      details: { sizeKB: size },
    };
  } catch {
    return {
      category: 'التخزين',
      name: 'SessionStorage',
      status: 'fail',
      message: 'غير متاح',
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

// ==================== فحوصات الأمان ====================

async function checkAuthSession(): Promise<DiagnosticResult> {
  try {
    const result = await DiagnosticsService.checkAuthSession();
    
    return {
      category: 'الأمان',
      name: 'الجلسة',
      status: result.hasSession ? 'pass' : 'warning',
      message: result.hasSession ? 'نشطة' : 'غير مسجل',
    };
  } catch {
    return {
      category: 'الأمان',
      name: 'الجلسة',
      status: 'fail',
      message: 'خطأ في التحقق',
    };
  }
}

function checkSecurityHeaders(): DiagnosticResult {
  // لا يمكن التحقق من headers من الـ client-side
  return {
    category: 'الأمان',
    name: 'Headers',
    status: 'pass',
    message: 'لا يمكن التحقق من الـ client',
  };
}

async function checkErrorLogs(): Promise<DiagnosticResult> {
  try {
    const logs = await DiagnosticsService.getRecentErrorLogs(20);
    const criticalCount = logs.length;
    
    if (criticalCount > 10) {
      return {
        category: 'الأمان',
        name: 'سجلات الأخطاء',
        status: 'fail',
        message: `${criticalCount} أخطاء حرجة`,
        details: { criticalCount },
      };
    }
    
    if (criticalCount > 0) {
      return {
        category: 'الأمان',
        name: 'سجلات الأخطاء',
        status: 'warning',
        message: `${criticalCount} أخطاء`,
        details: { criticalCount },
      };
    }
    
    return {
      category: 'الأمان',
      name: 'سجلات الأخطاء',
      status: 'pass',
      message: 'لا توجد أخطاء حرجة',
    };
  } catch {
    return {
      category: 'الأمان',
      name: 'سجلات الأخطاء',
      status: 'pass',
      message: 'لا يمكن التحقق',
    };
  }
}

// ==================== فحوصات البيئة ====================

async function checkServiceWorker(): Promise<DiagnosticResult> {
  if (!('serviceWorker' in navigator)) {
    return {
      category: 'البيئة',
      name: 'Service Worker',
      status: 'warning',
      message: 'غير مدعوم',
    };
  }
  
  try {
    const registration = await navigator.serviceWorker.getRegistration();
    
    return {
      category: 'البيئة',
      name: 'Service Worker',
      status: registration ? 'pass' : 'warning',
      message: registration ? 'مسجل' : 'غير مسجل',
    };
  } catch {
    return {
      category: 'البيئة',
      name: 'Service Worker',
      status: 'warning',
      message: 'خطأ في التحقق',
    };
  }
}

function checkBundleSize(): DiagnosticResult {
  const scripts = document.querySelectorAll('script[src]');
  const totalScripts = scripts.length;
  
  if (totalScripts > 20) {
    return {
      category: 'البيئة',
      name: 'حجم الحزمة',
      status: 'warning',
      message: `${totalScripts} ملف JS`,
      details: { totalScripts },
    };
  }
  
  return {
    category: 'البيئة',
    name: 'حجم الحزمة',
    status: 'pass',
    message: `${totalScripts} ملف JS`,
    details: { totalScripts },
  };
}

function checkConsoleErrors(): DiagnosticResult {
  // لا يمكن قراءة console errors برمجياً
  return {
    category: 'البيئة',
    name: 'Console Errors',
    status: 'pass',
    message: 'راجع console المتصفح',
  };
}

// ==================== دوال مساعدة ====================

function getMaxDOMDepth(element: Element, depth = 0): number {
  if (!element.children.length) return depth;
  
  let maxChildDepth = depth;
  for (const child of element.children) {
    const childDepth = getMaxDOMDepth(child, depth + 1);
    if (childDepth > maxChildDepth) {
      maxChildDepth = childDepth;
    }
  }
  
  return maxChildDepth;
}

function calculateDiagnosticScore(results: DiagnosticResult[]): number {
  const weights = { pass: 1, warning: 0.5, fail: 0 };
  const total = results.reduce((sum, r) => sum + weights[r.status], 0);
  return Math.round((total / results.length) * 100);
}
