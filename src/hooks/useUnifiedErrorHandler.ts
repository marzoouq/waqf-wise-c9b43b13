import { useCallback } from 'react';
import { useToast } from './use-toast';
import { 
  getErrorMessage, 
  getErrorTitle, 
  logError, 
  handleSupabaseError,
  ErrorContext 
} from '@/lib/errorService';
import { PostgrestError } from '@supabase/supabase-js';

/**
 * Hook موحد لمعالجة الأخطاء في التطبيق
 * يوفر معالجة متسقة مع logging تلقائي
 */
export function useUnifiedErrorHandler() {
  const { toast } = useToast();

  /**
   * معالجة أي نوع من الأخطاء
   */
  const handleError = useCallback(
    (error: unknown, context?: ErrorContext) => {
      // تسجيل الخطأ
      logError(error, context);

      // عرض رسالة للمستخدم
      const message = getErrorMessage(error);
      const title = getErrorTitle(error, context);

      toast({
        title,
        description: message,
        variant: 'destructive',
      });
    },
    [toast]
  );

  /**
   * معالجة أخطاء Supabase بشكل خاص
   */
  const handleDatabaseError = useCallback(
    (error: PostgrestError, context?: ErrorContext) => {
      logError(error, { ...context, component: 'Database' });

      const message = handleSupabaseError(error);

      toast({
        title: 'خطأ في قاعدة البيانات',
        description: message,
        variant: 'destructive',
      });
    },
    [toast]
  );

  /**
   * معالجة أخطاء الشبكة
   */
  const handleNetworkError = useCallback(
    (context?: ErrorContext) => {
      logError(new Error('Network Error'), { ...context, component: 'Network' });

      toast({
        title: 'خطأ في الاتصال',
        description: 'يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى',
        variant: 'destructive',
      });
    },
    [toast]
  );

  /**
   * معالجة أخطاء المصادقة
   */
  const handleAuthError = useCallback(
    (error: any, context?: ErrorContext) => {
      logError(error, { ...context, component: 'Auth' });

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

  /**
   * عرض رسالة نجاح
   */
  const showSuccess = useCallback(
    (title: string, description?: string) => {
      toast({
        title,
        description,
      });
    },
    [toast]
  );

  /**
   * عرض رسالة تحذير
   */
  const showWarning = useCallback(
    (title: string, description?: string) => {
      toast({
        title,
        description,
        variant: 'default',
      });
    },
    [toast]
  );

  return {
    handleError,
    handleDatabaseError,
    handleNetworkError,
    handleAuthError,
    showSuccess,
    showWarning,
  };
}
