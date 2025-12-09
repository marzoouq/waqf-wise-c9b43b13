/**
 * System Service - خدمة النظام والإعدادات
 * @version 2.8.25
 */

import { supabase } from "@/integrations/supabase/client";

export interface SystemSetting {
  id: string;
  setting_key: string;
  setting_value: string;
  setting_type?: string;
  category?: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface SystemHealth {
  database: {
    status: 'healthy' | 'degraded' | 'down';
    responseTime: number;
    connections: number;
  };
  storage: {
    status: 'healthy' | 'degraded' | 'down';
    usedSpace: number;
    totalSpace: number;
  };
  uptime: {
    days: number;
    hours: number;
    minutes: number;
  };
  performance: {
    avgResponseTime: number;
    requestsPerMinute: number;
  };
}

export interface SecurityAlert {
  id: string;
  type: 'failed_login' | 'permission_change' | 'suspicious_activity' | 'data_breach';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  user_email?: string;
  ip_address?: string;
  timestamp: string;
  status: 'new' | 'investigating' | 'resolved';
}

export interface BackupLog {
  id: string;
  backup_type: string;
  status: string;
  file_path?: string;
  file_size?: number;
  tables_included?: string[];
  started_at?: string;
  completed_at?: string;
  error_message?: string;
  created_at: string;
}

export interface BackupSchedule {
  id: string;
  schedule_name: string;
  backup_type: string;
  frequency: string;
  tables_included: string[];
  retention_days?: number;
  is_active: boolean;
  include_storage?: boolean;
  last_backup_at?: string;
  next_backup_at?: string;
  created_at: string;
  updated_at: string;
}

export class SystemService {
  /**
   * جلب جميع إعدادات النظام
   */
  static async getSettings(): Promise<SystemSetting[]> {
    const { data, error } = await supabase
      .from("system_settings")
      .select("*")
      .order("setting_key");

    if (error) throw error;
    return (data || []) as unknown as SystemSetting[];
  }

  /**
   * تحديث إعداد
   */
  static async updateSetting(key: string, value: string): Promise<void> {
    const { error } = await supabase
      .from("system_settings")
      .update({ setting_value: value, updated_at: new Date().toISOString() })
      .eq("setting_key", key);

    if (error) throw error;
  }

