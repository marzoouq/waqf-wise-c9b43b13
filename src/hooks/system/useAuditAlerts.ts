/**
 * useAuditAlerts Hook - تنبيهات التدقيق الذكية
 * @version 1.0.0
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { QUERY_KEYS } from "@/lib/query-keys";
import { toast } from "sonner";
import { useEffect, useCallback } from "react";

export interface AuditAlert {
  id: string;
  type: 'mass_delete' | 'financial_change' | 'unusual_access' | 'role_change' | 'sensitive_data' | 'failed_access';
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  relatedLogId?: string;
  userId?: string;
  userEmail?: string;
  tableName?: string;
  actionType?: string;
  triggeredAt: Date;
  isRead: boolean;
  isDismissed: boolean;
  metadata?: Record<string, unknown>;
}

interface AuditAlertRule {
  id: string;
  name: string;
  type: AuditAlert['type'];
  conditions: {
    tableName?: string[];
    actionType?: string[];
    minCount?: number;
    timeWindowMinutes?: number;
  };
  severity: AuditAlert['severity'];
  isActive: boolean;
}

// القواعد الافتراضية للتنبيهات
const DEFAULT_ALERT_RULES: AuditAlertRule[] = [
  {
    id: 'rule_mass_delete',
    name: 'حذف جماعي',
    type: 'mass_delete',
    conditions: {
      actionType: ['DELETE'],
      minCount: 5,
      timeWindowMinutes: 5,
    },
    severity: 'critical',
    isActive: true,
  },
  {
    id: 'rule_financial_change',
    name: 'تغيير مالي',
    type: 'financial_change',
    conditions: {
      tableName: ['payment_vouchers', 'journal_entries', 'journal_entry_lines', 'distributions', 'loans', 'bank_transfers'],
      actionType: ['INSERT', 'UPDATE', 'DELETE'],
    },
    severity: 'high',
    isActive: true,
  },
  {
    id: 'rule_role_change',
    name: 'تغيير الأدوار',
    type: 'role_change',
    conditions: {
      tableName: ['user_roles', 'profiles'],
      actionType: ['INSERT', 'UPDATE', 'DELETE'],
    },
    severity: 'high',
    isActive: true,
  },
  {
    id: 'rule_sensitive_data',
    name: 'بيانات حساسة',
    type: 'sensitive_data',
    conditions: {
      tableName: ['beneficiaries', 'bank_accounts', 'bank_transfer_details'],
      actionType: ['UPDATE', 'DELETE'],
    },
    severity: 'medium',
    isActive: true,
  },
];

/**
 * جلب التنبيهات الذكية المولدة من سجلات التدقيق
 */
export const useAuditAlerts = () => {
  return useQuery({
    queryKey: [...QUERY_KEYS.AUDIT_LOGS, 'alerts'],
    queryFn: async (): Promise<AuditAlert[]> => {
      const now = new Date();
      const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      // جلب السجلات الأخيرة
      const { data: recentLogs, error } = await supabase
        .from("audit_logs")
        .select("*")
        .gte("created_at", last24Hours.toISOString())
        .order("created_at", { ascending: false })
        .limit(1000);

      if (error) throw error;

      const alerts: AuditAlert[] = [];
      const logs = recentLogs || [];

      // فحص الحذف الجماعي
      const deletesByUserAndTable = new Map<string, Array<{ log: typeof logs[0]; time: Date }>>();
      logs
        .filter(l => l.action_type === 'DELETE')
        .forEach(log => {
          const key = `${log.user_email || 'unknown'}_${log.table_name || 'unknown'}`;
          if (!deletesByUserAndTable.has(key)) {
            deletesByUserAndTable.set(key, []);
          }
          deletesByUserAndTable.get(key)!.push({
            log,
            time: new Date(log.created_at || Date.now()),
          });
        });

      deletesByUserAndTable.forEach((deletions, key) => {
        // فحص إذا كان هناك 5+ حذف خلال 5 دقائق
        const sorted = deletions.sort((a, b) => a.time.getTime() - b.time.getTime());
        for (let i = 0; i < sorted.length - 4; i++) {
          const windowStart = sorted[i].time;
          const windowEnd = new Date(windowStart.getTime() + 5 * 60 * 1000);
          const inWindow = sorted.filter(d => d.time >= windowStart && d.time <= windowEnd);
          
          if (inWindow.length >= 5) {
            const [userEmail, tableName] = key.split('_');
            alerts.push({
              id: `mass_delete_${key}_${windowStart.getTime()}`,
              type: 'mass_delete',
              title: '⚠️ حذف جماعي مكتشف',
              description: `تم حذف ${inWindow.length} سجل من ${tableName} بواسطة ${userEmail} خلال 5 دقائق`,
              severity: 'critical',
              relatedLogId: sorted[i].log.id,
              userEmail,
              tableName,
              actionType: 'DELETE',
              triggeredAt: windowStart,
              isRead: false,
              isDismissed: false,
              metadata: { count: inWindow.length },
            });
            break; // تجنب التكرار
          }
        }
      });

      // فحص التغييرات المالية الحساسة
      const financialTables = ['payment_vouchers', 'journal_entries', 'journal_entry_lines', 'distributions', 'loans', 'bank_transfers', 'bank_transfer_files'];
      logs
        .filter(l => financialTables.includes(l.table_name || '') && l.severity === 'critical')
        .forEach(log => {
          alerts.push({
            id: `financial_${log.id}`,
            type: 'financial_change',
            title: '💰 تغيير مالي حساس',
            description: log.description || `${log.action_type} في ${log.table_name}`,
            severity: 'high',
            relatedLogId: log.id,
            userId: log.user_id || undefined,
            userEmail: log.user_email || undefined,
            tableName: log.table_name || undefined,
            actionType: log.action_type,
            triggeredAt: new Date(log.created_at || Date.now()),
            isRead: false,
            isDismissed: false,
            metadata: {
              old_values: log.old_values,
              new_values: log.new_values,
            },
          });
        });

      // فحص تغييرات الأدوار
      logs
        .filter(l => l.table_name === 'user_roles')
        .forEach(log => {
          alerts.push({
            id: `role_${log.id}`,
            type: 'role_change',
            title: '👤 تغيير في الأدوار',
            description: log.description || `${log.action_type} في صلاحيات المستخدم`,
            severity: 'high',
            relatedLogId: log.id,
            userId: log.user_id || undefined,
            userEmail: log.user_email || undefined,
            tableName: 'user_roles',
            actionType: log.action_type,
            triggeredAt: new Date(log.created_at || Date.now()),
            isRead: false,
            isDismissed: false,
            metadata: {
              old_values: log.old_values,
              new_values: log.new_values,
            },
          });
        });

      // فحص الوصول لبيانات المستفيدين الحساسة
      logs
        .filter(l => l.table_name === 'beneficiaries' && l.action_type === 'VIEW_ACCESS')
        .slice(0, 10)
        .forEach(log => {
          alerts.push({
            id: `access_${log.id}`,
            type: 'unusual_access',
            title: '👁️ وصول لبيانات حساسة',
            description: log.description || 'وصول لبيانات المستفيدين',
            severity: 'medium',
            relatedLogId: log.id,
            userId: log.user_id || undefined,
            userEmail: log.user_email || undefined,
            tableName: log.table_name || undefined,
            actionType: 'VIEW_ACCESS',
            triggeredAt: new Date(log.created_at || Date.now()),
            isRead: false,
            isDismissed: false,
          });
        });

      // ترتيب حسب الأهمية والوقت
      return alerts.sort((a, b) => {
        const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        if (severityOrder[a.severity] !== severityOrder[b.severity]) {
          return severityOrder[a.severity] - severityOrder[b.severity];
        }
        return b.triggeredAt.getTime() - a.triggeredAt.getTime();
      });
    },
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  });
};

