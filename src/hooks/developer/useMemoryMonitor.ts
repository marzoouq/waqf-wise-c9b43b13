/**
 * أداة مراقبة الذاكرة (Memory Monitor)
 * تكشف تسربات الذاكرة والاستخدام المفرط
 */
import { useState, useEffect, useCallback } from 'react';
import { productionLogger } from '@/lib/logger/production-logger';

interface MemoryInfo {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
  usagePercentage: number;
}

interface MemorySnapshot {
  timestamp: number;
  memory: MemoryInfo;
}

// سجل لقطات الذاكرة
const memorySnapshots: MemorySnapshot[] = [];

// حدود التحذير
const MEMORY_THRESHOLDS = {
  WARNING_PERCENTAGE: 70,
  CRITICAL_PERCENTAGE: 85,
  LEAK_DETECTION_GROWTH_MB: 50, // نمو 50MB خلال دقيقة يعني تسرب محتمل
  MAX_SNAPSHOTS: 60, // حفظ آخر 60 لقطة
};

export function useMemoryMonitor(enabled: boolean = true, intervalMs: number = 10000) {
  const [memoryInfo, setMemoryInfo] = useState<MemoryInfo | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [trend, setTrend] = useState<'stable' | 'increasing' | 'decreasing'>('stable');

  // الحصول على معلومات الذاكرة
  const getMemoryInfo = useCallback((): MemoryInfo | null => {
    if (!('memory' in performance)) {
      return null;
    }

    const memory = (performance as Performance & { memory: {
      usedJSHeapSize: number;
      totalJSHeapSize: number;
      jsHeapSizeLimit: number;
    }}).memory;

    return {
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit,
      usagePercentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100,
    };
  }, []);

  // تحليل الاتجاه
  const analyzeTrend = useCallback(() => {
    if (memorySnapshots.length < 6) return 'stable';

    const recent = memorySnapshots.slice(-6);
    const oldest = recent[0].memory.usedJSHeapSize;
    const newest = recent[recent.length - 1].memory.usedJSHeapSize;
    const growthMB = (newest - oldest) / (1024 * 1024);

    if (growthMB > 10) return 'increasing';
    if (growthMB < -10) return 'decreasing';
    return 'stable';
  }, []);

  // كشف تسربات الذاكرة
  const detectMemoryLeak = useCallback(() => {
    if (memorySnapshots.length < 6) return false;

    const oneMinuteAgo = Date.now() - 60000;
    const recentSnapshots = memorySnapshots.filter(s => s.timestamp > oneMinuteAgo);
    
    if (recentSnapshots.length < 2) return false;

    const startMemory = recentSnapshots[0].memory.usedJSHeapSize;
    const endMemory = recentSnapshots[recentSnapshots.length - 1].memory.usedJSHeapSize;
    const growthMB = (endMemory - startMemory) / (1024 * 1024);

    return growthMB > MEMORY_THRESHOLDS.LEAK_DETECTION_GROWTH_MB;
  }, []);

  // المراقبة الدورية
  useEffect(() => {
    if (!enabled) return;

    const monitor = () => {
      const info = getMemoryInfo();
      if (!info) return;

      setMemoryInfo(info);

      // حفظ اللقطة
      memorySnapshots.push({
        timestamp: Date.now(),
        memory: info,
      });

      // تنظيف اللقطات القديمة
      while (memorySnapshots.length > MEMORY_THRESHOLDS.MAX_SNAPSHOTS) {
        memorySnapshots.shift();
      }

      // تحليل الاتجاه
      setTrend(analyzeTrend());

      // التحقق من التحذيرات
      const newWarnings: string[] = [];

      if (info.usagePercentage > MEMORY_THRESHOLDS.CRITICAL_PERCENTAGE) {
        newWarnings.push(`⛔ استخدام ذاكرة حرج: ${info.usagePercentage.toFixed(1)}%`);
        productionLogger.error('استخدام ذاكرة حرج', { memoryInfo: info });
      } else if (info.usagePercentage > MEMORY_THRESHOLDS.WARNING_PERCENTAGE) {
        newWarnings.push(`⚠️ استخدام ذاكرة مرتفع: ${info.usagePercentage.toFixed(1)}%`);
      }

      if (detectMemoryLeak()) {
        newWarnings.push('🔴 تسرب ذاكرة محتمل مكتشف!');
        productionLogger.warn('تسرب ذاكرة محتمل مكتشف', { 
          snapshots: memorySnapshots.slice(-6) 
        });
      }

      setWarnings(newWarnings);
    };

    monitor(); // تنفيذ فوري
    const interval = setInterval(monitor, intervalMs);

    return () => clearInterval(interval);
  }, [enabled, intervalMs, getMemoryInfo, analyzeTrend, detectMemoryLeak]);

  // الحصول على تقرير شامل
  const getReport = useCallback(() => {
    const info = getMemoryInfo();
    if (!info) return null;

    return {
      current: info,
      trend,
      snapshots: memorySnapshots.slice(-10),
      warnings,
      formattedUsage: {
        used: `${(info.usedJSHeapSize / (1024 * 1024)).toFixed(2)} MB`,
        total: `${(info.totalJSHeapSize / (1024 * 1024)).toFixed(2)} MB`,
        limit: `${(info.jsHeapSizeLimit / (1024 * 1024)).toFixed(2)} MB`,
      },
    };
  }, [getMemoryInfo, trend, warnings]);

  // تنظيف يدوي (طلب GC)
  const requestCleanup = useCallback(() => {
    if ('gc' in window) {
      (window as Window & { gc?: () => void }).gc?.();
      productionLogger.info('طلب تنظيف الذاكرة');
    }
  }, []);

  return { 
    memoryInfo, 
    warnings, 
    trend, 
    getReport, 
    requestCleanup,
    isSupported: 'memory' in performance 
  };
}

// دالة للحصول على لقطات الذاكرة
export function getMemorySnapshots(): MemorySnapshot[] {
  return [...memorySnapshots];
}

// إعادة تعيين السجلات
export function resetMemorySnapshots() {
  memorySnapshots.length = 0;
}
