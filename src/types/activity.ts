import { Json } from '@/integrations/supabase/types';

/**
 * Types for Activity Logs
 */

export interface BeneficiaryActivityLogEntry {
  id: string;
  beneficiary_id: string;
  action_type: string;
  action_description: string;
  old_values?: Json;
  new_values?: Json;
  performed_by?: string;
  performed_by_name?: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface BeneficiaryActivityLogInsert {
  beneficiary_id: string;
  action_type: string;
  action_description: string;
  old_values?: Json;
  new_values?: Json;
  performed_by?: string;
  performed_by_name?: string;
  ip_address?: string;
  user_agent?: string;
}
