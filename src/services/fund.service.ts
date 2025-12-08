/**
 * Fund Service - خدمة الصناديق
 * @version 2.7.0
 */

import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Fund = Database['public']['Tables']['funds']['Row'];
type AnnualDisclosure = Database['public']['Tables']['annual_disclosures']['Row'];

export class FundService {
  static async getAll(): Promise<Fund[]> {
    const { data, error } = await supabase.from('funds').select('*').order('name');
    if (error) throw error;
    return data || [];
  }

  static async getById(id: string): Promise<Fund | null> {
    const { data, error } = await supabase.from('funds').select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  }

  static async getDisclosures(year?: number): Promise<AnnualDisclosure[]> {
    let query = supabase.from('annual_disclosures').select('*').order('year', { ascending: false });
    if (year) query = query.eq('year', year);
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  static async createDisclosure(disclosure: Partial<AnnualDisclosure>): Promise<AnnualDisclosure> {
    const { data, error } = await supabase.from('annual_disclosures').insert(disclosure as any).select().single();
    if (error) throw error;
    return data;
  }

  static async publishDisclosure(id: string): Promise<AnnualDisclosure> {
    const { data, error } = await supabase.from('annual_disclosures').update({ status: 'published', published_at: new Date().toISOString() }).eq('id', id).select().single();
    if (error) throw error;
    return data;
  }

  static async getDistributionSettings() {
    const { data } = await supabase.from('waqf_distribution_settings').select('*').limit(1).single();
    return data;
  }

  static async getAccumulatedCorpus(): Promise<number> {
    const { data } = await supabase.from('fiscal_year_closings').select('waqf_corpus');
    return (data || []).reduce((s, i) => s + (i.waqf_corpus || 0), 0);
  }
}
