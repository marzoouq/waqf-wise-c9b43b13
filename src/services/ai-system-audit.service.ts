/**
 * AI System Audit Service - خدمة الفحص الذكي للنظام
 */

import { supabase } from '@/integrations/supabase/client';

export interface AuditFinding {
  id: string;
  category: string;
  categoryLabel: string;
  severity: 'critical' | 'warning' | 'info' | 'success';
  title: string;
  description: string;
  suggestion?: string;
  fixSql?: string;
  rollbackSql?: string;
  autoFixable: boolean;
  fixed: boolean;
}

export interface SeveritySummary {
  critical: number;
  warning: number;
  info: number;
  success: number;
}

export interface SystemAudit {
  id: string;
  audit_type: 'full' | 'category' | 'scheduled';
  categories: string[];
  findings: AuditFinding[];
  auto_fixes_applied: any[];
  pending_fixes: string[];
  ai_analysis: string | null;
  severity_summary: SeveritySummary;
  slack_notified: boolean;
  total_issues: number;
  fixed_issues: number;
  created_by: string | null;
  created_at: string;
  completed_at: string | null;
}

export interface PendingFix {
  id: string;
  audit_id: string;
  fix_type: string;
  category: string;
  fix_sql: string;
  description: string | null;
  severity: 'critical' | 'warning' | 'info';
  auto_fixable: boolean;
  status: 'pending' | 'approved' | 'applied' | 'rejected' | 'rolled_back';
  rollback_sql: string | null;
  error_message: string | null;
  approved_by: string | null;
  applied_at: string | null;
  rolled_back_at: string | null;
  created_at: string;
}

export const AUDIT_CATEGORIES = [
  { id: 'architecture', label: 'البنية والمعمارية', icon: 'Building2' },
  { id: 'performance', label: 'الأداء', icon: 'Gauge' },
  { id: 'components', label: 'المكونات', icon: 'Component' },
  { id: 'functions', label: 'الوظائف', icon: 'Function' },
  { id: 'buttons', label: 'الأزرار', icon: 'MousePointer' },
  { id: 'dashboards', label: 'لوحات التحكم', icon: 'LayoutDashboard' },
  { id: 'roles', label: 'الأدوار والصلاحيات', icon: 'Shield' },
  { id: 'navigation', label: 'التنقلات', icon: 'Navigation' },
  { id: 'tables', label: 'الجداول', icon: 'Table' },
  { id: 'database', label: 'قاعدة البيانات', icon: 'Database' },
  { id: 'tabs', label: 'التبويبات', icon: 'Tabs' }
] as const;

export class AISystemAuditService {
  /**
   * تشغيل فحص ذكي جديد
   */
  static async runAudit(
    auditType: 'full' | 'category' = 'full',
    categories?: string[]
  ): Promise<{ success: boolean; auditId?: string; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase.functions.invoke('ai-system-audit', {
        body: {
          auditType,
          categories: categories || AUDIT_CATEGORIES.map(c => c.id),
          userId: user?.id
        }
      });

      if (error) throw error;

      return { success: true, auditId: data.auditId };
    } catch (error: any) {
      console.error('[AISystemAudit] Error running audit:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * جلب تقارير الفحص
   */
  static async getAudits(limit = 20): Promise<SystemAudit[]> {
    const { data, error } = await supabase
      .from('ai_system_audits')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data || []) as unknown as SystemAudit[];
  }

  /**
   * جلب تقرير فحص محدد
   */
  static async getAudit(auditId: string): Promise<SystemAudit | null> {
    const { data, error } = await supabase
      .from('ai_system_audits')
      .select('*')
      .eq('id', auditId)
      .single();

    if (error) throw error;
    return data as unknown as SystemAudit;
  }

  /**
   * جلب الإصلاحات المعلقة
   */
  static async getPendingFixes(auditId?: string): Promise<PendingFix[]> {
    let query = supabase
      .from('pending_system_fixes')
      .select('*')
      .eq('status', 'pending')
      .order('severity', { ascending: true });

    if (auditId) {
      query = query.eq('audit_id', auditId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data || []) as unknown as PendingFix[];
  }

  /**
   * الموافقة على إصلاح وتطبيقه
   */
  static async approveFix(fixId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      // تحديث حالة الإصلاح
      const { data: fix, error: fetchError } = await supabase
        .from('pending_system_fixes')
        .select('*')
        .eq('id', fixId)
        .single();

      if (fetchError) throw fetchError;

      // تنفيذ الإصلاح (ملاحظة: هذا يحتاج RPC function في الـ database)
      // في الوقت الحالي نحدث الحالة فقط
      const { error: updateError } = await supabase
        .from('pending_system_fixes')
        .update({
          status: 'applied',
          approved_by: user?.id,
          applied_at: new Date().toISOString()
        })
        .eq('id', fixId);

      if (updateError) throw updateError;

      return { success: true };
    } catch (error: any) {
      console.error('[AISystemAudit] Error approving fix:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * رفض إصلاح
   */
  static async rejectFix(fixId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase
        .from('pending_system_fixes')
        .update({
          status: 'rejected',
          approved_by: user?.id
        })
        .eq('id', fixId);

      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * التراجع عن إصلاح
   */
  static async rollbackFix(fixId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: fix, error: fetchError } = await supabase
        .from('pending_system_fixes')
        .select('*')
        .eq('id', fixId)
        .single();

      if (fetchError) throw fetchError;

      if (!fix || !(fix as unknown as PendingFix).rollback_sql) {
        return { success: false, error: 'لا يوجد كود تراجع لهذا الإصلاح' };
      }

      // تحديث الحالة
      const { error: updateError } = await supabase
        .from('pending_system_fixes')
        .update({
          status: 'rolled_back',
          rolled_back_at: new Date().toISOString()
        })
        .eq('id', fixId);

      if (updateError) throw updateError;

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * إرسال تنبيه Slack
   */
  static async sendSlackAlert(
    title: string,
    message: string,
    severity: 'critical' | 'warning' | 'info' | 'success',
    fields?: { label: string; value: string }[],
    actionUrl?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await supabase.functions.invoke('send-slack-alert', {
        body: { title, message, severity, fields, actionUrl }
      });

      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * حذف تقرير فحص
   */
  static async deleteAudit(auditId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('ai_system_audits')
        .delete()
        .eq('id', auditId);

      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}
