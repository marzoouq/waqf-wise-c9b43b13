/**
 * Governance Policies Service - خدمة سياسات الحوكمة
 * @version 1.0.0
 */

import { supabase } from '@/integrations/supabase/client';
import { productionLogger } from '@/lib/logger/production-logger';
import type { Database } from '@/integrations/supabase/types';

type GovernancePolicyRow = Database['public']['Tables']['governance_policies']['Row'];
type GovernancePolicyInsert = Database['public']['Tables']['governance_policies']['Insert'];
type GovernancePolicyUpdate = Database['public']['Tables']['governance_policies']['Update'];

export class GovernancePoliciesService {
  /**
   * جلب جميع سياسات الحوكمة
   */
  static async getPolicies(): Promise<GovernancePolicyRow[]> {
    try {
      const { data, error } = await supabase
        .from('governance_policies')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      productionLogger.error('Error fetching governance policies', error);
      throw error;
    }
  }

  /**
   * جلب السياسات حسب الفئة
   */
  static async getPoliciesByCategory(category: string): Promise<GovernancePolicyRow[]> {
    try {
      const { data, error } = await supabase
        .from('governance_policies')
        .select('*')
        .eq('category', category)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      productionLogger.error('Error fetching policies by category', error);
      throw error;
    }
  }

  /**
   * جلب السياسات النشطة فقط
   */
  static async getActivePolicies(): Promise<GovernancePolicyRow[]> {
    try {
      const { data, error } = await supabase
        .from('governance_policies')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      productionLogger.error('Error fetching active policies', error);
      throw error;
    }
  }

  /**
   * جلب سياسة بالمعرف
   */
  static async getPolicyById(id: string): Promise<GovernancePolicyRow | null> {
    try {
      const { data, error } = await supabase
        .from('governance_policies')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      productionLogger.error('Error fetching governance policy', error);
      throw error;
    }
  }

  /**
   * إنشاء سياسة جديدة
   */
  static async createPolicy(policy: GovernancePolicyInsert): Promise<GovernancePolicyRow> {
    try {
      const { data, error } = await supabase
        .from('governance_policies')
        .insert([policy])
        .select()
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error('فشل إنشاء السياسة');
      return data;
    } catch (error) {
      productionLogger.error('Error creating governance policy', error);
      throw error;
    }
  }

  /**
   * تحديث سياسة
   */
  static async updatePolicy(id: string, updates: GovernancePolicyUpdate): Promise<GovernancePolicyRow> {
    try {
      const { data, error } = await supabase
        .from('governance_policies')
        .update(updates)
        .eq('id', id)
        .select()
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error('السياسة غير موجودة');
      return data;
    } catch (error) {
      productionLogger.error('Error updating governance policy', error);
      throw error;
    }
  }

  /**
   * حذف سياسة
   */
  static async deletePolicy(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('governance_policies')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      productionLogger.error('Error deleting governance policy', error);
      throw error;
    }
  }

  /**
   * الحصول على إحصائيات السياسات
   */
  static async getPoliciesStats(): Promise<{
    totalPolicies: number;
    activePolicies: number;
    categories: { category: string; count: number }[];
  }> {
    try {
      const { count: totalPolicies } = await supabase
        .from('governance_policies')
        .select('*', { count: 'exact', head: true });

      const { count: activePolicies } = await supabase
        .from('governance_policies')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      const { data: policies } = await supabase
        .from('governance_policies')
        .select('category');

      const categoryMap = new Map<string, number>();
      policies?.forEach(p => {
        if (p.category) {
          categoryMap.set(p.category, (categoryMap.get(p.category) || 0) + 1);
        }
      });

      const categories = Array.from(categoryMap.entries()).map(([category, count]) => ({
        category,
        count,
      }));

      return {
        totalPolicies: totalPolicies || 0,
        activePolicies: activePolicies || 0,
        categories,
      };
    } catch (error) {
      productionLogger.error('Error fetching policies stats', error);
      throw error;
    }
  }

  /**
   * الحصول على الفئات المتاحة
   */
  static getAvailableCategories(): string[] {
    return ['توزيع', 'صيانة', 'حوكمة', 'استثمار', 'إدارية', 'قانونية'];
  }

  /**
   * الحصول على أنواع السياسات
   */
  static getPolicyTypes(): string[] {
    return ['distribution', 'maintenance', 'governance', 'investment', 'administrative', 'legal'];
  }
}
