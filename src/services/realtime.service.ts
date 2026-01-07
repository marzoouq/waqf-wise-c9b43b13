/**
 * Realtime Service - خدمة الاتصال الفوري
 * @version 3.0.0 - تم إصلاح مشكلة تراكم القنوات
 */

import { supabase } from "@/integrations/supabase/client";
import type { RealtimeChannel, RealtimePostgresChangesPayload } from "@supabase/supabase-js";

type RealtimeCallback = (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => void;

const MAX_CHANNELS = 20;

export class RealtimeService {
  private static channels: Map<string, RealtimeChannel> = new Map();
  private static channelCallbacks: Map<string, Set<RealtimeCallback>> = new Map();

  /**
   * الاشتراك في جدول - يعيد استخدام القناة الموجودة
   */
  static subscribeToTable(table: string, callback: RealtimeCallback) {
    const channelName = `realtime-${table}`;
    
    // إذا كانت القناة موجودة، نضيف الـ callback فقط
    if (this.channels.has(channelName)) {
      if (import.meta.env.DEV) {
        console.log(`[RealtimeService] Reusing channel: ${channelName}`);
      }
      this.channelCallbacks.get(channelName)?.add(callback);
      return { 
        channel: this.channels.get(channelName)!, 
        unsubscribe: () => this.removeCallback(channelName, callback)
      };
    }

    // التحقق من الحد الأقصى
    if (this.channels.size >= MAX_CHANNELS) {
      console.warn(`[RealtimeService] Max channels (${MAX_CHANNELS}) reached. Cleaning up all.`);
      this.unsubscribeAll();
    }

    // إنشاء قناة جديدة
    const callbacks = new Set<RealtimeCallback>([callback]);
    this.channelCallbacks.set(channelName, callbacks);

    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', { event: '*', schema: 'public', table }, (payload) => {
        // توزيع الحدث لجميع الـ callbacks
        this.channelCallbacks.get(channelName)?.forEach(cb => {
          try { cb(payload); } 
          catch (e) { console.error(`[RealtimeService] Callback error:`, e); }
        });
      })
      .subscribe();

    this.channels.set(channelName, channel);

    if (import.meta.env.DEV) {
      console.log(`[RealtimeService] Created channel: ${channelName}. Total: ${this.channels.size}`);
    }

    return { channel, unsubscribe: () => this.removeCallback(channelName, callback) };
  }

  /**
   * الاشتراك في عدة جداول - يستخدم قناة واحدة مشتركة
   */
  static subscribeToChanges(tables: string[], callback: RealtimeCallback) {
    const channelName = `multi-${tables.sort().join('-')}`;
    
    // إذا كانت القناة موجودة
    if (this.channels.has(channelName)) {
      this.channelCallbacks.get(channelName)?.add(callback);
      return { 
        channel: this.channels.get(channelName)!, 
        unsubscribe: () => this.removeCallback(channelName, callback)
      };
    }

    // إنشاء قناة جديدة
    const callbacks = new Set<RealtimeCallback>([callback]);
    this.channelCallbacks.set(channelName, callbacks);

    let channel = supabase.channel(channelName);
    tables.forEach(table => {
      channel = channel.on('postgres_changes', { event: '*', schema: 'public', table }, (payload) => {
        this.channelCallbacks.get(channelName)?.forEach(cb => {
          try { cb(payload); } 
          catch (e) { console.error(`[RealtimeService] Multi-callback error:`, e); }
        });
      });
    });
    channel.subscribe();

    this.channels.set(channelName, channel);
    return { channel, unsubscribe: () => this.removeCallback(channelName, callback) };
  }

  /**
   * إزالة callback من قناة (وإزالة القناة إذا لم يتبق callbacks)
   */
  private static removeCallback(channelName: string, callback: RealtimeCallback): void {
    const callbacks = this.channelCallbacks.get(channelName);
    if (callbacks) {
      callbacks.delete(callback);
      
      // إذا لم يتبق callbacks، نزيل القناة
      if (callbacks.size === 0) {
        this.unsubscribe(channelName);
      }
    }
  }

  static unsubscribe(channelName: string): void {
    const channel = this.channels.get(channelName);
    if (channel) {
      supabase.removeChannel(channel);
      this.channels.delete(channelName);
      this.channelCallbacks.delete(channelName);
      
      if (import.meta.env.DEV) {
        console.log(`[RealtimeService] Removed channel: ${channelName}. Remaining: ${this.channels.size}`);
      }
    }
  }

  static unsubscribeAll(): void {
    this.channels.forEach(channel => supabase.removeChannel(channel));
    this.channels.clear();
    this.channelCallbacks.clear();
    
    if (import.meta.env.DEV) {
      console.log('[RealtimeService] Removed all channels');
    }
  }

  static createChannel(name: string): RealtimeChannel {
    // إعادة استخدام القناة الموجودة
    if (this.channels.has(name)) {
      return this.channels.get(name)!;
    }
    
    const channel = supabase.channel(name);
    this.channels.set(name, channel);
    return channel;
  }

  static getActiveSubscriptionsCount(): number {
    return this.channels.size;
  }

  static getChannelInfo(): { name: string; callbacks: number }[] {
    const info: { name: string; callbacks: number }[] = [];
    this.channels.forEach((_, name) => {
      info.push({
        name,
        callbacks: this.channelCallbacks.get(name)?.size || 0
      });
    });
    return info;
  }
}
