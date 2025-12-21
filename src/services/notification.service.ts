/**
 * Notification Service - خدمة إدارة الإشعارات
 * 
 * تتولى إرسال الإشعارات للمستخدمين عبر قنوات متعددة
 */

import { supabase } from '@/integrations/supabase/client';
import { productionLogger } from '@/lib/logger/production-logger';

export interface NotificationData {
  user_id: string;
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  priority?: 'low' | 'medium' | 'high';
  reference_type?: string;
  reference_id?: string;
  action_url?: string;
}

export interface SystemAlert {
  id: string;
  alert_type: string;
  severity: string;
  title: string;
  description: string;
  message?: string;
  status: string;
  created_at: string;
  resolved_at?: string | null;
  resolved_by?: string | null;
  metadata?: Record<string, unknown> | null;
  occurrence_count?: number;
  related_error_type?: string | null;
  acknowledged_at?: string | null;
  acknowledged_by?: string | null;
}

export interface UserNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'approval' | 'payment' | 'journal_entry' | 'distribution' | 'system';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  is_read: boolean;
  reference_type: string | null;
  reference_id: string | null;
  action_url: string | null;
  created_at: string;
  read_at: string | null;
  channel?: string;
  sent_at?: string | null;
  delivery_status?: string;
  scheduled_for?: string | null;
  retry_count?: number;
  error_message?: string | null;
}

export class NotificationService {
  /**
   * إرسال إشعار واحد
   */
  static async send(data: NotificationData): Promise<{ success: boolean }> {
    try {
      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: data.user_id,
          title: data.title,
          message: data.message,
          type: data.type || 'info',
          priority: data.priority || 'medium',
          reference_type: data.reference_type,
          reference_id: data.reference_id,
          action_url: data.action_url,
          is_read: false,
        });

