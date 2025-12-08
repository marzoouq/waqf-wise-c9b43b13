/**
 * Payment Service - خدمة المدفوعات والسندات
 * @version 2.7.2
 */

import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Payment = Database['public']['Tables']['payments']['Row'];
type PaymentInsert = Database['public']['Tables']['payments']['Insert'];
type PaymentUpdate = Database['public']['Tables']['payments']['Update'];

export interface PaymentFilters {
  payment_type?: 'receipt' | 'payment';
  payment_method?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
}

export class PaymentService {
  /**
   * جلب جميع المدفوعات
   */
  static async getAll(filters?: PaymentFilters): Promise<Payment[]> {
    let query = supabase
      .from("payments")
      .select("*")
      .order("payment_date", { ascending: false });

    if (filters?.payment_type) {
      query = query.eq("payment_type", filters.payment_type);
    }
    if (filters?.payment_method) {
      query = query.eq("payment_method", filters.payment_method);
    }
    if (filters?.status) {
      query = query.eq("status", filters.status);
    }
    if (filters?.startDate) {
      query = query.gte("payment_date", filters.startDate);
    }
    if (filters?.endDate) {
      query = query.lte("payment_date", filters.endDate);
    }
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  /**
   * جلب مدفوعة بالمعرف
   */
  static async getById(id: string): Promise<Payment | null> {
    const { data, error } = await supabase
      .from("payments")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  /**
   * إنشاء مدفوعة جديدة
   */
  static async create(payment: PaymentInsert): Promise<Payment> {
    const { data, error } = await supabase
      .from("payments")
      .insert(payment)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * تحديث مدفوعة
   */
  static async update(id: string, updates: PaymentUpdate): Promise<Payment> {
    const { data, error } = await supabase
      .from("payments")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * حذف مدفوعة
   */
  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from("payments")
      .delete()
      .eq("id", id);

    if (error) throw error;
  }

  /**
   * إنشاء موافقات للمدفوعة
   */
  static async createApprovals(paymentId: string): Promise<void> {
    const approvals = [
      { level: 1, approver_name: 'المشرف المالي' },
      { level: 2, approver_name: 'المدير' }
    ];

    const { error } = await supabase.from('payment_approvals').insert(
      approvals.map(approval => ({
        payment_id: paymentId,
        ...approval,
        status: 'معلق'
      }))
    );

    if (error) throw error;
  }

  /**
   * جلب إحصائيات المدفوعات
   */
  static async getStats(fiscalYearId?: string): Promise<{
    totalReceipts: number;
    totalPayments: number;
    pendingApprovals: number;
  }> {
    const [receipts, payments, pending] = await Promise.all([
      supabase.from("payments").select("amount").eq("payment_type", "receipt"),
      supabase.from("payments").select("amount").eq("payment_type", "payment"),
      supabase.from("payments").select("id", { count: 'exact' }).eq("status", "pending"),
    ]);

    return {
      totalReceipts: (receipts.data || []).reduce((sum, p) => sum + (p.amount || 0), 0),
      totalPayments: (payments.data || []).reduce((sum, p) => sum + (p.amount || 0), 0),
      pendingApprovals: pending.count || 0,
    };
  }
}
