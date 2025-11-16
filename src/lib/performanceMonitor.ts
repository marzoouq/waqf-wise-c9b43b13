/**
 * أداة لمراقبة الأداء وتسجيل المقاييس
 */

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
      console.warn(`Performance mark "${name}" not found`);
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
      console.log('No performance metrics recorded');
      return;
    }

    console.group('📊 Performance Report');
    
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
      
      console.log(`${name}:`, {
        count: durations.length,
        avg: `${avg.toFixed(2)}ms`,
        min: `${min.toFixed(2)}ms`,
        max: `${max.toFixed(2)}ms`,
      });
    });

    console.groupEnd();
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
