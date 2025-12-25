/**
 * Fund Service - خدمة الصناديق
 * @version 2.8.12
 */

import { supabase } from "@/integrations/supabase/client";
import { productionLogger } from "@/lib/logger/production-logger";
import type { Database } from "@/integrations/supabase/types";

type Fund = Database['public']['Tables']['funds']['Row'];
type FundInsert = Database['public']['Tables']['funds']['Insert'];
type AnnualDisclosure = Database['public']['Tables']['annual_disclosures']['Row'];

export class FundService {
  static async getAll(activeOnly = true): Promise<Fund[]> {
    try {
      let query = supabase.from('funds').select('*').order('created_at', { ascending: false });
      if (activeOnly) query = query.eq('is_active', true);
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (error) {
      productionLogger.error('Error fetching funds', error);
      throw error;
    }
  }

  static async getById(id: string): Promise<Fund | null> {
    const { data, error } = await supabase.from('funds').select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    return data;
  }

  static async create(fund: Omit<FundInsert, 'id' | 'created_at' | 'updated_at'>): Promise<Fund> {
    const { data, error } = await supabase.from('funds').insert([fund]).select().single();
    if (error) throw error;
    return data;
  }

  static async update(id: string, updates: Partial<FundInsert>): Promise<Fund> {
    const { data, error } = await supabase.from('funds').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data;
  }

  static async delete(id: string): Promise<void> {
    const { error } = await supabase.from('funds').delete().eq('id', id);
    if (error) throw error;
  }

  static async getDisclosures(year?: number): Promise<AnnualDisclosure[]> {
    let query = supabase.from('annual_disclosures').select('*').order('year', { ascending: false });
    if (year) query = query.eq('year', year);
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  static async createDisclosure(disclosure: Partial<AnnualDisclosure>): Promise<AnnualDisclosure> {
    const { data, error } = await supabase.from('annual_disclosures').insert(disclosure as never).select().single();
    if (error) throw error;
    return data;
  }

  static async publishDisclosure(id: string): Promise<AnnualDisclosure> {
    const { data, error } = await supabase.from('annual_disclosures').update({ status: 'published', published_at: new Date().toISOString() }).eq('id', id).select().single();
    if (error) throw error;
    return data;
  }

  static async getDistributionSettings() {
    const { data, error } = await supabase.from('waqf_distribution_settings').select('*').eq('is_active', true).maybeSingle();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  static async updateDistributionSettings(id: string | undefined, updates: Record<string, unknown>) {
    if (id) {
      const { data, error } = await supabase.from('waqf_distribution_settings').update(updates as never).eq('id', id).select().single();
      if (error) throw error;
      return data;
    } else {
      const { data, error } = await supabase.from('waqf_distribution_settings').insert([updates as never]).select().single();
      if (error) throw error;
      return data;
    }
  }

  static async getAccumulatedCorpus(): Promise<number> {
    const { data } = await supabase.from('fiscal_year_closings').select('waqf_corpus');
    return (data || []).reduce((s, i) => s + (i.waqf_corpus || 0), 0);
  }

  static async getWaqfUnits() {
    const { data, error } = await supabase.from('waqf_units').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  static async getWaqfUnitById(id: string) {
    const { data, error } = await supabase.from('waqf_units').select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    return data;
  }

  static async createWaqfUnit(unit: Record<string, unknown>) {
    const { data, error } = await supabase.from('waqf_units').insert([unit as never]).select().single();
    if (error) throw error;
    return data;
  }

  static async updateWaqfUnit(id: string, updates: Record<string, unknown>) {
    const { data, error } = await supabase.from('waqf_units').update(updates as never).eq('id', id).select().single();
    if (error) throw error;
    return data;
  }

  static async deleteWaqfUnit(id: string): Promise<void> {
    // التحقق من وجود عقارات مرتبطة
    const { count: propertiesCount } = await supabase
      .from('properties')
      .select('*', { count: 'exact', head: true })
      .eq('waqf_unit_id', id);

    if (propertiesCount && propertiesCount > 0) {
      throw new Error(`لا يمكن حذف قلم الوقف لأنه مرتبط بـ ${propertiesCount} عقار. يرجى إلغاء ربط العقارات أولاً.`);
    }

    // التحقق من وجود صناديق مرتبطة
    const { count: fundsCount } = await supabase
      .from('funds')
      .select('*', { count: 'exact', head: true })
      .eq('waqf_unit_id', id);

    if (fundsCount && fundsCount > 0) {
      throw new Error(`لا يمكن حذف قلم الوقف لأنه مرتبط بـ ${fundsCount} صندوق. يرجى إلغاء ربط الصناديق أولاً.`);
    }

    const { error } = await supabase.from('waqf_units').delete().eq('id', id);
    if (error) throw error;
  }

  static async getWaqfUnitWithDetails(id: string) {
    const unit = await this.getWaqfUnitById(id);
    if (!unit) throw new Error('قلم الوقف غير موجود');

    const [properties, funds] = await Promise.all([
      supabase.from('properties').select('id, name, type, monthly_revenue, status').eq('waqf_unit_id', id),
      supabase.from('funds').select('id, name, allocated_amount, spent_amount, category').eq('waqf_unit_id', id)
    ]);

    return { ...unit, properties: properties.data || [], funds: funds.data || [] };
  }

  static async getBudgets(fiscalYearId?: string) {
    let query = supabase.from('budgets').select('*, accounts(name_ar, code)').order('created_at', { ascending: false });
    if (fiscalYearId) query = query.eq('fiscal_year_id', fiscalYearId);
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  static async getReserves() {
    const { data, error } = await supabase.from('waqf_reserves').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  static async getApprovedDistributions() {
    const { data, error } = await supabase
      .from('distributions')
      .select(`id, distribution_date, total_amount, status, distribution_details!inner(beneficiary_id, allocated_amount, beneficiaries!inner(full_name, bank_account_number, iban))`)
      .eq('status', 'معتمد')
      .order('distribution_date', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  static async getDistributionDetails(distributionId: string) {
    const { data, error } = await supabase
      .from('distribution_details')
      .select(`*, beneficiaries(id, full_name, beneficiary_type, iban, bank_name)`)
      .eq('distribution_id', distributionId)
      .order('allocated_amount', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  static async getDistributionApprovals(distributionId?: string) {
    let query = supabase.from('distribution_approvals').select('*').order('level', { ascending: true });
    if (distributionId) query = query.eq('distribution_id', distributionId);
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  static async addDistributionApproval(approval: Record<string, unknown>) {
    const { data: existing } = await supabase
      .from('distribution_approvals')
      .select('id')
      .eq('distribution_id', approval.distribution_id as string)
      .eq('level', approval.level as number)
      .maybeSingle();

    if (existing) {
      const { data, error } = await supabase.from('distribution_approvals').update(approval as never).eq('id', existing.id).select().single();
      if (error) throw error;
      return data;
    }

    const { data, error } = await supabase.from('distribution_approvals').insert([approval as never]).select().single();
    if (error) throw error;
    return data;
  }

  static async updateDistributionApproval(id: string, updates: Record<string, unknown>) {
    const { data, error } = await supabase.from('distribution_approvals').update(updates as never).eq('id', id).select().single();
    if (error) throw error;
    return data;
  }
}
