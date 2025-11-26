export interface TwoFactorAuth {
  id: string;
  user_id: string;
  secret: string;
  backup_codes: string[];
  is_enabled: boolean;
  method: string;
  phone_number?: string;
  last_used_at?: string;
  created_at: string;
  updated_at: string;
}

export interface SecuritySession {
  id: string;
  user_id: string;
  session_token: string;
  ip_address?: string;
  user_agent?: string;
  device_info?: Record<string, any>;
  location?: Record<string, any>;
  is_active: boolean;
  last_activity_at: string;
  expires_at: string;
  created_at: string;
}

export interface LoginAttempt {
  id: string;
  user_email?: string;
  ip_address: string;
  success: boolean;
  failure_reason?: string;
  user_agent?: string;
  location?: Record<string, any>;
  created_at: string;
}

export interface SecurityEvent {
  id: string;
  event_type: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  user_id?: string;
  ip_address?: string;
  event_data?: Record<string, any>;
  description: string;
  resolved: boolean;
  resolved_by?: string;
  resolved_at?: string;
  created_at: string;
}

export interface SecurityRule {
  id: string;
  rule_name: string;
  rule_type: string;
  is_active: boolean;
  conditions: Record<string, any>;
  actions: Record<string, any>;
  priority: number;
  last_triggered_at?: string;
  trigger_count: number;
  created_at: string;
  updated_at: string;
}
