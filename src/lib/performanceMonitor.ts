/**
 * أداة لمراقبة الأداء وتسجيل المقاييس
 */

import { productionLogger } from '@/lib/logger/production-logger';

interface PerformanceMetric {
  name: string;
  duration: number;
  timestamp: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private marks: Map<string, number> = new Map();

  /**
   * بدء قياس عملية
   */
  start(name: string): void {
    this.marks.set(name, performance.now());
  }

  /**
   * إنهاء قياس عملية
   */
  end(name: string): number | null {
    const startTime = this.marks.get(name);
    if (!startTime) {
      productionLogger.warn(`Performance mark "${name}" not found`);
      return null;
    }

    const duration = performance.now() - startTime;
    this.metrics.push({
      name,
      duration,
      timestamp: Date.now(),
    });

    this.marks.delete(name);
    return duration;
  }

  /**
   * الحصول على جميع المقاييس
   */
  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  /**
   * الحصول على متوسط مدة عملية معينة
   */
  getAverageDuration(name: string): number {
    const filtered = this.metrics.filter(m => m.name === name);
    if (filtered.length === 0) return 0;

    const sum = filtered.reduce((acc, m) => acc + m.duration, 0);
    return sum / filtered.length;
  }

  /**
   * مسح جميع المقاييس
   */
  clear(): void {
    this.metrics = [];
    this.marks.clear();
  }

  /**
   * طباعة تقرير الأداء
   */
  report(): void {
    if (this.metrics.length === 0) {
      productionLogger.info('No performance metrics recorded');
      return;
    }

    productionLogger.info('📊 Performance Report:');
    
    const grouped = this.metrics.reduce((acc, metric) => {
      if (!acc[metric.name]) {
        acc[metric.name] = [];
      }
      acc[metric.name].push(metric.duration);
      return acc;
    }, {} as Record<string, number[]>);

    Object.entries(grouped).forEach(([name, durations]) => {
      const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
      const min = Math.min(...durations);
      const max = Math.max(...durations);
      
      productionLogger.info(`${name}:`, {
        count: durations.length,
        avg: `${avg.toFixed(2)}ms`,
        min: `${min.toFixed(2)}ms`,
        max: `${max.toFixed(2)}ms`,
      });
    });
  }

  /**
   * قياس مقاييس تحميل الصفحة بالتفصيل
   */
  logPageLoadMetrics(): void {
    if (typeof window === 'undefined') return;

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    if (!navigation) {
      productionLogger.warn('Navigation timing not available');
      return;
    }

    const metrics = {
      'DNS Lookup': Math.round(navigation.domainLookupEnd - navigation.domainLookupStart),
      'TCP Connection': Math.round(navigation.connectEnd - navigation.connectStart),
      'Request Time': Math.round(navigation.responseEnd - navigation.requestStart),
      'Response Time': Math.round(navigation.responseEnd - navigation.responseStart),
      'DOM Processing': Math.round(navigation.domContentLoadedEventEnd - navigation.responseEnd),
      'Load Complete': Math.round(navigation.loadEventEnd - navigation.fetchStart),
      'DOM Interactive': Math.round(navigation.domInteractive - navigation.fetchStart),
      'DOM Content Loaded': Math.round(navigation.domContentLoadedEventEnd - navigation.fetchStart),
    };

    productionLogger.info('🚀 Page Load Metrics:');
    Object.entries(metrics).forEach(([key, value]) => {
      const color = value < 100 ? '🟢' : value < 500 ? '🟡' : '🔴';
      productionLogger.info(`${color} ${key}: ${value}ms`);
    });
  }

  /**
   * قياس First Contentful Paint و Largest Contentful Paint
   */
  logWebVitals(): void {
    if (typeof window === 'undefined') return;

    try {
      // First Contentful Paint
      const fcpEntry = performance.getEntriesByName('first-contentful-paint')[0] as PerformanceEntry;
      if (fcpEntry) {
        productionLogger.info(`🎨 First Contentful Paint: ${Math.round(fcpEntry.startTime)}ms`);
      }

      // Largest Contentful Paint
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as PerformanceEntry & { startTime: number };
        productionLogger.info(`🖼️ Largest Contentful Paint: ${Math.round(lastEntry.startTime)}ms`);
      });
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (error) {
      productionLogger.warn('Web Vitals not available:', error);
    }
  }
}

export const performanceMonitor = new PerformanceMonitor();

/**
 * دالة لقياس أداء العمليات
 */
export function measurePerformance<T>(
  name: string,
  fn: () => T
): T {
  performanceMonitor.start(name);
  const result = fn();
  performanceMonitor.end(name);
  return result;
}

/**
 * دالة لقياس أداء العمليات غير المتزامنة
 */
export async function measurePerformanceAsync<T>(
  name: string,
  fn: () => Promise<T>
): Promise<T> {
  performanceMonitor.start(name);
  const result = await fn();
  performanceMonitor.end(name);
  return result;
}
