/**
 * أداة حماية الأداء (Performance Guard)
 * تحذر من مشاكل الأداء قبل وقوعها
 * محسّنة لتجنب التكرار وتقليل الحمل
 */
import { useEffect, useCallback, useRef, useState } from 'react';
import { productionLogger } from '@/lib/logger/production-logger';

// منع التكرار في التسجيل
const loggedIssues = new Set<string>();
const LOG_COOLDOWN_MS = 30000; // 30 ثانية بين التسجيلات المتكررة

interface PerformanceIssue {
  type: 'slow_render' | 'long_task' | 'layout_shift' | 'memory_pressure' | 'network_slow' | 'bundle_large';
  message: string;
  severity: 'info' | 'warning' | 'critical';
  timestamp: number;
  details?: Record<string, unknown>;
}

interface PerformanceMetrics {
  fcp: number | null; // First Contentful Paint
  lcp: number | null; // Largest Contentful Paint
  fid: number | null; // First Input Delay
  cls: number | null; // Cumulative Layout Shift
  ttfb: number | null; // Time to First Byte
  longTasks: number;
}

// سجل المشاكل
const issuesRegistry: PerformanceIssue[] = [];
const MAX_ISSUES = 100;

// حدود الأداء
const PERFORMANCE_THRESHOLDS = {
  FCP_GOOD: 1800,
  FCP_POOR: 3000,
  LCP_GOOD: 2500,
  LCP_POOR: 4000,
  FID_GOOD: 100,
  FID_POOR: 300,
  CLS_GOOD: 0.1,
  CLS_POOR: 0.25,
  TTFB_GOOD: 800,
  TTFB_POOR: 1800,
  LONG_TASK_MS: 50,
};

