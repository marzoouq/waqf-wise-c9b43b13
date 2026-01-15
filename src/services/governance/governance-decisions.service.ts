/**
 * Governance Decisions Service - خدمة قرارات الحوكمة
 * @version 1.0.0
 */

import { supabase } from '@/integrations/supabase/client';
import { productionLogger } from '@/lib/logger/production-logger';
import type { Database } from '@/integrations/supabase/types';
import type { PaginatedResponse, PaginationParams } from '@/lib/pagination.types';
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from '@/lib/pagination.types';

type GovernanceDecisionRow = Database['public']['Tables']['governance_decisions']['Row'];
type GovernanceDecisionInsert = Database['public']['Tables']['governance_decisions']['Insert'];

export class GovernanceDecisionsService {
  /**
   * جلب جميع قرارات الحوكمة
   */
  static async getDecisions(): Promise<GovernanceDecisionRow[]> {
    try {
      const { data, error } = await supabase
        .from('governance_decisions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      productionLogger.error('Error fetching governance decisions', error);
      throw error;
    }
  }

  /**
   * جلب قرارات الحوكمة مع الترقيم من السيرفر
   */
  static async getDecisionsPaginated(
    params: PaginationParams = { page: DEFAULT_PAGE, pageSize: DEFAULT_PAGE_SIZE },
    filters?: { status?: string }
  ): Promise<PaginatedResponse<GovernanceDecisionRow>> {
    try {
      const { page, pageSize } = params;
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      let countQuery = supabase.from('governance_decisions').select('*', { count: 'exact', head: true });
      if (filters?.status) countQuery = countQuery.eq('decision_status', filters.status);
      const { count } = await countQuery;

      let dataQuery = supabase
        .from('governance_decisions')
        .select('*')
        .order('created_at', { ascending: false })
        .range(from, to);
      
      if (filters?.status) dataQuery = dataQuery.eq('decision_status', filters.status);
      
      const { data, error } = await dataQuery;
      if (error) throw error;

      const totalCount = count || 0;
      return {
        data: data || [],
        totalCount,
        page,
        pageSize,
        totalPages: Math.ceil(totalCount / pageSize),
      };
    } catch (error) {
      productionLogger.error('Error fetching paginated governance decisions', error);
      throw error;
    }
  }

  /**
   * جلب قرار بالمعرف
   */
  static async getDecisionById(id: string): Promise<GovernanceDecisionRow | null> {
    try {
      const { data, error } = await supabase
        .from('governance_decisions')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      productionLogger.error('Error fetching governance decision', error);
      throw error;
    }
  }

  /**
   * إنشاء قرار جديد
   */
  static async createDecision(decision: GovernanceDecisionInsert): Promise<GovernanceDecisionRow> {
    try {
      const { data, error } = await supabase
        .from('governance_decisions')
        .insert([decision])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      productionLogger.error('Error creating governance decision', error);
      throw error;
    }
  }

  /**
   * تحديث قرار
   */
  static async updateDecision(id: string, updates: Partial<GovernanceDecisionRow>): Promise<GovernanceDecisionRow> {
    try {
      const { data, error } = await supabase
        .from('governance_decisions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      productionLogger.error('Error updating governance decision', error);
      throw error;
    }
  }

  /**
   * حذف قرار
   */
  static async deleteDecision(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('governance_decisions')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      productionLogger.error('Error deleting governance decision', error);
      throw error;
    }
  }

  /**
   * جلب قرارات الحوكمة الأخيرة
   */
  static async getRecentDecisions() {
    try {
      const { data } = await supabase
        .from("governance_decisions")
        .select("*")
        .eq("decision_status", "قيد التصويت")
        .order("created_at", { ascending: false })
        .limit(3);
      return data || [];
    } catch (error) {
      productionLogger.error('Error fetching recent governance decisions', error);
      throw error;
    }
  }
}
