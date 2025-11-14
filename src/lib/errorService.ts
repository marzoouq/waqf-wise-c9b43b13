/**
 * نظام موحد لمعالجة الأخطاء في التطبيق
 * يوفر معالجة متسقة للأخطاء مع logging وتصنيف
 */

import { PostgrestError } from '@supabase/supabase-js';

export interface ErrorContext {
  operation?: string;
  component?: string;
  userId?: string;
  metadata?: Record<string, any>;
}

export interface ErrorLog {
  id: string;
  timestamp: string;
  level: 'error' | 'warning' | 'info';
  message: string;
  context?: ErrorContext;
  stack?: string;
  userAgent?: string;
}

/**
 * رسائل الأخطاء المخصصة للمستخدم
 */
const ERROR_MESSAGES: Record<string, string> = {
  // أخطاء قاعدة البيانات
  '23505': 'البيانات موجودة مسبقاً',
  '23503': 'لا يمكن حذف هذا العنصر لارتباطه ببيانات أخرى',
  '42501': 'ليس لديك صلاحية لتنفيذ هذه العملية',
  'PGRST116': 'لم يتم العثور على البيانات المطلوبة',
  '42P01': 'الجدول غير موجود في قاعدة البيانات',
  
  // أخطاء المصادقة
  'invalid_grant': 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
  'user_not_found': 'المستخدم غير موجود',
  'invalid_credentials': 'بيانات الدخول غير صحيحة',
  'email_not_confirmed': 'الرجاء تأكيد بريدك الإلكتروني',
  'weak_password': 'كلمة المرور ضعيفة جداً',
  
  // أخطاء الشبكة
  'NETWORK_ERROR': 'يرجى التحقق من اتصالك بالإنترنت',
  'TIMEOUT': 'انتهت مهلة الطلب، يرجى المحاولة مرة أخرى',
  'ABORT': 'تم إلغاء العملية',
};

/**
 * استخراج رسالة خطأ مفهومة من error object
 */
export function getErrorMessage(error: unknown): string {
  if (typeof error === 'string') {
    return error;
  }

  if (error instanceof Error) {
    return ERROR_MESSAGES[error.message] || error.message;
  }

  if (typeof error === 'object' && error !== null) {
    const err = error as any;
    
    // Supabase errors
    if ('code' in err && err.code) {
      return ERROR_MESSAGES[err.code] || err.message || 'حدث خطأ في قاعدة البيانات';
    }
    
    if ('message' in err) {
      return String(err.message);
    }
    
    if ('error' in err) {
      return String(err.error);
    }
  }

  return 'حدث خطأ غير متوقع';
}

/**
 * الحصول على عنوان مناسب للخطأ
 */
export function getErrorTitle(error: unknown, context?: ErrorContext): string {
  if (context?.operation) {
    return `خطأ في ${context.operation}`;
  }

  if (error instanceof TypeError) {
    return 'خطأ في البيانات';
  }

  if (error instanceof ReferenceError) {
    return 'خطأ في النظام';
  }

  const err = error as any;
  if (err?.code === '42501') {
    return 'خطأ في الصلاحيات';
  }

  return 'حدث خطأ';
}

/**
 * تحديد نوع الخطأ
 */
export function getErrorType(error: unknown): 'network' | 'auth' | 'database' | 'validation' | 'unknown' {
  if (!error) return 'unknown';

  const err = error as any;
  
  // Network errors
  if (err?.message?.includes('network') || err?.message?.includes('fetch')) {
    return 'network';
  }
  
  // Auth errors
  if (err?.message?.includes('auth') || err?.message?.includes('credentials')) {
    return 'auth';
  }
  
  // Database errors
  if (err?.code && (err.code.startsWith('23') || err.code.startsWith('42'))) {
    return 'database';
  }
  
  // Validation errors
  if (err?.message?.includes('validation') || err?.message?.includes('invalid')) {
    return 'validation';
  }

  return 'unknown';
}

/**
 * معالج Supabase errors
 */
export function handleSupabaseError(error: PostgrestError): string {
  return ERROR_MESSAGES[error.code] || error.message;
}

/**
 * تسجيل الخطأ (سيتم التكامل مع Sentry لاحقاً)
 */
export function logError(error: unknown, context?: ErrorContext): void {
  const errorLog: ErrorLog = {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    level: 'error',
    message: getErrorMessage(error),
    context,
    stack: error instanceof Error ? error.stack : undefined,
    userAgent: navigator.userAgent,
  };

  // Console logging في التطوير
  if (import.meta.env.DEV) {
    console.group('🔴 Error Log');
    console.error('Error:', error);
    console.log('Context:', context);
    console.log('Message:', errorLog.message);
    console.log('Timestamp:', errorLog.timestamp);
    if (errorLog.stack) {
      console.log('Stack:', errorLog.stack);
    }
    console.groupEnd();
  }

  // في الإنتاج، يمكن إرسال الأخطاء لخدمة مثل Sentry
  // if (window.Sentry) {
  //   Sentry.captureException(error, { extra: context });
  // }

  // حفظ في localStorage للتحليل (مؤقت)
  try {
    const logs = JSON.parse(localStorage.getItem('error_logs') || '[]');
    logs.push(errorLog);
    // الاحتفاظ بآخر 100 خطأ فقط
    if (logs.length > 100) {
      logs.shift();
    }
    localStorage.setItem('error_logs', JSON.stringify(logs));
  } catch (e) {
    console.error('Failed to save error log:', e);
  }
}

/**
 * الحصول على سجل الأخطاء
 */
export function getErrorLogs(): ErrorLog[] {
  try {
    return JSON.parse(localStorage.getItem('error_logs') || '[]');
  } catch (e) {
    return [];
  }
}

/**
 * مسح سجل الأخطاء
 */
export function clearErrorLogs(): void {
  localStorage.removeItem('error_logs');
}

/**
 * تصدير سجل الأخطاء
 */
export function exportErrorLogs(): string {
  const logs = getErrorLogs();
  return JSON.stringify(logs, null, 2);
}
