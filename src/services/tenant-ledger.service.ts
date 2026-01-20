/**
 * Tenant Ledger Service - خدمة دفتر حسابات المستأجرين
 * @version 1.0.0
 * @description
 * خدمة موحدة لإدارة عمليات الدفع والقبض للمستأجرين
 * تتبع نمط Component → Hook → Service → Supabase
 */

import { supabase } from "@/integrations/supabase/client";

export interface TenantLedgerEntry {
  id: string;
  tenant_id: string;
  transaction_type: 'payment' | 'charge' | 'adjustment';
  transaction_date: string;
  credit_amount: number;
  debit_amount: number;
  description: string;
  reference_type: string;
  reference_number: string;
  created_at: string;
}

export interface QuickPaymentData {
  tenantId: string;
  amount: number;
  paymentMethod: string;
  notes?: string;
}

export interface QuickPaymentResult {
  entry: TenantLedgerEntry;
  receiptNumber: string;
}

export const TenantLedgerService = {
  /**
   * تسجيل دفعة سريعة للمستأجر
   */
  async recordQuickPayment(data: QuickPaymentData): Promise<QuickPaymentResult> {
    const receiptNumber = `RCP-${Date.now().toString(36).toUpperCase()}`;
    const paymentDate = new Date().toISOString().split('T')[0];

    const { data: entry, error } = await supabase
      .from('tenant_ledger')
      .insert({
        tenant_id: data.tenantId,
        transaction_type: 'payment',
        transaction_date: paymentDate,
        credit_amount: data.amount,
        debit_amount: 0,
        description: `دفعة إيجار - ${data.paymentMethod}${data.notes ? ` - ${data.notes}` : ''}`,
        reference_type: 'quick_payment',
        reference_number: receiptNumber,
      })
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!entry) throw new Error('فشل إنشاء قيد الدفعة');

    return {
      entry: entry as TenantLedgerEntry,
      receiptNumber,
    };
  },

  /**
   * جلب سجلات دفتر المستأجر
   */
  async getTenantLedger(tenantId: string): Promise<TenantLedgerEntry[]> {
    const { data, error } = await supabase
      .from('tenant_ledger')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('transaction_date', { ascending: false });

    if (error) throw error;
    return data as TenantLedgerEntry[];
  },

  /**
   * حساب رصيد المستأجر
   */
  async calculateBalance(tenantId: string): Promise<number> {
    const { data, error } = await supabase
      .from('tenant_ledger')
      .select('credit_amount, debit_amount')
      .eq('tenant_id', tenantId);

    if (error) throw error;

    if (!data || data.length === 0) return 0;

    return data.reduce((balance, entry) => {
      return balance + (entry.credit_amount || 0) - (entry.debit_amount || 0);
    }, 0);
  },

  /**
   * تحديث رصيد المستأجر
   * ملاحظة: يتم حساب الرصيد من tenant_ledger مباشرة
   */
  async updateTenantBalance(tenantId: string): Promise<number> {
    const balance = await this.calculateBalance(tenantId);
    return balance;
  },
};
