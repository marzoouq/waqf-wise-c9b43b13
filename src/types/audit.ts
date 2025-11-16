import { Json } from '@/integrations/supabase/types';

export interface AuditLog {
  id: string;
  user_id: string | null;
  user_email: string | null;
  action_type: string;
  table_name: string | null;
  record_id: string | null;
  old_values: Json;
  new_values: Json;
  ip_address: string | null;
  user_agent: string | null;
  description: string | null;
  severity: 'info' | 'warning' | 'error' | 'critical';
  created_at: string;
}

export interface AuditLogFilters {
  userId?: string;
  tableName?: string;
  actionType?: string;
  startDate?: string;
  endDate?: string;
  severity?: string;
}
