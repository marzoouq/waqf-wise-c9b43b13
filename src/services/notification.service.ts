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
      .single();

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
      .single();

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
  static async getSystemAlerts(limit: number = 10): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('system_alerts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
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
          is_resolved: true,
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
  static async getUserNotifications(userId: string, limit: number = 20): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
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
}
