/**
 * Report Template Service - خدمة قوالب التقارير
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";
import type { ReportTemplate, ReportData, ReportFilters } from "@/types/reports/index";
import type { Json } from "@/integrations/supabase/types";

export class ReportTemplateService {
  /**
   * إنشاء قالب تقرير جديد
   */
  static async createTemplate(template: ReportTemplate) {
    try {
      const { data, error } = await supabase
        .from("report_templates")
        .insert([template])
        .select()
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error('فشل إنشاء قالب التقرير');

      await this.logActivity(`تم إنشاء قالب تقرير: ${template.template_name}`);

      return { success: true, data };
    } catch (error) {
      logger.error(error, { context: "create_report_template", severity: "medium" });
      throw error;
    }
  }

  /**
   * الحصول على جميع قوالب التقارير
   */
  static async getTemplates(type?: string) {
    try {
      let query = supabase
        .from("report_templates")
        .select("*")
        .order("created_at", { ascending: false });

      if (type) {
        query = query.eq("report_type", type);
      }

      const { data, error } = await query;

      if (error) throw error;

      return { success: true, templates: data || [] };
    } catch (error) {
      logger.error(error, { context: "get_report_templates", severity: "low" });
      throw error;
    }
  }

  /**
   * توليد تقرير من قالب
   */
  static async generateReport(templateId: string, _customFilters?: ReportFilters) {
    try {
      const { data: template, error: templateError } = await supabase
        .from("report_templates")
        .select("*")
        .eq("id", templateId)
        .maybeSingle();

      if (templateError) throw templateError;
      if (!template) throw new Error("قالب التقرير غير موجود");

      let reportData: ReportData[] = [];
      
      switch (template.report_type) {
        case "distributions":
          const { data: distributions } = await supabase
            .from("distributions")
            .select("*")
            .order("distribution_date", { ascending: false })
            .limit(100);
          reportData = distributions || [];
          break;

        case "beneficiaries":
          const { data: beneficiaries } = await supabase
            .from("beneficiaries")
            .select("*")
            .eq("status", "نشط")
            .order("full_name");
          reportData = beneficiaries || [];
          break;

        case "financial":
          const { data: entries } = await supabase
            .from("journal_entries")
            .select("*")
            .order("entry_date", { ascending: false })
            .limit(100);
          reportData = entries || [];
          break;

        default:
          throw new Error(`نوع تقرير غير مدعوم: ${template.report_type}`);
      }

      await this.logActivity(`تم توليد تقرير: ${template.template_name}`);

      return {
        success: true,
        template,
        data: reportData,
        generatedAt: new Date().toISOString(),
      };
    } catch (error) {
      logger.error(error, { context: "generate_report", severity: "medium" });
      throw error;
    }
  }

  /**
   * حذف قالب تقرير (Soft Delete)
   * ⚠️ الحذف الفيزيائي ممنوع
   */
  static async deleteTemplate(templateId: string, reason: string = 'تم الإلغاء') {
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from("report_templates")
        .update({
          deleted_at: new Date().toISOString(),
          deleted_by: userData?.user?.id || null,
          deletion_reason: reason,
        })
        .eq("id", templateId);

      if (error) throw error;

      await this.logActivity(`تم أرشفة قالب تقرير`);

      return { success: true };
    } catch (error) {
      logger.error(error, { context: "delete_report_template", severity: "medium" });
      throw error;
    }
  }

  /**
   * حفظ تقرير مخصص
   */
  static async saveCustomReport(data: {
    name: string;
    type: string;
    filters: Record<string, unknown>;
    columns: string[];
  }): Promise<{ success: boolean }> {
    try {
      const { error } = await supabase.from('report_templates').insert([{
        template_name: data.name,
        report_type: data.type,
        columns: data.columns,
        filters: data.filters as unknown as Json,
        is_public: false,
      }]);

      if (error) throw error;

      await this.logActivity(`تم حفظ تقرير مخصص: ${data.name}`);

      return { success: true };
    } catch (error) {
      logger.error(error, { context: 'save_custom_report', severity: 'medium' });
      throw error;
    }
  }

  /**
   * جلب التقارير المجدولة
   */
  static async getScheduledReports(): Promise<{ id: string; name: string; schedule: string; next_run: string }[]> {
    try {
      const { data, error } = await supabase
        .from('report_templates')
        .select('id, template_name, created_at')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      
      return (data || []).map(r => ({
        id: r.id,
        name: r.template_name,
        schedule: 'يومي',
        next_run: new Date().toISOString(),
      }));
    } catch (error) {
      logger.error(error, { context: 'get_scheduled_reports', severity: 'low' });
      throw error;
    }
  }

  /**
   * تسجيل نشاط
   */
  private static async logActivity(action: string) {
    try {
      await supabase.from("activities").insert([
        {
          user_name: "النظام",
          action,
          timestamp: new Date().toISOString(),
        },
      ]);
    } catch (error) {
      logger.error(error, { context: "log_report_activity", severity: "low" });
    }
  }
}
