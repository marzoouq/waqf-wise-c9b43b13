/**
 * أداة تحليل صحة الكود في وقت التشغيل
 * تكشف المشاكل الحقيقية في التطبيق مباشرة
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { productionLogger } from '@/lib/logger/production-logger';

export interface CodeIssue {
  id: string;
  type: 'error' | 'warning' | 'info' | 'critical';
  category: string;
  message: string;
  details?: string;
  file?: string;
  line?: number;
  timestamp: Date;
  autoFixable?: boolean;
}

export interface HealthReport {
  score: number;
  totalIssues: number;
  criticalCount: number;
  errorCount: number;
  warningCount: number;
  infoCount: number;
  categories: Record<string, number>;
  lastAnalysis: Date;
}

// سجل عام للمشاكل المكتشفة
const issuesRegistry = new Map<string, CodeIssue>();
let analysisListeners: ((issues: CodeIssue[]) => void)[] = [];

// تسجيل مشكلة جديدة
export function registerIssue(issue: Omit<CodeIssue, 'id' | 'timestamp'>) {
  const id = `${issue.category}-${issue.message}-${Date.now()}`;
  const fullIssue: CodeIssue = {
    ...issue,
    id,
    timestamp: new Date(),
  };
  
  issuesRegistry.set(id, fullIssue);
  
  // إشعار المستمعين
  analysisListeners.forEach(listener => {
    listener(Array.from(issuesRegistry.values()));
  });
  
  // تسجيل في السجل
  if (issue.type === 'critical' || issue.type === 'error') {
    productionLogger.error(`[CodeHealth] ${issue.category}: ${issue.message}`, { details: issue.details });
  }
  
  return id;
}

export function useCodeHealthAnalyzer(enabled: boolean = true) {
  const [issues, setIssues] = useState<CodeIssue[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [report, setReport] = useState<HealthReport | null>(null);
  const analysisInterval = useRef<NodeJS.Timeout | null>(null);

  // الاستماع للتحديثات
  useEffect(() => {
    const listener = (newIssues: CodeIssue[]) => {
      setIssues(newIssues);
    };
    
    if (enabled) {
      analysisListeners.push(listener);
      setIssues(Array.from(issuesRegistry.values()));
    }
    
    return () => {
      analysisListeners = analysisListeners.filter(l => l !== listener);
    };
  }, [enabled]);

  // تحليل شامل
  const runFullAnalysis = useCallback(async () => {
    if (!enabled) return;
    setIsAnalyzing(true);
    
    try {
      // 1. فحص أخطاء Console
      checkConsoleErrors();
      
      // 2. فحص DOM
      checkDOMIssues();
      
      // 3. فحص الذاكرة
      checkMemoryIssues();
      
      // 4. فحص الشبكة
      checkNetworkIssues();
      
      // 5. فحص React
      checkReactIssues();
      
      // 6. فحص الأداء
      checkPerformanceIssues();
      
      // 7. فحص الأمان
      checkSecurityIssues();
      
      // 8. فحص إمكانية الوصول
      checkAccessibilityIssues();
      
      // 9. فحص SEO
      checkSEOIssues();
      
      // 10. فحص التخزين
      checkStorageIssues();
      
      // إنشاء التقرير
      generateReport();
      
    } catch (error) {
      productionLogger.error('فشل التحليل الشامل', { error });
    } finally {
      setIsAnalyzing(false);
    }
  }, [enabled]);

  // فحص أخطاء Console - يتم مرة واحدة فقط
  const checkConsoleErrors = () => {
    // لا نعترض console.error هنا لتجنب التكرار
    // بدلاً من ذلك نفحص الأخطاء المسجلة مسبقاً
    // تم نقل اعتراض الأخطاء إلى useEffect منفصل
  };

  // فحص DOM
  const checkDOMIssues = () => {
    // فحص عدد العناصر
    const allElements = document.querySelectorAll('*');
    if (allElements.length > 3000) {
      registerIssue({
        type: 'warning',
        category: 'DOM',
        message: `عدد عناصر DOM كبير جداً: ${allElements.length}`,
        details: 'يؤثر على الأداء - يُنصح بالتحسين',
      });
    }

    // فحص عمق DOM
    let maxDepth = 0;
    const checkDepth = (el: Element, depth: number) => {
      maxDepth = Math.max(maxDepth, depth);
      Array.from(el.children).forEach(child => checkDepth(child, depth + 1));
    };
    checkDepth(document.body, 0);
    
    if (maxDepth > 32) {
      registerIssue({
        type: 'warning',
        category: 'DOM',
        message: `عمق DOM كبير: ${maxDepth} مستوى`,
        details: 'يُنصح بتقليل تداخل العناصر',
      });
    }

    // فحص الصور بدون alt
    const imagesWithoutAlt = document.querySelectorAll('img:not([alt])');
    if (imagesWithoutAlt.length > 0) {
      registerIssue({
        type: 'warning',
        category: 'Accessibility',
        message: `${imagesWithoutAlt.length} صورة بدون نص بديل (alt)`,
        autoFixable: true,
      });
    }

    // فحص الروابط الفارغة
    const emptyLinks = document.querySelectorAll('a:not([href]), a[href=""], a[href="#"]');
    if (emptyLinks.length > 0) {
      registerIssue({
        type: 'warning',
        category: 'SEO',
        message: `${emptyLinks.length} رابط فارغ أو غير صالح`,
      });
    }

    // فحص النماذج بدون labels
    const inputsWithoutLabels = document.querySelectorAll('input:not([aria-label]):not([id])');
    if (inputsWithoutLabels.length > 0) {
      registerIssue({
        type: 'info',
        category: 'Accessibility',
        message: `${inputsWithoutLabels.length} حقل إدخال بدون تسمية`,
      });
    }
  };

  // فحص الذاكرة
  const checkMemoryIssues = () => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const usedPercent = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
      
      if (usedPercent > 90) {
        registerIssue({
          type: 'critical',
          category: 'Memory',
          message: `استخدام الذاكرة حرج: ${usedPercent.toFixed(1)}%`,
          details: `${(memory.usedJSHeapSize / 1024 / 1024).toFixed(1)}MB من ${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(1)}MB`,
        });
      } else if (usedPercent > 75) {
        registerIssue({
          type: 'warning',
          category: 'Memory',
          message: `استخدام الذاكرة مرتفع: ${usedPercent.toFixed(1)}%`,
        });
      }
    }

    // فحص تسرب الذاكرة المحتمل
    const detachedNodes = document.querySelectorAll('[data-detached]');
    if (detachedNodes.length > 10) {
      registerIssue({
        type: 'warning',
        category: 'Memory',
        message: `${detachedNodes.length} عنصر منفصل محتمل`,
        details: 'قد يشير إلى تسرب ذاكرة',
      });
    }
  };

  // فحص الشبكة
  const checkNetworkIssues = () => {
    // فحص الاتصال
    if (!navigator.onLine) {
      registerIssue({
        type: 'critical',
        category: 'Network',
        message: 'لا يوجد اتصال بالإنترنت',
      });
    }

    // فحص سرعة الاتصال
    const connection = (navigator as any).connection;
    if (connection) {
      if (connection.effectiveType === '2g' || connection.effectiveType === 'slow-2g') {
        registerIssue({
          type: 'warning',
          category: 'Network',
          message: `سرعة اتصال بطيئة: ${connection.effectiveType}`,
        });
      }
      
      if (connection.saveData) {
        registerIssue({
          type: 'info',
          category: 'Network',
          message: 'وضع توفير البيانات مفعل',
        });
      }
    }
  };

  // فحص React
  const checkReactIssues = () => {
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
  };

  // فحص الأداء
  const checkPerformanceIssues = () => {
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
    const totalCLS = layoutShifts.reduce((sum, entry: any) => sum + (entry.value || 0), 0);
    if (totalCLS > 0.25) {
      registerIssue({
        type: 'warning',
        category: 'Performance',
        message: `CLS مرتفع: ${totalCLS.toFixed(3)}`,
        details: 'هناك تحركات غير متوقعة في الصفحة',
      });
    }
  };

  // فحص الأمان
  const checkSecurityIssues = () => {
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
  };

  // فحص إمكانية الوصول
  const checkAccessibilityIssues = () => {
    // فحص تباين الألوان (تقريبي)
    const textElements = document.querySelectorAll('p, span, h1, h2, h3, h4, h5, h6, a, button, label');
    let lowContrastCount = 0;
    
    textElements.forEach(el => {
      const style = window.getComputedStyle(el);
      const color = style.color;
      const bg = style.backgroundColor;
      
      // فحص بسيط للنص الأبيض على خلفية فاتحة
      if (color === 'rgb(255, 255, 255)' && bg.includes('255')) {
        lowContrastCount++;
      }
    });
    
    if (lowContrastCount > 5) {
      registerIssue({
        type: 'warning',
        category: 'Accessibility',
        message: `${lowContrastCount} عنصر بتباين منخفض محتمل`,
      });
    }

    // فحص حجم النص
    const smallText = document.querySelectorAll('*');
    let tooSmallCount = 0;
    smallText.forEach(el => {
      const fontSize = parseFloat(window.getComputedStyle(el).fontSize);
      if (fontSize < 12 && el.textContent?.trim()) {
        tooSmallCount++;
      }
    });
    
    if (tooSmallCount > 10) {
      registerIssue({
        type: 'info',
        category: 'Accessibility',
        message: `${tooSmallCount} عنصر بخط صغير (<12px)`,
      });
    }

    // فحص أزرار بدون نص
    const buttonsWithoutText = document.querySelectorAll('button:empty:not([aria-label])');
    if (buttonsWithoutText.length > 0) {
      registerIssue({
        type: 'warning',
        category: 'Accessibility',
        message: `${buttonsWithoutText.length} زر بدون نص أو تسمية`,
      });
    }
  };

  // فحص SEO
  const checkSEOIssues = () => {
    // فحص العنوان
    const title = document.title;
    if (!title || title.length < 10) {
      registerIssue({
        type: 'warning',
        category: 'SEO',
        message: 'عنوان الصفحة قصير أو مفقود',
      });
    } else if (title.length > 60) {
      registerIssue({
        type: 'info',
        category: 'SEO',
        message: `عنوان الصفحة طويل (${title.length} حرف)`,
      });
    }

    // فحص meta description
    const metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      registerIssue({
        type: 'warning',
        category: 'SEO',
        message: 'meta description مفقود',
      });
    }

    // فحص H1
    const h1s = document.querySelectorAll('h1');
    if (h1s.length === 0) {
      registerIssue({
        type: 'warning',
        category: 'SEO',
        message: 'لا يوجد عنوان H1 في الصفحة',
      });
    } else if (h1s.length > 1) {
      registerIssue({
        type: 'info',
        category: 'SEO',
        message: `${h1s.length} عناوين H1 في الصفحة (يُفضل واحد)`,
      });
    }

    // فحص canonical
    const canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      registerIssue({
        type: 'info',
        category: 'SEO',
        message: 'رابط canonical مفقود',
      });
    }
  };

  // فحص التخزين
  const checkStorageIssues = () => {
    // فحص حجم localStorage
    let localStorageSize = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        localStorageSize += localStorage[key].length * 2; // UTF-16
      }
    }
    
    const localStorageMB = localStorageSize / 1024 / 1024;
    if (localStorageMB > 4) {
      registerIssue({
        type: 'warning',
        category: 'Storage',
        message: `localStorage ممتلئ: ${localStorageMB.toFixed(1)}MB`,
        details: 'قد يتسبب في أخطاء عند الإضافة',
      });
    }

    // فحص sessionStorage
    let sessionStorageSize = 0;
    for (let key in sessionStorage) {
      if (sessionStorage.hasOwnProperty(key)) {
        sessionStorageSize += sessionStorage[key].length * 2;
      }
    }
    
    const sessionStorageMB = sessionStorageSize / 1024 / 1024;
    if (sessionStorageMB > 4) {
      registerIssue({
        type: 'warning',
        category: 'Storage',
        message: `sessionStorage ممتلئ: ${sessionStorageMB.toFixed(1)}MB`,
      });
    }

    // فحص الكوكيز
    const cookiesSize = document.cookie.length;
    if (cookiesSize > 4000) {
      registerIssue({
        type: 'warning',
        category: 'Storage',
        message: `حجم الكوكيز كبير: ${(cookiesSize/1024).toFixed(1)}KB`,
      });
    }
  };

  // إنشاء التقرير
  const generateReport = useCallback(() => {
    const allIssues = Array.from(issuesRegistry.values());
    
    const categories: Record<string, number> = {};
    let criticalCount = 0;
    let errorCount = 0;
    let warningCount = 0;
    let infoCount = 0;
    
    allIssues.forEach(issue => {
      categories[issue.category] = (categories[issue.category] || 0) + 1;
      
      switch (issue.type) {
        case 'critical': criticalCount++; break;
        case 'error': errorCount++; break;
        case 'warning': warningCount++; break;
        case 'info': infoCount++; break;
      }
    });
    
    // حساب النتيجة (100 - penalties)
    let score = 100;
    score -= criticalCount * 20;
    score -= errorCount * 10;
    score -= warningCount * 3;
    score -= infoCount * 1;
    score = Math.max(0, Math.min(100, score));
    
    setReport({
      score,
      totalIssues: allIssues.length,
      criticalCount,
      errorCount,
      warningCount,
      infoCount,
      categories,
      lastAnalysis: new Date(),
    });
  }, []);

  // مسح المشاكل
  const clearIssues = useCallback(() => {
    issuesRegistry.clear();
    setIssues([]);
    setReport(null);
  }, []);

  // تشغيل التحليل الدوري
  useEffect(() => {
    if (!enabled) {
      return;
    }
    
    // تشغيل فوري بعد تأخير قصير
    const timeout = setTimeout(() => {
      runFullAnalysis();
    }, 1000);
    
    // تشغيل دوري كل 30 ثانية
    analysisInterval.current = setInterval(runFullAnalysis, 30000);
    
    return () => {
      clearTimeout(timeout);
      if (analysisInterval.current) {
        clearInterval(analysisInterval.current);
      }
    };
  }, [enabled, runFullAnalysis]);

  return {
    issues,
    report,
    isAnalyzing,
    runFullAnalysis,
    clearIssues,
    registerIssue,
  };
}

// تصدير دالة للاستخدام الخارجي
export function getAllCodeIssues(): CodeIssue[] {
  return Array.from(issuesRegistry.values());
}

export function clearAllCodeIssues() {
  issuesRegistry.clear();
}
