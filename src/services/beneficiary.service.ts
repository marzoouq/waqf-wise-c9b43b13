/**
 * Beneficiary Service - خدمة إدارة المستفيدين
 * 
 * تتولى منطق الأعمال لإدارة المستفيدين
 */

import { supabase } from '@/integrations/supabase/client';
import { productionLogger } from '@/lib/logger/production-logger';

export interface BeneficiaryData {
  full_name: string;
  national_id: string;
  phone: string;
  category: string;
  status?: string;
  bank_name?: string;
  iban?: string;
  [key: string]: unknown;
}

export class BeneficiaryService {
  /**
   * إنشاء مستفيد جديد
   */
  static async create(data: BeneficiaryData): Promise<{ success: boolean; id?: string; message: string }> {
    try {
      // 1. Validation
      if (!data.full_name || !data.national_id || !data.phone) {
        return {
          success: false,
          message: 'البيانات الأساسية مطلوبة',
        };
      }

      // 2. التحقق من عدم تكرار رقم الهوية
      const { data: existing } = await supabase
        .from('beneficiaries')
        .select('id')
        .eq('national_id', data.national_id)
        .single();

      if (existing) {
        return {
          success: false,
          message: 'رقم الهوية موجود مسبقاً',
        };
      }

      // 3. إنشاء المستفيد
      const { data: beneficiary, error } = await supabase
        .from('beneficiaries')
        .insert({
          ...data,
          status: data.status || 'نشط',
        })
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        id: beneficiary.id,
        message: 'تم إضافة المستفيد بنجاح',
      };
    } catch (error) {
      productionLogger.error('BeneficiaryService.create failed', error, {
        context: 'beneficiary_service',
      });
      return {
        success: false,
        message: 'فشل في إضافة المستفيد',
      };
    }
  }

  /**
   * تحديث بيانات مستفيد
   */
  static async update(
    id: string,
    data: Partial<BeneficiaryData>
  ): Promise<{ success: boolean; message: string }> {
    try {
      const { error } = await supabase
        .from('beneficiaries')
        .update(data)
        .eq('id', id);

      if (error) throw error;

      return {
        success: true,
        message: 'تم تحديث البيانات بنجاح',
      };
    } catch (error) {
      productionLogger.error('BeneficiaryService.update failed', error, {
        context: 'beneficiary_service',
      });
      return {
        success: false,
        message: 'فشل في تحديث البيانات',
      };
    }
  }

  /**
   * حذف مستفيد
   */
  static async delete(id: string): Promise<{ success: boolean; message: string }> {
    try {
      // التحقق من عدم وجود مدفوعات أو طلبات مرتبطة
      const { data: payments } = await supabase
        .from('payments')
        .select('id')
        .eq('beneficiary_id', id)
        .limit(1);

      const { data: requests } = await supabase
        .from('beneficiary_requests')
        .select('id')
        .eq('beneficiary_id', id)
        .limit(1);

      if (payments && payments.length > 0) {
        return {
          success: false,
          message: 'لا يمكن حذف المستفيد لوجود مدفوعات مرتبطة',
        };
      }

      if (requests && requests.length > 0) {
        return {
          success: false,
          message: 'لا يمكن حذف المستفيد لوجود طلبات مرتبطة',
        };
      }

      const { error } = await supabase
        .from('beneficiaries')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return {
        success: true,
        message: 'تم حذف المستفيد بنجاح',
      };
    } catch (error) {
      productionLogger.error('BeneficiaryService.delete failed', error, {
        context: 'beneficiary_service',
      });
      return {
        success: false,
        message: 'فشل في حذف المستفيد',
      };
    }
  }

  /**
   * تفعيل تسجيل دخول للمستفيد
   */
  static async enableLogin(
    beneficiaryId: string,
    email: string,
    password: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      // 1. إنشاء حساب auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      if (!authData.user) {
        return {
          success: false,
          message: 'فشل في إنشاء الحساب',
        };
      }

      // 2. ربط المستفيد بالحساب
      const { error: updateError } = await supabase
        .from('beneficiaries')
        .update({
          user_id: authData.user.id,
          can_login: true,
          login_enabled_at: new Date().toISOString(),
          email,
        })
        .eq('id', beneficiaryId);

      if (updateError) throw updateError;

      // 3. إضافة الدور
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: authData.user.id,
          role: 'beneficiary',
        });

      if (roleError) throw roleError;

      return {
        success: true,
        message: 'تم تفعيل تسجيل الدخول بنجاح',
      };
    } catch (error) {
      productionLogger.error('BeneficiaryService.enableLogin failed', error, {
        context: 'beneficiary_service',
      });
      return {
        success: false,
        message: 'فشل في تفعيل تسجيل الدخول',
      };
    }
  }

  /**
   * البحث المتقدم
   */
  static async search(criteria: Record<string, string>) {
    try {
      let query = supabase.from('beneficiaries').select('*');

      if (criteria.category) {
        query = query.eq('category', criteria.category as string);
      }

      if (criteria.status) {
        query = query.eq('status', criteria.status as string);
      }

      if (criteria.tribe) {
        query = query.eq('tribe', criteria.tribe as string);
      }

      if (criteria.city) {
        query = query.eq('city', criteria.city as string);
      }

      if (criteria.gender) {
        query = query.eq('gender', criteria.gender as string);
      }

      if (criteria.marital_status) {
        query = query.eq('marital_status', criteria.marital_status as string);
      }

      const { data, error } = await query;

      if (error) throw error;

      return {
        success: true,
        data,
      };
    } catch (error) {
      productionLogger.error('BeneficiaryService.search failed', error, {
        context: 'beneficiary_service',
      });
      return {
        success: false,
        data: [],
      };
    }
  }
}
