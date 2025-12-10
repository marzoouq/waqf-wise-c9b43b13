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
    const { data, error } = await supabase.from('tenants').select('*').eq('id', id).maybeSingle();
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

  static async getContractsDetailed(tenantId: string) {
    if (!tenantId) return [];
    
    const { data, error } = await supabase
      .from('contracts')
      .select(`
        id,
        contract_number,
        property_id,
        start_date,
        end_date,
        monthly_rent,
        status,
        payment_frequency,
        properties!inner (name)
      `)
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return (data || []).map(contract => ({
      id: contract.id,
      contract_number: contract.contract_number,
      property_id: contract.property_id,
      start_date: contract.start_date,
      end_date: contract.end_date,
      monthly_rent: contract.monthly_rent,
      status: contract.status,
      payment_frequency: contract.payment_frequency || 'شهري',
      properties: contract.properties as unknown as { name: string },
    }));
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

  static async delete(id: string): Promise<void> {
    const { error } = await supabase.from('tenants').delete().eq('id', id);
    if (error) throw error;
  }

  static async addLedgerEntry(entry: Database['public']['Tables']['tenant_ledger']['Insert']) {
    const { data, error } = await supabase.from('tenant_ledger').insert(entry).select().single();
    if (error) throw error;
    return data;
  }

  static async getTenantsWithBalance() {
    const tenantsData = await this.getAll();
    
    const tenantsWithBalance = await Promise.all(
      tenantsData.map(async (tenant) => {
        const { data: ledgerData } = await supabase
          .from('tenant_ledger')
          .select('debit_amount, credit_amount, transaction_type')
          .eq('tenant_id', tenant.id);

        const ledger = ledgerData || [];
        const totalDebit = ledger.reduce((sum, e) => sum + (e.debit_amount || 0), 0);
        const totalCredit = ledger.reduce((sum, e) => sum + (e.credit_amount || 0), 0);
        const totalInvoices = ledger.filter(e => e.transaction_type === 'invoice').length;
        const totalPayments = ledger.filter(e => e.transaction_type === 'payment').length;

        return {
          ...tenant,
          current_balance: totalDebit - totalCredit,
          total_invoices: totalInvoices,
          total_payments: totalPayments,
        };
      })
    );

    return tenantsWithBalance;
  }

  static async getTenantsAging() {
    const today = new Date();
    const { data: tenants, error: tenantsError } = await supabase
      .from('tenants')
      .select('id, full_name')
      .eq('status', 'active');

    if (tenantsError) throw tenantsError;

    const agingData = [];

    for (const tenant of tenants || []) {
      const { data: ledger } = await supabase
        .from('tenant_ledger')
        .select('*')
        .eq('tenant_id', tenant.id)
        .eq('transaction_type', 'invoice');

      let current = 0;
      let days_30 = 0;
      let days_60 = 0;
      let days_90 = 0;
      let over_90 = 0;

      for (const entry of ledger || []) {
        const transactionDate = new Date(entry.transaction_date);
        const daysDiff = Math.floor(
          (today.getTime() - transactionDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        const amount = (entry.debit_amount || 0) - (entry.credit_amount || 0);

        if (amount <= 0) continue;

        if (daysDiff <= 30) current += amount;
        else if (daysDiff <= 60) days_30 += amount;
        else if (daysDiff <= 90) days_60 += amount;
        else if (daysDiff <= 120) days_90 += amount;
        else over_90 += amount;
      }

      const total = current + days_30 + days_60 + days_90 + over_90;
      if (total > 0) {
        agingData.push({
          tenant_id: tenant.id,
          tenant_name: tenant.full_name,
          current,
          days_30,
          days_60,
          days_90,
          over_90,
          total,
        });
      }
    }

    return agingData.sort((a, b) => b.total - a.total);
  }
}
