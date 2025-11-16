/**
 * أنواع البحث العام
 */

import type { LucideIcon } from 'lucide-react';

// أنواع نتائج البحث
export type SearchResultType = 
  | 'beneficiary' 
  | 'property' 
  | 'loan' 
  | 'contract' 
  | 'document' 
  | 'distribution'
  | 'invoice'
  | 'payment';

// واجهة نتيجة البحث الموحدة
export interface SearchResult {
  id: string;
  type: SearchResultType;
  title: string;
  subtitle?: string;
  url: string;
  icon: LucideIcon;
}

// أنواع نتائج البحث من قاعدة البيانات
export interface BeneficiarySearchResult {
  id: string;
  full_name: string;
  national_id: string;
  phone: string;
  category: string;
}

export interface PropertySearchResult {
  id: string;
  name: string;
  location: string;
  status: string;
}

export interface LoanSearchResult {
  id: string;
  loan_number: string;
  loan_amount: number;
  beneficiaries: {
    full_name: string;
  } | null;
}

export interface ContractSearchResult {
  id: string;
  contract_number: string;
  tenant_name: string;
  properties: {
    property_name: string;
  } | null;
}

export interface DocumentSearchResult {
  id: string;
  name: string;
  category: string;
  file_type: string;
}

export interface DistributionSearchResult {
  id: string;
  distribution_number: string;
  total_amount: number;
  distribution_date: string;
}

export interface InvoiceSearchResult {
  id: string;
  invoice_number: string;
  customer_name: string;
  total_amount: number;
}

export interface PaymentSearchResult {
  id: string;
  payment_number: string;
  amount: number;
  payment_date: string;
}

// نوع موحد لجميع نتائج البحث من قاعدة البيانات
export type DatabaseSearchResult = 
  | BeneficiarySearchResult
  | PropertySearchResult
  | LoanSearchResult
  | ContractSearchResult
  | DocumentSearchResult
  | DistributionSearchResult
  | InvoiceSearchResult
  | PaymentSearchResult;
