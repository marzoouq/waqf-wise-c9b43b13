import { Database } from "@/integrations/supabase/types";

// Extended Beneficiary type with all custom fields
export type BeneficiaryRow = Database["public"]["Tables"]["beneficiaries"]["Row"] & {
  beneficiary_number: string;
};

export type BeneficiaryInsert = Database["public"]["Tables"]["beneficiaries"]["Insert"] & {
  beneficiary_number?: string;
};

export type BeneficiaryUpdate = Database["public"]["Tables"]["beneficiaries"]["Update"] & {
  beneficiary_number?: string;
};

// Full Beneficiary interface for application use
export interface Beneficiary extends BeneficiaryRow {
  // All properties inherited from BeneficiaryRow
}

// Beneficiary with statistics for dashboard
export interface BeneficiaryWithStats extends Beneficiary {
  total_payments?: number;
  payment_count?: number;
  last_payment_date?: string;
}

// Beneficiary form data
export interface BeneficiaryFormData {
  fullName: string;
  nationalId: string;
  phone: string;
  email?: string;
  category: string;
  familyName?: string;
  relationship?: string;
  numberOfSons?: number;
  numberOfDaughters?: number;
  numberOfWives?: number;
  employmentStatus?: string;
  housingType?: string;
  notes?: string;
}
