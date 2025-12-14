/**
 * Monitoring Service - خدمة المراقبة
 * @version 2.8.29
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

export interface SmartAlert {
  id: string;
  type: 'contract_expiring' | 'rent_overdue' | 'loan_due' | 'request_overdue';
  title: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
  date: Date;
  actionUrl: string;
}

export interface PerformanceMetric {
  id: string;
  metric_name: string;
  value: number;
  recorded_at: string;
}

export interface SlowQueryLog {
  id: string;
  query_text: string;
  execution_time_ms: number;
  created_at: string;
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

  /**
   * جلب مقاييس الأداء
   */
  static async getPerformanceMetricsData(): Promise<{ metrics: PerformanceMetric[]; slowQueries: SlowQueryLog[] }> {
    const [metricsResult, queriesResult] = await Promise.all([
      supabase
        .from("performance_metrics")
        .select("*")
        .order("recorded_at", { ascending: false })
        .limit(100),
      supabase
        .from("slow_query_log")
        .select("*")
        .order("execution_time_ms", { ascending: false })
        .limit(20),
    ]);

    if (metricsResult.error) throw metricsResult.error;

    return {
      metrics: (metricsResult.data || []) as PerformanceMetric[],
      slowQueries: (queriesResult.data || []) as SlowQueryLog[],
    };
  }

  /**
   * جلب التنبيهات الذكية
   */
  static async getSmartAlerts(): Promise<SmartAlert[]> {
    const today = new Date();
    const [
      expiringContractsResult,
      overduePaymentsResult,
      dueLoansResult,
      overdueRequestsResult
    ] = await Promise.all([
      supabase
        .from('contracts')
        .select('id, contract_number, tenant_name, end_date, properties(name)')
        .eq('status', 'نشط')
        .gte('end_date', today.toISOString().split('T')[0])
        .lte('end_date', new Date(today.getTime() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .limit(5),
      supabase
        .from('rental_payments')
        .select(`id, payment_number, amount_due, due_date, contracts(tenant_name, properties(name))`)
        .eq('status', 'متأخر')
        .limit(5),
      supabase
        .from('loan_installments')
        .select(`id, installment_number, principal_amount, total_amount, due_date, status, loans(loan_number, beneficiaries(full_name))`)
        .in('status', ['overdue', 'pending', 'معلق'])
        .lte('due_date', new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .limit(5),
      supabase
        .from('beneficiary_requests')
        .select(`id, request_number, sla_due_at, beneficiaries(full_name)`)
        .eq('is_overdue', true)
        .eq('status', 'قيد المراجعة')
        .limit(5)
    ]);

    if (expiringContractsResult.error) throw expiringContractsResult.error;

    const allAlerts: SmartAlert[] = [];

    // عقود قرب الانتهاء
    interface ContractWithProperty {
      id: string;
      contract_number: string;
      tenant_name: string;
      end_date: string;
      properties?: { name?: string } | null;
    }
    
    if (expiringContractsResult.data) {
      (expiringContractsResult.data as ContractWithProperty[]).forEach(contract => {
        const daysRemaining = Math.floor((new Date(contract.end_date).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        allAlerts.push({
          id: contract.id,
          type: 'contract_expiring',
          title: `عقد ${contract.contract_number} قارب الانتهاء`,
          description: `عقد ${contract.tenant_name} - ${contract.properties?.name || 'عقار'} ينتهي خلال ${daysRemaining} يوم`,
          severity: daysRemaining <= 30 ? 'high' : 'medium',
          date: new Date(contract.end_date),
          actionUrl: '/properties?tab=contracts'
        });
      });
    }

    // إيجارات متأخرة
    interface PaymentWithContract {
      id: string;
      payment_number: string;
      amount_due: number;
      due_date: string;
      contracts?: { tenant_name?: string; properties?: { name?: string } } | null;
    }
    
    if (overduePaymentsResult.data) {
      (overduePaymentsResult.data as PaymentWithContract[]).forEach(payment => {
        const daysOverdue = Math.floor((today.getTime() - new Date(payment.due_date).getTime()) / (1000 * 60 * 60 * 24));
        allAlerts.push({
          id: payment.id,
          type: 'rent_overdue',
          title: `دفعة إيجار متأخرة - ${payment.payment_number}`,
          description: `${payment.contracts?.tenant_name || 'مستأجر'} - متأخر ${daysOverdue} يوم`,
          severity: daysOverdue > 30 ? 'high' : 'medium',
          date: new Date(payment.due_date),
          actionUrl: '/properties?tab=payments'
        });
      });
    }

    // قروض مستحقة
    interface LoanInstallmentWithLoan {
      id: string;
      installment_number: number;
      principal_amount: number;
      total_amount: number;
      due_date: string;
      status: string;
      loans?: { loan_number?: string; beneficiaries?: { full_name?: string } } | null;
    }
    
    if (dueLoansResult.data) {
      (dueLoansResult.data as LoanInstallmentWithLoan[]).forEach(installment => {
        const daysUntilDue = Math.floor((new Date(installment.due_date).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        const isOverdue = installment.status === 'overdue' || daysUntilDue < 0;
        allAlerts.push({
          id: installment.id,
          type: 'loan_due',
          title: isOverdue ? `قسط قرض متأخر` : `قسط قرض مستحق قريبًا`,
          description: `قرض ${installment.loans?.loan_number || ''}`,
          severity: isOverdue || daysUntilDue <= 7 ? 'high' : 'medium',
          date: new Date(installment.due_date),
          actionUrl: '/loans'
        });
      });
    }

    // طلبات متأخرة
    interface RequestWithBeneficiary {
      id: string;
      request_number: string | null;
      sla_due_at: string | null;
      beneficiaries?: { full_name?: string } | null;
    }
    
    if (overdueRequestsResult.data) {
      (overdueRequestsResult.data as RequestWithBeneficiary[]).forEach(request => {
        allAlerts.push({
          id: request.id,
          type: 'request_overdue',
          title: `طلب متأخر - ${request.request_number || ''}`,
          description: `طلب ${request.beneficiaries?.full_name || 'مستفيد'} تجاوز الوقت المحدد`,
          severity: 'high',
          date: new Date(request.sla_due_at || Date.now()),
          actionUrl: '/requests'
        });
      });
    }

    return allAlerts.sort((a, b) => {
      const severityOrder = { high: 3, medium: 2, low: 1 };
      if (severityOrder[a.severity] !== severityOrder[b.severity]) {
        return severityOrder[b.severity] - severityOrder[a.severity];
      }
      return a.date.getTime() - b.date.getTime();
    }).slice(0, 6);
  }

  /**
   * استدعاء دالة backfill للمستندات
   */
  static async backfillDocuments() {
    const { data, error } = await supabase.functions.invoke('backfill-rental-documents');
    if (error) throw error;
    return data;
  }

  /**
   * جلب بيانات فحوصات صحة النظام
   */
  static async getHealthCheckData(since: Date) {
    const { data, error } = await supabase
      .from("system_health_checks")
      .select("id, created_at, status, response_time_ms")
      .gte("created_at", since.toISOString())
      .order("created_at", { ascending: true });

    if (error) throw error;
    return data || [];
  }
}
