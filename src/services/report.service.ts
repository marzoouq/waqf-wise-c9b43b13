import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";
import type { ReportTemplate, ReportData, ReportFilters } from "@/types/reports/index";

export type { ReportTemplate };

/**
 * خدمة إدارة التقارير المخصصة
 */
export class ReportService {
  /**
   * إنشاء قالب تقرير جديد
   */
  static async createTemplate(template: ReportTemplate) {
    try {
      const { data, error } = await supabase
        .from("report_templates")
        .insert([template])
        .select()
        .single();

      if (error) throw error;

      await this.logActivity(`تم إنشاء قالب تقرير: ${template.template_name}`);

      return {
        success: true,
        data,
      };
    } catch (error) {
      logger.error(error, {
        context: "create_report_template",
        severity: "medium",
      });
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

      return {
        success: true,
        templates: data || [],
      };
    } catch (error) {
      logger.error(error, {
        context: "get_report_templates",
        severity: "low",
      });
      throw error;
    }
  }

  /**
   * توليد تقرير من قالب
   */
  static async generateReport(templateId: string, customFilters?: ReportFilters) {
    try {
      // الحصول على القالب
      const { data: template, error: templateError } = await supabase
        .from("report_templates")
        .select("*")
        .eq("id", templateId)
        .single();

      if (templateError) throw templateError;

      // توليد البيانات حسب نوع التقرير
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
      logger.error(error, {
        context: "generate_report",
        severity: "medium",
      });
      throw error;
    }
  }

  /**
   * حذف قالب تقرير
   */
  static async deleteTemplate(templateId: string) {
    try {
      const { error } = await supabase
        .from("report_templates")
        .delete()
        .eq("id", templateId);

      if (error) throw error;

      await this.logActivity(`تم حذف قالب تقرير`);

      return {
        success: true,
      };
    } catch (error) {
      logger.error(error, {
        context: "delete_report_template",
        severity: "medium",
      });
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
      logger.error(error, {
        context: "log_report_activity",
        severity: "low",
      });
    }
  }
}
