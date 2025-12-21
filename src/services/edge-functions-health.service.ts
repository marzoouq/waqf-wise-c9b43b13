/**
 * Edge Functions Health Service - خدمة مراقبة صحة Edge Functions
 */

import { supabase } from '@/integrations/supabase/client';

export interface EdgeFunctionInfo {
  name: string;
  description: string;
  requiresAuth: boolean;
  category: 'ai' | 'database' | 'notification' | 'backup' | 'security' | 'utility';
}

export interface EdgeFunctionHealth {
  name: string;
  status: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
  responseTime?: number;
  lastChecked?: string;
  lastError?: string;
  consecutiveFailures: number;
}

export interface HealthCheckResult {
  function: string;
  success: boolean;
  responseTime: number;
  error?: string;
  checkedAt: string;
}

// قائمة جميع Edge Functions في النظام
export const ALL_EDGE_FUNCTIONS: EdgeFunctionInfo[] = [
  // AI Functions
  { name: 'ai-system-audit', description: 'الفحص الذكي للنظام', requiresAuth: true, category: 'ai' },
  { name: 'chatbot', description: 'المساعد الذكي', requiresAuth: true, category: 'ai' },
  { name: 'generate-ai-insights', description: 'توليد الرؤى الذكية', requiresAuth: true, category: 'ai' },
  { name: 'generate-smart-alerts', description: 'توليد التنبيهات الذكية', requiresAuth: true, category: 'ai' },
  { name: 'intelligent-search', description: 'البحث الذكي', requiresAuth: true, category: 'ai' },
  { name: 'property-ai-assistant', description: 'مساعد العقارات الذكي', requiresAuth: true, category: 'ai' },
  { name: 'ocr-document', description: 'التعرف على النصوص', requiresAuth: true, category: 'ai' },
  { name: 'extract-invoice-data', description: 'استخراج بيانات الفاتورة', requiresAuth: true, category: 'ai' },
  { name: 'auto-classify-document', description: 'تصنيف المستندات تلقائياً', requiresAuth: true, category: 'ai' },
  
  // Database Functions
  { name: 'db-health-check', description: 'فحص صحة قاعدة البيانات', requiresAuth: false, category: 'database' },
  { name: 'db-performance-stats', description: 'إحصائيات الأداء', requiresAuth: false, category: 'database' },
  { name: 'run-vacuum', description: 'تنظيف قاعدة البيانات', requiresAuth: false, category: 'database' },
  { name: 'weekly-maintenance', description: 'الصيانة الأسبوعية', requiresAuth: false, category: 'database' },
  
  // Backup Functions
  { name: 'backup-database', description: 'نسخ قاعدة البيانات', requiresAuth: true, category: 'backup' },
  { name: 'restore-database', description: 'استعادة قاعدة البيانات', requiresAuth: true, category: 'backup' },
  { name: 'enhanced-backup', description: 'النسخ المحسن', requiresAuth: true, category: 'backup' },
  { name: 'daily-backup', description: 'النسخ اليومي', requiresAuth: true, category: 'backup' },
  
  // Notification Functions
  { name: 'send-notification', description: 'إرسال إشعار', requiresAuth: true, category: 'notification' },
  { name: 'send-push-notification', description: 'إشعار فوري', requiresAuth: true, category: 'notification' },
  { name: 'send-slack-alert', description: 'تنبيه Slack', requiresAuth: true, category: 'notification' },
  { name: 'send-invoice-email', description: 'إرسال فاتورة بالبريد', requiresAuth: true, category: 'notification' },
  { name: 'notify-admins', description: 'إشعار المديرين', requiresAuth: true, category: 'notification' },
  { name: 'notify-disclosure-published', description: 'إشعار نشر الإفصاح', requiresAuth: true, category: 'notification' },
  { name: 'daily-notifications', description: 'الإشعارات اليومية', requiresAuth: true, category: 'notification' },
  { name: 'daily-notifications-full', description: 'الإشعارات اليومية الكاملة', requiresAuth: true, category: 'notification' },
  { name: 'contract-renewal-alerts', description: 'تنبيهات تجديد العقود', requiresAuth: false, category: 'notification' },
  
  // Security Functions
  { name: 'check-leaked-password', description: 'فحص كلمات المرور المسربة', requiresAuth: true, category: 'security' },
  { name: 'biometric-auth', description: 'المصادقة البيومترية', requiresAuth: false, category: 'security' },
  { name: 'encrypt-file', description: 'تشفير الملفات', requiresAuth: true, category: 'security' },
  { name: 'decrypt-file', description: 'فك تشفير الملفات', requiresAuth: true, category: 'security' },
  { name: 'secure-delete-file', description: 'حذف آمن للملفات', requiresAuth: true, category: 'security' },
  { name: 'cleanup-old-files', description: 'تنظيف الملفات القديمة', requiresAuth: true, category: 'security' },
  { name: 'cleanup-sensitive-files', description: 'تنظيف الملفات الحساسة', requiresAuth: true, category: 'security' },
  { name: 'scheduled-cleanup', description: 'التنظيف المجدول', requiresAuth: true, category: 'security' },
  
  // Utility Functions
  { name: 'log-error', description: 'تسجيل الأخطاء', requiresAuth: false, category: 'utility' },
  { name: 'execute-auto-fix', description: 'تنفيذ الإصلاح التلقائي', requiresAuth: true, category: 'utility' },
  { name: 'admin-manage-beneficiary-password', description: 'إدارة كلمات مرور المستفيدين', requiresAuth: true, category: 'utility' },
  { name: 'reset-user-password', description: 'إعادة تعيين كلمة المرور', requiresAuth: true, category: 'utility' },
  { name: 'update-user-email', description: 'تحديث البريد الإلكتروني', requiresAuth: true, category: 'utility' },
  { name: 'create-beneficiary-accounts', description: 'إنشاء حسابات المستفيدين', requiresAuth: true, category: 'utility' },
  { name: 'simulate-distribution', description: 'محاكاة التوزيع', requiresAuth: true, category: 'utility' },
  { name: 'distribute-revenue', description: 'توزيع الإيرادات', requiresAuth: true, category: 'utility' },
  { name: 'generate-distribution-summary', description: 'ملخص التوزيع', requiresAuth: true, category: 'utility' },
  { name: 'auto-create-journal', description: 'إنشاء القيود تلقائياً', requiresAuth: true, category: 'utility' },
  { name: 'generate-scheduled-report', description: 'التقارير المجدولة', requiresAuth: true, category: 'utility' },
  { name: 'weekly-report', description: 'التقرير الأسبوعي', requiresAuth: true, category: 'utility' },
  { name: 'publish-fiscal-year', description: 'نشر السنة المالية', requiresAuth: true, category: 'utility' },
  { name: 'support-auto-escalate', description: 'تصعيد التذاكر تلقائياً', requiresAuth: true, category: 'utility' },
  { name: 'zatca-submit', description: 'إرسال لـ ZATCA', requiresAuth: true, category: 'utility' },
  { name: 'backfill-rental-documents', description: 'استكمال وثائق الإيجار', requiresAuth: true, category: 'utility' },
];

