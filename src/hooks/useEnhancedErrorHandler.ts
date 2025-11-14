import { useCallback } from 'react';
import { useToast } from './use-toast';
import { PostgrestError } from '@supabase/supabase-js';

interface ErrorContext {
  operation?: string;
  component?: string;
  metadata?: Record<string, any>;
}

/**
 * Hook محسّن لمعالجة الأخطاء بشكل موحّد
 */
export function useEnhancedErrorHandler() {
  const { toast } = useToast();

  /**
   * معالجة الأخطاء وعرض رسائل مناسبة للمستخدم
   */
  const handleError = useCallback(
    (error: unknown, context?: ErrorContext) => {
      console.error('Error occurred:', {
        error,
        context,
        timestamp: new Date().toISOString(),
      });

      // تحليل نوع الخطأ
      const errorMessage = getErrorMessage(error);
      const errorTitle = getErrorTitle(error, context);

      // عرض Toast notification
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: 'destructive',
      });

      // يمكن إضافة logging للأخطاء هنا (Sentry, LogRocket, etc.)
      logErrorToService(error, context);
    },
    [toast]
  );

  /**
   * معالجة أخطاء Supabase بشكل خاص
   */
  const handleSupabaseError = useCallback(
    (error: PostgrestError, context?: ErrorContext) => {
      const errorMessages: Record<string, string> = {
        '23505': 'البيانات موجودة مسبقاً',
        '23503': 'لا يمكن حذف هذا العنصر لارتباطه ببيانات أخرى',
        '42501': 'ليس لديك صلاحية لتنفيذ هذه العملية',
        'PGRST116': 'لم يتم العثور على البيانات المطلوبة',
        '42P01': 'الجدول غير موجود في قاعدة البيانات',
      };

      const message = errorMessages[error.code] || error.message;

      toast({
        title: 'خطأ في قاعدة البيانات',
        description: message,
        variant: 'destructive',
      });

      logErrorToService(error, context);
    },
    [toast]
  );

  /**
   * معالجة أخطاء الشبكة
   */
  const handleNetworkError = useCallback(() => {
    toast({
      title: 'خطأ في الاتصال',
      description: 'يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى',
      variant: 'destructive',
    });
  }, [toast]);

  /**
   * معالجة أخطاء المصادقة
   */
  const handleAuthError = useCallback(
    (error: any) => {
      const authErrors: Record<string, string> = {
        'invalid_grant': 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
        'user_not_found': 'المستخدم غير موجود',
        'invalid_credentials': 'بيانات الدخول غير صحيحة',
        'email_not_confirmed': 'الرجاء تأكيد بريدك الإلكتروني',
        'weak_password': 'كلمة المرور ضعيفة جداً',
      };

      const message = authErrors[error.message] || 'حدث خطأ في المصادقة';

      toast({
        title: 'خطأ في تسجيل الدخول',
        description: message,
        variant: 'destructive',
      });
    },
    [toast]
  );

  return {
    handleError,
    handleSupabaseError,
    handleNetworkError,
    handleAuthError,
  };
}

/**
 * استخراج رسالة خطأ مفهومة من الـ error object
 */
function getErrorMessage(error: unknown): string {
  if (typeof error === 'string') {
    return error;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'object' && error !== null) {
    if ('message' in error) {
      return String(error.message);
    }
    if ('error' in error) {
      return String(error.error);
    }
  }

  return 'حدث خطأ غير متوقع';
}

/**
 * الحصول على عنوان مناسب للخطأ
 */
function getErrorTitle(error: unknown, context?: ErrorContext): string {
  if (context?.operation) {
    return `خطأ في ${context.operation}`;
  }

  if (error instanceof TypeError) {
    return 'خطأ في البيانات';
  }

  if (error instanceof ReferenceError) {
    return 'خطأ في النظام';
  }

  return 'حدث خطأ';
}

/**
 * إرسال الخطأ لخدمة المراقبة (Sentry, LogRocket, etc.)
 */
function logErrorToService(error: unknown, context?: ErrorContext) {
  // يمكن إضافة التكامل مع خدمات المراقبة هنا
  // مثال: Sentry.captureException(error, { extra: context });
  
  if (process.env.NODE_ENV === 'development') {
    console.group('🔴 Error Log');
    console.error('Error:', error);
    console.log('Context:', context);
    console.log('Timestamp:', new Date().toISOString());
    console.groupEnd();
  }
}
