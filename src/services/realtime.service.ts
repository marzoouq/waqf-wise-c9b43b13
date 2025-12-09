/**
 * Realtime Service - خدمة الاتصال الفوري
 * @version 2.7.0
 */

import { supabase } from "@/integrations/supabase/client";
import type { RealtimeChannel, RealtimePostgresChangesPayload } from "@supabase/supabase-js";

type RealtimeCallback = (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => void;

export class RealtimeService {
  private static channels: Map<string, RealtimeChannel> = new Map();

  static subscribeToTable(table: string, callback: RealtimeCallback) {
    const channelName = `${table}-${Date.now()}`;
    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', { event: '*', schema: 'public', table }, callback)
      .subscribe();
    this.channels.set(channelName, channel);
    return { channel, unsubscribe: () => this.unsubscribe(channelName) };
  }

  static subscribeToChanges(tables: string[], callback: RealtimeCallback) {
    const channelName = `multi-${Date.now()}`;
    let channel = supabase.channel(channelName);
    tables.forEach(table => {
      channel = channel.on('postgres_changes', { event: '*', schema: 'public', table }, callback);
    });
    channel.subscribe();
    this.channels.set(channelName, channel);
    return { channel, unsubscribe: () => this.unsubscribe(channelName) };
  }

  static unsubscribe(channelName: string): void {
    const channel = this.channels.get(channelName);
    if (channel) {
      supabase.removeChannel(channel);
      this.channels.delete(channelName);
    }
  }

  static unsubscribeAll(): void {
    this.channels.forEach(channel => supabase.removeChannel(channel));
    this.channels.clear();
  }

  static createChannel(name: string): RealtimeChannel {
    const channel = supabase.channel(name);
    this.channels.set(name, channel);
    return channel;
  }

  static getActiveSubscriptionsCount(): number {
    return this.channels.size;
  }
}