export class EdgeFunctionsHealthService {
  /**
   * فحص صحة Edge Function واحدة
   */
  static async checkFunction(functionName: string): Promise<HealthCheckResult> {
    const startTime = performance.now();
    const checkedAt = new Date().toISOString();

    try {
      // للـ functions التي لا تتطلب مصادقة، نستخدم fetch مباشرة
      const funcInfo = ALL_EDGE_FUNCTIONS.find(f => f.name === functionName);
      
      if (!funcInfo?.requiresAuth) {
        // استخدام ping بسيط
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${functionName}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ping: true }),
          }
        );

        const responseTime = Math.round(performance.now() - startTime);
        
        return {
          function: functionName,
          success: response.ok || response.status === 400, // 400 يعني الـ function تعمل لكن البيانات خاطئة
          responseTime,
          checkedAt,
          error: response.ok ? undefined : `HTTP ${response.status}`
        };
      }

      // للـ functions التي تتطلب مصادقة
      const { data, error } = await supabase.functions.invoke(functionName, {
        body: { ping: true, healthCheck: true }
      });

      const responseTime = Math.round(performance.now() - startTime);

      return {
        function: functionName,
        success: !error,
        responseTime,
        checkedAt,
        error: error?.message
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
   * الحصول على ملخص الصحة
   */
  static calculateHealthSummary(results: HealthCheckResult[]): {
    total: number;
    healthy: number;
    degraded: number;
    unhealthy: number;
    avgResponseTime: number;
  } {
    const healthy = results.filter(r => r.success && (r.responseTime || 0) < 1000).length;
    const degraded = results.filter(r => r.success && (r.responseTime || 0) >= 1000).length;
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
      avgResponseTime
    };
  }

  /**
   * تحويل نتيجة الفحص إلى حالة صحية
   */
  static resultToHealth(result: HealthCheckResult): EdgeFunctionHealth {
    let status: EdgeFunctionHealth['status'] = 'unknown';
    
    if (result.success) {
      status = (result.responseTime || 0) < 1000 ? 'healthy' : 'degraded';
    } else {
      status = 'unhealthy';
    }

    return {
      name: result.function,
      status,
      responseTime: result.responseTime,
      lastChecked: result.checkedAt,
      lastError: result.error,
      consecutiveFailures: result.success ? 0 : 1
    };
  }
}
