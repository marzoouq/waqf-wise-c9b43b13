/**
 * POS Service - خدمة نقاط البيع
 * @version 2.8.25
 */

import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

export interface POSDailyStats {
  total_collections: number;
  total_payments: number;
  net_amount: number;
  transactions_count: number;
  cash_amount: number;
  card_amount: number;
  transfer_amount: number;
}

export interface CashierShift {
  id: string;
  shift_number: string;
  cashier_id: string;
  cashier_name: string | null;
  opening_balance: number;
  closing_balance: number | null;
  expected_balance: number | null;
  variance: number;
  total_collections: number;
  total_payments: number;
  transactions_count: number;
  status: 'مفتوحة' | 'مغلقة' | 'معلقة';
  opened_at: string;
  closed_at: string | null;
  closed_by: string | null;
  notes: string | null;
  created_at: string;
}

export interface POSTransaction {
  id: string;
  transaction_number: string;
  shift_id: string;
  transaction_type: 'تحصيل' | 'صرف' | 'تعديل';
  rental_payment_id: string | null;
  contract_id: string | null;
  beneficiary_id: string | null;
  amount: number;
  tax_amount: number;
  net_amount: number | null;
  payment_method: 'نقدي' | 'شبكة' | 'تحويل' | 'شيك';
  reference_number: string | null;
  payer_name: string | null;
  expense_category: string | null;
  description: string | null;
  cashier_id: string;
  journal_entry_id: string | null;
  receipt_printed: boolean;
  voided: boolean;
  created_at: string;
}

export interface PendingRental {
  id: string;
  contract_id: string;
  contract_number: string;
  property_name: string;
  tenant_name: string;
  amount_due: number;
  tax_amount: number;
  net_amount: number;
  due_date: string;
  status: string;
  days_overdue: number;
  is_overdue: boolean;
}

export class POSService {
  /**
   * جلب إحصائيات اليوم
   */
  static async getDailyStats(date: Date = new Date()): Promise<POSDailyStats> {
    const formattedDate = format(date, "yyyy-MM-dd");
    const { data, error } = await supabase.rpc("get_pos_daily_stats", {
      p_date: formattedDate,
    });

    if (error) throw error;
    return (data?.[0] as POSDailyStats) || {
      total_collections: 0,
      total_payments: 0,
      net_amount: 0,
      transactions_count: 0,
      cash_amount: 0,
      card_amount: 0,
      transfer_amount: 0,
    };
  }

  /**
   * جلب إحصائيات الوردية
   */
  static async getShiftStats(shiftId: string): Promise<any> {
    const { data, error } = await supabase.rpc("get_shift_stats", {
      p_shift_id: shiftId,
    });

    if (error) throw error;
    return data?.[0] || null;
  }

  /**
   * جلب التسوية اليومية
   */
  static async getDailySettlement(date: Date = new Date()): Promise<any> {
    const formattedDate = format(date, "yyyy-MM-dd");
    const { data, error } = await supabase.rpc("get_pos_daily_stats", {
      p_date: formattedDate,
    });

    if (error) throw error;
    return data?.[0] || null;
  }

