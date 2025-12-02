/**
 * أنواع بيانات التصدير المحددة
 */

// أنواع الكيانات الأساسية للتصدير
export interface BeneficiaryExport {
  full_name: string;
  national_id: string;
  phone: string;
  email: string | null;
  category: string;
  status: string;
  tribe: string | null;
  city: string | null;
  bank_name: string | null;
  iban: string | null;
  notes: string | null;
}


export interface PaymentExport {
  payment_number: string;
  payment_date: string;
  amount: number;
  payment_method: string | null;
  beneficiary_name: string | null;
  description: string | null;
  status: string;
}

export interface InvoiceExport {
  invoice_number: string;
  invoice_date: string;
  customer_name: string;
  total_amount: number;
  tax_amount: number;
  subtotal: number;
  status: string;
  due_date: string | null;
}

export interface LoanExport {
  loan_number: string;
  beneficiary_name: string;
  loan_amount: number;
  monthly_payment: number;
  remaining_amount: number;
  start_date: string;
  end_date: string;
  status: string;
  interest_rate: number;
}

export interface ContractExport {
  contract_number: string;
  property_name: string;
  tenant_name: string;
  tenant_phone: string;
  start_date: string;
  end_date: string;
  monthly_rent: number;
  status: string;
}

export interface DistributionExport {
  distribution_number: string;
  distribution_date: string;
  total_amount: number;
  beneficiary_count: number;
  fund_name: string;
  status: string;
  notes: string | null;
}

// أنواع بيانات التصدير
export type PDFTableData = string[][];
export type ExcelRowData = Record<string, string | number | null>;

// واجهة موحدة للبيانات القابلة للتصدير
export interface ExportableEntity {
  id: string;
  [key: string]: string | number | boolean | null | undefined;
}
