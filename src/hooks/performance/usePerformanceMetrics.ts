/**
 * Hook for PerformanceDashboard data fetching
 * يجلب مقاييس الأداء الحقيقية من المتصفح وقاعدة البيانات
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { QUERY_KEYS } from "@/lib/query-keys";
import { useEffect, useState } from "react";

export interface LatestMetrics {
  pageLoad: number;
  apiResponse: number;
  dbQuery: number;
  memoryUsage: number;
}

export interface SlowQueryLog {
  id: string;
  query_text: string;
  execution_time_ms: number;
  created_at: string;
}

/**
 * جلب مقاييس الأداء الحقيقية من المتصفح
 */
function getBrowserPerformanceMetrics(): LatestMetrics {
  const metrics: LatestMetrics = {
    pageLoad: 0,
    apiResponse: 0,
    dbQuery: 0,
    memoryUsage: 0,
  };

  // Page Load Time من Navigation Timing API
  if (typeof window !== 'undefined' && window.performance) {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigation) {
      metrics.pageLoad = (navigation.loadEventEnd - navigation.startTime) / 1000;
    }

    // API Response Time من Resource Timing
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    const apiCalls = resources.filter(r => 
      r.initiatorType === 'fetch' || r.initiatorType === 'xmlhttprequest'
    );
    if (apiCalls.length > 0) {
      const avgApiTime = apiCalls.reduce((sum, r) => sum + r.duration, 0) / apiCalls.length;
      metrics.apiResponse = avgApiTime / 1000;
    }

    // Memory Usage (Chrome only)
    const perfWithMemory = performance as Performance & { memory?: { usedJSHeapSize: number; jsHeapSizeLimit: number } };
    if (perfWithMemory.memory) {
      metrics.memoryUsage = (perfWithMemory.memory.usedJSHeapSize / perfWithMemory.memory.jsHeapSizeLimit) * 100;
    }
  }

  return metrics;
}

export function usePerformanceMetrics() {
  const [browserMetrics, setBrowserMetrics] = useState<LatestMetrics>({
    pageLoad: 0,
    apiResponse: 0,
    dbQuery: 0,
    memoryUsage: 0,
  });

  // جلب بيانات الأداء من المتصفح
  useEffect(() => {
    // انتظر تحميل الصفحة بالكامل
    const updateMetrics = () => {
      setBrowserMetrics(getBrowserPerformanceMetrics());
    };

    if (document.readyState === 'complete') {
      setTimeout(updateMetrics, 100);
    } else {
      window.addEventListener('load', () => setTimeout(updateMetrics, 100));
    }

    // تحديث دوري
    const interval = setInterval(updateMetrics, 5000);
    return () => clearInterval(interval);
  }, []);

  // جلب بيانات من قاعدة البيانات (الاستعلامات البطيئة + وقت DB)
  const { data, isLoading } = useQuery({
    queryKey: QUERY_KEYS.PERFORMANCE_METRICS_DATA,
    queryFn: async () => {
      // قياس وقت استعلام قاعدة البيانات
      const startTime = performance.now();
      
      const { data: slowQueries, error } = await supabase
        .from("slow_query_log")
        .select("*")
        .order("execution_time_ms", { ascending: false })
        .limit(20);

      const dbQueryTime = (performance.now() - startTime) / 1000;

      return {
        slowQueries: slowQueries || [],
        dbQueryTime,
      };
    },
    refetchInterval: 30000,
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
  };
}