  /**
   * جلب الوردية الحالية النشطة
   */
  static async getCurrentShift(): Promise<CashierShift | null> {
    const { data, error } = await supabase
      .from('cashier_shifts')
      .select('*')
      .eq('status', 'مفتوحة')
      .order('opened_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data as CashierShift | null;
  }

  /**
   * جلب جميع الورديات
   */
  static async getShifts(limit: number = 50): Promise<CashierShift[]> {
    const { data, error } = await supabase
      .from('cashier_shifts')
      .select('*')
      .order('opened_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data as CashierShift[];
  }

  /**
   * بدء وردية جديدة
   */
  static async openShift(userId: string, notes?: string): Promise<CashierShift> {
    // التحقق من عدم وجود وردية نشطة
    const { data: existingShift } = await supabase
      .from('cashier_shifts')
      .select('id')
      .eq('status', 'مفتوحة')
      .maybeSingle();

    if (existingShift) {
      throw new Error('يوجد جلسة عمل نشطة بالفعل. يجب إنهاؤها أولاً.');
    }

    // توليد رقم الوردية
    const { data: shiftNumber } = await supabase.rpc('generate_shift_number');

    // جلب اسم المستخدم
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('user_id', userId)
      .maybeSingle();

    const { data, error } = await supabase
      .from('cashier_shifts')
      .insert({
        shift_number: shiftNumber,
        cashier_id: userId,
        cashier_name: profile?.full_name || 'غير معروف',
        opening_balance: 0,
        expected_balance: 0,
        notes,
      })
      .select()
      .single();

    if (error) throw error;
    return data as CashierShift;
  }

  /**
   * إغلاق وردية
   */
  static async closeShift(shiftId: string, userId: string, notes?: string): Promise<CashierShift> {
    const { data, error } = await supabase
      .from('cashier_shifts')
      .update({
        closing_balance: 0,
        expected_balance: 0,
        variance: 0,
        status: 'مغلقة',
        closed_at: new Date().toISOString(),
        closed_by: userId,
        notes,
      })
      .eq('id', shiftId)
      .select()
      .single();

    if (error) throw error;
    return data as CashierShift;
  }

  /**
   * جلب عمليات وردية معينة
   */
  static async getTransactions(shiftId: string): Promise<POSTransaction[]> {
    const { data, error } = await supabase
      .from('pos_transactions')
      .select('*')
      .eq('shift_id', shiftId)
      .eq('voided', false)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as POSTransaction[];
  }

  /**
   * جلب عمليات اليوم
   */
  static async getTodayTransactions(): Promise<POSTransaction[]> {
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('pos_transactions')
      .select('*')
      .gte('created_at', `${today}T00:00:00`)
      .lte('created_at', `${today}T23:59:59`)
      .eq('voided', false)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as POSTransaction[];
  }

  /**
   * إنشاء عملية جديدة
   */
  static async createTransaction(input: {
    shiftId: string;
    transactionType: 'تحصيل' | 'صرف';
    amount: number;
    paymentMethod: 'نقدي' | 'شبكة' | 'تحويل' | 'شيك';
    rentalPaymentId?: string;
    contractId?: string;
    beneficiaryId?: string;
    payerName?: string;
    expenseCategory?: string;
    description?: string;
    referenceNumber?: string;
    cashierId: string;
  }): Promise<POSTransaction> {
    const { data: transactionNumber } = await supabase.rpc('generate_pos_transaction_number');

    const { data, error } = await supabase
      .from('pos_transactions')
      .insert({
        transaction_number: transactionNumber,
        shift_id: input.shiftId,
        transaction_type: input.transactionType,
        amount: input.amount,
        payment_method: input.paymentMethod,
        rental_payment_id: input.rentalPaymentId,
        contract_id: input.contractId,
        beneficiary_id: input.beneficiaryId,
        payer_name: input.payerName,
        expense_category: input.expenseCategory,
        description: input.description,
        reference_number: input.referenceNumber,
        cashier_id: input.cashierId,
        net_amount: input.amount,
      })
      .select()
      .single();

    if (error) throw error;
    return data as POSTransaction;
  }

  /**
   * إلغاء عملية
   */
  static async voidTransaction(transactionId: string, userId: string, reason: string): Promise<POSTransaction> {
    const { data, error } = await supabase
      .from('pos_transactions')
      .update({
        voided: true,
        voided_at: new Date().toISOString(),
        voided_by: userId,
        void_reason: reason,
      })
      .eq('id', transactionId)
      .select()
      .single();

    if (error) throw error;
    return data as POSTransaction;
  }

  /**
   * جلب الإيجارات المعلقة
   */
  static async getPendingRentals(): Promise<PendingRental[]> {
    const { data, error } = await supabase
      .from('rental_payments')
      .select(`
        id,
        contract_id,
        amount_due,
        tax_amount,
        net_amount,
        due_date,
        status,
        contracts!inner(
          contract_number,
          tenant_name,
          property_id,
          properties!inner(name)
        )
      `)
      .in('status', ['معلق', 'متأخر'])
      .order('due_date', { ascending: true });

    if (error) throw error;

    interface RentalPaymentItem {
      id: string;
      contract_id: string;
      amount_due: number | null;
      tax_amount: number | null;
      net_amount: number | null;
      due_date: string;
      status: string;
      contracts?: {
        contract_number?: string;
        tenant_name?: string;
        properties?: { name?: string };
      };
    }

    return ((data || []) as RentalPaymentItem[]).map((item) => {
      const today = new Date();
      const dueDate = new Date(item.due_date);
      const daysOverdue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
      
      return {
        id: item.id,
        contract_id: item.contract_id,
        contract_number: item.contracts?.contract_number || '',
        property_name: item.contracts?.properties?.name || '',
        tenant_name: item.contracts?.tenant_name || '',
        amount_due: item.amount_due || 0,
        tax_amount: item.tax_amount || 0,
        net_amount: item.net_amount || item.amount_due || 0,
        due_date: item.due_date,
        status: item.status,
        days_overdue: daysOverdue > 0 ? daysOverdue : 0,
        is_overdue: daysOverdue > 0,
      } as PendingRental;
    });
  }

  /**
   * تحصيل إيجار سريع
   */
  static async quickCollection(input: {
    shiftId: string;
    rentalPaymentId: string;
    contractId: string;
    amount: number;
    paymentMethod: 'نقدي' | 'شبكة' | 'تحويل' | 'شيك';
    payerName: string;
    referenceNumber?: string;
    description?: string;
    cashierId: string;
  }): Promise<POSTransaction> {
    // إنشاء عملية التحصيل
    const transaction = await this.createTransaction({
      shiftId: input.shiftId,
      transactionType: 'تحصيل',
      amount: input.amount,
      paymentMethod: input.paymentMethod,
      rentalPaymentId: input.rentalPaymentId,
      contractId: input.contractId,
      payerName: input.payerName,
      referenceNumber: input.referenceNumber,
      description: input.description || `تحصيل إيجار - ${input.payerName}`,
      cashierId: input.cashierId,
    });

    // تحديث حالة دفعة الإيجار
    const { error: paymentError } = await supabase
      .from('rental_payments')
      .update({
        status: 'مدفوع',
        amount_paid: input.amount,
        payment_date: new Date().toISOString().split('T')[0],
        payment_method: input.paymentMethod,
      })
      .eq('id', input.rentalPaymentId);

    if (paymentError) throw paymentError;

    return transaction;
  }

  /**
   * صرف سريع
   */
  static async quickPayment(input: {
    shiftId: string;
    amount: number;
    paymentMethod: 'نقدي' | 'شبكة' | 'تحويل' | 'شيك';
    expenseCategory: string;
    payeeName: string;
    description: string;
    referenceNumber?: string;
    beneficiaryId?: string;
    cashierId: string;
  }): Promise<POSTransaction> {
    return await this.createTransaction({
      shiftId: input.shiftId,
      transactionType: 'صرف',
      amount: input.amount,
      paymentMethod: input.paymentMethod,
      expenseCategory: input.expenseCategory,
      payerName: input.payeeName,
      beneficiaryId: input.beneficiaryId,
      description: input.description,
      referenceNumber: input.referenceNumber,
      cashierId: input.cashierId,
    });
  }

  /**
   * تسوية وردية
   */
  static async settleShift(shiftId: string): Promise<void> {
    const { error } = await supabase
      .from("cashier_shifts")
      .update({ status: "مغلقة" })
      .eq("id", shiftId);

    if (error) throw error;
  }

  /**
   * جلب تقرير الورديات
   */
  static async getShiftsReport(startDate: string, endDate: string): Promise<any[]> {
    const { data, error } = await supabase.rpc("get_shifts_report", {
      p_start_date: startDate,
      p_end_date: endDate,
    });

    if (error) throw error;
    return data || [];
  }
}
