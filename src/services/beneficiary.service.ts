/**
 * Beneficiary Service - خدمة إدارة المستفيدين
 * 
 * تحتوي على منطق الأعمال المتعلق بالمستفيدين
 */

import { supabase } from '@/integrations/supabase/client';
import { productionLogger } from '@/lib/logger/production-logger';
import type { Beneficiary } from '@/types/beneficiary';
import type { Database, Json } from '@/integrations/supabase/types';

export interface BeneficiaryFilters {
  status?: string;
  category?: string;
  search?: string;
  tribe?: string;
  verificationStatus?: string;
  page?: number;
  limit?: number;
}

export interface BeneficiaryStats {
  total: number;
  active: number;
  inactive: number;
  pending: number;
  totalPaid: number;
  totalPending: number;
}

export class BeneficiaryService {
  /**
   * جلب قائمة المستفيدين مع الفلاتر
   */
  static async getAll(filters?: BeneficiaryFilters): Promise<{ data: Beneficiary[]; count: number }> {
    try {
      let query = supabase
        .from('beneficiaries')
        .select('*', { count: 'exact' });

      // تطبيق الفلاتر
      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }
      if (filters?.category && filters.category !== 'all') {
        query = query.eq('category', filters.category);
      }
      if (filters?.tribe && filters.tribe !== 'all') {
        query = query.eq('tribe', filters.tribe);
      }
      if (filters?.verificationStatus && filters.verificationStatus !== 'all') {
        query = query.eq('verification_status', filters.verificationStatus);
      }
      if (filters?.search) {
        query = query.or(`full_name.ilike.%${filters.search}%,national_id.ilike.%${filters.search}%,phone.ilike.%${filters.search}%`);
      }

      // ترتيب وتقسيم الصفحات
      query = query.order('created_at', { ascending: false });
      
      if (filters?.page && filters?.limit) {
        const from = (filters.page - 1) * filters.limit;
        const to = from + filters.limit - 1;
        query = query.range(from, to);
      }

      const { data, error, count } = await query;

      if (error) throw error;
      return { data: (data || []) as Beneficiary[], count: count || 0 };
    } catch (error) {
      productionLogger.error('Error fetching beneficiaries', error);
      throw error;
    }
  }

  /**
   * جلب مستفيد واحد بالـ ID
   */
  static async getById(id: string): Promise<Beneficiary | null> {
    try {
      const { data, error } = await supabase
        .from('beneficiaries')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data as Beneficiary | null;
    } catch (error) {
      productionLogger.error('Error fetching beneficiary', error);
      throw error;
    }
  }

  /**
   * جلب مستفيد بـ National ID
   */
  static async getByNationalId(nationalId: string): Promise<Beneficiary | null> {
    try {
      const { data, error } = await supabase
        .from('beneficiaries')
        .select('*')
        .eq('national_id', nationalId)
        .maybeSingle();

      if (error) throw error;
      return data as Beneficiary | null;
    } catch (error) {
      productionLogger.error('Error fetching beneficiary by national ID', error);
      throw error;
    }
  }

  /**
   * إضافة مستفيد جديد
   */
  static async create(beneficiary: Omit<Beneficiary, 'id' | 'created_at' | 'updated_at'>): Promise<Beneficiary> {
    try {
      // التحقق من عدم تكرار رقم الهوية
      const existing = await this.getByNationalId(beneficiary.national_id);
      if (existing) {
        throw new Error('رقم الهوية مسجل مسبقاً');
      }

      const { data, error } = await supabase
        .from('beneficiaries')
        .insert([beneficiary])
        .select()
        .single();

      if (error) throw error;
      return data as Beneficiary;
    } catch (error) {
      productionLogger.error('Error creating beneficiary', error);
      throw error;
    }
  }

  /**
   * تحديث بيانات مستفيد
   */
  static async update(id: string, updates: Partial<Beneficiary>): Promise<Beneficiary> {
    try {
      const { data, error } = await supabase
        .from('beneficiaries')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Beneficiary;
    } catch (error) {
      productionLogger.error('Error updating beneficiary', error);
      throw error;
    }
  }

  /**
   * حذف مستفيد
   */
  static async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('beneficiaries')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      productionLogger.error('Error deleting beneficiary', error);
      throw error;
    }
  }

  /**
   * تغيير حالة مستفيد
   */
  static async updateStatus(id: string, status: string): Promise<Beneficiary> {
    return this.update(id, { status });
  }

  /**
   * التحقق من هوية مستفيد
   */
  static async verify(id: string, verifiedBy: string, notes?: string): Promise<Beneficiary> {
    return this.update(id, {
      verification_status: 'verified',
      verified_at: new Date().toISOString(),
      verified_by: verifiedBy,
      verification_notes: notes,
    });
  }

  /**
   * جلب إحصائيات المستفيدين
   */
  static async getStats(): Promise<BeneficiaryStats> {
    try {
      const { data, error } = await supabase
        .from('beneficiaries')
        .select('status, total_received, pending_amount');

      if (error) throw error;

      const stats: BeneficiaryStats = {
        total: data?.length || 0,
        active: data?.filter(b => b.status === 'active').length || 0,
        inactive: data?.filter(b => b.status === 'inactive').length || 0,
        pending: data?.filter(b => b.status === 'pending').length || 0,
        totalPaid: data?.reduce((sum, b) => sum + (b.total_received || 0), 0) || 0,
        totalPending: data?.reduce((sum, b) => sum + (b.pending_amount || 0), 0) || 0,
      };

      return stats;
    } catch (error) {
      productionLogger.error('Error fetching beneficiary stats', error);
      throw error;
    }
  }

  /**
   * جلب إحصائيات مستفيد محدد
   */
  static async getStatistics(beneficiaryId: string) {
    try {
      const { data, error } = await supabase
        .from('beneficiaries')
        .select('total_received, pending_amount, total_payments, pending_requests')
        .eq('id', beneficiaryId)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      productionLogger.error('Error fetching beneficiary statistics', error);
      throw error;
    }
  }

  /**
   */
  static async getFamilyMembers(beneficiaryId: string): Promise<Beneficiary[]> {
    try {
      const { data: beneficiary } = await supabase
        .from('beneficiaries')
        .select('family_id')
        .eq('id', beneficiaryId)
        .single();

      if (!beneficiary?.family_id) return [];

      const { data, error } = await supabase
        .from('beneficiaries')
        .select('*')
        .eq('family_id', beneficiary.family_id)
        .neq('id', beneficiaryId);

      if (error) throw error;
      return (data || []) as Beneficiary[];
    } catch (error) {
      productionLogger.error('Error fetching family members', error);
      throw error;
    }
  }

  /**
   * البحث المتقدم
   */
  static async advancedSearch(params: {
    query?: string;
    status?: string[];
    categories?: string[];
    tribes?: string[];
    minAge?: number;
    maxAge?: number;
    hasBank?: boolean;
  }): Promise<Beneficiary[]> {
    try {
      let query = supabase.from('beneficiaries').select('*');

      if (params.query) {
        query = query.or(`full_name.ilike.%${params.query}%,national_id.ilike.%${params.query}%`);
      }
      if (params.status?.length) {
        query = query.in('status', params.status);
      }
      if (params.categories?.length) {
        query = query.in('category', params.categories);
      }
      if (params.tribes?.length) {
        query = query.in('tribe', params.tribes);
      }
      if (params.hasBank !== undefined) {
        if (params.hasBank) {
          query = query.not('iban', 'is', null);
        } else {
          query = query.is('iban', null);
        }
      }

      const { data, error } = await query.order('full_name');
      if (error) throw error;
      return (data || []) as Beneficiary[];
    } catch (error) {
      productionLogger.error('Error in advanced search', error);
      throw error;
    }
  }

  /**
   * جلب سجل نشاط المستفيد
   */
  static async getActivity(beneficiaryId: string): Promise<Database['public']['Tables']['beneficiary_activity_log']['Row'][]> {
    try {
      const { data, error } = await supabase
        .from('beneficiary_activity_log')
        .select('*')
        .eq('beneficiary_id', beneficiaryId)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data || [];
    } catch (error) {
      productionLogger.error('Error fetching beneficiary activity', error);
      throw error;
    }
  }

  /**
   * جلب مستندات المستفيد
   */
  static async getDocuments(beneficiaryId: string): Promise<Database['public']['Tables']['beneficiary_attachments']['Row'][]> {
    try {
      const { data, error } = await supabase
        .from('beneficiary_attachments')
        .select('*')
        .eq('beneficiary_id', beneficiaryId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      productionLogger.error('Error fetching beneficiary documents', error);
      throw error;
    }
  }

  /**
   * رفع مستند للمستفيد
   */
  static async uploadDocument(beneficiaryId: string, file: File, fileType: string, description?: string): Promise<Database['public']['Tables']['beneficiary_attachments']['Row']> {
    try {
      const filePath = `beneficiaries/${beneficiaryId}/${Date.now()}_${file.name}`;
      
      const { error: uploadError } = await supabase.storage
        .from('beneficiary-documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data, error } = await supabase
        .from('beneficiary_attachments')
        .insert([{
          beneficiary_id: beneficiaryId,
          file_name: file.name,
          file_path: filePath,
          file_type: fileType,
          file_size: file.size,
          mime_type: file.type,
          description,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      productionLogger.error('Error uploading document', error);
      throw error;
    }
  }

  /**
   * حذف مستند
   */
  static async deleteDocument(documentId: string): Promise<void> {
    try {
      const { data: doc } = await supabase
        .from('beneficiary_attachments')
        .select('file_path')
        .eq('id', documentId)
        .single();

      if (doc?.file_path) {
        await supabase.storage
          .from('beneficiary-documents')
          .remove([doc.file_path]);
      }

      const { error } = await supabase
        .from('beneficiary_attachments')
        .delete()
        .eq('id', documentId);

      if (error) throw error;
    } catch (error) {
      productionLogger.error('Error deleting document', error);
      throw error;
    }
  }

  /**
   * جلب الحسابات البنكية للمستفيد
   */
  static async getBankAccounts(beneficiaryId: string): Promise<{ iban: string; bank_name: string; account_number: string }[]> {
    try {
      const { data, error } = await supabase
        .from('beneficiaries')
        .select('iban, bank_name, bank_account_number')
        .eq('id', beneficiaryId)
        .single();

      if (error) throw error;
      
      if (!data?.iban) return [];
      
      return [{
        iban: data.iban,
        bank_name: data.bank_name || '',
        account_number: data.bank_account_number || '',
      }];
    } catch (error) {
      productionLogger.error('Error fetching bank accounts', error);
      throw error;
    }
  }

  /**
   * جلب كشف حساب المستفيد
   */
  static async getStatements(beneficiaryId: string): Promise<{
    transactions: { date: string; description: string; debit: number; credit: number; balance: number }[];
    balance: number;
  }> {
    try {
      const { data: payments, error } = await supabase
        .from('payments')
        .select('*')
        .eq('beneficiary_id', beneficiaryId)
        .order('payment_date', { ascending: true });

      if (error) throw error;

      let balance = 0;
      const transactions = (payments || []).map(p => {
        const amount = p.amount || 0;
        if (p.payment_type === 'receipt') {
          balance += amount;
        } else {
          balance -= amount;
        }
        return {
          date: p.payment_date,
          description: p.description || '',
          debit: p.payment_type === 'payment' ? amount : 0,
          credit: p.payment_type === 'receipt' ? amount : 0,
          balance,
        };
      });

      return { transactions, balance };
    } catch (error) {
      productionLogger.error('Error fetching statements', error);
      throw error;
    }
  }

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
        .single();

      if (error) throw error;
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
      const beneficiary = await this.getById(beneficiaryId);
      if (!beneficiary) throw new Error('المستفيد غير موجود');

      let family = null;
      let familyMembers: Beneficiary[] = [];

      // جلب family_id من الـ raw data
      const { data: rawBen } = await supabase
        .from('beneficiaries')
        .select('family_id')
        .eq('id', beneficiaryId)
        .single();

      if (rawBen?.family_id) {
        const { data: familyData } = await supabase
          .from('families')
          .select('*')
          .eq('id', rawBen.family_id)
          .single();
        family = familyData;

        familyMembers = await this.getFamilyMembers(beneficiaryId);
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
   * جلب سجل المدفوعات
   */
  static async getPaymentsHistory(beneficiaryId: string): Promise<Database['public']['Tables']['payments']['Row'][]> {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('beneficiary_id', beneficiaryId)
        .order('payment_date', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      productionLogger.error('Error fetching payments history', error);
      throw error;
    }
  }

  /**
   * جلب العقارات المرتبطة بالمستفيد
   */
  static async getProperties(beneficiaryId: string): Promise<Database['public']['Tables']['properties']['Row'][]> {
    try {
      // جلب العقارات من خلال العقود
      const { data: contracts, error: contractsError } = await supabase
        .from('contracts')
        .select('property_id')
        .eq('tenant_id', beneficiaryId);

      if (contractsError) throw contractsError;

      if (!contracts || contracts.length === 0) return [];

      const propertyIds = [...new Set(contracts.map(c => c.property_id).filter(Boolean))];
      
      if (propertyIds.length === 0) return [];

      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .in('id', propertyIds);

      if (error) throw error;
      return data || [];
    } catch (error) {
      productionLogger.error('Error fetching properties', error);
      throw error;
    }
  }

  /**
   * تحديث تفضيلات الإشعارات
   */
  static async updateNotificationPreferences(beneficiaryId: string, preferences: {
    email?: boolean;
    sms?: boolean;
    push?: boolean;
  }): Promise<Beneficiary> {
    try {
      const { data, error } = await supabase
        .from('beneficiaries')
        .update({ 
          notification_preferences: preferences,
          updated_at: new Date().toISOString(),
        })
        .eq('id', beneficiaryId)
        .select()
        .single();

      if (error) throw error;
      return data as Beneficiary;
    } catch (error) {
      productionLogger.error('Error updating notification preferences', error);
      throw error;
    }
  }

  /**
   * تفعيل تسجيل الدخول للمستفيد
   */
  static async enableLogin(beneficiaryId: string, email: string): Promise<Beneficiary> {
    try {
      return await this.update(beneficiaryId, {
        can_login: true,
        email,
        login_enabled_at: new Date().toISOString(),
      });
    } catch (error) {
      productionLogger.error('Error enabling login', error);
      throw error;
    }
  }

  /**
   * تقييم أهلية المستفيد
   */
  static async assessEligibility(beneficiaryId: string): Promise<{
    eligible: boolean;
    reasons: string[];
    score: number;
  }> {
    try {
      const beneficiary = await this.getById(beneficiaryId);
      if (!beneficiary) throw new Error('المستفيد غير موجود');

      const reasons: string[] = [];
      let score = 100;

      // التحقق من الحالة
      if (beneficiary.status !== 'active') {
        reasons.push('الحساب غير نشط');
        score -= 50;
      }

      // التحقق من التحقق من الهوية
      if (beneficiary.verification_status !== 'verified') {
        reasons.push('لم يتم التحقق من الهوية');
        score -= 30;
      }

      // التحقق من البيانات البنكية
      if (!beneficiary.iban) {
        reasons.push('لا يوجد حساب بنكي');
        score -= 20;
      }

      return {
        eligible: score >= 50,
        reasons,
        score,
      };
    } catch (error) {
      productionLogger.error('Error assessing eligibility', error);
      throw error;
    }
  }

  /**
   * جلب فئات المستفيدين
   */
  static async getCategories(): Promise<Database['public']['Tables']['beneficiary_categories']['Row'][]> {
    try {
      const { data, error } = await supabase
        .from('beneficiary_categories')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      productionLogger.error('Error fetching categories', error);
      throw error;
    }
  }

  /**
   * جلب طلبات الفزعات الطارئة للمستفيد
   */
  static async getEmergencyAid(beneficiaryId: string): Promise<Database['public']['Tables']['emergency_aid']['Row'][]> {
    try {
      const { data, error } = await supabase
        .from('emergency_aid')
        .select('*')
        .eq('beneficiary_id', beneficiaryId)
        .order('requested_date', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      productionLogger.error('Error fetching emergency aid', error);
      throw error;
    }
  }
}
