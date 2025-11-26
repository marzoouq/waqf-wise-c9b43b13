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
  device_info?: DeviceInfo;
  location?: Location;
  is_active: boolean;
  last_activity_at: string;
  expires_at: string;
  created_at: string;
}

interface DeviceInfo {
  browser?: string;
  os?: string;
  device_type?: 'mobile' | 'tablet' | 'desktop';
  screen_resolution?: string;
}

interface Location {
  ip?: string;
  country?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
}

export interface LoginAttempt {
  id: string;
  user_email?: string;
  ip_address: string;
  success: boolean;
  failure_reason?: string;
  user_agent?: string;
  location?: Location;
  created_at: string;
}

export interface SecurityEvent {
  id: string;
  event_type: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  user_id?: string;
  ip_address?: string;
  event_data?: EventData;
  description: string;
  resolved: boolean;
  resolved_by?: string;
  resolved_at?: string;
  created_at: string;
}

interface EventData {
  action?: string;
  resource?: string;
  changes?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export interface SecurityRule {
  id: string;
  rule_name: string;
  rule_type: string;
  is_active: boolean;
  conditions: RuleConditions;
  actions: RuleActions;
  priority: number;
  last_triggered_at?: string;
  trigger_count: number;
  created_at: string;
  updated_at: string;
}

interface RuleConditions {
  event_pattern?: string;
  threshold?: number;
  time_window?: number;
  user_role?: string[];
  [key: string]: unknown;
}

interface RuleActions {
  alert?: boolean;
  block?: boolean;
  notify_users?: string[];
  custom_action?: string;
  [key: string]: unknown;
}
