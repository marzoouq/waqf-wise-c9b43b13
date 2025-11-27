/**
 * أنواع سجلات الأخطاء المحلية
 */

export interface LocalErrorLog {
  timestamp: string;
  message?: string;
  type?: string;
  stack?: string;
  url?: string;
  [key: string]: unknown;
}
