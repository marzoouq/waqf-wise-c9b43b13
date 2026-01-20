/**
 * Beneficiary Tabs Service - خدمة بيانات تبويبات المستفيدين
 * @version 2.8.82
 */

import { supabase } from '@/integrations/supabase/client';
import { productionLogger } from '@/lib/logger/production-logger';
import type { Database } from '@/integrations/supabase/types';
import type { Beneficiary } from '@/types/beneficiary';
import { BeneficiaryCoreService } from './core.service';

export interface ApprovalLogItem {
  id: string;
  approval_type: string;
  approval_id: string;
  reference_id: string;
  action: string;
  performed_by: string | null;
  performed_by_name: string | null;
  notes: string | null;
  created_at: string;
}

export interface BeneficiaryBankAccount {
  id: string;
  bank_name: string;
  account_number: string;
  iban: string | null;
  is_active: boolean;
  current_balance: number;
  currency: string;
}

export class BeneficiaryTabsService {
  /**
   * جلب توزيعات المستفيد
   */
  static async getDistributions(beneficiaryId: string): Promise<Database['public']['Tables']['heir_distributions']['Row'][]> {
    try {
      const { data, error } = await supabase
        .from('heir_distributions')
        .select('*')
        .eq('beneficiary_id', beneficiaryId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      productionLogger.error('Error fetching distributions', error);
      throw error;
    }
  }

  /**
   * جلب مستفيد بـ user_id
   */
  static async getByUserId(userId: string): Promise<Beneficiary | null> {
    try {
      const { data, error } = await supabase
        .from('beneficiaries')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;
      return data as Beneficiary | null;
    } catch (error) {
      productionLogger.error('Error fetching beneficiary by user ID', error);
      throw error;
    }
  }

  /**
   * جلب ID المستفيد بـ user_id
   */
  static async getBeneficiaryIdByUserId(userId: string): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('beneficiaries')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;
      return data?.id || null;
    } catch (error) {
      productionLogger.error('Error fetching beneficiary ID', error);
      throw error;
    }
  }

  /**
   * جلب بيانات المستفيد للكشف
   */
  static async getAccountStatementData(userId: string) {
    try {
      const { data, error } = await supabase
        .from('beneficiaries')
        .select('id, full_name, beneficiary_number, account_balance, total_received')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error('لم يتم العثور على بيانات المستفيد');
      return data;
    } catch (error) {
      productionLogger.error('Error fetching account statement data', error);
      throw error;
    }
  }

  /**
   * جلب مدفوعات المستفيد
   */
  static async getBeneficiaryPayments(beneficiaryId: string, filters?: {
    dateFrom?: string;
    dateTo?: string;
    paymentMethod?: string;
  }) {
    try {
      let query = supabase
        .from('payments')
        .select('id, amount, payment_date, description, payment_method')
        .eq('beneficiary_id', beneficiaryId)
        .order('payment_date', { ascending: false });

      if (filters?.dateFrom) query = query.gte('payment_date', filters.dateFrom);
      if (filters?.dateTo) query = query.lte('payment_date', filters.dateTo);
      if (filters?.paymentMethod && filters.paymentMethod !== 'all') {
        query = query.eq('payment_method', filters.paymentMethod);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (error) {
      productionLogger.error('Error fetching beneficiary payments', error);
      throw error;
    }
  }

  /**
   * جلب ملف المستفيد الكامل
   */
  static async getProfile(userId: string) {
    try {
      const { data: beneficiary, error: beneficiaryError } = await supabase
        .from('beneficiaries')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (beneficiaryError) throw beneficiaryError;
      if (!beneficiary) throw new Error('لم يتم العثور على حساب مستفيد');

      const { data: payments, error: paymentsError } = await supabase
        .from('payments')
        .select('id, payment_number, payment_date, amount, description')
        .eq('beneficiary_id', beneficiary.id)
        .order('payment_date', { ascending: false })
        .limit(50);

      if (paymentsError) throw paymentsError;

      return { beneficiary, payments: payments || [] };
    } catch (error) {
      productionLogger.error('Error fetching beneficiary profile', error);
      throw error;
    }
  }

  /**
   * تحديث جلسة المستفيد
   */
  static async updateSession(sessionId: string | null, beneficiaryId: string, userId: string | undefined, page: string) {
    try {
      if (sessionId) {
        await supabase
          .from('beneficiary_sessions')
          .update({
            current_page: page,
            last_activity: new Date().toISOString(),
            is_online: true,
          })
          .eq('id', sessionId);
        return sessionId;
      } else {
        const { data, error } = await supabase
          .from('beneficiary_sessions')
          .insert({
            beneficiary_id: beneficiaryId,
            user_id: userId,
            current_page: page,
            is_online: true,
          })
          .select('id')
          .maybeSingle();

        if (error) throw error;
        return data?.id || null;
      }
    } catch (error) {
      productionLogger.error('Error updating beneficiary session', error);
      return null;
    }
  }

  /**
   * إنهاء جلسة المستفيد
   */
  static async endSession(sessionId: string) {
    try {
      await supabase
        .from('beneficiary_sessions')
        .update({
          is_online: false,
          last_activity: new Date().toISOString(),
        })
        .eq('id', sessionId);
    } catch (error) {
      productionLogger.error('Error ending beneficiary session', error);
    }
  }

  /**
   * جلب طلبات المستفيد
   */
  static async getRequests(beneficiaryId: string): Promise<Database['public']['Tables']['beneficiary_requests']['Row'][]> {
    try {
      const { data, error } = await supabase
        .from('beneficiary_requests')
        .select('*, request_types(*)')
        .eq('beneficiary_id', beneficiaryId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      productionLogger.error('Error fetching requests', error);
      throw error;
    }
  }

  /**
   * إنشاء طلب جديد
   */
  static async createRequest(beneficiaryId: string, data: {
    request_type_id: string;
    description: string;
    amount?: number;
    priority?: string;
  }): Promise<Database['public']['Tables']['beneficiary_requests']['Row']> {
    try {
      const { data: request, error } = await supabase
        .from('beneficiary_requests')
        .insert([{
          beneficiary_id: beneficiaryId,
          ...data,
          status: 'submitted',
          submitted_at: new Date().toISOString(),
        }])
        .select()
        .maybeSingle();

      if (error) throw error;
      if (!request) throw new Error("فشل في إنشاء الطلب");
      return request;
    } catch (error) {
      productionLogger.error('Error creating request', error);
      throw error;
    }
  }

  /**
   * جلب شجرة العائلة
   */
  static async getFamilyTree(beneficiaryId: string): Promise<{
    beneficiary: Beneficiary;
    familyMembers: Beneficiary[];
    family: Database['public']['Tables']['families']['Row'] | null;
  }> {
    try {
      const beneficiary = await BeneficiaryCoreService.getById(beneficiaryId);
      if (!beneficiary) throw new Error('المستفيد غير موجود');

      let family = null;
      let familyMembers: Beneficiary[] = [];

      const { data: rawBen } = await supabase
        .from('beneficiaries')
        .select('family_id')
        .eq('id', beneficiaryId)
        .maybeSingle();

      if (rawBen?.family_id) {
        const { data: familyData } = await supabase
          .from('families')
          .select('*')
          .eq('id', rawBen.family_id)
          .maybeSingle();
        family = familyData;

        familyMembers = await BeneficiaryCoreService.getFamilyMembers(beneficiaryId);
      }

      return { beneficiary, familyMembers, family };
    } catch (error) {
      productionLogger.error('Error fetching family tree', error);
      throw error;
    }
  }

  /**
   * جلب الإفصاحات للمستفيد
   */
  static async getDisclosures(beneficiaryId: string): Promise<Database['public']['Tables']['annual_disclosures']['Row'][]> {
    try {
      const { data, error } = await supabase
        .from('annual_disclosures')
        .select('*')
        .eq('status', 'published')
        .order('year', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      productionLogger.error('Error fetching disclosures', error);
      throw error;
    }
  }

  /**
   * جلب طلبات المستفيد السنوية
   */
  static async getYearlyRequests(beneficiaryId: string, year: string) {
    try {
      const { data, error } = await supabase
        .from('beneficiary_requests')
        .select('status, amount, created_at')
        .eq('beneficiary_id', beneficiaryId)
        .gte('created_at', `${year}-01-01`)
        .lte('created_at', `${year}-12-31`);

      if (error) throw error;
      return data || [];
    } catch (error) {
      productionLogger.error('Error fetching yearly requests', error);
      throw error;
    }
  }

  /**
   * جلب إحصائيات تكامل المستفيد
   */
  static async getIntegrationStats(beneficiaryId: string) {
    try {
      const [paymentsRes, documentsRes, requestsRes, activeRequestsRes, beneficiaryRes] = await Promise.all([
        supabase.from("payments").select("*", { count: "exact", head: true }).eq("beneficiary_id", beneficiaryId),
        supabase.from("beneficiary_attachments").select("*", { count: "exact", head: true }).eq("beneficiary_id", beneficiaryId),
        supabase.from("beneficiary_requests").select("*", { count: "exact", head: true }).eq("beneficiary_id", beneficiaryId),
        supabase.from("beneficiary_requests").select("*", { count: "exact", head: true }).eq("beneficiary_id", beneficiaryId).in("status", ["معلق", "قيد المعالجة", "قيد المراجعة"]),
        supabase.from("beneficiaries").select("family_name, is_head_of_family").eq("id", beneficiaryId).maybeSingle()
      ]);

      return {
        paymentsCount: paymentsRes.count || 0,
        documentsCount: documentsRes.count || 0,
        requestsCount: requestsRes.count || 0,
        activeRequestsCount: activeRequestsRes.count || 0,
        familyName: beneficiaryRes.data?.family_name || null,
        isHeadOfFamily: beneficiaryRes.data?.is_head_of_family || false,
      };
    } catch (error) {
      productionLogger.error('Error fetching integration stats', error);
      throw error;
    }
  }

  /**
   * جلب ملخص توزيعات الوقف للمستفيد
   */
  static async getWaqfDistributionsSummary(beneficiaryId: string) {
    try {
      const { data, error } = await supabase
        .from("heir_distributions")
        .select(`
          id,
          share_amount,
          heir_type,
          distribution_date,
          fiscal_year_id,
          fiscal_years (
            name,
            start_date,
            end_date,
            is_closed,
            is_active
          )
        `)
        .eq("beneficiary_id", beneficiaryId)
        .order("distribution_date", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      productionLogger.error('Error fetching waqf distributions summary', error);
      throw error;
    }
  }

  /**
   * جلب قائمة مختصرة للمستفيدين (للناظر)
   */
  static async getQuickList(limit: number = 20) {
    try {
      const { data, error } = await supabase
        .from("beneficiaries")
        .select("id, full_name, phone, email, status, category, total_received, account_balance, national_id")
        .order("created_at", { ascending: false })
        .limit(limit);

      // إذا كان خطأ صلاحيات، أرجع قائمة فارغة
      if (error) {
        if (error.code === '42501' || error.message?.includes('permission')) {
          return [];
        }
        productionLogger.warn('Error fetching quick beneficiaries list', error);
        return [];
      }
      return data || [];
    } catch (error) {
      // تجاهل الأخطاء وأرجع قائمة فارغة
      productionLogger.warn('Error fetching quick beneficiaries list', error);
      return [];
    }
  }

  /**
   * جلب سجل الموافقات
   */
  static async getApprovalsLog(limit: number = 50): Promise<ApprovalLogItem[]> {
    const { data, error } = await supabase
      .from("approval_history")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data || []) as ApprovalLogItem[];
  }

  /**
   * جلب الحسابات البنكية للوقف
   */
  static async getWaqfBankAccounts(): Promise<BeneficiaryBankAccount[]> {
    const { data, error } = await supabase
      .from("bank_accounts")
      .select("*")
      .eq("is_active", true);

    if (error) throw error;
    return (data || []) as BeneficiaryBankAccount[];
  }

  /**
   * جلب كشوفات المستفيد (المدفوعات) - بيانات بسيطة للتبويبات
   */
  static async getStatementsSimple(beneficiaryId: string) {
    const { data, error } = await supabase
      .from("payments")
      .select("*")
      .eq("beneficiary_id", beneficiaryId)
      .order("payment_date", { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * جلب الإفصاحات السنوية
   */
  static async getAnnualDisclosures(limit: number = 10) {
    const { data, error } = await supabase
      .from("annual_disclosures")
      .select("*")
      .order("year", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  /**
   * جلب بيانات مخطط التوزيع
   */
  static async getDistributionChartData() {
    const { data: latestDistribution, error: distError } = await supabase
      .from("distributions")
      .select("id, total_amount")
      .eq("status", "معتمد")
      .order("distribution_date", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (distError || !latestDistribution) {
      return [];
    }

    const { data: details, error: detailsError } = await supabase
      .from("distribution_details")
      .select("allocated_amount, beneficiary_type")
      .eq("distribution_id", latestDistribution.id);

    if (detailsError || !details?.length) {
      return [];
    }

    const typeData: { [key: string]: number } = {};
    
    details.forEach((detail) => {
      const type = detail.beneficiary_type || 'أخرى';
      if (!typeData[type]) {
        typeData[type] = 0;
      }
      typeData[type] += Number(detail.allocated_amount || 0);
    });

    const total = Object.values(typeData).reduce((sum, val) => sum + val, 0);

    if (total === 0) return [];

    return Object.entries(typeData).map(([name, value]) => ({
      name,
      value: Math.round(value),
      percentage: Math.round((value / total) * 100),
    }));
  }

  /**
   * جلب طلبات المستفيد
   */
  static async getRequestsWithTypes(beneficiaryId: string) {
    const { data, error } = await supabase
      .from("beneficiary_requests")
      .select(`
        *,
        request_types (
          name_ar,
          requires_amount
        )
      `)
      .eq("beneficiary_id", beneficiaryId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * جلب مقارنة سنوية للمستفيد
   */
  static async getYearlyComparison(beneficiaryId: string) {
    const currentYear = new Date().getFullYear();
    const years = [currentYear - 1, currentYear];

    const results = await Promise.all(
      years.map(async (year) => {
        const { data, error } = await supabase
          .from("payments")
          .select("amount")
          .eq("beneficiary_id", beneficiaryId)
          .gte("payment_date", `${year}-01-01`)
          .lte("payment_date", `${year}-12-31`);

        if (error) throw error;

        const total = data?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;
        const count = data?.length || 0;

        return {
          year: year.toString(),
          total,
          count,
          average: count > 0 ? total / count : 0,
        };
      })
    );

    return results;
  }

  /**
   * استيراد مستفيدين من ملف
   */
  static async importBeneficiaries(beneficiaries: Array<{
    full_name: string;
    national_id: string;
    phone: string;
    gender: string;
    relationship: string;
    category: string;
    nationality: string;
  }>): Promise<void> {
    const records = beneficiaries.map(b => ({
      ...b,
      status: 'نشط',
    }));

    const { error } = await supabase
      .from('beneficiaries')
      .insert(records);

    if (error) throw error;
  }

  /**
   * رفع مرفقات المستفيد
   */
  static async uploadAttachment(
    beneficiaryId: string,
    file: File
  ): Promise<{ filePath: string }> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${beneficiaryId}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('beneficiary-attachments')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    const { error: dbError } = await supabase
      .from('beneficiary_attachments')
      .insert({
        beneficiary_id: beneficiaryId,
        file_name: file.name,
        file_path: fileName,
        file_type: file.type.split('/')[0] || 'document',
        file_size: file.size,
        mime_type: file.type,
      });

    if (dbError) throw dbError;

    return { filePath: fileName };
  }

  /**
   * حذف مرفق المستفيد
   */
  static async deleteAttachment(attachmentId: string, filePath: string): Promise<void> {
    // لا نحذف الملف من Storage، نقوم فقط بـ soft delete للسجل
    const { data: { user } } = await supabase.auth.getUser();
    
    const { error: dbError } = await supabase
      .from('beneficiary_attachments')
      .update({
        deleted_at: new Date().toISOString(),
        deleted_by: user?.id,
        deletion_reason: 'حذف بواسطة المستخدم'
      })
      .eq('id', attachmentId);

    if (dbError) throw dbError;
  }

  /**
   * إنشاء حساب مصادقة للمستفيد
   */
  static async createAuthAccount(
    beneficiary: { id: string; full_name: string; email: string },
    password: string
  ): Promise<{ userId: string }> {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: beneficiary.email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: { full_name: beneficiary.full_name }
      }
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('فشل إنشاء الحساب');

    const { error: updateError } = await supabase
      .from('beneficiaries')
      .update({
        user_id: authData.user.id,
        can_login: true,
        login_enabled_at: new Date().toISOString()
      })
      .eq('id', beneficiary.id);

    if (updateError) throw updateError;

    return { userId: authData.user.id };
  }

  /**
   * تفعيل/تعطيل حساب المستفيد
   */
  static async toggleLogin(beneficiaryId: string, enabled: boolean): Promise<void> {
    const { error } = await supabase
      .from('beneficiaries')
      .update({
        can_login: enabled,
        updated_at: new Date().toISOString()
      })
      .eq('id', beneficiaryId);

    if (error) throw error;
  }

  /**
   * تقييم أهلية المستفيد باستخدام RPC
   */
  static async assessEligibilityRPC(beneficiaryId: string): Promise<{
    score: number;
    status: string;
    max_score: number;
  }> {
    const { data, error } = await supabase.rpc('auto_assess_eligibility', {
      p_beneficiary_id: beneficiaryId,
    });

    if (error) throw error;
    return data as { score: number; status: string; max_score: number };
  }
}
