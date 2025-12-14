/**
 * أداة تحليل الأداء المتقدمة
 * تكشف المشاكل المخفية وتقدم توصيات تحسين محددة
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { productionLogger } from '@/lib/logger/production-logger';

export interface PerformanceIssue {
  id: string;
  category: 'lcp' | 'cls' | 'fid' | 'ttfb' | 'bundle' | 'network' | 'render' | 'memory' | 'script' | 'resource';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  impact: string;
  recommendation: string;
  affectedResource?: string;
  currentValue?: number;
  targetValue?: number;
  unit?: string;
}

export interface ResourceTiming {
  name: string;
  type: string;
  duration: number;
  transferSize: number;
  decodedBodySize: number;
  startTime: number;
  responseEnd: number;
}

export interface PerformanceReport {
  score: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  issues: PerformanceIssue[];
  metrics: {
    lcp: number | null;
    fcp: number | null;
    cls: number | null;
    fid: number | null;
    ttfb: number | null;
    tbt: number | null;
    domSize: number;
    jsHeapSize: number | null;
    resourceCount: number;
    totalTransferSize: number;
    longTasksCount: number;
  };
  slowResources: ResourceTiming[];
  largeResources: ResourceTiming[];
  recommendations: string[];
  timestamp: Date;
}

// حدود الأداء المثالية
const THRESHOLDS = {
  LCP: { good: 2500, poor: 4000 },
  FCP: { good: 1800, poor: 3000 },
  CLS: { good: 0.1, poor: 0.25 },
  FID: { good: 100, poor: 300 },
  TTFB: { good: 800, poor: 1800 },
  TBT: { good: 200, poor: 600 },
  DOM_SIZE: { good: 1500, poor: 3000 },
  JS_HEAP: { good: 50 * 1024 * 1024, poor: 100 * 1024 * 1024 },
  RESOURCE_SIZE: { good: 100 * 1024, poor: 500 * 1024 },
  RESOURCE_DURATION: { good: 500, poor: 2000 },
  LONG_TASK: 50,
};

export function useAdvancedPerformanceAnalyzer(enabled: boolean = true) {
  const [report, setReport] = useState<PerformanceReport | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const observersRef = useRef<PerformanceObserver[]>([]);
  const metricsRef = useRef({
    lcp: null as number | null,
    fcp: null as number | null,
    cls: 0,
    fid: null as number | null,
    ttfb: null as number | null,
    longTasks: [] as number[],
  });

  // جمع مقاييس Web Vitals
  useEffect(() => {
    if (!enabled) return;

    const observers: PerformanceObserver[] = [];

    // LCP Observer
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as LargestContentfulPaint;
        if (lastEntry) {
          metricsRef.current.lcp = lastEntry.startTime;
        }
      });
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
      observers.push(lcpObserver);
    } catch {
      // PerformanceObserver for LCP may not be supported in all browsers - safe to ignore
    }

    // FCP Observer
    try {
      const fcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const fcpEntry = entries.find(e => e.name === 'first-contentful-paint');
        if (fcpEntry) {
          metricsRef.current.fcp = fcpEntry.startTime;
        }
      });
      fcpObserver.observe({ type: 'paint', buffered: true });
      observers.push(fcpObserver);
    } catch {
      // PerformanceObserver for paint may not be supported in all browsers - safe to ignore
    }

    // CLS Observer
    try {
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const layoutShift = entry as PerformanceEntry & { hadRecentInput?: boolean; value?: number };
          if (!layoutShift.hadRecentInput) {
            metricsRef.current.cls += layoutShift.value || 0;
          }
        }
      });
      clsObserver.observe({ type: 'layout-shift', buffered: true });
      observers.push(clsObserver);
    } catch {
      // PerformanceObserver for layout-shift may not be supported in all browsers - safe to ignore
    }

    // FID Observer
    try {
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        if (entries.length > 0) {
          metricsRef.current.fid = (entries[0] as PerformanceEventTiming).processingStart - entries[0].startTime;
        }
      });
      fidObserver.observe({ type: 'first-input', buffered: true });
      observers.push(fidObserver);
    } catch {
      // PerformanceObserver for first-input may not be supported in all browsers - safe to ignore
    }

    // Long Tasks Observer
    try {
      const longTaskObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > THRESHOLDS.LONG_TASK) {
            metricsRef.current.longTasks.push(entry.duration);
          }
        }
      });
      longTaskObserver.observe({ type: 'longtask', buffered: true });
      observers.push(longTaskObserver);
    } catch {
      // PerformanceObserver for longtask may not be supported in all browsers - safe to ignore
    }

    observersRef.current = observers;

    return () => {
      observers.forEach(obs => obs.disconnect());
    };
  }, [enabled]);

  // تحليل الموارد
  const analyzeResources = useCallback((): { slow: ResourceTiming[], large: ResourceTiming[], total: number, count: number } => {
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    
    const resourceTimings: ResourceTiming[] = resources.map(r => ({
      name: r.name,
      type: r.initiatorType,
      duration: r.duration,
      transferSize: r.transferSize,
      decodedBodySize: r.decodedBodySize,
      startTime: r.startTime,
      responseEnd: r.responseEnd,
    }));

    const slow = resourceTimings
      .filter(r => r.duration > THRESHOLDS.RESOURCE_DURATION.poor)
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 10);

    const large = resourceTimings
      .filter(r => r.transferSize > THRESHOLDS.RESOURCE_SIZE.poor)
      .sort((a, b) => b.transferSize - a.transferSize)
      .slice(0, 10);

    const total = resourceTimings.reduce((sum, r) => sum + r.transferSize, 0);

    return { slow, large, total, count: resourceTimings.length };
  }, []);

  // تحليل TTFB
  const analyzeTTFB = useCallback((): number | null => {
    const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (nav) {
      return nav.responseStart - nav.requestStart;
    }
    return null;
  }, []);

  // حساب TBT (Total Blocking Time)
  const calculateTBT = useCallback((): number => {
    return metricsRef.current.longTasks.reduce((sum, duration) => {
      return sum + Math.max(0, duration - THRESHOLDS.LONG_TASK);
    }, 0);
  }, []);

  // تحديد المشاكل
  const identifyIssues = useCallback((metrics: PerformanceReport['metrics'], resources: { slow: ResourceTiming[], large: ResourceTiming[] }): PerformanceIssue[] => {
    const issues: PerformanceIssue[] = [];

    // LCP Issues
    if (metrics.lcp !== null) {
      if (metrics.lcp > THRESHOLDS.LCP.poor) {
        issues.push({
          id: 'lcp-critical',
          category: 'lcp',
          severity: 'critical',
          title: 'وقت عرض أكبر محتوى (LCP) بطيء جداً',
          description: `LCP الحالي ${(metrics.lcp / 1000).toFixed(2)}s يتجاوز الحد المقبول`,
          impact: 'تجربة مستخدم سيئة، معدل ارتداد مرتفع، تأثير سلبي على SEO',
          recommendation: 'تحسين تحميل الصور الكبيرة، استخدام lazy loading، تقليل CSS/JS المعيقة',
          currentValue: metrics.lcp,
          targetValue: THRESHOLDS.LCP.good,
          unit: 'ms',
        });
      } else if (metrics.lcp > THRESHOLDS.LCP.good) {
        issues.push({
          id: 'lcp-warning',
          category: 'lcp',
          severity: 'high',
          title: 'وقت عرض أكبر محتوى (LCP) يحتاج تحسين',
          description: `LCP الحالي ${(metrics.lcp / 1000).toFixed(2)}s أعلى من المثالي`,
          impact: 'تأثير متوسط على تجربة المستخدم',
          recommendation: 'تحسين تحميل الموارد الرئيسية',
          currentValue: metrics.lcp,
          targetValue: THRESHOLDS.LCP.good,
          unit: 'ms',
        });
      }
    }

    // CLS Issues
    if (metrics.cls > THRESHOLDS.CLS.poor) {
      issues.push({
        id: 'cls-critical',
        category: 'cls',
        severity: 'critical',
        title: 'تحولات التخطيط (CLS) مرتفعة جداً',
        description: `CLS الحالي ${metrics.cls.toFixed(3)} يتجاوز الحد المقبول`,
        impact: 'تجربة مستخدم مزعجة، نقرات خاطئة',
        recommendation: 'تحديد أبعاد الصور والإعلانات، تجنب إدراج محتوى ديناميكي فوق المحتوى الموجود',
        currentValue: metrics.cls,
        targetValue: THRESHOLDS.CLS.good,
      });
    } else if (metrics.cls > THRESHOLDS.CLS.good) {
      issues.push({
        id: 'cls-warning',
        category: 'cls',
        severity: 'medium',
        title: 'تحولات التخطيط (CLS) تحتاج تحسين',
        description: `CLS الحالي ${metrics.cls.toFixed(3)} أعلى من المثالي`,
        impact: 'تأثير طفيف على تجربة المستخدم',
        recommendation: 'مراجعة العناصر الديناميكية',
        currentValue: metrics.cls,
        targetValue: THRESHOLDS.CLS.good,
      });
    }

    // Long Tasks Issues
    if (metrics.longTasksCount > 10) {
      issues.push({
        id: 'longtasks-critical',
        category: 'script',
        severity: 'critical',
        title: 'عدد المهام الطويلة مرتفع جداً',
        description: `${metrics.longTasksCount} مهمة تتجاوز 50ms`,
        impact: 'واجهة غير مستجيبة، تجربة مستخدم سيئة',
        recommendation: 'تقسيم الكود إلى chunks، استخدام Web Workers، تأجيل العمليات غير الضرورية',
        currentValue: metrics.longTasksCount,
        targetValue: 5,
      });
    } else if (metrics.longTasksCount > 5) {
      issues.push({
        id: 'longtasks-warning',
        category: 'script',
        severity: 'high',
        title: 'عدد المهام الطويلة مرتفع',
        description: `${metrics.longTasksCount} مهمة تتجاوز 50ms`,
        impact: 'تأخير في استجابة الواجهة',
        recommendation: 'تحسين الكود وتقليل العمليات المكثفة',
        currentValue: metrics.longTasksCount,
        targetValue: 5,
      });
    }

    // TTFB Issues
    if (metrics.ttfb !== null && metrics.ttfb > THRESHOLDS.TTFB.poor) {
      issues.push({
        id: 'ttfb-critical',
        category: 'ttfb',
        severity: 'high',
        title: 'وقت أول بايت (TTFB) بطيء',
        description: `TTFB الحالي ${metrics.ttfb.toFixed(0)}ms يتجاوز الحد المقبول`,
        impact: 'تأخير في بدء تحميل الصفحة',
        recommendation: 'تحسين أداء الخادم، استخدام CDN، تفعيل التخزين المؤقت',
        currentValue: metrics.ttfb,
        targetValue: THRESHOLDS.TTFB.good,
        unit: 'ms',
      });
    }

    // DOM Size Issues
    if (metrics.domSize > THRESHOLDS.DOM_SIZE.poor) {
      issues.push({
        id: 'dom-critical',
        category: 'render',
        severity: 'high',
        title: 'حجم DOM كبير جداً',
        description: `${metrics.domSize} عنصر في DOM`,
        impact: 'بطء في الرسم والتفاعل',
        recommendation: 'تقليل عدد العناصر، استخدام virtualization للقوائم الطويلة',
        currentValue: metrics.domSize,
        targetValue: THRESHOLDS.DOM_SIZE.good,
      });
    }

    // Memory Issues
    if (metrics.jsHeapSize !== null && metrics.jsHeapSize > THRESHOLDS.JS_HEAP.poor) {
      issues.push({
        id: 'memory-critical',
        category: 'memory',
        severity: 'high',
        title: 'استخدام ذاكرة مرتفع',
        description: `${(metrics.jsHeapSize / 1024 / 1024).toFixed(1)}MB مستخدمة`,
        impact: 'بطء في الأداء، احتمال تعطل التطبيق',
        recommendation: 'فحص تسربات الذاكرة، تقليل البيانات المخزنة في الذاكرة',
        currentValue: metrics.jsHeapSize,
        targetValue: THRESHOLDS.JS_HEAP.good,
        unit: 'bytes',
      });
    }

    // Slow Resources
    resources.slow.forEach((resource, index) => {
      if (index < 5) {
        issues.push({
          id: `slow-resource-${index}`,
          category: 'network',
          severity: resource.duration > 5000 ? 'high' : 'medium',
          title: 'مورد بطيء التحميل',
          description: `${resource.duration.toFixed(0)}ms للتحميل`,
          impact: 'تأخير في عرض المحتوى',
          recommendation: 'تحسين الخادم أو استخدام CDN',
          affectedResource: resource.name.split('/').pop() || resource.name,
          currentValue: resource.duration,
          targetValue: THRESHOLDS.RESOURCE_DURATION.good,
          unit: 'ms',
        });
      }
    });

    // Large Resources
    resources.large.forEach((resource, index) => {
      if (index < 5) {
        issues.push({
          id: `large-resource-${index}`,
          category: 'bundle',
          severity: resource.transferSize > 1024 * 1024 ? 'high' : 'medium',
          title: 'مورد كبير الحجم',
          description: `${(resource.transferSize / 1024).toFixed(1)}KB`,
          impact: 'زيادة وقت التحميل واستهلاك البيانات',
          recommendation: 'ضغط الملف أو تقسيمه',
          affectedResource: resource.name.split('/').pop() || resource.name,
          currentValue: resource.transferSize,
          targetValue: THRESHOLDS.RESOURCE_SIZE.good,
          unit: 'bytes',
        });
      }
    });

    return issues.sort((a, b) => {
      const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });
  }, []);

  // حساب النتيجة
  const calculateScore = useCallback((issues: PerformanceIssue[]): number => {
    let score = 100;
    
    issues.forEach(issue => {
      switch (issue.severity) {
        case 'critical': score -= 20; break;
        case 'high': score -= 10; break;
        case 'medium': score -= 5; break;
        case 'low': score -= 2; break;
      }
    });

    return Math.max(0, Math.min(100, score));
  }, []);

  // تحديد الدرجة
  const getGrade = (score: number): 'A' | 'B' | 'C' | 'D' | 'F' => {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  };

  // إنشاء التوصيات
  const generateRecommendations = useCallback((issues: PerformanceIssue[]): string[] => {
    const recommendations: string[] = [];
    const categories = new Set(issues.map(i => i.category));

    if (categories.has('lcp')) {
      recommendations.push('🖼️ تحسين LCP: استخدم preload للصور الرئيسية، قلل CSS/JS المعيقة');
    }
    if (categories.has('cls')) {
      recommendations.push('📐 تحسين CLS: حدد أبعاد الصور والإطارات، تجنب إدراج محتوى ديناميكي');
    }
    if (categories.has('script')) {
      recommendations.push('⚡ تحسين JavaScript: قسّم الكود، استخدم dynamic imports، أجّل السكربتات غير الضرورية');
    }
    if (categories.has('network')) {
      recommendations.push('🌐 تحسين الشبكة: استخدم CDN، فعّل HTTP/2، قلل طلبات HTTP');
    }
    if (categories.has('bundle')) {
      recommendations.push('📦 تحسين الحجم: فعّل الضغط (gzip/brotli)، أزل الكود غير المستخدم');
    }
    if (categories.has('memory')) {
      recommendations.push('🧠 تحسين الذاكرة: أزل event listeners غير المستخدمة، استخدم WeakMap/WeakSet');
    }
    if (categories.has('render')) {
      recommendations.push('🎨 تحسين الرسم: قلل عمق DOM، استخدم virtualization، تجنب forced reflows');
    }

    return recommendations;
  }, []);

  // تشغيل التحليل الكامل
  const runAnalysis = useCallback(async () => {
    if (!enabled) return;
    setIsAnalyzing(true);

    try {
      // انتظار قليل لجمع البيانات
      await new Promise(resolve => setTimeout(resolve, 500));

      const resourceAnalysis = analyzeResources();
      const ttfb = analyzeTTFB();
      const tbt = calculateTBT();
      const domSize = document.querySelectorAll('*').length;

      let jsHeapSize: number | null = null;
      if ('memory' in performance) {
        const perfWithMemory = performance as Performance & { memory?: { usedJSHeapSize: number } };
        jsHeapSize = perfWithMemory.memory?.usedJSHeapSize ?? null;
      }

      const metrics: PerformanceReport['metrics'] = {
        lcp: metricsRef.current.lcp,
        fcp: metricsRef.current.fcp,
        cls: metricsRef.current.cls,
        fid: metricsRef.current.fid,
        ttfb,
        tbt,
        domSize,
        jsHeapSize,
        resourceCount: resourceAnalysis.count,
        totalTransferSize: resourceAnalysis.total,
        longTasksCount: metricsRef.current.longTasks.length,
      };

      const issues = identifyIssues(metrics, resourceAnalysis);
      const score = calculateScore(issues);
      const grade = getGrade(score);
      const recommendations = generateRecommendations(issues);

      setReport({
        score,
        grade,
        issues,
        metrics,
        slowResources: resourceAnalysis.slow,
        largeResources: resourceAnalysis.large,
        recommendations,
        timestamp: new Date(),
      });

    } catch (error) {
      productionLogger.error('فشل تحليل الأداء', { error });
    } finally {
      setIsAnalyzing(false);
    }
  }, [enabled, analyzeResources, analyzeTTFB, calculateTBT, identifyIssues, calculateScore, generateRecommendations]);

  // تشغيل التحليل عند التحميل
  useEffect(() => {
    if (!enabled) return;

    const timeout = setTimeout(runAnalysis, 2000);
    return () => clearTimeout(timeout);
  }, [enabled, runAnalysis]);

  return {
    report,
    isAnalyzing,
    runAnalysis,
  };
}