export function usePerformanceGuard(enabled: boolean = true) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fcp: null,
    lcp: null,
    fid: null,
    cls: null,
    ttfb: null,
    longTasks: 0,
  });
  const [issues, setIssues] = useState<PerformanceIssue[]>([]);
  const longTaskCount = useRef(0);

  // إضافة مشكلة جديدة مع منع التكرار
  const addIssue = useCallback((issue: Omit<PerformanceIssue, 'timestamp'>) => {
    const issueKey = `${issue.type}_${issue.message}`;
    const now = Date.now();
    
    // التحقق من التكرار
    if (loggedIssues.has(issueKey)) {
      return; // تجاهل المشكلة المكررة
    }
    
    // إضافة للسجل مع timeout للإزالة
    loggedIssues.add(issueKey);
    setTimeout(() => loggedIssues.delete(issueKey), LOG_COOLDOWN_MS);

    const newIssue: PerformanceIssue = {
      ...issue,
      timestamp: now,
    };

    issuesRegistry.push(newIssue);
    if (issuesRegistry.length > MAX_ISSUES) {
      issuesRegistry.shift();
    }

    setIssues([...issuesRegistry]);

    // تسجيل المشكلة (مرة واحدة فقط)
    if (issue.severity === 'critical') {
      productionLogger.error(`🔴 ${issue.message}`, issue.details);
    } else if (issue.severity === 'warning') {
      productionLogger.warn(`⚠️ ${issue.message}`, issue.details);
    }
  }, []);

  // مراقبة Web Vitals - مؤجلة لتحسين LCP
  useEffect(() => {
    if (!enabled || typeof PerformanceObserver === 'undefined') return;

    const observers: PerformanceObserver[] = [];
    
    // تأجيل بدء المراقبة لتجنب التأثير على التحميل الأولي (3 ثوان)
    const startDelay = setTimeout(() => {
      // مراقبة LCP
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1] as PerformanceEntry & { startTime: number };
          const lcp = lastEntry.startTime;

          setMetrics(prev => ({ ...prev, lcp }));

          if (lcp > PERFORMANCE_THRESHOLDS.LCP_POOR) {
            addIssue({
              type: 'slow_render',
              message: `LCP بطيء جداً: ${(lcp / 1000).toFixed(2)}s`,
              severity: 'critical',
              details: { lcp, threshold: PERFORMANCE_THRESHOLDS.LCP_POOR },
            });
          } else if (lcp > PERFORMANCE_THRESHOLDS.LCP_GOOD) {
            addIssue({
              type: 'slow_render',
              message: `LCP يحتاج تحسين: ${(lcp / 1000).toFixed(2)}s`,
              severity: 'warning',
              details: { lcp, threshold: PERFORMANCE_THRESHOLDS.LCP_GOOD },
            });
          }
        });
        lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
        observers.push(lcpObserver);
      } catch {
        // غير مدعوم
      }

      // مراقبة FID
      try {
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            const fid = (entry as PerformanceEntry & { processingStart: number }).processingStart - entry.startTime;
            setMetrics(prev => ({ ...prev, fid }));

            if (fid > PERFORMANCE_THRESHOLDS.FID_POOR) {
              addIssue({
                type: 'slow_render',
                message: `تأخر استجابة المستخدم: ${fid.toFixed(0)}ms`,
                severity: 'critical',
                details: { fid },
              });
            }
          });
        });
        fidObserver.observe({ type: 'first-input', buffered: true });
        observers.push(fidObserver);
      } catch {
        // غير مدعوم
      }

      // مراقبة CLS
      try {
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            if (!(entry as PerformanceEntry & { hadRecentInput: boolean }).hadRecentInput) {
              clsValue += (entry as PerformanceEntry & { value: number }).value;
              setMetrics(prev => ({ ...prev, cls: clsValue }));

              if (clsValue > PERFORMANCE_THRESHOLDS.CLS_POOR) {
                addIssue({
                  type: 'layout_shift',
                  message: `تحريك تخطيط مفرط: ${clsValue.toFixed(3)}`,
                  severity: 'warning',
                  details: { cls: clsValue },
                });
              }
            }
          });
        });
        clsObserver.observe({ type: 'layout-shift', buffered: true });
        observers.push(clsObserver);
      } catch {
        // غير مدعوم
      }

      // مراقبة Long Tasks - برفع الحد الأدنى لتقليل الضوضاء
      try {
        const longTaskObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            longTaskCount.current++;
            setMetrics(prev => ({ ...prev, longTasks: longTaskCount.current }));

            // فقط المهام الطويلة جداً (أكثر من 150ms)
            if (entry.duration > 150) {
              addIssue({
                type: 'long_task',
                message: `مهمة طويلة: ${entry.duration.toFixed(0)}ms`,
                severity: entry.duration > 300 ? 'critical' : 'warning',
                details: { duration: entry.duration, name: entry.name },
              });
            }
          });
        });
        longTaskObserver.observe({ type: 'longtask', buffered: true });
        observers.push(longTaskObserver);
      } catch {
        // غير مدعوم
      }

      // مراقبة FCP
      try {
        const fcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const fcpEntry = entries.find(e => e.name === 'first-contentful-paint');
          if (fcpEntry) {
            const fcp = fcpEntry.startTime;
            setMetrics(prev => ({ ...prev, fcp }));

            if (fcp > PERFORMANCE_THRESHOLDS.FCP_POOR) {
              addIssue({
                type: 'slow_render',
                message: `FCP بطيء: ${(fcp / 1000).toFixed(2)}s`,
                severity: 'warning',
                details: { fcp },
              });
            }
          }
        });
        fcpObserver.observe({ type: 'paint', buffered: true });
        observers.push(fcpObserver);
      } catch {
        // غير مدعوم
      }
    }, 3000); // تأخير 3 ثوان

    return () => {
      clearTimeout(startDelay);
      observers.forEach(observer => observer.disconnect());
    };
  }, [enabled, addIssue]);

  // الحصول على تقرير الأداء
  const getReport = useCallback(() => {
    const score = calculatePerformanceScore(metrics);
    return {
      metrics,
      issues: [...issuesRegistry],
      score,
      status: score >= 90 ? 'ممتاز' : score >= 70 ? 'جيد' : score >= 50 ? 'يحتاج تحسين' : 'ضعيف',
    };
  }, [metrics]);

  // تنظيف السجلات
  const clearIssues = useCallback(() => {
    issuesRegistry.length = 0;
    setIssues([]);
  }, []);

  return { metrics, issues, getReport, clearIssues };
}

// حساب نقاط الأداء
function calculatePerformanceScore(metrics: PerformanceMetrics): number {
  let score = 100;
  
  if (metrics.lcp) {
    if (metrics.lcp > PERFORMANCE_THRESHOLDS.LCP_POOR) score -= 30;
    else if (metrics.lcp > PERFORMANCE_THRESHOLDS.LCP_GOOD) score -= 15;
  }

  if (metrics.fcp) {
    if (metrics.fcp > PERFORMANCE_THRESHOLDS.FCP_POOR) score -= 20;
    else if (metrics.fcp > PERFORMANCE_THRESHOLDS.FCP_GOOD) score -= 10;
  }

  if (metrics.cls) {
    if (metrics.cls > PERFORMANCE_THRESHOLDS.CLS_POOR) score -= 20;
    else if (metrics.cls > PERFORMANCE_THRESHOLDS.CLS_GOOD) score -= 10;
  }

  if (metrics.fid) {
    if (metrics.fid > PERFORMANCE_THRESHOLDS.FID_POOR) score -= 15;
    else if (metrics.fid > PERFORMANCE_THRESHOLDS.FID_GOOD) score -= 5;
  }

  if (metrics.longTasks > 10) score -= 15;
  else if (metrics.longTasks > 5) score -= 5;

  return Math.max(0, score);
}

// الحصول على جميع المشاكل
export function getAllPerformanceIssues(): PerformanceIssue[] {
  return [...issuesRegistry];
}
