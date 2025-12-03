/**
 * أداة تتبع إعادة الرسم المفرطة (Excessive Re-renders)
 * تكشف المكونات التي تُعاد رسمها بشكل متكرر
 */
import { useEffect, useRef, useCallback } from 'react';
import { productionLogger } from '@/lib/logger/production-logger';

interface RenderInfo {
  componentName: string;
  renderCount: number;
  lastRenderTime: number;
  renderTimes: number[];
  warnings: string[];
}

// مخزن عام لتتبع جميع المكونات
const renderRegistry = new Map<string, RenderInfo>();

// حدود التحذير
const RENDER_THRESHOLDS = {
  MAX_RENDERS_PER_SECOND: 10,
  MAX_RENDERS_PER_MINUTE: 60,
  SLOW_RENDER_MS: 16, // أكثر من frame واحد
  WARNING_INTERVAL_MS: 5000, // عدم تكرار التحذير خلال 5 ثوان
};

const lastWarningTime = new Map<string, number>();

export function useRenderTracker(componentName: string, enabled: boolean = true) {
  const renderCount = useRef(0);
  const renderTimes = useRef<number[]>([]);
  const lastRenderTime = useRef(Date.now());
  const mountTime = useRef(Date.now());

  useEffect(() => {
    if (!enabled) return;

    const now = Date.now();
    renderCount.current += 1;
    renderTimes.current.push(now);

    // تنظيف الأوقات القديمة (أكثر من دقيقة)
    renderTimes.current = renderTimes.current.filter(t => now - t < 60000);

    // حساب معدل إعادة الرسم
    const rendersInLastSecond = renderTimes.current.filter(t => now - t < 1000).length;
    const rendersInLastMinute = renderTimes.current.length;

    // تحديث السجل
    renderRegistry.set(componentName, {
      componentName,
      renderCount: renderCount.current,
      lastRenderTime: now,
      renderTimes: [...renderTimes.current],
      warnings: [],
    });

    // التحقق من التحذيرات
    const lastWarning = lastWarningTime.get(componentName) || 0;
    const canWarn = now - lastWarning > RENDER_THRESHOLDS.WARNING_INTERVAL_MS;

    if (canWarn) {
      if (rendersInLastSecond > RENDER_THRESHOLDS.MAX_RENDERS_PER_SECOND) {
        lastWarningTime.set(componentName, now);
        productionLogger.warn(
          `⚠️ إعادة رسم مفرطة في ${componentName}: ${rendersInLastSecond} مرة/ثانية`,
          { componentName, rendersInLastSecond, rendersInLastMinute }
        );
      }
    }

    lastRenderTime.current = now;
  });

  // دالة للحصول على تقرير المكون
  const getReport = useCallback(() => {
    const now = Date.now();
    const uptime = (now - mountTime.current) / 1000;
    const rendersPerSecond = renderCount.current / uptime;
    
    return {
      componentName,
      totalRenders: renderCount.current,
      uptimeSeconds: uptime,
      averageRendersPerSecond: rendersPerSecond.toFixed(2),
      isHealthy: rendersPerSecond < 1,
    };
  }, [componentName]);

  return { renderCount: renderCount.current, getReport };
}

// دالة للحصول على تقرير شامل لجميع المكونات
export function getRenderReport(): RenderInfo[] {
  return Array.from(renderRegistry.values())
    .sort((a, b) => b.renderCount - a.renderCount)
    .slice(0, 20); // أعلى 20 مكون
}

// دالة لإعادة تعيين السجلات
export function resetRenderRegistry() {
  renderRegistry.clear();
  lastWarningTime.clear();
}
