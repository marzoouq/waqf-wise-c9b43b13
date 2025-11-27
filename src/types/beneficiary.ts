import type { Json } from "@/integrations/supabase/types";

// Notification preferences interface
export interface NotificationPreferences {
  [key: string]: boolean | undefined;
  email?: boolean;
  sms?: boolean;
  push?: boolean;
  whatsapp?: boolean;
  payment_alerts?: boolean;
  request_updates?: boolean;
  general_announcements?: boolean;
}

// مستندات التحقق
export interface VerificationDocument {
  id?: string;
  type: string;
  name: string;
  url?: string;
  uploadedAt?: string;
  verified?: boolean;
}

// تفاصيل الحالة الاجتماعية
export interface SocialStatusDetails {
  marital_status?: string;
  spouse_name?: string;
  spouse_occupation?: string;
  dependents_count?: number;
  living_situation?: string;
  [key: string]: string | number | boolean | undefined;
}

// مصادر الدخل
export interface IncomeSource {
  source: string;
  amount: number;
  frequency?: string;
  notes?: string;
}

// الإعاقات
export interface Disability {
  type: string;
  severity?: string;
  description?: string;
  needs_assistance?: boolean;
}

// الحالات الطبية
export interface MedicalCondition {
  condition: string;
  severity?: string;
  treatment?: string;
  diagnosed_date?: string;
}

// Full Beneficiary interface for application use
export interface Beneficiary {
  id: string;
  full_name: string;
  national_id: string;
  phone: string;
  email: string | null;
  category: string;
  family_name: string | null;
  relationship: string | null;
  status: string;
  notes: string | null;
  tribe: string | null;
  priority_level: number | null;
  marital_status: string | null;
  nationality: string | null;
  city: string | null;
  address: string | null;
  date_of_birth: string | null;
  gender: string | null;
  bank_name: string | null;
  bank_account_number: string | null;
  iban: string | null;
  monthly_income: number | null;
  family_size: number | null;
  is_head_of_family: boolean | null;
  parent_beneficiary_id: string | null;
  tags: string[] | null;
  username: string | null;
  can_login: boolean | null;
  last_login_at: string | null;
  login_enabled_at: string | null;
  user_id: string | null;
  number_of_sons: number | null;
  number_of_daughters: number | null;
  number_of_wives: number | null;
  employment_status: string | null;
  housing_type: string | null;
  notification_preferences: NotificationPreferences | null;
  last_notification_at: string | null;
  beneficiary_number: string | null;
  beneficiary_type: string | null;
  verification_documents: Json | null;
  verification_notes: string | null;
  verification_status: string | null;
  last_verification_date: string | null;
  verification_method: string | null;
  verified_at: string | null;
  verified_by: string | null;
  risk_score: number | null;
  eligibility_status: string | null;
  eligibility_notes: string | null;
  last_review_date: string | null;
  next_review_date: string | null;
  social_status_details: Json | null;
  income_sources: Json | null;
  disabilities: Json | null;
  medical_conditions: Json | null;
  created_at: string;
  updated_at: string;
}

// Beneficiary insert type
export type BeneficiaryInsert = Omit<Beneficiary, "id" | "created_at" | "updated_at" | "beneficiary_number">;

// Beneficiary update type
export type BeneficiaryUpdate = Partial<Omit<Beneficiary, "id" | "created_at" | "updated_at" | "beneficiary_number">>;

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

// Helper functions for type conversion
export function parseVerificationDocuments(data: Json | null): VerificationDocument[] {
  if (!data || !Array.isArray(data)) return [];
  return data as unknown as VerificationDocument[];
}

export function parseSocialStatusDetails(data: Json | null): SocialStatusDetails | null {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return null;
  return data as unknown as SocialStatusDetails;
}

export function parseIncomeSources(data: Json | null): IncomeSource[] {
  if (!data || !Array.isArray(data)) return [];
  return data as unknown as IncomeSource[];
}

export function parseDisabilities(data: Json | null): Disability[] {
  if (!data || !Array.isArray(data)) return [];
  return data as unknown as Disability[];
}

export function parseMedicalConditions(data: Json | null): MedicalCondition[] {
  if (!data || !Array.isArray(data)) return [];
  return data as unknown as MedicalCondition[];
}
