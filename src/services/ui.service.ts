/**
 * UI Service - خدمة واجهة المستخدم
 * @version 2.8.25
 */

import { supabase } from "@/integrations/supabase/client";
import type { Json } from '@/integrations/supabase/types';

export interface Activity {
  id: string;
  action: string;
  user_name: string;
  timestamp: string;
  created_at: string;
}

export interface Task {
  id: string;
  task: string;
  priority: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface SavedSearch {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  search_criteria: Json;
  is_favorite: boolean;
  usage_count: number;
  last_used_at?: string;
  created_at: string;
  updated_at: string;
}

export class UIService {
  /**
   * جلب الأنشطة الأخيرة
   */
  static async getActivities(limit: number = 10): Promise<Activity[]> {
    const { data, error } = await supabase
      .from("recent_activities")
      .select("id, action, user_name, timestamp, created_at")
      .order("timestamp", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data as Activity[];
  }

  /**
   * إضافة نشاط
   */
  static async addActivity(activity: Omit<Activity, "id" | "created_at" | "timestamp">): Promise<Activity> {
    const { data, error } = await supabase
      .from("activities")
      .insert([activity])
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('فشل إضافة النشاط');
    return data;
  }

  /**
   * جلب المهام
   */
  static async getTasks(limit: number = 10): Promise<Task[]> {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data as Task[];
  }

  /**
   * إضافة مهمة
   */
  static async addTask(task: Omit<Task, "id" | "created_at" | "updated_at">): Promise<Task> {
    const { data, error } = await supabase
      .from("tasks")
      .insert([task])
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('فشل إضافة المهمة');
    return data;
  }

  /**
   * تحديث مهمة
   */
  static async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    const { data, error } = await supabase
      .from("tasks")
      .update(updates)
      .eq("id", id)
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('المهمة غير موجودة');
    return data;
  }

  /**
   * جلب عمليات البحث المحفوظة
   */
  static async getSavedSearches(): Promise<SavedSearch[]> {
    const { data, error } = await supabase
      .from("saved_searches")
      .select("*")
      .order("is_favorite", { ascending: false })
      .order("last_used_at", { ascending: false });

    if (error) throw error;
    return data as SavedSearch[];
  }

  /**
   * حفظ بحث
   */
  static async saveSearch(search: Omit<SavedSearch, "id" | "user_id" | "created_at" | "updated_at" | "usage_count">): Promise<SavedSearch> {
    const { data: userData } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from("saved_searches")
      .insert([{
        ...search,
        user_id: userData?.user?.id,
      }])
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('فشل حفظ البحث');
    return data;
  }

  /**
   * حذف بحث محفوظ
   */
  static async deleteSearch(id: string): Promise<void> {
    const { error } = await supabase
      .from("saved_searches")
      .delete()
      .eq("id", id);

    if (error) throw error;
  }

  /**
   * تحديث استخدام البحث
   */
  static async updateSearchUsage(id: string): Promise<void> {
    const { data: search } = await supabase
      .from("saved_searches")
      .select("usage_count")
      .eq("id", id)
      .maybeSingle();
    
    const { error } = await supabase
      .from("saved_searches")
      .update({ 
        usage_count: (search?.usage_count || 0) + 1,
        last_used_at: new Date().toISOString()
      })
      .eq("id", id);
      
    if (error) throw error;
  }
}
