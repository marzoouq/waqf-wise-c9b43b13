import { Database } from "@/integrations/supabase/types";

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
