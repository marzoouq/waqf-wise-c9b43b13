/**
 * Hook for PerformanceDashboard data fetching
 * يجلب مقاييس الأداء الحقيقية من المتصفح وقاعدة البيانات
 * 
 * ✅ محسّن للقياس الدقيق باستخدام Performance APIs الحديثة
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { QUERY_KEYS } from "@/lib/query-keys";
import { useEffect, useState, useCallback, useRef } from "react";

export interface LatestMetrics {
  pageLoad: number;
  apiResponse: number;
  dbQuery: number;
  memoryUsage: number;
  // مقاييس إضافية للتشخيص
  domContentLoaded: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
}

export interface SlowQueryLog {
  id: string;
  query_text: string;
  execution_time_ms: number;
  created_at: string;
}

/**
 * جلب مقاييس الأداء الحقيقية من المتصفح
 * باستخدام Navigation Timing API + Paint Timing API
 */
function getBrowserPerformanceMetrics(): LatestMetrics {
  const metrics: LatestMetrics = {
    pageLoad: 0,
    apiResponse: 0,
    dbQuery: 0,
    memoryUsage: 0,
    domContentLoaded: 0,
    firstContentfulPaint: 0,
    largestContentfulPaint: 0,
  };

  if (typeof window === 'undefined' || !window.performance) {
    return metrics;
  }

  try {
    // Navigation Timing - أكثر دقة
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigation) {
      // DOM Content Loaded (أول تفاعل ممكن)
      metrics.domContentLoaded = Math.max(0, (navigation.domContentLoadedEventEnd - navigation.startTime) / 1000);
      
      // Page Load الحقيقي (كل شيء اكتمل)
      // إذا لم يكتمل بعد، نستخدم الوقت الحالي
      if (navigation.loadEventEnd > 0) {
        metrics.pageLoad = (navigation.loadEventEnd - navigation.startTime) / 1000;
      } else {
        // الصفحة لا تزال تُحمّل - نحسب من بداية التنقل
        metrics.pageLoad = (performance.now() - navigation.startTime) / 1000;
      }
    }

    // First Contentful Paint (FCP)
    const paintEntries = performance.getEntriesByType('paint');
    const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint');
    if (fcp) {
      metrics.firstContentfulPaint = fcp.startTime / 1000;
    }

    // Largest Contentful Paint (LCP) - باستخدام PerformanceObserver إذا كان متاحاً
    const lcpEntries = performance.getEntriesByType('largest-contentful-paint');
    if (lcpEntries.length > 0) {
      const lastLcp = lcpEntries[lcpEntries.length - 1];
      metrics.largestContentfulPaint = lastLcp.startTime / 1000;
    }

    // API Response Time - متوسط آخر 10 طلبات فقط
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    const recentApiCalls = resources
      .filter(r => 
        (r.initiatorType === 'fetch' || r.initiatorType === 'xmlhttprequest') &&
        r.name.includes('supabase')
      )
      .slice(-10); // آخر 10 طلبات فقط
    
    if (recentApiCalls.length > 0) {
      const avgApiTime = recentApiCalls.reduce((sum, r) => sum + r.duration, 0) / recentApiCalls.length;
      metrics.apiResponse = avgApiTime / 1000;
    }

    // Memory Usage (Chrome only)
    const perfWithMemory = performance as Performance & { 
      memory?: { usedJSHeapSize: number; jsHeapSizeLimit: number } 
    };
    if (perfWithMemory.memory) {
      metrics.memoryUsage = (perfWithMemory.memory.usedJSHeapSize / perfWithMemory.memory.jsHeapSizeLimit) * 100;
    }
  } catch (error) {
    console.warn('[Performance] Error getting metrics:', error);
  }

  return metrics;
}

export function usePerformanceMetrics() {
  const [browserMetrics, setBrowserMetrics] = useState<LatestMetrics>({
    pageLoad: 0,
    apiResponse: 0,
    dbQuery: 0,
    memoryUsage: 0,
    domContentLoaded: 0,
    firstContentfulPaint: 0,
    largestContentfulPaint: 0,
  });
  
  const metricsRef = useRef<LatestMetrics>(browserMetrics);
  const dbQueryTimeRef = useRef<number>(0);

  // تحديث المقاييس بشكل ذكي
  const updateMetrics = useCallback(() => {
    const newMetrics = getBrowserPerformanceMetrics();
    
    // فقط تحديث إذا كانت القيم أكبر (لأن بعض المقاييس تكتمل لاحقاً)
    const updatedMetrics: LatestMetrics = {
      pageLoad: Math.max(metricsRef.current.pageLoad, newMetrics.pageLoad),
      apiResponse: newMetrics.apiResponse || metricsRef.current.apiResponse,
      dbQuery: dbQueryTimeRef.current || metricsRef.current.dbQuery,
      memoryUsage: newMetrics.memoryUsage || metricsRef.current.memoryUsage,
      domContentLoaded: Math.max(metricsRef.current.domContentLoaded, newMetrics.domContentLoaded),
      firstContentfulPaint: Math.max(metricsRef.current.firstContentfulPaint, newMetrics.firstContentfulPaint),
      largestContentfulPaint: Math.max(metricsRef.current.largestContentfulPaint, newMetrics.largestContentfulPaint),
    };
    
    metricsRef.current = updatedMetrics;
    setBrowserMetrics(updatedMetrics);
  }, []);

  // جلب بيانات الأداء من المتصفح
  useEffect(() => {
    // القياس الأول بعد تحميل الصفحة
    const initialMeasure = () => {
      setTimeout(updateMetrics, 100);
      setTimeout(updateMetrics, 500);
      setTimeout(updateMetrics, 1000);
      setTimeout(updateMetrics, 2000);
    };

    if (document.readyState === 'complete') {
      initialMeasure();
    } else {
      window.addEventListener('load', initialMeasure);
    }

    // تحديث دوري كل 5 ثوانٍ
    const interval = setInterval(updateMetrics, 5000);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('load', initialMeasure);
    };
  }, [updateMetrics]);

  // جلب بيانات من قاعدة البيانات (الاستعلامات البطيئة + وقت DB)
  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.PERFORMANCE_METRICS_DATA,
    queryFn: async () => {
      // قياس وقت استعلام قاعدة البيانات
      const startTime = performance.now();
      
      const { data: slowQueries, error } = await supabase
        .from("slow_query_log")
        .select("id, query_text, execution_time_ms, created_at")
        .order("execution_time_ms", { ascending: false })
        .limit(20);

      const dbQueryTime = (performance.now() - startTime) / 1000;
      dbQueryTimeRef.current = dbQueryTime;

      if (error) {
        console.warn('[Performance] Slow query fetch error:', error);
      }

      return {
        slowQueries: slowQueries || [],
        dbQueryTime,
      };
    },
    refetchInterval: 30000,
    staleTime: 15000,
  });

  const slowQueries = (data?.slowQueries || []) as SlowQueryLog[];

  // دمج الـ metrics
  const latestMetrics: LatestMetrics = {
    ...browserMetrics,
    dbQuery: data?.dbQueryTime || browserMetrics.dbQuery,
  };

  return {
    slowQueries,
    latestMetrics,
    isLoading,
    error,
    // مقاييس إضافية للتشخيص
    diagnostics: {
      domContentLoaded: browserMetrics.domContentLoaded,
      firstContentfulPaint: browserMetrics.firstContentfulPaint,
      largestContentfulPaint: browserMetrics.largestContentfulPaint,
    },
  };
}
