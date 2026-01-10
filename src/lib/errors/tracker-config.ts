/**
 * إعدادات وثوابت نظام تتبع الأخطاء
 */

// أنماط الأخطاء التي يجب تجاهلها
export const IGNORE_ERROR_PATTERNS: RegExp[] = [
  /Failed to fetch.*log-error/i,
  /NetworkError.*execute-auto-fix/i,
  /ResizeObserver loop/i,
  /Auth session missing/i,
  /Failed to fetch/i,
  /getUser/i,
  /getSession/i,
  /Failed to send error report/i,
  /Edge Function returned a non-2xx status code/i,
  /429/i,
  /rate limit/i,
  /\[object Object\]/i,
  /The provided callback is no longer runnable/i,
  /Error tracked:/i,
  /HTTP 50[0-9]:/i,
  /violates row-level security/i,
  /violates foreign key constraint/i,
  /Invalid login credentials/i,
  /Database error saving new user/i,
  /manual_log/i,
  // ✅ تجاهل أخطاء Service Worker
  /sw\.js/i,
  /service.worker/i,
  /serviceWorker/i,
  /workbox/i,
  /Service Worker/i,
  /precache/i,
  // ✅ تجاهل أخطاء Edge Functions المتوقعة في الاختبارات
  /Edge function returned (400|401|403)/i,
  /Missing credentialId/i,
  /Admin role required/i,
  /معرف الملف مطلوب/i,
  /البيانات المطلوبة/i,
  /userId.*required/i,
  /testMode/i,
  /healthCheck/i,
  /يجب تقديم/i,
  /يجب تحديد/i,
  /Forbidden:/i,
];

// الإعدادات الافتراضية
export interface TrackerConfig {
  maxFailedAttempts: number;
  backoffDelay: number;
  localStorageKey: string;
  maxSameErrorCount: number;
  maxConsecutiveErrors: number;
  deduplicationWindow: number;
  autoResolveThreshold: number;
  circuitBreakerTimeout: number;
  batchSize: number;
  requestTimeout: number;
}

export const DEFAULT_CONFIG: TrackerConfig = {
  maxFailedAttempts: 3,
  backoffDelay: 2000,
  localStorageKey: 'pending_error_reports',
  maxSameErrorCount: 20,
  maxConsecutiveErrors: 10,
  deduplicationWindow: 15 * 60 * 1000, // 15 minutes
  autoResolveThreshold: 24 * 60 * 60 * 1000, // 24 hours
  circuitBreakerTimeout: 60000, // 1 minute
  batchSize: 10,
  requestTimeout: 15000,
};

// مفاتيح إعدادات قاعدة البيانات
export const DB_SETTING_KEYS = [
  'error_tracker_dedup_window_minutes',
  'error_tracker_max_same_error',
  'error_tracker_max_consecutive_errors',
  'error_tracker_auto_resolve_hours',
  'error_tracker_circuit_breaker_timeout',
] as const;

export type DBSettingKey = typeof DB_SETTING_KEYS[number];