      if (error) throw error;
      return { success: true };
    } catch (error) {
      productionLogger.error('Error sending notification', error, {
        context: 'notification_service',
      });
      return { success: false };
    }
  }

  /**
   * إرسال إشعارات متعددة
   */
  static async sendBulk(notifications: NotificationData[]): Promise<{ success: boolean }> {
    try {
      const { error } = await supabase
        .from('notifications')
        .insert(
          notifications.map(n => ({
            user_id: n.user_id,
            title: n.title,
            message: n.message,
            type: n.type || 'info',
            priority: n.priority || 'medium',
            reference_type: n.reference_type,
            reference_id: n.reference_id,
            action_url: n.action_url,
            is_read: false,
          }))
        );

      if (error) throw error;
      return { success: true };
    } catch (error) {
      productionLogger.error('Error sending bulk notifications', error, {
        context: 'notification_service',
      });
      return { success: false };
    }
  }

  /**
   * إشعار بالموافقة على توزيع
   */
  static async notifyDistributionApproved(
    distributionId: string,
    beneficiaryIds: string[]
  ): Promise<void> {
    // الحصول على معلومات التوزيع
    const { data: distribution } = await supabase
      .from('distributions')
      .select('month, total_amount, distribution_date')
      .eq('id', distributionId)
      .maybeSingle();

    if (!distribution) return;

    // الحصول على user_ids للمستفيدين
    const { data: beneficiaries } = await supabase
      .from('beneficiaries')
      .select('id, user_id, full_name')
      .in('id', beneficiaryIds)
      .not('user_id', 'is', null);

    if (!beneficiaries || beneficiaries.length === 0) return;

    const notifications: NotificationData[] = beneficiaries.map(b => ({
      user_id: b.user_id!,
      title: 'توزيع جديد',
      message: `تم اعتماد توزيع ${distribution.month} بتاريخ ${distribution.distribution_date}`,
      type: 'success',
      priority: 'high',
      reference_type: 'distribution',
      reference_id: distributionId,
      action_url: '/beneficiary/distributions',
    }));

    await this.sendBulk(notifications);
  }

  /**
   * إشعار باستحقاق دفعة
   */
  static async notifyPaymentDue(
    beneficiaryId: string,
    amount: number,
    dueDate: string
  ): Promise<void> {
    const { data: beneficiary } = await supabase
      .from('beneficiaries')
      .select('user_id')
      .eq('id', beneficiaryId)
      .maybeSingle();

    if (!beneficiary?.user_id) return;

    await this.send({
      user_id: beneficiary.user_id,
      title: 'استحقاق دفعة',
      message: `لديك دفعة مستحقة بمبلغ ${amount} ر.س بتاريخ ${dueDate}`,
      type: 'warning',
      priority: 'high',
      reference_type: 'payment',
      action_url: '/beneficiary/payments',
    });
  }

  /**
   * إشعار بتصعيد طلب
   */
  static async notifyRequestEscalated(
    supervisorId: string,
    requestNumber: string,
    requestId: string
  ): Promise<void> {
    await this.send({
      user_id: supervisorId,
      title: 'تصعيد طلب',
      message: `تم تصعيد الطلب ${requestNumber} إليك بسبب تجاوز SLA`,
      type: 'warning',
      priority: 'high',
      reference_type: 'request',
      reference_id: requestId,
      action_url: '/staff/requests',
    });
  }

  /**
   * إشعار بتعيين طلب
   */
  static async notifyRequestAssigned(
    userId: string,
    requestNumber: string,
    requestId: string,
    beneficiaryName: string
  ): Promise<void> {
    await this.send({
      user_id: userId,
      title: 'طلب جديد',
      message: `تم تعيين الطلب ${requestNumber} من ${beneficiaryName} إليك`,
      type: 'info',
      priority: 'medium',
      reference_type: 'request',
      reference_id: requestId,
      action_url: '/staff/requests',
    });
  }

  /**
   * جلب تنبيهات النظام
   */
  static async getSystemAlerts(limit: number = 10): Promise<SystemAlert[]> {
    try {
      const { data, error } = await supabase
        .from('system_alerts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return (data || []) as SystemAlert[];
    } catch (error) {
      productionLogger.error('Error fetching system alerts', error);
      return [];
    }
  }

  /**
   * حل تنبيه
   */
  static async resolveAlert(alertId: string): Promise<void> {
    try {
      const { data: user } = await supabase.auth.getUser();
      const { error } = await supabase
        .from('system_alerts')
        .update({
          status: 'resolved',
          resolved_at: new Date().toISOString(),
          resolved_by: user?.user?.id,
        })
        .eq('id', alertId);

      if (error) throw error;
    } catch (error) {
      productionLogger.error('Error resolving alert', error);
      throw error;
    }
  }

  /**
   * جلب إشعارات المستخدم
   */
  static async getUserNotifications(userId: string, limit: number = 20): Promise<UserNotification[]> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return (data || []) as UserNotification[];
    } catch (error) {
      productionLogger.error('Error fetching user notifications', error);
      return [];
    }
  }

  /**
   * تحديث حالة قراءة الإشعار
   */
  static async markAsRead(notificationId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;
    } catch (error) {
      productionLogger.error('Error marking notification as read', error);
      throw error;
    }
  }

  /**
   * تحديث جميع إشعارات المستخدم كمقروءة
   */
  static async markAllAsRead(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) throw error;
    } catch (error) {
      productionLogger.error('Error marking all notifications as read', error);
      throw error;
    }
  }

  /**
   * حفظ اشتراك الإشعارات الفورية
   */
  static async savePushSubscription(data: {
    user_id: string;
    endpoint: string;
    p256dh: string;
    auth: string;
  }): Promise<{ success: boolean }> {
    try {
      const { error } = await supabase.from('push_subscriptions').upsert({
        user_id: data.user_id,
        endpoint: data.endpoint,
        p256dh: data.p256dh,
        auth: data.auth,
        is_active: true,
      });

      if (error) throw error;
      return { success: true };
    } catch (error) {
      productionLogger.error('Error saving push subscription', error);
      return { success: false };
    }
  }

  /**
   * إلغاء اشتراك الإشعارات الفورية
   */
  static async deactivatePushSubscription(userId: string): Promise<{ success: boolean }> {
    try {
      const { error } = await supabase
        .from('push_subscriptions')
        .update({ is_active: false })
        .eq('user_id', userId);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      productionLogger.error('Error deactivating push subscription', error);
      return { success: false };
    }
  }

  /**
   * إرسال إشعارات لرسائل نموذج الاتصال
   */
  static async sendContactNotifications(formData: {
    name: string;
    email: string;
    phone: string;
    subject: string;
    message: string;
  }): Promise<void> {
    try {
      // جلب المسؤولين
      const { data: adminUsers } = await supabase
        .from('user_roles')
        .select('user_id')
        .in('role', ['admin', 'nazer']);

      if (adminUsers && adminUsers.length > 0) {
        const notifications: NotificationData[] = adminUsers.map(admin => ({
          user_id: admin.user_id,
          title: `رسالة جديدة: ${formData.subject}`,
          message: `رسالة من ${formData.name}: ${formData.subject}`,
          type: 'info' as const,
          priority: 'medium' as const,
          reference_type: 'contact_message',
          action_url: '/admin/messages',
        }));

        await this.sendBulk(notifications);
      }
    } catch (error) {
      productionLogger.error('Error sending contact notifications', error);
      throw error;
    }
  }
  /**
   * إرسال إشعار جماعي لمجموعة من المستخدمين
   */
  static async sendBroadcast(params: {
    title: string;
    message: string;
    targetType: 'all' | 'role' | 'beneficiaries' | 'staff';
    targetValue?: string;
    type?: 'info' | 'success' | 'warning' | 'error';
    priority?: 'low' | 'medium' | 'high';
    actionUrl?: string;
    senderName?: string;
  }): Promise<{ success: boolean; recipientCount: number; error?: string }> {
    try {
      // 1. الحصول على المستخدمين المستهدفين
      const { data: users, error: usersError } = await supabase.rpc('get_users_by_target', {
        p_target_type: params.targetType,
        p_target_value: params.targetValue || null,
      });

      if (usersError) throw usersError;

      if (!users || users.length === 0) {
        return { success: false, recipientCount: 0, error: 'لا يوجد مستخدمين في الفئة المحددة' };
      }

      // 2. إنشاء الإشعارات لجميع المستخدمين
      const notifications: NotificationData[] = users.map((u: { user_id: string; full_name: string }) => ({
        user_id: u.user_id,
        title: params.title,
        message: params.message,
        type: params.type || 'info',
        priority: params.priority || 'medium',
        action_url: params.actionUrl,
        reference_type: 'broadcast',
      }));

      // 3. إرسال الإشعارات
      const result = await this.sendBulk(notifications);

      if (!result.success) {
        throw new Error('فشل في إرسال الإشعارات');
      }

      // 4. تسجيل الإشعار الجماعي في سجل البث
      const { data: currentUser } = await supabase.auth.getUser();
      
      await supabase.from('broadcast_notifications').insert({
        title: params.title,
        message: params.message,
        type: params.type || 'info',
        priority: params.priority || 'medium',
        target_type: params.targetType,
        target_value: params.targetValue,
        recipient_count: users.length,
        sent_by: currentUser?.user?.id,
        sent_by_name: params.senderName || 'النظام',
        action_url: params.actionUrl,
      });

      productionLogger.info(`Broadcast notification sent to ${users.length} users (${params.targetType})`);

      return { success: true, recipientCount: users.length };
    } catch (error) {
      productionLogger.error('Error sending broadcast notification', error, {
        context: 'notification_service',
      });
      return { success: false, recipientCount: 0, error: String(error) };
    }
  }

  /**
   * الحصول على عدد المستخدمين المستهدفين (للمعاينة قبل الإرسال)
   */
  static async getTargetUserCount(
    targetType: 'all' | 'role' | 'beneficiaries' | 'staff',
    targetValue?: string
  ): Promise<number> {
    try {
      const { data, error } = await supabase.rpc('count_users_by_target', {
        p_target_type: targetType,
        p_target_value: targetValue || null,
      });

      if (error) throw error;
      return data || 0;
    } catch (error) {
      productionLogger.error('Error counting target users', error);
      return 0;
    }
  }

  /**
   * جلب سجل الإشعارات الجماعية
   */
  static async getBroadcastHistory(limit: number = 20): Promise<{
    id: string;
    title: string;
    message: string;
    target_type: string;
    target_value: string | null;
    recipient_count: number;
    sent_by_name: string | null;
    created_at: string;
  }[]> {
    try {
      const { data, error } = await supabase
        .from('broadcast_notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      productionLogger.error('Error fetching broadcast history', error);
      return [];
    }
  }
}
