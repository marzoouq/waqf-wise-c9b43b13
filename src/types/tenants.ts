/**
 * أنواع المستأجرين وسجل الحساب
 */

export interface Tenant {
  id: string;
  tenant_number: string | null;
  full_name: string;
  id_type: string;
  id_number: string;
  tax_number: string | null;
  commercial_register: string | null;
  national_address: string | null;
  phone: string | null;
  email: string | null;
  city: string | null;
  address: string | null;
  tenant_type: string;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface TenantInsert {
  full_name: string;
  id_type?: string;
  id_number: string;
  tax_number?: string;
  commercial_register?: string;
  national_address?: string;
  phone?: string;
  email?: string;
  city?: string;
  address?: string;
  tenant_type?: string;
  status?: string;
  notes?: string;
}

export interface TenantLedgerEntry {
  id: string;
  tenant_id: string;
  transaction_date: string;
  transaction_type: string;
  reference_type: string | null;
  reference_id: string | null;
  reference_number: string | null;
  description: string | null;
  debit_amount: number;
  credit_amount: number;
  balance: number;
  property_id: string | null;
  contract_id: string | null;
  fiscal_year_id: string | null;
  created_at: string;
  created_by: string | null;
}

export interface TenantLedgerInsert {
  tenant_id: string;
  transaction_date?: string;
  transaction_type: string;
  reference_type?: string;
  reference_id?: string;
  reference_number?: string;
  description?: string;
  debit_amount?: number;
  credit_amount?: number;
  property_id?: string;
  contract_id?: string;
  fiscal_year_id?: string;
}

export interface TenantWithBalance extends Tenant {
  current_balance: number;
  total_invoices: number;
  total_payments: number;
}

export interface TenantAgingItem {
  tenant_id: string;
  tenant_name: string;
  current: number;
  days_30: number;
  days_60: number;
  days_90: number;
  over_90: number;
  total: number;
}
