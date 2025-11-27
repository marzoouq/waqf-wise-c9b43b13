/**
 * أنواع TypeScript لنظام تتبع الأخطاء
 */

import type { ErrorReport, ErrorSeverity } from './types';

// إعادة تصدير من types.ts
export type { ErrorReport, ErrorSeverity };

/**
 * حالة Deduplication للخطأ
 */
export interface DeduplicationEntry {
  count: number;
  lastSeen: number;
  resolved: boolean;
}

/**
 * إحصائيات Deduplication
 */
export interface DeduplicationStats {
  total: number;
  resolved: number;
  active: number;
}

/**
 * إحصائيات Error Tracker
 */
export interface TrackerStats {
  queueSize: number;
  isProcessing: boolean;
  circuitBreakerOpen: boolean;
  failedAttempts: number;
  consecutiveErrors: number;
  deduplication: DeduplicationStats;
}

/**
 * نتيجة إرسال الخطأ
 */
export interface SendErrorResult {
  success: boolean;
  errorId?: string;
  error?: string;
}

/**
 * خيارات تتبع الخطأ
 */
export interface TrackErrorOptions {
  skipDeduplication?: boolean;
  forceImmediate?: boolean;
}
