export type GovernanceType = 'nazer_only' | 'nazer_with_board';
export type WaqfType = 'ذري' | 'خيري' | 'مشترك';

export interface WaqfNazer {
  id: string;
  nazer_name: string;
  nazer_title?: string;
  national_id?: string;
  appointment_date: string;
  appointment_decree?: string;
  is_primary: boolean;
  is_active: boolean;
  contact_phone?: string;
  contact_email?: string;
  address?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}
