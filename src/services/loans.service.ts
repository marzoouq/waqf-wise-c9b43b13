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
      .single();
    
    if (error) throw error;
    return loan as LoanWithInstallments;
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
}
