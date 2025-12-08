/**
 * Monitoring Service - خدمة المراقبة
 * @version 2.8.28
 */

import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type SystemErrorRow = Database['public']['Tables']['system_error_logs']['Row'];

export interface SystemStats {
  totalErrors: number;
  unresolvedErrors: number;
  criticalErrors: number;
  activeAlerts: number;
  healthyChecks: number;
  totalHealthChecks: number;
  successfulFixes: number;
  totalFixAttempts: number;
}

export class MonitoringService {
  /**
   * جلب إحصائيات النظام
   */
  static async getSystemStats(): Promise<SystemStats> {
    const [errorsResult, alertsResult, healthResult] = await Promise.all([
      supabase
        .from("system_error_logs")
        .select("id, severity, status", { count: "exact" }),
      supabase
        .from("system_alerts")
        .select("id, severity, status", { count: "exact" }),
      supabase
        .from("system_health_checks")
        .select("id, status", { count: "exact" })
        .order("checked_at", { ascending: false })
        .limit(100),
    ]);

    const resolvedErrors =
      errorsResult.data?.filter(
        (e) => e.status === "resolved" || e.status === "auto_resolved"
      ).length || 0;

    return {
      totalErrors: errorsResult.count || 0,
      unresolvedErrors:
        errorsResult.data?.filter((e) => e.status === "new").length || 0,
      criticalErrors:
        errorsResult.data?.filter((e) => e.severity === "critical").length || 0,
      activeAlerts:
        alertsResult.data?.filter((a) => a.status === "active").length || 0,
      healthyChecks:
        healthResult.data?.filter((h) => h.status === "healthy").length || 0,
      totalHealthChecks: healthResult.count || 0,
      successfulFixes: resolvedErrors,
      totalFixAttempts: resolvedErrors > 0 ? resolvedErrors : 1,
    };
  }

  /**
   * جلب الأخطاء الأخيرة
   */
  static async getRecentErrors(limit = 10): Promise<SystemErrorRow[]> {
    const { data, error } = await supabase
      .from("system_error_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  /**
   * جلب التنبيهات النشطة
   */
  static async getActiveAlerts() {
    const { data, error } = await supabase
      .from("system_alerts")
      .select("*")
      .eq("status", "active")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * جلب سجلات الأخطاء
   */
  static async getErrorLogs(limit = 100): Promise<SystemErrorRow[]> {
    const { data, error } = await supabase
      .from("system_error_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  /**
   * حذف الأخطاء المحلولة
   */
  static async deleteResolvedErrors(): Promise<void> {
    const { error } = await supabase
      .from("system_error_logs")
      .delete()
      .eq("status", "resolved");

    if (error) throw error;
  }

  /**
   * تحديث حالة الخطأ
   */
  static async updateError(id: string, status: string, notes?: string): Promise<void> {
    const { error } = await supabase
      .from("system_error_logs")
      .update({
        status,
        resolved_at: status === "resolved" ? new Date().toISOString() : null,
        resolution_notes: notes,
      })
      .eq("id", id);

    if (error) throw error;
  }

  /**
   * حل تنبيه
   */
  static async resolveAlert(alertId: string): Promise<void> {
    const { error } = await supabase
      .from("system_alerts")
      .update({ status: "resolved", resolved_at: new Date().toISOString() })
      .eq("id", alertId);

    if (error) throw error;
  }

  /**
   * جلب بيانات أداء النظام
   */
  static async getPerformanceMetrics(since: Date) {
    const { data, error } = await supabase
      .from("audit_logs")
      .select("created_at, action_type")
      .gte("created_at", since.toISOString())
      .order("created_at", { ascending: true });

    if (error) throw error;
    return data || [];
  }

  /**
   * جلب نشاط المستخدمين
   */
  static async getUserActivityMetrics(since: Date) {
    const [loginAttemptsResponse, newProfilesResponse, activitiesResponse] = await Promise.all([
      supabase
        .from("login_attempts_log")
        .select("created_at, success, user_email")
        .gte("created_at", since.toISOString())
        .order("created_at", { ascending: true }),
      supabase
        .from("profiles")
        .select("created_at")
        .gte("created_at", since.toISOString()),
      supabase
        .from("activities")
        .select("timestamp, user_name")
        .gte("timestamp", since.toISOString()),
    ]);

    return {
      loginAttempts: loginAttemptsResponse.data || [],
      newProfiles: newProfilesResponse.data || [],
      activities: activitiesResponse.data || [],
    };
  }
}
