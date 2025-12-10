/**
 * Message Service - خدمة الرسائل الداخلية
 * @version 2.8.65
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

export interface Recipient {
  id: string;
  name: string;
  role: string;
  roleKey: string;
}

type RoleType = "accountant" | "admin" | "archivist" | "beneficiary" | "cashier" | "nazer" | "user" | "waqf_heir";

const ROLE_TRANSLATIONS: Record<string, string> = {
  'admin': 'مشرف',
  'nazer': 'ناظر',
  'accountant': 'محاسب',
  'cashier': 'صراف',
  'beneficiary': 'مستفيد',
  'archivist': 'أرشيفي',
  'waqf_heir': 'وارث'
};

const ROLE_ORDER: Record<string, number> = {
  'nazer': 1,
  'admin': 2,
  'accountant': 3,
  'cashier': 4,
  'archivist': 5,
  'beneficiary': 6,
  'waqf_heir': 7
};

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

  /**
   * جلب قائمة المستلمين المتاحين للمراسلة
   */
  static async getRecipients(userId: string): Promise<Recipient[]> {
    // جلب دور المستخدم الحالي
    const { data: currentUserRole, error: currentRoleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .maybeSingle();

    if (currentRoleError) throw currentRoleError;

    // تحديد الأدوار المتاحة للمراسلة
    let allowedRoles: RoleType[];
    
    if (currentUserRole?.role === 'beneficiary' || currentUserRole?.role === 'waqf_heir') {
      allowedRoles = ['admin', 'nazer'];
    } else {
      allowedRoles = ['admin', 'nazer', 'accountant', 'cashier', 'beneficiary', 'waqf_heir', 'archivist'];
    }
    
    const { data: userRoles, error: rolesError } = await supabase
      .from('user_roles')
      .select('user_id, role')
      .in('role', allowedRoles)
      .neq('user_id', userId);

    if (rolesError) throw rolesError;

    if (!userRoles || userRoles.length === 0) {
      return [];
    }

    const userIds = userRoles.map(ur => ur.user_id);
    
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('user_id, full_name')
      .in('user_id', userIds);

    if (profilesError) throw profilesError;

    const recipientsList = (profiles || []).map(profile => {
      const userRole = userRoles.find(ur => ur.user_id === profile.user_id);
      const roleName = userRole?.role || 'user';
      return {
        id: profile.user_id,
        name: profile.full_name || 'مستخدم',
        role: ROLE_TRANSLATIONS[roleName] || roleName,
        roleKey: roleName
      };
    })
    .sort((a, b) => {
      const roleCompare = (ROLE_ORDER[a.roleKey] || 999) - (ROLE_ORDER[b.roleKey] || 999);
      if (roleCompare !== 0) return roleCompare;
      return a.name.localeCompare(b.name, 'ar');
    });

    return recipientsList;
  }

  /**
   * جلب رسائل الطلب
   */
  static async getByRequestId(requestId: string): Promise<InternalMessageRow[]> {
    try {
      const { data, error } = await supabase
        .from('internal_messages')
        .select('*')
        .eq('request_id', requestId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      productionLogger.error('Error fetching request messages', error);
      throw error;
    }
  }
}
