/**
 * Edge Functions Health Service - خدمة مراقبة صحة Edge Functions
 */

import { supabase } from '@/integrations/supabase/client';

export type CheckType = 'ping' | 'json-required' | 'formdata';

export interface EdgeFunctionInfo {
  name: string;
  description: string;
  requiresAuth: boolean;
  category: 'ai' | 'database' | 'notification' | 'backup' | 'security' | 'utility';
  checkType: CheckType;
  requiredFields?: string[];
}

export interface EdgeFunctionHealth {
  name: string;
  status: 'healthy' | 'degraded' | 'unhealthy' | 'unknown' | 'protected';
  responseTime?: number;
  lastChecked?: string;
  lastError?: string;
  consecutiveFailures: number;
  isProtected?: boolean;
  statusReason?: string;
  recommendation?: string;
}

export interface HealthCheckResult {
  function: string;
  success: boolean;
  responseTime: number;
  error?: string;
  checkedAt: string;
  note?: string;
  isProtected?: boolean;
  statusReason?: string;
  recommendation?: string;
}

// قائمة جميع Edge Functions في النظام مع تصنيف نوع الفحص
export const ALL_EDGE_FUNCTIONS: EdgeFunctionInfo[] = [
  // AI Functions
  { name: 'ai-system-audit', description: 'الفحص الذكي للنظام', requiresAuth: true, category: 'ai', checkType: 'ping' },
  { name: 'chatbot', description: 'المساعد الذكي', requiresAuth: true, category: 'ai', checkType: 'json-required', requiredFields: ['message'] },
  { name: 'generate-ai-insights', description: 'توليد الرؤى الذكية', requiresAuth: true, category: 'ai', checkType: 'ping' },
  { name: 'generate-smart-alerts', description: 'توليد التنبيهات الذكية', requiresAuth: true, category: 'ai', checkType: 'ping' },
  { name: 'intelligent-search', description: 'البحث الذكي', requiresAuth: true, category: 'ai', checkType: 'json-required', requiredFields: ['query'] },
  { name: 'property-ai-assistant', description: 'مساعد العقارات الذكي', requiresAuth: true, category: 'ai', checkType: 'json-required', requiredFields: ['message'] },
  { name: 'ocr-document', description: 'التعرف على النصوص', requiresAuth: true, category: 'ai', checkType: 'formdata' },
  { name: 'extract-invoice-data', description: 'استخراج بيانات الفاتورة', requiresAuth: true, category: 'ai', checkType: 'ping' },
  { name: 'auto-classify-document', description: 'تصنيف المستندات تلقائياً', requiresAuth: true, category: 'ai', checkType: 'ping' },
  
  // Database Functions
  { name: 'db-health-check', description: 'فحص صحة قاعدة البيانات', requiresAuth: false, category: 'database', checkType: 'ping' },
  { name: 'db-performance-stats', description: 'إحصائيات الأداء', requiresAuth: false, category: 'database', checkType: 'ping' },
  { name: 'run-vacuum', description: 'تنظيف قاعدة البيانات', requiresAuth: false, category: 'database', checkType: 'ping' },
  { name: 'weekly-maintenance', description: 'الصيانة الأسبوعية', requiresAuth: false, category: 'database', checkType: 'ping' },
  
  // Backup Functions
  { name: 'backup-database', description: 'نسخ قاعدة البيانات', requiresAuth: true, category: 'backup', checkType: 'ping' },
  { name: 'restore-database', description: 'استعادة قاعدة البيانات', requiresAuth: true, category: 'backup', checkType: 'json-required', requiredFields: ['backupId'] },
  { name: 'daily-backup', description: 'النسخ اليومي', requiresAuth: true, category: 'backup', checkType: 'ping' },
  
  // Notification Functions
  { name: 'send-notification', description: 'إرسال إشعار', requiresAuth: true, category: 'notification', checkType: 'json-required', requiredFields: ['userId', 'title', 'message'] },
  { name: 'send-push-notification', description: 'إشعار فوري', requiresAuth: true, category: 'notification', checkType: 'json-required', requiredFields: ['userId', 'title'] },
  { name: 'send-slack-alert', description: 'تنبيه Slack', requiresAuth: true, category: 'notification', checkType: 'json-required', requiredFields: ['message'] },
  { name: 'send-invoice-email', description: 'إرسال فاتورة بالبريد', requiresAuth: true, category: 'notification', checkType: 'json-required', requiredFields: ['invoiceId'] },
  { name: 'notify-admins', description: 'إشعار المديرين', requiresAuth: true, category: 'notification', checkType: 'json-required', requiredFields: ['message'] },
  { name: 'notify-disclosure-published', description: 'إشعار نشر الإفصاح', requiresAuth: true, category: 'notification', checkType: 'json-required', requiredFields: ['disclosureId'] },
  { name: 'daily-notifications', description: 'الإشعارات اليومية', requiresAuth: true, category: 'notification', checkType: 'ping' },
  { name: 'contract-renewal-alerts', description: 'تنبيهات تجديد العقود', requiresAuth: false, category: 'notification', checkType: 'ping' },
  
  // Security Functions
  { name: 'check-leaked-password', description: 'فحص كلمات المرور المسربة', requiresAuth: true, category: 'security', checkType: 'ping' },
  { name: 'biometric-auth', description: 'المصادقة البيومترية', requiresAuth: false, category: 'security', checkType: 'ping' },
  { name: 'encrypt-file', description: 'تشفير الملفات', requiresAuth: true, category: 'security', checkType: 'formdata' },
  { name: 'decrypt-file', description: 'فك تشفير الملفات', requiresAuth: true, category: 'security', checkType: 'json-required', requiredFields: ['fileId'] },
  { name: 'secure-delete-file', description: 'حذف آمن للملفات', requiresAuth: true, category: 'security', checkType: 'json-required', requiredFields: ['fileId'] },
  { name: 'cleanup-old-files', description: 'تنظيف الملفات القديمة', requiresAuth: true, category: 'security', checkType: 'ping' },
  { name: 'cleanup-sensitive-files', description: 'تنظيف الملفات الحساسة', requiresAuth: true, category: 'security', checkType: 'ping' },
  { name: 'scheduled-cleanup', description: 'التنظيف المجدول', requiresAuth: true, category: 'security', checkType: 'ping' },
  
  // Utility Functions
  { name: 'log-error', description: 'تسجيل الأخطاء', requiresAuth: false, category: 'utility', checkType: 'json-required', requiredFields: ['error'] },
  { name: 'execute-auto-fix', description: 'تنفيذ الإصلاح التلقائي', requiresAuth: true, category: 'utility', checkType: 'json-required', requiredFields: ['fixId'] },
  { name: 'admin-manage-beneficiary-password', description: 'إدارة كلمات مرور المستفيدين', requiresAuth: true, category: 'utility', checkType: 'json-required', requiredFields: ['beneficiaryId', 'action'] },
  { name: 'reset-user-password', description: 'إعادة تعيين كلمة المرور', requiresAuth: true, category: 'utility', checkType: 'json-required', requiredFields: ['userId'] },
  { name: 'update-user-email', description: 'تحديث البريد الإلكتروني', requiresAuth: true, category: 'utility', checkType: 'json-required', requiredFields: ['userId', 'newEmail'] },
  { name: 'create-beneficiary-accounts', description: 'إنشاء حسابات المستفيدين', requiresAuth: true, category: 'utility', checkType: 'ping' },
  { name: 'simulate-distribution', description: 'محاكاة التوزيع', requiresAuth: true, category: 'utility', checkType: 'ping' },
  { name: 'distribute-revenue', description: 'توزيع الإيرادات', requiresAuth: true, category: 'utility', checkType: 'json-required', requiredFields: ['distributionId'] },
  { name: 'generate-distribution-summary', description: 'ملخص التوزيع', requiresAuth: true, category: 'utility', checkType: 'json-required', requiredFields: ['distributionId'] },
  { name: 'auto-create-journal', description: 'إنشاء القيود تلقائياً', requiresAuth: true, category: 'utility', checkType: 'json-required', requiredFields: ['entryData'] },
  { name: 'generate-scheduled-report', description: 'التقارير المجدولة', requiresAuth: true, category: 'utility', checkType: 'ping' },
  { name: 'weekly-report', description: 'التقرير الأسبوعي', requiresAuth: true, category: 'utility', checkType: 'ping' },
  { name: 'publish-fiscal-year', description: 'نشر السنة المالية', requiresAuth: true, category: 'utility', checkType: 'json-required', requiredFields: ['fiscalYearId'] },
  { name: 'support-auto-escalate', description: 'تصعيد التذاكر تلقائياً', requiresAuth: true, category: 'utility', checkType: 'ping' },
  { name: 'zatca-submit', description: 'إرسال لـ ZATCA', requiresAuth: true, category: 'utility', checkType: 'ping' },
  { name: 'backfill-rental-documents', description: 'استكمال وثائق الإيجار', requiresAuth: true, category: 'utility', checkType: 'ping' },
];

