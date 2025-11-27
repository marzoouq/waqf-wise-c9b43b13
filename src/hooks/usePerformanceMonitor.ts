/**
 * Performance Monitoring Hook
 * مراقبة الأداء للمكونات والعمليات
 */

import { useEffect, useRef } from 'react';
import { hasMemoryAPI } from '@/types/performance';
import { productionLogger } from '@/lib/logger/production-logger';

interface PerformanceMetrics {
  renderTime: number;
  mountTime: number;
  updateTime: number;
}

/**
 * Hook لمراقبة أداء المكون
 */
export function usePerformanceMonitor(componentName: string) {
  const mountTimeRef = useRef<number>(0);
  const renderCountRef = useRef<number>(0);
  const lastRenderRef = useRef<number>(0);

  useEffect(() => {
    mountTimeRef.current = performance.now();
    
    return () => {
      const mountDuration = performance.now() - mountTimeRef.current;
      
      if (import.meta.env.DEV && mountDuration > 16) { // > 1 frame (16ms)
        productionLogger.warn(`⚠️ Slow component: ${componentName} took ${mountDuration.toFixed(2)}ms to mount`);
      }
    };
  }, [componentName]);

  // تتبع عدد الـ renders
  useEffect(() => {
    renderCountRef.current++;
    const now = performance.now();
    
    if (lastRenderRef.current > 0) {
      const renderTime = now - lastRenderRef.current;
      
      if (import.meta.env.DEV && renderTime > 16) {
        productionLogger.warn(`⚠️ Slow render: ${componentName} took ${renderTime.toFixed(2)}ms (render #${renderCountRef.current})`);
      }
    }
    
    lastRenderRef.current = now;
  });

  return {
    renderCount: renderCountRef.current,
    logMetrics: () => {
      if (import.meta.env.DEV) {
        productionLogger.debug(`📊 ${componentName} metrics:`, {
          renders: renderCountRef.current,
          avgRenderTime: '~' + ((performance.now() - mountTimeRef.current) / renderCountRef.current).toFixed(2) + 'ms'
        });
      }
    }
  };
}

/**
 * Hook لقياس وقت تنفيذ عملية
 */
export function useOperationTimer() {
  return {
    time: async <T,>(name: string, operation: () => Promise<T>): Promise<T> => {
      const start = performance.now();
      try {
        return await operation();
      } finally {
        const duration = performance.now() - start;
        if (import.meta.env.DEV && duration > 100) {
          productionLogger.warn(`⚠️ Slow operation: ${name} took ${duration.toFixed(2)}ms`);
        }
      }
    },
    
    timeSync: <T,>(name: string, operation: () => T): T => {
      const start = performance.now();
      try {
        return operation();
      } finally {
        const duration = performance.now() - start;
        if (import.meta.env.DEV && duration > 16) {
          productionLogger.warn(`⚠️ Slow sync operation: ${name} took ${duration.toFixed(2)}ms`);
        }
      }
    }
  };
}

/**
 * Hook لمراقبة الذاكرة (Chrome only)
 */
export function useMemoryMonitor() {
  useEffect(() => {
    if (!import.meta.env.DEV) return;
    
    const checkMemory = () => {
      if (hasMemoryAPI(performance)) {
        const memory = performance.memory;
        if (memory) {
          const usedMB = Math.round(memory.usedJSHeapSize / 1048576);
          const totalMB = Math.round(memory.totalJSHeapSize / 1048576);
          const limitMB = Math.round(memory.jsHeapSizeLimit / 1048576);
          
          if (usedMB > limitMB * 0.9) {
            productionLogger.warn(`⚠️ High memory usage: ${usedMB}MB / ${limitMB}MB (${Math.round(usedMB / limitMB * 100)}%)`);
          }
          
          productionLogger.debug(`💾 Memory: ${usedMB}MB / ${totalMB}MB (Limit: ${limitMB}MB)`);
        }
      }
    };
    
    // فحص الذاكرة كل 30 ثانية
    const interval = setInterval(checkMemory, 30000);
    
    return () => clearInterval(interval);
  }, []);
}
