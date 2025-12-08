/**
 * Chatbot Service - خدمة المحادثات الآلية
 */

import { supabase } from "@/integrations/supabase/client";

export interface ChatMessage {
  id: string;
  message: string;
  message_type: 'user' | 'bot';
  created_at: string;
  quick_reply_id?: string;
}

export interface QuickReply {
  id: string;
  text: string;
  icon: string;
  prompt: string;
  category: string;
  order_index: number;
  created_at: string;
  is_active: boolean;
}

export class ChatbotService {
  /**
   * جلب المحادثات
   */
  static async getConversations(userId: string) {
    const { data, error } = await supabase
      .from("chatbot_conversations")
      .select("id, message, message_type, created_at, quick_reply_id")
      .eq("user_id", userId)
      .order("created_at", { ascending: true })
      .limit(100);

    if (error) throw error;
    return data || [];
  }

  /**
   * جلب الردود السريعة
   */
  static async getQuickReplies() {
    const { data, error } = await supabase
      .from("chatbot_quick_replies")
      .select("id, text, icon, prompt, category, order_index, created_at, is_active")
      .eq("is_active", true)
      .order("order_index");

    if (error) throw error;
    return data || [];
  }

  /**
   * إرسال رسالة
   */
  static async sendMessage(userId: string, message: string, quickReplyId?: string) {
    const { data, error } = await supabase.functions.invoke('chatbot', {
      body: { 
        message, 
        userId,
        quickReplyId 
      }
    });

    if (error) throw error;
    if (!data.success) throw new Error(data.error || 'فشل في الحصول على الرد');
    
    return data;
  }

  /**
   * مسح المحادثات
   */
  static async clearConversations(userId: string) {
    const { error } = await supabase
      .from("chatbot_conversations")
      .delete()
      .eq("user_id", userId);

    if (error) throw error;
  }
}
