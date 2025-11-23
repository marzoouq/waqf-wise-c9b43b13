/**
 * دوال مساعدة لإنشاء رسائل خطأ آمنة للعملاء
 * تمنع تسريب معلومات حساسة عن البنية التحتية
 */

export function getSafeErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    // أخطاء قاعدة البيانات
    if (error.message.includes('permission denied') || 
        error.message.includes('insufficient_privilege')) {
      return 'ليس لديك صلاحية لهذه العملية';
    }
    
    if (error.message.includes('not found') || 
        error.message.includes('does not exist')) {
      return 'العنصر المطلوب غير موجود';
    }
    
    if (error.message.includes('duplicate') || 
        error.message.includes('already exists')) {
      return 'البيانات موجودة مسبقاً';
    }
    
    if (error.message.includes('foreign key') || 
        error.message.includes('violates')) {
      return 'لا يمكن تنفيذ هذه العملية لارتباطها ببيانات أخرى';
    }
    
    if (error.message.includes('invalid') || 
        error.message.includes('malformed')) {
      return 'البيانات المدخلة غير صالحة';
    }
    
    if (error.message.includes('timeout') || 
        error.message.includes('timed out')) {
      return 'انتهت مهلة الطلب، يرجى المحاولة مرة أخرى';
    }
    
    if (error.message.includes('network') || 
        error.message.includes('connection')) {
      return 'خطأ في الاتصال، يرجى التحقق من الإنترنت';
    }

    if (error.message.includes('غير مصرح') || 
        error.message.includes('unauthorized')) {
      return 'غير مصرح بالوصول';
    }

    if (error.message.includes('مصادقة') || 
        error.message.includes('authentication')) {
      return 'فشل التحقق من الهوية';
    }
  }
  
  return 'حدث خطأ أثناء معالجة الطلب';
}

export function logAndReturnSafeError(
  error: unknown, 
  context: string,
  userId?: string
): Response {
  // تسجيل التفاصيل الكاملة في logs للمطورين فقط
  console.error(`[${context}] Error for user ${userId || 'unknown'}:`, {
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    timestamp: new Date().toISOString()
  });
  
  // إرجاع رسالة آمنة للعميل (لا تكشف تفاصيل داخلية)
  return new Response(
    JSON.stringify({ 
      success: false,
      error: getSafeErrorMessage(error) 
    }), 
    { 
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      } 
    }
  );
}
