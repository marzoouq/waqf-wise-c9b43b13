/**
 * Loans Service - خدمة القروض
 * 
 * إدارة القروض والأقساط والسداد
 */

import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Loan = Database['public']['Tables']['loans']['Row'];
type LoanInsert = Database['public']['Tables']['loans']['Insert'];
type LoanInstallment = Database['public']['Tables']['loan_installments']['Row'];

export interface LoanStats {
  totalLoans: number;
  activeLoans: number;
  totalAmount: number;
  totalPaid: number;
  totalRemaining: number;
  overdueInstallments: number;
}

export interface LoanWithInstallments extends Loan {
  installments?: LoanInstallment[];
  beneficiary?: { full_name: string; national_id: string };
}

export class LoansService {
  /**
   * جلب جميع القروض
   */
  static async getAll(status?: string): Promise<Loan[]> {
    let query = supabase
      .from('loans')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (status) {
      query = query.eq('status', status);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  /**
   * جلب قرض واحد مع التفاصيل
   */
  static async getById(id: string): Promise<LoanWithInstallments | null> {
    const { data: loan, error } = await supabase
      .from('loans')
      .select(`
        *,
        beneficiaries(full_name, national_id),
        loan_installments(*)
      `)
      .eq('id', id)
      .maybeSingle();
    
    if (error) throw error;
    return loan as LoanWithInstallments | null;
  }

  /**
   * إنشاء قرض جديد
   */
  static async create(loan: LoanInsert): Promise<Loan> {
    const { data, error } = await supabase
      .from('loans')
      .insert(loan)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  /**
   * تحديث قرض
   */
  static async update(id: string, updates: Partial<LoanInsert>): Promise<Loan> {
    const { data, error } = await supabase
      .from('loans')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  /**
   * جلب قروض مستفيد معين
   */
  static async getByBeneficiary(beneficiaryId: string): Promise<Loan[]> {
    const { data, error } = await supabase
      .from('loans')
      .select('*')
      .eq('beneficiary_id', beneficiaryId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  /**
   * جلب الأقساط المتأخرة
   */
  static async getOverdueInstallments(): Promise<LoanInstallment[]> {
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('loan_installments')
      .select('*')
      .eq('status', 'معلق')
      .lt('due_date', today)
      .order('due_date', { ascending: true });
    
    if (error) throw error;
    return data || [];
  }

  /**
   * جلب أقساط قرض معين
   */
  static async getInstallments(loanId?: string): Promise<LoanInstallment[]> {
    let query = supabase
      .from('loan_installments')
      .select('id, loan_id, installment_number, due_date, principal_amount, interest_amount, total_amount, paid_amount, remaining_amount, status, paid_at, created_at')
      .order('installment_number', { ascending: true });

    if (loanId) {
      query = query.eq('loan_id', loanId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as LoanInstallment[];
  }

  /**
   * تحديث قسط
   */
  static async updateInstallment(
    id: string,
    updates: { paid_amount: number; remaining_amount: number; status: string; paid_at?: string | null }
  ): Promise<LoanInstallment> {
    const { data, error } = await supabase
      .from('loan_installments')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  /**
   * تسجيل سداد قسط
   */
  static async payInstallment(
    installmentId: string, 
    amount: number, 
    paymentMethod: string
  ): Promise<LoanInstallment> {
    const { data, error } = await supabase
      .from('loan_installments')
      .update({
        status: 'مدفوع',
        paid_amount: amount,
        payment_date: new Date().toISOString(),
        payment_method: paymentMethod,
      })
      .eq('id', installmentId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  /**
   * جلب إحصائيات القروض
   */
  static async getStats(): Promise<LoanStats> {
    const [loansRes, installmentsRes] = await Promise.all([
      supabase.from('loans').select('id, status, loan_amount'),
      supabase.from('loan_installments').select('id, status, due_date'),
    ]);

    const loans = loansRes.data || [];
    const installments = installmentsRes.data || [];
    
    const today = new Date().toISOString().split('T')[0];
    const overdueInstallments = installments.filter(i => 
      i.status === 'معلق' && i.due_date < today
    ).length;

    const activeLoans = loans.filter(l => l.status === 'نشط').length;
    const totalAmount = loans.reduce((sum, l) => sum + (l.loan_amount || 0), 0);

    return {
      totalLoans: loans.length,
      activeLoans,
      totalAmount,
      totalPaid: 0,
      totalRemaining: totalAmount,
      overdueInstallments,
    };
  }

  /**
   * جلب الفزعات الطارئة
   */
  static async getEmergencyAids() {
    const { data, error } = await supabase
      .from('emergency_aid')
      .select(`*, beneficiaries (full_name, national_id, phone)`)
      .order('requested_date', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  /**
   * إنشاء فزعة طارئة
   */
  static async createEmergencyAid(aid: {
    beneficiary_id: string;
    amount: number;
    reason: string;
    urgency_level?: 'low' | 'medium' | 'high' | 'critical';
    aid_type?: string;
    notes?: string;
  }) {
    const { data, error } = await supabase
      .from('emergency_aid')
      .insert([aid])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  /**
   * تحديث فزعة طارئة
   */
  static async updateEmergencyAid(id: string, updates: {
    status?: string;
    notes?: string;
    approved_by?: string;
    approved_date?: string;
    disbursed_by?: string;
    disbursed_date?: string;
  }) {
    const { data, error } = await supabase
      .from('emergency_aid')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  /**
   * حذف فزعة طارئة
   */
  static async deleteEmergencyAid(id: string): Promise<void> {
    const { error } = await supabase
      .from('emergency_aid')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  /**
   * جلب جميع القروض مع بيانات المستفيد
   */
  static async getAllWithBeneficiary() {
    const { data, error } = await supabase
      .from('loans')
      .select(`
        *,
        beneficiaries (
          full_name,
          national_id
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return (data || []).map(loan => ({
      ...loan,
      beneficiary: loan.beneficiaries,
    }));
  }

  /**
   * جلب دفعات القروض
   */
  static async getLoanPayments(loanId?: string) {
    let query = supabase
      .from('loan_payments')
      .select('id, loan_id, installment_id, payment_number, payment_amount, payment_date, payment_method, journal_entry_id, notes, created_at')
      .order('created_at', { ascending: false });

    if (loanId) {
      query = query.eq('loan_id', loanId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  /**
   * إضافة دفعة قرض
   */
  static async addLoanPayment(payment: {
    loan_id: string;
    installment_id?: string;
    payment_amount: number;
    payment_date: string;
    payment_method: string;
    notes?: string;
  }) {
    const { data, error } = await supabase
      .from('loan_payments')
      .insert([payment])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * تحديث دفعة قرض بـ journal_entry_id
   */
  static async updateLoanPaymentJournalEntry(paymentId: string, journalEntryId: string) {
    const { error } = await supabase
      .from('loan_payments')
      .update({ journal_entry_id: journalEntryId })
      .eq('id', paymentId);

    if (error) throw error;
  }

  /**
   * جلب جدول أقساط القرض
   */
  static async getLoanSchedules(loanId: string) {
    const { data, error } = await supabase
      .from('loan_schedules')
      .select('*')
      .eq('loan_id', loanId)
      .order('installment_number');

    if (error) throw error;
    return data || [];
  }

  /**
   * جلب القروض مع الموافقات للإدارة
   */
  static async getLoansWithApprovals() {
    const { data, error } = await supabase
      .from('loans')
      .select(`
        *,
        beneficiaries(full_name, national_id),
        loan_approvals(*)
      `)
      .in('status', ['pending', 'active'])
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * تحديث موافقة قرض
   */
  static async updateLoanApproval(
    approvalId: string, 
    updates: { 
      status: string; 
      notes: string; 
      approved_at: string; 
      approver_id?: string 
    }
  ) {
    const { error } = await supabase
      .from('loan_approvals')
      .update(updates)
      .eq('id', approvalId);

    if (error) throw error;
  }

  /**
   * جلب موافقات قرض معين
   */
  static async getLoanApprovalsByLoanId(loanId: string) {
    const { data, error } = await supabase
      .from('loan_approvals')
      .select('status')
      .eq('loan_id', loanId);

    if (error) throw error;
    return data || [];
  }

  /**
   * جلب بيانات قرض للقيد المحاسبي
   */
  static async getLoanForJournalEntry(loanId: string) {
    const { data, error } = await supabase
      .from('loans')
      .select('loan_number, loan_amount, beneficiaries(full_name)')
      .eq('id', loanId)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  /**
   * تقرير أعمار القروض
   */
  static async getAgingReport() {
    const { data: loans, error } = await supabase
      .from('loans')
      .select(`
        id,
        loan_number,
        loan_amount,
        start_date,
        status,
        beneficiaries!inner(full_name)
      `)
      .in('status', ['active', 'defaulted']);
    
    if (error) throw error;

    return (loans || []).map((loan) => {
      const totalPaid = 0;
      const remainingBalance = Number(loan.loan_amount) - totalPaid;
      const daysOverdue = 0;
      
      let agingCategory = 'حديث (0-30 يوم)';
      if (daysOverdue > 90) agingCategory = 'خطير (90+ يوم)';
      else if (daysOverdue > 60) agingCategory = 'متأخر جداً (60-90 يوم)';
      else if (daysOverdue > 30) agingCategory = 'متأخر (30-60 يوم)';

      const beneficiaryData = loan.beneficiaries as unknown as { full_name: string };

      return {
        loan_id: loan.id,
        loan_number: loan.loan_number,
        beneficiary_name: beneficiaryData?.full_name || 'غير محدد',
        principal_amount: Number(loan.loan_amount),
        total_paid: totalPaid,
        remaining_balance: remainingBalance,
        days_overdue: daysOverdue,
        aging_category: agingCategory,
      };
    }).sort((a, b) => b.days_overdue - a.days_overdue);
  }

  // =====================
  // Emergency Aid Approvals (from useEmergencyAidApprovals)
  // =====================

  /**
   * جلب طلبات الفزعة المعلقة
   */
  static async getPendingEmergencyRequests() {
    const { data, error } = await supabase
      .from('emergency_aid_requests')
      .select(`
        *,
        beneficiaries!inner(
          full_name,
          national_id
        )
      `)
      .eq('status', 'معلق')
      .order('sla_due_at', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  /**
   * الموافقة على طلب فزعة
   */
  static async approveEmergencyRequest(
    id: string, 
    amount: number, 
    notes?: string
  ): Promise<void> {
    const { error } = await supabase
      .from('emergency_aid_requests')
      .update({
        status: 'معتمد',
        amount_approved: amount,
        approved_at: new Date().toISOString(),
        notes,
      })
      .eq('id', id);

    if (error) throw error;
  }

  /**
   * رفض طلب فزعة
   */
  static async rejectEmergencyRequest(id: string, reason: string): Promise<void> {
    const { error } = await supabase
      .from('emergency_aid_requests')
      .update({
        status: 'مرفوض',
        rejected_at: new Date().toISOString(),
        rejection_reason: reason,
      })
      .eq('id', id);

    if (error) throw error;
  }
}