// دالة توليد البيانات الوهمية للفحص
function generateDummyData(fields: string[]): Record<string, any> {
  const data: Record<string, any> = {};
  for (const field of fields) {
    switch (field) {
      case 'message':
      case 'query':
      case 'error':
        data[field] = 'health check test';
        break;
      case 'userId':
      case 'beneficiaryId':
      case 'fileId':
      case 'fixId':
      case 'invoiceId':
      case 'disclosureId':
      case 'distributionId':
      case 'fiscalYearId':
      case 'backupId':
        data[field] = '00000000-0000-0000-0000-000000000000';
        break;
      case 'title':
        data[field] = 'Health Check';
        break;
      case 'email':
      case 'newEmail':
        data[field] = 'test@healthcheck.local';
        break;
      case 'action':
        data[field] = 'check';
        break;
      case 'entryData':
        data[field] = { test: true };
        break;
      default:
        data[field] = 'test';
    }
  }
  return data;
}

/**
 * الحصول على سبب الحالة والتوصية
 */
export function getStatusDetails(result: HealthCheckResult, funcInfo?: EdgeFunctionInfo): { 
  reason: string; 
  recommendation: string 
} {
  // محمية (401/403)
  if (result.isProtected) {
    return {
      reason: 'الوظيفة تتطلب مصادقة JWT وترفض الطلبات غير المصرح بها - هذا سلوك طبيعي وآمن',
      recommendation: 'لا يلزم إجراء - الوظيفة تعمل بشكل صحيح وتحمي النظام من الوصول غير المصرح'
    };
  }
  
  // صحية
  if (result.success && (result.responseTime || 0) < 1000) {
    return {
      reason: 'الوظيفة تستجيب بسرعة وتعمل بشكل طبيعي',
      recommendation: 'لا يلزم إجراء - استمر في المراقبة الدورية'
    };
  }
  
  // بطيئة
  if (result.success && (result.responseTime || 0) >= 1000) {
    const time = result.responseTime || 0;
    if (time >= 5000) {
      return {
        reason: `زمن الاستجابة بطيء جداً (${time}ms) - قد يكون هناك مشكلة في الأداء أو cold start`,
        recommendation: 'راجع كود الوظيفة للتحسين - تحقق من استعلامات قاعدة البيانات وAPI calls الخارجية'
      };
    }
    return {
      reason: `زمن الاستجابة أعلى من المثالي (${time}ms) - قد يكون cold start أو حمل مؤقت`,
      recommendation: 'راقب الأداء - إذا استمر البطء، راجع الكود للتحسين'
    };
  }
  
  // معطلة
  if (!result.success) {
    const error = result.error || 'خطأ غير معروف';
    
    if (error.includes('500')) {
      return {
        reason: 'خطأ داخلي في الخادم (500) - مشكلة في كود الوظيفة',
        recommendation: 'راجع logs الوظيفة للعثور على الخطأ وإصلاحه'
      };
    }
    if (error.includes('502') || error.includes('503')) {
      return {
        reason: 'الوظيفة غير متاحة (502/503) - قد تكون معطلة أو في وضع الصيانة',
        recommendation: 'تأكد من نشر الوظيفة بشكل صحيح وأنها لا تحتوي على أخطاء syntax'
      };
    }
    if (error.includes('timeout') || error.includes('ETIMEDOUT')) {
      return {
        reason: 'انتهت مهلة الاتصال - الوظيفة لا تستجيب',
        recommendation: 'تحقق من أن الوظيفة لا تحتوي على infinite loops أو عمليات طويلة'
      };
    }
    if (error.includes('network') || error.includes('fetch') || error.includes('Failed')) {
      return {
        reason: 'مشكلة في الاتصال بالشبكة',
        recommendation: 'تأكد من اتصال الإنترنت وأن Supabase متاح'
      };
    }
    
    return {
      reason: `فشل الفحص: ${error}`,
      recommendation: 'راجع Edge Function logs للحصول على تفاصيل الخطأ'
    };
  }
  
  return {
    reason: 'لم يتم الفحص بعد',
    recommendation: 'اضغط على زر الفحص للتحقق من حالة الوظيفة'
  };
}

