/**
 * معالج موحد للأخطاء
 */

import { getErrorMessage } from '@/types/errors';

export interface ErrorHandlerOptions {
  context?: string;
  severity?: 'low' | 'medium' | 'high';
  silent?: boolean;
}

/**
 * معالجة أخطاء الـ mutations
 */
export function handleMutationError(
  error: unknown,
  options: ErrorHandlerOptions = {}
): {
  title: string;
  description: string;
  variant: 'destructive';
} {
  const { context, severity = 'medium', silent = false } = options;
  
  // تسجيل الخطأ في console
  if (!silent) {
    console.error(`[${severity.toUpperCase()}] Error in ${context || 'mutation'}:`, error);
  }
  
  return {
    title: 'خطأ',
    description: getErrorMessage(error),
    variant: 'destructive' as const,
  };
}

/**
 * معالجة أخطاء الـ queries
 */
export function handleQueryError(
  error: unknown,
  options: ErrorHandlerOptions = {}
): void {
  const { context, severity = 'medium', silent = false } = options;
  
  if (!silent) {
    console.error(`[${severity.toUpperCase()}] Query error in ${context}:`, error);
  }
}

/**
 * التحقق من نوع الخطأ
 */
export function isNetworkError(error: unknown): boolean {
  return (
    error instanceof Error &&
    (error.message.includes('fetch') || 
     error.message.includes('network') ||
     error.message.includes('NetworkError'))
  );
}

/**
 * التحقق من خطأ المصادقة
 */
export function isAuthError(error: unknown): boolean {
  return (
    error instanceof Error &&
    (error.message.includes('auth') ||
     error.message.includes('unauthorized') ||
     error.message.includes('forbidden'))
  );
}

/**
 * الحصول على رسالة خطأ مناسبة للمستخدم
 */
export function getUserFriendlyErrorMessage(error: unknown): string {
  if (isNetworkError(error)) {
    return 'فشل الاتصال بالخادم. الرجاء التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى.';
  }
  
  if (isAuthError(error)) {
    return 'انتهت صلاحية جلستك. الرجاء تسجيل الدخول مرة أخرى.';
  }
  
  return getErrorMessage(error);
}
