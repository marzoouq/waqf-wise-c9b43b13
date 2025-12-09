/**
 * Message Service - خدمة الرسائل الداخلية
 * @version 2.8.24
 */

import { supabase } from '@/integrations/supabase/client';
import { productionLogger } from '@/lib/logger/production-logger';
import type { Database } from '@/integrations/supabase/types';

type InternalMessageRow = Database['public']['Tables']['internal_messages']['Row'];
type InternalMessageInsert = Database['public']['Tables']['internal_messages']['Insert'];

export interface MessageWithUsers {
  id: string;
  sender_id: string;
  receiver_id: string;
  subject: string;
  body: string;
  is_read: boolean;
  read_at: string | null;
  priority?: string;
  created_at: string;
  sender_name?: string;
  receiver_name?: string;
}

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
   * جلب جميع رسائل المستخدم (واردة ومرسلة)
   */
  static async getAllMessages(userId: string): Promise<MessageWithUsers[]> {
    try {
      const { data, error } = await supabase
        .from('messages_with_users')
        .select('id, sender_id, receiver_id, subject, body, is_read, read_at, priority, created_at, sender_name, receiver_name')
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as MessageWithUsers[];
    } catch (error) {
      productionLogger.error('Error fetching all messages', error);
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
   * إرسال رسائل متعددة
   */
  static async sendBulkMessages(messages: InternalMessageInsert[]): Promise<void> {
    try {
      const { error } = await supabase
        .from('internal_messages')
        .insert(messages);

      if (error) throw error;
    } catch (error) {
      productionLogger.error('Error sending bulk messages', error);
      throw error;
    }
  }

  /**
   * تعليم رسالة كمقروءة
   */
  static async markAsRead(messageId: string, userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('internal_messages')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('id', messageId)
        .eq('receiver_id', userId);

      if (error) throw error;
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
