/**
 * Message Service - خدمة الرسائل الداخلية
 */

import { supabase } from '@/integrations/supabase/client';
import { productionLogger } from '@/lib/logger/production-logger';
import type { Database } from '@/integrations/supabase/types';

type InternalMessageRow = Database['public']['Tables']['internal_messages']['Row'];
type InternalMessageInsert = Database['public']['Tables']['internal_messages']['Insert'];

export class MessageService {
  /**
   * جلب الرسائل الواردة
   */
  static async getInboxMessages(userId: string): Promise<InternalMessageRow[]> {
    try {
      const { data, error } = await supabase
        .from('internal_messages')
        .select(`
          *,
          sender:profiles!internal_messages_sender_id_fkey(full_name, user_id)
        `)
        .eq('receiver_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      productionLogger.error('Error fetching inbox messages', error);
      throw error;
    }
  }

  /**
   * جلب الرسائل المرسلة
   */
  static async getSentMessages(userId: string): Promise<InternalMessageRow[]> {
    try {
      const { data, error } = await supabase
        .from('internal_messages')
        .select(`
          *,
          receiver:profiles!internal_messages_receiver_id_fkey(full_name, user_id)
        `)
        .eq('sender_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      productionLogger.error('Error fetching sent messages', error);
      throw error;
    }
  }

  /**
   * إرسال رسالة
   */
  static async sendMessage(message: InternalMessageInsert): Promise<InternalMessageRow> {
    try {
      const { data, error } = await supabase
        .from('internal_messages')
        .insert([message])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      productionLogger.error('Error sending message', error);
      throw error;
    }
  }

  /**
   * تعليم رسالة كمقروءة
   */
  static async markAsRead(messageId: string): Promise<InternalMessageRow> {
    try {
      const { data, error } = await supabase
        .from('internal_messages')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('id', messageId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      productionLogger.error('Error marking message as read', error);
      throw error;
    }
  }

  /**
   * حذف رسالة
   */
  static async deleteMessage(messageId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('internal_messages')
        .delete()
        .eq('id', messageId);

      if (error) throw error;
    } catch (error) {
      productionLogger.error('Error deleting message', error);
      throw error;
    }
  }

  /**
   * عدد الرسائل غير المقروءة
   */
  static async getUnreadCount(userId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('internal_messages')
        .select('id', { count: 'exact', head: true })
        .eq('receiver_id', userId)
        .eq('is_read', false);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      productionLogger.error('Error getting unread count', error);
      throw error;
    }
  }
}
