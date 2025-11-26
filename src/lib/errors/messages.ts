/**
 * رسائل الأخطاء المخصصة باللغة العربية
 */

export const ERROR_MESSAGES: Record<string, string> = {
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
 * استخراج رسالة خطأ مفهومة
 */
export function getErrorMessage(error: unknown): string {
  if (typeof error === 'string') {
    return error;
  }

  if (error instanceof Error) {
    return ERROR_MESSAGES[error.message] || error.message;
  }

  if (typeof error === 'object' && error !== null) {
    const err = error as { code?: string; message?: string; details?: string; error?: unknown };
    
    if ('code' in err && err.code) {
      return ERROR_MESSAGES[err.code] || err.message || 'حدث خطأ في قاعدة البيانات';
    }
    
    if ('message' in err && err.message) {
      return String(err.message);
    }
    
    if ('error' in err && err.error) {
      // إذا كان الخطأ كائن آخر، استدعي الدالة بشكل تكراري
      if (typeof err.error === 'object') {
        return getErrorMessage(err.error);
      }
      return String(err.error);
    }
    
    // محاولة أخيرة: تحويل الكائن إلى JSON
    try {
      const jsonStr = JSON.stringify(error);
      if (jsonStr && jsonStr !== '{}' && jsonStr !== '[object Object]') {
        return jsonStr;
      }
    } catch {
      // تجاهل أخطاء JSON.stringify
    }
  }

  return 'حدث خطأ غير متوقع';
}

/**
 * الحصول على عنوان مناسب للخطأ
 */
export function getErrorTitle(error: unknown, context?: { operation?: string }): string {
  if (context?.operation) {
    return `خطأ في ${context.operation}`;
  }

  if (error instanceof TypeError) {
    return 'خطأ في البيانات';
  }

  if (error instanceof ReferenceError) {
    return 'خطأ في النظام';
  }

  const err = error as { code?: string };
  if (err?.code === '42501') {
    return 'خطأ في الصلاحيات';
  }

  return 'حدث خطأ';
}
