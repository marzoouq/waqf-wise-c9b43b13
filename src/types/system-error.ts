/**
 * أنواع سجلات أخطاء النظام
 */

export interface SystemErrorLog {
  id: string;
  error_type: string;
  error_message: string;
  error_stack?: string | null;
  severity?: string | null;
  status?: string | null;
  url?: string | null;
  user_id?: string | null;
  user_agent?: string | null;
  additional_data?: Record<string, unknown> | null;
  created_at: string;
  updated_at?: string | null;
  resolved_at?: string | null;
  resolved_by?: string | null;
  resolution_notes?: string | null;
}
