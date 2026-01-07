/**
 * Realtime Manager - مدير الاتصال الفوري المركزي
 * يمنع تراكم القنوات وتكرار الاشتراكات
 * @version 1.0.0
 */

import { supabase } from "@/integrations/supabase/client";
import type { RealtimeChannel, RealtimePostgresChangesPayload } from "@supabase/supabase-js";

type ListenerCallback = (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => void;

interface ChannelInfo {
  channel: RealtimeChannel;
  listeners: Set<ListenerCallback>;
  subscribedAt: Date;
}

class RealtimeManager {
  private static instance: RealtimeManager;
  private channels: Map<string, ChannelInfo> = new Map();
  private isReconnecting = false;
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  private readonly MAX_CHANNELS = 20;
  private readonly RECONNECT_DELAY = 500;

  private constructor() {
    // Singleton
  }

  static getInstance(): RealtimeManager {
    if (!this.instance) {
      this.instance = new RealtimeManager();
    }
    return this.instance;
  }

  /**
   * الاشتراك في تغييرات جدول معين
   */
  subscribe(table: string, callback: ListenerCallback): () => void {
    // Connection Throttling - منع إعادة الاتصال السريع
    if (this.isReconnecting) {
      if (import.meta.env.DEV) {
        console.log(`[RealtimeManager] Throttling connection to ${table}`);
      }
      // إضافة للانتظار
      setTimeout(() => this.subscribe(table, callback), this.RECONNECT_DELAY);
      return () => {};
    }

    const channelName = `unified-${table}`;

    // التحقق من الحد الأقصى للقنوات
    if (this.channels.size >= this.MAX_CHANNELS && !this.channels.has(channelName)) {
      console.warn(`[RealtimeManager] Max channels (${this.MAX_CHANNELS}) reached. Cleaning up oldest.`);
      this.cleanupOldestChannel();
    }

    // إنشاء قناة جديدة إذا لم تكن موجودة
    if (!this.channels.has(channelName)) {
      this.createChannel(table, channelName);
    }

    // إضافة المستمع
    const channelInfo = this.channels.get(channelName)!;
    channelInfo.listeners.add(callback);

    if (import.meta.env.DEV) {
      console.log(`[RealtimeManager] Added listener to ${table}. Total listeners: ${channelInfo.listeners.size}`);
    }

    // إرجاع دالة إلغاء الاشتراك
    return () => this.unsubscribe(table, callback);
  }

  /**
   * الاشتراك في عدة جداول دفعة واحدة
   */
  subscribeToMultiple(tables: string[], callback: ListenerCallback): () => void {
    const unsubscribers = tables.map(table => this.subscribe(table, callback));
    return () => unsubscribers.forEach(unsub => unsub());
  }

  /**
   * إنشاء قناة جديدة لجدول
   */
  private createChannel(table: string, channelName: string): void {
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table },
        (payload) => {
          // توزيع الحدث لجميع المستمعين
          const channelInfo = this.channels.get(channelName);
          if (channelInfo) {
            channelInfo.listeners.forEach(cb => {
              try {
                cb(payload);
              } catch (error) {
                console.error(`[RealtimeManager] Listener error for ${table}:`, error);
              }
            });
          }
        }
      )
      .subscribe((status) => {
        if (import.meta.env.DEV) {
          console.log(`[RealtimeManager] Channel ${channelName} status: ${status}`);
        }
      });

    this.channels.set(channelName, {
      channel,
      listeners: new Set(),
      subscribedAt: new Date(),
    });

    if (import.meta.env.DEV) {
      console.log(`[RealtimeManager] Created channel for ${table}. Total channels: ${this.channels.size}`);
    }
  }

  /**
   * إلغاء اشتراك مستمع معين
   */
  private unsubscribe(table: string, callback: ListenerCallback): void {
    const channelName = `unified-${table}`;
    const channelInfo = this.channels.get(channelName);

    if (!channelInfo) return;

    channelInfo.listeners.delete(callback);

    if (import.meta.env.DEV) {
      console.log(`[RealtimeManager] Removed listener from ${table}. Remaining: ${channelInfo.listeners.size}`);
    }

    // إذا لم يتبق مستمعين، إزالة القناة
    if (channelInfo.listeners.size === 0) {
      this.removeChannel(channelName);
    }
  }

  /**
   * إزالة قناة
   */
  private removeChannel(channelName: string): void {
    const channelInfo = this.channels.get(channelName);
    if (channelInfo) {
      supabase.removeChannel(channelInfo.channel);
      this.channels.delete(channelName);
      
      if (import.meta.env.DEV) {
        console.log(`[RealtimeManager] Removed channel ${channelName}. Remaining: ${this.channels.size}`);
      }
    }
  }

  /**
   * تنظيف أقدم قناة
   */
  private cleanupOldestChannel(): void {
    let oldestChannel: string | null = null;
    let oldestTime = new Date();

    this.channels.forEach((info, name) => {
      if (info.subscribedAt < oldestTime) {
        oldestTime = info.subscribedAt;
        oldestChannel = name;
      }
    });

    if (oldestChannel) {
      this.removeChannel(oldestChannel);
    }
  }

  /**
   * إزالة جميع القنوات
   */
  removeAllChannels(): void {
    this.channels.forEach((info) => {
      supabase.removeChannel(info.channel);
    });
    this.channels.clear();
    
    if (import.meta.env.DEV) {
      console.log('[RealtimeManager] Removed all channels');
    }
  }

  /**
   * الحصول على عدد القنوات النشطة
   */
  getActiveChannelsCount(): number {
    return this.channels.size;
  }

  /**
   * الحصول على إجمالي عدد المستمعين
   */
  getTotalListenersCount(): number {
    let count = 0;
    this.channels.forEach(info => {
      count += info.listeners.size;
    });
    return count;
  }

  /**
   * الحصول على معلومات التشخيص
   */
  getDiagnostics(): { channels: number; listeners: number; tables: string[] } {
    const tables: string[] = [];
    this.channels.forEach((_, name) => {
      tables.push(name.replace('unified-', ''));
    });
    
    return {
      channels: this.channels.size,
      listeners: this.getTotalListenersCount(),
      tables,
    };
  }
}

export const realtimeManager = RealtimeManager.getInstance();
