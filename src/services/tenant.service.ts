/**
 * Tenant Service - خدمة المستأجرين
 * @version 2.8.0 - مع دعم Retry و matchesStatus
 */

import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { matchesStatus, TENANT_ACTIVE_STATUSES } from "@/lib/constants";
import { withRetry, SUPABASE_RETRY_OPTIONS } from "@/lib/retry-helper";

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
    const { data, error } = await supabase.from('tenants').insert(tenant).select().maybeSingle();
    if (error) throw error;
    if (!data) throw new Error('فشل إنشاء المستأجر');
    return data;
  }

  static async update(id: string, updates: Partial<Tenant>): Promise<Tenant | null> {
    const { data, error } = await supabase.from('tenants').update(updates).eq('id', id).select().maybeSingle();
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
    const tenants = await withRetry(() => this.getAll(), SUPABASE_RETRY_OPTIONS);
    return { 
      total: tenants.length, 
      active: tenants.filter(t => matchesStatus(t.status, 'active')).length 
    };
  }

  static async delete(id: string): Promise<void> {
    const { error } = await supabase.from('tenants').delete().eq('id', id);
    if (error) throw error;
  }

  static async addLedgerEntry(entry: Database['public']['Tables']['tenant_ledger']['Insert']) {
    const { data, error } = await supabase.from('tenant_ledger').insert(entry).select().maybeSingle();
    if (error) throw error;
    if (!data) throw new Error('فشل إضافة القيد');
    return data;
  }

  static async getTenantsWithBalance() {
    // استعلام واحد بدلاً من N+1
    const { data: tenantsData, error: tenantsError } = await supabase
      .from('tenants')
      .select('*')
      .order('created_at', { ascending: false });

    if (tenantsError) throw tenantsError;
    if (!tenantsData?.length) return [];

    // جلب جميع سجلات الدفتر مرة واحدة
    const tenantIds = tenantsData.map(t => t.id);
    const { data: allLedger, error: ledgerError } = await supabase
      .from('tenant_ledger')
      .select('tenant_id, debit_amount, credit_amount, transaction_type')
      .in('tenant_id', tenantIds);

    if (ledgerError) throw ledgerError;

    // تجميع البيانات لكل مستأجر
    const ledgerByTenant = (allLedger || []).reduce((acc, entry) => {
      if (!acc[entry.tenant_id]) {
        acc[entry.tenant_id] = { debit: 0, credit: 0, invoices: 0, payments: 0 };
      }
      acc[entry.tenant_id].debit += entry.debit_amount || 0;
      acc[entry.tenant_id].credit += entry.credit_amount || 0;
      if (entry.transaction_type === 'invoice') acc[entry.tenant_id].invoices++;
      if (entry.transaction_type === 'payment') acc[entry.tenant_id].payments++;
      return acc;
    }, {} as Record<string, { debit: number; credit: number; invoices: number; payments: number }>);

    return tenantsData.map(tenant => ({
      ...tenant,
      current_balance: (ledgerByTenant[tenant.id]?.debit || 0) - (ledgerByTenant[tenant.id]?.credit || 0),
      total_invoices: ledgerByTenant[tenant.id]?.invoices || 0,
      total_payments: ledgerByTenant[tenant.id]?.payments || 0,
    }));
  }

  static async getTenantsAging() {
    const today = new Date();
    
    // جلب المستأجرين النشطين
    const { data: tenants, error: tenantsError } = await supabase
      .from('tenants')
      .select('id, full_name')
      .in('status', ['نشط', 'active']);

    if (tenantsError) throw tenantsError;
    if (!tenants?.length) return [];

    // جلب جميع الفواتير مرة واحدة (حل N+1)
    const tenantIds = tenants.map(t => t.id);
    const { data: allLedger, error: ledgerError } = await supabase
      .from('tenant_ledger')
      .select('tenant_id, transaction_date, debit_amount, credit_amount')
      .in('tenant_id', tenantIds)
      .eq('transaction_type', 'invoice');

    if (ledgerError) throw ledgerError;

    // تجميع البيانات حسب المستأجر
    const tenantMap = new Map(tenants.map(t => [t.id, t.full_name]));
    const agingByTenant: Record<string, { current: number; days_30: number; days_60: number; days_90: number; over_90: number }> = {};

    for (const entry of allLedger || []) {
      const transactionDate = new Date(entry.transaction_date);
      const daysDiff = Math.floor(
        (today.getTime() - transactionDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      const amount = (entry.debit_amount || 0) - (entry.credit_amount || 0);

      if (amount <= 0) continue;

      if (!agingByTenant[entry.tenant_id]) {
        agingByTenant[entry.tenant_id] = { current: 0, days_30: 0, days_60: 0, days_90: 0, over_90: 0 };
      }

      const aging = agingByTenant[entry.tenant_id];
      if (daysDiff <= 30) aging.current += amount;
      else if (daysDiff <= 60) aging.days_30 += amount;
      else if (daysDiff <= 90) aging.days_60 += amount;
      else if (daysDiff <= 120) aging.days_90 += amount;
      else aging.over_90 += amount;
    }

    // بناء النتيجة النهائية
    const agingData = Object.entries(agingByTenant)
      .map(([tenantId, aging]) => ({
        tenant_id: tenantId,
        tenant_name: tenantMap.get(tenantId) || '',
        current: aging.current,
        days_30: aging.days_30,
        days_60: aging.days_60,
        days_90: aging.days_90,
        over_90: aging.over_90,
        total: aging.current + aging.days_30 + aging.days_60 + aging.days_90 + aging.over_90,
      }))
      .filter(item => item.total > 0);

    return agingData.sort((a, b) => b.total - a.total);
  }
}
