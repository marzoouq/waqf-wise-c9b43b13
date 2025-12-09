/**
 * Scheduled Report Service - خدمة التقارير المجدولة
 * @version 2.8.52
 */

import { supabase } from "@/integrations/supabase/client";

export interface ScheduledReport {
  id: string;
  report_template_id: string;
  schedule_type: 'daily' | 'weekly' | 'monthly' | 'custom';
  cron_expression?: string;
  recipients: Array<{ user_id: string; email: string }>;
  delivery_method: 'email' | 'storage' | 'both';
  last_run_at?: string;
  next_run_at?: string;
  is_active: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
  report_template?: {
    id: string;
    name?: string;
    description?: string;
  };
}

export class ScheduledReportService {
  /**
   * جلب جميع التقارير المجدولة
   */
  static async getAll(): Promise<ScheduledReport[]> {
    const { data, error } = await supabase
      .from('scheduled_report_jobs')
      .select(`
        *,
        report_template:report_template_id(*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(item => ({
      ...item,
      recipients: item.recipients as Array<{ user_id: string; email: string }>
    })) as ScheduledReport[];
  }

  /**
   * إنشاء تقرير مجدول
   */
  static async create(
    report: Omit<ScheduledReport, 'id' | 'created_at' | 'updated_at' | 'created_by'>
  ): Promise<ScheduledReport> {
    const { data: { user } } = await supabase.auth.getUser();
    const nextRun = this.calculateNextRun(report.schedule_type);

    const { data, error } = await supabase
      .from('scheduled_report_jobs')
      .insert({
        ...report,
        created_by: user?.id,
        next_run_at: nextRun,
      })
      .select()
      .single();

    if (error) throw error;
    return data as ScheduledReport;
  }

  /**
   * تحديث تقرير مجدول
   */
  static async update(id: string, updates: Partial<ScheduledReport>): Promise<ScheduledReport> {
    const { data, error } = await supabase
      .from('scheduled_report_jobs')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as ScheduledReport;
  }

  /**
   * حذف تقرير مجدول
   */
  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('scheduled_report_jobs')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  /**
   * تشغيل تقرير مجدول
   */
  static async trigger(reportId: string): Promise<unknown> {
    const { data, error } = await supabase.functions.invoke('generate-scheduled-report', {
      body: { reportId }
    });

    if (error) throw error;
    return data;
  }

  /**
   * حساب موعد التشغيل التالي
   */
  private static calculateNextRun(scheduleType: string): string {
    const now = new Date();

    switch (scheduleType) {
      case 'daily':
        now.setDate(now.getDate() + 1);
        break;
      case 'weekly':
        now.setDate(now.getDate() + 7);
        break;
      case 'monthly':
        now.setMonth(now.getMonth() + 1);
        break;
      default:
        now.setDate(now.getDate() + 1);
    }

    return now.toISOString();
  }
}
