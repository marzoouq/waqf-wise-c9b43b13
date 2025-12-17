export interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  push: boolean;
}

export interface RealtimeNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  is_read: boolean;
  created_at: string;
  action_url?: string | null;
  reference_id?: string | null;
  reference_type?: string | null;
}

export interface NotificationPayload {
  new: RealtimeNotification;
}

export interface NotificationSettings {
  id: string;
  user_id?: string;
  beneficiary_id?: string;
  email_enabled: boolean;
  sms_enabled: boolean;
  push_enabled: boolean;
  in_app_enabled: boolean;
  distribution_notifications: boolean;
  request_notifications: boolean;
  payment_notifications: boolean;
  loan_notifications: boolean;
  system_notifications: boolean;
  created_at: string;
  updated_at: string;
}
