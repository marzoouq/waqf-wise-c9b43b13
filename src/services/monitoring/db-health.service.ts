/**
 * خدمة مراقبة صحة قاعدة البيانات الشاملة
 * Comprehensive Database Health Monitoring Service
 */

import { supabase } from "@/integrations/supabase/client";

export interface DuplicateIndex {
  table_name: string;
  index1: string;
  index2: string;
  column_definition: string;
  index1_size: string;
  index2_size: string;
}

export interface DuplicatePolicy {
  table_name: string;
  policy1: string;
  policy2: string;
  command: string;
  policy1_qual: string;
  policy2_qual: string;
}

export interface DeadRowsInfo {
  table_name: string;
  live_rows: number;
  dead_rows: number;
  dead_pct: number;
  last_vacuum: string | null;
  last_autovacuum: string | null;
}

export interface QueryError {
  id: string;
  error_type: string;
  error_message: string;
  severity: string;
  created_at: string;
  error_stack: string | null;
}

export interface HealthSummary {
  total_tables: number;
  total_indexes: number;
  duplicate_indexes: number;
  duplicate_policies: number;
  tables_with_dead_rows: number;
  total_dead_rows: number;
  db_size_mb: number;
  cache_hit_ratio: number;
}

export interface DatabaseHealthReport {
  summary: HealthSummary;
  duplicateIndexes: DuplicateIndex[];
  duplicatePolicies: DuplicatePolicy[];
  deadRowsInfo: DeadRowsInfo[];
  queryErrors: QueryError[];
  timestamp: string;
}

export interface HealthAlert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  value?: number;
  threshold?: number;
}

class DatabaseHealthService {
  /**
   * جلب تقرير صحة قاعدة البيانات الشامل
   */
  async getHealthReport(): Promise<DatabaseHealthReport> {
    try {
      const { data, error } = await supabase.functions.invoke('db-health-check');
      
      if (error) {
        console.error('[DatabaseHealthService] Edge function error:', error);
        throw error;
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Failed to fetch health report');
      }

      return data.data as DatabaseHealthReport;
    } catch (error) {
      console.error('[DatabaseHealthService] Error fetching health report:', error);
      // Return fallback data
      return {
        summary: {
          total_tables: 0,
          total_indexes: 0,
          duplicate_indexes: 0,
          duplicate_policies: 0,
          tables_with_dead_rows: 0,
          total_dead_rows: 0,
          db_size_mb: 0,
          cache_hit_ratio: 0,
        },
        duplicateIndexes: [],
        duplicatePolicies: [],
        deadRowsInfo: [],
        queryErrors: [],
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * تحليل التنبيهات بناءً على تقرير الصحة
   */
  analyzeAlerts(report: DatabaseHealthReport): HealthAlert[] {
    const alerts: HealthAlert[] = [];

    // تحذير الفهارس المكررة
    if (report.duplicateIndexes.length > 0) {
      alerts.push({
        id: 'duplicate-indexes',
        type: report.duplicateIndexes.length > 10 ? 'critical' : 'warning',
        title: 'فهارس مكررة',
        message: `يوجد ${report.duplicateIndexes.length} فهرس مكرر يمكن حذفه لتحسين الأداء`,
        value: report.duplicateIndexes.length,
      });
    }

    // تحذير سياسات RLS المكررة
    if (report.duplicatePolicies.length > 0) {
      alerts.push({
        id: 'duplicate-policies',
        type: 'warning',
        title: 'سياسات RLS مكررة',
        message: `يوجد ${report.duplicatePolicies.length} سياسة RLS مكررة يمكن دمجها`,
        value: report.duplicatePolicies.length,
      });
    }

    // تحذير الصفوف الميتة
    if (report.summary.total_dead_rows > 10000) {
      alerts.push({
        id: 'high-dead-rows',
        type: report.summary.total_dead_rows > 50000 ? 'critical' : 'warning',
        title: 'صفوف ميتة كثيرة',
        message: `إجمالي الصفوف الميتة: ${report.summary.total_dead_rows.toLocaleString()}`,
        value: report.summary.total_dead_rows,
        threshold: 10000,
      });
    }

    // تحذير Cache Hit منخفض
    if (report.summary.cache_hit_ratio > 0 && report.summary.cache_hit_ratio < 95) {
      alerts.push({
        id: 'low-cache-hit',
        type: report.summary.cache_hit_ratio < 90 ? 'critical' : 'warning',
        title: 'نسبة Cache Hit منخفضة',
        message: `نسبة Cache Hit: ${report.summary.cache_hit_ratio.toFixed(2)}%`,
        value: report.summary.cache_hit_ratio,
        threshold: 95,
      });
    }

    // تحذير أخطاء الاستعلامات
    if (report.queryErrors.length > 0) {
      const criticalErrors = report.queryErrors.filter(e => e.severity === 'critical' || e.severity === 'error');
      if (criticalErrors.length > 0) {
        alerts.push({
          id: 'query-errors',
          type: 'critical',
          title: 'أخطاء استعلامات',
          message: `يوجد ${criticalErrors.length} خطأ استعلام يحتاج للمعالجة`,
          value: criticalErrors.length,
        });
      }
    }

    // تحذير جداول بنسبة صفوف ميتة عالية
    const highDeadRowsTables = report.deadRowsInfo.filter(t => t.dead_pct > 50);
    if (highDeadRowsTables.length > 0) {
      alerts.push({
        id: 'tables-high-dead-rows',
        type: 'warning',
        title: 'جداول تحتاج VACUUM',
        message: `${highDeadRowsTables.length} جدول بنسبة صفوف ميتة > 50%`,
        value: highDeadRowsTables.length,
      });
    }

    return alerts;
  }

  /**
   * تشغيل VACUUM ANALYZE على جميع الجداول
   */
  async runVacuumAll(): Promise<boolean> {
    try {
      const { error } = await supabase.functions.invoke('run-vacuum', {
        body: { all: true },
      });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('[DatabaseHealthService] Vacuum all error:', error);
      return false;
    }
  }

  /**
   * تشغيل VACUUM على جدول محدد
   */
  async runVacuumTable(tableName: string): Promise<boolean> {
    try {
      const { error } = await supabase.functions.invoke('run-vacuum', {
        body: { table: tableName },
      });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('[DatabaseHealthService] Vacuum table error:', error);
      return false;
    }
  }
}

export const dbHealthService = new DatabaseHealthService();
