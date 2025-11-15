/**
 * أنواع الأخطاء المعرفة في التطبيق
 */

import { PostgrestError } from '@supabase/supabase-js';

/**
 * نوع موحد للأخطاء في التطبيق
 */
export type AppError = Error | PostgrestError | { message: string; code?: string } | unknown;

/**
 * نوع لمعالجات الأخطاء في mutations
 */
export interface ErrorHandler {
  (error: AppError): void;
}

/**
 * نوع لـ mutation options مع معالجة أخطاء محسنة
 */
export interface MutationErrorOptions {
  onError?: (error: AppError) => void;
}
