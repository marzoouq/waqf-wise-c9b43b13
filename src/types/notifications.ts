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
