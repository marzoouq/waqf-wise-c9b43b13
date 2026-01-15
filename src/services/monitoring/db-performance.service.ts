/**
 * خدمة مراقبة أداء قاعدة البيانات
 * Database Performance Monitoring Service
 */

import { supabase } from "@/integrations/supabase/client";
import { productionLogger } from '@/lib/logger/production-logger';

// الـ schemas النظامية التي يجب استبعادها
const SYSTEM_SCHEMAS = [
  'auth', 'realtime', 'storage', 'net', 'vault',
  'supabase_functions', 'supabase_migrations', 'extensions',
  'graphql', 'graphql_public', 'pgsodium', 'pgsodium_masks',
];

export interface TableScanStats {
  table_name: string;
  schema_name?: string;
  seq_scan: number;
  idx_scan: number;
  seq_pct: number;
  dead_rows: number;
  live_rows: number;
}

export interface ConnectionStats {
  state: string;
  count: number;
  max_idle_seconds: number;
}

export interface DBPerformanceStats {
  sequentialScans: TableScanStats[];
  cacheHitRatio: number;
  connections: ConnectionStats[];
  totalDeadRows: number;
  dbSizeMb: number;
  timestamp: string;
  filteredSchemas?: string[];
  originalTableCount?: number;
  filteredTableCount?: number;
}

export interface PerformanceAlert {
  id: string;
  type: 'warning' | 'critical';
  message: string;
  value: number;
  threshold: number;
  table?: string;
}

class DBPerformanceService {
  /**
   * جلب إحصائيات الأداء من Edge Function
   */
  async getPerformanceStats(): Promise<DBPerformanceStats> {
    try {
      const { data, error } = await supabase.functions.invoke('db-performance-stats');
      
      if (error) {
        productionLogger.error('[DBPerformanceService] Edge function error:', error);
        throw error;
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Failed to fetch performance stats');
      }

      return data.data as DBPerformanceStats;
    } catch (error) {
      productionLogger.error('[DBPerformanceService] Error fetching stats:', error);
      // Return fallback data
      return {
        sequentialScans: [],
        cacheHitRatio: 0,
        connections: [],
        totalDeadRows: 0,
        dbSizeMb: 0,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * جلب إحصائيات Sequential Scans مباشرة
   */
  async getSequentialScansStats(): Promise<TableScanStats[]> {
    const { data, error } = await supabase.rpc('get_table_scan_stats' as never);
    
    if (error) {
      productionLogger.error('[DBPerformanceService] Seq scan error:', error);
      return [];
    }

    return (data || []) as TableScanStats[];
  }

  /**
   * جلب نسبة Cache Hit
   */
  async getCacheHitRatio(): Promise<number> {
    const { data, error } = await supabase.rpc('get_cache_hit_ratio' as never);
    
    if (error) {
      productionLogger.error('[DBPerformanceService] Cache hit error:', error);
      return 0;
    }

    const result = data as unknown as Array<{ cache_hit_ratio?: number }> | null;
    return result?.[0]?.cache_hit_ratio || 0;
  }

  /**
   * جلب إحصائيات الاتصالات
   */
  async getConnectionStats(): Promise<ConnectionStats[]> {
    const { data, error } = await supabase.rpc('get_connection_stats' as never);
    
    if (error) {
      productionLogger.error('[DBPerformanceService] Connection stats error:', error);
      return [];
    }

    return (data || []) as ConnectionStats[];
  }

  /**
   * تحليل التنبيهات بناءً على الإحصائيات - مع عتبات محسّنة
   */
  analyzeAlerts(stats: DBPerformanceStats): PerformanceAlert[] {
    const alerts: PerformanceAlert[] = [];

    // تحذير Cache Hit منخفض (فقط إذا كانت أقل من 90%)
    if (stats.cacheHitRatio < 90 && stats.cacheHitRatio > 0) {
      alerts.push({
        id: 'low-cache-hit',
        type: stats.cacheHitRatio < 80 ? 'critical' : 'warning',
        message: `نسبة Cache Hit منخفضة: ${stats.cacheHitRatio.toFixed(2)}%`,
        value: stats.cacheHitRatio,
        threshold: 90,
      });
    }

    // تحذير Sequential Scans عالية - فقط للجداول الكبيرة (أكثر من 5000 scan)
    stats.sequentialScans
      .filter(table => {
        // استبعاد الجداول النظامية (احتياطي إضافي)
        const schema = table.schema_name || 'public';
        return !SYSTEM_SCHEMAS.includes(schema);
      })
      .forEach(table => {
        // فقط إذا كانت النسبة عالية + عدد الـ scans كبير
        if (table.seq_pct > 90 && table.seq_scan > 5000) {
          alerts.push({
            id: `high-seq-scan-${table.table_name}`,
            type: 'warning',
            message: `نسبة Sequential Scan عالية في ${table.table_name}: ${table.seq_pct.toFixed(1)}%`,
            value: table.seq_pct,
            threshold: 90,
            table: table.table_name,
          });
        }
      });

    // تحذير Dead Rows - رفع العتبة إلى 50,000 (كانت 10,000)
    if (stats.totalDeadRows > 50000) {
      alerts.push({
        id: 'high-dead-rows',
        type: stats.totalDeadRows > 100000 ? 'critical' : 'warning',
        message: `عدد Dead Rows مرتفع: ${stats.totalDeadRows.toLocaleString()}`,
        value: stats.totalDeadRows,
        threshold: 50000,
      });
    }

    // تحذير اتصالات خاملة طويلة جداً (أكثر من 48 ساعة بدلاً من 24)
    const idleConn = stats.connections.find(c => c.state === 'idle');
    if (idleConn && idleConn.max_idle_seconds > 172800) { // 48 ساعة
      alerts.push({
        id: 'long-idle-connections',
        type: 'warning',
        message: `اتصالات خاملة لأكثر من ${Math.floor(idleConn.max_idle_seconds / 3600)} ساعة`,
        value: idleConn.max_idle_seconds,
        threshold: 172800,
      });
    }

    return alerts;
  }

  /**
   * تشغيل VACUUM على جدول محدد
   */
  async runVacuum(tableName?: string): Promise<boolean> {
    try {
      const { error } = await supabase.functions.invoke('run-vacuum', {
        body: { table: tableName },
      });

      if (error) throw error;
      return true;
    } catch (error) {
      productionLogger.error('[DBPerformanceService] Vacuum error:', error);
      return false;
    }
  }
}

export const dbPerformanceService = new DBPerformanceService();
