/**
 * Beneficiary Core Service - خدمة العمليات الأساسية للمستفيدين
 * @version 2.8.82
 */

import { supabase } from '@/integrations/supabase/client';
import { productionLogger } from '@/lib/logger/production-logger';
import type { Beneficiary } from '@/types/beneficiary';

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

export class BeneficiaryCoreService {
  /**
   * جلب قائمة المستفيدين مع الفلاتر
   */
  static async getAll(filters?: BeneficiaryFilters): Promise<{ data: Beneficiary[]; count: number }> {
    try {
      let query = supabase
        .from('beneficiaries')
        .select('*', { count: 'exact' });

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
   * 🔐 SECURITY: RLS يتحقق من صلاحية الوصول على مستوى قاعدة البيانات
   */
  static async getById(id: string, options?: { skipAuthCheck?: boolean }): Promise<Beneficiary | null> {
    try {
      // التحقق من صحة UUID
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(id)) {
        productionLogger.warn('Invalid beneficiary ID format', { id });
        return null;
      }

      const { data, error } = await supabase
        .from('beneficiaries')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        // إذا كان الخطأ بسبب RLS، نعيد null بدلاً من رمي خطأ
        if (error.code === 'PGRST116' || error.message?.includes('permission')) {
          productionLogger.warn('Access denied to beneficiary', { id });
          return null;
        }
        throw error;
      }
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
      const existing = await this.getByNationalId(beneficiary.national_id);
      if (existing) {
        throw new Error('رقم الهوية مسجل مسبقاً');
      }

      const { data, error } = await supabase
        .from('beneficiaries')
        .insert([beneficiary])
        .select()
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error('فشل إنشاء المستفيد');
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
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error('المستفيد غير موجود');
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
        active: data?.filter(b => b.status === 'نشط' || b.status === 'active').length || 0,
        inactive: data?.filter(b => b.status === 'غير نشط' || b.status === 'inactive').length || 0,
        pending: data?.filter(b => b.status === 'معلق' || b.status === 'pending').length || 0,
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
   * جلب أفراد العائلة
   */
  static async getFamilyMembers(beneficiaryId: string): Promise<Beneficiary[]> {
    try {
      const { data: beneficiary } = await supabase
        .from('beneficiaries')
        .select('family_id')
        .eq('id', beneficiaryId)
        .maybeSingle();

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
   * جلب فئات المستفيدين
   */
  static async getCategories() {
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
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error('المستفيد غير موجود');
      return data as Beneficiary;
    } catch (error) {
      productionLogger.error('Error updating notification preferences', error);
      throw error;
    }
  }
}
