/**
 * Tenant Service - خدمة المستأجرين
 * @version 2.7.0
 */

import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Tenant = Database['public']['Tables']['tenants']['Row'];
type TenantInsert = Database['public']['Tables']['tenants']['Insert'];

export class TenantService {
  static async getAll(filters?: { search?: string }): Promise<Tenant[]> {
    let query = supabase.from('tenants').select('*').order('created_at', { ascending: false });
    if (filters?.search) {
      query = query.or(`full_name.ilike.%${filters.search}%,phone.ilike.%${filters.search}%`);
    }
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  static async getById(id: string): Promise<Tenant | null> {
    const { data, error } = await supabase.from('tenants').select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  }

  static async create(tenant: TenantInsert): Promise<Tenant> {
    const { data, error } = await supabase.from('tenants').insert(tenant).select().single();
    if (error) throw error;
    return data;
  }

  static async update(id: string, updates: Partial<Tenant>): Promise<Tenant> {
    const { data, error } = await supabase.from('tenants').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data;
  }

  static async getLedger(tenantId: string) {
    const { data, error } = await supabase.from('tenant_ledger').select('*').eq('tenant_id', tenantId).order('transaction_date', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  static async getBalance(tenantId: string): Promise<number> {
    const ledger = await this.getLedger(tenantId);
    return ledger.reduce((bal, e) => bal + (e.debit_amount || 0) - (e.credit_amount || 0), 0);
  }

  static async getContracts(tenantId: string) {
    const { data, error } = await supabase.from('contracts').select('*').eq('tenant_id', tenantId);
    if (error) throw error;
    return data || [];
  }

  static async getStats() {
    const tenants = await this.getAll();
    return { total: tenants.length, active: tenants.filter(t => t.status === 'active').length };
  }
}
