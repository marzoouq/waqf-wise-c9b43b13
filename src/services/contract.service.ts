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

  static async getAllWithProperties() {
    const { data, error } = await supabase
      .from('contracts')
      .select(`
        *,
        properties(name, type, location)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async getById(id: string): Promise<Contract | null> {
    const { data, error } = await supabase.from('contracts').select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    return data;
  }

  static async getByPropertyId(propertyId: string): Promise<Contract[]> {
    const { data, error } = await supabase.from('contracts').select('*').eq('property_id', propertyId);
    if (error) throw error;
    return data || [];
  }

  static async create(contract: ContractInsert & { unit_ids?: string[] }): Promise<Contract> {
    const { unit_ids, ...contractData } = contract;
    
    const { data, error } = await supabase
      .from('contracts')
      .insert([contractData])
      .select()
      .single();

    if (error) throw error;

    // ربط الوحدات بالعقد
    if (data && unit_ids && unit_ids.length > 0) {
      const contractUnits = unit_ids.map(unitId => ({
        contract_id: data.id,
        property_unit_id: unitId,
      }));

      await supabase
        .from('contract_units')
        .insert(contractUnits);
    }

    // إنشاء جدول الدفعات تلقائياً
    if (data) {
      await supabase.rpc('create_payment_schedule', {
        p_contract_id: data.id,
        p_start_date: data.start_date,
        p_end_date: data.end_date,
        p_monthly_rent: data.monthly_rent,
        p_payment_frequency: data.payment_frequency
      });
    }

    return data;
  }

  static async update(id: string, updates: Partial<Contract>): Promise<Contract> {
    const { data, error } = await supabase.from('contracts').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data;
  }

  static async delete(id: string): Promise<void> {
    const { error } = await supabase.from('contracts').delete().eq('id', id);
    if (error) throw error;
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

  static async getActiveWithProperties(): Promise<{
    id: string;
    contract_number: string;
    tenant_name: string;
    monthly_rent: number;
    start_date: string;
    end_date: string;
    status: string;
    properties: {
      name: string;
      type: string;
      location: string;
    } | null;
  }[]> {
    const { data, error } = await supabase
      .from('contracts')
      .select(`
        id,
        contract_number,
        tenant_name,
        monthly_rent,
        start_date,
        end_date,
        status,
        properties (
          name,
          type,
          location
        )
      `)
      .eq('status', 'نشط')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as {
      id: string;
      contract_number: string;
      tenant_name: string;
      monthly_rent: number;
      start_date: string;
      end_date: string;
      status: string;
      properties: {
        name: string;
        type: string;
        location: string;
      } | null;
    }[];
  }
}