/**
 * إحصائيات التنبيهات
 */
export const useAuditAlertsStats = () => {
  const { data: alerts = [] } = useAuditAlerts();

  return {
    total: alerts.length,
    critical: alerts.filter(a => a.severity === 'critical').length,
    high: alerts.filter(a => a.severity === 'high').length,
    medium: alerts.filter(a => a.severity === 'medium').length,
    low: alerts.filter(a => a.severity === 'low').length,
    unread: alerts.filter(a => !a.isRead).length,
    byType: {
      mass_delete: alerts.filter(a => a.type === 'mass_delete').length,
      financial_change: alerts.filter(a => a.type === 'financial_change').length,
      role_change: alerts.filter(a => a.type === 'role_change').length,
      unusual_access: alerts.filter(a => a.type === 'unusual_access').length,
    },
  };
};

/**
 * الاشتراك في التنبيهات الفورية
 */
export const useRealtimeAuditAlerts = (onAlert?: (alert: AuditAlert) => void) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel('audit_logs_realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'audit_logs',
        },
        (payload) => {
          const log = payload.new as {
            id: string;
            action_type: string;
            table_name: string;
            severity: string;
            description: string;
            user_email: string;
            user_id: string;
            created_at: string;
            old_values: Record<string, unknown>;
            new_values: Record<string, unknown>;
          };

          // فحص إذا كان يستوجب تنبيه
          const criticalTables = ['payment_vouchers', 'journal_entries', 'distributions', 'user_roles', 'bank_transfers'];
          
          if (log.severity === 'critical' || criticalTables.includes(log.table_name)) {
            const alert: AuditAlert = {
              id: `realtime_${log.id}`,
              type: log.table_name === 'user_roles' ? 'role_change' : 
                    criticalTables.includes(log.table_name) ? 'financial_change' : 
                    'sensitive_data',
              title: log.action_type === 'DELETE' ? '🗑️ عملية حذف' : 
                     log.action_type === 'INSERT' ? '➕ عملية إضافة' : 
                     '✏️ عملية تعديل',
              description: log.description || `${log.action_type} في ${log.table_name}`,
              severity: log.severity as AuditAlert['severity'],
              relatedLogId: log.id,
              userId: log.user_id,
              userEmail: log.user_email,
              tableName: log.table_name,
              actionType: log.action_type,
              triggeredAt: new Date(log.created_at),
              isRead: false,
              isDismissed: false,
              metadata: {
                old_values: log.old_values,
                new_values: log.new_values,
              },
            };

            // إظهار toast
            if (log.severity === 'critical') {
              toast.error(alert.title, { description: alert.description });
            } else if (log.severity === 'warning') {
              toast.warning(alert.title, { description: alert.description });
            }

            // استدعاء callback
            onAlert?.(alert);

            // تحديث الكاش
            queryClient.invalidateQueries({ queryKey: [...QUERY_KEYS.AUDIT_LOGS, 'alerts'] });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, onAlert]);
};
