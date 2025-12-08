/**
 * Contract Service - خدمة العقود
 * @version 2.7.0
 */

import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { CONTRACT_STATUS } from "@/lib/constants";

type Contract = Database['public']['Tables']['contracts']['Row'];
type ContractInsert = Database['public']['Tables']['contracts']['Insert'];

export class ContractService {
  static async getAll(filters?: { status?: string; propertyId?: string }): Promise<Contract[]> {
    let query = supabase.from('contracts').select('*').order('created_at', { ascending: false });
    if (filters?.status) query = query.eq('status', filters.status);
    if (filters?.propertyId) query = query.eq('property_id', filters.propertyId);
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  static async getById(id: string): Promise<Contract | null> {
    const { data, error } = await supabase.from('contracts').select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  }

  static async getByPropertyId(propertyId: string): Promise<Contract[]> {
    const { data, error } = await supabase.from('contracts').select('*').eq('property_id', propertyId);
    if (error) throw error;
    return data || [];
  }

  static async create(contract: ContractInsert): Promise<Contract> {
    const { data, error } = await supabase.from('contracts').insert(contract).select().single();
    if (error) throw error;
    return data;
  }

  static async update(id: string, updates: Partial<Contract>): Promise<Contract> {
    const { data, error } = await supabase.from('contracts').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data;
  }

  static async terminate(id: string): Promise<Contract> {
    const { data, error } = await supabase.from('contracts').update({ status: 'منتهي' }).eq('id', id).select().single();
    if (error) throw error;
    return data;
  }

  static async getExpiringSoon(days: number = 30): Promise<Contract[]> {
    const future = new Date();
    future.setDate(future.getDate() + days);
    const { data, error } = await supabase.from('contracts').select('*')
      .eq('status', CONTRACT_STATUS.ACTIVE)
      .lte('end_date', future.toISOString().split('T')[0]);
    if (error) throw error;
    return data || [];
  }

  static async getStats() {
    const contracts = await this.getAll();
    return {
      total: contracts.length,
      active: contracts.filter(c => c.status === CONTRACT_STATUS.ACTIVE).length,
      expired: contracts.filter(c => c.status === 'منتهي').length,
      totalRent: contracts.filter(c => c.status === CONTRACT_STATUS.ACTIVE).reduce((s, c) => s + (c.monthly_rent || 0), 0),
    };
  }
}
