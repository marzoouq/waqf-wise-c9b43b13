// Notification types for real-time updates

export interface RealtimeNotification {
  id: string;
  title: string;
  message: string;
  user_id: string;
  action_url?: string;
  created_at: string;
  is_read: boolean;
  type?: string;
  priority?: string;
}

export interface NotificationPayload {
  new: RealtimeNotification;
  old?: RealtimeNotification;
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
}

export interface NotificationInsert {
  title: string;
  message: string;
  user_id: string;
  action_url?: string;
  type?: string;
  priority?: string;
  is_read?: boolean;
}

export interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  push: boolean;
}

export interface Notification {
  id: string;
  user_id?: string;
  beneficiary_id?: string;
  title: string;
  message: string;
  notification_type: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'unread' | 'read' | 'archived';
  channel: 'in_app' | 'email' | 'sms' | 'push';
  reference_type?: string;
  reference_id?: string;
  created_at: string;
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
}
