/**
 * أداة كشف التكرار (Duplicate Detection)
 * تكشف API calls المكررة والبيانات المتكررة
 */
import { useEffect, useRef, useCallback } from 'react';
import { productionLogger } from '@/lib/logger/production-logger';

interface DuplicateInfo {
  key: string;
  count: number;
  timestamps: number[];
  lastOccurrence: number;
}

// مخزن للطلبات
const requestRegistry = new Map<string, DuplicateInfo>();

// حدود التكرار
const DUPLICATE_THRESHOLDS = {
  MAX_SAME_REQUEST_PER_SECOND: 3,
  MAX_SAME_REQUEST_PER_MINUTE: 10,
  DEDUP_WINDOW_MS: 1000, // نافذة إزالة التكرار
};

export function useDuplicateDetector(enabled: boolean = true) {
  const detectedDuplicates = useRef<string[]>([]);

  // تتبع الطلب
  const trackRequest = useCallback((key: string, metadata?: Record<string, unknown>) => {
    if (!enabled) return false;

    const now = Date.now();
    const existing = requestRegistry.get(key);

    if (existing) {
      // تنظيف الأوقات القديمة
      existing.timestamps = existing.timestamps.filter(t => now - t < 60000);
      existing.timestamps.push(now);
      existing.count = existing.timestamps.length;
      existing.lastOccurrence = now;

      // التحقق من التكرار المفرط
      const recentRequests = existing.timestamps.filter(t => now - t < 1000).length;
      
      if (recentRequests > DUPLICATE_THRESHOLDS.MAX_SAME_REQUEST_PER_SECOND) {
        if (!detectedDuplicates.current.includes(key)) {
          detectedDuplicates.current.push(key);
          productionLogger.warn(
            `🔄 طلب متكرر مكتشف: ${key}`,
            { 
              requestsInLastSecond: recentRequests,
              totalRequests: existing.count,
              metadata 
            }
          );
        }
        return true; // تكرار مكتشف
      }
    } else {
      requestRegistry.set(key, {
        key,
        count: 1,
        timestamps: [now],
        lastOccurrence: now,
      });
    }

    return false; // لا يوجد تكرار
  }, [enabled]);

  // التحقق مما إذا كان الطلب مكرراً
  const isDuplicate = useCallback((key: string, windowMs: number = DUPLICATE_THRESHOLDS.DEDUP_WINDOW_MS) => {
    const existing = requestRegistry.get(key);
    if (!existing) return false;

    const now = Date.now();
    return now - existing.lastOccurrence < windowMs;
  }, []);

  // الحصول على تقرير التكرار
  const getReport = useCallback(() => {
    const now = Date.now();
    return Array.from(requestRegistry.values())
      .filter(info => info.count > 1)
      .map(info => ({
        ...info,
        requestsInLastMinute: info.timestamps.filter(t => now - t < 60000).length,
        requestsInLastSecond: info.timestamps.filter(t => now - t < 1000).length,
      }))
      .sort((a, b) => b.count - a.count);
  }, []);

  // تنظيف السجلات القديمة
  useEffect(() => {
    if (!enabled) return;

    const cleanup = setInterval(() => {
      const now = Date.now();
      requestRegistry.forEach((info, key) => {
        info.timestamps = info.timestamps.filter(t => now - t < 300000); // 5 دقائق
        if (info.timestamps.length === 0) {
          requestRegistry.delete(key);
        }
      });
    }, 60000); // كل دقيقة

    return () => clearInterval(cleanup);
  }, [enabled]);

  return { trackRequest, isDuplicate, getReport, detectedDuplicates: detectedDuplicates.current };
}

// دالة عامة للتتبع
export function trackApiRequest(endpoint: string, method: string = 'GET') {
  const key = `${method}:${endpoint}`;
  const existing = requestRegistry.get(key);
  const now = Date.now();

  if (existing) {
    existing.timestamps.push(now);
    existing.count++;
    existing.lastOccurrence = now;
    
    const recentRequests = existing.timestamps.filter(t => now - t < 1000).length;
    if (recentRequests > DUPLICATE_THRESHOLDS.MAX_SAME_REQUEST_PER_SECOND) {
      return { isDuplicate: true, count: recentRequests };
    }
  } else {
    requestRegistry.set(key, {
      key,
      count: 1,
      timestamps: [now],
      lastOccurrence: now,
    });
  }

  return { isDuplicate: false, count: 1 };
}

// إعادة تعيين السجلات
export function resetDuplicateRegistry() {
  requestRegistry.clear();
}
