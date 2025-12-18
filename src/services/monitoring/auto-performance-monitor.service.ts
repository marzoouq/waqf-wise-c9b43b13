/**
 * Auto Performance Monitor Service
 * خدمة مراقبة الأداء التلقائية مع تنبيهات
 */

import { supabase } from "@/integrations/supabase/client";

const RESPONSE_TIME_THRESHOLD_MS = 200;
const ALERT_COOLDOWN_MS = 60000;

interface PerformanceMetric {
  operation: string;
  duration: number;
  timestamp: Date;
  success: boolean;
}

export interface PerformanceStats {
  avg: number;
  max: number;
  min: number;
  count: number;
  slowCount: number;
  threshold: number;
}

class AutoPerformanceMonitor {
  private lastAlertTime: number = 0;
  private metrics: PerformanceMetric[] = [];
  private isEnabled: boolean = true;

  async measureOperation<T>(
    operationName: string,
    operation: () => Promise<T>
  ): Promise<T> {
    if (!this.isEnabled) {
      return operation();
    }

    const startTime = performance.now();
    let success = true;

    try {
      const result = await operation();
      return result;
    } catch (error) {
      success = false;
      throw error;
    } finally {
      const duration = performance.now() - startTime;
      this.recordMetric(operationName, duration, success);
    }
  }

  private recordMetric(operation: string, duration: number, success: boolean) {
    const metric: PerformanceMetric = {
      operation,
      duration,
      timestamp: new Date(),
      success
    };

    this.metrics.push(metric);

    if (this.metrics.length > 100) {
      this.metrics = this.metrics.slice(-100);
    }

    if (duration > RESPONSE_TIME_THRESHOLD_MS) {
      this.handleSlowOperation(metric);
    }
  }

  private async handleSlowOperation(metric: PerformanceMetric) {
    const now = Date.now();
    
    if (now - this.lastAlertTime < ALERT_COOLDOWN_MS) {
      console.warn(`[Performance] عملية بطيئة: ${metric.operation} (${metric.duration.toFixed(0)}ms)`);
      return;
    }

    this.lastAlertTime = now;

    try {
      await supabase.from('system_alerts').insert({
        alert_type: 'slow_performance',
        severity: metric.duration > 500 ? 'error' : 'warning',
        title: 'تحذير أداء: عملية بطيئة',
        description: `العملية "${metric.operation}" استغرقت ${metric.duration.toFixed(0)}ms (الحد: ${RESPONSE_TIME_THRESHOLD_MS}ms)`,
        status: 'active'
      });

      console.warn(`[Performance Alert] ${metric.operation}: ${metric.duration.toFixed(0)}ms`);
    } catch (error) {
      console.error('[Performance] فشل إرسال التنبيه:', error);
    }
  }

  getStats(): PerformanceStats {
    if (this.metrics.length === 0) {
      return { avg: 0, max: 0, min: 0, count: 0, slowCount: 0, threshold: RESPONSE_TIME_THRESHOLD_MS };
    }

    const durations = this.metrics.map(m => m.duration);
    const slowCount = durations.filter(d => d > RESPONSE_TIME_THRESHOLD_MS).length;

    return {
      avg: durations.reduce((a, b) => a + b, 0) / durations.length,
      max: Math.max(...durations),
      min: Math.min(...durations),
      count: durations.length,
      slowCount,
      threshold: RESPONSE_TIME_THRESHOLD_MS
    };
  }

  setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
  }

  clearMetrics() {
    this.metrics = [];
  }
}

export const autoPerformanceMonitor = new AutoPerformanceMonitor();