export class EdgeFunctionsHealthService {
  /**
   * فحص صحة Edge Function واحدة
   */
  static async checkFunction(functionName: string): Promise<HealthCheckResult> {
    const startTime = performance.now();
    const checkedAt = new Date().toISOString();
    const funcInfo = ALL_EDGE_FUNCTIONS.find(f => f.name === functionName);

    try {
      // ✅ FormData functions - فحص أساسي فقط
      if (funcInfo?.checkType === 'formdata') {
        try {
          const response = await fetch(
            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${functionName}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ping: true, healthCheck: true }),
            }
          );
          
          const responseTime = Math.round(performance.now() - startTime);
          
          // نقبل أي رد (حتى 400/401) كدليل على أن الوظيفة تعمل
          return {
            function: functionName,
            success: response.status !== 500 && response.status !== 502 && response.status !== 503,
            responseTime,
            checkedAt,
            note: 'FormData function - basic connectivity check',
            error: response.status >= 400 ? `HTTP ${response.status}` : undefined
          };
        } catch (err: any) {
          return {
            function: functionName,
            success: false,
            responseTime: Math.round(performance.now() - startTime),
            checkedAt,
            error: err.message
          };
        }
      }

      // ✅ JSON Required - إرسال بيانات وهمية مع ping
      let body: Record<string, any> = { ping: true, healthCheck: true };
      
      if (funcInfo?.checkType === 'json-required' && funcInfo.requiredFields) {
        body = { ...body, ...generateDummyData(funcInfo.requiredFields) };
      }
      
      // ✅ للوظائف المحمية - نستخدم fetch مباشرة للتحقق من 401/403
      if (funcInfo?.requiresAuth) {
        try {
          const response = await fetch(
            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${functionName}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(body),
            }
          );
          
          const responseTime = Math.round(performance.now() - startTime);
          
          // ✅ 401/403 للوظائف المحمية = الوظيفة تعمل! (ترفض غير المصرحين)
          if (response.status === 401 || response.status === 403) {
            const details = getStatusDetails({ 
              function: functionName, 
              success: true, 
              responseTime, 
              checkedAt,
              isProtected: true 
            }, funcInfo);
            
            return {
              function: functionName,
              success: true,
              responseTime,
              checkedAt,
              isProtected: true,
              note: 'protected',
              statusReason: details.reason,
              recommendation: details.recommendation
            };
          }
          
          // باقي الحالات
          const success = response.status < 500;
          const details = getStatusDetails({ 
            function: functionName, 
            success, 
            responseTime, 
            checkedAt,
            error: success ? undefined : `HTTP ${response.status}`
          }, funcInfo);
          
          return {
            function: functionName,
            success,
            responseTime,
            checkedAt,
            error: success ? undefined : `HTTP ${response.status}`,
            statusReason: details.reason,
            recommendation: details.recommendation
          };
        } catch (err: any) {
          const responseTime = Math.round(performance.now() - startTime);
          const details = getStatusDetails({ 
            function: functionName, 
            success: false, 
            responseTime, 
            checkedAt,
            error: err.message
          }, funcInfo);
          
          return {
            function: functionName,
            success: false,
            responseTime,
            checkedAt,
            error: err.message,
            statusReason: details.reason,
            recommendation: details.recommendation
          };
        }
      }

      // للـ functions التي لا تتطلب مصادقة، نستخدم fetch مباشرة
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${functionName}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        }
      );

      const responseTime = Math.round(performance.now() - startTime);
      const success = response.ok || response.status === 400;
      
      const details = getStatusDetails({ 
        function: functionName, 
        success, 
        responseTime, 
        checkedAt,
        error: response.ok ? undefined : `HTTP ${response.status}`
      }, funcInfo);
      
      return {
        function: functionName,
        success,
        responseTime,
        checkedAt,
        error: response.ok ? undefined : `HTTP ${response.status}`,
        statusReason: details.reason,
        recommendation: details.recommendation
      };
    } catch (err: any) {
      const responseTime = Math.round(performance.now() - startTime);
      const details = getStatusDetails({ 
        function: functionName, 
        success: false, 
        responseTime, 
        checkedAt,
        error: err.message
      }, funcInfo);
      
      return {
        function: functionName,
        success: false,
        responseTime,
        checkedAt,
        error: err.message,
        statusReason: details.reason,
        recommendation: details.recommendation
      };
    }
  }

  /**
   * فحص صحة مجموعة من Edge Functions
   */
  static async checkMultipleFunctions(functionNames: string[]): Promise<HealthCheckResult[]> {
    const results = await Promise.all(
      functionNames.map(name => this.checkFunction(name))
    );
    return results;
  }

  /**
   * فحص جميع Edge Functions
   */
  static async checkAllFunctions(): Promise<HealthCheckResult[]> {
    const functionNames = ALL_EDGE_FUNCTIONS.map(f => f.name);
    return this.checkMultipleFunctions(functionNames);
  }

  /**
   * فحص Edge Functions حسب الفئة
   */
  static async checkByCategory(category: EdgeFunctionInfo['category']): Promise<HealthCheckResult[]> {
    const functions = ALL_EDGE_FUNCTIONS.filter(f => f.category === category);
    return this.checkMultipleFunctions(functions.map(f => f.name));
  }

  /**
   * فحص Edge Functions حسب نوع الفحص
   */
  static async checkByCheckType(checkType: CheckType): Promise<HealthCheckResult[]> {
    const functions = ALL_EDGE_FUNCTIONS.filter(f => f.checkType === checkType);
    return this.checkMultipleFunctions(functions.map(f => f.name));
  }

  /**
   * الحصول على ملخص الصحة
   */
  static calculateHealthSummary(results: HealthCheckResult[]): {
    total: number;
    healthy: number;
    degraded: number;
    unhealthy: number;
    protected: number;
    avgResponseTime: number;
  } {
    const protectedCount = results.filter(r => r.isProtected).length;
    const healthy = results.filter(r => r.success && !r.isProtected && (r.responseTime || 0) < 1000).length;
    const degraded = results.filter(r => r.success && !r.isProtected && (r.responseTime || 0) >= 1000).length;
    const unhealthy = results.filter(r => !r.success).length;
    
    const successfulResults = results.filter(r => r.success);
    const avgResponseTime = successfulResults.length > 0
      ? Math.round(successfulResults.reduce((sum, r) => sum + (r.responseTime || 0), 0) / successfulResults.length)
      : 0;

    return {
      total: results.length,
      healthy,
      degraded,
      unhealthy,
      protected: protectedCount,
      avgResponseTime
    };
  }

  /**
   * تحويل نتيجة الفحص إلى حالة صحية
   */
  static resultToHealth(result: HealthCheckResult): EdgeFunctionHealth {
    const funcInfo = ALL_EDGE_FUNCTIONS.find(f => f.name === result.function);
    let status: EdgeFunctionHealth['status'] = 'unknown';
    
    if (result.isProtected || result.note === 'protected') {
      status = 'protected';
    } else if (result.success) {
      status = (result.responseTime || 0) < 1000 ? 'healthy' : 'degraded';
    } else {
      status = 'unhealthy';
    }

    // حساب السبب والتوصية
    const details = getStatusDetails(result, funcInfo);

    return {
      name: result.function,
      status,
      responseTime: result.responseTime,
      lastChecked: result.checkedAt,
      lastError: result.error,
      consecutiveFailures: result.success ? 0 : 1,
      isProtected: result.isProtected,
      statusReason: result.statusReason || details.reason,
      recommendation: result.recommendation || details.recommendation
    };
  }

  /**
   * الحصول على الوظائف حسب نوع الفحص
   */
  static getFunctionsByCheckType(): Record<CheckType, EdgeFunctionInfo[]> {
    return {
      ping: ALL_EDGE_FUNCTIONS.filter(f => f.checkType === 'ping'),
      'json-required': ALL_EDGE_FUNCTIONS.filter(f => f.checkType === 'json-required'),
      formdata: ALL_EDGE_FUNCTIONS.filter(f => f.checkType === 'formdata'),
    };
  }
}