  /**
   * فحص صحة النظام
   */
  static async getSystemHealth(): Promise<SystemHealth> {
    const startTime = Date.now();
    
    const [dbTestResult, storageResult, healthChecksResult] = await Promise.all([
      supabase.from("activities").select("id").limit(1),
      supabase.from("beneficiary_attachments").select("file_size"),
      supabase
        .from("system_health_checks")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

    const responseTime = Date.now() - startTime;
    const dbError = dbTestResult.error;
    const storageData = storageResult.data;
    const healthCheck = healthChecksResult.data;

    const totalUsed = storageData?.reduce((sum, file) => sum + (file.file_size || 0), 0) || 0;

    let uptimeDays = 0, uptimeHours = 0, uptimeMinutes = 0;
    if (healthCheck?.created_at) {
      const firstCheckTime = new Date(healthCheck.created_at);
      const now = new Date();
      const diffMs = now.getTime() - firstCheckTime.getTime();
      const diffMinutes = Math.floor(diffMs / 60000);
      uptimeDays = Math.floor(diffMinutes / 1440);
      uptimeHours = Math.floor((diffMinutes % 1440) / 60);
      uptimeMinutes = diffMinutes % 60;
    }

    return {
      database: {
        status: dbError ? 'down' : responseTime < 100 ? 'healthy' : 'degraded',
        responseTime,
        connections: 0,
      },
      storage: {
        status: 'healthy',
        usedSpace: totalUsed,
        totalSpace: 10 * 1024 * 1024 * 1024,
      },
      uptime: {
        days: uptimeDays,
        hours: uptimeHours,
        minutes: uptimeMinutes,
      },
      performance: {
        avgResponseTime: healthCheck?.response_time_ms || responseTime,
        requestsPerMinute: 0,
      },
    };
  }

  /**
   * جلب تنبيهات الأمان
   */
  static async getSecurityAlerts(): Promise<SecurityAlert[]> {
    const { data, error } = await supabase
      .from("audit_logs")
      .select("id, action_type, severity, description, table_name, user_email, ip_address, created_at")
      .in("severity", ["error", "warn"])
      .order("created_at", { ascending: false })
      .limit(5);

    if (error) throw error;

    return (data || []).map(log => ({
      id: log.id,
      type: log.action_type.includes('login') ? 'failed_login' as const : 
            log.action_type.includes('permission') ? 'permission_change' as const : 'suspicious_activity' as const,
      severity: log.severity === 'error' ? 'high' as const : 'medium' as const,
      message: log.description || `${log.action_type} في ${log.table_name || 'النظام'}`,
      user_email: log.user_email || undefined,
      ip_address: log.ip_address || undefined,
      timestamp: log.created_at || new Date().toISOString(),
      status: 'new' as const,
    }));
  }

  /**
   * جلب سجلات النسخ الاحتياطي
   */
  static async getBackupLogs(): Promise<BackupLog[]> {
    const { data, error } = await supabase
      .from("backup_logs")
      .select("id, backup_type, status, file_path, file_size, tables_included, started_at, completed_at, error_message, created_at")
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) throw error;
    return data || [];
  }

  /**
   * جلب جداول النسخ الاحتياطي
   */
  static async getBackupSchedules(): Promise<BackupSchedule[]> {
    const { data, error } = await supabase
      .from("backup_schedules")
      .select("id, schedule_name, backup_type, frequency, tables_included, retention_days, is_active, include_storage, last_backup_at, next_backup_at, created_at, updated_at")
      .eq("is_active", true);

    if (error) throw error;
    return data || [];
  }

  /**
   * إنشاء نسخة احتياطية
   */
  static async createBackup(tablesIncluded?: string[]): Promise<any> {
    const { data, error } = await supabase.functions.invoke("backup-database", {
      body: {
        backupType: "manual",
        tablesIncluded: tablesIncluded || [],
      },
    });

    if (error) throw error;
    return data;
  }

  /**
   * استعادة نسخة احتياطية
   */
  static async restoreBackup(backupData: Record<string, unknown>, mode: "replace" | "merge" = "replace"): Promise<any> {
    const { data, error } = await supabase.functions.invoke("restore-database", {
      body: {
        backupData,
        mode,
      },
    });

    if (error) throw error;
    return data;
  }

  /**
   * جلب أخطاء النظام
   */
  static async getSystemErrors(severityFilter: string, statusFilter: string) {
    let query = supabase
      .from("system_error_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    
    if (severityFilter !== "all") {
      query = query.eq("severity", severityFilter);
    }
    
    if (statusFilter !== "all") {
      query = query.eq("status", statusFilter);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  /**
   * حذف الأخطاء المحلولة
   */
  static async deleteResolvedErrors() {
    const { error } = await supabase
      .from("system_error_logs")
      .delete()
      .eq("status", "resolved");
    
    if (error) throw error;
  }

  /**
   * تحديث حالة الخطأ
   */
  static async updateErrorStatus(id: string, status: string) {
    const { error } = await supabase
      .from("system_error_logs")
      .update({ status })
      .eq("id", id);
    
    if (error) throw error;
  }

  /**
   * حذف جميع الأخطاء
   */
  static async deleteAllErrors() {
    const { error } = await supabase
      .from("system_error_logs")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");
    
    if (error) throw error;
  }

  /**
   * جلب إحصائيات صحة النظام
   */
  static async getHealthStats() {
    const now = new Date();
    const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const [errorsResult, alertsResult] = await Promise.all([
      supabase
        .from("system_error_logs")
        .select("id, severity, status, created_at", { count: "exact" })
        .gte("created_at", last7d),
      supabase
        .from("system_alerts")
        .select("id, severity, status, created_at", { count: "exact" })
        .gte("created_at", last7d),
    ]);

    const errors = errorsResult.data || [];
    const alerts = alertsResult.data || [];

    const resolvedCount = errors.filter(e => e.status === "resolved" || e.status === "auto_resolved").length;
    const resolvedAlerts = alerts.filter(a => a.status === "resolved").length;
    const totalErrors = errorsResult.count || 0;
    
    const resolutionRate = totalErrors > 0 
      ? Math.round((resolvedCount / totalErrors) * 100) 
      : 100;
    
    const criticalErrors = errors.filter(e => e.severity === "critical" && e.status === "new").length;
    const highErrors = errors.filter(e => e.severity === "high" && e.status === "new").length;
    const activeAlerts = alerts.filter(a => a.status === "active").length;
    const criticalAlerts = alerts.filter(a => a.severity === "critical" && a.status === "active").length;
    const highAlerts = alerts.filter(a => a.severity === "high" && a.status === "active").length;
    
    const totalResolvable = errors.filter(e => e.status !== "new").length;
    const successfulFixes = resolvedCount;
    const failedFixes = Math.max(0, totalResolvable - resolvedCount);
    const fixSuccessRate = totalResolvable > 0 ? Math.round((successfulFixes / totalResolvable) * 100) : 100;
    
    const healthScore = Math.max(0, 100 - (criticalErrors * 20) - (highErrors * 10) - (activeAlerts * 5));

    return {
      totalErrors,
      newErrors: errors.filter(e => e.status === "new").length,
      criticalErrors,
      highErrors,
      resolvedErrors: resolvedCount,
      totalAlerts: alertsResult.count || 0,
      activeAlerts,
      criticalAlerts,
      highAlerts,
      resolvedAlerts,
      resolutionRate,
      healthScore,
      fixSuccessRate,
      successfulFixes,
      failedFixes,
    };
  }

  /**
   * جلب جلسات نشاط المستفيدين
   */
  static async getBeneficiaryActivitySessions() {
    const { data, error } = await supabase
      .from("beneficiary_sessions")
      .select(`
        id,
        beneficiary_id,
        current_page,
        current_section,
        last_activity,
        is_online,
        session_start,
        beneficiaries:beneficiary_id (
          full_name,
          phone,
          category
        )
      `)
      .order("last_activity", { ascending: false })
      .limit(20);

    if (error) throw error;
    
    return (data || []).map(session => ({
      ...session,
      beneficiary: session.beneficiaries as { full_name: string; phone: string; category: string } | undefined
    }));
  }
}
