/**
 * Types for Distributions Module
 * أنواع وحدة التوزيعات
 */

export interface Distribution {
  id: string;
  created_at: string;
  updated_at?: string | null;
  month: string;
  total_amount: number;
  beneficiaries_count: number;
  status: string;
  distribution_date: string;
  notes?: string | null;
  distribution_type?: string | null;
  approved_at?: string | null;
  approved_by?: string | null;
  executed_at?: string | null;
  executed_by?: string | null;
}

export interface DistributionBeneficiary {
  id: string;
  full_name: string;
  national_id: string;
  category: string;
}

export interface MonthlyDistributionData {
  month: string;
  count: number;
  amount: number;
}

export interface PatternDistributionData {
  name: string;
  count: number;
}

export interface DistributionStats {
  total: number;
  thisMonth: number;
  totalAmount: number;
  avgAmount: number;
  completed: number;
  pending: number;
}
