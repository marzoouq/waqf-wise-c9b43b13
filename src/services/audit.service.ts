/**
 * Audit Service - خدمة سجل التدقيق
 * @version 2.8.59
 */

import { supabase } from "@/integrations/supabase/client";
import type { AuditLog, AuditLogFilters } from "@/types/audit";
import type { Json } from "@/integrations/supabase/types";

export class AuditService {
  /**
   * جلب سجلات التدقيق
   */
  static async getLogs(filters?: AuditLogFilters): Promise<AuditLog[]> {
    let query = supabase
      .from("audit_logs")
      .select("id, action_type, table_name, description, user_email, created_at, severity")
      .order("created_at", { ascending: false });

    if (filters?.userId) {
      query = query.eq("user_id", filters.userId);
    }
    if (filters?.tableName) {
      query = query.eq("table_name", filters.tableName);
    }
    if (filters?.actionType) {
      query = query.eq("action_type", filters.actionType);
    }
    if (filters?.severity) {
      query = query.eq("severity", filters.severity);
    }
    if (filters?.startDate) {
      query = query.gte("created_at", filters.startDate);
    }
    if (filters?.endDate) {
      query = query.lte("created_at", filters.endDate);
    }

    const { data, error } = await query.limit(filters ? 100 : 10);

    if (error) throw error;
    return data as AuditLog[];
  }

  /**
   * إضافة سجل تدقيق
   */
  static async addLog(log: {
    action_type: string;
    table_name?: string;
    description?: string;
    user_email?: string;
    severity?: string;
    record_id?: string;
    old_values?: Json;
    new_values?: Json;
  }): Promise<void> {
    const { error } = await supabase.from("audit_logs").insert([log]);
    if (error) throw error;
  }
}
