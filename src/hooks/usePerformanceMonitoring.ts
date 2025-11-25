/**
 * Performance Monitoring Hook
 * 🔧 Phase 2: تحسين جودة الكود - Performance Monitoring
 */

import { useEffect, useRef } from 'react';
import { productionLogger } from '@/lib/logger/production-logger';

interface PerformanceMonitoringOptions {
  componentName: string;
  slowRenderThreshold?: number; // milliseconds
  memoryCheckInterval?: number; // milliseconds
  enableMemoryMonitoring?: boolean;
}

export function usePerformanceMonitoring({
  componentName,
  slowRenderThreshold = 1000,
  memoryCheckInterval = 30000,
  enableMemoryMonitoring = true,
}: PerformanceMonitoringOptions) {
  const mountTime = useRef(performance.now());
  const renderCount = useRef(0);

  useEffect(() => {
    renderCount.current++;
    const renderTime = performance.now() - mountTime.current;

    // تحذير للـ renders البطيئة
    if (renderTime > slowRenderThreshold) {
      productionLogger.warn('Slow component render detected', {
        component: componentName,
        renderTime: `${renderTime.toFixed(2)}ms`,
        renderCount: renderCount.current,
        context: 'performance_monitoring',
      });
    }

    // مراقبة الذاكرة
    if (enableMemoryMonitoring && 'memory' in performance) {
      const memoryInterval = setInterval(() => {
        const memory = (performance as any).memory;
        const usedMemoryMB = memory.usedJSHeapSize / 1048576; // Convert to MB
        const totalMemoryMB = memory.totalJSHeapSize / 1048576;
        const memoryUsagePercent = (usedMemoryMB / totalMemoryMB) * 100;

        // تحذير عند تجاوز 80% من الذاكرة
        if (memoryUsagePercent > 80) {
          productionLogger.warn('High memory usage detected', {
            component: componentName,
            usedMemoryMB: usedMemoryMB.toFixed(2),
            totalMemoryMB: totalMemoryMB.toFixed(2),
            usagePercent: memoryUsagePercent.toFixed(2),
            context: 'memory_monitoring',
          });
        }
      }, memoryCheckInterval);

      return () => clearInterval(memoryInterval);
    }
  }, [componentName, slowRenderThreshold, memoryCheckInterval, enableMemoryMonitoring]);

  return {
    renderCount: renderCount.current,
    mountTime: mountTime.current,
  };
}

/**
 * Database Query Performance Monitor
 * يتابع أداء استعلامات قاعدة البيانات
 */
export function logSlowQuery(queryKey: string | unknown[], duration: number, threshold = 2000) {
  if (duration > threshold) {
    productionLogger.warn('Slow database query detected', {
      queryKey: JSON.stringify(queryKey),
      duration: `${duration}ms`,
      threshold: `${threshold}ms`,
      context: 'database_performance',
    });
  }
}

/**
 * Network Request Performance Monitor
 */
export function logSlowRequest(url: string, duration: number, threshold = 3000) {
  if (duration > threshold) {
    productionLogger.warn('Slow network request detected', {
      url,
      duration: `${duration}ms`,
      threshold: `${threshold}ms`,
      context: 'network_performance',
    });
  }
}